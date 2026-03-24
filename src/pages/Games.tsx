import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Gamepad2, Heart, HelpCircle, Flame, Lock, Play } from 'lucide-react';
import toast from 'react-hot-toast';

const GAMES = [
  {
    id: 'how-you-feel',
    title: 'How You Feel',
    description: 'Answer relationship questions to understand each other better.',
    icon: Heart,
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
    premium: false,
  },
  {
    id: 'truth-between-us',
    title: 'Truth Between Us',
    description: 'Honest questions and secrets. Random each time.',
    icon: HelpCircle,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    premium: false,
  },
  {
    id: 'how-much-you-know',
    title: 'How Much You Know Me',
    description: 'Guess-based questions with a scoring system.',
    icon: Gamepad2,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    premium: false,
  },
  {
    id: 'intimate-mode',
    title: 'Intimate Mode',
    description: 'Romantic and private questions just for the two of you.',
    icon: Flame,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    premium: true,
  },
];

export default function Games() {
  const { userProfile } = useStore();
  const [activeGame, setActiveGame] = useState<string | null>(null);

  const handleStartGame = (gameId: string, isPremium: boolean) => {
    if (isPremium && !userProfile?.isPremium) {
      toast.error("This game requires a premium subscription.");
      return;
    }
    
    // In a full implementation, this would create a game document in Firestore
    // and navigate to a dedicated game screen.
    toast.success(`Starting ${GAMES.find(g => g.id === gameId)?.title}...`);
    setActiveGame(gameId);
  };

  return (
    <div className="p-6 space-y-8 pb-24">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Games</h1>
        <p className="text-zinc-400">Play together and earn XP.</p>
      </div>

      <div className="grid gap-4">
        {GAMES.map((game) => {
          const Icon = game.icon;
          return (
            <div 
              key={game.id}
              className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 flex flex-col space-y-4 hover:border-zinc-700 transition-colors relative overflow-hidden group"
            >
              {game.premium && !userProfile?.isPremium && (
                <div className="absolute top-4 right-4 bg-zinc-800 p-2 rounded-full">
                  <Lock size={16} className="text-zinc-400" />
                </div>
              )}
              
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${game.bg}`}>
                  <Icon size={24} className={game.color} />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold text-lg text-zinc-50">{game.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{game.description}</p>
                </div>
              </div>

              <button
                onClick={() => handleStartGame(game.id, game.premium)}
                className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-50 rounded-xl font-medium flex items-center justify-center space-x-2 transition-colors"
              >
                <Play size={16} />
                <span>Play Now</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
