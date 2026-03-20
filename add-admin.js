require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, push, set } = require('firebase/database');

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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function addSuperAdmin() {
  console.log('Adding super admin to authorized_users...');
  try {
    const authorizedRef = ref(db, 'authorized_users');
    const newUserRef = push(authorizedRef);
    await set(newUserRef, {
      email: 'harshithkumar4452@gmail.com',
      role: 'admin',
      name: 'Harshith Kumar',
      created_at: new Date().toISOString()
    });
    console.log('✅ Successfully authorized harshithkumar4452@gmail.com as Admin!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  }
}

addSuperAdmin();
