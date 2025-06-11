/**
 * Composant Hero pour la page d'authentification
 * 
 * Features:
 * - Arrière-plan avec images de construction tunisienne
 * - Animation de particules
 * - Témoignages clients
 * - Statistiques en temps réel
 * - Design responsive et moderne
 * 
 * @author Housy Development Team
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Users, Building, Award, ArrowRight } from 'lucide-react';

// Animation imports
import { FadeIn, StaggeredList } from '../animations';

export function AuthHero() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number }[]>([]);

  const testimonials = [
    {
      name: "Ahmed Ben Salah",
      role: "Propriétaire de Villa",
      location: "Sousse",
      content: "Housy a transformé mon rêve de maison en réalité. L'équipe professionnelle et les outils modernes ont rendu tout le processus fluide et transparent.",
      rating: 5,
      avatar: "AB"
    },
    {
      name: "Adnen Ben Zineb ",
      role: "Architecte",
      location: "Tunis",
      content: "En tant qu'architecte, j'apprécie la précision des calculs et la qualité des matériaux proposés. Une plateforme incontournable pour les professionnels.",
      rating: 5,
      avatar: "LM"
    },
    {
      name: "Mohamed Trabelsi",
      role: "Entrepreneur",
      location: "Sfax",
      content: "La gestion de projet intégrée et les devis automatisés m'ont fait gagner un temps précieux. Excellent service client et support technique.",
      rating: 5,
      avatar: "MT"
    }
  ];

  const stats = [
    { number: "500+", label: "Projets Réalisés", icon: Building },
    { number: "150+", label: "Clients Satisfaits", icon: Users },
    { number: "98%", label: "Taux de Satisfaction", icon: Star },
    { number: "15+", label: "Années d'Expérience", icon: Award }
  ];

  // Animation des témoignages
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Animation des particules
  useEffect(() => {
    const generateParticles = () => {
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1
      }));
      setParticles(newParticles);
    };

    generateParticles();
    
    const interval = setInterval(() => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        y: (particle.y + 0.5) % 100
      })));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 overflow-hidden">
      {/* Particules animées */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
            }}
          />
        ))}
      </div>

      {/* Arrière-plan avec overlay */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Image de fond (construction tunisienne) */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'%3E%3Cdefs%3E%3ClinearGradient id='a' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23ffffff'/%3E%3Cstop offset='1' stop-color='%23e0e7ff'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23a)' width='1200' height='800'/%3E%3Cpath d='M100 300h200v200H100z' fill='%23ddd6fe' opacity='0.3'/%3E%3Cpath d='M400 200h300v300H400z' fill='%23c4b5fd' opacity='0.3'/%3E%3Cpath d='M800 250h200v250H800z' fill='%23a78bfa' opacity='0.3'/%3E%3C/svg%3E")`
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">        {/* Header */}
        <FadeIn direction="down" delay={0.1}>
          <header className="p-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Building className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Housy</span>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">            Version Bêta
          </Badge>
        </header>
        </FadeIn>        {/* Contenu principal */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-4xl mx-auto text-center text-white">
            {/* Titre principal */}
            <FadeIn direction="up" delay={0.2}>
              <div className="mb-8">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Construisez Votre
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                  Avenir en Tunisie
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                La plateforme de construction intelligente qui transforme vos projets immobiliers                en réalité avec des outils modernes et un savoir-faire tunisien authentique.
              </p>
            </div>
            </FadeIn>            {/* Statistiques */}
            <FadeIn direction="up" delay={0.4}>
              <StaggeredList className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/15 transition-all duration-300">
                    <CardContent className="p-4 text-center">
                      <Icon className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white mb-1">{stat.number}</div>
                      <div className="text-sm text-blue-100">{stat.label}</div>
                    </CardContent>                  </Card>
                );
              })}
              </StaggeredList>
            </FadeIn>            {/* Témoignage rotatif */}
            <FadeIn direction="up" delay={0.6}>
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm max-w-2xl mx-auto mb-8">
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-lg text-white mb-4 italic">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {testimonials[currentTestimonial].avatar}
                    </span>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-white">
                      {testimonials[currentTestimonial].name}
                    </div>
                    <div className="text-sm text-blue-200">
                      {testimonials[currentTestimonial].role} • {testimonials[currentTestimonial].location}
                    </div>
                  </div>                </div>
              </CardContent>
            </Card>
            </FadeIn>

            {/* Indicateurs de progression */}
            <div className="flex justify-center space-x-2 mb-8">
              {testimonials.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-8 rounded-full transition-all duration-300 ${
                    index === currentTestimonial ? 'bg-yellow-400' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>            {/* Call to action */}
            <FadeIn direction="up" delay={0.8}>
              <div className="text-center">
              <p className="text-blue-100 mb-4 flex items-center justify-center">
                <ArrowRight className="h-4 w-4 mr-2" />                Rejoignez des centaines de professionnels qui nous font confiance
              </p>
            </div>
            </FadeIn>
          </div>
        </div>

        {/* Footer */}
        <footer className="p-6 text-center text-blue-200 text-sm">
          <p>© 2025 Housy. Propulsé par l'innovation tunisienne.</p>
        </footer>
      </div>
    </div>
  );
}
