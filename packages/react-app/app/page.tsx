"use client";

import { Button } from "@/components/ui/button";
import { QrCodeIcon, ArrowsRightLeftIcon, BanknotesIcon } from "@heroicons/react/24/solid";
import Image from "next/image";

export default function Home() {
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            {/* Hero */}
            <section className="flex flex-col items-center text-center px-4 py-20 sm:py-32">
                <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight max-w-2xl">
                    Equal access. Empowered commerce.
                </h1>
                <p className="mt-4 text-lg sm:text-xl text-gray-300 max-w-xl">
                    EquiPay delivers sub-cent, local-currency QR payments powered by MiniPay & Mento—no bank account required.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <Button
                        onClick={() => window.location.href = "/sell"}
                        className="px-8 py-4 bg-yellow-400 hover:bg-white text-gray-900 rounded-full text-lg font-semibold"
                        title="Request Payment"
                    />
                    <Button
                        onClick={() => window.location.href = "/pay"}
                        variant="default"
                        className="px-8 py-4 bg-[#0e76fe] hover:bg-white text-white hover:text-gray-900 rounded-full text-lg font-semibold"
                        title="Scan to Pay"
                    />
                </div>
                {/* Hero Image */}
                <div className="mt-12 w-full max-w-2xl">
                    <Image
                        src="/hero-illustration.jpg"
                        alt="EquiPay illustration"
                        width={587}
                        height={400}
                        className="mx-auto"
                    />
                </div>
            </section>

            {/* Features */}
            <section id="features" className="bg-gray-800 py-16 px-4 sm:px-8">
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-6 bg-gray-700 rounded-2xl text-center">
                        <QrCodeIcon className="mx-auto h-12 w-12 text-yellow-400 mb-4" />
                        <h3 className="text-2xl font-bold mb-2">Instant QR Checkout</h3>
                        <p className="text-gray-300">
                            Generate payment QR codes in your local currency with customers paying in a single tap.
                        </p>
                    </div>
                    <div className="p-6 bg-gray-700 rounded-2xl text-center">
                        <ArrowsRightLeftIcon className="mx-auto h-12 w-12 text-yellow-400 mb-4" />
                        <h3 className="text-2xl font-bold mb-2">Automatic Currency Swap</h3>
                        <p className="text-gray-300">
                            We handle background swaps via Mento SDK, so you always get paid in your chosen currency.
                        </p>
                    </div>
                    <div className="p-6 bg-gray-700 rounded-2xl text-center">
                        <BanknotesIcon className="mx-auto h-12 w-12 text-yellow-400 mb-4" />
                        <h3 className="text-2xl font-bold mb-2">Digital-to-Cash Easy & Quick</h3>
                        <p className="text-gray-300">
                            Withdraw whenever you want your wallet balance to your bank account or debit card quick and easy.
                        </p>
                    </div>
                </div>
            </section>

            {/* Social Proof */}
            <section className="py-12 px-4 sm:px-8 text-center">
                <p className="text-gray-400 uppercase tracking-wide mb-6">
                    Trusted by emerging-market merchants everywhere
                </p>
                <div className="flex flex-wrap justify-center items-center gap-6">
                    {/* Replace with real logos */}
                    {["logo1.png", "logo2.png", "logo3.png", "logo4.png"].map((logo) => (
                        <Image key={logo} src={`/partners/${logo}`} alt="Partner logo" width={100} height={40} />
                    ))}
                </div>
            </section>

            {/* FAQ */}
            <section className="bg-gray-800 py-16 px-4 sm:px-8">
                <div className="max-w-3xl mx-auto space-y-8">
                    <h2 className="text-3xl font-bold text-center">Frequently Asked Questions</h2>
                    <div>
                        <h3 className="font-semibold">Do I need a bank account?</h3>
                        <p className="text-gray-300">No, EquiPay runs entirely on stablecoins and Mento swaps—no bank needed. </p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Which currencies are supported?</h3>
                        <p className="text-gray-300">
                            Accept payments in cCOP, cKES, cREAL (and more)—we auto-swap your balance as needed.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
