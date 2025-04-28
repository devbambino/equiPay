# EquiPay

**EquiPay** is a DeFi mini-app built on Celo, MiniPay & Mento that empowers merchants in the Global South to accept instant QR-based stablecoin payments and offer instant digital money to cash withdrawals.

---

## 🚀 Why EquiPay?

- **Inclusive Payments:** No bank account required—customers pay in local stablecoins (cCOP, cKES, cREAL, etc.) via QR.  
- **Automatic Swaps:** Built-in Mento SDK handles background currency conversions, ensuring merchants get paid in their preferred token.  
- **Digital-to-Cash Easy & Quick:** Merchants and customers can withdraw whenever they want their balances to bank accounts or debit cards, quick and easy.

---

## 🏗️ Tech Stack

- **Frontend:** Next.js 15, React 18, Tailwind CSS, `@yudiel/react-qr-scanner`, `qr-code-styling`  
- **Blockchain:** Viem for wallet, Celo Alfajores, Mento SDK for swaps  
- **Contracts:** Solidity + Hardhat for NFT-based MiniPay flows & community pools  
- **Deployment:** Vercel (Next.js) / ngrok for local app testing

---

## 🎯 Features

1. **Merchant Portal** (`/sell`):  
   - Generate dynamic QR codes with `{ merchant, amount, token, allowFallback }` payload.  
2. **Customer App** (`/pay`):  
   - Scan QR → auto-choose best payment path: same token → cUSD fallback → cross-token swap → pay.  
3. **Dashboard** (coming soon):  
   - View transaction history, and BNPL repayments.

---

## 📅 Roadmap

| Phase      |  Milestones                                    |
| ---------- |  --------------------------------------------- |
| Week 1/2   | Launch `/sell` & `/pay` flows, QR integration |
| Week 3     | UI/UX polish, analytics, hackathon demo prep   |

---

## 📖 Getting Started

1. **Clone & Install**  
   ```bash
   git clone https://github.com/your-org/equipay.git
   cd equipay/packages/react-app
   npm install
   ```
2. **Configure**  
   Copy `.env.template` → `.env` with your Alfajores RPC, Mento & stablecoin addresses.  
3. **Run Dev Server**  
   ```bash
   npm run dev
   ```
4. **Test on MiniPay**  
   ```bash
   curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null && echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list && sudo apt update && sudo apt install ngrok
   ngrok config add-authtoken <token>
   ngrok http 3000
   ```
   Open the displayed URL in the MiniPay app.

---

## 📑 License & Acknowledgements

- **License:**   
- **Hackathon:** Global Stablecoin (Mento Labs & Celo Foundation)  
- **Thanks:** Hardhat, OpenZeppelin, Celo, Mento SDK, Tailwind CSS, Next.js.


## 🚀 Acknowledgements  
- **Global Stablecoin Hackathon:** \$25 000 prize pool hosted by Mento Labs, and Celo Foundation.  
- Inspiration from the **Mento Protocol** on Celo and the **MiniPay** wallet team.  
- Thank you to all open‑source projects: Hardhat, OpenZeppelin, Celo, Mento SDK, React, and Tailwind CSS.  