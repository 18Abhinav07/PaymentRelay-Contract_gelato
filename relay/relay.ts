import { GelatoRelay, CallWithERC2771Request } from "@gelatonetwork/relay-sdk";
import { ethers } from "ethers";


const relay = new GelatoRelay();
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

  const provider = new ethers.BrowserProvider((window as any).ethereum);  // Use BrowserProvider or other suitable provider
  const signer = await provider.getSigner();
  const user = await signer.getAddress();

  const payrollContract = new ethers.Contract(payrollAddress, PAYROLL_ABI, signer);
  const { data } = await payrollContract.fundContract.populateTransaction();


  const request: CallWithERC2771Request = {
    chainId: (await provider.getNetwork()).chainId,
    target: payrollAddress,
    data: data,
    user: user,
  };

  try {
    const relayResponse = await relay.sponsoredCallERC2771(request, signer, apiKey);
    console.log("Relay Response:", relayResponse);
    return relayResponse;
  } catch (error) {
    console.error("Error sponsoring transaction:", error);
    throw error; // Re-throw the error to be handled by the calling function
  }
}

const payrollAddress = "YOUR_PAYROLL_CONTRACT_ADDRESS";
const topUpAmountInEth = 0.01; 
const apiKey = "YOUR_GELATO_RELAY_API_KEY";

sponsorFundContract(payrollAddress, topUpAmountInEth, apiKey)
  .then((response) => {
    console.log("Transaction sponsored successfully:", response);
    // Handle success, e.g., update UI
  })
  .catch((error) => {
    console.error("Error sponsoring transaction:", error);
    // Handle error, e.g., display error message to the user
  });