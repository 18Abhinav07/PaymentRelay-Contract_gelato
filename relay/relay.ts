import { GelatoRelay, CallWithERC2771Request } from "@gelatonetwork/relay-sdk";
import { ethers } from "ethers";

// Initialize Gelato Relay
const relay = new GelatoRelay();

// Payroll contract ABI (with the `fundContract` function)
const PAYROLL_ABI = [
  "function fundContract() public payable",
];

/**
 * Sponsors a fund contract by sending a transaction to the specified payroll contract.
 *
 * @param payrollAddress - The address of the payroll contract to fund.
 * @param topUpAmountInEth - The amount to top up in Ether.
 * @param apiKey - The API key for the relay service.
 * @returns A promise that resolves with the relay response.
 * @throws Will throw an error if the transaction fails.
 */
async function sponsorFundContract(
  payrollAddress: string,
  topUpAmountInEth: number,
  apiKey: string
) {

  // Initialize provider (choose a suitable RPC URL)
  const provider = new ethers.JsonRpcProvider("https://your-eth-rpc-url.com"); // Replace with actual provider URL

  // Wallet setup with private key (from server environment)
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY is not defined in the environment variables");
  }
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const user = signer.address; // The user submitting the transaction

  // Create contract instance with signer
  const payrollContract = new ethers.Contract(payrollAddress, PAYROLL_ABI, signer);

  // Convert Ether amount to Wei (required for fundContract)
  const topUpAmountInWei = ethers.parseEther(topUpAmountInEth.toString());

  // Build transaction data for `fundContract`
  const txData = payrollContract.interface.encodeFunctionData("fundContract");

  // Create Gelato Relay request with ERC2771 meta-transaction
  const request: CallWithERC2771Request = {
    chainId: (await provider.getNetwork()).chainId, // Fetch the correct chain ID from provider
    target: payrollAddress,
    data: txData,
    user: user,
  };

  try {
    // Send the sponsored transaction via Gelato Relay
    const relayResponse = await relay.sponsoredCallERC2771(
      request,
      signer, // Use signer for signing the request
      apiKey, // Your Gelato API key
    );

    console.log("Relay Response:", relayResponse);
    return relayResponse;
  } catch (error) {
    console.error("Error sponsoring transaction:", error);
    throw error; // Re-throw the error to be handled by the calling function
  }
}

// Example usage:
const payrollAddress = "0xYOUR_PAYROLL_CONTRACT_ADDRESS";
const topUpAmountInEth = 0.01; // The amount in ETH to top-up
const apiKey = process.env.GELATO_RELAY_API_KEY; // Load API key securely from environment

if (!apiKey) {
  throw new Error("GELATO_RELAY_API_KEY is not defined in the environment variables");
}

sponsorFundContract(payrollAddress, topUpAmountInEth, apiKey)
  .then((response) => {
    console.log("Transaction sponsored successfully:", response);
    // Handle success, e.g., update UI
  })
  .catch((error) => {
    console.error("Error sponsoring transaction:", error);
    // Handle error, e.g., display error message to the user
  });
