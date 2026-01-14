// Status check script
// Run with: node check-status.js

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking application status...');
console.log('');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ .env.local file exists');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check environment variables
  const checks = [
    { name: 'Supabase URL', pattern: 'NEXT_PUBLIC_SUPABASE_URL=' },
    { name: 'Supabase Key', pattern: 'NEXT_PUBLIC_SUPABASE_ANON_KEY=' },
    { name: 'Contract Address', pattern: 'NEXT_PUBLIC_CONTRACT_ADDRESS=' },
    { name: 'Polygon RPC', pattern: 'NEXT_PUBLIC_POLYGON_RPC_URL=' },
    { name: 'Chain ID', pattern: 'NEXT_PUBLIC_CHAIN_ID=' }
  ];
  
  checks.forEach(check => {
    if (envContent.includes(check.pattern)) {
      console.log(`✅ ${check.name}: Configured`);
    } else {
      console.log(`❌ ${check.name}: Missing`);
    }
  });
  
  // Check contract address specifically
  const contractMatch = envContent.match(/NEXT_PUBLIC_CONTRACT_ADDRESS=(.+)/);
  if (contractMatch) {
    const address = contractMatch[1].trim();
    if (address === '0x0000000000000000000000000000000000000000') {
      console.log('⚠️  Contract Address: Zero address (blockchain features disabled)');
    } else if (address === '0x1111111111111111111111111111111111111111') {
      console.log('⚠️  Contract Address: Mock address (development mode)');
    } else {
      console.log('✅ Contract Address: Configured');
    }
  }
  
} else {
  console.log('❌ .env.local file not found');
}

console.log('');
console.log('📋 Next steps:');
console.log('1. Make sure your development server is running: npm run dev');
console.log('2. Visit http://localhost:3000 to test the application');
console.log('3. Check the browser console for any remaining errors');
console.log('');

// Check if package.json exists
if (fs.existsSync('package.json')) {
  console.log('✅ Project structure: OK');
} else {
  console.log('❌ Project structure: Missing package.json');
}
