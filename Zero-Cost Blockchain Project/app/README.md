<div align="center">

# 🔐 SkillChain

### Blockchain-Powered Credential Verification Platform

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-7.2.4-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Ethereum-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethereum" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4.19-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/tRPC-11.8.1-2596BE?style=for-the-badge&logo=trpc&logoColor=white" alt="tRPC" />
  <img src="https://img.shields.io/badge/Drizzle_ORM-0.45.1-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black" alt="Drizzle" />
  <img src="https://img.shields.io/badge/MetaMask-F6851B?style=for-the-badge&logo=metamask&logoColor=white" alt="MetaMask" />
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-project-structure">Structure</a> •
  <a href="#-api-documentation">API</a> •
  <a href="#-deployment">Deployment</a>
</p>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="1000">

</div>

---

## 🌟 Overview

**SkillChain** is a revolutionary blockchain-powered platform that transforms how credentials are issued, verified, and managed. Built on Ethereum, it provides a **zero-cost**, **tamper-proof**, and **instantly verifiable** solution for skill-based credentials.

<div align="center">

### 🎯 Why SkillChain?

| Traditional Systems | SkillChain |
|:---:|:---:|
| ⏳ Weeks to verify | ⚡ Instant verification |
| 🔓 Centralized & vulnerable | 🔐 Decentralized & secure |
| 💰 High verification costs | 🆓 Zero infrastructure cost |
| 📄 Prone to forgery | 🛡️ Cryptographically secure |

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🔐 **Non-Custodial Security**
- Full ownership with blockchain-grade encryption
- Your credentials, your keys
- No intermediaries required

### ⚡ **Instant Verification**
- Verify credentials in seconds
- QR code or Token ID lookup
- Real-time blockchain validation

### 🌍 **Global Recognition**
- Accepted worldwide
- Portable across platforms
- Cross-border compatibility

</td>
<td width="50%">

### 💎 **NFT-Based Credentials**
- Each credential is a unique NFT
- Immutable on-chain storage
- IPFS metadata hosting

### 🎨 **Beautiful UI/UX**
- Modern glassmorphism design
- Smooth animations with Framer Motion
- Fully responsive interface

### 🔄 **Real-Time Updates**
- Live credential tracking
- Activity feed
- Dashboard analytics

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

<div align="center">

### Frontend
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4.19-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.40.0-0055FF?style=flat-square&logo=framer&logoColor=white)

