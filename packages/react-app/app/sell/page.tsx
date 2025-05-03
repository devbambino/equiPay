"use client";

import { useState, useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
import { useToast } from "@/components/ui/ToastProvider";
import { methodsWeb3 } from "@/contexts/methodsWeb3";

const USDTokenAddress = process.env.NEXT_PUBLIC_USD_ADDRESS; // Testnet
const cKESTokenAddress = process.env.NEXT_PUBLIC_KES_ADDRESS; // Testnet
const cCOPTokenAddress = process.env.NEXT_PUBLIC_COP_ADDRESS; // Testnet
const cPISOTokenAddress = process.env.NEXT_PUBLIC_PUSO_ADDRESS; // Testnet
const cREALTokenAddress = process.env.NEXT_PUBLIC_REAL_ADDRESS; // Testnet
const cGHSTokenAddress = process.env.NEXT_PUBLIC_GHS_ADDRESS; // Testnet
const cZARTokenAddress = process.env.NEXT_PUBLIC_ZAR_ADDRESS; // Testnet
const rate = Number(process.env.NEXT_PUBLIC_EQUIPAY_FEE); // Fee rate charged bu EuiPay per payment

export default function SellPage() {
  const { quoteIn, mentoReady } = methodsWeb3();
  const [mounted, setMounted] = useState(false);
  const { address } = useAccount();
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState("real");
  const [description, setDescription] = useState("");
  const [allowFallback, setAllowFallback] = useState(false);
  const [quote, setQuote] = useState<string>("");
  const qrRef = useRef<HTMLDivElement>(null);
  const qrInstance = useRef<QRCodeStyling | null>(null);
  const [fee, setFee] = useState(0);
  const [feeUsd, setFeeUsd] = useState(0);
  const [total, setTotal] = useState(0);
  const [usdSubtotal, setUsdSubtotal] = useState(0);
  const [symbol, setSymbol] = useState("cCOP");
  const [fiat, setFiat] = useState("$");
  const [name, setName] = useState("COP");
  const [decimals, setDecimals] = useState(2);
  const [approx, setApprox] = useState(0);
  const [payload, setPayload] = useState("");
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  // Helper to resolve token address
  const getTokenAddress = (token: string) => {
    switch (token) {
      case "real": return cREALTokenAddress!;
      case "cop": return cCOPTokenAddress!;
      case "kes": return cKESTokenAddress!;
      case "piso": return cPISOTokenAddress!;
      case "zar": return cZARTokenAddress!;
      case "ghs": return cGHSTokenAddress!;
      default: return USDTokenAddress!;
    }
  };

  // Update subtotals and payload
  useEffect(() => {
    if (amount && !isNaN(Number(amount))) {

      let symbol = "cCOP";
      let fiat = "$";
      let name = "COP";
      let decimals = 2;
      if (token === "cop") {
        symbol = "cCOP"; fiat = "COP$"; name = "COP"; decimals = 2;
      } else if (token === "ghs") {
        symbol = "cGHS"; fiat = "₵"; name = "GHS"; decimals = 2;
      } else if (token === "kes") {
        symbol = "cKES"; fiat = "KSh"; name = "KES"; decimals = 2;
      } else if (token === "piso") {
        symbol = "cPHP"; fiat = "₱"; name = "PHP"; decimals = 2;
      } else if (token === "real") {
        symbol = "cBRL"; fiat = "R$"; name = "BRL"; decimals = 2;
      } else if (token === "zar") {
        symbol = "cZAR"; fiat = "R"; name = "ZAR"; decimals = 2;
      }
      setFee(rate * Number(amount));
      setFeeUsd(0);
      setSymbol(symbol);
      setFiat(fiat);
      setName(name);
      setDecimals(decimals);
      setApprox(Number(amount) * rate);

      if (allowFallback) {
        onCheckQuote();
      } else {
        setQuote("");
      }

    } else {
      setTotal(0);
      setApprox(0);
      setQuote("");
    }
    // Build payload and link
    /*if (address && amount) {
      const payload = {
        merchant: address,
        amount,
        token,
        description,
        allowFallback,
      };
      setPayload(JSON.stringify(payload, null, 2));
      setLink(
        `${typeof window !== "undefined" ? window.location.origin : ""}/pay?data=${encodeURIComponent(
          JSON.stringify(payload)
        )}`
      );
    } else {
      setPayload("");
      setLink("");
    }*/
  }, [amount, token, allowFallback]);

  const onCheckQuote = async () => {
    try {
      const tokenAddress = getTokenAddress(token);
      const neededInFallbackToken = await quoteIn(USDTokenAddress!, tokenAddress, amount);
      console.log("neededInFallbackToken", neededInFallbackToken);
      setFeeUsd(rate * Number(neededInFallbackToken));
      setQuote(neededInFallbackToken);
    } catch (err: any) {
      console.error("Sell quote error:", err);
      // Extract a string error message from the error object
      const errorStr =
        typeof err === "string"
          ? err
          : err?.message || err?.reason || JSON.stringify(err);
      if (errorStr.includes("no valid median")) {
        //Trading temporarily paused.  Unable to determine accurately X to USDC exchange rate now. Please try again later.
        showToast(
          `The oracle for the ${token.toUpperCase()}/USD pair is temporarily not working in the Mento Platform. Please try again later or use another currency.`,
          "error"
        );
      } else {
        showToast(`The Mento Platform is temporarily not working thus we are unable to determine accurately the USD exchange rate, please try again later!`, "error");
      }
      setTotal(0);
      setApprox(0);
      setQuote("");
    }
  };

  // Copy link handler
  const handleCopy = () => {
    if (link) {
      navigator.clipboard.writeText(link);
      setCopied(true);
      showToast("Copied to clipboard", "success");
      setTimeout(() => setCopied(false), 1500);
    }
  };

  // Only render after mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Init QR once
  useEffect(() => {
    if (mounted && qrRef.current && !qrInstance.current) {
      const qr = new QRCodeStyling({ width: 256, height: 256, data: "" });
      qrRef.current.innerHTML = "";
      qr.append(qrRef.current);
      qrInstance.current = qr;
    }
  }, [mounted]);

  // Update payload whenever inputs change
  useEffect(() => {
    if (qrInstance.current && amount && address) {
      const payload = {
        merchant: address,
        amount,
        token,
        description,
        allowFallback,
      };
      setLink(
        `${typeof window !== "undefined" ? window.location.origin : ""}/pay?data=${encodeURIComponent(
          JSON.stringify(payload)
        )}`
      );
      setPayload(JSON.stringify(payload, null, 2));
      qrInstance.current.update({
        data: JSON.stringify(payload),
      });
    } else {
      setPayload("");
      setLink("");
    }
  }, [amount, token, description, allowFallback, address]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Sell Now</h1>
      {mounted && address ? (
        <>
          <div className="w-full max-w-md mx-auto bg-gray-800 p-8 rounded-lg shadow-lg space-y-6 text-center">
            <h2 className="text-2xl font-semibold mb-2">Payment Details</h2>
            <div className="h-1 w-16 bg-yellow-400 mx-auto rounded mb-6" />
            {/* Grouped Card for Inputs */}
            <div className="bg-gray-700 rounded-lg p-6 space-y-4 mb-4">
              <Input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-3 rounded-md border border-gray-600 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <Input
                type="string"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 rounded-md border border-gray-600 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <select
                className="w-full p-3 rounded-md border border-gray-600 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              >
                <option value="cop">COP</option>
                <option value="ghs">GHS</option>
                <option value="kes">KES</option>
                <option value="piso">PISO/PHP</option>
                <option value="real">REAL</option>
                <option value="zar">ZAR</option>
              </select>
              <label className="inline-flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={allowFallback}
                  onChange={e => setAllowFallback(e.target.checked)}
                />
                <span>USD fallback <span className="text-sm text-yellow-200">(Receive USD if customer doesn't have local currency)</span></span>
              </label>
            </div>
            {/* Subtotal */}
            {amount && !isNaN(Number(amount)) && (
              <div className="text-lg font-medium text-yellow-300 mb-2">
                You will receive {fiat}{(Number(amount) - fee).toFixed(2)}* {quote && (
                  <>
                    (≈ $USD {(Number(quote) - feeUsd).toFixed(2)})
                    <br /><span className="text-xs text-white">($USD 1  ≈ {fiat}{(Number(amount) / Number(quote)).toFixed(2)})</span>
                  </>
                )}
                <br /><span className="text-xs text-white">*Including 1% fee of {fiat}{(Number(fee)).toFixed(2)} {quote && (`(≈ $USD ${(Number(feeUsd)).toFixed(2)})`)}</span>
              </div>
            )}
            {/* QR and Copy Link */}
            <div className="flex flex-col items-center space-y-2 mt-6">
              <div ref={qrRef} className="mb-2" />
              {link && (
                <Button
                  title={copied ? "Copied!" : "Copy payment link"}
                  onClick={handleCopy}
                  variant="default"
                  size="sm"
                  widthFull={false}
                  className="mt-2 bg-[#0e76fe] hover:bg-white text-white hover:text-gray-900 rounded-full"
                />
              )}
            </div>
            {/* JSON Preview */}
            {payload && (
              <div className="bg-gray-900 rounded-md p-4 mt-4 text-left text-xs text-gray-300 overflow-x-auto">
                <div className="font-bold text-yellow-400 mb-1">Payment Payload Preview</div>
                <pre>{payload}</pre>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="mt-8">
          <p className="text-lg text-gray-500">
            Please connect your wallet to generate the payment QR code.
          </p>
        </div>
      )}
    </div>
  );
}
