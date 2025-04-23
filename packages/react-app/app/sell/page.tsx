"use client";

import { useState, useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";

export default function SellPage() {
  const [mounted, setMounted] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState("ccop");
  const qrRef = useRef<HTMLDivElement>(null);
  const qrInstance = useRef<QRCodeStyling | null>(null);
  const { address: wagmiAddress } = useAccount();

  // Only render after mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize QRCodeStyling on mount
  useEffect(() => {
    if (mounted && qrRef.current && !qrInstance.current) {
      const qr = new QRCodeStyling({
        width: 256,
        height: 256,
        data: amount ? JSON.stringify({ address: "", amount: "", currency, description }) : "",
      });
      qrRef.current.innerHTML = "";
      qr.append(qrRef.current);
      qrInstance.current = qr;
    }
  }, [currency, mounted]);

  useEffect(() => {
    if (wagmiAddress) {
      console.log("Merchant Address: ", wagmiAddress);
    }
  }, [wagmiAddress]);

  // Update QR data when amount, currency, description, or address changes
  useEffect(() => {
    if (qrInstance.current) {
      const data = amount
        ? JSON.stringify({ address: wagmiAddress, amount, currency, description })
        : "";
      qrInstance.current.update({ data });
    }
  }, [amount, currency, description, wagmiAddress]);

  if (!mounted) return (
    <div className="w-full min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center px-4 py-12">
      <div className="flex flex-col items-center mt-8">
        <p className="text-lg text-gray-500 mb-4">Loading...</p>
        <div className="border-t-4 border-b-4 border-white rounded-full h-8 w-8 animate-spin"></div>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white flex flex-col items-center px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Generate QR & Sell</h1>

      {wagmiAddress ? (
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
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="ccop">cCOP</option>
              <option value="ckes">cKES</option>
              <option value="cusd">cUSD</option>
            </select>
          </div>
          <div ref={qrRef} className="mt-8" />
        </>
      ) : (
        <div className="mt-8">
          <p className="text-lg text-gray-500">
            Please connect your wallet to generate a QR code.
          </p>
        </div>
      )}
    </div>
  );
}

