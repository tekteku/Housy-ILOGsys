import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface UserAvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  alt = "User",
  fallback,
  size = 'md',
  className = "",
}) => {
  const [hasError, setHasError] = useState(false);
  
  // Size mappings
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  };
  
  // Handle image loading errors
  const handleError = () => {
    setHasError(true);
  };
  
  // Generate initials for fallback
  const getInitials = () => {
    if (fallback) return fallback;
    
    if (alt) {
      return alt
        .split(' ')
        .map(word => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    }
    
    return 'U';
  };
  
  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {src && !hasError ? (
        <AvatarImage 
          src={src} 
          alt={alt} 
          onError={handleError}
        />
      ) : null}
      <AvatarFallback>
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
