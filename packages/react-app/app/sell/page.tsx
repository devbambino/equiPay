"use client";

import { useState, useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SellPage() {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("ccop");
  const qrRef = useRef<HTMLDivElement>(null);
  const qrInstance = useRef<QRCodeStyling | null>(null);

  const merchant = process.env.NEXT_PUBLIC_MERCHANT_ADDRESS!;

  // Initialize QRCodeStyling on mount
  useEffect(() => {
    if (qrRef.current && !qrInstance.current) {
      const qr = new QRCodeStyling({
        width: 256,
        height: 256,
        data: amount? JSON.stringify({ merchant, amount: "", currency } ) : "",
      });
      qrRef.current.innerHTML = "";
      qr.append(qrRef.current);
      qrInstance.current = qr;
    }
  }, [merchant]);

  // Update QR data when amount or currency changes
  useEffect(() => {
    if (qrInstance.current) {
      const data = amount? JSON.stringify({ merchant, amount, currency }):"";
      qrInstance.current.update({ data });
    }
  }, [amount, currency, merchant]);

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white flex flex-col items-center px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Sell: Generate QR</h1>
      <div className="w-full max-w-[640px] mx-auto space-y-4 text-center">
        <Input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <select
          className="w-full rounded-md border px-3 py-2 bg-gray-800 text-white"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        >
          <option value="ccop">cCOP</option>
          <option value="cusd">cUSD</option>
          <option value="cusdc">USDC</option>
        </select>
        <Button className="bg-yellow-400 hover:bg-white text-gray-900 px-8 py-4 bg-yellow-400 hover:bg-white text-gray-900 rounded-full text-lg font-semibold" disabled={!amount} title="Generate QR" onClick={() => {/* no-op; QR updates automatically */ }} />
      </div>
      <div ref={qrRef} className="mt-8" />
    </div>
  );
}

