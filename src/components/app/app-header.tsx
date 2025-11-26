import Link from 'next/link';
import { Button } from '../ui/button';
import { Globe, Languages, Check, ChevronDown, Headset, Ear, PenSquare, Wand2 } from 'lucide-react';
import ContactUs from './contact-us';
import { ThemeToggle } from './theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from '@/lib/utils';
import { useAnimation } from '../app/animation-provider';
import React, {useState} from 'react';
import { useReadingMode } from './reading-mode-provider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import Image from 'next/image';
import AiRecommender from './ai-recommender';

interface LanguageSwitcherProps {
  currentLang: 'az' | 'en' | 'ru';
  setLang: (lang: 'az' | 'en' | 'ru') => void;
  tooltipText: string;
}

const languages = [
    { code: 'az', name: 'Azərbaycan', flag: 'https://flagcdn.com/w40/az.png' },
    { code: 'en', name: 'English', flag: 'https://flagcdn.com/w40/gb.png' },
    { code: 'ru', name: 'Русский', flag: 'https://flagcdn.com/w40/ru.png' },
] as const;


const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ currentLang, setLang, tooltipText }) => {
  const { triggerAnimation } = useAnimation();
  const selectedLanguage = languages.find(l => l.code === currentLang);

  const handleLanguageChange = (e: Event, langCode: 'az' | 'en' | 'ru') => {
      e.preventDefault();
      triggerAnimation({
          icon: Languages,
          onAnimationEnd: () => setLang(langCode)
      });
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="ghost">
                      {selectedLanguage && <Image src={selectedLanguage.flag} alt={`${selectedLanguage.name} flag`} width={24} height={18} className="mr-2 rounded-sm" />}
                      {selectedLanguage?.name}
                      <ChevronDown className="ml-1 h-4 w-4 opacity-70" />
                      <span className="sr-only">Dili dəyişdir</span>
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                  {languages.map((lang) => (
                  <DropdownMenuItem key={lang.code} onSelect={(e) => handleLanguageChange(e, lang.code)}>
                      <span className={cn("flex w-full items-center justify-between", currentLang === lang.code && "font-bold")}>
                          <span className='flex items-center'>
                            <Image src={lang.flag} alt={`${lang.name} flag`} width={20} height={15} className="mr-2 rounded-sm" />
                            {lang.name}
                          </span>
                          {currentLang === lang.code && <Check className="h-4 w-4" />}
                      </span>
                  </DropdownMenuItem>
                  ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent>
            <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const ReadingModeToggle = ({tooltipText}: {tooltipText: string}) => {
    const { isReadingMode, toggleReadingMode } = useReadingMode();
    const { triggerAnimation } = useAnimation();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        triggerAnimation({
            icon: Ear,
            onAnimationEnd: toggleReadingMode
        });
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        aria-label="Toggle Reading Mode"
                        onClick={handleClick}
                        className={cn(isReadingMode && 'bg-accent text-accent-foreground')}
                    >
                        <Ear className="h-6 w-6" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{tooltipText}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

interface AppHeaderProps {
    isAdmin?: boolean;
    lang?: 'az' | 'en' | 'ru';
    setLang?: (lang: 'az' | 'en' | 'ru') => void;
}

const headerTranslations = {
    az: {
        change_lang: 'Dili dəyişdir',
        contact_us: 'Bizimlə Əlaqə',
        communication_aid: 'Ünsiyyət Köməkçisi',
        reading_mode: 'Oxuma Modu',
        theme: 'Tema Rəngi',
        ai_recommender: 'AI Köməkçi'
    },
    en: {
        change_lang: 'Change Language',
        contact_us: 'Contact Us',
        communication_aid: 'Communication Aid',
        reading_mode: 'Reading Mode',
        theme: 'Theme Color',
        ai_recommender: 'AI Recommender'
    },
    ru: {
        change_lang: 'Изменить язык',
        contact_us: 'Связаться с нами',
        communication_aid: 'Помощник по общению',
        reading_mode: 'Режим чтения',
        theme: 'Цвет темы',
        ai_recommender: 'AI Рекомендатор'
    }
}


const AppHeader = ({ isAdmin = false, lang = 'az', setLang }: AppHeaderProps) => {
  const t = headerTranslations[lang];
  const [isRecommenderOpen, setIsRecommenderOpen] = useState(false);
  const { triggerAnimation } = useAnimation();

  const handleAiRecommenderClick = () => {
    triggerAnimation({
        icon: Wand2,
        onAnimationEnd: () => setIsRecommenderOpen(true)
    });
  }

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
            <div className='flex items-center gap-1'>
                {lang && setLang && <LanguageSwitcher currentLang={lang} setLang={setLang} tooltipText={t.change_lang} />}
                <ContactUs />
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={handleAiRecommenderClick}>
                                <Wand2 className="h-6 w-6" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{t.ai_recommender}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button asChild variant="ghost" size="icon" aria-label="Communication Aid">
                                <Link href="/communication-aid">
                                    <PenSquare className="h-6 w-6" />
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{t.communication_aid}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <ReadingModeToggle tooltipText={t.reading_mode} />
                <ThemeToggle tooltipText={t.theme} />
            </div>
          )}
        </nav>
      </div>
    </header>
    {!isAdmin && <AiRecommender isOpen={isRecommenderOpen} onOpenChange={setIsRecommenderOpen} />}
    </>
  );
};

export default AppHeader;
