import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Resource {
  id: number;
  name: string;
  type: "human" | "material" | "equipment";
  availability: "available" | "occupied" | "unavailable";
  occupancyRate?: number;
  details?: {
    role?: string;
    skills?: string[];
    specifications?: string;
    [key: string]: any;
  };
}

const ResourceItem = ({ resource }: { resource: Resource }) => {
  // Get availability badge color
  const getAvailabilityBadge = () => {
    switch (resource.availability) {
      case "available":
        return (
          <span className="text-xs font-medium px-2 py-1 rounded-md bg-green-100 text-green-700">
            Disponible
          </span>
        );
      case "occupied":
        const rate = resource.occupancyRate ? `(${Math.round(resource.occupancyRate)}%)` : "";
        return (
          <span className="text-xs font-medium px-2 py-1 rounded-md bg-yellow-100 text-yellow-700">
            Occupé {rate}
          </span>
        );
      case "unavailable":
        return (
          <span className="text-xs font-medium px-2 py-1 rounded-md bg-red-100 text-red-700">
            Indisponible
          </span>
        );
      default:
        return null;
    }
  };

  // Get icon for resource type
  const getResourceIcon = () => {
    if (resource.type === "human") {
      return (
        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 overflow-hidden">
          {resource.details?.avatar ? (
            <img
              src={resource.details.avatar}
              alt={resource.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <i className="fas fa-user"></i>
          )}
        </div>
      );
    } else if (resource.type === "equipment") {
      return (
        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
          <i className="fas fa-tools text-purple-600"></i>
        </div>
      );
    } else {
      // Material
      return (
        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
          <i className="fas fa-truck text-yellow-600"></i>
        </div>
      );
    }
  };

  return (
    <div className="flex items-center justify-between p-2 rounded-lg border border-neutral-200">
      <div className="flex items-center space-x-3">
        {getResourceIcon()}
        <div>
          <p className="text-sm font-medium text-neutral-800">{resource.name}</p>
          <p className="text-xs text-neutral-500">
            {resource.type === "human"
              ? resource.details?.role || "Collaborateur"
              : resource.details?.specifications || "Ressource"}
          </p>
        </div>
      </div>
      {getAvailabilityBadge()}
    </div>
  );
};

const ProjectResources = () => {
  const { data: humanResources, isLoading: isLoadingHuman } = useQuery({
    queryKey: ['/api/resources'],
  });

  // Sample resources data (with types split)
  const resources = {
    human: [
      {
        id: 1,
        name: "Mehdi Salah",
        type: "human",
        availability: "available",
        details: { role: "Chef de chantier" },
      },
      {
        id: 2,
        name: "Sonia Maalej",
        type: "human",
        availability: "occupied",
        occupancyRate: 70,
        details: { role: "Architecte" },
      },
      {
        id: 3,
        name: "Karim Larbi",
        type: "human",
        availability: "unavailable",
        details: { role: "Électricien" },
      },
    ],
    material: [
      {
        id: 4,
        name: "Camion benne",
        type: "equipment",
        availability: "available",
        details: { specifications: "Transport matériaux" },
      },
      {
        id: 5,
        name: "Excavatrice",
        type: "equipment",
        availability: "occupied",
        occupancyRate: 50,
        details: { specifications: "Travaux de terrassement" },
      },
      {
        id: 6,
        name: "Équipement peinture",
        type: "equipment",
        availability: "unavailable",
        details: { specifications: "Travaux de finition" },
      },
    ],
  };

  return (
    <Card className="shadow-sm border border-neutral-200">
      <div className="p-5 border-b border-neutral-200">
        <h2 className="text-lg font-medium text-neutral-900">Ressources allouées</h2>
        <p className="text-neutral-500 text-sm mt-1">Équipe et ressources matérielles</p>
      </div>
      
      <div className="p-5">
        <div className="mb-5">
          <h3 className="text-sm font-medium text-neutral-800 mb-3 flex items-center">
            <i className="fas fa-users mr-2 text-neutral-600"></i>
            Ressources humaines
          </h3>
          
          <div className="space-y-2.5">
            {isLoadingHuman ? (
              [...Array(3)].map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))
            ) : humanResources?.filter((r: Resource) => r.type === "human")?.length > 0 ? (
              humanResources
                .filter((r: Resource) => r.type === "human")
                .map((resource: Resource) => (
                  <ResourceItem key={resource.id} resource={resource} />
                ))
            ) : (
              resources.human.map((resource) => (
                <ResourceItem key={resource.id} resource={resource as Resource} />
              ))
            )}
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-neutral-800 mb-3 flex items-center">
            <i className="fas fa-tools mr-2 text-neutral-600"></i>
            Ressources matérielles
          </h3>
          
          <div className="space-y-2.5">
            {isLoadingHuman ? (
              [...Array(3)].map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))
            ) : humanResources?.filter((r: Resource) => r.type !== "human")?.length > 0 ? (
              humanResources
                .filter((r: Resource) => r.type !== "human")
                .map((resource: Resource) => (
                  <ResourceItem key={resource.id} resource={resource} />
                ))
            ) : (
              resources.material.map((resource) => (
                <ResourceItem key={resource.id} resource={resource as Resource} />
              ))
            )}
          </div>
        </div>
        
        {/* Resource Management Button */}
        <div className="mt-4 pt-3 border-t border-neutral-200">
          <Button variant="outline" className="w-full">
            Gérer les ressources
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProjectResources;
