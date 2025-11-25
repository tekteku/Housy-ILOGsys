import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Calendar,
  Download, 
  Eye, 
  File,
  FileText,
  Filter,
  Folder,
  FolderOpen,
  Image,
  Plus,
  Search,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FadeIn } from '../../components/animations';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface Document {
  id: string;
  name: string;
  type: 'contract' | 'plan' | 'permit' | 'invoice' | 'photo' | 'report' | 'other';
  category: string;
  projectId: string;
  projectName: string;
  size: number;
  uploadedDate: string;
  uploadedBy: string;
  url: string;
  description?: string;
  isPublic: boolean;
  version?: number;
}

interface Folder {
  id: string;
  name: string;
  projectId: string;
  projectName: string;
  documentCount: number;
  lastModified: string;
}

const mockFolders: Folder[] = [
  {
    id: '1',
    name: 'Villa Moderne Sidi Bou Said',
    projectId: '1',
    projectName: 'Villa Moderne Sidi Bou Said',
    documentCount: 12,
    lastModified: '2024-06-20'
  },
  {
    id: '2',
    name: 'Rénovation Appartement Tunis',
    projectId: '2',
    projectName: 'Rénovation Appartement Tunis',
    documentCount: 8,
    lastModified: '2024-06-25'
  },
  {
    id: '3',
    name: 'Extension Maison Hammamet',
    projectId: '3',
    projectName: 'Extension Maison Hammamet',
    documentCount: 15,
    lastModified: '2024-06-18'
  }
];

const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Contrat de Construction - Villa Sidi Bou Said.pdf',
    type: 'contract',
    category: 'Contractuel',
    projectId: '1',
    projectName: 'Villa Moderne Sidi Bou Said',
    size: 2048000,
    uploadedDate: '2024-06-15',
    uploadedBy: 'Admin',
    url: '/documents/contract-1.pdf',
    description: 'Contrat principal de construction',
    isPublic: true,
    version: 1
  },
  {
    id: '2',
    name: 'Plans Architecturaux - Version Finale.dwg',
    type: 'plan',
    category: 'Plans',
    projectId: '1',
    projectName: 'Villa Moderne Sidi Bou Said',
    size: 15360000,
    uploadedDate: '2024-06-10',
    uploadedBy: 'Architecte',
    url: '/documents/plans-1.dwg',
    description: 'Plans architecturaux définitifs',
    isPublic: true,
    version: 3
  },
  {
    id: '3',
    name: 'Permis de Construire.pdf',
    type: 'permit',
    category: 'Administratif',
    projectId: '1',
    projectName: 'Villa Moderne Sidi Bou Said',
    size: 1024000,
    uploadedDate: '2024-05-20',
    uploadedBy: 'Admin',
    url: '/documents/permit-1.pdf',
    description: 'Autorisation de construction',
    isPublic: true
  },
  {
    id: '4',
    name: 'Facture Matériaux - Juin 2024.pdf',
    type: 'invoice',
    category: 'Financier',
    projectId: '1',
    projectName: 'Villa Moderne Sidi Bou Said',
    size: 512000,
    uploadedDate: '2024-06-30',
    uploadedBy: 'Comptabilité',
    url: '/documents/invoice-1.pdf',
    description: 'Facture fournisseur matériaux',
    isPublic: false
  },
  {
    id: '5',
    name: 'Photos Avancement - Semaine 25.zip',
    type: 'photo',
    category: 'Suivi',
    projectId: '1',
    projectName: 'Villa Moderne Sidi Bou Said',
    size: 25600000,
    uploadedDate: '2024-06-21',
    uploadedBy: 'Chef de Projet',
    url: '/documents/photos-1.zip',
    description: 'Photos de suivi des travaux',
    isPublic: true
  },
  {
    id: '6',
    name: 'Rapport Qualité - Gros Œuvre.pdf',
    type: 'report',
    category: 'Qualité',
    projectId: '1',
    projectName: 'Villa Moderne Sidi Bou Said',
    size: 3072000,
    uploadedDate: '2024-06-18',
    uploadedBy: 'Contrôleur Qualité',
    url: '/documents/report-1.pdf',
    description: 'Rapport de contrôle qualité',
    isPublic: true
  },
  // Documents for other projects
  {
    id: '7',
    name: 'Devis Rénovation - Final.pdf',
    type: 'contract',
    category: 'Contractuel',
    projectId: '2',
    projectName: 'Rénovation Appartement Tunis',
    size: 1536000,
    uploadedDate: '2024-06-20',
    uploadedBy: 'Admin',
    url: '/documents/quote-2.pdf',
    description: 'Devis accepté pour la rénovation',
    isPublic: true
  },
  {
    id: '8',
    name: 'Photos Avant Travaux.jpg',
    type: 'photo',
    category: 'Suivi',
    projectId: '2',
    projectName: 'Rénovation Appartement Tunis',
    size: 5120000,
    uploadedDate: '2024-06-15',
    uploadedBy: 'Client',
    url: '/documents/before-2.jpg',
    description: 'État initial de l\'appartement',
    isPublic: true
  }
];

