
'use client';

import { useState, useEffect, Fragment } from 'react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import {
  Utensils,
  Shield,
  Hospital,
  BedDouble,
  Droplet,
  PersonStanding,
  X,
  Trash2,
  Vegan,
  GlassWater,
  CakeSlice,
  Siren,
  Pill,
  ShieldAlert,
  Languages,
  UserPlus,
  Phone,
  CarTaxiFront,
  MapPin,
  Compass,
  KeyRound,
  Sparkles,
  Wifi,
  Ticket,
  Camera,
  ShoppingBag,
  Landmark,
  Car,
  CircleDollarSign,
  WashingMachine,
  Briefcase,
  ArrowLeft,
} from 'lucide-react';

import AppHeader from '@/components/app/app-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useReadingMode } from '@/components/app/reading-mode-provider';
import { Separator } from '@/components/ui/separator';

type Lang = 'az' | 'en' | 'ru';

const translations = (lang: Lang) => ({
  az: {
    title: 'Ünsiyyət Köməkçisi',
    description: 'Danışmaqda çətinlik çəkənlər üçün vizual ünsiyyət vasitələri.',
    whiteboardTab: 'Yazı Lövhəsi',
    whiteboardPlaceholder: 'Mesajınızı buraya yazın...',
    clear: 'Təmizlə',
    iconBoardTab: 'İkon Lövhəsi',
    iconBoardDescription: 'Ehtiyacınızı bildirmək üçün bir ikona klikləyin.',
    backToHome: 'Əsas Səhifəyə Qayıt',
    categories: {
      food: 'Yemək / İçki',
      health: 'Sağlamlıq və Təhlükəsizlik',
      communication: 'Ünsiyyət',
      transport: 'Nəqliyyat və Yönləndirmə',
      accommodation: 'Yerləşmə və Otel',
      entertainment: 'Əyləncə və Aktivliklər',
      security: 'Təhlükəsizlik',
      general: 'Ümumi Ehtiyaclar',
      social: 'Sosial və Mədəni',
    },
    icons: {
      vegetarian: 'Vegetarian/Vegan yemək istəyirəm',
      drink: 'İçki istəyirəm',
      dessert: 'Şirniyyat istəyirəm',
      emergency: 'Təcili yardım lazımdır',
      medicine: 'Dərmana ehtiyacım var',
      allergy: 'Allergiyam var',
      language: 'Dil problemi yaşayıram',
      translator: 'Tərcüməçiyə ehtiyacım var',
      phone: 'Zəng etməliyəm',
      taxi: 'Taksi lazımdır',
      guide: 'Bələdçiyə ehtiyacım var',
      direction: 'Yolu göstərin',
      roomKey: 'Otaq açarı lazımdır',
      roomCleaning: 'Otağı təmizləyin',
      wifi: 'Wi-Fi lazımdır',
      activity: 'Gəzinti/Aktivlik etmək istəyirəm',
      ticket: 'Bilet almaq istəyirəm',
      police: 'Polisə ehtiyacım var',
      danger: 'Qəza/Təhlükə var',
      currency: 'Valyuta dəyişmək istəyirəm',
      water: 'Su istəyirəm',
      restroom: 'WC',
      laundry: 'Paltaryumaya ehtiyacım var',
      lostItem: 'Əşyamı itirmişəm',
      photo: 'Şəkil çəkə bilərsiniz?',
      souvenir: 'Hədiyyə almaq istəyirəm',
    },
  },
  en: {
    title: 'Communication Aid',
    description: 'Visual communication tools for those who have difficulty speaking.',
    whiteboardTab: 'Whiteboard',
    whiteboardPlaceholder: 'Write your message here...',
    clear: 'Clear',
    iconBoardTab: 'Icon Board',
    iconBoardDescription: 'Click an icon to communicate your need.',
    backToHome: 'Back to Home',
    categories: {
      food: 'Food / Drink',
      health: 'Health & Safety',
      communication: 'Communication',
      transport: 'Transport & Direction',
      accommodation: 'Accommodation & Hotel',
      entertainment: 'Entertainment & Activities',
      security: 'Security',
      general: 'General Needs',
      social: 'Social & Cultural',
    },
    icons: {
      vegetarian: 'I want a vegetarian/vegan meal',
      drink: 'I want a drink',
      dessert: 'I want a dessert',
      emergency: 'I need emergency help',
      medicine: 'I need medicine',
      allergy: 'I have an allergy',
      language: 'I have a language problem',
      translator: 'I need a translator',
      phone: 'I need to make a call',
      taxi: 'I need a taxi',
      guide: 'I need a guide',
      direction: 'Show me the way',
      roomKey: 'I need my room key',
      roomCleaning: 'Please clean the room',
      wifi: 'I need Wi-Fi',
      activity: 'I want to do an activity/tour',
      ticket: 'I want to buy a ticket',
      police: 'I need the police',
      danger: 'There is an accident/danger',
      currency: 'I want to exchange currency',
      water: 'I want water',
      restroom: 'Restroom',
      laundry: 'I need to do laundry',
      lostItem: 'I lost my item',
      photo: 'Can you take a photo?',
      souvenir: 'I want to buy a souvenir',
    },
  },
  ru: {
    title: 'Помощник по общению',
    description: 'Визуальные средства общения для тех, кто испытывает трудности с речью.',
    whiteboardTab: 'Доска для письма',
    whiteboardPlaceholder: 'Напишите ваше сообщение здесь...',
    clear: 'Очистить',
    iconBoardTab: 'Доска с иконами',
    iconBoardDescription: 'Нажмите на иконку, чтобы сообщить о своей потребности.',
    backToHome: 'Вернуться на главную',
    categories: {
      food: 'Еда / Напитки',
      health: 'Здоровье и безопасность',
      communication: 'Общение',
      transport: 'Транспорт и направление',
      accommodation: 'Проживание и отель',
      entertainment: 'Развлечения и мероприятия',
      security: 'Безопасность',
      general: 'Общие потребности',
      social: 'Социальные и культурные',
    },
    icons: {
      vegetarian: 'Я хочу вегетарианское/веганское блюдо',
      drink: 'Я хочу пить',
      dessert: 'Я хочу десерт',
      emergency: 'Мне нужна неотложная помощь',
      medicine: 'Мне нужно лекарство',
      allergy: 'У меня аллергия',
      language: 'У меня языковой барьер',
      translator: 'Мне нужен переводчик',
      phone: 'Мне нужно позвонить',
      taxi: 'Мне нужно такси',
      guide: 'Мне нужен гид',
      direction: 'Покажите дорогу',
      roomKey: 'Мне нужен ключ от номера',
      roomCleaning: 'Пожалуйста, уберите в номере',
      wifi: 'Мне нужен Wi-Fi',
      activity: 'Я хочу на экскурсию/мероприятие',
      ticket: 'Я хочу купить билет',
      police: 'Мне нужна полиция',
      danger: 'Произошла авария/опасность',
      currency: 'Я хочу обменять валюту',
      water: 'Я хочу воды',
      restroom: 'Туалет',
      laundry: 'Мне нужно постирать одежду',
      lostItem: 'Я потерял свою вещь',
      photo: 'Можете сфотографировать?',
      souvenir: 'Я хочу купить сувенир',
    },
  },
});

