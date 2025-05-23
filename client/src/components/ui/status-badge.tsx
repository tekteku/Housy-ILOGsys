import React from "react"
import { Badge } from "@/components/ui/badge"

type StatusType = 
  | "pending" 
  | "inProgress" 
  | "completed" 
  | "cancelled" 
  | "onHold" 
  | "delayed"
  | "draft"
  | "review"

interface StatusConfig {
  label: string
  icon: string
  color?: string
}

interface StatusBadgeProps {
  status: StatusType | string
  className?: string
}

// Carte de configuration des statuts avec leurs libellés et icônes
const STATUS_CONFIG: Record<string, StatusConfig> = {
  pending: { 
    label: "En attente", 
    icon: "fa-clock" 
  },
  inProgress: { 
    label: "En cours", 
    icon: "fa-play" 
  },
  completed: { 
    label: "Terminé", 
    icon: "fa-check" 
  },
  cancelled: { 
    label: "Annulé", 
    icon: "fa-times" 
  },
  onHold: { 
    label: "En pause", 
    icon: "fa-pause" 
  },
  delayed: { 
    label: "En retard", 
    icon: "fa-exclamation-triangle" 
  },
  draft: { 
    label: "Brouillon", 
    icon: "fa-file" 
  },
  review: { 
    label: "En revue", 
    icon: "fa-search" 
  }
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  // Normaliser le statut pour correspondre aux clés de configuration
  const normalizedStatus = status.toString().toLowerCase().replace(/[-\s]/g, "")
  
  // Récupérer la configuration pour ce statut ou utiliser une configuration par défaut
  const config = STATUS_CONFIG[normalizedStatus] || {
    label: status,
    icon: "fa-question-circle"
  }
  
  // Déterminer si le statut est une clé connue de notre configuration
  const isKnownStatus = Object.keys(STATUS_CONFIG).includes(normalizedStatus)

  return (
    <Badge
      status={isKnownStatus ? normalizedStatus as StatusType : undefined}
      variant={!isKnownStatus ? "outline" : undefined}
      className={className}
      icon={config.icon}
    >
      {config.label}
    </Badge>
  )
}

// Exportation de fonctions d'aide pour les statuts communs
export const ProjectStatus = {
  Pending: () => <StatusBadge status="pending" />,
  InProgress: () => <StatusBadge status="inProgress" />,
  Completed: () => <StatusBadge status="completed" />,
  Cancelled: () => <StatusBadge status="cancelled" />,
  OnHold: () => <StatusBadge status="onHold" />,
  Delayed: () => <StatusBadge status="delayed" />,
  Draft: () => <StatusBadge status="draft" />,
  Review: () => <StatusBadge status="review" />,
}
