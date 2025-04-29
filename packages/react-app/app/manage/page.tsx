"use client";

import { useEffect, useState } from "react";
import { methodsWeb3 } from "@/contexts/methodsWeb3";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
import { useToast } from "@/components/ui/ToastProvider";

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

// Token icons (emoji fallback)
const TOKEN_ICONS: Record<string, string> = {
  USD: "💵",
  COP: "🇨🇴",
  KES: "🇰🇪",
  REAL: "🇧🇷",
  PISO: "🇵🇭",
  GHS: "🇬🇭",
  ZAR: "🇿🇦",
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
  const [usdBalance, setUsdBalance] = useState("");
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loadingBalances, setLoadingBalances] = useState(true);
  const { showToast } = useToast();
  const deeplinkTransfer = `https://minipay.opera.com/transfer?token=${process.env.NEXT_PUBLIC_USD_ADDRESS!}`;
  const deeplinkDeposit = `https://minipay.opera.com/add_cash`;
  const deeplinkWithdraw = `https://minipay.opera.com/withdraw?token=${process.env.NEXT_PUBLIC_USD_ADDRESS!}`;

  const loadData = async () => {
    if (!address) return;
    setLoadingBalances(true);

    // Fetch USD Balance
    let balanceInFallbackToken = await web3.getBalance(TOKEN_MAP["USD"], address);
    setUsdBalance(balanceInFallbackToken);

    // Fetch all balances for the tokens in TOKEN_MAP
    const tokenSymbols = Object.keys(TOKEN_MAP);
    const tokenAddresses = tokenSymbols.map((s) => TOKEN_MAP[s]);
    const bals = await web3.getAllBalancesArray(tokenAddresses, address as `0x${string}`);
    // Map balances by token address for lookup
    const addressToSymbol: Record<string, string> = {};
    tokenSymbols.forEach((symbol) => {
      addressToSymbol[TOKEN_MAP[symbol]] = symbol;
    });
    // Map each balance to its symbol using the address
    const balsWithSymbol = bals.map((b) => ({
      token: addressToSymbol[b.token] || b.token,
      balance: b.balance,
    }));
    setBalances(balsWithSymbol);
    setLoadingBalances(false);
  };

  useEffect(() => {
    loadData();
  }, [address]); // web3 is now stable

  // Calculate total balance (sum of all tokens, just for display)
  const totalBalance = balances.reduce((acc, b) => acc + Number(b.balance), 0);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center px-4 py-12">
      <h1 className="text-3xl font-bold mb-6 text-center">Manage</h1>
      <div className="w-full max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg space-y-8 text-center">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Your Balance</h2>
          <div className="h-1 w-16 bg-yellow-400 mx-auto rounded mb-6" />

          {/* Total summary
          <div className="mb-6 text-lg text-gray-300">
            USD Balance: <span className="font-bold text-yellow-300">{totalBalance.toFixed(2)}</span>
          </div>*/}

          {/* USD Balance*/}
          {usdBalance && (
            <div
              className="p-6 rounded-2xl shadow-lg text-center transition-transform hover:scale-105 hover:shadow-2xl flex flex-col items-center"
            >
              <div className="text-4xl mb-2">{TOKEN_ICONS["USDC"] || "💰"}</div>
              <div className="text-2xl font-bold mb-1">{Number(usdBalance).toFixed(2)}</div>
              <div className="text-lg text-yellow-400 mb-4">USD</div>
              <Button
                title="Withdraw"
                variant="default"
                size="sm"
                className="w-full bg-yellow-400 hover:bg-white text-gray-900 rounded-full mt-4"
                onClick={async () => {
                  if (!address) return;
                  showToast(`Withdrawal requested for USD`, "info");
                  window.open(deeplinkWithdraw, "_blank");
                }}
              />
              <Button
                title="Transfer"
                variant="default"
                size="sm"
                className="w-full bg-yellow-400 hover:bg-white text-gray-900 rounded-full mt-4"
                onClick={async () => {
                  if (!address) return;
                  showToast(`Transfer requested for USD`, "info");
                  window.open(deeplinkTransfer, "_blank");
                }}
              />
              <Button
                title="Deposit"
                variant="default"
                size="sm"
                className="w-full bg-yellow-400 hover:bg-white text-gray-900 rounded-full mt-4"
                onClick={async () => {
                  if (!address) return;
                  showToast(`Deposit requested for USD`, "info");
                  window.open(deeplinkDeposit, "_blank");
                }}
              />
            </div>
          )
          }


          {/* Balances grid */}
          {loadingBalances ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 bg-gray-700 rounded-2xl shadow animate-pulse flex flex-col items-center">
                  <div className="h-10 w-10 bg-gray-600 rounded-full mb-2" />
                  <div className="h-6 w-20 bg-gray-600 rounded mb-1" />
                  <div className="h-4 w-16 bg-gray-600 rounded" />
                </div>
              ))}
            </div>
          ) : balances.length === 0 ? (
            <div className="text-gray-400 py-12">No balances found. Start selling or receiving payments!</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {balances.filter(({ balance }) => Number(balance) > 0).map(({ token, balance }) =>
                token !== "USD" ? (
                  <div
                    key={token}
                    className="p-6 bg-gray-700 rounded-2xl shadow-lg text-center transition-transform hover:scale-105 hover:shadow-2xl flex flex-col items-center"
                  >
                    <div className="text-4xl mb-2">{TOKEN_ICONS[token] || "💰"}</div>
                    <div className="text-2xl font-bold mb-1">{Number(balance).toFixed(2)}</div>
                    <div className="text-lg text-yellow-400 mb-4">{token}</div>
                    <Button
                      title={token == "USD" ? "Withdraw" : "Swap to USD"}
                      variant="default"
                      size="sm"
                      className="w-full bg-[#0e76fe] hover:bg-white text-white hover:text-gray-900 rounded-full"
                      onClick={async () => {
                        if (!address) return;
                        const cUSDToken = process.env.NEXT_PUBLIC_USD_ADDRESS!;
                        if (token !== "USD") {
                          try {
                            showToast(`Swapping ${Number(balance).toFixed(2)} ${token} to cUSD...`, "info");
                            const prevCusdBalance = await web3.getBalance(cUSDToken, address);
                            await web3.swapIn(
                              TOKEN_MAP[token],
                              cUSDToken,
                              balance,
                              address
                            );
                            // Poll for cUSD balance update
                            const waitForCusdBalance = async (oldBalance: number, timeout = 60000, interval = 1000) => {
                              const start = Date.now();
                              while (Date.now() - start < timeout) {
                                const newBalance = parseFloat(await web3.getBalance(cUSDToken, address));
                                if (newBalance > oldBalance) return;
                                await new Promise(res => setTimeout(res, interval));
                              }
                            };
                            await waitForCusdBalance(parseFloat(prevCusdBalance));
                            showToast(`Swap to cUSD complete. You can now withdraw.`, "success");
                            await loadData();
                          } catch (err: any) {
                            showToast(`Swap failed: ${err?.message || err}`, "error");
                            return;
                          }
                        } else {
                          showToast(`Withdrawal requested for ${token}`, "info");
                        }
                      }}
                    />
                  </div>

                ) : ("")



              )
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