### Backend
![Hono](https://img.shields.io/badge/Hono-4.8.3-E36002?style=flat-square&logo=hono&logoColor=white)
![tRPC](https://img.shields.io/badge/tRPC-11.8.1-2596BE?style=flat-square&logo=trpc&logoColor=white)
![Drizzle ORM](https://img.shields.io/badge/Drizzle-0.45.1-C5F74F?style=flat-square&logo=drizzle&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white)

### Blockchain
![Ethereum](https://img.shields.io/badge/Ethereum-Mainnet-3C3C3D?style=flat-square&logo=ethereum&logoColor=white)
![Ethers.js](https://img.shields.io/badge/Ethers.js-6.16.0-2535A0?style=flat-square&logo=ethereum&logoColor=white)
![MetaMask](https://img.shields.io/badge/MetaMask-SDK-F6851B?style=flat-square&logo=metamask&logoColor=white)
![Alchemy](https://img.shields.io/badge/Alchemy-SDK-363FF9?style=flat-square&logo=alchemy&logoColor=white)

### Storage & Auth
![IPFS](https://img.shields.io/badge/IPFS-Pinata-65C2CB?style=flat-square&logo=ipfs&logoColor=white)
![AWS S3](https://img.shields.io/badge/AWS_S3-Storage-FF9900?style=flat-square&logo=amazon-aws&logoColor=white)
![Google OAuth](https://img.shields.io/badge/Google-OAuth-4285F4?style=flat-square&logo=google&logoColor=white)

</div>

---

## 🚀 Getting Started

### Prerequisites

```bash
Node.js >= 18.0.0
npm >= 9.0.0
MetaMask Browser Extension
MySQL Database
```

### Installation

1️⃣ **Clone the repository**
```bash
git clone https://github.com/yourusername/skillchain.git
cd skillchain/app
```

2️⃣ **Install dependencies**
```bash
npm install
```

3️⃣ **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# Backend
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Database
DATABASE_URL=mysql://user:password@host:3306/database

# Frontend (Vite)
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Pinata IPFS
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_KEY=your_pinata_secret_key
VITE_PINATA_JWT=your_pinata_jwt

# Admin
OWNER_UNION_ID=your_admin_id
```

4️⃣ **Set up the database**
```bash
npm run db:push
```

5️⃣ **Start the development server**
```bash
npm run dev
```

🎉 **Open your browser at** `http://localhost:3002`

---

## 📁 Project Structure

```
skillchain/
├── 📂 api/                    # Backend API
│   ├── google/               # Google OAuth integration
│   ├── lib/                  # Utility libraries
│   ├── queries/              # Database queries
│   ├── boot.ts               # Server entry point
│   ├── context.ts            # tRPC context
│   └── router.ts             # API routes
│
├── 📂 contracts/              # Smart Contracts
│   ├── abi/                  # Contract ABIs
│   ├── src/                  # Solidity contracts
│   ├── constants.ts          # Contract addresses
│   └── types.ts              # TypeScript types
│
├── 📂 db/                     # Database
│   ├── migrations/           # DB migrations
│   ├── schema.ts             # Drizzle schema
│   └── relations.ts          # Table relations
│
├── 📂 src/                    # Frontend
│   ├── components/           # React components
│   │   ├── layout/          # Layout components
│   │   └── ui/              # UI components (shadcn)
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities
│   ├── pages/               # Page components
│   ├── providers/           # Context providers
│   └── App.tsx              # Main app component
│
├── 📄 vite.config.ts         # Vite configuration
├── 📄 tailwind.config.js     # Tailwind configuration
├── 📄 drizzle.config.ts      # Drizzle ORM config
└── 📄 package.json           # Dependencies
```

---

## 🎯 Key Features Breakdown

### 🔐 Credential Issuance
```typescript
// Issue a new credential NFT
1. Upload credential image to IPFS (Pinata)
2. Generate metadata JSON
3. Mint NFT on Ethereum blockchain
4. Store credential details in database
5. Generate QR code for verification
```

### ✅ Credential Verification
```typescript
// Verify a credential
1. Scan QR code or enter Token ID
2. Fetch on-chain data from blockchain
3. Retrieve metadata from IPFS
4. Display credential details
5. Show verification status
```

### 📊 Dashboard Analytics
- Total credentials issued
- Verification statistics
- Recent activity feed
- Credential management

---

## 🔌 API Documentation

### tRPC Endpoints

#### **Credentials**
```typescript
// Get all credentials
credential.getAll()

// Get credential by ID
credential.getById({ id: number })

// Get credential statistics
credential.getStats()

// Issue new credential
credential.issue({ 
  recipientName: string,
  skillName: string,
  description: string,
  imageUrl: string
})
```

#### **Users**
```typescript
// Get current user
user.getCurrent()

// Get user activity
user.getActivity()
```

#### **Authentication**
```typescript
// Google OAuth login
auth.login()

// Logout
auth.logout()
```

---

## 🎨 UI Components

Built with **shadcn/ui** and **Radix UI**:

- ✅ Accordion
- ✅ Alert Dialog
- ✅ Avatar
- ✅ Badge
- ✅ Button
- ✅ Card
- ✅ Dialog
- ✅ Dropdown Menu
- ✅ Form
- ✅ Input
- ✅ Label
- ✅ Select
- ✅ Tabs
- ✅ Toast
- ✅ Tooltip
- And 40+ more...

---

## 🧪 Testing

```bash
# Run tests
npm run test

# Type checking
npm run check

# Linting
npm run lint

# Format code
npm run format
```

---

## 🏗️ Build & Deployment

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm run start
```

### Preview Build
```bash
npm run preview
```

---

## 🌐 Deployment Options

<table>
<tr>
<td width="33%">

### Vercel
```bash
vercel deploy
```
✅ Zero config
✅ Auto SSL
✅ Global CDN

</td>
<td width="33%">

### Netlify
```bash
netlify deploy
```
✅ Continuous deployment
✅ Form handling
✅ Serverless functions

</td>
<td width="33%">

### AWS
See [`AWS_DEPLOYMENT.md`](./AWS_DEPLOYMENT.md) for the ECS Fargate + RDS setup.
✅ Full control
✅ Scalable
✅ Enterprise-ready

</td>
</tr>
</table>

---

## 🔒 Smart Contract

### SkillChainCredential.sol
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SkillChainCredential {
    // NFT-based credential issuance
    // Immutable on-chain storage
    // Verifiable credential metadata
}
```

**Contract Features:**
- ✅ ERC-721 compliant
- ✅ Metadata URI support
- ✅ Transfer restrictions
- ✅ Revocation mechanism

---

## 📊 Database Schema

```sql
-- Users table
users (
  id, email, name, wallet_address, created_at
)

-- Credentials table
credentials (
  id, token_id, recipient_name, skill_name,
  description, image_url, metadata_uri,
  issuer_id, created_at
)

-- Activity table
activity (
  id, user_id, action, credential_id, timestamp
)
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. 🍴 Fork the repository
2. 🌿 Create a feature branch (`git checkout -b feature/amazing-feature`)
3. 💾 Commit your changes (`git commit -m 'Add amazing feature'`)
4. 📤 Push to the branch (`git push origin feature/amazing-feature`)
5. 🎉 Open a Pull Request

---

## 📝 Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run check` | TypeScript type checking |
| `npm run test` | Run tests |
| `npm run db:generate` | Generate DB migrations |
| `npm run db:migrate` | Run DB migrations |
| `npm run db:push` | Push schema to database |

---

## 🐛 Troubleshooting

<details>
<summary><b>MetaMask connection issues</b></summary>

- Ensure MetaMask is installed
- Check you're on the correct network
- Clear browser cache and reload
</details>

<details>
<summary><b>Database connection errors</b></summary>

- Verify DATABASE_URL in .env
- Check MySQL server is running
- Ensure database exists
</details>

<details>
<summary><b>IPFS upload failures</b></summary>

- Verify Pinata API credentials
- Check file size limits
- Ensure stable internet connection
</details>

---

## 📚 Resources

- 📖 [Documentation](https://docs.skillchain.io)
- 🎓 [Tutorials](https://tutorials.skillchain.io)
- 💬 [Discord Community](https://discord.gg/skillchain)
- 🐦 [Twitter](https://twitter.com/skillchain)
- 📧 [Email Support](mailto:support@skillchain.io)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Ethereum Foundation** - Blockchain infrastructure
- **Pinata** - IPFS storage
- **Alchemy** - Blockchain API
- **Vercel** - Hosting platform
- **shadcn/ui** - UI components
- **Radix UI** - Accessible components

---

<div align="center">

### 🌟 Star this repo if you find it useful!

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="1000">

**Made with ❤️ by the SkillChain Team**

[Website](https://skillchain.io) • [Documentation](https://docs.skillchain.io) • [Twitter](https://twitter.com/skillchain) • [Discord](https://discord.gg/skillchain)

</div>
