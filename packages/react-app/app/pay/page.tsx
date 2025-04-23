"use client";

import { useState } from "react";
import { useWeb3 } from "@/contexts/useWeb3";
import { Button } from "@/components/ui/button";
import { Scanner } from '@yudiel/react-qr-scanner';

export default function PayPage() {
  const { sendCUSD } = useWeb3();
  const [scanData, setScanData] = useState<{ merchant: string; amount: string; currency: string } | null>(null);
  const [txHash, setTxHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  const handleScan = (detectedCodes: { rawValue: string }[]) => {
    if (detectedCodes.length > 0) {
      const code = detectedCodes[0].rawValue;
      if (code) {
        try {
          const data = JSON.parse(code);
          setScanData(data);
        } catch (e) {
          console.error("Invalid QR data", e);
        } finally {
          setScanning(false);
        }
      }
    }
  };

  const handleError = (error: unknown) => {
    console.error("QR Scan Error:", error);
    setScanning(false);
  };

  const pay = async () => {
    if (!scanData) return;
    setLoading(true);
    try {
      const tx = await sendCUSD(scanData.merchant, scanData.amount);
      setTxHash(tx.transactionHash);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Scan & Pay</h1>
      <div className="w-full max-w-xs space-y-4 text-center">
        {/* Show Scan button when not scanning or scanned */}
        {!scanning && !scanData && (
          <Button title="Start Scan" onClick={() => setScanning(true)} className="bg-yellow-400 hover:bg-white text-gray-900 px-8 py-4 bg-yellow-400 hover:bg-white text-gray-900 rounded-full text-lg font-semibold" />
        )}

        {/* Scanner active */}
        {scanning && (
          <div className="aspect-square w-full">
            <Scanner
              onScan={handleScan}
              onError={handleError}
              constraints={{ facingMode: 'environment' }}
            />
          </div>
        )}

        {/* Display payment details and button once scanned */}
        {scanData && (
          <div className="mt-4 bg-gray-800 p-4 rounded-lg space-y-2">
            <p>Amount: {scanData.amount} {scanData.currency}</p>
            <p>Merchant: {scanData.merchant}</p>
            <Button title="Confirm & Pay" onClick={pay} loading={loading} className="bg-yellow-400 hover:bg-white text-gray-900 px-8 py-4 bg-yellow-400 hover:bg-white text-gray-900 rounded-full text-lg font-semibold" />
          </div>
        )}

        {/* Transaction result */}
        {txHash && (
          <p className="mt-4 text-green-400 text-center">
            Paid! Tx: 
            <a
              href={`https://alfajores.celoscan.io/tx/${txHash}`}
              target="_blank"
              className="underline"
            >
              {txHash.slice(0, 8)}…{txHash.slice(-8)}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
