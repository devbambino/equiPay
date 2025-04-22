"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { QRCodeGenerator } from "@/components/QRCodeGenerator";
import { useWeb3 } from "@/contexts/useWeb3";

export default function QRPaymentPage() {
    const {
        address,
        getUserAddress,
        sendCUSD,
        sendCOP,
        signTransaction,
    } = useWeb3();

    const [amount, setAmount] = useState("");

    const [cUSDLoading, setCUSDLoading] = useState(false);
    const [signingLoading, setSigningLoading] = useState(false);
    const [tx, setTx] = useState<any>(undefined);
    const [amountToSend, setAmountToSend] = useState<string>("0.1");
    const [messageSigned, setMessageSigned] = useState<boolean>(false); // State to track if a message was signed


    const merchant = process.env.NEXT_PUBLIC_MERCHANT_ADDRESS!;


    useEffect(() => {
        getUserAddress();
    }, []);

    async function sendingCUSD() {
        if (address) {
            setSigningLoading(true);
            try {
                const tx = await sendCUSD(merchant, amountToSend);
                setTx(tx);
            } catch (error) {
                console.log(error);
            } finally {
                setSigningLoading(false);
            }
        }
    }

    async function sendingCOP() {
        if (address) {
            setSigningLoading(true);
            try {
                const tx = await sendCOP(merchant, amountToSend);
                setTx(tx);
            } catch (error) {
                console.log(error);
            } finally {
                setSigningLoading(false);
            }
        }
    }

    async function signMessage() {
        setCUSDLoading(true);
        try {
            await signTransaction();
            setMessageSigned(true);
        } catch (error) {
            console.log(error);
        } finally {
            setCUSDLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-12">
            <h1 className="text-4xl font-bold mb-6">Generate USDC QR Code</h1>
            <div className="w-full max-w-xs">
                <Input
                    type="number"
                    placeholder="Amount in USDC"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mb-4"
                />
                <Button
                    title={`Send ${amount} USDC to this merchant`}
                    onClick={() => {/* no-op; QR updates automatically */ }}
                    disabled={!amount}
                    widthFull
                >
                    Preview QR
                </Button>
            </div>
            {amount && (
                <div className="mt-8">
                    <QRCodeGenerator amount={amount} tokenType={1} />
                </div>
            )}

            <h1 className="text-4xl font-bold mb-6">Generate cUSD QR Code</h1>
            <div className="w-full max-w-xs">
                <Input
                    type="number"
                    placeholder="Amount in cUSD"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mb-4"
                />
                <Button
                    title={`Send ${amount} cUSD to this merchant`}
                    onClick={() => {/* no-op; QR updates automatically */ }}
                    disabled={!amount}
                    widthFull
                >
                    Preview QR
                </Button>
            </div>
            {amount && (
                <div className="mt-8">
                    <QRCodeGenerator amount={amount} tokenType={0}/>
                </div>
            )}

            {address && (
                <>
                    <div className="h2 text-center">
                        Your address:{" "}
                        <span className="font-bold text-sm">{address}</span>
                    </div>
                    {tx && (
                        <p className="font-bold mt-4">
                            Tx Completed:{" "}
                            <a
                                href={`https://alfajores.celoscan.io/tx/${tx.transactionHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline"
                            >
                                {tx.transactionHash.substring(0, 6)}...{tx.transactionHash.substring(tx.transactionHash.length - 6)}
                            </a>
                        </p>
                    )}
                    <div className="w-full px-3 mt-7">
                        <Input
                            type="number"
                            value={amountToSend}
                            onChange={(e) => setAmountToSend(e.target.value)}
                            placeholder="Enter amount to send"
                            className="border rounded-md px-3 py-2 w-full mb-3"
                        ></Input>
                        <Button
                            loading={signingLoading}
                            onClick={sendingCUSD}
                            title={`Send ${amountToSend} cUSD to the merchant`}
                            widthFull
                        />
                        <Button
                            loading={signingLoading}
                            onClick={sendingCOP}
                            title={`Send ${amountToSend} cCOP to the merchant`}
                            widthFull
                        />
                    </div>

                    <div className="w-full px-3 mt-6">
                        <Button
                            loading={cUSDLoading}
                            onClick={signMessage}
                            title="Sign a Message"
                            widthFull
                        />
                    </div>

                    {messageSigned && (
                        <div className="mt-5 text-green-600 font-bold">
                            Message signed successfully!
                        </div>
                    )}


                </>
            )}
        </div>
    );
}
