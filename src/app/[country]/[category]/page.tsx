'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getCountryData, getInfoItems } from '@/lib/firebase-actions';
import type { Country, InfoItem, InfoCategory } from '@/lib/definitions';
import { CATEGORIES } from '@/lib/constants';
import AppHeader from '@/components/app/app-header';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, MapPin, Phone, Star, Ticket, Volume2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useReadingMode } from '@/components/app/reading-mode-provider';
import { cn } from '@/lib/utils';

type Lang = 'az' | 'en' | 'ru';

const t = (lang: Lang) => ({
    az: {
        location: 'Konum',
        nearby: 'Yaxınlıqdakı Restoran',
        showMenu: 'Menyunu göstər',
        reserve: 'Rezervasiya et',
        entranceFee: 'Giriş Ödənişi:',
        ingredients: 'Tərkibi:',
        menu: 'Menyu',
        back: 'Geri',
        noInfo: 'Məlumat Tapılmadı',
        noInfoDesc: 'Bu kateqoriya üçün hələ heç bir məlumat əlavə edilməyib.',
        pronunciationError: 'Tələffüz Xətası',
        pronunciationErrorDesc: 'Tələffüz üçün mətn və ya dil təyin edilməyib.',
        pronunciationErrorGeneric: 'Tələffüz zamanı xəta baş verdi.',
    },
    en: {
        location: 'Location',
        nearby: 'Nearby Restaurant',
        showMenu: 'Show Menu',
        reserve: 'Reserve',
        entranceFee: 'Entrance Fee:',
        ingredients: 'Ingredients:',
        menu: 'Menu',
        back: 'Back',
        noInfo: 'No Information Found',
        noInfoDesc: 'No information has been added for this category yet.',
        pronunciationError: 'Pronunciation Error',
        pronunciationErrorDesc: 'Missing text or language for pronunciation.',
        pronunciationErrorGeneric: 'An error occurred during pronunciation.',
    },
    ru: {
        location: 'Местоположение',
        nearby: 'Ближайший ресторан',
        showMenu: 'Показать меню',
        reserve: 'Забронировать',
        entranceFee: 'Входная плата:',
        ingredients: 'Ингредиенты:',
        menu: 'Меню',
        back: 'Назад',
        noInfo: 'Информация не найдена',
        noInfoDesc: 'Для этой категории еще не добавлена информация.',
        pronunciationError: 'Ошибка произношения',
        pronunciationErrorDesc: 'Отсутствует текст или язык для произношения.',
        pronunciationErrorGeneric: 'Произошла ошибка при произношении.',
    }
}[lang]);


