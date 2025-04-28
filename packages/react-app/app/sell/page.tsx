"use client";

import { useState, useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";
import { Input } from "@/components/ui/input";
import { useAccount } from "wagmi";

export default function SellPage() {
  const [mounted, setMounted] = useState(false);
  const { address } = useAccount();
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState("real");
  const [description, setDescription] = useState("");
  const [allowFallback, setAllowFallback] = useState(true);
  const qrRef = useRef<HTMLDivElement>(null);
  const qrInstance = useRef<QRCodeStyling | null>(null);

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
            <h2 className="text-2xl font-semibold text-white">Enter Payment Details</h2>
            <Input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-3 rounded-md border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <Input
              type="string"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-md border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <select
              className="w-full p-3 rounded-md border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
          <div ref={qrRef} className="mt-8" />
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
