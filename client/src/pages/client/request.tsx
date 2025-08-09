import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  AlertCircle,
  Building2, 
  Calendar, 
  Camera,
  FileText,
  Home,
  MapPin,
  Phone,
  Plus,
  Save,
  Upload,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  description: string;
  estimatedDuration: string;
  priceRange: string;
}

interface NewRequest {
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  budget: number;
  timeline: string;
  location: string;
  propertyType: string;
  propertySize: number;
  contactPhone: string;
  contactEmail: string;
  specificRequirements: string;
  attachments: File[];
}

const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Construction Résidentielle',
    description: 'Construction de maisons, villas et appartements',
    estimatedDuration: '6-12 mois',
    priceRange: '80,000 - 300,000 TND'
  },
  {
    id: '2',
    name: 'Rénovation',
    description: 'Rénovation complète ou partielle de propriétés existantes',
    estimatedDuration: '2-6 mois',
    priceRange: '20,000 - 150,000 TND'
  },
  {
    id: '3',
    name: 'Extension',
    description: 'Extension de propriétés existantes',
    estimatedDuration: '3-8 mois',
    priceRange: '30,000 - 120,000 TND'
  },
  {
    id: '4',
    name: 'Construction Commerciale',
    description: 'Bureaux, magasins et espaces commerciaux',
    estimatedDuration: '8-18 mois',
    priceRange: '150,000 - 800,000 TND'
  }
];

const propertyTypes = [
  'Maison individuelle',
  'Villa',
  'Appartement',
  'Duplex',
  'Penthouse',
  'Bureau',
  'Magasin',
  'Entrepôt',
  'Terrain',
  'Autre'
];

const timelineOptions = [
  'Moins de 3 mois',
  '3-6 mois',
  '6-12 mois',
  'Plus de 12 mois',
  'Flexible'
];

