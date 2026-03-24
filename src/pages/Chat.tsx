import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useStore } from '../store/useStore';
import { Send, Image as ImageIcon, Mic } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function Chat() {
  const { couple, firebaseUser, partnerProfile } = useStore();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!couple?.id) return;

    const q = query(
      collection(db, 'couples', couple.id, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [couple?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !couple?.id || !firebaseUser) return;

    try {
      await addDoc(collection(db, 'couples', couple.id, 'messages'), {
        text: newMessage,
        senderId: firebaseUser.uid,
        createdAt: serverTimestamp(),
        type: 'text'
      });
      setNewMessage('');
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-zinc-950">
      {/* Header */}
      <div className="flex items-center space-x-4 p-4 bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800 sticky top-0 z-10">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-pink-500 overflow-hidden">
            {partnerProfile?.photoURL ? (
              <img src={partnerProfile.photoURL} alt="Partner" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg font-bold text-white">
                {partnerProfile?.name?.[0] || '?'}
              </div>
            )}
          </div>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-zinc-900 rounded-full"></div>
        </div>
        <div>
          <h2 className="font-semibold text-zinc-50">{partnerProfile?.name || 'Partner'}</h2>
          <p className="text-xs text-zinc-400">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => {
          const isMe = msg.senderId === firebaseUser?.uid;
          const showTime = index === 0 || 
            (msg.createdAt?.seconds - messages[index - 1]?.createdAt?.seconds > 3600);

          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              {showTime && msg.createdAt && (
                <span className="text-[10px] text-zinc-500 my-2 uppercase tracking-wider font-medium">
                  {format(msg.createdAt.toDate(), 'MMM d, h:mm a')}
                </span>
              )}
              <div 
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                  isMe 
                    ? 'bg-pink-600 text-white rounded-br-sm' 
                    : 'bg-zinc-800 text-zinc-50 rounded-bl-sm'
                }`}
              >
                <p className="leading-relaxed">{msg.text}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-zinc-900/80 backdrop-blur-xl border-t border-zinc-800">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <button type="button" className="p-2 text-zinc-400 hover:text-pink-500 transition-colors">
            <ImageIcon size={20} />
          </button>
          <button type="button" className="p-2 text-zinc-400 hover:text-pink-500 transition-colors">
            <Mic size={20} />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Message..."
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-full px-4 py-2.5 text-sm text-zinc-50 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2.5 bg-pink-600 text-white rounded-full hover:bg-pink-500 transition-colors disabled:opacity-50 disabled:hover:bg-pink-600"
          >
            <Send size={18} className="ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
