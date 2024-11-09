import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { Payroll__factory } from "../typechain-types";

dotenv.config();

/**
 * The main function deploys the Payroll contract using the provided environment variables.
 * It requires the following environment variables to be set:
 * - `PRIVATE_KEY`: The private key of the deployer's wallet.
 * - `RPC_URL`: The URL of the Ethereum JSON-RPC provider.
 * - `TRUSTED_FORWARDER`: The address of the trusted forwarder contract.
 *
 * The function performs the following steps:
 * 1. Checks if the required environment variables are set, and throws an error if any are missing.
 * 2. Creates an ethers provider using the RPC URL.
 * 3. Creates a wallet instance using the private key and provider.
 * 4. Deploys the Payroll contract using the wallet and trusted forwarder address.
 * 5. Waits for the deployment to be mined.
 * 6. Logs the deployed contract address.
 *
 * Optionally, the function includes commented-out code to fund the deployed contract with a specified amount of ETH.
 *
 * @throws {Error} If any of the required environment variables are not set.
 */
async function main() {
  if (
    !process.env.PRIVATE_KEY ||
    !process.env.RPC_URL ||
    !process.env.TRUSTED_FORWARDER
  ) {
    throw new Error(
      "Please set your PRIVATE_KEY, RPC_URL, and TRUSTED_FORWARDER in a .env file"
    );
  }

  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const trustedForwarder = process.env.TRUSTED_FORWARDER;

  console.log("Deploying Payroll contract...");
  const payrollFactory = new Payroll__factory(wallet);
  const payrollContract = await payrollFactory.deploy(trustedForwarder);
  await payrollContract.waitForDeployment();

  console.log(`Payroll contract deployed to: ${payrollContract.getAddress()}`);

  // Optionally, fund the contract:
  /*
  const fundAmount = ethers.parseEther("0.1"); // Example: 0.1 ETH
  const fundTx = await wallet.sendTransaction({
    to: payrollContract.getAddress(),
    value: fundAmount,
  });
  await fundTx.wait();

  console.log(`Funded contract with ${ethers.formatEther(fundAmount)} ETH`);
  */
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