export default function NewRequestPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<NewRequest>({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    budget: 0,
    timeline: '',
    location: '',
    propertyType: '',
    propertySize: 0,
    contactPhone: '',
    contactEmail: '',
    specificRequirements: '',
    attachments: []
  });

  const { data: categories = mockCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      // Replace with actual API call
      return mockCategories;
    }
  });

  const createRequestMutation = useMutation({
    mutationFn: async (requestData: NewRequest) => {
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      return requestData;
    },
    onSuccess: () => {
      toast({
        title: "Demande créée avec succès",
        description: "Votre demande a été soumise et sera examinée par notre équipe.",
      });
      queryClient.invalidateQueries({ queryKey: ['client-requests'] });
      // Reset form or redirect
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        budget: 0,
        timeline: '',
        location: '',
        propertyType: '',
        propertySize: 0,
        contactPhone: '',
        contactEmail: '',
        specificRequirements: '',
        attachments: []
      });
      setCurrentStep(1);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de votre demande.",
        variant: "destructive",
      });
    }
  });

  const handleInputChange = (field: keyof NewRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    createRequestMutation.mutate(formData);
  };

  const getSelectedCategory = () => {
    return categories.find(cat => cat.id === formData.category);
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.title && formData.description && formData.category;
      case 2:
        return formData.propertyType && formData.location && formData.propertySize > 0;
      case 3:
        return formData.budget > 0 && formData.timeline;
      case 4:
        return formData.contactPhone && formData.contactEmail;
      default:
        return false;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Nouvelle Demande de Projet</h1>
            <p className="text-gray-600">Remplissez ce formulaire pour soumettre votre demande de construction ou rénovation</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="p-1 bg-blue-100 rounded-full mt-1">
              <AlertCircle className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">Comment ça marche ?</h3>
              <p className="text-sm text-blue-800 mb-2">
                Complétez ce formulaire en 4 étapes simples pour recevoir une estimation personnalisée de votre projet.
              </p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  <span>Décrivez votre projet et choisissez une catégorie</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  <span>Précisez les détails de votre propriété</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  <span>Indiquez votre budget et vos délais</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  <span>Fournissez vos coordonnées pour le suivi</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">Étape {currentStep} sur 4</span>
            <span className="text-sm text-gray-600">{Math.round((currentStep / 4) * 100)}% terminé</span>
          </div>
          <Progress value={(currentStep / 4) * 100} className="h-2" />
          <div className="flex justify-between mt-4 text-xs text-gray-600">
            <span className={currentStep >= 1 ? 'text-blue-600 font-medium' : ''}>Projet</span>
            <span className={currentStep >= 2 ? 'text-blue-600 font-medium' : ''}>Propriété</span>
            <span className={currentStep >= 3 ? 'text-blue-600 font-medium' : ''}>Budget & Délais</span>
            <span className={currentStep >= 4 ? 'text-blue-600 font-medium' : ''}>Contact</span>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Project Information */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Informations du Projet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="title">Titre du Projet *</Label>
              <Input
                id="title"
                placeholder="Ex: Construction villa moderne à Sidi Bou Said"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description Détaillée *</Label>
              <Textarea
                id="description"
                placeholder="Décrivez votre projet en détail..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="mt-1 min-h-[120px]"
              />
            </div>

            <div>
              <Label htmlFor="category">Catégorie de Projet *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Sélectionnez une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getSelectedCategory() && (
                <div className="mt-3 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900 font-medium">{getSelectedCategory()?.name}</p>
                  <p className="text-sm text-blue-700 mt-1">{getSelectedCategory()?.description}</p>
                  <div className="flex gap-4 mt-2">
                    <Badge variant="outline" className="text-blue-700 border-blue-300">
                      Durée: {getSelectedCategory()?.estimatedDuration}
                    </Badge>
                    <Badge variant="outline" className="text-blue-700 border-blue-300">
                      Coût: {getSelectedCategory()?.priceRange}
                    </Badge>
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="priority">Priorité</Label>
              <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => handleInputChange('priority', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Priorité Basse</SelectItem>
                  <SelectItem value="medium">Priorité Moyenne</SelectItem>
                  <SelectItem value="high">Priorité Haute</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Property Information */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Informations de la Propriété
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="propertyType">Type de Propriété *</Label>
              <Select value={formData.propertyType} onValueChange={(value) => handleInputChange('propertyType', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Sélectionnez le type de propriété" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location">Localisation *</Label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="location"
                  placeholder="Ex: Sidi Bou Said, Tunis"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="propertySize">Superficie (m²) *</Label>
              <Input
                id="propertySize"
                type="number"
                placeholder="Ex: 250"
                value={formData.propertySize || ''}
                onChange={(e) => handleInputChange('propertySize', Number(e.target.value))}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="specificRequirements">Exigences Spécifiques</Label>
              <Textarea
                id="specificRequirements"
                placeholder="Décrivez toute exigence spécifique (matériaux, style, fonctionnalités...)"
                value={formData.specificRequirements}
                onChange={(e) => handleInputChange('specificRequirements', e.target.value)}
                className="mt-1 min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Budget & Timeline */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Budget & Délais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="budget">Budget Prévu (TND) *</Label>
              <Input
                id="budget"
                type="number"
                placeholder="Ex: 150000"
                value={formData.budget || ''}
                onChange={(e) => handleInputChange('budget', Number(e.target.value))}
                className="mt-1"
              />
              <p className="text-sm text-gray-600 mt-1">
                Indiquez votre budget approximatif pour ce projet
              </p>
            </div>

            <div>
              <Label htmlFor="timeline">Délais Souhaités *</Label>
              <Select value={formData.timeline} onValueChange={(value) => handleInputChange('timeline', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Sélectionnez les délais souhaités" />
                </SelectTrigger>
                <SelectContent>
                  {timelineOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {getSelectedCategory() && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Pour un projet de type "{getSelectedCategory()?.name}", la durée estimée est de {getSelectedCategory()?.estimatedDuration} 
                  avec un coût moyen de {getSelectedCategory()?.priceRange}.
                </AlertDescription>
              </Alert>
            )}

            <div>
              <Label htmlFor="attachments">Documents et Images</Label>
              <div className="mt-1">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Cliquez pour ajouter des fichiers ou glissez-déposez
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Images, PDF, DOC (max 10MB par fichier)
                    </p>
                  </label>
                </div>
                
                {formData.attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formData.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">{file.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Supprimer
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Contact Information */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Informations de Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="contactPhone">Numéro de Téléphone *</Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="contactPhone"
                  placeholder="Ex: +216 12 345 678"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="contactEmail">Adresse Email *</Label>
              <Input
                id="contactEmail"
                type="email"
                placeholder="Ex: votre.email@example.com"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                className="mt-1"
              />
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Ces informations seront utilisées pour vous contacter concernant votre demande. 
                Assurez-vous qu'elles sont correctes et à jour.
              </AlertDescription>
            </Alert>

            {/* Summary */}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé de votre demande</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Projet:</span>
                  <span className="text-gray-900">{formData.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Catégorie:</span>
                  <span className="text-gray-900">{getSelectedCategory()?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Budget:</span>
                  <span className="text-gray-900">{formData.budget.toLocaleString()} TND</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Délais:</span>
                  <span className="text-gray-900">{formData.timeline}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Localisation:</span>
                  <span className="text-gray-900">{formData.location}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          Précédent
        </Button>
        
        {currentStep < 4 ? (
          <Button
            onClick={nextStep}
            disabled={!isStepValid(currentStep)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Suivant
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!isStepValid(currentStep) || createRequestMutation.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {createRequestMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Création en cours...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Créer la Demande
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
