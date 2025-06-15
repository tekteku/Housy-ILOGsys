import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, Image as ImageIcon, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface FileWithPreview extends File {
  preview?: string;
  id: string;
}

interface FileDropzoneProps {
  onFilesChange?: (files: FileWithPreview[]) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number; // in bytes
  maxFiles?: number;
  multiple?: boolean;
  showPreview?: boolean;
  className?: string;
  disabled?: boolean;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFilesChange,
  acceptedFileTypes = ['image/*', '.pdf', '.doc', '.docx', '.txt'],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 5,
  multiple = true,
  showPreview = true,
  className,
  disabled = false,
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<FileWithPreview[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const processedFiles = acceptedFiles.map((file) => {
      const fileWithPreview = Object.assign(file, {
        id: `${file.name}-${Date.now()}`,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      }) as FileWithPreview;

      // Simulate upload progress
      setUploadProgress(prev => ({ ...prev, [fileWithPreview.id]: 0 }));
      
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const currentProgress = prev[fileWithPreview.id] || 0;
          if (currentProgress >= 100) {
            clearInterval(interval);
            return prev;
          }
          return { ...prev, [fileWithPreview.id]: currentProgress + 10 };
        });
      }, 100);

      return fileWithPreview;
    });

    const newFiles = multiple 
      ? [...uploadedFiles, ...processedFiles].slice(0, maxFiles)
      : processedFiles.slice(0, 1);

    setUploadedFiles(newFiles);
    onFilesChange?.(newFiles);
  }, [uploadedFiles, multiple, maxFiles, onFilesChange]);

  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      const newFiles = prev.filter(f => f.id !== fileId);
      onFilesChange?.(newFiles);
      return newFiles;
    });
    
    setUploadProgress(prev => {
      const { [fileId]: removed, ...rest } = prev;
      return rest;
    });
  }, [onFilesChange]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize: maxFileSize,
    maxFiles: multiple ? maxFiles : 1,
    multiple,
    disabled,
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: FileWithPreview) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-8 w-8 text-blue-500" />;
    }
    return <FileText className="h-8 w-8 text-gray-500" />;
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Dropzone */}
      <Card 
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed transition-colors cursor-pointer',
          isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-primary/50',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <input {...getInputProps()} />
          <Upload className={cn(
            'h-12 w-12 mb-4',
            isDragActive ? 'text-primary' : 'text-muted-foreground'
          )} />
          
          {isDragActive ? (
            <p className="text-lg font-medium text-primary">
              Déposez les fichiers ici...
            </p>
          ) : (
            <>
              <p className="text-lg font-medium mb-2">
                Glissez-déposez vos fichiers ici
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                ou cliquez pour sélectionner des fichiers
              </p>
              <Button variant="outline" disabled={disabled}>
                <File className="h-4 w-4 mr-2" />
                Choisir des fichiers
              </Button>
            </>
          )}
          
          <div className="mt-4 text-xs text-muted-foreground space-y-1">
            <p>Formats acceptés: {acceptedFileTypes.join(', ')}</p>
            <p>Taille max: {formatFileSize(maxFileSize)} par fichier</p>
            {multiple && <p>Maximum {maxFiles} fichiers</p>}
          </div>
        </CardContent>
      </Card>

      {/* File Rejections */}
      {fileRejections.length > 0 && (
        <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <h4 className="font-medium text-destructive mb-2">Fichiers rejetés:</h4>
          <ul className="space-y-1">
            {fileRejections.map(({ file, errors }) => (
              <li key={file.name} className="text-sm text-destructive">
                {file.name}: {errors.map(e => e.message).join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Uploaded Files Preview */}
      {showPreview && uploadedFiles.length > 0 && (
        <div className="mt-6 space-y-4">
          <h4 className="font-medium">Fichiers sélectionnés ({uploadedFiles.length})</h4>
          <div className="space-y-3">
            {uploadedFiles.map((file) => {
              const progress = uploadProgress[file.id] || 0;
              const isComplete = progress >= 100;
              
              return (
                <Card key={file.id} className="p-4">
                  <div className="flex items-start space-x-4">
                    {/* File icon or preview */}
                    <div className="flex-shrink-0">
                      {file.preview ? (
                        <img
                          src={file.preview}
                          alt={file.name}
                          className="h-16 w-16 object-cover rounded-lg"
                          onLoad={() => URL.revokeObjectURL(file.preview!)}
                        />
                      ) : (
                        getFileIcon(file)
                      )}
                    </div>
                    
                    {/* File details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          className="flex-shrink-0 ml-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Progress bar */}
                      {!isComplete && (
                        <div className="mt-2">
                          <Progress value={progress} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {progress}% téléchargé
                          </p>
                        </div>
                      )}
                      
                      {isComplete && (
                        <p className="text-xs text-green-600 mt-1 flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                          Téléchargement terminé
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
