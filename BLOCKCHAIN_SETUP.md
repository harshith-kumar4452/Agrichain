# Blockchain Setup Guide

## The Problem
You're getting this ENS error:
```
an ENS name used for a contract target must be correctly configured (value="", code=UNCONFIGURED_NAME, version=6.15.0)
```

This happens because the smart contract address is not configured in your environment variables.

## Solution

### Option 1: Deploy Your Own Contract (Recommended)

1. **Install Hardhat** (if not already installed):
   ```bash
   npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
   ```

2. **Initialize Hardhat**:
   ```bash
   npx hardhat init
   ```

3. **Deploy the contract** to Polygon Mumbai testnet:
   ```bash
   npx hardhat run scripts/deploy.js --network mumbai
   ```

4. **Update your `.env.local`** with the deployed contract address:
   ```env
   NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedContractAddress
   NEXT_PUBLIC_POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
   NEXT_PUBLIC_CHAIN_ID=80001
   ```

### Option 2: Use a Pre-deployed Contract

Add these environment variables to your `.env.local` file:

```env
# Add these lines to your .env.local file
NEXT_PUBLIC_POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
NEXT_PUBLIC_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_CHAIN_ID=80001
```

**Note**: The zero address will show an error message instead of the ENS error, making it clearer what needs to be configured.

### Option 3: Disable Blockchain Features (Temporary)

If you want to test the app without blockchain features, the app will now show a clear error message instead of the ENS error.

## Environment Variables

Your `.env.local` should look like this:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://pxxyeefekbuhocfqceat.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Blockchain Configuration
NEXT_PUBLIC_POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddress
NEXT_PUBLIC_CHAIN_ID=80001
```

## Testing

After setting up the environment variables:

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Test the blockchain functionality** by creating a batch in the farmer page

3. **Check the browser console** for any remaining errors

## Troubleshooting

- **ENS Error**: Make sure `NEXT_PUBLIC_CONTRACT_ADDRESS` is set to a valid contract address
- **Network Error**: Verify `NEXT_PUBLIC_POLYGON_RPC_URL` is correct
- **Contract Not Found**: Ensure the contract is deployed and the address is correct

## Next Steps

1. Set up the environment variables
2. Deploy your smart contract (or use a pre-deployed one)
3. Test the blockchain functionality
4. The ENS error should be resolved
