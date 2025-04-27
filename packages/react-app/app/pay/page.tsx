"use client";

import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
import { methodsWeb3 } from "@/contexts/methodsWeb3";


const cUSDTokenAddress = process.env.NEXT_PUBLIC_USD_ADDRESS; // Testnet
const USDCTokenAddress = process.env.NEXT_PUBLIC_USDC_ADDRESS;// Testnet
const cKESTokenAddress = process.env.NEXT_PUBLIC_KES_ADDRESS; // Testnet
const cCOPTokenAddress = process.env.NEXT_PUBLIC_COP_ADDRESS; // Testnet
const cPISOTokenAddress = process.env.NEXT_PUBLIC_PUSO_ADDRESS; // Testnet
const cREALTokenAddress = process.env.NEXT_PUBLIC_REAL_ADDRESS; // Testnet
const cGHSTokenAddress = process.env.NEXT_PUBLIC_GHS_ADDRESS; // Testnet
const cZARTokenAddress = process.env.NEXT_PUBLIC_ZAR_ADDRESS; // Testnet

export default function PayPage() {
  const { getBalance, swapIn, sendERC20, sendCUSD, quoteIn, mentoReady } = methodsWeb3();
  const { address } = useAccount();
  const [payload, setPayload] = useState<{
    merchant: string;
    amount: string;
    token: string;
    allowFallback: boolean;
  } | null>(null);
  const [step, setStep] = useState<"init" | "scan" | "decide" | "confirm" | "done">("init");
  const [quote, setQuote] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Helper to resolve token address
  const getTokenAddress = (token: string) => {
    switch (token) {
      case "real": return cREALTokenAddress!;
      case "cop": return cCOPTokenAddress!;
      case "kes": return cKESTokenAddress!;
      case "piso": return cPISOTokenAddress!;
      case "zar": return cZARTokenAddress!;
      case "ghs": return cGHSTokenAddress!;
      default: return cUSDTokenAddress!;
    }
  };

  // QR decoded
  const onDecode = (decoded: string | null) => {
    if (!decoded) return;
    try {
      setPayload(JSON.parse(decoded));
      setStep("decide");
    } catch {
      console.error("Invalid QR payload");
    }
  };
  const handleScan = (detectedCodes: { rawValue: string }[]) => {
    if (detectedCodes.length > 0) {
      const code = detectedCodes[0].rawValue;
      if (code) {
        try {
          setPayload(JSON.parse(code));
          setStep("decide");
        } catch (e) {
          console.error("Invalid QR data", e);
        } finally {
          setStep("decide");
        }
      }
    }
  };

  // Decide which path
  const onPay = async () => {
    if (!payload || !address) return;
    setIsLoading(true);
    const { merchant, amount, token, allowFallback } = payload;
    const tokenAddress = getTokenAddress(token);
    try {
      // 1) Direct pay in same token
      let balanceInMerchantsToken = await getBalance(tokenAddress, address);
      if (+balanceInMerchantsToken >= +amount) {
        const hash = await sendERC20(tokenAddress, merchant, amount, address);
        setTxHash(hash);
        setStep("done");
        return;
      }
      // 2) Fallback cUSD
      let balanceInFallbackToken = await getBalance(cUSDTokenAddress!, address);
      const neededInFallbackToken = await quoteIn(cUSDTokenAddress!, tokenAddress, amount);
      setQuote(neededInFallbackToken);
      if (allowFallback && +balanceInFallbackToken >= +neededInFallbackToken) {
        const hash = await sendCUSD(merchant, neededInFallbackToken, address);
        setTxHash(hash);
        setStep("done");
        return;
      }
      setStep("confirm");
    } catch (err: any) {
      if (err.reason === "no valid median") {
        alert("This token cannot be swapped at the moment. Please try a different token.");
        setStep("scan");
      } else {
        alert("An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Confirm swap & pay
  const onConfirmSwap = async () => {
    if (!payload || !address) return;
    setIsLoading(true);
    const { merchant, token, amount } = payload;
    const tokenAddress = getTokenAddress(token);
    try {
      const hashSwap = await swapIn(cUSDTokenAddress!, tokenAddress, quote, address, 100);
      // Polling function to wait for the balance to update
      const waitForBalance = async (minAmount: number, timeout = 60000, interval = 500) => {
        const start = Date.now();
        while (Date.now() - start < timeout) {
          const balance = await getBalance(tokenAddress, address);
          if (+balance >= +minAmount) return balance;
          await new Promise((resolve) => setTimeout(resolve, interval));
        }
        return await getBalance(tokenAddress, address);
      };
      // Wait for the swapped tokens to reflect in the balance
      const updatedBalance = await waitForBalance(+amount);
      if (+updatedBalance >= +amount) {
        const hashPayment = await sendERC20(tokenAddress, merchant, amount, address);
        setTxHash(hashPayment);
        setStep("done");
        return;
      } else {
        alert("Looks like you don't have enough balance in the currency. Please try again later.");
      }
    } catch (err) {
      alert("An error occurred during swap/payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!mentoReady) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center px-4 py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-4"></div>
        <p>Loading payment engine...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Pay Now</h1>
      {address ? (
        <>
          <div className="w-full max-w-md mx-auto bg-gray-800 p-8 rounded-lg shadow-lg space-y-6 text-center">
            {/* Loading animation overlay */}
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60 z-10 rounded-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                <p>Processing...</p>
              </div>
            )}
            <h2 className="text-2xl font-semibold text-white"></h2>
            {step === "init" && (
              <Button onClick={() => setStep("scan")} title="Scan to Pay" disabled={isLoading} />
            )}
            {step === "decide" && payload && (
              <Button onClick={onPay} title={`Pay ${payload.amount} ${payload.token.toLocaleUpperCase()}`} disabled={isLoading} />
            )}
            {step === "confirm" && (
              <>
                <p>
                  You’ll pay <strong>{payload?.amount} {payload?.token.toLocaleUpperCase()}</strong> using <strong>{quote} USD</strong> from your wallet.
                </p>
                <Button onClick={onConfirmSwap} title="Confirm & Pay" disabled={isLoading} />
              </>
            )}
            {step === "done" && txHash && (
              <>
                <p>🎉 You paid {quote ? (<>
                  <strong>{quote} USD</strong> (equivalent to {payload?.amount} {payload?.token.toLocaleUpperCase()})
                </>
                ) : (<strong>{payload?.amount} {payload?.token.toLocaleUpperCase()}</strong>)} to the merchant! <a href={txHash} target="_blank">Tx hash</a></p>
                <Button onClick={() => setStep("init")} title="New Payment" disabled={isLoading} />
              </>

            )}
            {/* Scanner is only shown if step is scan and payload is not set */}
            {step === "scan" && !payload && (
              <Scanner onScan={handleScan} onError={() => setStep("init")} />
            )}
          </div>
        </>
      ) : (
        <div className="mt-8">
          <p className="text-lg text-gray-500">
            Please connect your wallet to scan the QR code and pay.
          </p>
        </div>
      )}
    </div>
  );
}