type IconId = keyof ReturnType<typeof translations>['az']['icons'];

type IconCategory = {
  id: keyof ReturnType<typeof translations>['az']['categories'];
  icons: {
    id: IconId;
    icon: LucideIcon;
  }[];
};

const ICON_CATEGORIES: IconCategory[] = [
  {
    id: 'food',
    icons: [
      { id: 'vegetarian', icon: Vegan },
      { id: 'drink', icon: GlassWater },
      { id: 'dessert', icon: CakeSlice },
    ],
  },
  {
    id: 'health',
    icons: [
      { id: 'emergency', icon: Siren },
      { id: 'medicine', icon: Pill },
      { id: 'allergy', icon: ShieldAlert },
    ],
  },
  {
    id: 'communication',
    icons: [
      { id: 'language', icon: Languages },
      { id: 'translator', icon: UserPlus },
      { id: 'phone', icon: Phone },
    ],
  },
  {
    id: 'transport',
    icons: [
      { id: 'taxi', icon: CarTaxiFront },
      { id: 'guide', icon: Compass },
      { id: 'direction', icon: MapPin },
    ],
  },
  {
    id: 'accommodation',
    icons: [
      { id: 'roomKey', icon: KeyRound },
      { id: 'roomCleaning', icon: Sparkles },
      { id: 'wifi', icon: Wifi },
    ],
  },
  {
    id: 'entertainment',
    icons: [
      { id: 'activity', icon: Landmark },
      { id: 'ticket', icon: Ticket },
    ],
  },
  {
    id: 'security',
    icons: [
      { id: 'police', icon: Shield },
      { id: 'danger', icon: Car },
    ],
  },
  {
    id: 'general',
    icons: [
      { id: 'currency', icon: CircleDollarSign },
      { id: 'water', icon: Droplet },
      { id: 'restroom', icon: PersonStanding },
      { id: 'laundry', icon: WashingMachine },
      { id: 'lostItem', icon: Briefcase },
    ],
  },
  {
    id: 'social',
    icons: [
      { id: 'photo', icon: Camera },
      { id: 'souvenir', icon: ShoppingBag },
    ],
  },
];


