import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

interface MaterialFiltersProps {
  filters: {
    category: string;
    search: string;
    supplier: string;
    sortBy: string;
  };
  onFilterChange: (name: string, value: string) => void;
}

interface Material {
  id: number;
  name: string;
  supplier?: string;
}

const MaterialFilters = ({ filters, onFilterChange }: MaterialFiltersProps) => {
  // Query to get unique suppliers from materials
  const { data: materials, isLoading, error } = useQuery<Material[]>({
    queryKey: ['/api/materials'],
    queryFn: () => fetch('/api/materials').then(res => res.json()).then(data => data.data), // Extract data array
    staleTime: 300000, // 5 minutes
  });

  // Extract unique suppliers
  const suppliers: string[] = materials && Array.isArray(materials)
    ? Array.from(new Set(materials.map((m: Material) => m.supplier).filter(Boolean))) as string[]
    : [];

  // Handle loading and error states
  if (isLoading) return <p>Loading filters...</p>;
  if (error) return <p>Error loading filters: {error.message}</p>;

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative w-full sm:w-56">
        <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"></i>
        <Input
          placeholder="Rechercher un matériau..."
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
          className="pl-10"
        />
      </div>

      <Select
        value={filters.category}
        onValueChange={(value) => onFilterChange("category", value)}
      >
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Toutes catégories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes catégories</SelectItem>
          <SelectItem value="gros_oeuvre">Gros œuvre</SelectItem>
          <SelectItem value="second_oeuvre">Second œuvre</SelectItem>
          <SelectItem value="finition">Finitions</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.supplier}
        onValueChange={(value) => onFilterChange("supplier", value)}
      >
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Tous fournisseurs" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous fournisseurs</SelectItem>
          {suppliers.map((supplier: string) => (
            <SelectItem key={supplier} value={supplier}>
              {supplier}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.sortBy}
        onValueChange={(value) => onFilterChange("sortBy", value)}
      >
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Trier par" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name">Nom (A-Z)</SelectItem>
          <SelectItem value="price">Prix (croissant)</SelectItem>
          <SelectItem value="price-desc">Prix (décroissant)</SelectItem>
          <SelectItem value="updated">Récemment mis à jour</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default MaterialFilters;
