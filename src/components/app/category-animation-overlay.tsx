'use client';

import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface AnimationData {
  icon: LucideIcon;
}

interface CategoryAnimationOverlayProps {
  animation: AnimationData | null;
}

export default function CategoryAnimationOverlay({ animation }: CategoryAnimationOverlayProps) {
  if (!animation) {
    return null;
  }

  const { icon: Icon } = animation;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden pointer-events-none">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-scale-and-fade"
      >
        <Icon className="h-48 w-48" />
      </div>
    </div>
  );
}
