import { useState } from "react";
import StableTokenABI from "./cusd-abi.json";
import {
    createPublicClient,
    createWalletClient,
    custom,
    getContract,
    http,
    parseEther,
    stringToHex,
} from "viem";
import { celoAlfajores } from "viem/chains";

const publicClient = createPublicClient({
    chain: celoAlfajores,
    transport: http(),
});

const cUSDTokenAddress = process.env.NEXT_PUBLIC_USD_ADDRESS; // Testnet
const USDCTokenAddress = process.env.NEXT_PUBLIC_USDC_ADDRESS;// Testnet
const cKESTokenAddress = process.env.NEXT_PUBLIC_KES_ADDRESS; // Testnet
const cCOPTokenAddress = process.env.NEXT_PUBLIC_COP_ADDRESS; // Testnet

export const useWeb3 = () => {
    const [address, setAddress] = useState<string | null>(null);

    const getUserAddress = async () => {
        if (typeof window !== "undefined" && window.ethereum) {
            let walletClient = createWalletClient({
                transport: custom(window.ethereum),
                chain: celoAlfajores,
            });

            let [address] = await walletClient.getAddresses();
            setAddress(address);
        }
    };

    const sendPaymentByCurrency = async (to: string, amount: string, currency: string) => {
        let walletClient = createWalletClient({
            transport: custom(window.ethereum),
            chain: celoAlfajores,
        });

        let [address] = await walletClient.getAddresses();

        const amountInWei = parseEther(amount);

        let tokenAddress = "";
        if (currency == "usdc") {
            tokenAddress = USDCTokenAddress!;
        } else if (currency == "ccop") {    
            tokenAddress = cCOPTokenAddress!;
        }
        else if (currency == "ckes") {
            tokenAddress = cKESTokenAddress!;
        }else {
            tokenAddress = cUSDTokenAddress!;
        }

        const tx = await walletClient.writeContract({
            address: tokenAddress as `0x${string}`,
            abi: StableTokenABI.abi,
            functionName: "transfer",
            account: address,
            args: [to, amountInWei],
        });

        let receipt = await publicClient.waitForTransactionReceipt({
            hash: tx,
        });

        return receipt;
    };

    const sendCUSD = async (to: string, amount: string) => {
        let walletClient = createWalletClient({
            transport: custom(window.ethereum),
            chain: celoAlfajores,
        });

        let [address] = await walletClient.getAddresses();

        const amountInWei = parseEther(amount);

        const tx = await walletClient.writeContract({
            address: cUSDTokenAddress! as `0x${string}`,
            abi: StableTokenABI.abi,
            functionName: "transfer",
            account: address,
            args: [to, amountInWei],
        });

        let receipt = await publicClient.waitForTransactionReceipt({
            hash: tx,
        });

        return receipt;
    };

    const sendCOP = async (to: string, amount: string) => {
        let walletClient = createWalletClient({
            transport: custom(window.ethereum),
            chain: celoAlfajores,
        });

        let [address] = await walletClient.getAddresses();

        const amountInWei = parseEther(amount);

        const tx = await walletClient.writeContract({
            address: cCOPTokenAddress! as `0x${string}`,
            abi: StableTokenABI.abi,
            functionName: "transfer",
            account: address,
            args: [to, amountInWei],
        });

        let receipt = await publicClient.waitForTransactionReceipt({
            hash: tx,
        });

        return receipt;
    };

    

    const signTransaction = async () => {
        let walletClient = createWalletClient({
            transport: custom(window.ethereum),
            chain: celoAlfajores,
        });

        let [address] = await walletClient.getAddresses();

        const res = await walletClient.signMessage({
            account: address,
            message: stringToHex("Hello from Celo Composer MiniPay Template!"),
        });

        return res;
    };

    return {
        address,
        getUserAddress,
        sendCUSD,
        sendCOP,
        sendPaymentByCurrency,
        signTransaction,
    };
};
