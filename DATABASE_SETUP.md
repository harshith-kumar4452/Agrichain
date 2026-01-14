# Database Setup Guide

## The Problem
You're getting this error:
```
Error creating batch: {code: 'PGRST205', details: null, hint: null, message: "Could not find the table 'public.batches' in the schema cache"}
```

This means the database tables haven't been created in your Supabase project yet.

## Solution

### Step 1: Set up the database schema

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `pxxyeefekbuhocfqceat`
3. **Navigate to SQL Editor**: Click "SQL Editor" in the left sidebar
4. **Create a new query**: Click "New query"
5. **Copy the entire contents** of `database-schema.sql` and paste it into the editor
6. **Run the query**: Click "Run" to execute the SQL

### Step 2: Verify the setup

Run the verification script:
```bash
node verify-database.js
```

This will check if all tables are created correctly.

### Step 3: Test your application

After setting up the database, your application should work without the PGRST205 error.

## What the schema creates

The `database-schema.sql` file creates:

- **users** table - for storing user information
- **batches** table - for storing crop batch information
- **trace_events** table - for storing supply chain events
- **blockchain_anchors** table - for storing blockchain transaction hashes
- **Sample data** - test users and initial data
- **Row Level Security (RLS)** policies - for data access control

## Troubleshooting

If you still get errors after running the schema:

1. Check that you copied the entire `database-schema.sql` content
2. Make sure there are no syntax errors in the SQL
3. Verify your Supabase project URL and API key in `.env.local`
4. Run the verification script to check table existence

## Next Steps

Once the database is set up:
1. Your farmer page should work for creating batches
2. The dashboard should display batch information
3. All CRUD operations should function properly
