/**
 * Enhanced Stack Component - Inspired by ReactBits
 * Optimized for Housy Tunisia construction management
 * Perfect for project cards, material displays, and team showcases
 */

import React, { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface StackItem {
  id: string | number;
  content: React.ReactNode;
  color?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

interface EnhancedStackProps {
  items: StackItem[];
  maxVisible?: number;
  stackOffset?: number;
  rotationRange?: number;
  scaleStep?: number;
  onItemClick?: (item: StackItem, index: number) => void;
  onItemDismiss?: (item: StackItem, index: number) => void;
  className?: string;
  direction?: 'vertical' | 'horizontal' | 'fan';
  interactive?: boolean;
  autoRotate?: boolean;
}

export const EnhancedStack: React.FC<EnhancedStackProps> = ({
  items,
  maxVisible = 5,
  stackOffset = 8,
  rotationRange = 10,
  scaleStep = 0.05,
  onItemClick,
  onItemDismiss,
  className,
  direction = 'vertical',
  interactive = true,
  autoRotate = false
}) => {
  const [visibleItems, setVisibleItems] = useState(items.slice(0, maxVisible));
  const [draggedItem, setDraggedItem] = useState<string | number | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 30 });
  const springY = useSpring(y, { stiffness: 300, damping: 30 });

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 shadow-red-200';
      case 'high': return 'border-orange-500 shadow-orange-200';
      case 'medium': return 'border-blue-500 shadow-blue-200';
      case 'low': return 'border-green-500 shadow-green-200';
      default: return 'border-gray-300 shadow-gray-200';
    }
  };

  const getStackTransform = (index: number) => {
    const baseOffset = index * stackOffset;
    const rotation = autoRotate ? (Math.random() - 0.5) * rotationRange : 0;
    const scale = 1 - (index * scaleStep);
    
    switch (direction) {
      case 'horizontal':
        return {
          x: baseOffset,
          y: 0,
          rotate: rotation,
          scale,
          zIndex: visibleItems.length - index
        };
      case 'fan':
        return {
          x: Math.sin((index / visibleItems.length) * Math.PI - Math.PI/2) * 50,
          y: baseOffset * 0.5,
          rotate: ((index / visibleItems.length) - 0.5) * 30,
          scale,
          zIndex: visibleItems.length - index
        };
      default: // vertical
        return {
          x: 0,
          y: baseOffset,
          rotate: rotation,
          scale,
          zIndex: visibleItems.length - index
        };
    }
  };

  const handleItemDrag = (index: number, info: any) => {
    const threshold = 100;
    const item = visibleItems[index];
    
    if (Math.abs(info.offset.x) > threshold || Math.abs(info.offset.y) > threshold) {
      // Item dismissed
      if (onItemDismiss) {
        onItemDismiss(item, index);
      }
      
      // Remove from visible items and add next item if available
      const newVisibleItems = visibleItems.filter((_, i) => i !== index);
      const nextItemIndex = maxVisible + (items.length - visibleItems.length);
      
      if (items[nextItemIndex]) {
        newVisibleItems.push(items[nextItemIndex]);
      }
      
      setVisibleItems(newVisibleItems);
    }
  };

  const handleItemClick = (item: StackItem, index: number) => {
    if (onItemClick && !draggedItem) {
      onItemClick(item, index);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full h-96 flex items-center justify-center perspective-1000",
        className
      )}
    >
      <AnimatePresence>
        {visibleItems.map((item, index) => {
          const transform = getStackTransform(index);
          
          return (
            <motion.div
              key={`${item.id}-${index}`}
              className={cn(
                "absolute w-80 h-64 bg-white rounded-xl shadow-lg cursor-pointer",
                "border-2 transition-all duration-200",
                getPriorityColor(item.priority),
                interactive && "hover:shadow-xl hover:scale-105"
              )}
              style={{
                ...transform,
                transformStyle: "preserve-3d"
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: transform.scale,
                x: transform.x,
                y: transform.y,
                rotate: transform.rotate,
                zIndex: transform.zIndex
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.8,
                transition: { duration: 0.3 }
              }}
              drag={interactive}
              dragConstraints={containerRef}
              dragElastic={0.2}
              whileDrag={{ 
                scale: 1.1, 
                zIndex: 1000,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
              }}
              onDragStart={() => setDraggedItem(item.id)}
              onDragEnd={(_, info) => {
                setDraggedItem(null);
                handleItemDrag(index, info);
              }}
              onClick={() => handleItemClick(item, index)}
              whileHover={interactive ? { 
                y: transform.y - 10,
                transition: { type: "spring", stiffness: 300 }
              } : undefined}
            >
              <div className="p-6 h-full flex flex-col justify-between overflow-hidden">
                {item.content}
                
                {/* Stack indicator */}
                {index === 0 && visibleItems.length > 1 && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    {visibleItems.length} items
                  </div>
                )}
                
                {/* Priority indicator */}
                {item.priority && (
                  <div className={cn(
                    "absolute bottom-2 left-2 w-3 h-3 rounded-full",
                    item.priority === 'urgent' && "bg-red-500",
                    item.priority === 'high' && "bg-orange-500", 
                    item.priority === 'medium' && "bg-blue-500",
                    item.priority === 'low' && "bg-green-500"
                  )} />
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
      
      {/* Empty state */}
      {visibleItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-500"
        >
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-lg font-medium">No items in stack</p>
          <p className="text-sm">Add some items to see the stack in action</p>
        </motion.div>
      )}
    </div>
  );
};

export default EnhancedStack;
