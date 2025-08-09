import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Eye, Home, Building2 } from 'lucide-react';

interface ImageItem {
  src: string;
  alt: string;
  title: string;
  description: string;
  category: 'moderne' | 'traditionnelle' | 'villa' | 'appartement';
  surface?: string;
  prix?: string;
}

// Catalogue complet des images disponibles
const HOUSE_IMAGES: ImageItem[] = [
  {
    src: "/static/images/modern_house_2.png",
    alt: "Maison moderne 2",
    title: "Villa Moderne Premium",
    description: "Architecture contemporaine avec design épuré",
    category: "moderne",
    surface: "250m²",
    prix: "380,000 TND"
  },
  {
    src: "/static/images/modern_house_3.png", 
    alt: "Maison moderne 3",
    title: "Maison Design Contemporain",
    description: "Lignes modernes et finitions haut de gamme",
    category: "moderne",
    surface: "200m²",
    prix: "320,000 TND"
  },
  {
    src: "/static/images/modern_house_4.png",
    alt: "Maison moderne 4", 
    title: "Villa Architecture Moderne",
    description: "Espace ouvert avec terrasse panoramique",
    category: "villa",
    surface: "300m²",
    prix: "450,000 TND"
  },
  {
    src: "/static/images/modern_house_5.png",
    alt: "Maison moderne 5",
    title: "Résidence Moderne Familiale",
    description: "Parfaite pour famille avec jardin privé",
    category: "moderne",
    surface: "180m²",
    prix: "280,000 TND"
  },
  {
    src: "/static/images/modern_house_6.png",
    alt: "Maison moderne 6",
    title: "Villa Contemporaine Luxe",
    description: "Design sophistiqué avec piscine",
    category: "villa",
    surface: "400m²",
    prix: "620,000 TND"
  },
  {
    src: "/static/images/modern_house_7.png",
    alt: "Maison moderne 7",
    title: "Maison Moderne Écologique",
    description: "Construction durable et éco-responsable",
    category: "moderne",
    surface: "160m²",
    prix: "240,000 TND"
  },
  {
    src: "/static/images/modern_house_8 (1).png",
    alt: "Maison moderne 8",
    title: "Villa Design Minimaliste",
    description: "Architecture épurée et fonctionnelle",
    category: "moderne",
    surface: "220m²",
    prix: "340,000 TND"
  },
  {
    src: "/static/images/modern_house_9.png",
    alt: "Maison moderne 9",
    title: "Résidence Premium Moderne",
    description: "Luxe et confort dans un style contemporain",
    category: "villa",
    surface: "350m²",
    prix: "520,000 TND"
  },
  {
    src: "/static/images/modern_house_10.png",
    alt: "Maison moderne 10",
    title: "Villa Architecturale Unique",
    description: "Design exclusif et innovations technologiques",
    category: "villa",
    surface: "280m²",
    prix: "420,000 TND"
  },
  {
    src: "/static/images/house.png",
    alt: "Maison classique",
    title: "Maison Familiale Traditionnelle",
    description: "Charme authentique tunisien",
    category: "traditionnelle",
    surface: "150m²",
    prix: "180,000 TND"
  },
  {
    src: "/static/images/house2.png",
    alt: "Maison 2",
    title: "Villa Traditionnelle Rénovée",
    description: "Mélange parfait tradition et modernité",
    category: "traditionnelle",
    surface: "200m²",
    prix: "250,000 TND"
  },
  {
    src: "/static/images/house3.png",
    alt: "Maison 3",
    title: "Résidence Familiale Confort",
    description: "Idéale pour grande famille",
    category: "traditionnelle",
    surface: "180m²",
    prix: "220,000 TND"
  },
  {
    src: "/static/images/house4.png",
    alt: "Maison 4",
    title: "Maison de Charme Authentique",
    description: "Architecture traditionnelle tunisienne",
    category: "traditionnelle",
    surface: "160m²",
    prix: "200,000 TND"
  },
  {
    src: "/static/images/house 5.png",
    alt: "Maison 5",
    title: "Villa Familiale Spacieuse",
    description: "Grands espaces et luminosité naturelle",
    category: "villa",
    surface: "240m²",
    prix: "360,000 TND"
  },
  {
    src: "/static/images/house555.png",
    alt: "Maison 555",
    title: "Résidence Moderne Compacte",
    description: "Optimisation d'espace et design intelligent",
    category: "appartement",
    surface: "120m²",
    prix: "150,000 TND"
  },
  {
    src: "/static/images/house11.png",
    alt: "Maison 11",
    title: "Villa Prestige Tunisienne",
    description: "Luxe et tradition dans un écrin de verdure",
    category: "villa",
    surface: "320m²",
    prix: "480,000 TND"
  },
  {
    src: "/static/images/houses.png",
    alt: "Complexe résidentiel",
    title: "Complexe Résidentiel Moderne",
    description: "Plusieurs unités dans un cadre sécurisé",
    category: "appartement",
    surface: "100-150m²",
    prix: "120,000 - 200,000 TND"
  },
  {
    src: "/static/images/hous7.png",
    alt: "Maison 7",
    title: "Villa Méditerranéenne",
    description: "Style méditerranéen adapté au climat tunisien",
    category: "villa",
    surface: "260m²",
    prix: "390,000 TND"
  },
  {
    src: "/static/images/d1.png",
    alt: "Design maison 1",
    title: "Concept Architectural Innovant",
    description: "Design futuriste et fonctionnalités intelligentes",
    category: "moderne",
    surface: "190m²",
    prix: "300,000 TND"
  }
];

