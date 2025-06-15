import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button'
}) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white bg-transparent',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 hover:text-gray-900'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    icon: 'p-2 w-10 h-10'
  };

  return (
    <motion.button
      type={type}
      className={`
        ${variants[variant]} 
        ${sizes[size]} 
        ${className}
        rounded-lg font-medium shadow-lg
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        relative overflow-hidden
      `}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ 
        scale: disabled ? 1 : 1.05,
        boxShadow: disabled ? undefined : "0 10px 25px rgba(0,0,0,0.2)"
      }}
      whileTap={{ 
        scale: disabled ? 1 : 0.95
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 17
      }}
    >
      <motion.div
        className="absolute inset-0 bg-white opacity-0"
        whileHover={{ opacity: disabled ? 0 : 0.1 }}
        transition={{ duration: 0.2 }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

export default AnimatedButton;
