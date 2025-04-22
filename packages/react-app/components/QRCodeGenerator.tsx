"use client";

import QRCode from "react-qr-code";

interface QRCodeGeneratorProps {
  amount: string; //
  tokenType: number; // 0 for cUSD, 1 for USDC
}

export function QRCodeGenerator({ amount, tokenType }: QRCodeGeneratorProps) {
  const merchant = process.env.NEXT_PUBLIC_MERCHANT_ADDRESS!;
  const copAddr  = process.env.NEXT_PUBLIC_COP_ADDRESS!;
  const usdcAddr  = process.env.NEXT_PUBLIC_USDC_ADDRESS!;
  const usdAddr  = process.env.NEXT_PUBLIC_USD_ADDRESS!;
  const tokenAddr = tokenType == 0 ? usdAddr : usdcAddr;
  // This URL format will open MiniPay’s built‑in payment flow.
  const deeplink = `https://minipay.opera.com/transfer?to=${merchant}&amount=${amount}&token=${tokenAddr}`;

  return (
    <div className="p-4 bg-gray-800 rounded-lg inline-block">
      <QRCode value={deeplink} size={256} />
      <p className="mt-2 text-center text-gray-300">
        Scan to pay <strong>{amount} {tokenType == 0 ? 'cUSD' : 'USDC'}</strong>
      </p>
    </div>
  );
}
