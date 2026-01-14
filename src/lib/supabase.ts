import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Batch {
  id: string
  batch_id: string
  farmer_id: string
  crop_name: string
  location: string
  harvest_date: string
  quantity: number
  unit: string
  qr_code: string
  ipfs_hash?: string
  blockchain_tx_hash?: string
  status: 'active' | 'recalled' | 'completed'
  created_at: string
  updated_at: string
}

export interface TraceEvent {
  id: string
  batch_id: string
  event_type: 'harvest' | 'transport' | 'processing' | 'storage' | 'retail'
  actor_id: string
  actor_role: 'farmer' | 'aggregator' | 'retailer' | 'consumer'
  location: string
  timestamp: string
  temperature?: number
  humidity?: number
  notes?: string
  blockchain_tx_hash?: string
  created_at: string
}

export interface BlockchainAnchor {
  id: string
  batch_id: string
  event_id?: string
  hash: string
  tx_hash: string
  block_number: number
  timestamp: string
  created_at: string
}

export interface User {
  id: string
  email: string
  role: 'farmer' | 'aggregator' | 'retailer' | 'consumer'
  name: string
  organization?: string
  created_at: string
}
