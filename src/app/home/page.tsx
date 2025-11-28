'use client';


import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { fetchCountries } from '@/lib/firebase-actions';
import type { Country } from '@/lib/definitions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Languages, UtensilsCrossed, MapPinned, Globe, Repeat, ArrowRight, Compass, BookOpen, Route } from 'lucide-react';
import AppHeader from '@/components/app/app-header';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useAuth } from '@/firebase';
import { signInAnonymously } from 'firebase/auth';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useReadingMode } from '@/components/app/reading-mode-provider';
import { cn } from '@/lib/utils';
import { useAnimation } from '@/components/app/animation-provider';

function Stats({ lang }: { lang: 'az' | 'en' | 'ru' }) {
    const { isReadingMode, speakText } = useReadingMode();
    const content = {
        az: {
            section_title: 'Turistlərin Üzləşdiyi Əsas Problemlər',
            route: 'Səyahət rotası',
            route_desc: 'Turistlərin əksəriyyəti gedəcəyi ölkə haqqında yetərli məlumata sahib deyil.',
            language: 'Dil',
            language_desc: 'Səyahətçilər ünsiyyət qurmaqda çətinlik çəkir, əsas yerli ifadələr təcrübəni yaxşılaşdırır.',
            culture: 'Mədəniyyət',
            culture_desc: 'Turistlər ölkənin mədəniyyəti haqqında məlumatı olmur.',
            attractions: 'Görməli yerlər',
            attractions_desc: 'Gəzməli yerlər və onlara yaxın olan digər maraqlı nöqtələr haqqında məlumatları yoxdur.',
            cuisine: 'Milli Mətbəx',
            cuisine_desc: 'Turistlər ölkənin milli mətbəxini və yaxşı restoranlarını tanımır.',
        },
        en: {
            section_title: 'Problems Faced by Travelers',
            route: 'Travel Route',
            route_desc: 'Most tourists do not have enough information about the country they are visiting.',
            language: 'Language',
            language_desc: 'Travelers have difficulty communicating; basic local phrases improve the experience.',
            culture: 'Culture',
            culture_desc: 'Tourists do not have information about the country\'s culture.',
            attractions: 'Attractions',
            attractions_desc: 'They lack information about places to visit and other interesting points nearby.',
            cuisine: 'National Cuisine',
            cuisine_desc: 'Tourists are unfamiliar with the national cuisine and good restaurants of the country.',
        },
        ru: {
            section_title: 'Проблемы, с которыми сталкиваются путешественники',
            route: 'Маршрут путешествия',
            route_desc: 'Большинство туристов не имеют достаточной информации о стране, которую собираются посетить.',
            language: 'Язык',
            language_desc: 'Путешественники испытывают трудности в общении; знание основных местных фраз улучшает опыт.',
            culture: 'Культура',
            culture_desc: 'У туристов нет информации о культуре страны.',
            attractions: 'Достопримечательности',
            attractions_desc: 'У них нет информации о местах для посещения и других интересных точках поблизости.',
            cuisine: 'Национальная кухня',
            cuisine_desc: 'Туристы не знакомы с национальной кухней и хорошими ресторанами страны.',
        }
    };

    const handleSpeak = (text: string) => {
        speakText(text, lang === 'az' ? 'tr-TR' : `${lang}-${lang.toUpperCase()}`);
    }
    
  const stats = [
    { icon: Route, percentage: '33.29%', title: content[lang].route, description: content[lang].route_desc },
    { icon: Languages, percentage: '31.25%', title: content[lang].language, description: content[lang].language_desc },
    { icon: BookOpen, percentage: '28.67%', title: content[lang].culture, description: content[lang].culture_desc },
    { icon: MapPinned, percentage: '19.89%', title: content[lang].attractions, description: content[lang].attractions_desc },
    { icon: UtensilsCrossed, percentage: '14.81%', title: content[lang].cuisine, description: content[lang].cuisine_desc },
  ];

  return (
    <div>
        <h2 className={cn("text-2xl font-bold mb-6 text-center", isReadingMode && 'cursor-pointer hover:bg-muted/50')} onMouseEnter={() => handleSpeak(content[lang].section_title)}>{content[lang].section_title}</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map((stat, index) => (
            <Card key={index} className="flex flex-col items-center p-6 text-center bg-card/50 border-border/50 transition-transform duration-300 hover:-translate-y-1" onMouseEnter={() => handleSpeak(`${stat.title}. ${stat.description}`)}>
              <stat.icon className="mb-4 h-10 w-10 text-primary" />
              <p className="text-4xl font-bold text-primary">{stat.percentage}</p>
              <h3 className="mt-2 text-lg font-semibold">{stat.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{stat.description}</p>
            </Card>
          ))}
        </div>
    </div>
  );
}

