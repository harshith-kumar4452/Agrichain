// Database verification script
// Run this with: node verify-database.js

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Make sure .env.local contains:')
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_url')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function verifyDatabase() {
  console.log('🔍 Verifying database setup...')
  
  try {
    // Check if batches table exists
    const { data: batches, error: batchesError } = await supabase
      .from('batches')
      .select('count')
      .limit(1)
    
    if (batchesError) {
      console.error('❌ Batches table error:', batchesError.message)
      console.log('\n📋 To fix this:')
      console.log('1. Go to https://supabase.com/dashboard')
      console.log('2. Select your project')
      console.log('3. Go to SQL Editor')
      console.log('4. Run the contents of database-schema.sql')
      return false
    }
    
    console.log('✅ Batches table exists')
    
    // Check if users table exists
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (usersError) {
      console.error('❌ Users table error:', usersError.message)
      return false
    }
    
    console.log('✅ Users table exists')
    
    // Check if trace_events table exists
    const { data: events, error: eventsError } = await supabase
      .from('trace_events')
      .select('count')
      .limit(1)
    
    if (eventsError) {
      console.error('❌ Trace events table error:', eventsError.message)
      return false
    }
    
    console.log('✅ Trace events table exists')
    
    // Check sample data
    const { data: sampleUsers } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (sampleUsers && sampleUsers.length > 0) {
      console.log('✅ Sample data exists')
    } else {
      console.log('⚠️  No sample data found (this is okay)')
    }
    
    console.log('\n🎉 Database setup is complete!')
    console.log('You can now run your application.')
    
    return true
    
  } catch (error) {
    console.error('❌ Database verification failed:', error.message)
    return false
  }
}

verifyDatabase()
