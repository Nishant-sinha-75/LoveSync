import { useState, useEffect } from 'react';
import { differenceInDays, parseISO } from 'date-fns';
import { doc, updateDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useStore } from '../store/useStore';
import { MapPin, Heart, Edit3, Smile, Frown, Angry, Laugh } from 'lucide-react';
import toast from 'react-hot-toast';

const FEELINGS = [
  { emoji: '😊', label: 'Happy', value: 'happy' },
  { emoji: '😢', label: 'Sad', value: 'sad' },
  { emoji: '😡', label: 'Angry', value: 'angry' },
  { emoji: '😴', label: 'Tired', value: 'tired' },
  { emoji: '😍', label: 'Loved', value: 'loved' },
];

export default function Home() {
  const { userProfile, partnerProfile, couple, firebaseUser } = useStore();
  const [loveNote, setLoveNote] = useState('');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteData, setNoteData] = useState<any>(null);

  useEffect(() => {
    if (!couple?.id) return;

    const unsubscribe = onSnapshot(doc(db, 'couples', couple.id, 'loveNotes', 'daily'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setNoteData(data);
        if (!isEditingNote) {
          setLoveNote(data.text || '');
        }
      } else {
        // Create initial note
        setDoc(doc(db, 'couples', couple.id, 'loveNotes', 'daily'), {
          text: "Write your first love note here...",
          lastEditedBy: firebaseUser?.uid,
          updatedAt: new Date().toISOString()
        });
      }
    });

    return () => unsubscribe();
  }, [couple?.id, isEditingNote, firebaseUser?.uid]);

  const daysTogether = userProfile?.relationshipStartDate
    ? differenceInDays(new Date(), parseISO(userProfile.relationshipStartDate))
    : 0;

  const handleUpdateFeeling = async (feeling: string) => {
    if (!firebaseUser) return;
    try {
      await updateDoc(doc(db, 'users', firebaseUser.uid), { feeling });
      toast.success(`Feeling updated to ${feeling}`);
    } catch (error) {
      toast.error("Failed to update feeling");
    }
  };

  const handleSaveNote = async () => {
    if (!couple?.id || !firebaseUser) return;
    try {
      await updateDoc(doc(db, 'couples', couple.id, 'loveNotes', 'daily'), {
        text: loveNote,
        lastEditedBy: firebaseUser.uid,
        updatedAt: new Date().toISOString()
      });
      setIsEditingNote(false);
      toast.success("Love note saved!");
    } catch (error) {
      toast.error("Failed to save note");
    }
  };

  const getThemeColor = (gender?: string) => {
    if (gender === 'male') return 'bg-blue-500';
    if (gender === 'female') return 'bg-pink-500';
    return 'bg-purple-500';
  };

  return (
    <div className="p-6 space-y-8 pb-24">
      {/* Header / Couple Info */}
      <div className="flex flex-col items-center justify-center space-y-4 pt-4">
        <div className="flex items-center justify-center space-x-4">
          <div className="relative">
            <div className={`w-20 h-20 rounded-full border-4 border-zinc-950 ${getThemeColor(userProfile?.gender)} p-1 overflow-hidden`}>
              {userProfile?.photoURL ? (
                <img src={userProfile.photoURL} alt="You" className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full bg-zinc-800 rounded-full flex items-center justify-center text-2xl font-bold">
                  {userProfile?.name?.[0]}
                </div>
              )}
            </div>
            {userProfile?.feeling && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-zinc-900 rounded-full flex items-center justify-center text-lg shadow-lg border border-zinc-800">
                {FEELINGS.find(f => f.value === userProfile.feeling)?.emoji || '😊'}
              </div>
            )}
          </div>
          
          <Heart className="w-8 h-8 text-pink-500 fill-pink-500 animate-pulse" />
          
          <div className="relative">
            <div className={`w-20 h-20 rounded-full border-4 border-zinc-950 ${getThemeColor(partnerProfile?.gender)} p-1 overflow-hidden`}>
              {partnerProfile?.photoURL ? (
                <img src={partnerProfile.photoURL} alt="Partner" className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full bg-zinc-800 rounded-full flex items-center justify-center text-2xl font-bold">
                  {partnerProfile?.name?.[0] || '?'}
                </div>
              )}
            </div>
            {partnerProfile?.feeling && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-zinc-900 rounded-full flex items-center justify-center text-lg shadow-lg border border-zinc-800">
                {FEELINGS.find(f => f.value === partnerProfile.feeling)?.emoji || '😊'}
              </div>
            )}
          </div>
        </div>
        
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">
            {userProfile?.name} & {partnerProfile?.name || 'Partner'}
          </h2>
          <p className="text-pink-500 font-medium mt-1">{daysTogether} Days of Love</p>
        </div>
      </div>

      {/* Feelings Selector */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 space-y-4">
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">How are you feeling?</h3>
        <div className="flex justify-between">
          {FEELINGS.map((f) => (
            <button
              key={f.value}
              onClick={() => handleUpdateFeeling(f.value)}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                userProfile?.feeling === f.value 
                  ? 'bg-zinc-800 scale-110 border border-zinc-700 shadow-lg' 
                  : 'hover:bg-zinc-800/50 grayscale hover:grayscale-0 opacity-50 hover:opacity-100'
              }`}
            >
              {f.emoji}
            </button>
          ))}
        </div>
        {partnerProfile?.feeling && (
          <div className="pt-4 mt-4 border-t border-zinc-800/50 text-center text-sm text-zinc-400">
            {partnerProfile.name} is feeling {FEELINGS.find(f => f.value === partnerProfile.feeling)?.label.toLowerCase() || 'happy'} {FEELINGS.find(f => f.value === partnerProfile.feeling)?.emoji}
          </div>
        )}
      </div>

      {/* Daily Love Letter */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider flex items-center">
            <Edit3 className="w-4 h-4 mr-2" />
            Daily Love Note
          </h3>
          {!isEditingNote && (
            <button 
              onClick={() => setIsEditingNote(true)}
              className="text-xs font-medium text-pink-500 hover:text-pink-400"
            >
              Edit
            </button>
          )}
        </div>
        
        {isEditingNote ? (
          <div className="space-y-3">
            <textarea
              value={loveNote}
              onChange={(e) => setLoveNote(e.target.value)}
              className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-zinc-50 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
              placeholder="Write something sweet..."
            />
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => {
                  setIsEditingNote(false);
                  setLoveNote(noteData?.text || '');
                }}
                className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-300"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveNote}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-medium hover:bg-pink-500"
              >
                Save Note
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-950/50 rounded-xl p-4 min-h-[8rem] border border-zinc-800/50">
            <p className="text-zinc-300 whitespace-pre-wrap font-serif italic leading-relaxed">
              {noteData?.text || "Write your first love note here..."}
            </p>
            {noteData?.lastEditedBy && (
              <p className="text-[10px] text-zinc-500 mt-4 text-right">
                Last edited by {noteData.lastEditedBy === firebaseUser?.uid ? 'You' : partnerProfile?.name}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Location Placeholder */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            Distance
          </h3>
          <p className="text-2xl font-bold text-zinc-50">
            {/* Mock distance for now, requires geolocation API implementation */}
            2,450 <span className="text-sm font-medium text-zinc-500">km apart</span>
          </p>
        </div>
        <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center">
          <MapPin className="w-6 h-6 text-zinc-400" />
        </div>
      </div>
    </div>
  );
}
