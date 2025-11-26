'use client';

import { useToast } from '@/hooks/use-toast';
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

interface ReadingModeContextType {
  isReadingMode: boolean;
  toggleReadingMode: () => void;
  speakText: (text: string, lang?: string) => void;
  isSupported: boolean;
}

const ReadingModeContext = createContext<ReadingModeContextType | undefined>(undefined);

export function ReadingModeProvider({ children }: { children: ReactNode }) {
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
    }
  }, []);

  const toggleReadingMode = useCallback(() => {
    if (!isSupported) {
        toast({
            variant: "destructive",
            title: "Dəstəklənməyən Brauzer",
            description: "Brauzeriniz mətnin səsləndirilməsi funksiyasını dəstəkləmir.",
        });
        return;
    }
    setIsReadingMode(prev => {
        const newState = !prev;
        if (!newState) {
            window.speechSynthesis.cancel(); // Turn off any ongoing speech
        }
        toast({
            title: `Oxuma Modu ${newState ? 'Aktiv Edildi' : 'Deaktiv Edildi'}`,
            description: newState ? 'Məzmunu dinləmək üçün siçan göstəricisini mətnlərin üzərinə gətirin.' : '',
        });
        return newState;
    });
  }, [isSupported, toast]);

  const speakText = useCallback((text: string, lang = 'az-AZ') => {
    if (!isReadingMode || !isSupported) return;

    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.onerror = (event) => {
        console.error("SpeechSynthesisUtterance.onerror", event);
    };
    window.speechSynthesis.speak(utterance);
  }, [isReadingMode, isSupported, toast]);

  return (
    <ReadingModeContext.Provider value={{ isReadingMode, toggleReadingMode, speakText, isSupported }}>
      {children}
    </ReadingModeContext.Provider>
  );
}

export function useReadingMode() {
  const context = useContext(ReadingModeContext);
  if (context === undefined) {
    throw new Error('useReadingMode must be used within a ReadingModeProvider');
  }
  return context;
}
