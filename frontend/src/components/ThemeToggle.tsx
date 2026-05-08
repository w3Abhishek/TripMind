'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className={`p-2 rounded-lg transition-all hover:bg-muted active:scale-95 ${className}`}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
      ) : (
        <Moon className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
      )}
    </button>
  );
}
