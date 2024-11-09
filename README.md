# Payroll Management Smart Contract

This project implements a Payroll smart contract using Solidity and integrates with Gelato Network for automated funding. It leverages ERC-2771 for meta-transactions, allowing for gasless transactions for employees.

## Features

* **Automated Funding:** Integrates with Gelato Network to automatically top up the contract balance when it falls below a defined threshold.
* **Meta-Transactions (ERC-2771):** Enables gasless transactions for employees receiving payments.
* **Secure Fund Management:** Only the contract owner can withdraw funds or process payments.
* **Transparency:** All transactions are recorded on the blockchain, providing a transparent and auditable payroll system.
* **Extensible:** Built with modularity in mind, making it easy to add new features and functionalities.

## Contract Details

The `Payroll.sol` contract provides the following functionality:

* `fundContract()`: Allows anyone to fund the contract.
* `withdrawFunds()`: Allows the owner to withdraw all funds from the contract.
* `processPayment(address _address, uint256 _amount)`: Allows the owner to process payments to employees.
* `getTotalFunds()`: Returns the total funds available in the contract.
* `owner()`: Returns the address of the contract owner.

## Gelato Automation

The `index.ts` file contains a Web3 Function that monitors the contract balance and automatically tops it up using Gelato's relay service when the balance falls below a specified threshold.  The automation script fetches the current ETH price from CoinGecko to calculate the top-up amount in ETH.

The `sponsor.ts` script provides a utility function to sponsor a transaction to fund the contract using the Gelato Relay SDK.  This is helpful for testing and manually triggering the funding process.

## Getting Started

### Prerequisites

* Node.js and npm (or yarn)
* An Ethereum wallet and sufficient ETH for deployment and transactions
* A Gelato Relay API key
* A .env file with the following environment variables:
  * `PRIVATE_KEY`: Your private key
  * `RPC_URL`: Your Ethereum RPC URL
  * `TRUSTED_FORWARDER`: The address of the trusted forwarder contract for meta-transactions.

### Installation

1. Clone the repository: `git clone https://github.com/your-username/your-repo-name.git`
2. Install dependencies: `npm install` or `yarn install`
3. Compile the contracts: `npx hardhat compile`

### Deployment

1. Configure your `.env` file with the required environment variables.
2. Deploy the contract using: `npx hardhat run scripts/deploy.ts`
3. Note down the deployed contract address.

### Usage

1. **Funding the Contract:** You can fund the contract directly using the `fundContract()` function or by triggering the Gelato automation.  Use `npx hardhat run scripts/sponsor.ts` to sponsor a top up transaction.
2. **Processing Payments:**  Use the `processPayment()` function to send payments to employees.

## Testing

Tests are located in the `test` directory. Run tests using:  `npx hardhat test`