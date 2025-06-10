/**
 * Composant d'en-tête héro avec image de fond pour Housy
 * 
 * Features:
 * - Image de fond responsive
 * - Overlay dégradé pour la lisibilité
 * - Bouton d'action optionnel
 * - Design moderne et élégant
 * 
 * @author Housy Development Team
 */

import React from 'react';
import { Button } from '../ui/button';

interface HeroHeaderProps {
  title: string;
  subtitle?: string;
  imagePath: string;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}

const HeroHeader: React.FC<HeroHeaderProps> = ({
  title,
  subtitle,
  imagePath,
  actionButton
}) => {
  return (
    <div className="relative w-full h-64 md:h-80 mb-6 rounded-xl overflow-hidden">
      {/* Image de fond */}
      <div className="absolute inset-0">        <img 
          src={imagePath} 
          alt={title} 
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback si l'image n'existe pas - utilise une classe CSS au lieu d'innerHTML
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement!;
            parent.className = "w-full h-full bg-gradient-to-r from-orange-500 to-amber-500";
          }}
        />
        {/* Overlay dégradé pour améliorer la lisibilité du texte */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30"></div>
      </div>
      
      {/* Contenu */}
      <div className="relative h-full flex flex-col justify-center px-6 md:px-10">
        <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
          {title}
        </h1>
        {subtitle && (
          <p className="text-white/90 text-lg md:text-xl max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
      
      {/* Bouton d'action (optionnel) */}
      {actionButton && (
        <div className="absolute top-6 right-6">
          <Button
            onClick={actionButton.onClick}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02]"
          >
            {actionButton.label}
          </Button>
        </div>
      )}
    </div>
  );
};

export default HeroHeader;
