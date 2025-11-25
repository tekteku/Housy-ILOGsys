import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'outline';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className, 
  size = 'md',
  variant = 'ghost'
}) => {
  const { theme, toggleTheme } = useTheme();

  const iconSize = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5', 
    lg: 'h-6 w-6'
  }[size];

  const buttonSize = {
    sm: 'icon',
    md: 'icon',
    lg: 'icon'
  }[size] as any;

  return (
    <Button
      variant={variant}
      size={buttonSize}
      onClick={toggleTheme}
      className={cn(
        'relative transition-all duration-200 hover:scale-105',
        className
      )}
      aria-label={`Basculer vers le thème ${theme === 'light' ? 'sombre' : 'lumineux'}`}
    >
      <Sun 
        className={cn(
          iconSize,
          'rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0'
        )} 
      />
      <Moon 
        className={cn(
          iconSize,
          'absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100'
        )} 
      />
    </Button>
  );
};
