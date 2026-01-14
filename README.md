# 🌾 AgriChain - Blockchain Supply Chain Transparency Platform

A full-stack agricultural supply chain traceability platform built with Next.js 15, React 19, Firebase, and Ethereum/Polygon blockchain integration.

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [User Roles & Demo Accounts](#user-roles--demo-accounts)
- [Firebase Setup](#firebase-setup)
- [Project Structure](#project-structure)

## ✨ Features

- **Role-Based Access Control**: 4 user roles (Farmer, Aggregator, Retailer, Consumer)
- **Batch Creation**: Farmers can create product batches with QR codes
- **QR Code Scanning**: Real-time camera-based QR scanning for trace events
- **Supply Chain Tracking**: Complete event logging from farm to table
- **Blockchain Verification**: Optional Ethereum/Polygon integration for data integrity
- **Firebase Realtime Database**: Live data synchronization
- **Responsive Design**: Mobile-first glassmorphic UI with Tailwind CSS
- **Dashboard Analytics**: Real-time batch monitoring and statistics

## 🛠 Tech Stack

**Frontend:**
- Next.js 15.5.2 (App Router)
- React 19.1.0
- TypeScript 5
- Tailwind CSS 4
- Framer Motion (animations)
- Radix UI (components)

**Backend & Database:**
- Firebase Realtime Database
- Firebase Authentication
- Supabase (alternative/future migration)

**Blockchain:**
- ethers.js 6.15.0
- Polygon Mumbai Testnet
- Solidity Smart Contracts

**QR & Camera:**
- qrcode.react
- qr-scanner
- jsQR

## 📦 Prerequisites

- Node.js 18+ and npm/yarn
- Firebase Account (for Realtime Database)
- Modern browser with camera access (for QR scanning)
- (Optional) Polygon Mumbai testnet wallet for blockchain features

## 🔐 Environment Variables

Create a `.env.local` file in the root directory:

```bash
# ============================================
# BLOCKCHAIN CONFIGURATION (Optional)
# ============================================
# Smart contract address on Polygon Mumbai testnet
# Leave empty or use default address to disable blockchain features
NEXT_PUBLIC_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000

# Polygon Mumbai RPC URL (defaults to public RPC if not set)
NEXT_PUBLIC_POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com

# ============================================
# FIREBASE CONFIGURATION
# ============================================
# Firebase configuration is currently hardcoded in src/lib/firebase.ts
# If you want to use your own Firebase project, update the config in that file
# Project ID: blockchain-17cc5
# Database URL: https://blockchain-17cc5-default-rtdb.asia-southeast1.firebasedatabase.app
```

### Firebase Configuration

The Firebase configuration is currently hardcoded in `src/lib/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyAaVJB8vF6n5jWcAx3HHFK2xW-F3KF6FVQ",
  authDomain: "blockchain-17cc5.firebaseapp.com",
  databaseURL: "https://blockchain-17cc5-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "blockchain-17cc5",
  storageBucket: "blockchain-17cc5.firebasestorage.app",
  messagingSenderId: "131636394241",
  appId: "1:131636394241:web:f149dfa297a795473a4300",
  measurementId: "G-NMTCEDKK2E"
};
```

**To use your own Firebase project:**
1. Create a Firebase project at https://console.firebase.google.com
2. Enable Realtime Database
3. Replace the config in `src/lib/firebase.ts` with your credentials
4. Apply database rules from `database.rules.json` (see [Firebase Setup](#firebase-setup))

## 🚀 Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd blockchain
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create environment file (optional):**
```bash
cp .env.example .env.local
# Edit .env.local with your values
```

## 🏃 Running the Application

**Development Mode:**
```bash
npm run dev
```

**Production Build:**
```bash
npm run build
npm start
```

**Access the application:**
- Local: http://localhost:3000
- Network: http://192.168.x.x:3000

## 👥 User Roles & Demo Accounts

The application has 4 role-based demo accounts:

### 1. 🌾 Farmer
- **Email:** `farmer@example.com`
- **Password:** `farmer123`
- **Access:** Create batches, view dashboard
- **Home Page:** `/farmer`

### 2. 🚚 Aggregator
- **Email:** `aggregator@example.com`
- **Password:** `aggregator123`
- **Access:** Log trace events, view dashboard
- **Home Page:** `/event`

### 3. 🏪 Retailer
- **Email:** `retailer@example.com`
- **Password:** `retailer123`
- **Access:** Log trace events, view dashboard
- **Home Page:** `/event`

### 4. 🔍 Consumer
- **Email:** `consumer@example.com`
- **Password:** `consumer123`
- **Access:** Verify products via QR scanning
- **Home Page:** `/verify`

## 🔥 Firebase Setup

### Step 1: Apply Database Rules

The application requires specific Firebase Realtime Database rules. Apply them via Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/project/blockchain-17cc5/database)
2. Navigate to **Realtime Database** → **Rules** tab
3. Copy the rules from `database.rules.json`:

```json
{
  "rules": {
    ".read": true,
    ".write": true,
    "batches": {
      ".indexOn": ["batch_id", "farmer_id", "status"]
    },
    "trace_events": {
      ".indexOn": ["batch_id", "actor_id", "timestamp"]
    },
    "blockchain_anchors": {
      ".indexOn": ["batch_id", "tx_hash"]
    },
    "users": {
      ".indexOn": ["email"]
    }
  }
}
```

4. Click **Publish**
5. Wait 10-20 seconds for changes to propagate

**Note:** These rules allow public read/write for demo purposes. For production, implement proper authentication rules. See `FIREBASE_RULES_SETUP.md` for production-ready rules.

### Step 2: Verify Database Structure

The app will automatically create these collections:
- `batches` - Product batch information
- `trace_events` - Supply chain event logs
- `blockchain_anchors` - Blockchain verification hashes (optional)
- `users` - User profiles (optional)

## 📁 Project Structure

```
blockchain/
├── contracts/
│   └── SupplyChain.sol           # Smart contract
├── database-schema.sql           # Supabase/PostgreSQL schema
├── database.rules.json           # Firebase database rules
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── auth/                 # Login page
│   │   ├── farmer/               # Batch creation
│   │   ├── event/                # Trace event logging
│   │   ├── verify/               # QR verification (consumer)
│   │   ├── dashboard/            # Admin dashboard
│   │   ├── consumer/[batchId]/   # Public verification page
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Landing page
│   │   └── globals.css           # Global styles
│   ├── components/
│   │   ├── ui/                   # Reusable UI components
│   │   ├── Navbar.tsx            # Role-based navigation
│   │   ├── ProtectedRoute.tsx   # Route guard
│   │   └── [various components]
│   ├── hooks/
│   │   └── useAuth.ts            # Authentication hook
│   └── lib/
│       ├── firebase.ts           # Firebase integration
│       ├── blockchain.ts         # Blockchain integration
│       ├── supabase.ts           # Supabase types
│       └── utils.ts              # Utility functions
├── FIREBASE_RULES_SETUP.md       # Firebase setup guide
├── BLOCKCHAIN_SETUP.md           # Blockchain setup guide
├── DATABASE_SETUP.md             # Database setup guide
└── SCANNER_TROUBLESHOOTING.md   # QR scanner debugging
```

## 🎯 Usage Flow

### 1. Create a Batch (Farmer)
1. Login as farmer
2. Go to `/farmer`
3. Fill in crop details (name, location, harvest date, quantity)
4. Click **Create Batch**
5. Download/share the generated QR code

### 2. Log Trace Event (Aggregator/Retailer)
1. Login as aggregator or retailer
2. Go to `/event`
3. Click **Start Scanning**
4. Scan the product QR code
5. Fill in event details:
   - Event type (Transport/Processing/Storage/Retail)
   - Location (required)
   - Temperature (optional)
   - Humidity (optional)
   - Notes (optional)
6. Click **Log Event**

### 3. View Dashboard
1. Login (any role except consumer)
2. Go to `/dashboard`
3. View all batches with statistics
4. Click on a batch to see detailed timeline

### 4. Verify Product (Consumer)
1. Login as consumer
2. Go to `/verify`
3. Scan QR code or enter batch ID
4. View complete supply chain history
5. Check blockchain verification (if enabled)

## 🔧 Development Notes

### Key Features

- **No Firebase Indexes Required**: All queries work client-side filtering
- **Optional Blockchain**: App works without blockchain configuration
- **Camera Permissions**: Requires HTTPS or localhost for camera access
- **QR Code Format**: `{origin}/consumer/{batchId}`

### Common Issues

**Camera not working:**
- Ensure HTTPS or localhost
- Check browser permissions
- See `SCANNER_TROUBLESHOOTING.md`

**Batch not found after scanning:**
- Check Firebase rules are applied
- Verify database connection
- Check browser console for errors

**Undefined values error:**
- Temperature/humidity are optional
- Leave empty if not applicable
- Fixed in latest version

## 📝 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

## 🔐 Security Notes

**Current Setup (Demo):**
- Public Firebase read/write access
- Hardcoded Firebase credentials
- Demo accounts with fixed passwords
- No real authentication

**For Production:**
- Enable Firebase Authentication
- Implement Row Level Security
- Use environment variables for all secrets
- Enable proper authentication rules
- Deploy smart contracts to mainnet
- Implement rate limiting

## 📄 License

This is a demo/educational project. Modify and use as needed.

## 🤝 Contributing

This project is part of a demonstration. For contributions or issues, please contact the maintainer.

## 🆘 Support & Documentation

- **Firebase Setup**: See `FIREBASE_RULES_SETUP.md`
- **Blockchain Setup**: See `BLOCKCHAIN_SETUP.md`
- **Database Schema**: See `DATABASE_SETUP.md` & `database-schema.sql`
- **QR Scanner Issues**: See `SCANNER_TROUBLESHOOTING.md`

---

**Built with ❤️ using Next.js, React, Firebase, and Blockchain Technology**
