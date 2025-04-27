"use client";

/* eslint-disable react-hooks/exhaustive-deps */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { methodsWeb3 } from "@/contexts/methodsWeb3";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
 
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center px-4 sm:px-8">
            {/* Hero Section */}
            <section className="w-full max-w-[640px] py-20 px-4 sm:px-0 text-center">
                <h1 className="text-5xl font-extrabold mb-4">Equal access. Empowered lives.</h1>
                <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
                    EquiPay brings low-cost, transparent payments and Buy Now Pay Later financing to merchants and customers in Latin America.
                </p>
                <a href="#get-started" className="px-8 py-4 bg-yellow-400 hover:bg-white text-gray-900 rounded-full text-lg font-semibold">
                    Launch the App
                </a>
            </section>

            {/* Features Section */}
            <section id="features" className="py-16 px-4 sm:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
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
        </div>
    );
}
