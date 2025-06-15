/**
 * Sélecteur de modèle IA pour estimation avec restriction Ollama
 * Ollama = Administrateurs uniquement
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/queryClient';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Shield, Lock, Cloud, Zap } from 'lucide-react';

interface AIModel {
  id: string;
  name: string;
  description: string;
  restricted?: boolean;
}

interface EstimationAIModelSelectorProps {
  selectedModel: string;
  onModelSelect: (model: string) => void;
  showPermissions?: boolean;
}

export function EstimationAIModelSelector({ 
  selectedModel, 
  onModelSelect,
  showPermissions = false 
}: EstimationAIModelSelectorProps) {
  const { user } = useAuth();
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [permissions, setPermissions] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  useEffect(() => {
    loadAvailableModels();
    if (showPermissions) {
      loadPermissions();
    }
  }, [user?.role, showPermissions]);

  const loadAvailableModels = async () => {
    try {
      const response = await apiRequest('GET', '/api/estimation-ai/models');
      const data = await response.json();
        if (data.success) {
        setAvailableModels(data.data.models);
        // Auto-sélectionner un modèle par défaut si aucun n'est sélectionné
        if (!selectedModel && data.data.models.length > 0) {
          // Pour les admins, chercher Ollama d'abord, sinon OpenAI
          // Pour les clients, toujours OpenAI (Ollama ne sera pas dans la liste)
          let defaultModel = 'openai';
          
          if (isAdmin) {
            const ollamaModel = data.data.models.find((m: AIModel) => m.id === 'ollama');
            if (ollamaModel) {
              defaultModel = 'ollama';
            }
          }
          
          const modelExists = data.data.models.find((m: AIModel) => m.id === defaultModel);
          onModelSelect(modelExists ? defaultModel : data.data.models[0].id);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des modèles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    try {
      const response = await apiRequest('GET', '/api/estimation-ai/permissions');
      const data = await response.json();
      
      if (data.success) {
        setPermissions(data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des permissions:', error);
    }
  };

  const getModelIcon = (modelId: string) => {
    switch (modelId) {
      case 'ollama':
        return <Shield className="h-4 w-4 text-blue-600" />;
      case 'openai':
        return <Cloud className="h-4 w-4 text-green-600" />;
      case 'claude':
        return <Zap className="h-4 w-4 text-purple-600" />;
      case 'deepseek':
        return <Zap className="h-4 w-4 text-orange-600" />;
      default:
        return <Cloud className="h-4 w-4 text-gray-600" />;
    }
  };

  const getModelBadge = (model: AIModel) => {
    if (model.restricted && !isAdmin) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="destructive" className="ml-2">
                <Lock className="h-3 w-3 mr-1" />
                Restreint
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Réservé aux administrateurs</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    if (model.id === 'ollama' && isAdmin) {
      return (
        <Badge variant="default" className="ml-2 bg-blue-100 text-blue-800">
          <Shield className="h-3 w-3 mr-1" />
          Admin
        </Badge>
      );
    }
    
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Modèle IA pour Estimation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedModel} onValueChange={onModelSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionner un modèle IA" />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((model) => (
                <SelectItem 
                  key={model.id} 
                  value={model.id}
                  disabled={model.restricted && !isAdmin}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      {getModelIcon(model.id)}
                      <span className="ml-2">{model.name}</span>
                      {getModelBadge(model)}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Description du modèle sélectionné */}
          {selectedModel && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start">
                {getModelIcon(selectedModel)}
                <div className="ml-2">
                  <p className="text-sm font-medium">
                    {availableModels.find(m => m.id === selectedModel)?.name}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {availableModels.find(m => m.id === selectedModel)?.description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Panneau de permissions (si activé) */}
      {showPermissions && permissions && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Lock className="h-4 w-4 mr-2" />
              Permissions & Restrictions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Utilisateur:</span>
              <Badge variant={isAdmin ? "default" : "secondary"}>
                {permissions.userRole === 'admin' || permissions.userRole === 'super_admin' 
                  ? 'Administrateur' 
                  : 'Client'
                }
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center">
                  <Shield className="h-3 w-3 mr-1" />
                  Ollama Local
                </span>
                <Badge variant={permissions.permissions.canUseOllama ? "default" : "destructive"}>
                  {permissions.permissions.canUseOllama ? "Autorisé" : "Restreint"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center">
                  <Cloud className="h-3 w-3 mr-1" />
                  Modèles Cloud
                </span>
                <Badge variant="default">Autorisé</Badge>
              </div>
            </div>

            {permissions.recommendations && (
              <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-800">
                💡 {permissions.recommendations}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Avertissement pour les clients */}
      {!isAdmin && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-3">
            <div className="flex items-start">
              <Lock className="h-4 w-4 text-orange-600 mr-2 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-800">
                  Accès Restreint
                </p>
                <p className="text-xs text-orange-700 mt-1">
                  Ollama Local est réservé aux administrateurs pour les estimations confidentielles. 
                  Utilisez OpenAI ou Claude pour vos besoins d'estimation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information pour les administrateurs */}
      {isAdmin && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-3">
            <div className="flex items-start">
              <Shield className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Accès Administrateur
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Vous avez accès à Ollama Local pour les estimations sécurisées et confidentielles. 
                  Les données restent en local pour une sécurité maximale.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
