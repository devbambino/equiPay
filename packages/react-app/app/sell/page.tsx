"use client";

import { useState, useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
import { useToast } from "@/components/ui/ToastProvider";

export default function SellPage() {
  const [mounted, setMounted] = useState(false);
  const { address } = useAccount();
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState("real");
  const [description, setDescription] = useState("");
  const [allowFallback, setAllowFallback] = useState(true);
  const qrRef = useRef<HTMLDivElement>(null);
  const qrInstance = useRef<QRCodeStyling | null>(null);
  const [copRate, setCopRate] = useState(0.00025); // Example: 1 cCOP = $0.00025
  const [copSubtotal, setCopSubtotal] = useState(0);
  const [usdSubtotal, setUsdSubtotal] = useState(0);
  const [copSymbol, setCopSymbol] = useState("cCOP");
  const [copFiat, setCopFiat] = useState("$");
  const [copName, setCopName] = useState("COP");
  const [copDecimals, setCopDecimals] = useState(2);
  const [copApprox, setCopApprox] = useState(0);
  const [copPayload, setCopPayload] = useState("");
  const [copLink, setCopLink] = useState("");
  const [copCopied, setCopCopied] = useState(false);
  const { showToast } = useToast();

  // Update subtotals and payload
  useEffect(() => {
    if (amount && !isNaN(Number(amount))) {
      // Example: 1 cCOP = $0.00025, 1 cUSD = $1
      let rate = 0.00025;
      let symbol = "cCOP";
      let fiat = "$";
      let name = "COP";
      let decimals = 2;
      if (token === "cop") {
        rate = 0.00025; symbol = "cCOP"; fiat = "$"; name = "COP"; decimals = 2;
      } else if (token === "ghs") {
        rate = 0.07; symbol = "cGHS"; fiat = "₵"; name = "GHS"; decimals = 2;
      } else if (token === "kes") {
        rate = 0.007; symbol = "cKES"; fiat = "KSh"; name = "KES"; decimals = 2;
      } else if (token === "piso") {
        rate = 0.018; symbol = "cPHP"; fiat = "₱"; name = "PHP"; decimals = 2;
      } else if (token === "real") {
        rate = 0.20; symbol = "cBRL"; fiat = "R$"; name = "BRL"; decimals = 2;
      } else if (token === "zar") {
        rate = 0.052; symbol = "cZAR"; fiat = "R"; name = "ZAR"; decimals = 2;
      }
      setCopRate(rate);
      setCopSymbol(symbol);
      setCopFiat(fiat);
      setCopName(name);
      setCopDecimals(decimals);
      setCopSubtotal(Number(amount));
      setCopApprox(Number(amount) * rate);
    } else {
      setCopSubtotal(0);
      setCopApprox(0);
    }
    // Build payload and link
    if (address && amount) {
      const payload = {
        merchant: address,
        amount,
        token,
        description,
        allowFallback,
      };
      setCopPayload(JSON.stringify(payload, null, 2));
      setCopLink(
        `${typeof window !== "undefined" ? window.location.origin : ""}/pay?data=${encodeURIComponent(
          JSON.stringify(payload)
        )}`
      );
    } else {
      setCopPayload("");
      setCopLink("");
    }
  }, [amount, token, address, description, allowFallback]);

  // Copy link handler
  const handleCopy = () => {
    if (copLink) {
      navigator.clipboard.writeText(copLink);
      setCopCopied(true);
      showToast("Copied to clipboard", "success");
      setTimeout(() => setCopCopied(false), 1500);
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
      qrInstance.current.update({
        data: JSON.stringify({
          merchant: address,
          amount,
          token,
          description,
          allowFallback,
        }),
      });
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
                <span>Allow USD fallback (if local currency is not supported by customer)</span>
              </label>
            </div>
            {/* Subtotal */}
            {amount && !isNaN(Number(amount)) && (
              <div className="text-lg font-medium text-yellow-300 mb-2">
                You will receive ≈ {copFiat}{copSubtotal}
              </div>
            )}
            {/* QR and Copy Link */}
            <div className="flex flex-col items-center space-y-2 mt-6">
              <div ref={qrRef} className="mb-2" />
              {copLink && (
                <Button
                  title={copCopied ? "Copied!" : "Copy payment link"}
                  onClick={handleCopy}
                  variant="default"
                  size="sm"
                  widthFull={false}
                  className="mt-2 bg-[#0e76fe] hover:bg-white text-white hover:text-gray-900 rounded-full"
                />
              )}
            </div>
            {/* JSON Preview */}
            {copPayload && (
              <div className="bg-gray-900 rounded-md p-4 mt-4 text-left text-xs text-gray-300 overflow-x-auto">
                <div className="font-bold text-yellow-400 mb-1">Payment Payload Preview</div>
                <pre>{copPayload}</pre>
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
