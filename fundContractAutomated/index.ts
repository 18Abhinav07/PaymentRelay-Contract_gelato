import {
    Web3Function,
    Web3FunctionContext,
} from "@gelatonetwork/web3-functions-sdk";
import { Contract } from "@ethersproject/contracts";
import ky from "ky";

const PAYROLL_ABI = [
    "function fundContract() public payable",
    "function getTotalFunds() public view returns (uint256)",
];

Web3Function.onRun(async (context: Web3FunctionContext) => {
    const { userArgs, multiChainProvider } = context;

    const provider = multiChainProvider.default();

    const payrollAddress = userArgs.payroll as string;
    const payroll = new Contract(payrollAddress, PAYROLL_ABI, provider);

    const topUpAmountInUsd = parseFloat(userArgs.topUpAmountInUsd as string);
    const thresholdInUsd = parseFloat(userArgs.thresholdInUsd as string);

    const currency = "ethereum";
    let ethPriceUsd = 0;
    try {
        const coingeckoApi = `https://api.coingecko.com/api/v3/simple/price?ids=${currency}&vs_currencies=usd`;
        /**
         * Fetches the price data from the CoinGecko API.
         * 
         * @constant
         * @type {Object.<string, { usd: number }>}
         * @property {number} usd - The price of the cryptocurrency in USD.
         * 
         * @throws {Error} If the request to the CoinGecko API fails.
         */
        const priceData: { [key: string]: { usd: number } } = await ky
            .get(coingeckoApi, { timeout: 5_000, retry: 0 })
            .json();
        ethPriceUsd = priceData[currency].usd;
    } catch (err) {
        return { canExec: false, message: `Coingecko call failed: ${err}` };
    }


    let currentBalance = await payroll.getTotalFunds();
    let currentBalanceInUsd = (currentBalance.toNumber() / 1e18) * ethPriceUsd;

    console.log("Current Contract Balance (WEI):", currentBalance.toString());
    console.log("Current Contract Balance (USD):", currentBalanceInUsd);
    console.log("Threshold (USD):", thresholdInUsd);


    if (currentBalanceInUsd >= thresholdInUsd) {
        return { canExec: false, message: `Contract balance is above threshold.` };
    }


    const topUpAmountInEth = topUpAmountInUsd / ethPriceUsd;
    const topUpAmountInWei = Math.floor(topUpAmountInEth * 1e18).toString();


    console.log("Top Up Amount (USD):", topUpAmountInUsd);
    console.log("ETH Price (USD):", ethPriceUsd);
    console.log("Top Up Amount (ETH):", topUpAmountInEth);
    console.log("Top Up Amount (WEI):", topUpAmountInWei);

    return {
        canExec: true,
        callData: [
            {
                to: payrollAddress,
                data: payroll.interface.encodeFunctionData("fundContract"),
                value: topUpAmountInWei,
            },
        ],
    };
});

