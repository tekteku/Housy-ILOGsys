import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";

interface TableColumn<T> {
  header: string;
  accessorKey: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  cellClassName?: string;
  headerClassName?: string;
  isHiddenOnMobile?: boolean;
  renderCell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  pin?: "left" | "right"; // Pour épingler une colonne
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  isLoading?: boolean;
  error?: string;
  emptyMessage?: string;
  emptyIcon?: string;
  emptyAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  containerClassName?: string;
  tableClassName?: string;
  onRowClick?: (row: T) => void;
  rowClassName?: string | ((row: T, index: number) => string);
  sortKey?: keyof T;
  sortDirection?: "asc" | "desc";
  onSort?: (key: keyof T, direction: "asc" | "desc") => void;
  caption?: string;
  borderless?: boolean;
}

export function ResponsiveTable<T extends { id?: string | number }>({
  data,
  columns,
  isLoading = false,
  error,
  emptyMessage = "Aucune donnée disponible",
  emptyIcon = "fa-table",
  emptyAction,
  className,
  containerClassName,
  tableClassName,
  onRowClick,
  rowClassName,
  sortKey,
  sortDirection,
  onSort,
  caption,
  borderless = false,
}: ResponsiveTableProps<T>) {
  
  const handleSort = (column: TableColumn<T>) => {
    if (!onSort || !column.sortable || typeof column.accessorKey !== 'string') return;
    
    const key = column.accessorKey as keyof T;
    const direction = 
      sortKey === key && sortDirection === "asc" ? "desc" : "asc";
    
    onSort(key, direction);
  };

  // Rendu pour les états de chargement, erreur et vide
  if (isLoading) {
    return (
      <div className={cn("rounded-md overflow-hidden border", borderless && "border-0", containerClassName)}>
        <LoadingIndicator type="skeleton" height="h-12" count={5} className="p-4" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("rounded-md overflow-hidden border", borderless && "border-0", containerClassName)}>
        <EmptyState
          title="Erreur de chargement"
          description={error}
          icon="fa-exclamation-triangle"
          action={emptyAction}
          iconClassName="bg-red-100 text-red-600"
        />
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className={cn("rounded-md overflow-hidden border", borderless && "border-0", containerClassName)}>
        <EmptyState
          title="Aucune donnée"
          description={emptyMessage}
          icon={emptyIcon}
          action={emptyAction}
          iconClassName="bg-neutral-100 text-neutral-400"
        />
      </div>
    );
  }

  // Rendu du tableau de bureau standard
  return (
    <div className={cn("overflow-hidden relative", containerClassName)}>
      {/* Table pour desktop */}
      <div className={cn("hidden md:block overflow-x-auto", containerClassName)}>
        <UITable className={cn(className, tableClassName)}>
          {caption && <caption className="text-sm text-neutral-500 mt-4 mb-2 text-left">{caption}</caption>}
          
          <TableHeader className={borderless ? "border-b border-neutral-200" : undefined}>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead
                  key={index}
                  className={cn(
                    column.headerClassName,
                    column.sortable && "cursor-pointer select-none",
                    column.pin === "left" && "sticky left-0 bg-white z-20",
                    column.pin === "right" && "sticky right-0 bg-white z-20"
                  )}
                  onClick={column.sortable ? () => handleSort(column) : undefined}
                >
                  <div className="flex items-center gap-1">
                    {column.header}
                    {column.sortable && sortKey === column.accessorKey && (
                      <span className="ml-1">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow
                key={row.id ? String(row.id) : rowIndex}
                className={cn(
                  onRowClick && "cursor-pointer hover:bg-neutral-50",
                  typeof rowClassName === "function"
                    ? rowClassName(row, rowIndex)
                    : rowClassName
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column, colIndex) => (
                  <TableCell
                    key={colIndex}
                    className={cn(
                      column.cellClassName,
                      column.isHiddenOnMobile && "hidden md:table-cell",
                      column.pin === "left" && "sticky left-0 bg-white z-10",
                      column.pin === "right" && "sticky right-0 bg-white z-10"
                    )}
                  >
                    {column.renderCell
                      ? column.renderCell(row)
                      : typeof column.accessorKey === "function"
                      ? column.accessorKey(row)
                      : // @ts-ignore - accessorKey is a string at this point
                        row[column.accessorKey]?.toString() || ""}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </UITable>
      </div>
      
      {/* Cards pour mobile */}
      <div className={cn("block md:hidden", containerClassName)}>
        {data.map((row, rowIndex) => (
          <div 
            key={row.id ? String(row.id) : rowIndex}
            className={cn(
              "border-b border-neutral-200 p-4 last:border-0",
              onRowClick && "cursor-pointer hover:bg-neutral-50",
              typeof rowClassName === "function"
                ? rowClassName(row, rowIndex)
                : rowClassName
            )}
            onClick={() => onRowClick?.(row)}
          >
            {columns
              .filter(col => !col.isHiddenOnMobile)
              .map((column, colIndex) => {
                // Déterminer si ce champ doit être mis en évidence
                const isPrimary = colIndex === 0;
                const isSecondary = colIndex === 1;
              
                // Ne pas afficher toutes les colonnes, se concentrer sur les principales
                if (colIndex > 4) return null;
                
                const value = column.renderCell
                  ? column.renderCell(row)
                  : typeof column.accessorKey === "function"
                  ? column.accessorKey(row)
                  : // @ts-ignore - accessorKey is a string at this point
                    row[column.accessorKey]?.toString() || "";
                  
                // Formatage spécial pour la première colonne (titre principal)
                if (isPrimary) {
                  return (
                    <div key={colIndex} className="font-medium text-neutral-900 mb-2">
                      {value}
                    </div>
                  );
                }
                
                // Formatage pour la deuxième colonne (badge ou texte secondaire)
                if (isSecondary) {
                  const isBadge = React.isValidElement(value) && value.type === Badge;
                  
                  if (isBadge) {
                    return <div key={colIndex} className="mt-1 mb-2">{value}</div>;
                  }
                  
                  return (
                    <div key={colIndex} className="text-sm text-neutral-500 mb-2">
                      {value}
                    </div>
                  );
                }
                
                // Pour les autres colonnes, les afficher comme des paires label/valeur
                return (
                  <div key={colIndex} className="flex justify-between items-center text-sm mt-2">
                    <span className="text-neutral-500">{column.header}:</span>
                    <span className="font-medium text-neutral-900">{value}</span>
                  </div>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
}
