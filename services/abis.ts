export const LOTTERY_ABI = [
    {
        "inputs": [{ "internalType": "uint256", "name": "usdcAmount", "type": "uint256" }],
        "name": "buyGems",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "count", "type": "uint256" }],
        "name": "buyTickets",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "dailyPoolSize",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "weeklyJackpotPool",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
        "name": "userStats",
        "outputs": [
            { "internalType": "uint256", "name": "tickets", "type": "uint256" },
            { "internalType": "uint256", "name": "lastTicketDayId", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    }
] as const;
