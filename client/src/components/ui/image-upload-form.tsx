import React, { useState, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import UserAvatar from '@/components/ui/user-avatar';
import { toast } from '@/hooks/use-toast';

interface ImageUploadFormProps {
  userId: number;
  currentAvatarUrl?: string;
  onUploadSuccess?: (imagePath: string) => void;
}

export function ImageUploadForm({ userId, currentAvatarUrl, onUploadSuccess }: ImageUploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Format invalide",
          description: "Veuillez sélectionner une image.",
          variant: "destructive"
        });
        return;
      }
      
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: "La taille de l'image ne doit pas dépasser 5 Mo.",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('avatar', selectedFile);
      
      const response = await fetch(`/api/images/upload/${userId}`, {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Erreur lors du téléchargement');
      }
      
      toast({
        title: "Image téléchargée avec succès",
        variant: "default"
      });
      
      // Clear form and preview
      setSelectedFile(null);
      setPreviewUrl(null);
      
      // Call success callback with new image path
      if (onUploadSuccess && result.avatar) {
        onUploadSuccess(result.avatar);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Photo de profil</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          {/* Preview current or new avatar */}
          <div className="mb-4">
            <UserAvatar 
              src={previewUrl || currentAvatarUrl} 
              alt="Photo de profil"
              size="xl"
            />
          </div>
          
          {/* File input */}
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Input
              id="avatar"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG ou GIF. 5 Mo maximum.
            </p>
          </div>
          
          {/* Upload button */}
          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || isUploading}
            className="w-full max-w-sm"
          >
            {isUploading ? 'Téléchargement...' : 'Télécharger la photo'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
