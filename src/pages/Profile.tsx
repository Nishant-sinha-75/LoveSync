import { useState } from 'react';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db, logout } from '../lib/firebase';
import { useStore } from '../store/useStore';
import { User, Settings, LogOut, Trash2, Heart, Award, Copy, ShieldAlert, CreditCard, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { userProfile, partnerProfile, couple, firebaseUser } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    nickname: userProfile?.nickname || '',
    relationshipStartDate: userProfile?.relationshipStartDate || '',
  });

  const handleSave = async () => {
    if (!firebaseUser) return;
    try {
      await updateDoc(doc(db, 'users', firebaseUser.uid), formData);
      setIsEditing(false);
      toast.success("Profile updated");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleCopyCode = () => {
    if (userProfile?.inviteCode) {
      navigator.clipboard.writeText(userProfile.inviteCode);
      toast.success("Invite code copied!");
    }
  };

  const handleDisconnect = async () => {
    if (!firebaseUser || !couple?.id) return;
    const confirm = window.confirm("Are you sure you want to disconnect from your partner? This action cannot be undone.");
    if (!confirm) return;

    try {
      // Remove coupleId from current user
      await updateDoc(doc(db, 'users', firebaseUser.uid), { coupleId: null });
      
      // Delete couple document
      await deleteDoc(doc(db, 'couples', couple.id));
      toast.success("Disconnected successfully");
    } catch (error) {
      toast.error("Failed to disconnect");
    }
  };

  const handleSubscribe = (plan: string) => {
    toast.success(`Mock: Subscribed to ${plan} plan!`);
    // In a real app, this would open Razorpay checkout
  };

  return (
    <div className="p-6 space-y-8 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <button onClick={logout} className="p-2 text-zinc-400 hover:text-pink-500 transition-colors">
          <LogOut size={24} />
        </button>
      </div>

      {/* User Info */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-full bg-pink-500 overflow-hidden">
            {userProfile?.photoURL ? (
              <img src={userProfile.photoURL} alt="You" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white">
                {userProfile?.name?.[0]}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-zinc-50">{userProfile?.name}</h2>
            <p className="text-zinc-400">{userProfile?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center space-y-2">
            <Award className="w-8 h-8 text-yellow-500" />
            <div className="text-center">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Level {userProfile?.level}</p>
              <p className="text-lg font-bold text-zinc-50">{userProfile?.xp} XP</p>
            </div>
          </div>
          <div 
            onClick={handleCopyCode}
            className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center space-y-2 cursor-pointer hover:border-pink-500/50 transition-colors group"
          >
            <Copy className="w-8 h-8 text-zinc-500 group-hover:text-pink-500 transition-colors" />
            <div className="text-center">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Invite Code</p>
              <p className="text-lg font-mono font-bold tracking-widest text-zinc-50 group-hover:text-pink-400 transition-colors">
                {userProfile?.inviteCode}
              </p>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="pt-4 border-t border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Personal Details</h3>
            <button 
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className="text-xs font-medium text-pink-500 hover:text-pink-400"
            >
              {isEditing ? 'Save' : 'Edit'}
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Name</label>
              <input
                disabled={!isEditing}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-50 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Nickname</label>
              <input
                disabled={!isEditing}
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-50 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Anniversary</label>
              <input
                type="date"
                disabled={!isEditing}
                value={formData.relationshipStartDate}
                onChange={(e) => setFormData({ ...formData, relationshipStartDate: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-50 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="bg-gradient-to-br from-pink-600/20 to-purple-600/20 border border-pink-500/30 rounded-3xl p-6 space-y-6">
        <div className="flex items-center space-x-3">
          <CreditCard className="w-6 h-6 text-pink-500" />
          <h3 className="text-lg font-bold text-zinc-50">Premium Plans</h3>
        </div>
        <div className="space-y-3">
          <button onClick={() => handleSubscribe('Monthly')} className="w-full flex items-center justify-between bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 p-4 rounded-2xl transition-colors">
            <span className="font-medium">1 Month</span>
            <span className="text-pink-400 font-bold">₹149</span>
          </button>
          <button onClick={() => handleSubscribe('6 Months')} className="w-full flex items-center justify-between bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 p-4 rounded-2xl transition-colors">
            <span className="font-medium">6 Months</span>
            <span className="text-pink-400 font-bold">₹1999</span>
          </button>
          <button onClick={() => handleSubscribe('1 Year')} className="w-full flex items-center justify-between bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 p-4 rounded-2xl transition-colors">
            <span className="font-medium">1 Year</span>
            <span className="text-pink-400 font-bold">₹2499</span>
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-950/20 border border-red-900/50 rounded-3xl p-6 space-y-4">
        <div className="flex items-center space-x-3 text-red-500 mb-2">
          <ShieldAlert className="w-5 h-5" />
          <h3 className="font-bold">Danger Zone</h3>
        </div>
        <button 
          onClick={handleDisconnect}
          className="w-full flex items-center justify-between bg-zinc-900/50 hover:bg-red-900/30 text-red-400 p-4 rounded-2xl transition-colors border border-zinc-800 hover:border-red-900/50"
        >
          <span className="font-medium">Disconnect Partner</span>
          <ChevronRight size={18} />
        </button>
        <button className="w-full flex items-center justify-between bg-zinc-900/50 hover:bg-red-900/30 text-red-400 p-4 rounded-2xl transition-colors border border-zinc-800 hover:border-red-900/50">
          <span className="font-medium">Delete Account</span>
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
