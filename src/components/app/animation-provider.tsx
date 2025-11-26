'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import CategoryAnimationOverlay from './category-animation-overlay';

interface AnimationData {
  icon: LucideIcon;
}

interface AnimationParams extends AnimationData {
  onAnimationEnd?: () => void;
}

interface AnimationContextType {
  triggerAnimation: (params: AnimationParams) => void;
  isAnimating: boolean;
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

export function AnimationProvider({ children }: { children: ReactNode }) {
  const [animation, setAnimation] = useState<AnimationData | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);


  const triggerAnimation = useCallback(({ icon, onAnimationEnd }: AnimationParams) => {
    setIsAnimating(true);
    setAnimation({ icon });

    setTimeout(() => {
      onAnimationEnd?.();
      setAnimation(null);
      setIsAnimating(false);
    }, 500); // Corresponds to the animation duration
  }, []);

  return (
    <AnimationContext.Provider value={{ triggerAnimation, isAnimating }}>
      {children}
      <CategoryAnimationOverlay animation={animation} />
    </AnimationContext.Provider>
  );
}

export function useAnimation() {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
}
