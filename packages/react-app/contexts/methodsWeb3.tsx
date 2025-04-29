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
  sendERC20(token: string, to: string, amt: string, account: `0x${string}`): Promise<string>;
  sendCUSD(to: string, amt: string, account: `0x${string}`): Promise<string>;
  getTransactionHistory(token: string, user: string): Promise<Array<{ hash: string; from: string; to: string; value: string; timestamp: number }>>;
  getAllTransactionHistory(tokens: string[], user: string): Promise<Array<{ hash: string; from: string; to: string; value: string; timestamp: number; token: string }>>;
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

  const getAllTransactionHistory = async (tokens: string[], user: string) => {
    const all: Array<{ hash: string; from: string; to: string; value: string; timestamp: number; token: string }> = [];
    await Promise.all(
      tokens.map(async (token) => {
        const txs = await getTransactionHistory(token, user);
        txs.forEach((tx) => {
          if (tx) {
            all.push({ ...tx, token });
          }
        });
      })
    );
    all.sort((a, b) => b.timestamp - a.timestamp);
    return all;
  };

  const quoteOut = async (sell: string, buy: string, amt: string) => {
    const sellWei = parseUnits(amt, 18);
    const outWei = await requireMento().getAmountOut(sell, buy, sellWei);
    return formatUnits(BigInt(outWei.toString()), 18).toString();
  };

  const quoteIn = async (sell: string, buy: string, amt: string) => {
    const buyWei = parseUnits(amt, 18);
    const inWei = await requireMento().getAmountIn(sell, buy, buyWei);
    return formatUnits(BigInt(inWei.toString()), 18).toString();
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
    const sellWei = parseUnits(amt, 18);
    const sellWeiBN = BigInt(sellWei.toString());
    const outWei = await mentoInstance.getAmountOut(sell, buy, sellWei, pair);
    const outWeiBN = BigInt(outWei.toString());
    const minOutBN = (outWeiBN * BigInt(10000 - slippageBps)) / BigInt(10000);

    // Approve
    const approveTx = await mentoInstance.increaseTradingAllowance(sell, sellWei, pair);
    await walletClient.sendTransaction({ to: approveTx.to as `0x${string}`, data: approveTx.data as `0x${string}`, account });

    // Swap
    const swapTx = await mentoInstance.swapIn(sell, buy, sellWei, minOutBN, pair);
    const txHash = await walletClient.sendTransaction({ to: swapTx.to as `0x${string}`, data: swapTx.data as `0x${string}`, account });
    return txHash as string;
  };

  const sendERC20 = async (token: string, to: string, amt: string, account: `0x${string}`) => {
    const amtWei = parseUnits(amt, 18);
    const data = encodeFunctionData({
      abi: [parseAbiItem("function transfer(address,uint256) external")!],
      functionName: "transfer",
      args: [to as `0x${string}`, amtWei],
    });
    const txHash = await walletClient.sendTransaction({ to: token as `0x${string}`, data: data as `0x${string}`, account });
    return txHash as string;
  };

  const sendCUSD = (to: string, amt: string, account: `0x${string}`) =>
    sendERC20(process.env.NEXT_PUBLIC_USD_ADDRESS! as `0x${string}`, to as `0x${string}`, amt, account);

  function toTopicAddress(address: string) {
    return '0x' + address.toLowerCase().replace(/^0x/, '').padStart(64, '0');
  }

  const getTransactionHistory = async (token: string, user: string) => {
    const [transferTopic] = encodeEventTopics({ abi: stableTokenAbi, eventName: 'Transfer' });
    const userAddress = user.startsWith('0x') ? user : `0x${user}`;
    const userTopic = toTopicAddress(userAddress);
    // Query for logs where user is sender
    const fromLogs = await publicClient.getLogs({
      address: token as `0x${string}`,
      event: parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)"),
      abi: stableTokenAbi,
      fromBlock: "0x0",
      toBlock: "latest",
      topics: [transferTopic, userTopic]
    });
    const toLogs = await publicClient.getLogs({
      address: token as `0x${string}`,
      event: parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)"),
      abi: stableTokenAbi,
      fromBlock: "0x0",
      toBlock: "latest",
      topics: [transferTopic, null, userTopic]
    });
    // Merge and deduplicate logs by transaction hash + logIndex
    const allLogs = [...fromLogs, ...toLogs];
    const uniqueLogs = Array.from(new Map(allLogs.map(log => [log.transactionHash + '-' + log.logIndex, log])).values());
    console.log('getTransactionHistory uniqueLogs:', uniqueLogs);
    const history = await Promise.all(
      uniqueLogs.map(async (log) => {
        try {
          const decoded = decodeEventLog({
            abi: stableTokenAbi,
            data: log.data,
            topics: log.topics,
            eventName: 'Transfer'
          });
          if (!decoded.args) {
            console.error('Decoded args missing', log, decoded);
            return null;
          }
          // Destructure from the decoded.args object
          const { from, to, value } = decoded.args as { from: string; to: string; value: bigint };
          const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
          return {
            hash: log.transactionHash as string,
            from,
            to,
            value: formatUnits(value, 18),
            timestamp: Number(block.timestamp),
          };
        } catch (error) {
          console.error('Error decoding log', log, error);
          return null;
        }
      })
    );
    return history.filter(tx => tx !== null) as Array<{ hash: string; from: string; to: string; value: string; timestamp: number }>;
  };

  // Optionally, you can provide mentoReady in context for UI loading states
  return (
    <Web3Context.Provider value={{
      getBalance,
      getAllBalancesArray,
      quoteOut,
      quoteIn,
      swapIn,
      sendERC20,
      sendCUSD,
      getTransactionHistory,
      getAllTransactionHistory,
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
