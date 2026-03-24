import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { Toaster } from 'react-hot-toast';
import { auth, db } from './lib/firebase';
import { useStore } from './store/useStore';

// Pages
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Connect from './pages/Connect';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Games from './pages/Games';
import Profile from './pages/Profile';
import Layout from './components/Layout';

export default function App() {
  const { 
    firebaseUser, 
    userProfile, 
    isAuthReady, 
    setFirebaseUser, 
    setUserProfile, 
    setPartnerProfile, 
    setCouple, 
    setAuthReady 
  } = useStore();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (!user) {
        setUserProfile(null);
        setPartnerProfile(null);
        setCouple(null);
        setAuthReady(true);
      }
    });

    return () => unsubscribeAuth();
  }, [setFirebaseUser, setUserProfile, setPartnerProfile, setCouple, setAuthReady]);

  useEffect(() => {
    if (!firebaseUser) return;

    const unsubscribeUser = onSnapshot(doc(db, 'users', firebaseUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as any;
        setUserProfile(data);
        
        if (data.coupleId) {
          // Listen to couple doc
          const unsubscribeCouple = onSnapshot(doc(db, 'couples', data.coupleId), async (coupleSnap) => {
            if (coupleSnap.exists()) {
              const coupleData = coupleSnap.data() as any;
              setCouple({ id: coupleSnap.id, ...coupleData });
              
              const partnerId = coupleData.user1Id === firebaseUser.uid ? coupleData.user2Id : coupleData.user1Id;
              
              // Listen to partner doc
              const unsubscribePartner = onSnapshot(doc(db, 'users', partnerId), (partnerSnap) => {
                if (partnerSnap.exists()) {
                  setPartnerProfile(partnerSnap.data() as any);
                }
              });
              
              return () => unsubscribePartner();
            } else {
              // Couple was deleted, update own profile
              await updateDoc(doc(db, 'users', firebaseUser.uid), { coupleId: null });
              setCouple(null);
              setPartnerProfile(null);
            }
          });
          
          setAuthReady(true);
          return () => unsubscribeCouple();
        } else {
          setPartnerProfile(null);
          setCouple(null);
          setAuthReady(true);
        }
      } else {
        setUserProfile(null);
        setAuthReady(true);
      }
    });

    return () => unsubscribeUser();
  }, [firebaseUser, setUserProfile, setPartnerProfile, setCouple, setAuthReady]);

  // Listener for incoming couple connections when coupleId is null
  useEffect(() => {
    if (!firebaseUser || !userProfile || userProfile.coupleId) return;

    const q1 = query(collection(db, 'couples'), where('user1Id', '==', firebaseUser.uid));
    const q2 = query(collection(db, 'couples'), where('user2Id', '==', firebaseUser.uid));
    
    const unsub1 = onSnapshot(q1, async (snap) => {
      if (!snap.empty) {
        await updateDoc(doc(db, 'users', firebaseUser.uid), { coupleId: snap.docs[0].id });
      }
    });
    
    const unsub2 = onSnapshot(q2, async (snap) => {
      if (!snap.empty) {
        await updateDoc(doc(db, 'users', firebaseUser.uid), { coupleId: snap.docs[0].id });
      }
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, [firebaseUser, userProfile]);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-pulse text-pink-500 font-medium tracking-widest uppercase">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-pink-500/30">
        <Toaster position="top-center" toastOptions={{ style: { background: '#18181b', color: '#fff', border: '1px solid #27272a' } }} />
        <Routes>
          {!firebaseUser ? (
            <Route path="*" element={<Login />} />
          ) : !userProfile ? (
            <Route path="*" element={<Onboarding />} />
          ) : !userProfile.coupleId ? (
            <Route path="*" element={<Connect />} />
          ) : (
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/games" element={<Games />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          )}
        </Routes>
      </div>
    </Router>
  );
}
