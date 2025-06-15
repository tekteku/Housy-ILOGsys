/**
 * Folder Component - Inspired by ReactBits
 * Optimized for Housy Tunisia document management and file organization
 * Perfect for project documents, construction plans, and administrative files
 */

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Folder as FolderIcon, 
  FolderOpen, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive,
  Download,
  Eye,
  Trash2,
  Plus,
  Search,
  Filter
} from "lucide-react";

interface FolderItem {
  id: string | number;
  name: string;
  type: 'file' | 'folder';
  extension?: string;
  size?: string;
  dateModified?: string;
  thumbnail?: string;
  category?: 'document' | 'image' | 'video' | 'audio' | 'archive' | 'other';
  isProtected?: boolean;
  metadata?: Record<string, any>;
}

interface FolderProps {
  items: FolderItem[];
  folderName?: string;
  maxItems?: number;
  stackOffset?: number;
  onItemClick?: (item: FolderItem) => void;
  onItemDelete?: (item: FolderItem) => void;
  onItemDownload?: (item: FolderItem) => void;
  onAddItem?: () => void;
  className?: string;
  viewMode?: 'stack' | 'grid' | 'list';
  enableSearch?: boolean;
  enableFilter?: boolean;
  interactive?: boolean;
}

export const Folder: React.FC<FolderProps> = ({
  items,
  folderName = "Documents",
  maxItems = 8,
  stackOffset = 4,
  onItemClick,
  onItemDelete,
  onItemDownload,
  onAddItem,
  className,
  viewMode = 'stack',
  enableSearch = false,
  enableFilter = false,
  interactive = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [hoveredItem, setHoveredItem] = useState<string | number | null>(null);
  
  const folderRef = useRef<HTMLDivElement>(null);

  const getFileIcon = (item: FolderItem) => {
    if (item.type === 'folder') {
      return <FolderIcon className="w-5 h-5" />;
    }

    switch (item.category) {
      case 'document':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'image':
        return <Image className="w-5 h-5 text-green-500" />;
      case 'video':
        return <Video className="w-5 h-5 text-purple-500" />;
      case 'audio':
        return <Music className="w-5 h-5 text-orange-500" />;
      case 'archive':
        return <Archive className="w-5 h-5 text-yellow-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'document': return 'border-blue-500 bg-blue-50';
      case 'image': return 'border-green-500 bg-green-50';
      case 'video': return 'border-purple-500 bg-purple-50';
      case 'audio': return 'border-orange-500 bg-orange-50';
      case 'archive': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || item.category === filterType || item.type === filterType;
    return matchesSearch && matchesFilter;
  }).slice(0, maxItems);

  const handleFolderClick = () => {
    if (interactive) {
      setIsOpen(!isOpen);
    }
  };

  const handleItemAction = (item: FolderItem, action: 'view' | 'download' | 'delete') => {
    switch (action) {
      case 'view':
        onItemClick?.(item);
        break;
      case 'download':
        onItemDownload?.(item);
        break;
      case 'delete':
        onItemDelete?.(item);
        break;
    }
  };

  const renderStackView = () => (
    <div className="relative w-80 h-64">
      {/* Folder Base */}
      <motion.div
        ref={folderRef}
        className={cn(
          "absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-br from-amber-100 to-orange-200",
          "border-2 border-amber-300 rounded-lg cursor-pointer overflow-hidden",
          "shadow-lg hover:shadow-xl transition-all duration-300",
          isOpen && "border-amber-400"
        )}
        onClick={handleFolderClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Folder Tab */}
        <div className="absolute -top-4 left-4 w-16 h-6 bg-gradient-to-br from-amber-200 to-orange-300 rounded-t-lg border-2 border-amber-300 border-b-0" />
        
        {/* Folder Label */}
        <div className="absolute top-2 left-4 right-4 flex items-center gap-2">
          {isOpen ? <FolderOpen className="w-5 h-5 text-amber-700" /> : <FolderIcon className="w-5 h-5 text-amber-700" />}
          <span className="font-medium text-amber-800 truncate">{folderName}</span>
          <span className="text-xs text-amber-600 ml-auto">{items.length} items</span>
        </div>

        {/* Items Preview */}
        {!isOpen && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex -space-x-2">
              {filteredItems.slice(0, 4).map((item, index) => (
                <motion.div
                  key={item.id}
                  className={cn(
                    "w-8 h-10 bg-white rounded border shadow-sm flex items-center justify-center",
                    getCategoryColor(item.category)
                  )}
                  style={{ zIndex: filteredItems.length - index }}
                  initial={{ x: 0, rotate: 0 }}
                  animate={{ 
                    x: index * stackOffset * 0.5,
                    rotate: (Math.random() - 0.5) * 10 
                  }}
                >
                  {getFileIcon(item)}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute -top-8 left-0 right-0 h-80 bg-white rounded-lg shadow-2xl border-2 border-gray-200 overflow-hidden z-10"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-amber-600" />
                  <h3 className="font-medium">{folderName}</h3>
                </div>
                <div className="flex items-center gap-2">
                  {onAddItem && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddItem();
                      }}
                      className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                  {enableSearch && (
                    <div className="relative">
                      <Search className="w-3 h-3 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-7 pr-2 py-1 text-xs border rounded"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 max-h-64 overflow-y-auto">
              {filteredItems.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <FolderIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No items found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredItems.map((item) => (
                    <motion.div
                      key={item.id}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer group",
                        hoveredItem === item.id && "bg-blue-50"
                      )}
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleItemAction(item, 'view');
                      }}
                      whileHover={{ scale: 1.02 }}
                    >
                      {item.thumbnail ? (
                        <img 
                          src={item.thumbnail} 
                          alt={item.name}
                          className="w-8 h-8 object-cover rounded"
                        />
                      ) : (
                        <div className={cn(
                          "w-8 h-8 rounded flex items-center justify-center",
                          getCategoryColor(item.category)
                        )}>
                          {getFileIcon(item)}
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          {item.size} • {item.dateModified}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleItemAction(item, 'view');
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                        {onItemDownload && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleItemAction(item, 'download');
                            }}
                            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          >
                            <Download className="w-3 h-3" />
                          </button>
                        )}
                        {onItemDelete && !item.isProtected && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleItemAction(item, 'delete');
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-4 gap-4">
      {filteredItems.map((item) => (
        <motion.div
          key={item.id}
          className={cn(
            "p-4 rounded-lg border cursor-pointer group",
            getCategoryColor(item.category)
          )}
          onClick={() => handleItemAction(item, 'view')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="text-center">
            {getFileIcon(item)}
            <p className="text-xs font-medium mt-2 truncate">{item.name}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-1">
      {filteredItems.map((item) => (
        <motion.div
          key={item.id}
          className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
          onClick={() => handleItemAction(item, 'view')}
          whileHover={{ scale: 1.01 }}
        >
          {getFileIcon(item)}
          <span className="text-sm truncate">{item.name}</span>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className={cn("", className)}>
      {viewMode === 'stack' && renderStackView()}
      {viewMode === 'grid' && renderGridView()}
      {viewMode === 'list' && renderListView()}
    </div>
  );
};

export default Folder;