function CardItem({ item, lang }: { item: InfoItem, lang: Lang }) {
    const router = useRouter();
    const { isReadingMode, speakText } = useReadingMode();
    const canReserve = item.category === 'hotels' || item.category === 'restaurants';
    
    const hasNearbyRestaurant = !!item.nearbyRestaurants;
    const hasLocation = !!item.googleMapsUrl;
    const hasMenu = item.category === 'restaurants' && !!item.menu;

    const showEntranceFee = item.category === 'attractions' && !!item.entranceFee;

    const buildNearbyRestaurantUrl = () => {
        if (!item.nearbyRestaurants) return '';
        const params = new URLSearchParams({
            name: item.nearbyRestaurants,
            image: item.nearbyRestaurantImageUrl || '',
            countrySlug: item.countrySlug,
            lang: lang,
        });
        return `/reserve/nearby?${params.toString()}`;
    }

    const name = (lang === 'en' && item.name_en) ? item.name_en : (lang === 'ru' && item.name_ru) ? item.name_ru : item.name;
    const description = (lang === 'en' && item.description_en) ? item.description_en : (lang === 'ru' && item.description_ru) ? item.description_ru : item.description;
    const ingredients = (lang === 'en' && item.ingredients_en) ? item.ingredients_en : (lang === 'ru' && item.ingredients_ru) ? item.ingredients_ru : item.ingredients;
    const trans = t(lang);

    const handleSpeak = (text: string | undefined) => {
        if (text) speakText(text, lang === 'az' ? 'tr-TR' : `${lang}-${lang.toUpperCase()}`);
    }

    return (
        <Card className="overflow-hidden shadow-lg rounded-xl flex flex-col transition-transform duration-300 hover:-translate-y-1">
           {item.imageUrl && <div className="relative h-56 w-full">
                <Image
                    src={item.imageUrl}
                    alt={name || 'Location Image'}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                />
            </div>}
            <CardHeader onMouseEnter={() => handleSpeak(name)} className={cn(isReadingMode && 'cursor-pointer hover:bg-muted/50')}>
                <CardTitle>{name}</CardTitle>
                <div className="flex items-center justify-between pt-2">
                    {item.rating != null && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span>{Number(item.rating).toFixed(1)}</span>
                        </Badge>
                    )}
                    {item.price && <Badge variant="outline">{item.price}</Badge>}
                </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                <CardDescription className={cn("line-clamp-3", isReadingMode && 'cursor-pointer hover:bg-muted/50')} onMouseEnter={() => handleSpeak(description)}>
                    {description}
                </CardDescription>
                {item.address && (
                    <div className={cn("flex items-start gap-2 text-sm text-muted-foreground", isReadingMode && 'cursor-pointer hover:bg-muted/50')} onMouseEnter={() => handleSpeak(item.address)}>
                        <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                        <span>{item.address}</span>
                    </div>
                )}
                {item.phone && (
                    <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", isReadingMode && 'cursor-pointer hover:bg-muted/50')} onMouseEnter={() => handleSpeak(item.phone)}>
                        <Phone className="h-4 w-4 shrink-0" />
                        <span>{item.phone}</span>
                    </div>
                )}
                 {showEntranceFee && (
                     <div className={cn("pt-2 flex items-center gap-2 text-sm text-muted-foreground", isReadingMode && 'cursor-pointer hover:bg-muted/50')} onMouseEnter={() => handleSpeak(`${trans.entranceFee} ${item.entranceFee}`)}>
                        <Ticket className="h-4 w-4" />
                        <span className="font-semibold">{trans.entranceFee}</span>
                        <span>{item.entranceFee}</span>
                    </div>
                )}
                {ingredients && (
                     <div className={cn("pt-2", isReadingMode && 'cursor-pointer hover:bg-muted/50')} onMouseEnter={() => handleSpeak(`${trans.ingredients} ${ingredients}`)}>
                        <h4 className="font-semibold text-sm mb-1">{trans.ingredients}</h4>
                        <p className="text-sm text-muted-foreground">{ingredients}</p>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row items-stretch gap-2 pt-0">
                {hasLocation && (
                    <Button variant="outline" className="w-full" asChild>
                        <a href={item.googleMapsUrl} target="_blank" rel="noopener noreferrer">{trans.location}</a>
                    </Button>
                )}
                {hasNearbyRestaurant && (
                     <Button asChild variant="outline" className="w-full">
                         <Link href={buildNearbyRestaurantUrl()}>{trans.nearby}</Link>
                    </Button>
                )}
                {hasMenu && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full">{trans.showMenu}</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{name} - {trans.menu}</DialogTitle>
                            </DialogHeader>
                             <div className="py-4">
                                {item.menu && (item.menu.trim().startsWith('http') || item.menu.trim().startsWith('data:image/')) ? (
                                    <div className="relative h-96">
                                        <Image src={item.menu.trim()} alt={`${name || 'Restaurant'} menu`} fill className="object-contain" />
                                    </div>
                                ) : (
                                    <p className={cn("text-sm text-muted-foreground whitespace-pre-wrap", isReadingMode && 'cursor-pointer hover:bg-muted/50')} onMouseEnter={() => handleSpeak(item.menu)}>
                                        {item.menu}
                                    </p>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
                {canReserve && (
                     <Button className="w-full" asChild>
                        <Link href={`/reserve/${item.id}`}>{trans.reserve}</Link>
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}

function PhraseCard({ item, lang }: { item: InfoItem, lang: Lang }) {
    const { toast } = useToast();
    const { isReadingMode, speakText } = useReadingMode();
    const trans = t(lang);
    
    const topPhrase = lang === 'en' ? item.phrase_en : lang === 'ru' ? item.phrase_ru : item.phrase;
    const bottomPhrase = item.translation;

    const handleSpeak = (textToSpeak: string | undefined, speechLang: string | undefined) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) {
            toast({
                variant: "destructive",
                title: "Unsupported Browser",
                description: "Your browser does not support text-to-speech.",
            });
            return;
        }

        if (!textToSpeak || !speechLang) {
            toast({
                variant: "destructive",
                title: trans.pronunciationError,
                description: trans.pronunciationErrorDesc,
            });
            return;
        }

        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = speechLang;
        
        utterance.onerror = (event) => {
            console.error("SpeechSynthesisUtterance.onerror", event);
        };
        
        window.speechSynthesis.speak(utterance);
    };

    return (
        <Card className="p-4 transition-transform duration-300 hover:-translate-y-1">
            <CardContent className="p-0 flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-lg font-semibold">{topPhrase}</p>
                    <p className="text-muted-foreground">{bottomPhrase}</p>
                </div>
                {item.translation && item.language && (
                  <Button variant="ghost" size="icon" onClick={() => handleSpeak(bottomPhrase, item.language)}>
                      <Volume2 className="h-6 w-6" />
                  </Button>
                )}
            </CardContent>
        </Card>
    );
}


function ItemDetails({ item, lang }: { item: InfoItem, lang: Lang }) {
    const { isReadingMode, speakText } = useReadingMode();
    const name = (lang === 'en' && item.name_en) ? item.name_en : (lang === 'ru' && item.name_ru) ? item.name_ru : item.name;
    const description = (lang === 'en' && item.description_en) ? item.description_en : (lang === 'ru' && item.description_ru) ? item.description_ru : item.description;

    const handleSpeak = (text: string | undefined) => {
        if (text) speakText(text, lang === 'az' ? 'tr-TR' : `${lang}-${lang.toUpperCase()}`);
    }

    return (
        <Card className="w-full max-w-4xl mx-auto overflow-hidden shadow-lg rounded-xl transition-transform duration-300 hover:-translate-y-1">
             {item.imageUrl && (
                <div className="relative h-64 w-full">
                    <Image src={item.imageUrl} alt={name || 'Image'} fill className="object-cover" />
                </div>
             )}
            <CardHeader onMouseEnter={() => handleSpeak(name)} className={cn(isReadingMode && 'cursor-pointer hover:bg-muted/50')}>
                <CardTitle className="text-3xl font-bold">{name}</CardTitle>
            </CardHeader>
            <CardContent className={cn("space-y-6", isReadingMode && 'cursor-pointer hover:bg-muted/50')} onMouseEnter={() => handleSpeak(description?.replace(/<[^>]+>/g, ''))}>
                <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: description?.replace(/\n/g, '<br />') || '' }} />
            </CardContent>
        </Card>
    );
}

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const countrySlug = Array.isArray(params.country) ? params.country[0] : params.country;
  const categoryId = Array.isArray(params.category) ? params.category[0] : params.category as InfoCategory;
  const firestore = useFirestore();

  const [country, setCountry] = useState<Country | null>(null);
  const [items, setItems] = useState<InfoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalLang, setGlobalLang] = useState<Lang>('az');
  const { toast } = useToast();
  const { isReadingMode, speakText } = useReadingMode();

  useEffect(() => {
    const savedLang = localStorage.getItem('app-lang') as Lang;
    if (savedLang) {
      setGlobalLang(savedLang);
    }
  }, []);

  const handleSetLang = (newLang: Lang) => {
    setGlobalLang(newLang);
    localStorage.setItem('app-lang', newLang);
  };
  
  const pageLang = globalLang;
  const trans = t(pageLang);
  const categoryDetails = CATEGORIES.find(c => c.id === categoryId);

  useEffect(() => {
    if (!countrySlug || !categoryId || !firestore) return;

    async function loadData() {
      setLoading(true);
      try {
        const countryData = await getCountryData(firestore, countrySlug);
        setCountry(countryData);
        
        if (countryData) {
            const itemsData = await getInfoItems(firestore, countrySlug, categoryId);
            setItems(itemsData);
        }

      } catch (error) {
        console.error("Failed to load category data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [countrySlug, categoryId, firestore]);
  

  const handleSpeak = (text: string | undefined) => {
    if (text) speakText(text, pageLang === 'az' ? 'tr-TR' : `${pageLang}-${pageLang.toUpperCase()}`);
  }

  const renderContent = () => {
    if (loading) {
      const gridCols = 'md:grid-cols-2 lg:grid-cols-3';
      const cardHeight = categoryId === 'useful_words' ? 'h-24' : 'h-96';
      return (
        <div className={`grid gap-6 ${gridCols}`}>
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className={`${cardHeight} w-full`} />
          ))}
        </div>
      );
    }
    
    if (items.length === 0) {
        return (
            <div className={cn("text-center py-20 bg-muted rounded-lg", isReadingMode && 'cursor-pointer hover:bg-muted/50')} onMouseEnter={() => handleSpeak(`${trans.noInfo}. ${trans.noInfoDesc}`)}>
                <h2 className="text-2xl font-bold">{trans.noInfo}</h2>
                <p className="text-muted-foreground mt-2">{trans.noInfoDesc}</p>
            </div>
        )
    }

    if (categoryId === 'useful_words') {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map(item => (
            <PhraseCard key={item.id} item={item} lang={pageLang} />
          ))}
        </div>
      );
    }
    
    if (['essentials', 'culture'].includes(categoryId)) {
      return (
        <div className="space-y-8">
          {items.map(item => (
            <ItemDetails key={item.id} item={item} lang={pageLang} />
          ))}
        </div>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map(item => (
          <CardItem key={item.id} item={item} lang={pageLang} />
        ))}
      </div>
    );
  };
  
  const countryName = (pageLang === 'en' && country?.name_en) ? country.name_en : (pageLang === 'ru' && country?.name_ru) ? country.name_ru : country?.name;
  const categoryName = (pageLang === 'en' ? categoryDetails?.name : (pageLang === 'ru' && categoryDetails?.name_ru) ? categoryDetails?.name_ru : categoryDetails?.name_az);

  return (
    <>
      <AppHeader lang={globalLang} setLang={handleSetLang} />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 space-y-2">
             <Button variant="ghost" onClick={() => router.back()} className="pl-0">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {countryName || trans.back}
            </Button>
            <h1 className={cn("text-4xl font-extrabold tracking-tight lg:text-5xl font-headline", isReadingMode && 'cursor-pointer hover:bg-muted/50')} onMouseEnter={() => handleSpeak(categoryName)}>
                {categoryName}
            </h1>
        </div>

        {renderContent()}
      </main>
    </>
  );
}
