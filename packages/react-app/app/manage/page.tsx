"use client";

import { useEffect, useState, useMemo } from "react";
import { methodsWeb3 } from "@/contexts/methodsWeb3";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";

// Map token symbols to addresses
const TOKEN_MAP: Record<string, string> = {
  USD: process.env.NEXT_PUBLIC_USD_ADDRESS!,
  COP: process.env.NEXT_PUBLIC_COP_ADDRESS!,
  KES: process.env.NEXT_PUBLIC_KES_ADDRESS!,
  REAL: process.env.NEXT_PUBLIC_REAL_ADDRESS!,
  PISO: process.env.NEXT_PUBLIC_PUSO_ADDRESS!,
  GHS: process.env.NEXT_PUBLIC_GHS_ADDRESS!,
  ZAR: process.env.NEXT_PUBLIC_ZAR_ADDRESS!,
};

interface Balance {
  token: string; // address
  balance: string;
}

interface TransactionRecord {
  hash: string;
  date: string;
  token: string; // address
  amount: string;
  from: string;
  to: string;
}

export default function ManagePage() {
  const { address } = useAccount();
  const web3 = methodsWeb3(); // Call directly, not in useMemo
  const [balances, setBalances] = useState<Balance[]>([]);
  const [history, setHistory] = useState<TransactionRecord[]>([]);
  const [loadingBalances, setLoadingBalances] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!address) return;
      setLoadingBalances(true);
      const tokenSymbols = Object.keys(TOKEN_MAP);
      const tokenAddresses = tokenSymbols.map((s) => TOKEN_MAP[s]);
      const bals = await web3.getAllBalancesArray(tokenAddresses, address as `0x${string}`);
      const balsWithSymbol = bals.map((b, i) => ({ token: tokenSymbols[i], balance: b.balance }));
      setBalances(balsWithSymbol);
      setLoadingBalances(false);

      /*setLoadingHistory(true);
      const txs = await web3.getAllTransactionHistory(tokenAddresses, address); // use web3
      const txsWithSymbol = txs.map((tx) => ({
        hash: tx.hash,
        date: new Date(tx.timestamp * 1000).toLocaleString(),
        token: tokenSymbols[tokenAddresses.indexOf(tx.token)] || tx.token,
        amount: tx.value,
        from: tx.from,
        to: tx.to,
      }));
      setHistory(txsWithSymbol);
      setLoadingHistory(false);*/
    }
    loadData();
  }, [address]); // web3 is now stable

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-8">
      <h1 className="text-3xl font-bold mb-8">Manage</h1>

      {/* Wallet Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Your Balance</h2>
        {loadingBalances ? (
          <div className="animate-spin h-8 w-8 border-4 border-gray-700 border-t-white rounded-full"></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {balances.map(({ token, balance }) => (
              <div key={token} className="p-4 bg-gray-800 rounded-lg shadow text-center">
                <p className="text-2xl font-bold mb-2">{Number(balance).toFixed(2)} <span className="text-xl text-yellow-400">{token}</span></p>
                <Button
                  title="Withdraw"
                  variant="default"
                  className="px-8 py-4 bg-[#0e76fe] hover:bg-white text-white hover:text-gray-900 rounded-full text-lg font-semibold"
                  size="sm"
                  onClick={() => {
                    // TODO: trigger withdrawal flow for `token`
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* History Section
      <section>
        <h2 className="text-2xl font-semibold mb-4">History</h2>
        {loadingHistory ? (
          <div className="animate-spin h-8 w-8 border-4 border-gray-700 border-t-white rounded-full"></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-700">
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Token</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                  <th className="px-4 py-2 text-left">From</th>
                  <th className="px-4 py-2 text-left">To</th>
                </tr>
              </thead>
              <tbody>
                {history.map((tx) => (
                  <tr key={tx.hash} className="border-b border-gray-700">
                    <td className="px-4 py-2">{tx.date}</td>
                    <td className="px-4 py-2">{tx.token}</td>
                    <td className="px-4 py-2 text-right">{tx.amount}</td>
                    <td className="px-4 py-2 truncate max-w-xs">{tx.from}</td>
                    <td className="px-4 py-2 truncate max-w-xs">{tx.to}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
       */}
    </div>
  );
}
