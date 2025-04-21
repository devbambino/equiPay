"use client";

/* eslint-disable react-hooks/exhaustive-deps */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWeb3 } from "@/contexts/useWeb3";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
    const {
        address,
        getUserAddress,
        sendCUSD,
        mintMinipayNFT,
        getNFTs,
        signTransaction,
    } = useWeb3();

    const [cUSDLoading, setCUSDLoading] = useState(false);
    const [nftLoading, setNFTLoading] = useState(false);
    const [signingLoading, setSigningLoading] = useState(false);
    const [userOwnedNFTs, setUserOwnedNFTs] = useState<string[]>([]);
    const [tx, setTx] = useState<any>(undefined);
    const [amountToSend, setAmountToSend] = useState<string>("0.1");
    const [messageSigned, setMessageSigned] = useState<boolean>(false); // State to track if a message was signed


    useEffect(() => {
        getUserAddress();
    }, []);

    useEffect(() => {
        const getData = async () => {
            const tokenURIs = await getNFTs();
            setUserOwnedNFTs(tokenURIs);
        };
        if (address) {
            getData();
        }
    }, [address]);

    async function sendingCUSD() {
        if (address) {
            setSigningLoading(true);
            try {
                const tx = await sendCUSD(address, amountToSend);
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


    async function mintNFT() {
        setNFTLoading(true);
        try {
            const tx = await mintMinipayNFT();
            const tokenURIs = await getNFTs();
            setUserOwnedNFTs(tokenURIs);
            setTx(tx);
        } catch (error) {
            console.log(error);
        } finally {
            setNFTLoading(false);
        }
    }



    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <header className="flex items-center justify-between px-8 py-6">
                {/* Logo Concept #3 */}
                <div className="flex items-center space-x-3">
                    <svg width="48" height="48" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                        <rect y="32" width="64" height="32" fill="#2C57E4" />
                        <rect x="0" y="0" width="64" height="32" rx="32" fill="#FFD166" />
                    </svg>
                    <span className="text-2xl font-bold">EquiPay</span>
                </div>
                <nav className="space-x-6">
                    <a href="#features" className="hover:text-sun-gold">Features</a>
                    <a href="#about" className="hover:text-sun-gold">About</a>
                    <a href="/qr-payment" className="hover:text-sun-gold">QR Pay</a>
                    <a href="#get-started" className="px-4 py-2 bg-sun-gold text-gray-900 rounded-full font-semibold hover:bg-yellow-400">Get Started</a>
                </nav>
            </header>

            {/* Hero Section */}
            <section className="text-center py-20 px-6">
                <h1 className="text-5xl font-extrabold mb-4">Equal access. Empowered lives.</h1>
                <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
                    EquiPay brings low-cost, transparent payments and Buy Now Pay Later financing to merchants and customers in Latin America.
                </p>
                <a href="#get-started" className="px-8 py-4 bg-sun-gold text-gray-900 rounded-full text-lg font-semibold hover:bg-yellow-400">
                    Launch the App
                </a>
            </section>

            {/* Features Section */}
            <section id="features" className="py-16 px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
                    <h3 className="text-2xl font-bold mb-2">Instant QR Payments</h3>
                    <p className="text-gray-300">
                        Merchants generate dynamic QR codes. Customers pay in cCOP or apply for merchant-funded, zero-interest BNPL with one scan.
                    </p>
                </div>
                <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
                    <h3 className="text-2xl font-bold mb-2">Collateralized Micro-Loans</h3>
                    <p className="text-gray-300">
                        Customers lock cUSD as collateral to access up to 80% of their balance in cCOP. Monthly repayments with merchant-paid interest.
                    </p>
                </div>
                <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
                    <h3 className="text-2xl font-bold mb-2">Inclusive Financial Access</h3>
                    <p className="text-gray-300">
                        Empower unbanked and underbanked communities in Colombia with easy-to-use, transparent DeFi tools.
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="text-center py-8 text-gray-500 text-sm">
                © 2025 EquiPay. All rights reserved.
            </footer>
        </div>
    );
}
