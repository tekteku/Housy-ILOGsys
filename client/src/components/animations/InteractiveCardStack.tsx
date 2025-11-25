import React, { useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

interface CardData {
  id: number;
  image?: string;
  title?: string;
  content?: React.ReactNode;
}

interface CardRotateProps {
  children: React.ReactNode;
  onSendToBack: () => void;
  sensitivity: number;
}

function CardRotate({ children, onSendToBack, sensitivity }: CardRotateProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [60, -60]);
  const rotateY = useTransform(x, [-100, 100], [-60, 60]);

  function handleDragEnd(_: any, info: any) {
    if (
      Math.abs(info.offset.x) > sensitivity ||
      Math.abs(info.offset.y) > sensitivity
    ) {
      onSendToBack();
    } else {
      x.set(0);
      y.set(0);
    }
  }

  return (
    <motion.div
      className="absolute cursor-grab"
      style={{ x, y, rotateX, rotateY }}
      drag
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.6}
      whileTap={{ cursor: "grabbing" }}
      onDragEnd={handleDragEnd}
    >
      {children}
    </motion.div>
  );
}

interface StackProps {
  randomRotation?: boolean;
  sensitivity?: number;
  cardDimensions?: { width: number; height: number };
  cardsData?: CardData[];
  animationConfig?: { stiffness: number; damping: number };
  sendToBackOnClick?: boolean;
  className?: string;
}

const InteractiveCardStack: React.FC<StackProps> = ({
  randomRotation = false,
  sensitivity = 200,
  cardDimensions = { width: 280, height: 200 },
  cardsData = [
    { 
      id: 1, 
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop",
      title: "Projet Villa Moderne"
    },
    { 
      id: 2, 
      image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop",
      title: "Appartement Luxe"
    },
    { 
      id: 3, 
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop",
      title: "Maison Familiale"
    },
    { 
      id: 4, 
      image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop",
      title: "Studio Design"
    }
  ],
  animationConfig = { stiffness: 260, damping: 20 },
  sendToBackOnClick = false,
  className = ""
}) => {
  const [cards, setCards] = useState(cardsData);

  const sendToBack = (id: number) => {
    setCards((prev) => {
      const newCards = [...prev];
      const index = newCards.findIndex((card) => card.id === id);
      const [card] = newCards.splice(index, 1);
      newCards.unshift(card);
      return newCards;
    });
  };

  return (
    <div
      className={`relative ${className}`}
      style={{
        width: cardDimensions.width,
        height: cardDimensions.height,
        perspective: 600,
      }}
    >
      {cards.map((card, index) => {
        const randomRotate = randomRotation
          ? Math.random() * 10 - 5
          : 0;

        return (
          <CardRotate
            key={card.id}
            onSendToBack={() => sendToBack(card.id)}
            sensitivity={sensitivity}
          >
            <motion.div
              className="rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-white"
              onClick={() => sendToBackOnClick && sendToBack(card.id)}
              animate={{
                rotateZ: (cards.length - index - 1) * 4 + randomRotate,
                scale: 1 + index * 0.06 - cards.length * 0.06,
                transformOrigin: "90% 90%",
              }}
              initial={false}
              transition={{
                type: "spring",
                stiffness: animationConfig.stiffness,
                damping: animationConfig.damping,
              }}
              style={{
                width: cardDimensions.width,
                height: cardDimensions.height,
              }}
            >
              {card.image ? (
                <>
                  <img
                    src={card.image}
                    alt={card.title || `card-${card.id}`}
                    className="w-full h-3/4 object-cover pointer-events-none"
                  />
                  {card.title && (
                    <div className="p-3 bg-white">
                      <h3 className="text-sm font-semibold text-gray-800 truncate">
                        {card.title}
                      </h3>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {card.content}
                </div>
              )}
            </motion.div>
          </CardRotate>
        );
      })}
    </div>
  );
};

export default InteractiveCardStack;
