/**
 * ChromaGrid Component - Inspired by ReactBits
 * Optimized for Housy Tunisia construction materials and project galleries
 * Features dynamic color-coding, priority visualization, and interactive filtering
 */

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface GridItem {
  id: string | number;
  title: string;
  subtitle?: string;
  image?: string;
  color?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'active' | 'pending' | 'completed' | 'cancelled';
  metadata?: Record<string, any>;
  onClick?: () => void;
}

interface ChromaGridProps {
  items: GridItem[];
  columns?: 2 | 3 | 4 | 5 | 6;
  gap?: number;
  colorScheme?: 'construction' | 'materials' | 'projects' | 'status' | 'priority';
  showFilters?: boolean;
  enableHover?: boolean;
  enableSelection?: boolean;
  selectedItems?: (string | number)[];
  onItemSelect?: (item: GridItem) => void;
  onItemsChange?: (items: GridItem[]) => void;
  className?: string;
  itemClassName?: string;
  animated?: boolean;
}

export const ChromaGrid: React.FC<ChromaGridProps> = ({
  items,
  columns = 3,
  gap = 16,
  colorScheme = 'construction',
  showFilters = false,
  enableHover = true,
  enableSelection = false,
  selectedItems = [],
  onItemSelect,
  onItemsChange,
  className,
  itemClassName,
  animated = true
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [hoveredItem, setHoveredItem] = useState<string | number | null>(null);

  // Color schemes for different use cases
  const colorSchemes = {
    construction: {
      low: 'from-green-400 to-emerald-600',
      medium: 'from-blue-400 to-cyan-600', 
      high: 'from-orange-400 to-amber-600',
      urgent: 'from-red-400 to-rose-600',
      default: 'from-gray-400 to-slate-600'
    },
    materials: {
      concrete: 'from-gray-500 to-gray-700',
      steel: 'from-blue-500 to-indigo-700',
      wood: 'from-amber-500 to-orange-700',
      glass: 'from-cyan-400 to-blue-500',
      brick: 'from-red-500 to-orange-600',
      default: 'from-neutral-400 to-neutral-600'
    },
    projects: {
      residential: 'from-green-500 to-emerald-700',
      commercial: 'from-blue-500 to-indigo-700',
      industrial: 'from-purple-500 to-violet-700',
      infrastructure: 'from-orange-500 to-red-600',
      default: 'from-gray-500 to-slate-700'
    },
    status: {
      active: 'from-green-400 to-emerald-600',
      pending: 'from-yellow-400 to-orange-500',
      completed: 'from-blue-400 to-indigo-600',
      cancelled: 'from-red-400 to-rose-600',
      default: 'from-gray-400 to-slate-600'
    },
    priority: {
      low: 'from-green-400 to-emerald-500',
      medium: 'from-blue-400 to-cyan-500',
      high: 'from-orange-400 to-amber-500', 
      urgent: 'from-red-400 to-rose-500',
      default: 'from-gray-400 to-slate-500'
    }
  };
  const getItemColor = (item: GridItem) => {
    if (item.color) return item.color;
    
    switch (colorScheme) {
      case 'priority':
        const priorityScheme = colorSchemes.priority;
        return priorityScheme[item.priority || 'default' as keyof typeof priorityScheme];
      case 'status':
        const statusScheme = colorSchemes.status;
        return statusScheme[item.status || 'default' as keyof typeof statusScheme];
      case 'materials':
        const materialsScheme = colorSchemes.materials;
        const materialKey = item.category?.toLowerCase() as keyof typeof materialsScheme;
        return materialsScheme[materialKey] || materialsScheme.default;
      case 'projects':
        const projectsScheme = colorSchemes.projects;
        const projectKey = item.category?.toLowerCase() as keyof typeof projectsScheme;
        return projectsScheme[projectKey] || projectsScheme.default;
      case 'construction':
      default:
        const constructionScheme = colorSchemes.construction;
        return constructionScheme[item.priority || 'default' as keyof typeof constructionScheme];
    }
  };

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return items;
    
    return items.filter(item => {
      switch (colorScheme) {
        case 'priority':
          return item.priority === activeFilter;
        case 'status':
          return item.status === activeFilter;
        case 'materials':
        case 'projects':
          return item.category?.toLowerCase() === activeFilter;
        default:
          return true;
      }
    });
  }, [items, activeFilter, colorScheme]);

  const filterOptions = useMemo(() => {
    const uniqueValues = new Set<string>();
    
    items.forEach(item => {
      switch (colorScheme) {
        case 'priority':
          if (item.priority) uniqueValues.add(item.priority);
          break;
        case 'status':
          if (item.status) uniqueValues.add(item.status);
          break;
        case 'materials':
        case 'projects':
          if (item.category) uniqueValues.add(item.category.toLowerCase());
          break;
      }
    });
    
    return ['all', ...Array.from(uniqueValues)];
  }, [items, colorScheme]);

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  };

  const handleItemClick = (item: GridItem) => {
    if (enableSelection && onItemSelect) {
      onItemSelect(item);
    } else if (item.onClick) {
      item.onClick();
    }
  };

  const isSelected = (itemId: string | number) => {
    return selectedItems.includes(itemId);
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Filters */}
      {showFilters && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map(option => (
              <button
                key={option}
                onClick={() => setActiveFilter(option)}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium transition-all duration-200",
                  "border-2 capitalize",
                  activeFilter === option
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-300"
                )}
              >
                {option}
                <span className="ml-2 text-xs bg-black bg-opacity-20 px-2 py-1 rounded-full">
                  {option === 'all' ? items.length : 
                   items.filter(item => {
                     switch (colorScheme) {
                       case 'priority': return item.priority === option;
                       case 'status': return item.status === option;
                       case 'materials':
                       case 'projects': return item.category?.toLowerCase() === option;
                       default: return false;
                     }
                   }).length}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      <div 
        className={cn(
          "grid gap-4",
          gridCols[columns]
        )}
        style={{ gap: `${gap}px` }}
      >
        <AnimatePresence>
          {filteredItems.map((item, index) => {
            const colorClass = getItemColor(item);
            const selected = isSelected(item.id);
            const hovered = hoveredItem === item.id;
              return (
              <motion.div
                key={`${item.id}-${activeFilter}`}
                layout={animated}
                initial={animated ? { opacity: 0, scale: 0.8, y: 20 } : undefined}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  y: 0,
                  transition: { delay: index * 0.05 }
                }}
                exit={animated ? { 
                  opacity: 0, 
                  scale: 0.8, 
                  y: -20,
                  transition: { duration: 0.2 }
                } : undefined}
                whileHover={enableHover ? { 
                  scale: 1.03,
                  y: -4,
                  transition: { type: "spring", stiffness: 300 }
                } : undefined}
                className={cn(
                  "relative group cursor-pointer rounded-xl overflow-hidden",
                  "bg-gradient-to-br shadow-lg transition-all duration-300",
                  colorClass,
                  selected && "ring-4 ring-blue-400 ring-opacity-50",
                  enableHover && "hover:shadow-xl",
                  itemClassName
                )}
                onClick={() => handleItemClick(item)}
                onMouseEnter={() => enableHover && setHoveredItem(item.id)}
                onMouseLeave={() => enableHover && setHoveredItem(null)}
              >
                {/* Background Image */}
                {item.image && (
                  <div className="absolute inset-0">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30" />
                  </div>
                )}

                {/* Content */}
                <div className="relative p-6 h-40 flex flex-col justify-between text-white">
                  <div>
                    <h3 className="font-bold text-lg mb-1 truncate">
                      {item.title}
                    </h3>
                    {item.subtitle && (
                      <p className="text-sm opacity-90 truncate">
                        {item.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Status/Priority indicator */}
                    <div className="flex items-center gap-2">
                      {item.priority && (
                        <div className={cn(
                          "w-3 h-3 rounded-full",
                          item.priority === 'urgent' && "bg-red-400",
                          item.priority === 'high' && "bg-orange-400",
                          item.priority === 'medium' && "bg-blue-400",
                          item.priority === 'low' && "bg-green-400"
                        )} />
                      )}
                      {item.category && (
                        <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
                          {item.category}
                        </span>
                      )}
                    </div>

                    {/* Selection indicator */}
                    {enableSelection && (
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 border-white",
                        "flex items-center justify-center transition-all",
                        selected && "bg-white"
                      )}>
                        {selected && (
                          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Hover overlay */}
                {enableHover && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hovered ? 1 : 0 }}
                    className="absolute inset-0 bg-white bg-opacity-10 backdrop-blur-sm"
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {filteredItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-600">
            {activeFilter === 'all' 
              ? 'No items to display' 
              : `No items match the "${activeFilter}" filter`}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default ChromaGrid;
