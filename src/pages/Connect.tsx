import React, { useState } from 'react';
import { collection, query, where, getDocs, getDoc, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';
import { Copy, HeartHandshake, LogOut } from 'lucide-react';
import { logout } from '../lib/firebase';

export default function Connect() {
  const { userProfile, firebaseUser } = useStore();
  const [partnerCode, setPartnerCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCopy = () => {
    if (userProfile?.inviteCode) {
      navigator.clipboard.writeText(userProfile.inviteCode);
      toast.success("Invite code copied!");
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerCode.trim() || !userProfile || !firebaseUser) return;
    
    if (partnerCode === userProfile.inviteCode) {
      toast.error("You cannot use your own invite code.");
      return;
    }

    try {
      setLoading(true);
      
      // Find partner by invite code
      const inviteDoc = await getDoc(doc(db, 'inviteCodes', partnerCode.toUpperCase()));
      
      if (!inviteDoc.exists()) {
        toast.error("Invalid invite code.");
        return;
      }
      
      const partnerId = inviteDoc.data().userId;
      const isUsed = inviteDoc.data().used;
      
      if (isUsed) {
        toast.error("This invite code has already been used.");
        return;
      }
      
      // Mark invite code as used
      await updateDoc(doc(db, 'inviteCodes', partnerCode.toUpperCase()), {
        used: true,
        partnerId: firebaseUser.uid
      });
      
      // Create couple document
      const coupleRef = await addDoc(collection(db, 'couples'), {
        user1Id: partnerId,
        user2Id: firebaseUser.uid,
        createdAt: serverTimestamp(),
      });
      
      // Update current user with coupleId
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        coupleId: coupleRef.id
      });
      
      toast.success("Successfully connected!");
    } catch (error: any) {
      toast.error(error.message || "Failed to connect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-zinc-950 flex flex-col items-center justify-center relative overflow-hidden">
      <button 
        onClick={logout}
        className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        <LogOut size={24} />
      </button>

      <div className="w-full max-w-md space-y-12 z-10">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <HeartHandshake className="w-10 h-10 text-pink-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Connect with Partner</h1>
          <p className="text-zinc-400">Share your code or enter theirs to link your accounts.</p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 space-y-6 backdrop-blur-sm">
          <div className="space-y-2 text-center">
            <p className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Your Invite Code</p>
            <div 
              onClick={handleCopy}
              className="flex items-center justify-center space-x-3 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 cursor-pointer hover:border-pink-500/50 transition-colors group"
            >
              <span className="text-3xl font-mono font-bold tracking-[0.2em] text-zinc-50 group-hover:text-pink-400 transition-colors">
                {userProfile?.inviteCode}
              </span>
              <Copy className="w-5 h-5 text-zinc-500 group-hover:text-pink-400 transition-colors" />
            </div>
          </div>

          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-zinc-800"></div>
            <span className="flex-shrink-0 mx-4 text-zinc-500 text-sm font-medium">OR</span>
            <div className="flex-grow border-t border-zinc-800"></div>
          </div>

          <form onSubmit={handleConnect} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-400 text-center">Enter Partner's Code</label>
              <input
                type="text"
                value={partnerCode}
                onChange={(e) => setPartnerCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-4 text-center text-2xl font-mono font-bold tracking-[0.2em] text-zinc-50 focus:outline-none focus:ring-2 focus:ring-pink-500 uppercase placeholder:text-zinc-700"
                placeholder="XXXXXX"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || partnerCode.length < 6}
              className="w-full h-14 bg-pink-600 text-white rounded-xl font-semibold text-lg hover:bg-pink-500 transition-colors active:scale-95 disabled:opacity-50 disabled:hover:bg-pink-600"
            >
              {loading ? "Connecting..." : "Connect"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