const documentTypeColors = {
  contract: 'bg-blue-100 text-blue-800',
  plan: 'bg-purple-100 text-purple-800',
  permit: 'bg-green-100 text-green-800',
  invoice: 'bg-yellow-100 text-yellow-800',
  photo: 'bg-pink-100 text-pink-800',
  report: 'bg-indigo-100 text-indigo-800',
  other: 'bg-gray-100 text-gray-800'
};

const documentTypeLabels = {
  contract: 'Contrat',
  plan: 'Plan',
  permit: 'Permis',
  invoice: 'Facture',
  photo: 'Photo',
  report: 'Rapport',
  other: 'Autre'
};

const getFileIcon = (type: string, fileName: string) => {
  if (type === 'photo' || fileName.match(/\.(jpg|jpeg|png|gif|bmp)$/i)) {
    return <Image className="w-4 h-4" />;
  }
  return <FileText className="w-4 h-4" />;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function ClientDocumentsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [viewMode, setViewMode] = useState<'folders' | 'documents'>('folders');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const { data: folders = mockFolders } = useQuery({
    queryKey: ['client-folders'],
    queryFn: async () => {
      return mockFolders;
    }
  });

  const { data: documents = mockDocuments } = useQuery({
    queryKey: ['client-documents', selectedFolder],
    queryFn: async () => {
      if (selectedFolder) {
        return mockDocuments.filter(doc => doc.projectId === selectedFolder);
      }
      return mockDocuments;
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Document téléchargé",
        description: "Votre document a été téléchargé avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ['client-documents'] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du téléchargement.",
        variant: "destructive",
      });
    }
  });

  const filteredDocuments = documents.filter(document => {
    const matchesSearch = document.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         document.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || document.type === typeFilter;
    const matchesProject = projectFilter === 'all' || document.projectId === projectFilter;
    return matchesSearch && matchesType && matchesProject && document.isPublic;
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      uploadMutation.mutate(formData);
    }
  };

  if (viewMode === 'folders') {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes Documents</h1>            <p className="text-gray-600 mt-1">Accédez à tous vos documents de projet</p>
          </div>
          <div className="flex gap-2">            <Button
              variant={(viewMode as 'folders' | 'documents') === 'folders' ? 'default' : 'outline'}
              onClick={() => setViewMode('folders')}
            >
              <Folder className="w-4 h-4 mr-2" />
              Par Projet
            </Button>
            <Button
              variant={(viewMode as 'folders' | 'documents') === 'documents' ? 'default' : 'outline'}
              onClick={() => setViewMode('documents')}
            >
              <File className="w-4 h-4 mr-2" />
              Tous Documents
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Projets</p>
                  <p className="text-2xl font-bold text-gray-900">{folders.length}</p>
                </div>
                <Folder className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Documents</p>
                  <p className="text-2xl font-bold text-green-600">
                    {folders.reduce((sum, folder) => sum + folder.documentCount, 0)}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Contrats</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {documents.filter(d => d.type === 'contract' && d.isPublic).length}
                  </p>
                </div>
                <File className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Plans & Photos</p>
                  <p className="text-2xl font-bold text-pink-600">
                    {documents.filter(d => ['plan', 'photo'].includes(d.type) && d.isPublic).length}
                  </p>
                </div>
                <Image className="h-8 w-8 text-pink-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Folders */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {folders.map((folder) => (
            <Card key={folder.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => { setSelectedFolder(folder.id); setViewMode('documents'); }}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <FolderOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{folder.name}</h3>
                      <p className="text-sm text-gray-600">{folder.documentCount} documents</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Dernière modification</span>
                    <span className="text-gray-900">
                      {new Date(folder.lastModified).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Ouvrir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            {selectedFolder && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setSelectedFolder(null); setViewMode('folders'); }}
                className="text-blue-600"
              >
                ← Retour aux projets
              </Button>
            )}
            <h1 className="text-3xl font-bold text-gray-900">
              {selectedFolder ? 
                folders.find(f => f.id === selectedFolder)?.name || 'Documents' : 
                'Tous les Documents'
              }
            </h1>
          </div>
          <p className="text-gray-600 mt-1">
            {selectedFolder ? 
              'Documents de ce projet' :
              'Tous vos documents de construction'
            }
          </p>
        </div>
        <div className="flex gap-2">          <Button
            variant={(viewMode as 'folders' | 'documents') === 'folders' ? 'default' : 'outline'}
            onClick={() => { setViewMode('folders'); setSelectedFolder(null); }}
          >
            <Folder className="w-4 h-4 mr-2" />
            Par Projet
          </Button>          <Button
            variant={(viewMode as 'folders' | 'documents') === 'documents' ? 'default' : 'outline'}
            onClick={() => setViewMode('documents')}
          >
            <File className="w-4 h-4 mr-2" />
            Tous Documents
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher un document..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Type de document" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="contract">Contrats</SelectItem>
                <SelectItem value="plan">Plans</SelectItem>
                <SelectItem value="permit">Permis</SelectItem>
                <SelectItem value="invoice">Factures</SelectItem>
                <SelectItem value="photo">Photos</SelectItem>
                <SelectItem value="report">Rapports</SelectItem>
                <SelectItem value="other">Autres</SelectItem>
              </SelectContent>
            </Select>
            {!selectedFolder && (
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Projet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les projets</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <div className="space-y-4">
        {filteredDocuments.map((document) => (
          <Card key={document.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    {getFileIcon(document.type, document.name)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{document.name}</h3>
                      <Badge className={documentTypeColors[document.type]}>
                        {documentTypeLabels[document.type]}
                      </Badge>
                      {document.version && (
                        <Badge variant="outline">v{document.version}</Badge>
                      )}
                    </div>
                    
                    {document.description && (
                      <p className="text-sm text-gray-600 mb-2">{document.description}</p>
                    )}
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span>Projet: {document.projectName}</span>
                      <span>Taille: {formatFileSize(document.size)}</span>
                      <span>Ajouté le: {new Date(document.uploadedDate).toLocaleDateString('fr-FR')}</span>
                      <span>Par: {document.uploadedBy}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedDocument(document)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Voir
                      </Button>
                    </DialogTrigger>                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <FadeIn>
                        <DialogHeader>
                          <DialogTitle>{document.name}</DialogTitle>
                        </DialogHeader>
                        {selectedDocument && (
                          <DocumentPreview document={selectedDocument} />
                        )}
                      </FadeIn>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Télécharger
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun document trouvé</h3>
            <p className="text-gray-600">
              {searchTerm || typeFilter !== 'all' || projectFilter !== 'all'
                ? "Aucun document ne correspond à vos critères de recherche."
                : "Aucun document n'est encore disponible pour vos projets."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DocumentPreview({ document }: { document: Document }) {
  return (
    <Tabs defaultValue="info" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="info">Informations</TabsTrigger>
        <TabsTrigger value="preview">Aperçu</TabsTrigger>
      </TabsList>

      <TabsContent value="info" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Détails du Document</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Nom</label>
                <p className="text-gray-900 mt-1">{document.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Type</label>
                <div className="mt-1">
                  <Badge className={documentTypeColors[document.type]}>
                    {documentTypeLabels[document.type]}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Catégorie</label>
                <p className="text-gray-900 mt-1">{document.category}</p>
              </div>
              {document.description && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="text-gray-900 mt-1">{document.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informations Techniques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Projet</label>
                <p className="text-gray-900 mt-1">{document.projectName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Taille</label>
                <p className="text-gray-900 mt-1">{formatFileSize(document.size)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Date d'ajout</label>
                <p className="text-gray-900 mt-1">
                  {new Date(document.uploadedDate).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Ajouté par</label>
                <p className="text-gray-900 mt-1">{document.uploadedBy}</p>
              </div>
              {document.version && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Version</label>
                  <p className="text-gray-900 mt-1">Version {document.version}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center">
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Télécharger ce Document
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="preview" className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aperçu non disponible</h3>
              <p className="text-gray-600 mb-4">
                L'aperçu en ligne n'est pas disponible pour ce type de fichier.
              </p>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Télécharger pour voir le contenu
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
