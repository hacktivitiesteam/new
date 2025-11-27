
'use client';

import Link from 'next/link';
import { Button } from '../ui/button';
import { Globe, Languages, Check, ChevronDown, Headset, Ear, PenSquare, Wand2, Menu, Sun, Moon, Laptop, CircleDollarSign } from 'lucide-react';
import ContactUs from './contact-us';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { cn } from '@/lib/utils';
import { useAnimation } from '../app/animation-provider';
import React, {useState} from 'react';
import { useReadingMode } from './reading-mode-provider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import Image from 'next/image';
import AiRecommender from './ai-recommender';
import { useTheme } from 'next-themes';
import { ThemeToggle } from './theme-toggle';

interface AppHeaderProps {
    isAdmin?: boolean;
    lang?: 'az' | 'en' | 'ru';
    setLang?: (lang: 'az' | 'en' | 'ru') => void;
}

const languages = [
    { code: 'az', name: 'Azərbaycan', flag: 'https://flagcdn.com/w40/az.png' },
    { code: 'en', name: 'English', flag: 'https://flagcdn.com/w40/gb.png' },
    { code: 'ru', name: 'Русский', flag: 'https://flagcdn.com/w40/ru.png' },
] as const;

const headerTranslations = {
    az: {
        change_lang: 'Dili dəyişdir',
        contact_us: 'Bizimlə Əlaqə',
        communication_aid: 'Ünsiyyət Köməkçisi',
        reading_mode: 'Oxuma Modu',
        theme: 'Tema Rəngi',
        ai_recommender: 'AI Köməkçi',
        currency_converter: 'Valyuta Konvertoru',
        light: 'İşıqlı',
        dark: 'Tünd',
        system: 'Sistem',
    },
    en: {
        change_lang: 'Change Language',
        contact_us: 'Contact Us',
        communication_aid: 'Communication Aid',
        reading_mode: 'Reading Mode',
        theme: 'Theme Color',
        ai_recommender: 'AI Recommender',
        currency_converter: 'Currency Converter',
        light: 'Light',
        dark: 'Dark',
        system: 'System',
    },
    ru: {
        change_lang: 'Изменить язык',
        contact_us: 'Связаться с нами',
        communication_aid: 'Помощник по общению',
        reading_mode: 'Режим чтения',
        theme: 'Цвет темы',
        ai_recommender: 'AI Рекомендатор',
        currency_converter: 'Конвертер валют',
        light: 'Светлая',
        dark: 'Темная',
        system: 'Системная',
    }
}


const AppHeader = ({ isAdmin = false, lang = 'az', setLang }: AppHeaderProps) => {
  const t = headerTranslations[lang];
  const [isRecommenderOpen, setIsRecommenderOpen] = useState(false);
  const [isContactUsOpen, setIsContactUsOpen] = useState(false);
  
  const { triggerAnimation } = useAnimation();
  const { isReadingMode, toggleReadingMode } = useReadingMode();
  const { setTheme } = useTheme();

  const handleAiRecommenderClick = () => {
    triggerAnimation({
        icon: Wand2,
        onAnimationEnd: () => setIsRecommenderOpen(true)
    });
  }
  
  const handleContactUsClick = () => {
    triggerAnimation({
        icon: Headset,
        onAnimationEnd: () => setIsContactUsOpen(true)
    });
  }

  const handleShowConverter = () => {
    // Dispatch a custom event that the homepage can listen to
    window.dispatchEvent(new CustomEvent('show-converter'));
  };
  
   const handleLanguageChange = (e: Event, langCode: 'az' | 'en' | 'ru') => {
      if (!setLang) return;
      e.preventDefault();
      triggerAnimation({
          icon: Languages,
          onAnimationEnd: () => setLang(langCode)
      });
  }
  
  const handleReadingModeClick = (e: Event) => {
    e.preventDefault();
    triggerAnimation({
        icon: Ear,
        onAnimationEnd: toggleReadingMode
    });
  }

  const handleThemeChange = (newTheme: string) => {
    let Icon;
    if (newTheme === 'light') Icon = Sun;
    else if (newTheme === 'dark') Icon = Moon;
    else Icon = Laptop;
    
    triggerAnimation({
        icon: Icon,
        onAnimationEnd: () => setTheme(newTheme)
    });
  };


  return (
    <>
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href={isAdmin ? "/admin" : "/home"} className="flex items-center gap-2">
          <Globe className="h-8 w-8 text-primary" />
          <div>
            <span className="text-lg font-bold">Turism Helper</span>
            <p className="text-xs text-muted-foreground -mt-1">by Hacktivities</p>
          </div>
        </Link>
        <nav className="flex items-center gap-2">
          {isAdmin ? (
             <div className='flex items-center gap-1'>
                <Link href="/home" passHref>
                   <Button variant="ghost">İstifadəçi Paneli</Button>
                </Link>
                <ThemeToggle tooltipText={t.theme} />
            </div>
          ) : (
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={handleContactUsClick}>
                        <Headset className="mr-2" />
                        <span>{t.contact_us}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={handleAiRecommenderClick}>
                        <Wand2 className="mr-2" />
                        <span>{t.ai_recommender}</span>
                    </DropdownMenuItem>
                     <DropdownMenuItem onSelect={handleShowConverter}>
                        <CircleDollarSign className="mr-2" />
                        <span>{t.currency_converter}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                       <Link href="/communication-aid">
                            <PenSquare className="mr-2" />
                            <span>{t.communication_aid}</span>
                       </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={handleReadingModeClick} className={cn(isReadingMode && 'bg-accent')}>
                        <Ear className="mr-2" />
                        <span>{t.reading_mode}</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <Languages className="mr-2" />
                            <span>{t.change_lang}</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                             <DropdownMenuSubContent>
                                {languages.map((langItem) => (
                                  <DropdownMenuItem key={langItem.code} onSelect={(e) => handleLanguageChange(e, langItem.code)}>
                                      <div className={cn("flex w-full items-center justify-between", lang === langItem.code && "font-bold")}>
                                          <div className='flex items-center'>
                                            <Image src={langItem.flag} alt={`${langItem.name} flag`} width={20} height={15} className="mr-2 rounded-sm" />
                                            {langItem.name}
                                          </div>
                                          {lang === langItem.code && <Check className="h-4 w-4" />}
                                      </div>
                                  </DropdownMenuItem>
                                ))}
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>

                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <Sun className="mr-2 h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute mr-2 h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span>{t.theme}</span>
                        </DropdownMenuSubTrigger>
                         <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                <DropdownMenuItem onClick={() => handleThemeChange('light')}>
                                  <Sun className="mr-2 h-4 w-4" />
                                  <span>{t.light}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleThemeChange('dark')}>
                                  <Moon className="mr-2 h-4 w-4" />
                                  <span>{t.dark}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleThemeChange('system')}>
                                  <Laptop className="mr-2 h-4 w-4" />
                                  <span>{t.system}</span>
                                </DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>

                </DropdownMenuContent>
             </DropdownMenu>
          )}
        </nav>
      </div>
    </header>
    {!isAdmin && (
        <>
            <AiRecommender isOpen={isRecommenderOpen} onOpenChange={setIsRecommenderOpen} />
            <ContactUs isOpen={isContactUsOpen} onOpenChange={setIsContactUsOpen} />
        </>
    )}
    </>
  );
};

export default AppHeader;
