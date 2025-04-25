"use client";

import { useState, useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/contexts/useWeb3";
import { useAccount } from "wagmi";

export default function SellPage() {
  const { address } = useAccount();
  const { /* you won’t need web3 here unless quoting */ } = useWeb3();
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState("ccop");
  const [allowFallback, setAllowFallback] = useState(true);
  const qrRef = useRef<HTMLDivElement>(null);
  const qrInstance = useRef<QRCodeStyling | null>(null);

  // Init QR once
  useEffect(() => {
    if (qrRef.current && !qrInstance.current) {
      const qr = new QRCodeStyling({ width: 256, height: 256, data: "" });
      qrRef.current.innerHTML = "";
      qr.append(qrRef.current);
      qrInstance.current = qr;
    }
  }, []);

  // Update payload whenever inputs change
  useEffect(() => {
    if (qrInstance.current && amount && address) {
      qrInstance.current.update({
        data: JSON.stringify({
          merchant: address,
          amount,
          token,
          allowFallback,
        }),
      });
    }
  }, [amount, token, allowFallback, address]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Generate Payment QR</h1>
      <div className="w-full max-w-md space-y-4">
        <Input
          type="number"
          placeholder="Amount to receive"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
        <select
          className="w-full p-2 bg-gray-800"
          value={token}
          onChange={e => setToken(e.target.value)}
        >
          <option value="ccop">cCOP</option>
          <option value="ckes">cKES</option>
          <option value="cereal">cREAL</option>
        </select>
        <label className="inline-flex items-center space-x-2">
          <input
            type="checkbox"
            checked={allowFallback}
            onChange={e => setAllowFallback(e.target.checked)}
          />
          <span>Allow cUSD fallback</span>
        </label>
      </div>
      <div ref={qrRef} className="mt-8" />
    </div>
  );
}
