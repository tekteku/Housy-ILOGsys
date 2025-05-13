import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency with locale
export function formatCurrency(value: number, currency: string = 'TND', locale: string = 'fr-TN'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

// Format date
export function formatDate(date: string | Date, format: 'short' | 'long' = 'short', locale: string = 'fr-TN'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'short') {
    return dateObj.toLocaleDateString(locale);
  } else {
    return dateObj.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}

// Format percentage
export function formatPercentage(value: number, decimalPlaces: number = 0): string {
  return `${value.toFixed(decimalPlaces)}%`;
}

// Calculate date difference in days
export function getDateDiff(start: string | Date, end: string | Date): number {
  const startDate = typeof start === 'string' ? new Date(start) : start;
  const endDate = typeof end === 'string' ? new Date(end) : end;
  
  const diffTime = endDate.getTime() - startDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

// Check if a task is overdue
export function isOverdue(endDate: string | Date, status: string): boolean {
  if (status === 'completed') return false;
  
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const today = new Date();
  
  return end < today;
}

// Calculate task progress color based on status and progress
export function getTaskProgressColor(status: string, progress: number, endDate: string | Date): string {
  if (status === 'completed') return 'bg-green-600';
  if (isOverdue(endDate, status)) return 'bg-red-600';
  if (progress < 25) return 'bg-red-400';
  if (progress < 50) return 'bg-yellow-500';
  if (progress < 75) return 'bg-blue-500';
  return 'bg-emerald-500';
}

// Generate random ID for elements
export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
}

// Calculate days from now
export function daysFromNow(date: string | Date): number {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

// Format number with units
export function formatNumber(value: number, unit: string = ''): string {
  return `${value.toLocaleString('fr-TN')}${unit ? ` ${unit}` : ''}`;
}

// Get initials from name
export function getInitials(name: string): string {
  if (!name) return '';
  
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Convert RGB color to HSL
export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    
    h /= 6;
  }
  
  return [h * 360, s * 100, l * 100];
}

// Get chart colors
export const getChartColors = (count: number): string[] => {
  const baseColors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ];
  
  // If we need more colors than in the base set, generate additional ones
  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }
  
  // Generate additional colors by modifying lightness of base colors
  const colors = [...baseColors];
  let index = 0;
  
  while (colors.length < count) {
    const baseColor = baseColors[index % baseColors.length];
    const lightnessOffset = Math.floor(colors.length / baseColors.length) * 10;
    
    // Create a lighter variant of the base color
    colors.push(baseColor.replace(/\d+%\)$/, (match) => {
      const lightness = parseInt(match) + lightnessOffset;
      return `${Math.min(lightness, 90)}%)`;
    }));
    
    index++;
  }
  
  return colors;
};

// Calculate optimal contrast color (black or white) for a background
export function getContrastColor(background: string): 'text-white' | 'text-black' {
  // Extract RGB from background color string (assumes format like 'rgb(r, g, b)' or '#rrggbb')
  let r = 0, g = 0, b = 0;
  
  if (background.startsWith('#')) {
    const hex = background.substring(1);
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else if (background.startsWith('rgb')) {
    const rgb = background.match(/\d+/g);
    if (rgb && rgb.length >= 3) {
      r = parseInt(rgb[0]);
      g = parseInt(rgb[1]);
      b = parseInt(rgb[2]);
    }
  } else if (background.startsWith('hsl')) {
    // For HSL, we'd need more complex logic, so default to black for light HSL values
    return background.includes('(2') || background.includes('(1') || background.includes('(0') ? 'text-black' : 'text-white';
  }
  
  // Calculate brightness according to YIQ formula
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  return brightness > 128 ? 'text-black' : 'text-white';
}