interface ImageGalleryProps {
  maxImages?: number;
  showControls?: boolean;
  category?: 'moderne' | 'traditionnelle' | 'villa' | 'appartement' | 'all';
  className?: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ 
  maxImages, 
  showControls = true, 
  category = 'all',
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [filteredImages, setFilteredImages] = useState<ImageItem[]>(HOUSE_IMAGES);

  // Filtrer les images selon la catégorie
  useEffect(() => {
    let filtered = HOUSE_IMAGES;
    
    if (category !== 'all') {
      filtered = HOUSE_IMAGES.filter(img => img.category === category);
    }
    
    if (maxImages) {
      filtered = filtered.slice(0, maxImages);
    }
    
    setFilteredImages(filtered);
    setCurrentIndex(0);
  }, [category, maxImages]);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredImages.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);
  };

  const openModal = (image: ImageItem) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  // Auto-rotation des images
  useEffect(() => {
    if (filteredImages.length > 1) {
      const interval = setInterval(nextImage, 4000);
      return () => clearInterval(interval);
    }
  }, [filteredImages.length]);

  return (
    <div className={`relative ${className}`}>
      {/* Galerie principale */}
      <div className="relative overflow-hidden rounded-2xl shadow-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <img
              src={filteredImages[currentIndex]?.src}
              alt={filteredImages[currentIndex]?.alt}
              className="w-full h-80 sm:h-96 object-cover"
            />
            
            {/* Overlay avec informations */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h3 className="text-xl font-bold mb-1">
                {filteredImages[currentIndex]?.title}
              </h3>
              <p className="text-sm text-gray-200 mb-2">
                {filteredImages[currentIndex]?.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm">
                  <span className="flex items-center space-x-1">
                    <Home className="w-4 h-4" />
                    <span>{filteredImages[currentIndex]?.surface}</span>
                  </span>
                  <span className="text-yellow-400 font-semibold">
                    {filteredImages[currentIndex]?.prix}
                  </span>
                </div>
                
                <button
                  onClick={() => openModal(filteredImages[currentIndex])}
                  className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg text-sm hover:bg-white/30 transition-colors flex items-center space-x-1"
                >
                  <Eye className="w-4 h-4" />
                  <span>Voir plus</span>
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Contrôles de navigation */}
        {showControls && filteredImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Indicateurs de pagination */}
        {filteredImages.length > 1 && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex space-x-2">
            {filteredImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal pour vue détaillée */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <img
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  className="w-full h-80 sm:h-96 object-cover rounded-t-2xl"
                />
                
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedImage.title}
                    </h2>
                    <p className="text-gray-600 mb-4">
                      {selectedImage.description}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {selectedImage.prix}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Building2 className="w-4 h-4 mr-1" />
                      {selectedImage.surface}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Catégorie:</span>
                    <span className="ml-2 capitalize">{selectedImage.category}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Surface:</span>
                    <span className="ml-2">{selectedImage.surface}</span>
                  </div>
                </div>

                <div className="mt-6 flex space-x-3">
                  <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                    Demander un devis
                  </button>
                  <button className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                    Plus d'infos
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Composant pour petite galerie en grille
export const ImageGrid: React.FC<{ maxImages?: number; className?: string }> = ({ 
  maxImages = 6, 
  className = '' 
}) => {
  const displayImages = HOUSE_IMAGES.slice(0, maxImages);

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 ${className}`}>
      {displayImages.map((image, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="relative group cursor-pointer overflow-hidden rounded-lg"
        >
          <img
            src={image.src}
            alt={image.alt}
            className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-300"
          />
          
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="text-white text-center">
              <h4 className="font-semibold text-sm mb-1">{image.title}</h4>
              <p className="text-xs">{image.surface}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export { HOUSE_IMAGES };
