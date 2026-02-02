# 🚀 CARVFi Lottery Deployment Guide

This project has been upgraded to a **Production-Ready Lottery Protocol** on the BASE network.
Follow these steps to deploy and launch the system.

## 1. Prerequisites
*   Node.js & NPM
*   A text editor (VS Code)
*   An Ethereum Wallet (e.g., Metamask) with **Base Sepolia (Testnet)** or **Base Mainnet** funds.
    *   You need ETH for gas.
    *   You need Subscription ID for Chainlink VRF.

## 2. Environment Setup
1.  Open `.env.local` (or create it) and add:
    ```
    PRIVATE_KEY=your_wallet_private_key_here
    NEXT_PUBLIC_WALLET_CONNECT_ID=your_id
    ```
    *(Note: Never share your private key)*

## 3. Compile Contracts
Run the following command to verify the Smart Contracts:
```bash
npx hardhat compile
```

## 4. Deploy Contracts
We recommend using **Remix IDE** for the easiest deployment experience if you are not familiar with Hardhat scripts.
1.  Go to [Remix.ethereum.org](https://remix.ethereum.org).
2.  Copy the contents of `contracts/GemToken.sol` and `contracts/LotteryController.sol`.
3.  Compile `GemToken.sol`.
4.  Deploy `GemToken` first.
5.  Compile `LotteryController.sol`.
6.  Deploy `LotteryController` with the following constructor arguments:
    *   `_gemToken`: Address of the GemToken you just deployed.
    *   `_usdcToken`: Address of USDC on Base (0x... check BaseScan).
    *   `_vrfCoordinator`: Address of Chainlink VRF Coordinator on Base.
    *   `_keyHash`: The gas lane key hash for Chainlink.
    *   `_subscriptionId`: Your VRF subscription ID.
7.  **Important**: Go back to `GemToken` and call `setController` with the address of your new `LotteryController`. This authorizes the lottery to mint/burn tokens.

## 5. Update Frontend
1.  Copy the address of your deployed `LotteryController`.
2.  Open `components/Lottery.tsx`.
3.  Update `const LOTTERY_CONTRACT = "0x..."` with your real address.
4.  Run the app:
    ```bash
    npm run dev
    ```

## 6. Verify on Vercel
1.  Run `npx vercel --prod` to deploy the frontend.
2.  Your Lottery is now live!
