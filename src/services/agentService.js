import {
  collection, doc, onSnapshot, setDoc, deleteDoc,
  query, serverTimestamp, where
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { db } from './firebase';
import app from './firebase'; // main app

const usersRef = collection(db, 'users');

/**
 * Secondary Firebase app instance used ONLY for creating agent accounts.
 * This prevents signing out the currently logged-in admin when
 * createUserWithEmailAndPassword is called (which normally auto-signs-in).
 */
let secondaryApp = null;

function getSecondaryAuth() {
  if (!secondaryApp) {
    // Re-use the same Firebase config from the main app
    secondaryApp = initializeApp(app.options, 'secondary');
  }
  return getAuth(secondaryApp);
}

/** Subscribe to all agents in real-time */
export function subscribeToAgents(callback) {
  const q = query(usersRef, where('role', '==', 'agent'));
  return onSnapshot(q, (snapshot) => {
    const agents = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.() || null,
    }));
    callback(agents);
  });
}

/**
 * Add a new agent:
 * 1. Creates Firebase Auth account via secondary app (admin stays logged in)
 * 2. Creates Firestore doc with the agent's UID as doc ID (so AuthContext can find it)
 */
export async function addAgent(data) {
  const secondaryAuth = getSecondaryAuth();

  // Create Firebase Auth user
  const credential = await createUserWithEmailAndPassword(
    secondaryAuth,
    data.email,
    data.password
  );
  const uid = credential.user.uid;

  // Sign out from secondary app so it stays clean
  await secondaryAuth.signOut();

  // Create Firestore doc with UID as document ID
  await setDoc(doc(db, 'users', uid), {
    name:      data.name,
    email:     data.email,
    phone:     data.phone || '',
    role:      'agent',
    createdAt: serverTimestamp(),
  });

  return uid;
}

/** Remove an agent's Firestore doc (Firebase Auth user must be deleted via Admin SDK / Console) */
export async function removeAgent(agentId) {
  await deleteDoc(doc(db, 'users', agentId));
}
