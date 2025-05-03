"use client";

import { useState, useEffect } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
import {parseUnits,formatUnits} from "viem";
import { methodsWeb3 } from "@/contexts/methodsWeb3";
import { useToast } from "@/components/ui/ToastProvider";

const rate = Number(process.env.NEXT_PUBLIC_EQUIPAY_FEE); // Fee rate charged bu EuiPay per payment
const equiPayAddress = process.env.NEXT_PUBLIC_EQUIPAY_WALLET; // EquiPay wallet address for collecting fees

const USDTokenAddress = process.env.NEXT_PUBLIC_USD_ADDRESS; // Testnet
const cKESTokenAddress = process.env.NEXT_PUBLIC_KES_ADDRESS; // Testnet
const cCOPTokenAddress = process.env.NEXT_PUBLIC_COP_ADDRESS; // Testnet
const cPISOTokenAddress = process.env.NEXT_PUBLIC_PUSO_ADDRESS; // Testnet
const cREALTokenAddress = process.env.NEXT_PUBLIC_REAL_ADDRESS; // Testnet
const cGHSTokenAddress = process.env.NEXT_PUBLIC_GHS_ADDRESS; // Testnet
const cZARTokenAddress = process.env.NEXT_PUBLIC_ZAR_ADDRESS; // Testnet

