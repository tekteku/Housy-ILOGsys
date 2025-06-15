import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface HoverCardProps {
  children: React.ReactNode;
  className?: string;
  hoverScale?: number;
  shadowIntensity?: 'light' | 'medium' | 'strong';
}

const HoverCard: React.FC<HoverCardProps> = ({
  children,
  className = '',
  hoverScale = 1.03,
  shadowIntensity = 'medium'
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const shadowVariants = {
    light: {
      normal: "0 2px 8px rgba(0,0,0,0.1)",
      hover: "0 8px 25px rgba(0,0,0,0.15)"
    },
    medium: {
      normal: "0 4px 12px rgba(0,0,0,0.1)",
      hover: "0 12px 35px rgba(0,0,0,0.2)"
    },
    strong: {
      normal: "0 6px 16px rgba(0,0,0,0.15)",
      hover: "0 16px 45px rgba(0,0,0,0.25)"
    }
  };

  return (
    <motion.div
      className={`${className} cursor-pointer`}
      whileHover={{
        scale: hoverScale,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      animate={{
        boxShadow: isHovered 
          ? shadowVariants[shadowIntensity].hover 
          : shadowVariants[shadowIntensity].normal
      }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {children}
    </motion.div>
  );
};

export default HoverCard;
