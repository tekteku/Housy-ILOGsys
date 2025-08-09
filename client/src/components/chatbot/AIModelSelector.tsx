import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AIModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const AIModelSelector = ({ selectedModel, onModelChange }: AIModelSelectorProps) => {
  const models = [
    {
      id: "openai",
      name: "GPT-4o (OpenAI)",
      description: "Exploite les données réelles du marché immobilier tunisien (109,336 listings) et des prix actuels des matériaux."
    },
    {
      id: "claude",
      name: "Claude 3 (Anthropic)",
      description: "Analystes des données immobilières par région en Tunisie avec vision détaillée des tendances du marché."
    },
    {
      id: "ollama",
      name: "Llama 2 (Local)",
      description: "Traitement local des données avec focus sur les prix des matériaux de construction tunisiens de 46 fournisseurs."
    },
    {
      id: "deepseek",
      name: "DeepSeek",
      description: "Modèle prédictif spécialisé dans l'anticipation des tendances du marché immobilier tunisien par région."
    }
  ];

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <i className="fas fa-info-circle text-neutral-500 cursor-help"></i>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            <p className="text-sm">
              Chaque modèle IA a des forces différentes. Choisissez celui qui correspond le mieux à votre question.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Select value={selectedModel} onValueChange={onModelChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Choisir un modèle" />
        </SelectTrigger>
        <SelectContent>
          {models.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              <div className="flex flex-col">
                <span>{model.name}</span>
                <span className="text-xs text-neutral-500 truncate max-w-xs">
                  {model.description.substring(0, 40)}...
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default AIModelSelector;
