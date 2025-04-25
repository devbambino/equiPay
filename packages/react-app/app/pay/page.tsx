"use client";

import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
import { methodsWeb3 } from "@/contexts/methodsWeb3";

export default function PayPage() {
  const { getBalance, swapIn, sendERC20, sendCUSD, quoteIn } = methodsWeb3();
  const { address } = useAccount();
  const [payload, setPayload] = useState<{
    merchant: string;
    amount: string;
    token: string;
    allowFallback: boolean;
  } | null>(null);
  const [step, setStep] = useState<"scan" | "decide" | "confirm" | "done">("scan");
  const [quote, setQuote] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");

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
          setStep("scan");
        }
      }
    }
  };

  // Decide which path
  const onPay = async () => {
    if (!payload || !address) return;
    const { merchant, amount, token, allowFallback } = payload;

    // 1) Direct pay in same token
    if (+await getBalance(token, address) >= +amount) {
      const hash = await sendERC20(token, merchant, amount, address);
      setTxHash(hash);
      return setStep("done");
    }

    // 2) Fallback cUSD
    if (allowFallback && +await getBalance(process.env.NEXT_PUBLIC_CUSD_ADDRESS!, address) >= +amount) {
      const hash = await sendCUSD(merchant, amount, address);
      setTxHash(hash);
      return setStep("done");
    }

    // 3) Need swap: quote how much cUSD to pay
    const needed = await quoteIn(process.env.NEXT_PUBLIC_CUSD_ADDRESS!, token, amount);
    setQuote(needed);
    setStep("confirm");
  };

  // Confirm swap & pay
  const onConfirmSwap = async () => {
    if (!payload || !address) return;
    const { merchant, token } = payload;
    const hash = await swapIn(process.env.NEXT_PUBLIC_CUSD_ADDRESS!, token, quote, address, 100);
    setTxHash(hash);
    setStep("done");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center px-4 py-12">
      {step === "scan" && (
        <Button onClick={() => setStep("decide")} title="Start Scan" />
      )}
      {step === "decide" && payload && (
        <Button onClick={onPay} title={`Pay ${payload.amount} ${payload.token}`} />
      )}
      {step === "confirm" && (
        <>
          <p>
            You’ll pay <strong>{quote} cUSD</strong> to get {payload?.amount} {payload?.token}
          </p>
          <Button onClick={onConfirmSwap} title="Confirm Swap & Pay" />
        </>
      )}
      {step === "done" && txHash && (
        <p>🎉 Paid! Tx hash: {txHash}</p>
      )}
      {/* Scanner is only shown if step is scan and payload is not set */}
      {step === "scan" && !payload && (
        <Scanner onScan={handleScan} onError={() => setStep("scan")} />
      )}
    </div>
  );
}