function IconDisplay({ icon, text, onClear }: { icon: LucideIcon; text: string; onClear: () => void }) {
  const Icon = icon;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg text-center p-8 relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4"
          onClick={onClear}
        >
          <X className="h-6 w-6" />
        </Button>
        <div className="flex flex-col items-center justify-center gap-6">
          <Icon className="h-32 w-32 text-primary" />
          <p className="text-3xl font-bold">{text}</p>
        </div>
      </Card>
    </div>
  );
}


export default function CommunicationAidPage() {
  const [lang, setLang] = useState<Lang>('az');
  const [whiteboardText, setWhiteboardText] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<{ id: IconId; icon: LucideIcon } | null>(null);
  const { isReadingMode, speakText } = useReadingMode();

  useEffect(() => {
    const savedLang = localStorage.getItem('app-lang') as Lang | null;
    if (savedLang) {
      setLang(savedLang);
    }
  }, []);

  const handleSetLang = (newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem('app-lang', newLang);
  };
  
  const trans = translations(lang)[lang];

  const handleSpeak = (text: string | undefined) => {
    if (text) speakText(text, lang === 'az' ? 'tr-TR' : `${lang}-${lang.toUpperCase()}`);
  }

  return (
    <>
      <AppHeader lang={lang} setLang={handleSetLang} />

      {selectedIcon && (
        <IconDisplay
          icon={selectedIcon.icon}
          text={trans.icons[selectedIcon.id]}
          onClear={() => setSelectedIcon(null)}
        />
      )}

      <main className="container mx-auto px-4 py-8">
        <div className="mb-4">
            <Link href="/home" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {trans.backToHome}
            </Link>
        </div>
        <div className={cn("text-center mb-8", isReadingMode && "cursor-pointer hover:bg-muted/50")} onMouseEnter={() => handleSpeak(`${trans.title}. ${trans.description}`)}>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">{trans.title}</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {trans.description}
          </p>
        </div>

        <Tabs defaultValue="icon-board" className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="icon-board" onMouseEnter={() => handleSpeak(trans.iconBoardTab)}>{trans.iconBoardTab}</TabsTrigger>
            <TabsTrigger value="whiteboard" onMouseEnter={() => handleSpeak(trans.whiteboardTab)}>{trans.whiteboardTab}</TabsTrigger>
          </TabsList>
          <TabsContent value="whiteboard">
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="relative">
                  <Textarea
                    placeholder={trans.whiteboardPlaceholder}
                    value={whiteboardText}
                    onChange={(e) => setWhiteboardText(e.target.value)}
                    className="h-32 text-lg"
                    aria-label="Whiteboard input"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute bottom-2 right-2 text-muted-foreground"
                    onClick={() => setWhiteboardText('')}
                    aria-label="Clear whiteboard"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
                <div className="w-full h-64 flex items-center justify-center bg-muted rounded-lg p-4 overflow-auto">
                  <p
                    className="text-5xl font-bold text-center break-words"
                    style={{ fontSize: Math.max(20, 72 - whiteboardText.length / 2) + 'px' }}
                  >
                    {whiteboardText}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="icon-board">
            <Card>
              <CardContent className="p-4">
                <p className={cn("text-center text-muted-foreground mb-6", isReadingMode && "cursor-pointer hover:bg-muted/50")} onMouseEnter={() => handleSpeak(trans.iconBoardDescription)}>
                  {trans.iconBoardDescription}
                </p>
                <div className="space-y-8">
                  {ICON_CATEGORIES.map((category, index) => (
                    <Fragment key={category.id}>
                       <div className="space-y-4">
                          <h3 className={cn("text-lg font-semibold text-center", isReadingMode && "cursor-pointer hover:bg-muted/50")} onMouseEnter={() => handleSpeak(trans.categories[category.id])}>{trans.categories[category.id]}</h3>
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {category.icons.map((iconInfo) => {
                                const text = trans.icons[iconInfo.id];
                                return (
                                  <Card
                                    key={iconInfo.id}
                                    className="p-4 flex flex-col items-center justify-center gap-2 text-center cursor-pointer hover:bg-accent hover:-translate-y-1 transition-transform"
                                    onClick={() => {
                                      setSelectedIcon(iconInfo);
                                      handleSpeak(text);
                                    }}
                                  >
                                    <iconInfo.icon className="h-10 w-10 text-primary" />
                                    <p className="font-medium text-sm">{text}</p>
                                  </Card>
                                );
                              })}
                          </div>
                       </div>
                       {index < ICON_CATEGORIES.length - 1 && <Separator />}
                    </Fragment>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}

    
