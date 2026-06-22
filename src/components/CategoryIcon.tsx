import React from 'react';
import { Wheat, Flame, Droplets, Coffee, Cookie, Sparkles, Package } from 'lucide-react';

interface CategoryIconProps {
  name: string | undefined;
  className?: string;
}

export default function CategoryIcon({ name, className = "w-4 h-4" }: CategoryIconProps) {
  const normalized = name || '';
  
  switch (normalized) {
    case 'Wheat':
      return <Wheat className={className} />;
    case 'Flame':
      return <Flame className={className} />;
    case 'Droplets':
      return <Droplets className={className} />;
    case 'Coffee':
      return <Coffee className={className} />;
    case 'Cookie':
      return <Cookie className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    default:
      return <Package className={className} />;
  }
}
