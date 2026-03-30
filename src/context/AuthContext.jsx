import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [role,    setRole]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // 1️⃣ Try direct UID lookup first (admin docs created with UID as doc ID)
          const directDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

          if (directDoc.exists()) {
            const data = directDoc.data();
            setUser({ uid: firebaseUser.uid, email: firebaseUser.email, ...data });
            setRole(data.role || 'admin');
          } else {
            // 2️⃣ Fallback: query by email (for agents added via addDoc with auto-ID)
            const q = query(
              collection(db, 'users'),
              where('email', '==', firebaseUser.email)
            );
            const snap = await getDocs(q);

            if (!snap.empty) {
              const data = snap.docs[0].data();
              const docId = snap.docs[0].id;
              setUser({ uid: firebaseUser.uid, firestoreId: docId, email: firebaseUser.email, ...data });
              setRole(data.role || 'agent');
            } else {
              // No Firestore doc found — default to admin (e.g. first-time setup)
              setUser({ uid: firebaseUser.uid, email: firebaseUser.email });
              setRole('admin');
            }
          }
        } catch (err) {
          console.error('Error fetching user role:', err);
          setUser({ uid: firebaseUser.uid, email: firebaseUser.email });
          setRole(null);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    setLoading(true);
    await signOut(auth);
    setUser(null);
    setRole(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
