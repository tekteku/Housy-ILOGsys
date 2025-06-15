import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface HousyImageProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  width?: number;
  height?: number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  showFallback?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Composant d'image optimisé pour Housy
 * Gère le fallback, le lazy loading et les erreurs de chargement
 */
export function HousyImage({
  src,
  alt,
  fallbackSrc,
  className = '',
  width,
  height,
  objectFit = 'cover',
  showFallback = true,
  onLoad,
  onError
}: HousyImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  // Image source avec fallback
  const imageSrc = hasError && fallbackSrc ? fallbackSrc : src;

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Loading placeholder */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse flex items-center justify-center">
          <div className="text-gray-500 text-sm">Chargement...</div>
        </div>
      )}

      {/* Image principale */}
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          `object-${objectFit}`,
          "w-full h-full"
        )}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />

      {/* Fallback en cas d'erreur */}
      {hasError && !fallbackSrc && showFallback && (
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="text-2xl font-bold mb-2">HOUSY</div>
            <div className="text-sm opacity-90">Image non disponible</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HousyImage;
