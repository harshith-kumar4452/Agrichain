// Environment setup script
// Run with: node setup-env.js

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');

// Read existing .env.local
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

// Check if configuration exists
const hasConfig = envContent.includes('NEXT_PUBLIC_FIREBASE_API_KEY');

if (!hasConfig) {
  console.log('🔧 Initializing .env.local with configuration...');

  const config = `
# Blockchain Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
NEXT_PUBLIC_CHAIN_ID=80001

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAaVJB8vF6n5jWcAx3HHFK2xW-F3KF6FVQ
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=blockchain-17cc5.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://blockchain-17cc5-default-rtdb.asia-southeast1.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=blockchain-17cc5
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=blockchain-17cc5.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=131636394241
NEXT_PUBLIC_FIREBASE_APP_ID=1:131636394241:web:f149dfa297a795473a4300
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-NMTCEDKK2E`;

  fs.writeFileSync(envPath, config);

  console.log('✅ Configuration added to .env.local!');
  console.log('');
  console.log('📋 Next steps:');
  console.log('1. Replace the Firebase keys if you want to use a different project');
  console.log('2. Deploy your smart contract to get a real contract address');
  console.log('3. Restart your development server: npm run dev');
} else {
  console.log('✅ Configuration already exists in .env.local');
}

console.log('');
console.log('🔍 Current configuration status:');
console.log('- Firebase Setup:', hasConfig || envContent.includes('NEXT_PUBLIC_FIREBASE_API_KEY') ? '✅ Configured' : '❌ Missing');
console.log('- Blockchain Address:', envContent.includes('NEXT_PUBLIC_CONTRACT_ADDRESS') ? '✅ Set' : '❌ Missing');
console.log('- RPC URL:', envContent.includes('NEXT_PUBLIC_POLYGON_RPC_URL') ? '✅ Set' : '❌ Missing');
