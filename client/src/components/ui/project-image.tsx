import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface ProjectImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'h-32 w-44',
  md: 'h-48 w-64',
  lg: 'h-64 w-96',
  xl: 'h-80 w-112',
};

export function ProjectImage({ 
  src, 
  alt = 'Project image', 
  className = '',
  size = 'md'
}: ProjectImageProps) {
  const [hasError, setHasError] = useState(false);
  
  const handleError = () => {
    setHasError(true);
  };
  
  const defaultImage = '/static/images/projects/default.png';
  
  return (
    <div className={cn(
      "relative overflow-hidden rounded-md bg-neutral-100",
      sizeClasses[size],
      className
    )}>
      <img
        src={hasError || !src ? defaultImage : src}
        alt={alt}
        onError={handleError}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

export default ProjectImage;