function AvailableCountries({ countries, loading, lang, onCountryClick }: { countries: Country[], loading: boolean, lang: 'az' | 'en' | 'ru', onCountryClick: (href: string) => void }) {
  const { isReadingMode, speakText } = useReadingMode();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (countries.length === 0) {
    return null; // Don't show the section if there are no countries
  }
  
  const t = {
      az: 'Mövcud Ölkələr',
      en: 'Available Countries',
      ru: 'Доступные страны',
  };

  const handleSpeak = (text: string) => {
    speakText(text, lang === 'az' ? 'tr-TR' : `${lang}-${lang.toUpperCase()}`);
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    onCountryClick(href);
  };


  return (
    <div>
      <h2 className={cn("text-2xl font-bold mb-6 text-center", isReadingMode && 'cursor-pointer hover:bg-muted/50')} onMouseEnter={() => handleSpeak(t[lang])}>{t[lang]}</h2>
       <Carousel
        opts={{
          align: "start",
          loop: countries.length > 3,
        }}
        className="w-full max-w-5xl mx-auto"
      >
        <CarouselContent>
          {countries.map((country) => {
            const countryName = (lang === 'en' && country.name_en) ? country.name_en : (lang === 'ru' && country.name_ru) ? country.name_ru : country.name;
            const href = `/${country.slug}`;
            return (
            <CarouselItem key={country.id} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1 h-full">
                <a href={href} onClick={(e) => handleClick(e, href)}>
                    <Card className="h-48 overflow-hidden relative group transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.02]">
                        <Image
                            src={country.imageUrl}
                            alt={countryName}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-2">
                            <h3 className="font-semibold text-center text-2xl text-white">{countryName}</h3>
                        </div>
                    </Card>
                </a>
              </div>
            </CarouselItem>
          )})}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}

function TravelSection({ countries, loading, lang, onCountryClick }: { countries: Country[], loading: boolean, lang: 'az' | 'en' | 'ru', onCountryClick: (href: string) => void }) {
  const router = useRouter();
  const { isReadingMode, speakText } = useReadingMode();
  const [selectedCountry, setSelectedCountry] = useState('');
  const [error, setError] = useState('');

  const handleGo = () => {
    if (selectedCountry) {
      onCountryClick(`/${selectedCountry}`);
    } else {
      setError(t.error);
    }
  };

  const t = {
    az: {
        title: 'Səyahətə Başla',
        placeholder: 'Getmək istədiyiniz ölkəni seçin...',
        go: 'Get',
        error: 'Zəhmət olmasa, getmək istədiyiniz ölkəni seçin.',
        no_countries_title: 'Hələ Heç Bir Ölkə Əlavə Edilməyib',
        no_countries_desc: 'Səyahət məlumatlarını görmək üçün admin panelindən yeni bir ölkə əlavə edin.'
    },
    en: {
        title: 'Start Your Journey',
        placeholder: 'Select a country to visit...',
        go: 'Go',
        error: 'Please select a country you want to visit.',
        no_countries_title: 'No Countries Added Yet',
        no_countries_desc: 'Add a new country from the admin panel to see travel information.'
    },
    ru: {
        title: 'Начните свое путешествие',
        placeholder: 'Выберите страну для посещения...',
        go: 'Перейти',
        error: 'Пожалуйста, выберите страну, которую вы хотите посетить.',
        no_countries_title: 'Страны еще не добавлены',
        no_countries_desc: 'Добавьте новую страну в админ-панели, чтобы увидеть туристическую информацию.'
    }
  }[lang];

  const handleSpeak = (text: string) => {
    speakText(text, lang === 'az' ? 'tr-TR' : `${lang}-${lang.toUpperCase()}`);
  }

  if (loading) {
    return (
      <Card className="p-8 bg-card/50 border-border/50">
        <Skeleton className="w-1/2 h-8 mx-auto mb-4" />
        <Skeleton className="w-full h-10" />
      </Card>
    );
  }

  if (countries.length === 0) {
    return (
      <Card className="p-8 text-center bg-card/50 border-border/50" onMouseEnter={() => handleSpeak(`${t.no_countries_title}. ${t.no_countries_desc}`)}>
          <Compass className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-bold">{t.no_countries_title}</h3>
          <p className="text-muted-foreground mt-2">{t.no_countries_desc}</p>
      </Card>
    );
  }

  return (
    <Card className="p-8 bg-card/50 border-border/50">
        <div className="flex items-center gap-4 mb-4" onMouseEnter={() => handleSpeak(t.title)}>
             <Globe className="h-8 w-8 text-primary" />
             <h3 className={cn("text-2xl font-bold", isReadingMode && 'cursor-pointer')}>{t.title}</h3>
        </div>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Select onValueChange={setSelectedCountry}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => {
              const countryName = (lang === 'en' && country.name_en) ? country.name_en : (lang === 'ru' && country.name_ru) ? country.name_ru : country.name;
              return (
              <SelectItem key={country.id} value={country.slug}>
                {countryName}
              </SelectItem>
            )})}
          </SelectContent>
        </Select>
        <Button onClick={handleGo} className="w-full sm:w-auto">
          {t.go} <ArrowRight className="ml-2" />
        </Button>
      </div>
      {error && <p className="text-destructive text-sm mt-2 text-center">{error}</p>}
    </Card>
  );
}