export default function PayPage() {
  const { getBalance, getBalanceInWei, swapIn, sendERC20, sendUSD, quoteIn, mentoReady } = methodsWeb3();
  const { address } = useAccount();
  const [payload, setPayload] = useState<{
    merchant: string;
    description: string
    amount: string;
    token: string;
    allowFallback: boolean;
  } | null>(null);
  const [step, setStep] = useState<"init" | "scan" | "decide" | "confirm" | "done">("init");
  const [quote, setQuote] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSwapRequired, setIsSwapRequired] = useState<boolean>(false);
  const [waitingTime, setWaitingTime] = useState<number>(1500);//2 seconds
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
          showToast("Invalid QR", "error");
          setStep("scan");
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
        //Payment to the merchant
        let fee = rate * Number(amount);
        const amountWithFee = (Number(amount) - fee).toFixed(3);
        const hash = await sendERC20(tokenAddress, merchant, amountWithFee, address);
        console.log("onPay localToken merchant", hash);
        setTxHash(hash);

        // Polling function to wait for the balance to update
        /*const waitForBalance = async (lastBalance: string, timeout = 60000, interval = 2000) => {
          const start = Date.now();
          while (Date.now() - start < timeout) {
            const balance = await getBalance(tokenAddress, address);
            console.log("onPay Waiting for token balance update... lastBalance:", lastBalance, " balance:", balance);
            if (+lastBalance > +balance) return balance;
            await new Promise((resolve) => setTimeout(resolve, interval));
          }
          return await getBalance(tokenAddress, address);
        };
        // Wait for the swapped tokens to reflect in the balance
        let updatedBalance = await waitForBalance(balanceInMerchantsToken);*/

        await new Promise(res => setTimeout(res, waitingTime));

        //Payment to EquiPay 
        let balanceAfterPayment = Number(balanceInMerchantsToken) - +amountWithFee;
        let adjustedFee = fee;
        if (balanceAfterPayment < fee) { adjustedFee = balanceAfterPayment; }
        const hashFee = await sendERC20(tokenAddress, equiPayAddress!, `${adjustedFee}`, address);
        console.log("onPay localToken fee", hashFee);
        setTxHash(hashFee);

        setStep("done");
        showToast("Payment done!", "success");
        return;
      }

      /*if (!allowFallback) {
        showToast(`Insufficient balance, please add ${token.toUpperCase()} to your wallet and try again later.`, "error");
        return;
      }
      */

      // 2) Paying with USD
      let balanceInFallbackToken = await getBalance(USDTokenAddress!, address);
      if (+balanceInFallbackToken < 0) {
        showToast(`Insufficient balance, please add ${token.toUpperCase()} or USD to your wallet and try again later.`, "error");
        return;
      }

      const neededInFallbackToken = await quoteIn(USDTokenAddress!, tokenAddress, amount);
      console.log("balanceInFallbackToken", balanceInFallbackToken);
      console.log("neededInFallbackToken", neededInFallbackToken);

      const adjustedQuote = Number(neededInFallbackToken).toFixed(3)
      setQuote(adjustedQuote);
      if (+balanceInFallbackToken >= +adjustedQuote) {
        //Not enough balance in merchants token, but enough in USD
        if (allowFallback) {
          // 2) Send USD directly
          setIsSwapRequired(false);
          /*const hash = await sendCUSD(merchant, neededInFallbackToken, address);
          setTxHash(hash);
          setStep("done");
          showToast("Transaction submitted", "success");*/
        } else {
          // 3) Swap USD to  merchant currency
          setIsSwapRequired(true);
        }
        setStep("confirm");
        showToast(`Not enough ${token.toUpperCase()} in your wallet. We will use USD instead.`, "info");
        return;
      } else {
        showToast(`Insufficient balance, please add ${token.toUpperCase()} or USD to you wallet and try again later.`, "error");
        return;
      }
    } catch (err: any) {
      console.error("Pay Error onPay:", err);
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
        showToast("An error occurred while processing the payment. Please try again later.", "error");
      }
      setStep("scan");
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
      if (isSwapRequired) {
        // 3) Swap USD to  merchant currency
        const currentBalance = await getBalance(tokenAddress, address);
        const hashSwap = await swapIn(USDTokenAddress!, tokenAddress, quote, address, 100);
        // Polling function to wait for the balance to update
        const waitForBalance = async (lastBalance: string, timeout = 60000, interval = 1000) => {
          const start = Date.now();
          while (Date.now() - start < timeout) {
            const balance = await getBalance(tokenAddress, address);
            console.log("onSwap swap Waiting for token balance update... lastBalance:", lastBalance, " balance:", balance);
            if (+balance > +lastBalance) return balance;
            await new Promise((resolve) => setTimeout(resolve, interval));
          }
          return await getBalance(tokenAddress, address);
        };
        // Wait for the swapped tokens to reflect in the balance
        let updatedBalance = await waitForBalance(currentBalance);
        const fee = rate * Number(amount);
        const amountWithFee = (Number(amount) - fee).toFixed(3);
        if (+updatedBalance >= +amountWithFee) {
          //Payment to the merchant
          const hashPayment = await sendERC20(tokenAddress, merchant, amountWithFee, address);
          console.log("onSwap localToken merchant", hashPayment);
          //console.log(`onSwap pay merchant balance:${updatedBalance} balanceBig:${BigInt(updatedBalance)}`);
          setTxHash(hashPayment);

          // Polling function to wait for the balance to update
          /*const waitForBalance = async (lastBalance: string, timeout = 60000, interval = 2000) => {
            const start = Date.now();
            while (Date.now() - start < timeout) {
              const balance = await getBalance(tokenAddress, address);
              console.log("onSwap pay Waiting for token balance update... lastBalance:", lastBalance, " balance:", balance);
              if (+lastBalance > +balance) return balance;
              await new Promise((resolve) => setTimeout(resolve, interval));
            }
            return await getBalance(tokenAddress, address);
          };*/
          // Wait for the swapped tokens to reflect in the balance
          await new Promise(res => setTimeout(res, waitingTime));
          //updatedBalance = await waitForBalance(updatedBalance);

          console.log("onSwap pay merchant balance:", updatedBalance, " balanceNumber:", +updatedBalance, " amountWithFee:", amountWithFee);
          const updatedBalanceInWei = parseUnits(updatedBalance, 18);

          //Payment to EquiPay
          let adjustedFee = parseUnits(fee.toString(), 18);
          let balanceAfterPaymentInWei = updatedBalanceInWei - parseUnits(amountWithFee, 18);;
          if (balanceAfterPaymentInWei < adjustedFee) { adjustedFee = balanceAfterPaymentInWei; }
          console.log("onSwap pay fee2 balanceAfterPayment:", balanceAfterPaymentInWei, " adjustedFee:", `${adjustedFee}`);
          const hashFee = await sendERC20(tokenAddress, equiPayAddress!, `${adjustedFee}`, address, true);
          console.log("onSwap localToken fee", hashFee);
          setTxHash(hashFee);

          setStep("done");
          showToast("Payment done!", "success");
          return;
        } else {
          showToast(`Insufficient balance in ${token.toUpperCase()}, please add more USD and try again later.`, "error");
        }
      } else {
        //2) Send USD directly
        //let balanceInFallbackToken = await getBalance(USDTokenAddress!, address);

        //Payment to the merchant
        const fee = rate * Number(quote);
        const quoteWithFee = (Number(quote) - fee).toFixed(3);
        const hashPayment = await sendUSD(merchant, quoteWithFee, address);
        console.log("onSwap USD merchant", hashPayment);
        setTxHash(hashPayment);

        // Polling function to wait for the balance to update
        /*const waitForBalance = async (lastBalance: string, timeout = 60000, interval = 2000) => {
          const start = Date.now();
          while (Date.now() - start < timeout) {
            const balance = await getBalance(USDTokenAddress!, address);
            console.log("onSwap pay Waiting for USD balance update... lastBalance:", lastBalance, " balance:", balance);
            if (+lastBalance > +balance) return balance;
            await new Promise((resolve) => setTimeout(resolve, interval));
          }
          return await getBalance(tokenAddress, address);
        };*/
        // Wait for the merchant payment to reflect in the balance
        await new Promise(res => setTimeout(res, 1000));
        //await waitForBalance(balanceInFallbackToken);

        //Payment to EquiPay
        const hashFee = await sendUSD(equiPayAddress!, `${Number(quote) - Number(quoteWithFee)}`, address);
        console.log("onSwap USD fee", hashFee);
        setTxHash(hashFee);

        setStep("done");
        showToast("Payment done!", "success");
      }

    } catch (err: any) {
      console.error("Swap Error onSwap:", err);
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
        showToast("An error occurred while processing the payment. Please try again later.", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load payload from URL if present
  useEffect(() => {
    if (typeof window !== "undefined" && !payload) {
      const params = new URLSearchParams(window.location.search);
      const data = params.get("data");
      if (data) {
        try {
          const parsed = JSON.parse(decodeURIComponent(data));
          setPayload(parsed);
          setStep("decide");
        } catch (e) {
          // If invalid, stay on scan/init
          setPayload(null);
        }
      }
    }
  }, []);

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
          <div className="w-full max-w-md mx-auto bg-gray-800 p-8 rounded-lg shadow-lg space-y-6 text-center relative">
            {/* Loading animation overlay */}
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60 z-10 rounded-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                <p>Processing...</p>
              </div>
            )}
            {/* Stepper UI */}
            <h2 className="text-2xl font-semibold mb-2">Payment Flow</h2>
            <div className="h-1 w-16 bg-yellow-400 mx-auto rounded mb-6" />
            <div className="flex justify-between items-center mb-6">
              <div className={`flex-1 text-xs ${step === "scan" || step === "init" ? "text-yellow-400" : "text-gray-400"}`}>Scan</div>
              <div className="w-4 h-0.5 bg-gray-600 mx-1" />
              <div className={`flex-1 text-xs ${step === "decide" ? "text-yellow-400" : "text-gray-400"}`}>Choose path</div>
              <div className="w-4 h-0.5 bg-gray-600 mx-1" />
              <div className={`flex-1 text-xs ${step === "confirm" ? "text-yellow-400" : "text-gray-400"}`}>Confirm</div>
              <div className="w-4 h-0.5 bg-gray-600 mx-1" />
              <div className={`flex-1 text-xs ${step === "done" ? "text-yellow-400" : "text-gray-400"}`}>Receipt</div>
            </div>
            {/* ...existing code... */}
            {step === "init" && (
              <Button onClick={() => setStep("scan")} title="Scan to Pay" disabled={isLoading} className="mt-2 bg-[#0e76fe] hover:bg-white text-white hover:text-gray-900 rounded-full" />
            )}
            {step === "decide" && payload && (
              <>
                <p>
                  You’ll pay <strong>{payload?.amount} {payload?.token.toLocaleUpperCase()}</strong> {payload?.description ? (<>for {payload?.description}</>) : ("")}
                </p>
                <Button onClick={onPay} title={`Pay ${payload.amount} ${payload.token.toLocaleUpperCase()}`} disabled={isLoading} className="mt-2 bg-[#0e76fe] hover:bg-white text-white hover:text-gray-900 rounded-full" />
              </>
            )}
            {step === "confirm" && (
              <>
                <p>
                  You’ll pay <strong>{payload?.amount} {payload?.token.toLocaleUpperCase()}</strong> using <strong>{quote} USD</strong> from your wallet.
                  {quote && (
                    <>
                      <br /><span className="text-xs text-yellow-400">(Rate: 1 USD ≈ {(Number(payload?.amount) / Number(quote)).toFixed(2)} {payload?.token.toLocaleUpperCase()})</span>
                    </>
                  )}
                </p>
                <Button onClick={onConfirmSwap} title="Confirm & Pay" disabled={isLoading} className="mt-2 bg-[#0e76fe] hover:bg-white text-white hover:text-gray-900 rounded-full" />
              </>
            )}
            {step === "done" && txHash && (
              <>
                <p>🎉 <span className="text-xl text-yellow-400">Congrats!!!</span> 🎉
                  <br /><br />You paid {quote ? (<>
                    <strong>{quote} USD</strong> (≈ {payload?.amount} {payload?.token.toLocaleUpperCase()})
                  </>
                  ) : (<strong>{payload?.amount} {payload?.token.toLocaleUpperCase()}</strong>)} to the merchant!</p>
                <Button onClick={() => setStep("init")} title="New Payment" disabled={isLoading} className="mt-2 bg-[#0e76fe] hover:bg-white text-white hover:text-gray-900 rounded-full" />
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
