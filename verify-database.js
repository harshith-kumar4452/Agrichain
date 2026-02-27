// Firebase Database Verification Script
// Run with: node verify-database.js

const { initializeApp, getApps, deleteApp } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

async function verifyFirebase() {
  console.log('🔍 Verifying Firebase setup...');

  if (!firebaseConfig.apiKey || !firebaseConfig.databaseURL) {
    console.error('❌ Missing Firebase environment variables in .env.local');
    return false;
  }

  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);

  try {
    console.log(`Connecting to database: ${firebaseConfig.databaseURL}`);

    // Check for "batches" node
    const batchesSnapshot = await get(ref(db, 'batches'));

    if (batchesSnapshot.exists()) {
      console.log('✅ "batches" node exists and is accessible');
    } else {
      console.log('ℹ️  "batches" node does not exist yet (this is normal for new projects)');
    }

    console.log('\n🎉 Firebase setup is verified!');
    console.log('You can now run your application with: npm run dev');

    // Clean up
    await deleteApp(app);
    return true;

  } catch (error) {
    console.error('❌ Firebase verification failed:', error.message);
    if (error.code === 'PERMISSION_DENIED') {
      console.log('\n📋 To fix this:');
      console.log('1. Go to Firebase Console -> Realtime Database -> Rules');
      console.log('2. Make sure your rules allow read/write for testing.');
      console.log('3. See database.rules.json in your project for recommended rules.');
    }
    await deleteApp(app);
    return false;
  }
}

verifyFirebase().then(success => {
  if (!success) process.exit(1);
  process.exit(0);
});
