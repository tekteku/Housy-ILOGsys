import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileDropzone } from '@/components/ui/file-dropzone';
import { useNotification } from '@/hooks/use-notification';

// Animation imports
import { FadeIn } from '../animations';

interface CreateMaterialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface MaterialFormData {
  name: string;
  category: string;
  unit: string;
  price: string;
  supplier: string;
  description: string;
  minQuantity: string;
}

const MATERIAL_CATEGORIES = [
  'Ciment et béton',
  'Acier et métaux',
  'Bois et dérivés',
  'Carrelage et revêtements',
  'Isolation',
  'Plomberie',
  'Électricité',
  'Peinture et finitions',
  'Outils et équipements',
  'Autres'
];

const UNITS = [
  'kg',
  'm²',
  'm³',
  'm',
  'pièce',
  'litre',
  'tonne',
  'palette',
  'rouleau',
  'sac'
];

export const CreateMaterialModal: React.FC<CreateMaterialModalProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<MaterialFormData>({
    name: '',
    category: '',
    unit: '',
    price: '',
    supplier: '',
    description: '',
    minQuantity: '1'
  });

  const handleInputChange = (field: keyof MaterialFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    const requiredFields: (keyof MaterialFormData)[] = ['name', 'category', 'unit', 'price'];
    
    for (const field of requiredFields) {
      if (!formData[field].trim()) {
        showNotification({
          title: 'Champ requis manquant',
          description: `Le champ ${field} est obligatoire.`,
          variant: 'destructive'
        });
        return false;
      }
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      showNotification({
        title: 'Prix invalide',
        description: 'Veuillez entrer un prix valide supérieur à 0.',
        variant: 'destructive'
      });
      return false;
    }

    const minQuantity = parseFloat(formData.minQuantity);
    if (isNaN(minQuantity) || minQuantity <= 0) {
      showNotification({
        title: 'Quantité minimale invalide',
        description: 'Veuillez entrer une quantité minimale valide supérieure à 0.',
        variant: 'destructive'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showNotification({
        title: 'Matériau ajouté',
        description: `${formData.name} a été ajouté avec succès.`,
        variant: 'success'
      });

      // Reset form
      setFormData({
        name: '',
        category: '',
        unit: '',
        price: '',
        supplier: '',
        description: '',
        minQuantity: '1'
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      showNotification({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'ajout du matériau.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      category: '',
      unit: '',
      price: '',
      supplier: '',
      description: '',
      minQuantity: '1'
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <FadeIn>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <i className="fas fa-plus-circle text-primary"></i>
              Ajouter un nouveau matériau
            </DialogTitle>
          </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nom du matériau *
              </Label>
              <Input
                id="name"
                placeholder="Ex: Ciment Portland"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">
                Catégorie *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {MATERIAL_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price and Unit */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">
                Prix unitaire (TND) *
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">
                Unité *
              </Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => handleInputChange('unit', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unité" />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minQuantity">
                Quantité minimale
              </Label>
              <Input
                id="minQuantity"
                type="number"
                min="1"
                value={formData.minQuantity}
                onChange={(e) => handleInputChange('minQuantity', e.target.value)}
              />
            </div>
          </div>

          {/* Supplier */}
          <div className="space-y-2">
            <Label htmlFor="supplier">
              Fournisseur
            </Label>
            <Input
              id="supplier"
              placeholder="Nom du fournisseur"
              value={formData.supplier}
              onChange={(e) => handleInputChange('supplier', e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Description détaillée du matériau..."
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Images et documents</Label>
            <FileDropzone
              maxFiles={3}
              acceptedFileTypes={['image/*', '.pdf']}
              maxFileSize={5 * 1024 * 1024} // 5MB
              onFilesChange={(files) => {
                console.log('Files uploaded:', files);
              }}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="min-w-[120px]"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Ajout...
              </>
            ) : (
              <>
                <i className="fas fa-save mr-2"></i>
                Ajouter
              </>
            )}          </Button>
        </DialogFooter>
        </FadeIn>
      </DialogContent>
    </Dialog>
  );
};
