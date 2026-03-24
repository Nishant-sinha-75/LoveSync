import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  nickname?: string;
  photoURL?: string;
  inviteCode: string;
  coupleId?: string;
  relationshipStartDate?: string;
  xp: number;
  level: number;
  feeling?: string;
  themeColor?: string;
  isPremium?: boolean;
  createdAt: any;
}

export interface Couple {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: any;
}

interface AppState {
  firebaseUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  partnerProfile: UserProfile | null;
  couple: Couple | null;
  isAuthReady: boolean;
  setFirebaseUser: (user: FirebaseUser | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setPartnerProfile: (profile: UserProfile | null) => void;
  setCouple: (couple: Couple | null) => void;
  setAuthReady: (ready: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  firebaseUser: null,
  userProfile: null,
  partnerProfile: null,
  couple: null,
  isAuthReady: false,
  setFirebaseUser: (user) => set({ firebaseUser: user }),
  setUserProfile: (profile) => set({ userProfile: profile }),
  setPartnerProfile: (profile) => set({ partnerProfile: profile }),
  setCouple: (couple) => set({ couple: couple }),
  setAuthReady: (ready) => set({ isAuthReady: ready }),
}));
