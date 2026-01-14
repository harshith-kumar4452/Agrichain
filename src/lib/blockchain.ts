import { ethers } from 'ethers'

// Smart Contract ABI for Supply Chain Anchoring
export const SUPPLY_CHAIN_ABI = [
  "function anchorRecord(string memory batchId, string memory hash) public",
  "function getRecord(string memory batchId) public view returns (string memory hash, uint256 timestamp, address sender)",
  "event RecordAnchored(string indexed batchId, string hash, uint256 timestamp, address sender)"
]

// Contract address (will be set after deployment)
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000'

// Initialize provider and signer
export const getProvider = () => {
  const rpcUrl = process.env.NEXT_PUBLIC_POLYGON_RPC_URL || 'https://rpc-mumbai.maticvigil.com'
  return new ethers.JsonRpcProvider(rpcUrl, undefined, { staticNetwork: true })
}

export const getContract = () => {
  if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
    console.warn('⚠️ Contract address not configured. Blockchain features will be disabled.')
    return null
  }
  const provider = getProvider()
  return new ethers.Contract(CONTRACT_ADDRESS, SUPPLY_CHAIN_ABI, provider)
}

// Generate hash for batch data
export const generateBatchHash = (batchData: {
  batchId: string
  cropName: string
  location: string
  harvestDate: string
  quantity: number
  farmerId: string
}) => {
  const dataString = JSON.stringify(batchData)
  return ethers.keccak256(ethers.toUtf8Bytes(dataString))
}

// Generate hash for event data
export const generateEventHash = (eventData: {
  batchId: string
  eventType: string
  actorId: string
  location: string
  timestamp: string
  temperature?: number
  humidity?: number
}) => {
  const dataString = JSON.stringify(eventData)
  return ethers.keccak256(ethers.toUtf8Bytes(dataString))
}

// Anchor record to blockchain (requires wallet connection)
export const anchorRecord = async (
  batchId: string, 
  hash: string, 
  signer: ethers.Signer
) => {
  try {
    if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
      return {
        success: false,
        error: 'Smart contract not deployed. Please deploy the contract first or set NEXT_PUBLIC_CONTRACT_ADDRESS.'
      }
    }
    
    const contract = new ethers.Contract(CONTRACT_ADDRESS, SUPPLY_CHAIN_ABI, signer)
    const tx = await contract.anchorRecord(batchId, hash)
    await tx.wait()
    return {
      success: true,
      txHash: tx.hash,
      blockNumber: tx.blockNumber
    }
  } catch (error) {
    console.error('Error anchoring record:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Get record from blockchain
export const getRecord = async (batchId: string) => {
  try {
    const contract = getContract()
    if (!contract) {
      return {
        success: false,
        error: 'Blockchain features disabled - contract not configured'
      }
    }
    const record = await contract.getRecord(batchId)
    return {
      success: true,
      hash: record[0],
      timestamp: record[1],
      sender: record[2]
    }
  } catch (error) {
    console.error('Error getting record:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
