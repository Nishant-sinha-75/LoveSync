import { Outlet, NavLink } from 'react-router-dom';
import { Home, MessageCircle, Gamepad2, User } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function Layout() {
  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/chat', icon: MessageCircle, label: 'Chat' },
    { to: '/games', icon: Gamepad2, label: 'Games' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-zinc-950 max-w-md mx-auto relative shadow-2xl shadow-pink-500/10 border-x border-zinc-900">
      <main className="flex-1 overflow-y-auto pb-20 scrollbar-hide">
        <Outlet />
      </main>
      
      <nav className="absolute bottom-0 left-0 right-0 bg-zinc-900/80 backdrop-blur-xl border-t border-zinc-800 pb-safe z-50">
        <div className="flex justify-around items-center h-16 px-4">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center w-16 h-full space-y-1 transition-colors",
                  isActive ? "text-pink-500" : "text-zinc-500 hover:text-zinc-300"
                )
              }
            >
              <Icon size={24} strokeWidth={2} />
              <span className="text-[10px] font-medium tracking-wide">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
