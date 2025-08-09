/**
 * GooeyNav Component - Inspired by ReactBits
 * Optimized for Housy Tunisia navigation with fluid animations
 * Perfect for quick access menus and dynamic navigation elements
 */

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string | number;
  icon: React.ReactNode;
  label: string;
  color?: string;
  action?: () => void;
  isActive?: boolean;
  badge?: string | number;
  disabled?: boolean;
}

interface GooeyNavProps {
  items: NavItem[];
  direction?: 'horizontal' | 'vertical' | 'radial';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  triggerIcon?: React.ReactNode;
  triggerLabel?: string;
  expandOnHover?: boolean;
  autoClose?: boolean;
  position?: 'center' | 'start' | 'end';
  gooeyEffect?: boolean;
  background?: string;
  theme?: 'light' | 'dark' | 'construction';
}

export const GooeyNav: React.FC<GooeyNavProps> = ({
  items,
  direction = 'radial',
  size = 'md',
  className,
  triggerIcon,
  triggerLabel = "Menu",
  expandOnHover = false,
  autoClose = true,
  position = 'center',
  gooeyEffect = true,
  background = "bg-blue-500",
  theme = 'construction'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: { trigger: 'w-12 h-12', item: 'w-10 h-10', text: 'text-xs' },
    md: { trigger: 'w-16 h-16', item: 'w-12 h-12', text: 'text-sm' },
    lg: { trigger: 'w-20 h-20', item: 'w-16 h-16', text: 'text-base' }
  };

  const themeColors = {
    light: {
      trigger: 'bg-white text-gray-700 shadow-lg',
      item: 'bg-white text-gray-700 shadow-md',
      overlay: 'bg-black bg-opacity-20'
    },
    dark: {
      trigger: 'bg-gray-800 text-white shadow-lg',
      item: 'bg-gray-700 text-white shadow-md',
      overlay: 'bg-black bg-opacity-40'
    },
    construction: {
      trigger: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg',
      item: 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md',
      overlay: 'bg-blue-900 bg-opacity-20'
    }
  };

  const handleTriggerClick = () => {
    if (!expandOnHover) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleItemClick = (item: NavItem) => {
    if (!item.disabled && item.action) {
      item.action();
      if (autoClose) {
        setIsExpanded(false);
      }
    }
  };

  const getItemPosition = (index: number) => {
    const totalItems = items.length;
    const angleStep = direction === 'radial' ? (Math.PI * 2) / totalItems : 0;
    const radius = size === 'sm' ? 80 : size === 'md' ? 100 : 120;

    switch (direction) {
      case 'horizontal':
        return {
          x: (index - Math.floor(totalItems / 2)) * (size === 'sm' ? 60 : size === 'md' ? 72 : 88),
          y: 0
        };
      case 'vertical':
        return {
          x: 0,
          y: (index - Math.floor(totalItems / 2)) * (size === 'sm' ? 60 : size === 'md' ? 72 : 88)
        };
      case 'radial':
      default:
        const angle = (index * angleStep) - (Math.PI / 2); // Start from top
        return {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius
        };
    }
  };

  const positionClasses = {
    center: 'items-center justify-center',
    start: 'items-start justify-start',
    end: 'items-end justify-end'
  };

  return (
    <div className={cn("relative", className)}>
      {/* Backdrop */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className={cn(
              "fixed inset-0 z-40",
              themeColors[theme].overlay
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => autoClose && setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      <div 
        ref={containerRef}
        className={cn(
          "relative z-50 flex",
          positionClasses[position]
        )}
        onMouseEnter={() => expandOnHover && setIsExpanded(true)}
        onMouseLeave={() => expandOnHover && setIsExpanded(false)}
      >
        {/* Gooey Filter */}
        {gooeyEffect && (
          <svg className="absolute inset-0 pointer-events-none" style={{ filter: 'url(#gooey)' }}>
            <defs>
              <filter id="gooey">
                <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                <feColorMatrix
                  in="blur"
                  mode="matrix"
                  values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
                  result="gooey"
                />
                <feBlend in="SourceGraphic" in2="gooey" />
              </filter>
            </defs>
          </svg>
        )}

        {/* Items Container */}
        <div className="relative">
          {/* Navigation Items */}
          <AnimatePresence>
            {isExpanded && items.map((item, index) => {
              const position = getItemPosition(index);
              
              return (
                <motion.button
                  key={item.id}
                  className={cn(
                    "absolute rounded-full border-2 border-white/20 backdrop-blur-sm",
                    "flex items-center justify-center transition-all duration-200",
                    "hover:scale-110 hover:shadow-lg",
                    sizeClasses[size].item,
                    themeColors[theme].item,
                    item.isActive && "ring-2 ring-white/50",
                    item.disabled && "opacity-50 cursor-not-allowed",
                    item.color || ""
                  )}
                  style={{
                    transform: `translate(-50%, -50%)`,
                    left: '50%',
                    top: '50%'
                  }}
                  initial={{ 
                    scale: 0, 
                    x: position.x * 0.2, 
                    y: position.y * 0.2,
                    opacity: 0 
                  }}
                  animate={{ 
                    scale: 1, 
                    x: position.x, 
                    y: position.y,
                    opacity: 1 
                  }}
                  exit={{ 
                    scale: 0, 
                    x: position.x * 0.2, 
                    y: position.y * 0.2,
                    opacity: 0 
                  }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 20,
                    delay: index * 0.05
                  }}
                  onClick={() => handleItemClick(item)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="relative">
                    {item.icon}
                    
                    {/* Badge */}
                    {item.badge && (
                      <motion.div
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {item.badge}
                      </motion.div>
                    )}
                  </div>

                  {/* Label Tooltip */}
                  <AnimatePresence>
                    {hoveredItem === item.id && (
                      <motion.div
                        className={cn(
                          "absolute whitespace-nowrap px-2 py-1 rounded shadow-lg z-10",
                          "bg-gray-900 text-white text-xs",
                          direction === 'vertical' ? "left-full ml-2" : "top-full mt-2"
                        )}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                      >
                        {item.label}
                        
                        {/* Arrow */}
                        <div 
                          className={cn(
                            "absolute w-2 h-2 bg-gray-900 transform rotate-45",
                            direction === 'vertical' 
                              ? "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2"
                              : "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
                          )}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </AnimatePresence>

          {/* Trigger Button */}
          <motion.button
            className={cn(
              "relative rounded-full border-2 border-white/20 backdrop-blur-sm",
              "flex flex-col items-center justify-center transition-all duration-300",
              "hover:scale-105 hover:shadow-xl",
              sizeClasses[size].trigger,
              themeColors[theme].trigger,
              isExpanded && "shadow-2xl scale-110"
            )}
            onClick={handleTriggerClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {triggerIcon || (
                <svg 
                  className={cn(
                    "transition-all duration-300",
                    size === 'sm' ? "w-5 h-5" : size === 'md' ? "w-6 h-6" : "w-8 h-8"
                  )} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d={isExpanded 
                      ? "M6 18L18 6M6 6l12 12" 
                      : "M4 6h16M4 12h16M4 18h16"
                    } 
                  />
                </svg>
              )}
            </motion.div>
            
            {/* Trigger Label */}
            {!isExpanded && triggerLabel && size !== 'sm' && (
              <motion.span 
                className={cn("mt-1 font-medium", sizeClasses[size].text)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {triggerLabel}
              </motion.span>
            )}

            {/* Ripple Effect */}
            <motion.div
              className="absolute inset-0 rounded-full bg-white/20"
              initial={{ scale: 0, opacity: 0 }}
              animate={isExpanded ? { scale: 2, opacity: 0 } : {}}
              transition={{ duration: 0.6 }}
            />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default GooeyNav;
