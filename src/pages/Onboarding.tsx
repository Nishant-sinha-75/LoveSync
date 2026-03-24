import React, { useState } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, generateInviteCode } from '../lib/firebase';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

export default function Onboarding() {
  const { firebaseUser } = useStore();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: firebaseUser?.displayName || '',
    age: '',
    gender: 'other',
    nickname: '',
    relationshipStartDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;

    try {
      setLoading(true);
      const inviteCode = generateInviteCode();
      
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: formData.name,
        age: parseInt(formData.age) || 0,
        gender: formData.gender,
        nickname: formData.nickname,
        photoURL: firebaseUser.photoURL || '',
        inviteCode,
        coupleId: null,
        relationshipStartDate: formData.relationshipStartDate,
        xp: 0,
        level: 1,
        createdAt: serverTimestamp(),
        themeColor: formData.gender === 'male' ? 'blue' : formData.gender === 'female' ? 'pink' : 'purple',
        isPremium: false,
      });

      await setDoc(doc(db, 'inviteCodes', inviteCode), {
        userId: firebaseUser.uid,
        used: false,
        createdAt: serverTimestamp()
      });
      
      toast.success("Profile created!");
    } catch (error: any) {
      toast.error(error.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-zinc-950 flex flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Tell us about you</h1>
          <p className="text-zinc-400">Let's set up your profile before connecting.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Your Name</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="John Doe"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Age</label>
                <input
                  required
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="25"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-50 focus:outline-none focus:ring-2 focus:ring-pink-500 appearance-none"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Nickname (What they call you)</label>
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Babe, Honey, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Relationship Start Date</label>
              <input
                required
                type="date"
                value={formData.relationshipStartDate}
                onChange={(e) => setFormData({ ...formData, relationshipStartDate: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-50 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-pink-600 text-white rounded-xl font-semibold text-lg hover:bg-pink-500 transition-colors active:scale-95 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
