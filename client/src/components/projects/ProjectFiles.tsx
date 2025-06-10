import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { FileDropzone } from '../ui/file-dropzone';
import { 
  FileText, 
  Image, 
  Archive, 
  Video, 
  Music, 
  Download, 
  Eye, 
  Trash2,
  Search,
  Filter,
  Upload,
  FolderOpen,
  Calendar,
  User,
  FileIcon,
  Share2,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Animation imports
import { ModalAnimation, HoverCard, FadeIn } from '../animations';

interface ProjectFile {
  id: string;
  name: string;
  type: 'document' | 'image' | 'video' | 'audio' | 'archive' | 'other';
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  category: 'plans' | 'photos' | 'reports' | 'contracts' | 'permits' | 'other';
  version: string;
  description?: string;
  url: string;
  thumbnail?: string;
  isPublic: boolean;
  tags: string[];
}

interface ProjectFilesProps {
  projectId: string;
}

const mockFiles: ProjectFile[] = [
  {
    id: '1',
    name: 'Plans_Architecturaux_V3.pdf',
    type: 'document',
    size: 2048000,
    uploadedBy: 'Ahmed Ben Ali',
    uploadedAt: '2024-01-15T10:30:00Z',
    category: 'plans',
    version: '3.0',
    description: 'Plans d\'architecture finalisés avec modifications client',
    url: '/files/plans_v3.pdf',
    isPublic: false,
    tags: ['architecture', 'final', 'client']
  },
  {
    id: '2',
    name: 'Photo_Site_Avant_Travaux.jpg',
    type: 'image',
    size: 1024000,
    uploadedBy: 'Mohamed Triki',
    uploadedAt: '2024-01-10T09:15:00Z',
    category: 'photos',
    version: '1.0',
    description: 'État du site avant commencement des travaux',
    url: '/files/site_avant.jpg',
    thumbnail: '/files/thumbnails/site_avant_thumb.jpg',
    isPublic: true,
    tags: ['site', 'avant', 'documentation']
  },
  {
    id: '3',
    name: 'Rapport_Geotechnique.docx',
    type: 'document',
    size: 512000,
    uploadedBy: 'Fatma Sassi',
    uploadedAt: '2024-01-08T14:20:00Z',
    category: 'reports',
    version: '1.0',
    description: 'Étude géotechnique du terrain',
    url: '/files/rapport_geo.docx',
    isPublic: false,
    tags: ['géotechnique', 'sol', 'étude']
  },
  {
    id: '4',
    name: 'Video_Drone_Progress_Jan.mp4',
    type: 'video',
    size: 15728640,
    uploadedBy: 'Karim Mansouri',
    uploadedAt: '2024-01-20T16:45:00Z',
    category: 'photos',
    version: '1.0',
    description: 'Survol drone - progression janvier',
    url: '/files/drone_jan.mp4',
    thumbnail: '/files/thumbnails/drone_jan_thumb.jpg',
    isPublic: true,
    tags: ['drone', 'progression', 'janvier']
  },
  {
    id: '5',
    name: 'Contrat_Sous_Traitant_Electricite.pdf',
    type: 'document',
    size: 768000,
    uploadedBy: 'Salim Khediri',
    uploadedAt: '2024-01-12T11:00:00Z',
    category: 'contracts',
    version: '2.1',
    description: 'Contrat avec entreprise d\'électricité',
    url: '/files/contrat_elec.pdf',
    isPublic: false,
    tags: ['contrat', 'électricité', 'sous-traitant']
  },
  {
    id: '6',
    name: 'Permis_Construire_Approuve.pdf',
    type: 'document',
    size: 1536000,
    uploadedBy: 'Ahmed Ben Ali',
    uploadedAt: '2023-12-15T08:30:00Z',
    category: 'permits',
    version: '1.0',
    description: 'Permis de construire approuvé par la municipalité',
    url: '/files/permis.pdf',
    isPublic: false,
    tags: ['permis', 'construction', 'municipal']
  }
];

export default function ProjectFiles({ projectId }: ProjectFilesProps) {
  const [files] = useState<ProjectFile[]>(mockFiles);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const getFileIcon = (type: ProjectFile['type']) => {
    switch (type) {
      case 'document':
        return <FileText className="h-8 w-8 text-blue-500" />;
      case 'image':
        return <Image className="h-8 w-8 text-green-500" />;
      case 'video':
        return <Video className="h-8 w-8 text-purple-500" />;
      case 'audio':
        return <Music className="h-8 w-8 text-orange-500" />;
      case 'archive':
        return <Archive className="h-8 w-8 text-gray-500" />;
      default:
        return <FileIcon className="h-8 w-8 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: ProjectFile['category']) => {
    switch (category) {
      case 'plans':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'photos':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'reports':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'contracts':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'permits':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || file.category === filterCategory;
    const matchesType = filterType === 'all' || file.type === filterType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const totalFiles = files.length;
  const totalSize = files.reduce((acc, file) => acc + file.size, 0);
  const recentFiles = files.filter(file => 
    new Date(file.uploadedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;

  const handleFileUpload = (uploadedFiles: File[]) => {
    console.log('Files uploaded:', uploadedFiles);
    setIsUploadModalOpen(false);
  };
  const FileGridItem: React.FC<{ file: ProjectFile }> = ({ file }) => (
    <HoverCard className="cursor-pointer group">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {file.thumbnail ? (
                <img
                  src={file.thumbnail}
                  alt={file.name}
                  className="w-full h-32 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  {getFileIcon(file.type)}
                </div>
              )}
            </div>
            <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm line-clamp-2">{file.name}</h4>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {file.description || 'Aucune description'}
            </p>
            
            <div className="flex items-center justify-between">
              <Badge className={getCategoryColor(file.category)}>
                {file.category}
              </Badge>
              <span className="text-xs text-muted-foreground">
                v{file.version}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatFileSize(file.size)}</span>
              <span>{new Date(file.uploadedAt).toLocaleDateString('fr-FR')}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="text-xs">{file.uploadedBy}</span>
              {file.isPublic && (
                <Badge variant="outline" className="ml-auto">
                  Public
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap gap-1 pt-1">
              {file.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {file.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{file.tags.length - 3}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 pt-2 border-t">
            <Button variant="outline" size="sm" className="flex-1">
              <Eye className="h-3 w-3 mr-1" />
              Voir
            </Button>            <Button variant="outline" size="sm" className="flex-1">
              <Download className="h-3 w-3 mr-1" />
              Télécharger
            </Button>
          </div>
        </div>
      </CardContent>
    </HoverCard>
  );
  const FileListItem: React.FC<{ file: ProjectFile }> = ({ file }) => (
    <HoverCard>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            {file.thumbnail ? (
              <img
                src={file.thumbnail}
                alt={file.name}
                className="w-12 h-12 object-cover rounded"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                {getFileIcon(file.type)}
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm truncate">{file.name}</h4>
              <div className="flex items-center gap-2 ml-4">
                <Badge className={getCategoryColor(file.category)}>
                  {file.category}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  v{file.version}
                </span>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground truncate mt-1">
              {file.description || 'Aucune description'}
            </p>
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{formatFileSize(file.size)}</span>
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{file.uploadedBy}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(file.uploadedAt).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>        </div>
      </CardContent>
    </HoverCard>
  );

  return (
    <div className="space-y-6">
      {/* File Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{totalFiles}</p>
              <p className="text-sm text-muted-foreground">Fichiers totaux</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{formatFileSize(totalSize)}</p>
              <p className="text-sm text-muted-foreground">Espace utilisé</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{recentFiles}</p>
              <p className="text-sm text-muted-foreground">Cette semaine</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Gestionnaire de Fichiers
              </CardTitle>
              <CardDescription>
                Organisation et partage des documents du projet
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Téléverser
                  </Button>
                </DialogTrigger>                <DialogContent className="max-w-2xl">
                  <FadeIn>
                    <DialogHeader>
                      <DialogTitle>Téléverser des fichiers</DialogTitle>
                      <DialogDescription>
                        Glissez-déposez vos fichiers ou cliquez pour les sélectionner
                      </DialogDescription>
                    </DialogHeader>
                    <FileDropzone
                      onFilesChange={handleFileUpload}
                      acceptedFileTypes={[
                        '.pdf',
                        '.doc',
                        '.docx', 
                        'image/*',
                        '.mp4', '.avi', '.mov',
                        '.zip',
                        '.rar'
                      ]}
                      maxFileSize={50 * 1024 * 1024} // 50MB
                      maxFiles={10}
                    />
                  </FadeIn>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher des fichiers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes catégories</SelectItem>
                  <SelectItem value="plans">Plans</SelectItem>
                  <SelectItem value="photos">Photos</SelectItem>
                  <SelectItem value="reports">Rapports</SelectItem>
                  <SelectItem value="contracts">Contrats</SelectItem>
                  <SelectItem value="permits">Permis</SelectItem>
                  <SelectItem value="other">Autres</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous types</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                  <SelectItem value="video">Vidéos</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="archive">Archives</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex rounded-lg border">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <i className="fas fa-th h-4 w-4"></i>
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <i className="fas fa-list h-4 w-4"></i>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFiles.map(file => (
            <FileGridItem key={file.id} file={file} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredFiles.map(file => (
            <FileListItem key={file.id} file={file} />
          ))}
        </div>
      )}

      {filteredFiles.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucun fichier trouvé</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
