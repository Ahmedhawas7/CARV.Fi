// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import "./GemToken.sol";

contract LotteryController is AccessControl, ReentrancyGuard, Pausable, VRFConsumerBaseV2, AutomationCompatibleInterface {
    using SafeERC20 for IERC20;

    // --- Roles ---
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    // --- State Variables ---
    GemToken public immutable gemToken;
    IERC20 public immutable usdcToken;
    VRFCoordinatorV2Interface public immutable vrfCoordinator;

    // VRF Configuration
    bytes32 public keyHash;
    uint64 public subscriptionId;
    uint32 public callbackGasLimit = 500000;
    uint16 public requestConfirmations = 3;
    uint32 public constant NUM_WORDS_DAILY = 5; // 5 Winners
    uint32 public constant NUM_WORDS_WEEKLY = 1; // 1 Winner

    // Pricing & Limits
    uint256 public constant GEMS_PER_USDC = 1000;
    uint256 public constant TICKET_PRICE_GEMS = 1000 * 10**18; // 1000 GEMs
    uint256 public constant DAILY_TICKET_LIMIT = 10;
    
    // Distribution
    uint256 public constant DAILY_WINNER_SHARE_BPS = 6000; // 60%
    uint256 public constant WEEKLY_RESERVE_SHARE_BPS = 3000; // 30%
    uint256 public constant PLATFORM_FEE_BPS = 1000; // 10%
    
    uint256 public constant WEEKLY_WINNER_SHARE_BPS = 9000; // 90%
    uint256 public constant WEEKLY_ROLLOVER_BPS = 1000; // 10%

    // Pools & Tracking
    uint256 public weeklyJackpotPool; // USDC
    uint256 public platformTreasury; // USDC
    
    // Automation State
    uint256 public lastDailyDrawTime;
    uint256 public lastWeeklyDrawTime;
    uint256 public constant DAILY_INTERVAL = 1 days;
    uint256 public constant WEEKLY_INTERVAL = 7 days;

    struct UserDailyStats {
        uint256 tickets;
        uint256 lastTicketDayId;
    }
    
    // Day ID -> User Address -> Stats
    mapping(address => UserDailyStats) public userStats;
    
    // Day ID -> Participants
    mapping(uint256 => address[]) public dailyParticipants;
    mapping(uint256 => uint256) public dailyPoolSize; // USDC value
    mapping(uint256 => bool) public dailyDrawExecuted;
    
    mapping(uint256 => address[]) public weeklyParticipants; 
    mapping(uint256 => bool) public weeklyDrawExecuted;

    // Request Handling
    mapping(uint256 => bool) public s_requests; 
    mapping(uint256 => uint256) public s_requestType; // 1=Daily, 2=Weekly
    mapping(uint256 => uint256) public s_requestPeriodId; 

    // Leaderboards
    mapping(address => uint256) public totalTicketsPurchased;

    // Events
    event GemsPurchased(address indexed user, uint256 usdcAmount, uint256 gemsMinted);
    event TicketPurchased(address indexed user, uint256 dayId, uint256 count);
    event DailyDrawRequested(uint256 requestId, uint256 dayId);
    event WeeklyDrawRequested(uint256 requestId, uint256 weekId);
    event DailyWinnersSelected(uint256 dayId, address[] winners, uint256 amountPerWinner);
    event WeeklyWinnerSelected(uint256 weekId, address winner, uint256 amount);
    event PlatformFeeCollected(uint256 amount);

    constructor(
        address _gemToken,
        address _usdcToken,
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint64 _subscriptionId
    ) VRFConsumerBaseV2(_vrfCoordinator) {
        gemToken = GemToken(_gemToken);
        usdcToken = IERC20(_usdcToken);
        vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
        keyHash = _keyHash;
        subscriptionId = _subscriptionId;
        
        lastDailyDrawTime = block.timestamp;
        lastWeeklyDrawTime = block.timestamp;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }

    // --- Core User Actions ---

    function buyGems(uint256 usdcAmount) external nonReentrant whenNotPaused {
        require(usdcAmount > 0, "Amount must be > 0");
        usdcToken.safeTransferFrom(msg.sender, address(this), usdcAmount);
        
        uint256 gemsToMint = usdcAmount * GEMS_PER_USDC * 1e12; // Adjust 6->18
        gemToken.mint(msg.sender, gemsToMint);
        
        emit GemsPurchased(msg.sender, usdcAmount, gemsToMint);
    }

    function buyTickets(uint256 count) external nonReentrant whenNotPaused {
        require(count > 0, "Count must be > 0");
        uint256 dayId = getDayId();
        
        UserDailyStats storage stats = userStats[msg.sender];
        
        if (stats.lastTicketDayId != dayId) {
            stats.lastTicketDayId = dayId;
            stats.tickets = 0;
        }
        
        require(stats.tickets + count <= DAILY_TICKET_LIMIT, "Daily limit exceeded");
        
        uint256 totalGemCost = count * TICKET_PRICE_GEMS;
        gemToken.burn(msg.sender, totalGemCost);
        
        for(uint256 i=0; i<count; i++) {
            dailyParticipants[dayId].push(msg.sender);
        }
        
        uint256 weekId = getWeekId();
        for(uint256 i=0; i<count; i++) {
            weeklyParticipants[weekId].push(msg.sender);
        }

        stats.tickets += count;
        totalTicketsPurchased[msg.sender] += count;
        
        uint256 usdcValueAdded = count * 1e6; // 1 USDC value
        dailyPoolSize[dayId] += usdcValueAdded;
        
        emit TicketPurchased(msg.sender, dayId, count);
    }

    // --- Automation (Keepers) Logic ---

    function checkUpkeep(bytes calldata /* checkData */) external view override returns (bool upkeepNeeded, bytes memory performData) {
        // Check Daily
        uint256 dayId = getDayId();
        // If current day's draw is NOT done AND 24h passed since last draw (or just check if it's a new day and we have participants for the 'previous' day)
        // Simplification: We draw for the PREVIOUS day if not executed
        uint256 prevDayId = dayId - 1;
        bool dailyPending = !dailyDrawExecuted[prevDayId] && dailyParticipants[prevDayId].length > 0;
        
        // Check Weekly
        uint256 weekId = getWeekId();
        uint256 prevWeekId = weekId - 1;
        bool weeklyPending = !weeklyDrawExecuted[prevWeekId] && weeklyParticipants[prevWeekId].length > 0;
        
        upkeepNeeded = dailyPending || weeklyPending;
        
        if (dailyPending) {
            performData = abi.encode(1, prevDayId);
        } else if (weeklyPending) {
            performData = abi.encode(2, prevWeekId);
        }
    }

    function performUpkeep(bytes calldata performData) external override {
        (uint256 typeId, uint256 periodId) = abi.decode(performData, (uint256, uint256));
        
        if (typeId == 1) {
            _executeDailyDraw(periodId);
        } else if (typeId == 2) {
            _executeWeeklyDraw(periodId);
        }
    }

    // --- Internal Execution ---

    function _executeDailyDraw(uint256 dayId) internal {
        require(!dailyDrawExecuted[dayId], "Already executed");
        require(dailyParticipants[dayId].length > 0, "No participants");
        
        uint256 requestId = vrfCoordinator.requestRandomWords(
            keyHash,
            subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            NUM_WORDS_DAILY
        );
        
        s_requests[requestId] = true;
        s_requestType[requestId] = 1;
        s_requestPeriodId[requestId] = dayId;
        
        emit DailyDrawRequested(requestId, dayId);
    }

    function _executeWeeklyDraw(uint256 weekId) internal {
        require(!weeklyDrawExecuted[weekId], "Already executed");
        require(weeklyParticipants[weekId].length > 0, "No participants");

        uint256 requestId = vrfCoordinator.requestRandomWords(
            keyHash,
            subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            NUM_WORDS_WEEKLY
        );

        s_requests[requestId] = true;
        s_requestType[requestId] = 2;
        s_requestPeriodId[requestId] = weekId;

        emit WeeklyDrawRequested(requestId, weekId);
    }

    // --- VRF Callback ---

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        require(s_requests[requestId], "Invalid Request");
        uint256 typeId = s_requestType[requestId];
        uint256 periodId = s_requestPeriodId[requestId];
        
        if (typeId == 1) {
            _finalizeDailyDraw(periodId, randomWords);
        } else if (typeId == 2) {
            _finalizeWeeklyDraw(periodId, randomWords);
        }
    }

    function _finalizeDailyDraw(uint256 dayId, uint256[] memory randomWords) internal {
        dailyDrawExecuted[dayId] = true;
        
        uint256 totalPool = dailyPoolSize[dayId];
        address[] memory participants = dailyParticipants[dayId];
        
        if (totalPool == 0 || participants.length == 0) return;

        uint256 platformFee = (totalPool * PLATFORM_FEE_BPS) / 10000;
        uint256 weeklyReserve = (totalPool * WEEKLY_RESERVE_SHARE_BPS) / 10000;
        uint256 winnersPool = (totalPool * DAILY_WINNER_SHARE_BPS) / 10000;

        platformTreasury += platformFee;
        weeklyJackpotPool += weeklyReserve;
        emit PlatformFeeCollected(platformFee);

        uint256 winnerCount = 5;
        if (participants.length < 5) winnerCount = participants.length;
        
        uint256 prizePerWinner = winnersPool / winnerCount;
        address[] memory winners = new address[](winnerCount);

        for (uint256 i = 0; i < winnerCount; i++) {
            uint256 winnerIndex = randomWords[i] % participants.length;
            address winner = participants[winnerIndex];
            winners[i] = winner;
            usdcToken.safeTransfer(winner, prizePerWinner);
        }
        
        emit DailyWinnersSelected(dayId, winners, prizePerWinner);
    }

    function _finalizeWeeklyDraw(uint256 weekId, uint256[] memory randomWords) internal {
        weeklyDrawExecuted[weekId] = true;
        
        address[] memory participants = weeklyParticipants[weekId];
        if (participants.length == 0) return;

        uint256 jackpot = weeklyJackpotPool;
        uint256 winnerPrize = (jackpot * WEEKLY_WINNER_SHARE_BPS) / 10000;
        uint256 rollover = jackpot - winnerPrize;

        uint256 winnerIndex = randomWords[0] % participants.length;
        address winner = participants[winnerIndex];

        weeklyJackpotPool = rollover;
        usdcToken.safeTransfer(winner, winnerPrize);
        
        emit WeeklyWinnerSelected(weekId, winner, winnerPrize);
    }

    function getDayId() public view returns (uint256) {
        return block.timestamp / 1 days;
    }
    
    function getWeekId() public view returns (uint256) {
        return block.timestamp / 1 weeks;
    }
}
