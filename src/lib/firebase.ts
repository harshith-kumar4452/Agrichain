import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, push, set, get, update, query, orderByChild, equalTo } from "firebase/database";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
// Firebase configuration
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

// Initialize Firebase (only if not already initialized)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getDatabase(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Auth helper functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { success: true, user: result.user };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    return { success: false, error };
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return { success: false, error };
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: result.user };
  } catch (error) {
    console.error('Error signing in with email:', error);
    return { success: false, error };
  }
};

export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, user: result.user };
  } catch (error) {
    console.error('Error signing up with email:', error);
    return { success: false, error };
  }
};

export const getUserData = async (uid: string) => {
  try {
    const userRef = ref(db, `users/${uid}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      return { success: true, data: snapshot.val() as User };
    }
    return { success: false, error: 'User not found' };
  } catch (error) {
    console.error('Error getting user data:', error);
    return { success: false, error };
  }
};

export const saveUserData = async (uid: string, userData: Omit<User, 'id'>) => {
  try {
    const userRef = ref(db, `users/${uid}`);
    await set(userRef, {
      id: uid,
      ...userData
    });
    return { success: true };
  } catch (error) {
    console.error('Error saving user data:', error);
    return { success: false, error };
  }
};

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
  role: 'admin' | 'farmer' | 'aggregator' | 'retailer' | 'officer' | 'consumer'
  name: string
  organization?: string
  created_at: string
}

export const getAuthorizedUserByEmail = async (email: string) => {
  try {
    const authorizedRef = ref(db, 'authorized_users');
    const snapshot = await get(authorizedRef);
    if (!snapshot.exists()) return { success: false, error: 'No authorized users found' };
    
    const data = snapshot.val();
    const foundId = Object.keys(data).find(key => data[key].email.toLowerCase() === email.toLowerCase());
    
    if (foundId) {
      return { success: true, data: { id: foundId, ...data[foundId] } };
    }
    return { success: false, error: 'Email not authorized' };
  } catch (error) {
    console.error('Error checking authorized user:', error);
    return { success: false, error };
  }
};

export const addAuthorizedUser = async (email: string, role: string, name: string) => {
  try {
    const authorizedRef = ref(db, 'authorized_users');
    const newUserRef = push(authorizedRef);
    await set(newUserRef, {
      email,
      role,
      name,
      created_at: new Date().toISOString()
    });
    return { success: true, id: newUserRef.key };
  } catch (error) {
    console.error('Error adding authorized user:', error);
    return { success: false, error };
  }
};

export const getAllAuthorizedUsers = async () => {
  try {
    const authorizedRef = ref(db, 'authorized_users');
    const snapshot = await get(authorizedRef);
    if (!snapshot.exists()) return { success: true, data: [] };
    
    const data = snapshot.val();
    const users = Object.keys(data).map(key => ({ id: key, ...data[key] }));
    return { success: true, data: users };
  } catch (error) {
    console.error('Error getting authorized users:', error);
    return { success: false, error };
  }
};

// Helper functions for Firebase operations
export const createBatch = async (batchData: Omit<Batch, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const batchesRef = ref(db, 'batches');
    const newBatchRef = push(batchesRef);
    await set(newBatchRef, {
      ...batchData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    return { success: true, id: newBatchRef.key };
  } catch (error) {
    console.error('Error creating batch:', error);
    return { success: false, error };
  }
};

export const getBatchByBatchId = async (batchId: string) => {
  try {
    // Fetch all batches and filter client-side (works without Firebase index)
    const batchesRef = ref(db, 'batches');
    const snapshot = await get(batchesRef);

    if (!snapshot.exists()) {
      return { success: false, error: 'No batches found in database' };
    }

    const batchesData = snapshot.val();

    // Find the batch with matching batch_id
    for (const key in batchesData) {
      if (batchesData[key].batch_id === batchId) {
        return { success: true, data: { id: key, ...batchesData[key] } as Batch };
      }
    }

    return { success: false, error: 'Batch not found' };
  } catch (error) {
    console.error('Error getting batch:', error);
    return { success: false, error };
  }
};

export const getAllBatches = async () => {
  try {
    const batchesRef = ref(db, 'batches');
    const snapshot = await get(batchesRef);

    if (!snapshot.exists()) {
      return { success: true, data: [] };
    }

    const batchesData = snapshot.val();
    const batches = Object.keys(batchesData).map(key => ({
      id: key,
      ...batchesData[key]
    } as Batch));

    return { success: true, data: batches };
  } catch (error) {
    console.error('Error getting batches:', error);
    return { success: false, error };
  }
};

export const updateBatchStatus = async (batchId: string, status: 'active' | 'recalled' | 'completed') => {
  try {
    // Fetch all batches and find the one to update
    const batchesRef = ref(db, 'batches');
    const snapshot = await get(batchesRef);

    if (!snapshot.exists()) {
      return { success: false, error: 'No batches found' };
    }

    const batchesData = snapshot.val();

    // Find the batch with matching batch_id
    for (const key in batchesData) {
      if (batchesData[key].batch_id === batchId) {
        const batchRef = ref(db, `batches/${key}`);
        await update(batchRef, {
          status,
          updated_at: new Date().toISOString()
        });
        return { success: true };
      }
    }

    return { success: false, error: 'Batch not found' };
  } catch (error) {
    console.error('Error updating batch status:', error);
    return { success: false, error };
  }
};

export const createTraceEvent = async (eventData: Omit<TraceEvent, 'id' | 'created_at'>) => {
  try {
    const eventsRef = ref(db, 'trace_events');
    const newEventRef = push(eventsRef);
    await set(newEventRef, {
      ...eventData,
      created_at: new Date().toISOString()
    });
    return { success: true, id: newEventRef.key };
  } catch (error) {
    console.error('Error creating trace event:', error);
    return { success: false, error };
  }
};

export const getTraceEventsByBatchId = async (batchId: string) => {
  try {
    // Fetch all events and filter client-side
    const eventsRef = ref(db, 'trace_events');
    const snapshot = await get(eventsRef);

    if (!snapshot.exists()) {
      return { success: true, data: [] };
    }

    const eventsData = snapshot.val();
    const events: TraceEvent[] = [];

    // Filter events by batch_id
    for (const key in eventsData) {
      if (eventsData[key].batch_id === batchId) {
        events.push({
          id: key,
          ...eventsData[key]
        } as TraceEvent);
      }
    }

    // Sort by timestamp
    events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return { success: true, data: events };
  } catch (error) {
    console.error('Error getting trace events:', error);
    return { success: false, error };
  }
};

export const createBlockchainAnchor = async (anchorData: Omit<BlockchainAnchor, 'id' | 'created_at'>) => {
  try {
    const anchorsRef = ref(db, 'blockchain_anchors');
    const newAnchorRef = push(anchorsRef);
    await set(newAnchorRef, {
      ...anchorData,
      created_at: new Date().toISOString()
    });
    return { success: true, id: newAnchorRef.key };
  } catch (error) {
    console.error('Error creating blockchain anchor:', error);
    return { success: false, error };
  }
};

export const getBlockchainAnchorByBatchId = async (batchId: string) => {
  try {
    // Fetch all anchors and filter client-side
    const anchorsRef = ref(db, 'blockchain_anchors');
    const snapshot = await get(anchorsRef);

    if (!snapshot.exists()) {
      return { success: false, error: 'Blockchain anchor not found' };
    }

    const anchorsData = snapshot.val();

    // Find the anchor with matching batch_id
    for (const key in anchorsData) {
      if (anchorsData[key].batch_id === batchId) {
        return { success: true, data: { id: key, ...anchorsData[key] } as BlockchainAnchor };
      }
    }

    return { success: false, error: 'Blockchain anchor not found' };
  } catch (error) {
    console.error('Error getting blockchain anchor:', error);
    return { success: false, error };
  }
};

// Create sample user (for testing)
export const getSampleFarmer = () => {
  return {
    id: 'sample-farmer-id',
    email: 'farmer@example.com',
    role: 'farmer' as const,
    name: 'John Farmer',
    organization: 'Green Valley Farms',
    created_at: new Date().toISOString()
  };
};
