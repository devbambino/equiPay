<!-- ABOUT THE PROJECT -->
## EquiPAY

### Description  
EquiPay is a two‑phase DeFi mini‑app powered by MiniPay and the Mento Protocol on Celo, enabling merchants in Colombia to accept instant QR‑based stablecoin payments (cCOP) and offer zero‑interest Buy‑Now‑Pay‑Later (BNPL) micro‑loans backed by cUSD collateral.

### Problem  
Traditional payment and credit services in Latin America often exclude underbanked populations due to high fees, lack of identity infrastructure, and volatile local currencies . Merchants face lost sales opportunities when customers lack liquidity or credit history.

### Solution  
EquiPay abstracts blockchain complexity behind phone‑number‑based MiniPay flows and smart contracts that manage collateral, lending pools, and repayments. Merchants receive full payment in cCOP instantly, while customers can choose to pay immediately or access a collateralized loan up to 80% of their cUSD balance, with repayments over 1–6 months and interest subsidized by merchants.

## Mission & Impact  
**Mission:** Empower unbanked and underbanked communities in Colombia and beyond with equitable access to payments and micro‑credit, enabling local commerce and financial stability.  
**Impact:**  
- **Inclusion:** Lowers barriers to entry for digital finance with phone‑number onboarding and sub‑cent transaction costs.  
- **Liquidity:** Provides on‑demand liquidity through merchant‑funded BNPL, supporting merchants’ sales while giving customers flexible payment options.  
- **Decentralization:** Leverages collateralized stablecoins and community lending pools, sharing interest revenue with liquidity providers.

## Key Features  
- **Instant QR Payments:** Merchants generate dynamic QR codes; customers pay in cCOP with one scan via MiniPay’s phone‑number resolution and sub‑cent fees.  
- **Zero‑Interest BNPL:** Customers lock cUSD as collateral to borrow up to 80% in cCOP over 1–4 months; merchants absorb a 1%/month interest fee, supporting customer loyalty and sales.  
- **Liquidity Pools:** Lenders deposit cCOP into smart pools via the Mento SDK, earning 90% of merchant‑paid interest, fostering community‑driven finance.

## Tech Stack  
- **Smart Contracts:** Solidity + Hardhat for local development, testing, and deployment.  
- **Security:** OpenZeppelin Contracts for audited ERC‑20 and role‑based components.  
- **Blockchain Interaction:** Celo ContractKit for transaction management and gas estimation.  
- **Stablecoin SDK:** Mento SDK (`@mento-protocol/mento-sdk`) for swap and pool operations.  
- **Frontend:** React + `react-qr-code` for QR generation and MiniPay deeplink flows.  
- **Styling:** Tailwind CSS for rapid, responsive UI development.

## Architecture Diagram  
```
[React Frontend] ←→ [Node.js Backend w/ ContractKit] ←→ [Celo Testnet]
                                  ↓
                         [Smart Contracts]
                        • QR Payment Module
                        • Collateral Loan Module
                        • Liquidity Pool Module
                                  ↑
                [Mento Protocol Core Contracts]
```
The backend uses ContractKit to call custom contracts and Mento core contracts, coordinating payments, loans, and interest distribution.

## Development Roadmap  
Our three‑week plan ensures core functionality first, then advanced features and polish:  
- **Week 1 – QR Payment MVP:** Scaffold app, implement QR generation, and integrate MiniPay deeplinks for cCOP transfers.  
- **Week 2 – Lending Contracts:** Develop and test Solidity contracts for collateral management, BNPL logic, and pool revenue sharing.  
- **Week 3 – BNPL Integration & QA:** Connect frontend to lending API, conduct end‑to‑end tests on Alfajores, refine UI/UX, and prepare demo submission.

## Getting Started  
1. **Clone repository**  
   ```bash
   git clone https://github.com/your-org/equipay.git
   cd equipay
   ```  
2. **Install dependencies**  
   ```bash
   cd packages/react-app
   npm install
   ```  
3. **Configure environment**  
   - Copy `.env.example` to `.env` and set Alfajores RPC, private keys, and Mento SDK keys.  
4. **Run local node & tests**  
   ```bash
   npx hardhat node      # Local blockchain
   npx hardhat test      # Smart contract tests
   ```  
5. **Start frontend**  
   ```bash
   npm run dev           # Starts React app with Tailwind
   ```
6. **Start MiniPay from Localhost**  
   ```bash
   curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc \
  | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null \
  && echo "deb https://ngrok-agent.s3.amazonaws.com buster main" \
  | sudo tee /etc/apt/sources.list.d/ngrok.list \
  && sudo apt update \
  && sudo apt install ngrok

   ngrok config add-authtoken <token>

   ngrok http 3000           # Exposing MiniPay app with ngrok
   ```
   

## License  
Released under the.

## Acknowledgements  
- **Global Stablecoin Hackathon:** \$25 000 prize pool hosted by Mento Labs, and Celo Foundation.  
- Inspiration from the **Mento Protocol** on Celo and the **MiniPay** wallet team.  
- Thank you to all open‑source projects: Hardhat, OpenZeppelin, Celo, Mento SDK, React, and Tailwind CSS.  

Happy building!  