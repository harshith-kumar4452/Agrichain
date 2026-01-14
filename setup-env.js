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

// Check if blockchain variables exist
const hasBlockchainConfig = envContent.includes('NEXT_PUBLIC_CONTRACT_ADDRESS');

if (!hasBlockchainConfig) {
  console.log('🔧 Adding blockchain configuration to .env.local...');
  
  const blockchainConfig = `

# Blockchain Configuration
NEXT_PUBLIC_POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
NEXT_PUBLIC_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_CHAIN_ID=80001`;

  const newContent = envContent.trim() + blockchainConfig;
  
  fs.writeFileSync(envPath, newContent);
  
  console.log('✅ Blockchain configuration added!');
  console.log('');
  console.log('📋 Next steps:');
  console.log('1. Deploy your smart contract to get a real contract address');
  console.log('2. Replace 0x0000000000000000000000000000000000000000 with your deployed contract address');
  console.log('3. Restart your development server: npm run dev');
} else {
  console.log('✅ Blockchain configuration already exists in .env.local');
}

console.log('');
console.log('🔍 Current environment variables:');
console.log('- NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
console.log('- NEXT_PUBLIC_CONTRACT_ADDRESS:', process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ? '✅ Set' : '❌ Missing');
console.log('- NEXT_PUBLIC_POLYGON_RPC_URL:', process.env.NEXT_PUBLIC_POLYGON_RPC_URL ? '✅ Set' : '❌ Missing');
