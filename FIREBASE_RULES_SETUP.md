# Firebase Realtime Database Rules Setup

## Issue
You're getting the error: `Index not defined, add ".indexOn": "batch_id"` because Firebase Realtime Database requires indexes for queries.

## Solution: Apply Firebase Rules with Indexes

### Step 1: Copy the Rules
The rules are defined in `database.rules.json` file.

### Step 2: Apply to Firebase Console

1. **Go to Firebase Console**: https://console.firebase.google.com/

2. **Select your project**: `blockchain-17cc5`

3. **Navigate to Realtime Database**:
   - Click "Realtime Database" in the left sidebar
   - Click the "Rules" tab at the top

4. **Paste the following rules**:

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

5. **Click "Publish"** button

6. **Wait 10-20 seconds** for the rules to propagate

### Step 3: Verify
- Refresh your application
- Try creating a batch as farmer
- Try scanning the QR code as aggregator
- The "Batch not found" error should be gone!

## What These Rules Do

- **`.read: true, .write: true`**: Allows public read/write (for demo purposes)
- **`batches.indexOn: ["batch_id"]`**: Enables fast queries by batch_id
- **`trace_events.indexOn: ["batch_id"]`**: Enables fast queries to get events for a batch
- **Other indexes**: Improve query performance for other operations

## Security Note

⚠️ **IMPORTANT**: These rules allow public read/write access. For production:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "batches": {
      ".indexOn": ["batch_id", "farmer_id", "status"],
      ".read": true,
      ".write": "auth != null && auth.uid == newData.child('farmer_id').val()"
    },
    "trace_events": {
      ".indexOn": ["batch_id", "actor_id", "timestamp"],
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

## Alternative: Use Firebase CLI

If you have Firebase CLI installed:

```bash
firebase deploy --only database
```

This will deploy the rules from `database.rules.json` automatically.
