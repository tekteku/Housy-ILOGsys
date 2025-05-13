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

const MaterialFilters = ({ filters, onFilterChange }: MaterialFiltersProps) => {
  // Query to get unique suppliers from materials
  const { data: materials } = useQuery({
    queryKey: ['/api/materials'],
    queryFn: () => fetch('/api/materials').then(res => res.json()),
    staleTime: 300000, // 5 minutes
  });

  // Extract unique suppliers
  const suppliers = materials
    ? Array.from(new Set(materials.map((m: any) => m.supplier).filter(Boolean)))
    : [];

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Input
        placeholder="Rechercher un matériau..."
        value={filters.search}
        onChange={(e) => onFilterChange("search", e.target.value)}
        className="w-full sm:w-56 pl-10"
        icon={<i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"></i>}
      />

      <Select
        value={filters.category}
        onValueChange={(value) => onFilterChange("category", value)}
      >
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Toutes catégories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Toutes catégories</SelectItem>
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
          <SelectItem value="">Tous fournisseurs</SelectItem>
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
