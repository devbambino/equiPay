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
  formatUnits, encodeEventTopics, decodeEventLog
} from "viem";
import { celoAlfajores } from "viem/chains";
import stableTokenAbiJson from "./cusd-abi.json";
import { Mento } from "@mento-protocol/mento-sdk";
import { JsonRpcProvider } from "@ethersproject/providers"; // only for SDK init

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
  getBalanceInWei(token: string, account: `0x${string}`): Promise<bigint>;
  getBalance(token: string, account: `0x${string}`): Promise<string>;
  getAllBalancesArray(tokens: string[], user: `0x${string}`): Promise<{ token: string; balance: string }[]>;
  quoteOut(sell: string, buy: string, sellAmt: string): Promise<string>;
  quoteIn(sell: string, buy: string, buyAmt: string): Promise<string>;
  swapIn(
    sell: string,
    buy: string,
    sellAmt: string,
    account: `0x${string}`,
    slippageBps?: number
  ): Promise<string>;
  sendERC20(token: string, to: string, amt: string, account: `0x${string}`, amtInWei?: boolean): Promise<string>;
  sendUSD(to: string, amt: string, account: `0x${string}`): Promise<string>;
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

  const getBalanceInWei = async (token: string, account: `0x${string}`) => {
    let decimals = 18;
    if (token === process.env.NEXT_PUBLIC_USDC_ADDRESS!) { decimals = 6; }
    const bal = await publicClient.readContract({
      address: token as `0x${string}`,
      abi: stableTokenAbi,
      functionName: "balanceOf",
      args: [account],
    });
    return (bal as bigint);
  };

  const getBalance = async (token: string, account: `0x${string}`) => {
    let decimals = 18;
    if (token === process.env.NEXT_PUBLIC_USDC_ADDRESS!) { decimals = 6; }
    const bal = await publicClient.readContract({
      address: token as `0x${string}`,
      abi: stableTokenAbi,
      functionName: "balanceOf",
      args: [account],
    });
    return formatUnits(bal as bigint, decimals).toString();
  };

  const getAllBalancesArray = async (tokens: string[], user: `0x${string}`) => {
    const results: { token: string; balance: string }[] = [];
    await Promise.all(
      tokens.map(async (token) => {
        try {
          const balance = await getBalance(token, user);
          results.push({ token, balance });
        } catch {
          results.push({ token, balance: "0" });
        }
      })
    );
    return results;
  };

  const quoteOut = async (sell: string, buy: string, amt: string) => {
    const sellWei = parseUnits(amt, 18);
    const outWei = await requireMento().getAmountOut(sell, buy, sellWei);
    return formatUnits(BigInt(outWei.toString()), 18).toString();
  };

  const quoteIn = async (sell: string, buy: string, amt: string) => {
    //change decimals to 6 if token is USDC, 18 for others
    let decimals = 18;
    if (sell === process.env.NEXT_PUBLIC_USDC_ADDRESS!) { decimals = 6; }
    const buyWei = parseUnits(amt, 18);
    const inWei = await requireMento().getAmountIn(sell, buy, buyWei);
    return formatUnits(BigInt(inWei.toString()), decimals).toString();
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
    //change decimals to 6 if token is USDC, 18 for others
    let decimals = 18;
    if (sell === process.env.NEXT_PUBLIC_USDC_ADDRESS!) { decimals = 6; }
    const sellWei = parseUnits(amt, decimals);
    const sellWeiBN = BigInt(sellWei.toString());

    const outWei = await mentoInstance.getAmountOut(sell, buy, sellWei, pair);
    const outWeiBN = BigInt(outWei.toString());
    const minOutBN = (outWeiBN * BigInt(10000 - slippageBps)) / BigInt(10000);

    // Approve
    const approveTx = await mentoInstance.increaseTradingAllowance(sell, sellWei, pair);
    await walletClient.sendTransaction({ to: approveTx.to as `0x${string}`, data: approveTx.data as `0x${string}`, account });

    // Retry logic for swap
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const swapTx = await mentoInstance.swapIn(sell, buy, sellWei, minOutBN, pair);
        const txHash = await walletClient.sendTransaction({ to: swapTx.to as `0x${string}`, data: swapTx.data as `0x${string}`, account });
        return txHash as string;
      } catch (err) {
        //console.error("Error swapIn:", err);
        lastError = err;
        if (attempt < 3) {
          // Optionally add a small delay before retrying
          await new Promise(res => setTimeout(res, 1000));
        }
      }
    }
    throw lastError;
  };

  const sendERC20 = async (token: string, to: string, amt: string, account: `0x${string}`, amtInWei = false) => {
    //change decimals to 6 if token is USDC, 18 for others
    let decimals = 18;
    if (token === process.env.NEXT_PUBLIC_USDC_ADDRESS!) { decimals = 6; }

    let amtWei = parseUnits(amt, decimals);
    if (amtInWei) {
      amtWei = BigInt(amt);
    }
    console.log("sendERC20 Sending ", amtWei, " to ", to, " from ", account);
    const data = encodeFunctionData({
      abi: [parseAbiItem("function transfer(address,uint256) external")!],
      functionName: "transfer",
      args: [to as `0x${string}`, amtWei],
    });

    // Retry logic for swap
    let lastError;
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        //const currentNonce = await publicClient.getTransactionCount({ address: account });
        const txHash = await walletClient.sendTransaction({
          to: token as `0x${string}`,
          data: data as `0x${string}`,
          account,
          //nonce: currentNonce,
        });
        return txHash as string;
      } catch (err) {
        //console.error("Error sendERC20 attempt:", attempt, " error:", err);
        lastError = err;
        if (attempt < 5) {
          // Optionally add a small delay before retrying
          await new Promise(res => setTimeout(res, 3000));
        }
      }
    }
    throw lastError;
  };

  const sendUSD = (to: string, amt: string, account: `0x${string}`) =>
    sendERC20(process.env.NEXT_PUBLIC_USD_ADDRESS! as `0x${string}`, to as `0x${string}`, amt, account);



  // Optionally, you can provide mentoReady in context for UI loading states
  return (
    <Web3Context.Provider value={{
      getBalanceInWei,
      getBalance,
      getAllBalancesArray,
      quoteOut,
      quoteIn,
      swapIn,
      sendERC20,
      sendUSD,
      mentoReady
    }}>
      {children}
    </Web3Context.Provider>
  );
};

export function methodsWeb3(): IWeb3 {
  const ctx = useContext(Web3Context);
  if (!ctx) throw new Error("useWeb3 must be used within Web3Provider");
  return ctx;
}
