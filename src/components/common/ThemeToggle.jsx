import { useState, useEffect } from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

const ThemeToggle = () => {
  // This is a placeholder for theme functionality
  // In a real app, this would toggle between light/dark themes
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // This is where you'd apply the theme to the document
    // For this demo, we'll always use dark theme
    document.documentElement.classList.add('dark');
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-2 rounded-full bg-dark-800 text-dark-400 hover:text-primary-400 focus:outline-none transition-colors duration-300"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <SunIcon className="h-5 w-5" />
      ) : (
        <MoonIcon className="h-5 w-5" />
      )}
    </button>
  );
};

export default ThemeToggle;