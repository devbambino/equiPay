
# EquiPay

> **Empowering the Global South with instant QR/URL payments in cKES, cREAL, PUSO, and more!!!**  
> EquiPay is A Celo-powered DeFi mini-app for instant, low-cost, cashless payments in the Global South (LATAM, Africa, and Southeast Asia). EquiPay empowers merchants in the Global South to accept instant QR-based and URL-based stablecoin payments and offer instant digital money to cash withdrawals.

---

## 🌟 Problem

**EquiPay** solves two critical pain points in emerging markets:

1. **Limited Payment/Banking Options**  
   +1.4 billion adults are un(der)banked, concentrated in LATAM, Sub-Saharan Africa, and Southeast Asia. They are excluded due to high fees, lack of identity infrastructure, and volatile local currencies.
2. **Hidden Fees & Slow Transfers**  
   Cross-border remittance costs average 6%, twice the UN Sustainable Development target. In addition, freelancers and small businesses coould lock in exchange rates and receive funds instantly in local stablecoins (e.g. cKES, cREAL, etc) or cUSD.  

---

## 🚀 Solution

- **Instant QR/URL-Based Checkout**  
  Scan a dynamically generated QR code or click payment URL → check payment details → confirm → done. The recipient gets either local stablecoins or cUSD, depending on the specifications set during the QR/URL generation.

- **Automated On-Chain Swaps**  
  Seamless swapping between cUSD and Mento local stablecoins. Built on Mento’s AMM: optimal rates, fully collateralized, programmable smart contracts.

- **Multi-Rail Cash-Out**  
  Thanks to MiniPay withdrawl feature, convert cKES → KES via M-PESA; cREAL → BRL or PUSO → PHP via card.

- **Modular & Extensible**  
  Next.js + Tailwind UI; Viem wallet integration; fully mobile friendly.

By combining **Celo**, **Mento**, and **MiniPay**, EquiPay delivers near-zero fees, sub-5-second settlements, and seamless on-ramp/off-ramp via local rails.

---

## 🎯 Key Features

1. **Merchant Portal** (`/sell`):  
   - Generate dynamic QR codes and URL links with `{ merchant, amount, description, token, allowFallback }` payload.  

2. **Customer App** (`/pay`):  
   - Scan QR or click url → auto-choose best payment path: same token → cUSD fallback → cross-token swap → pay.  

3. **Dashboard** (`/manage`):  
   - View balances and prepare swap local stablecoins to cUSD.

---


## 📦 Tech Stack

| Layer           | Technology                          |
| --------------- | ----------------------------------- |
| **Frontend**    | Next.js, React, Tailwind CSS        |
| **Blockchain**  | Celo Alfajores, Mento Protocol SDK  |
| **Wallet**      | MiniPay (Web and Android/iOS Wallet)|
| **Deployment**  | Vercel (Frontend)                   |

---

## 🎬 Demo Video

Watch how EquiPay powers real-world flows across markets in the Global South:

- **Kenya (cKES):** QR-based street market payments  

[▶️ View Demo on YouTube](https://youtu.be/tGmzq9yaXTo)

---

## 🔧 Getting Started

0. **Running the production app**
   Open the `https://equipay-puce.vercel.app` url in the MiniPay app. Click "Developer settings", then "Load test page", and enter the `https://equipay-puce.vercel.app/` EquiPay url in the MiniPay app, and start transacting!

   You will need testnet Celo and cUSD, besides Mento local stablecoins. Please, get them in the Celo faucet or get USDC from `https://faucet.circle.com/` and then swap them for the corresponding tokens in `https://app.mento.org/` in the Alfajores testnet.

1. **Clone the repo**  
   ```bash
   git clone https://github.com/devbambino/equipay.git
   cd equipay
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cd packages/react-app
   npm run dev
   ```
   Copy `.env.template` → `.env` inside `packages/react-app` with your Alfajores RPC, your Wallet connect keys, Mento & stablecoin addresses.

4. **Run the dev server**

   ```bash
   cd packages/react-app
   npm run dev
   ```

5. **Open in MiniPay app**
   ```bash
   curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null && echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list && sudo apt update && sudo apt install ngrok
   ngrok config add-authtoken <token>
   ngrok http 3000
   ```
   Open the displayed URL in the MiniPay app. Click "Developer settings", then "Load test page", and enter the `http://ngrok-url.com` ngrok url in the MiniPay app, and start transacting!

---

## 📞 Contact & Team

**Fredy aka Dev Bambino**
– Tech entrepreneur and Fullstack AI/Blockchain dev
– USA | ✉️ [devbambinoacc@gmail.com](mailto:devbambinoacc@gmail.com)

---

## 🚀 Acknowledgements  
- **Global Stablecoin Hackathon:** \$25 000 prize pool hosted by Mento Labs, and Celo Foundation.  
- Inspiration from the **Mento Protocol** on Celo and the **MiniPay** wallet team.  
- Thank you to all open‑source projects: Hardhat, OpenZeppelin, Celo, Mento SDK, React, and Tailwind CSS. 
