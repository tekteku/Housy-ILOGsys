import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Image, X, CheckCircle, AlertCircle } from 'lucide-react';

interface FileWithPreview extends File {
  preview?: string;
  id?: string;
}

interface FileDropzoneProps {
  onFilesChange: (files: FileWithPreview[]) => void;
  maxFiles?: number;
  maxSize?: number; // en MB
  acceptedTypes?: string[];
  existingFiles?: FileWithPreview[];
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFilesChange,
  maxFiles = 10,
  maxSize = 50,
  acceptedTypes = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'dwg', 'xlsx'],
  existingFiles = []
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>(existingFiles);
  const [errors, setErrors] = useState<string[]>([]);

  const validateFile = (file: File): string | null => {
    // Vérifier la taille
    if (file.size > maxSize * 1024 * 1024) {
      return `Le fichier "${file.name}" dépasse la taille maximale de ${maxSize}MB`;
    }

    // Vérifier l'extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension && !acceptedTypes.includes(extension)) {
      return `Le type de fichier "${extension}" n'est pas autorisé`;
    }

    return null;
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newErrors: string[] = [];
    const validFiles: FileWithPreview[] = [];

    // Vérifier le nombre total de fichiers
    if (files.length + acceptedFiles.length > maxFiles) {
      newErrors.push(`Vous ne pouvez pas ajouter plus de ${maxFiles} fichiers`);
      setErrors(newErrors);
      return;
    }

    acceptedFiles.forEach(file => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(error);
      } else {
        const fileWithPreview: FileWithPreview = Object.assign(file, {
          id: Math.random().toString(36).substr(2, 9),
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
        });
        validFiles.push(fileWithPreview);
      }
    });

    if (validFiles.length > 0) {
      const updatedFiles = [...files, ...validFiles];
      setFiles(updatedFiles);
      onFilesChange(updatedFiles);
    }

    setErrors(newErrors);
  }, [files, maxFiles, maxSize, acceptedTypes, onFilesChange]);

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter(file => file.id !== fileId);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
    
    // Révoquer l'URL de preview si c'est une image
    const fileToRemove = files.find(file => file.id === fileId);
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/dwg': ['.dwg']
    }
  });

  const getFileIcon = (file: FileWithPreview) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-5 h-5 text-blue-500" />;
    }
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      {/* Zone de drop */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-200 ${
          isDragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        {isDragActive ? (
          <p className="text-blue-600 dark:text-blue-400">
            Déposez les fichiers ici...
          </p>
        ) : (
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Glissez-déposez vos fichiers ici ou cliquez pour sélectionner
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Types acceptés: {acceptedTypes.join(', ')} • Taille max: {maxSize}MB • Max: {maxFiles} fichiers
            </p>
          </div>
        )}
      </div>

      {/* Erreurs */}
      {errors.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          {errors.map((error, index) => (
            <div key={index} className="flex items-center text-red-700 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </div>
          ))}
        </div>
      )}

      {/* Liste des fichiers */}
      {files.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            Fichiers sélectionnés ({files.length}/{maxFiles})
          </h4>
          <div className="space-y-2">
            {files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center min-w-0 flex-1">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-10 h-10 object-cover rounded mr-3"
                    />
                  ) : (
                    <div className="mr-3">
                      {getFileIcon(file)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500 mx-2" />
                </div>
                <button
                  onClick={() => removeFile(file.id!)}
                  className="ml-2 p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