function CurrencyConverter({ lang, isVisible }: { lang: 'az' | 'en' | 'ru', isVisible: boolean }) {
  const [amount, setAmount] = useState('100');
  const [fromCurrency, setFromCurrency] = useState('AZN');
  const [toCurrency, setToCurrency] = useState('USD');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isReadingMode, speakText } = useReadingMode();
  const converterRef = useRef<HTMLDivElement>(null);

  const rates: { [key: string]: number } = {
      USD: 0.59, TRY: 19.53, RUB: 54.28, AED: 2.16, GEL: 1.67, EUR: 0.55, GBP: 0.46, JPY: 92.89, CHF: 0.53,
      INR: 49.20, CNY: 4.29, CAD: 0.81, AUD: 0.89, BRL: 3.04, MXN: 10.91, NZD: 0.96, YER: 147.59, EGP: 28.01,
      SGD: 0.80, ZAR: 10.72, PKR: 164.44, KRW: 781.38, THB: 21.60, SAR: 2.21, QAR: 2.15, KWD: 0.18, IDR: 9259.40,
      BDT: 69.66, NOK: 6.16, SEK: 6.22, DKK: 4.11, VND: 14908.81, OMR: 0.23, JOD: 0.42, BHD: 0.22, NPR: 78.55,
      LAK: 12947.06, MMK: 1238.65, IQD: 771.59, LYD: 2.89, SDG: 350.82, AFN: 42.29, ALL: 54.60, AMD: 229.08,
      AOA: 499.41, ARS: 521.03, AWG: 1.06, AZN: 1.0
  };
  
   const t = {
        az: { title: 'Valyuta Konvertoru', amount: 'Məbləğ', from: 'Hansı valyutadan', to: 'Hansı valyutaya', negative_error: 'Mənfi dəyər çevirmək olmaz.' },
        en: { title: 'Currency Converter', amount: 'Amount', from: 'From', to: 'To', negative_error: 'Cannot convert a negative value.' },
        ru: { title: 'Конвертер валют', amount: 'Сумма', from: 'Из', to: 'В', negative_error: 'Нельзя конвертировать отрицательное значение.' },
    }[lang];

    const handleSpeak = (text: string) => {
        if (text) speakText(text, lang === 'az' ? 'tr-TR' : `${lang}-${lang.toUpperCase()}`);
    }
  
  const handleConversion = useCallback(() => {
    const numericAmount = parseFloat(amount);
    
    if (isNaN(numericAmount)) {
        setError(null);
        setResult(null);
        return;
    }
    
    if (numericAmount < 0) {
        setError(t.negative_error);
        setResult(null);
        return;
    }
    
    setError(null);
    const fromRate = rates[fromCurrency];
    const toRate = rates[toCurrency];

    if (fromRate && toRate) {
        const amountInAzn = numericAmount / fromRate;
        const convertedAmount = amountInAzn * toRate;
        setResult(`${numericAmount.toFixed(2)} ${fromCurrency} = ${convertedAmount.toFixed(2)} ${toCurrency}`);
    } else {
        setResult(null);
    }
  }, [amount, fromCurrency, toCurrency, rates, t.negative_error]);

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };
  
  useEffect(() => {
    handleConversion();
  }, [handleConversion]);
  
  useEffect(() => {
    if (isVisible && converterRef.current) {
        converterRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isVisible])

  const currencyOptions = Object.keys(rates).sort().map(currency => (
    <SelectItem key={currency} value={currency}>{currency}</SelectItem>
  ));
  
  if (!isVisible) return null;

  return (
    <Card ref={converterRef} id="currency-converter" className="p-8 bg-card/50 border-border/50 scroll-mt-24">
      <h3 className={cn("mb-4 text-2xl font-bold text-center", isReadingMode && 'cursor-pointer hover:bg-muted/50')} onMouseEnter={() => handleSpeak(t.title)}>{t.title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center relative">
        <div>
          <label className={cn("text-sm text-muted-foreground", isReadingMode && 'cursor-pointer hover:bg-muted/50')} onMouseEnter={() => handleSpeak(t.amount)}>{t.amount}</label>
          <Input 
            placeholder={t.amount}
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div onMouseEnter={() => handleSpeak(t.from)}>
              <label className={cn("text-sm text-muted-foreground", isReadingMode && 'cursor-pointer hover:bg-muted/50')}>{t.from}</label>
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{currencyOptions}</SelectContent>
              </Select>
            </div>
            <div onMouseEnter={() => handleSpeak(t.to)}>
              <label className={cn("text-sm text-muted-foreground", isReadingMode && 'cursor-pointer hover:bg-muted/50')}>{t.to}</label>
              <Select value={toCurrency} onValueChange={setToCurrency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{currencyOptions}</SelectContent>
              </Select>
            </div>
        </div>
         <Button variant="ghost" size="icon" onClick={swapCurrencies} className="absolute left-1/2 -translate-x-1/2 bottom-[-20px] md:bottom-auto md:top-full bg-background rounded-full border">
            <Repeat className="h-4 w-4" />
        </Button>
      </div>
       {error && <p className={cn("text-destructive text-sm mt-8 text-center font-semibold", isReadingMode && 'cursor-pointer hover:bg-muted/50')} onMouseEnter={() => handleSpeak(error)}>{error}</p>}
      {result && !error && (
        <div className={cn("mt-8 text-center text-2xl font-bold text-primary", isReadingMode && 'cursor-pointer hover:bg-muted/50')} onMouseEnter={() => handleSpeak(result)}>
            {result}
        </div>
      )}
    </Card>
  );
}

export default function HomePage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConverter, setShowConverter] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const auth = useAuth();
  const [lang, setLang] = useState<'az' | 'en' | 'ru'>('az');
  const router = useRouter();
  const { isReadingMode, speakText } = useReadingMode();
  const { triggerAnimation } = useAnimation();

  useEffect(() => {
    const savedLang = localStorage.getItem('app-lang') as 'az' | 'en' | 'ru' | null;
    if (savedLang) {
      setLang(savedLang);
    }
  }, []);

  const handleSetLang = (newLang: 'az' | 'en' | 'ru') => {
    setLang(newLang);
    localStorage.setItem('app-lang', newLang);
  };
  
  useEffect(() => {
    if (auth && !auth.currentUser) {
      signInAnonymously(auth).catch((error) => {
        console.error("Anonymous sign-in failed:", error);
        toast({
          variant: "destructive",
          title: "Authentication Failed",
          description: "Could not sign in anonymously. Some features may not work.",
        });
      });
    }
  }, [auth, toast]);

  useEffect(() => {
    async function getCountries() {
      if(!firestore) return;
      setLoading(true);
      try {
        const countryList = await fetchCountries(firestore);
        setCountries(countryList);
      } catch (error) {
        console.error("Failed to fetch countries:", error);
        toast({
          variant: "destructive",
          title: "Error fetching countries",
          description: "Could not load the list of countries.",
        });
      } finally {
        setLoading(false);
      }
    }
    getCountries();
  }, [firestore, toast]);
  
   useEffect(() => {
    const handleShowConverter = () => {
      setShowConverter(true);
    };

    window.addEventListener('show-converter', handleShowConverter);

    return () => {
      window.removeEventListener('show-converter', handleShowConverter);
    };
  }, []);

  const handleCountryClick = (href: string) => {
    triggerAnimation({ icon: Globe, onAnimationEnd: () => router.push(href) });
  };

  const t = {
      az: { title: 'Dünyanı Kəşf Edin', subtitle: 'Turism Helper ilə səyahət etdiyiniz ölkələr haqqında hər şeyi bir yerdə tapın.' },
      en: { title: 'Discover the World', subtitle: 'Find everything about the countries you travel to with Turism Helper, all in one place.' },
      ru: { title: 'Откройте для себя мир', subtitle: 'С Turism Helper вы найдете все о странах, в которые вы путешествуете, в одном месте.' },
  }[lang];

  const handleSpeak = (text: string) => {
    speakText(text, lang === 'az' ? 'tr-TR' : `${lang}-${lang.toUpperCase()}`);
  }

  return (
    <>
      <AppHeader lang={lang} setLang={handleSetLang} />
      <main className="container mx-auto px-4 py-12 space-y-16">
        <div className={cn("text-center max-w-3xl mx-auto", isReadingMode && 'cursor-pointer hover:bg-muted/50')} onMouseEnter={() => handleSpeak(`${t.title}. ${t.subtitle}`)}>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl text-primary">
            {t.title}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {t.subtitle}
          </p>
        </div>
        
        <Stats lang={lang} />
        
        <AvailableCountries countries={countries} loading={loading} lang={lang} onCountryClick={handleCountryClick} />

        <TravelSection countries={countries} loading={loading} lang={lang} onCountryClick={handleCountryClick} />

        <CurrencyConverter lang={lang} isVisible={showConverter} />
      </main>
    </>
  );
}
