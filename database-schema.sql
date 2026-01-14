-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create custom types
CREATE TYPE user_role AS ENUM ('farmer', 'aggregator', 'retailer', 'consumer');
CREATE TYPE batch_status AS ENUM ('active', 'recalled', 'completed');
CREATE TYPE event_type AS ENUM ('harvest', 'transport', 'processing', 'storage', 'retail');

-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL,
  name TEXT NOT NULL,
  organization TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Batches table
CREATE TABLE batches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id TEXT UNIQUE NOT NULL,
  farmer_id UUID REFERENCES users(id) NOT NULL,
  crop_name TEXT NOT NULL,
  location TEXT NOT NULL,
  harvest_date DATE NOT NULL,
  quantity DECIMAL NOT NULL,
  unit TEXT NOT NULL,
  qr_code TEXT NOT NULL,
  ipfs_hash TEXT,
  blockchain_tx_hash TEXT,
  status batch_status DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trace events table
CREATE TABLE trace_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id TEXT REFERENCES batches(batch_id) NOT NULL,
  event_type event_type NOT NULL,
  actor_id UUID REFERENCES users(id) NOT NULL,
  actor_role user_role NOT NULL,
  location TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  temperature DECIMAL,
  humidity DECIMAL,
  notes TEXT,
  blockchain_tx_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blockchain anchors table
CREATE TABLE blockchain_anchors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id TEXT REFERENCES batches(batch_id) NOT NULL,
  event_id UUID REFERENCES trace_events(id),
  hash TEXT NOT NULL,
  tx_hash TEXT NOT NULL,
  block_number BIGINT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE trace_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE blockchain_anchors ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Farmers can create batches
CREATE POLICY "Farmers can create batches" ON batches
  FOR INSERT WITH CHECK (auth.uid() = farmer_id);

-- Users can read all batches (for transparency)
CREATE POLICY "Anyone can read batches" ON batches
  FOR SELECT USING (true);

-- Users can update batches they own
CREATE POLICY "Users can update own batches" ON batches
  FOR UPDATE USING (auth.uid() = farmer_id);

-- Users can create trace events
CREATE POLICY "Users can create trace events" ON trace_events
  FOR INSERT WITH CHECK (auth.uid() = actor_id);

-- Users can read all trace events
CREATE POLICY "Anyone can read trace events" ON trace_events
  FOR SELECT USING (true);

-- Users can read blockchain anchors
CREATE POLICY "Anyone can read blockchain anchors" ON blockchain_anchors
  FOR SELECT USING (true);

-- Insert sample data
INSERT INTO users (id, email, role, name, organization) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'farmer@example.com', 'farmer', 'John Farmer', 'Green Valley Farms'),
  ('550e8400-e29b-41d4-a716-446655440002', 'aggregator@example.com', 'aggregator', 'Jane Aggregator', 'Fresh Supply Co'),
  ('550e8400-e29b-41d4-a716-446655440003', 'retailer@example.com', 'retailer', 'Bob Retailer', 'SuperMart Chain'),
  ('550e8400-e29b-41d4-a716-446655440004', 'consumer@example.com', 'consumer', 'Alice Consumer', NULL);

-- Create indexes for better performance
CREATE INDEX idx_batches_farmer_id ON batches(farmer_id);
CREATE INDEX idx_batches_status ON batches(status);
CREATE INDEX idx_trace_events_batch_id ON trace_events(batch_id);
CREATE INDEX idx_trace_events_timestamp ON trace_events(timestamp);
CREATE INDEX idx_blockchain_anchors_batch_id ON blockchain_anchors(batch_id);
