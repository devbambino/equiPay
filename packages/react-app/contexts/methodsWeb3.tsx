"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createPublicClient,
  createWalletClient,
  http,
  custom,
  encodeFunctionData,
  parseAbiItem,
  parseUnits,
  formatUnits,
} from "viem";
import { celoAlfajores } from "viem/chains";
import stableTokenAbiJson from "./cusd-abi.json";
import { Mento } from "@mento-protocol/mento-sdk";
import { JsonRpcProvider } from "@ethersproject/providers"; // only for SDK init
import { BigNumber } from "ethers";

// — Viem clients —
const publicClient = createPublicClient({
  chain: celoAlfajores,
  transport: http(),
});
const walletClient = createWalletClient({
  chain: celoAlfajores,
  // Only create the client if window.ethereum is available
  transport: typeof window !== "undefined" && window.ethereum ? custom(window.ethereum as any) : http(),
});
const stableTokenAbi = stableTokenAbiJson.abi;


// Web3 API
export interface IWeb3 {
  getBalance(token: string, account: `0x${string}`): Promise<string>;
  quoteOut(sell: string, buy: string, sellAmt: string): Promise<string>;
  quoteIn(sell: string, buy: string, buyAmt: string): Promise<string>;
  swapIn(
    sell: string,
    buy: string,
    sellAmt: string,
    account: `0x${string}`,
    slippageBps?: number
  ): Promise<string>;
  sendERC20(token: string, to: string, amt: string, account: `0x${string}`): Promise<string>;
  sendCUSD(to: string, amt: string, account: `0x${string}`): Promise<string>;
  mentoReady: boolean;
}

const Web3Context = createContext<IWeb3 | undefined>(undefined);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mento, setMento] = useState<Mento | null>(null);
  const [mentoReady, setMentoReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const rpcUrl = process.env.NEXT_PUBLIC_ALFAJORES_RPC!;
      const ethProvider = new JsonRpcProvider(rpcUrl);
      const mentoInstance = await Mento.create(ethProvider);
      if (mounted) {
        setMento(mentoInstance);
        setMentoReady(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Helper to throw if mento not ready
  const requireMento = () => {
    if (!mento) throw new Error("Mento SDK not initialized");
    return mento;
  };

  const getBalance = async (token: string, account: `0x${string}`) => {
    const bal = await publicClient.readContract({
      address: token as `0x${string}`,
      abi: stableTokenAbi,
      functionName: "balanceOf",
      args: [account],
    });
    return formatUnits(bal as bigint, 18).toString();
  };

  const quoteOut = async (sell: string, buy: string, amt: string) => {
    const sellWei = parseUnits(amt, 18);
    const outWei = await requireMento().getAmountOut(sell, buy, sellWei);
    return formatUnits(outWei, 18).toString();
  };

  const quoteIn = async (sell: string, buy: string, amt: string) => {
    const buyWei = parseUnits(amt, 18);
    const inWei = await requireMento().getAmountIn(sell, buy, buyWei);
    return formatUnits(inWei, 18).toString();
  };

  const swapIn = async (
    sell: string,
    buy: string,
    amt: string,
    account: `0x${string}`,
    slippageBps = 100
  ): Promise<string> => {
    const mentoInstance = requireMento();
    const pair = await mentoInstance.findPairForTokens(sell, buy);
    const sellWei = parseUnits(amt, 18); // viem returns bigint
    // Convert sellWei from bigint to ethers BigNumber
    const sellWeiBN = BigNumber.from(sellWei.toString());
    const outWei = await mentoInstance.getAmountOut(sell, buy, sellWei, pair); // returns bigint
    // Convert outWei to ethers BigNumber
    const outWeiBN = BigNumber.from(outWei.toString());
    // Calculate minOut using ethers BigNumber operations
    const minOutBN = outWeiBN.mul(10000 - slippageBps).div(10000);
  
    console.log("sellWeiBN", sellWeiBN.toString());
    console.log("outWeiBN", outWeiBN.toString());
    console.log("minOutBN", minOutBN.toString());
  
    // 1) Approve
    const approveTx = await mentoInstance.increaseTradingAllowance(sell, sellWei, pair);
    await walletClient.sendTransaction({ to: approveTx.to, data: approveTx.data, account });
  
    // 2) Swap with BigNumber parameters
    const swapTx = await mentoInstance.swapIn(sell, buy, sellWei, minOutBN, pair);
    console.log("swapTx", swapTx);
    const txHash = await walletClient.sendTransaction({ to: swapTx.to, data: swapTx.data, account });
    console.log("txHash", txHash);
    return txHash;
  };

  const sendERC20 = async (token: string, to: string, amt: string, account: `0x${string}`) => {
    const amtWei = parseUnits(amt, 18);
    const data = encodeFunctionData({
      abi: [parseAbiItem("function transfer(address,uint256) external")!],
      functionName: "transfer",
      args: [to as `0x${string}`, amtWei],
    });
    const txHash = await walletClient.sendTransaction({ to: token as `0x${string}`, data, account });
    return txHash;
  };

  const sendCUSD = (to: string, amt: string, account: `0x${string}`) =>
    sendERC20(process.env.NEXT_PUBLIC_USD_ADDRESS! as `0x${string}`, to as `0x${string}`, amt, account);

  // Optionally, you can provide mentoReady in context for UI loading states
  return (
    <Web3Context.Provider value={{ getBalance, quoteOut, quoteIn, swapIn, sendERC20, sendCUSD, mentoReady }}>
      {children}
    </Web3Context.Provider>
  );
};

export function methodsWeb3(): IWeb3 {
  const ctx = useContext(Web3Context);
  if (!ctx) throw new Error("useWeb3 must be used within Web3Provider");
  return ctx;
}
