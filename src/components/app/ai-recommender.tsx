'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from '@/hooks/use-toast';
import { recommendCountry } from '@/ai/flows/travel-ai-flow';
import { Loader2, Wand2, Sparkles, ArrowRight, X } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { fetchCountries } from '@/lib/firebase-actions';
import { Country } from '@/lib/definitions';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import Link from 'next/link';

type Lang = 'az' | 'en' | 'ru';

const translations = {
  az: {
    title: 'AI Ölkə Təklifi',
    description: 'Büdcənizi və maraqlarınızı seçin, AI sizin üçün ən uyğun ölkəni təklif etsin.',
    budget: 'Büdcəniz',
    budgetOptions: { low: 'Ekonom', medium: 'Orta', high: 'Lüks' },
    travelStyle: 'Səyahət Tərziniz',
    travelStyleOptions: { adventure: 'Macəra', relax: 'Sakit İstirahət', family: 'Ailəvi', culture: 'Mədəniyyət' },
    interests: 'Maraqlarınız',
    interestOptions: { beach: 'Çimərlik', nature: 'Təbiət', history: 'Tarix', city: 'Şəhər Həyatı', food: 'Mətbəx' },
    getRecommendation: 'Təklif Al',
    recommendationTitle: 'AI Təklifi',
    recommendationError: 'Təklif alarkən xəta baş verdi.',
    noCountriesError: 'Sistemdə heç bir ölkə tapılmadı. Zəhmət olmasa, daha sonra yenidən cəhd edin.',
    goToCountry: 'Ölkəyə Keçid',
    tryAgain: 'Yenidən Cəhd Edin',
    validation: {
        budget: 'Büdcə seçmək məcburidir.',
    }
  },
  en: {
    title: 'AI Country Recommendation',
    description: 'Select your budget and interests, and let AI suggest the best country for you.',
    budget: 'Your Budget',
    budgetOptions: { low: 'Economy', medium: 'Standard', high: 'Luxury' },
    travelStyle: 'Your Travel Style',
    travelStyleOptions: { adventure: 'Adventure', relax: 'Relaxation', family: 'Family', culture: 'Cultural' },
    interests: 'Your Interests',
    interestOptions: { beach: 'Beach', nature: 'Nature', history: 'History', city: 'City Life', food: 'Cuisine' },
    getRecommendation: 'Get Recommendation',
    recommendationTitle: 'AI Recommendation',
    recommendationError: 'An error occurred while getting the recommendation.',
    noCountriesError: 'No countries found in the system. Please try again later.',
    goToCountry: 'Go to Country',
    tryAgain: 'Try Again',
    validation: {
        budget: 'Budget selection is required.',
    }
  },
  ru: {
    title: 'Рекомендация страны от AI',
    description: 'Выберите свой бюджет и интересы, и AI предложит вам лучшую страну.',
    budget: 'Ваш бюджет',
    budgetOptions: { low: 'Эконом', medium: 'Стандарт', high: 'Люкс' },
    travelStyle: 'Ваш стиль путешествия',
    travelStyleOptions: { adventure: 'Приключения', relax: 'Спокойный отдых', family: 'Семейный', culture: 'Культурный' },
    interests: 'Ваши интересы',
    interestOptions: { beach: 'Пляж', nature: 'Природа', history: 'История', city: 'Городская жизнь', food: 'Кухня' },
    getRecommendation: 'Получить рекомендацию',
    recommendationTitle: 'Рекомендация AI',
    recommendationError: 'Произошла ошибка при получении рекомендации.',
    noCountriesError: 'В системе не найдено стран. Пожалуйста, повторите попытку позже.',
    goToCountry: 'Перейти в страну',
    tryAgain: 'Попробовать снова',
     validation: {
        budget: 'Выбор бюджета обязателен.',
    }
  },
};

const interestsList = [ 'beach', 'nature', 'history', 'city', 'food' ] as const;
type Interest = typeof interestsList[number];

const createFormSchema = (lang: Lang) => z.object({
  budget: z.string({ required_error: translations[lang].validation.budget }),
  travelStyle: z.string().optional(),
  interests: z.array(z.string()).optional(),
});


interface AiRecommenderProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function AiRecommender({ isOpen, onOpenChange }: AiRecommenderProps) {
  const [lang, setLang] = useState<Lang>('az');
  const [recommendation, setRecommendation] = useState<{ country: string; reason: string; slug: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [allCountries, setAllCountries] = useState<Country[]>([]);
  
  const { toast } = useToast();
  const firestore = useFirestore();

  useEffect(() => {
    const savedLang = localStorage.getItem('app-lang') as Lang | null;
    if (savedLang) setLang(savedLang);
    
    const handleStorageChange = () => {
        const newLang = localStorage.getItem('app-lang') as Lang | null;
        if (newLang && newLang !== lang) setLang(newLang);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('app-lang-change', handleStorageChange);
    
    return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('app-lang-change', handleStorageChange);
    };
  }, [lang]);
  
  useEffect(() => {
    if (isOpen && firestore) {
        async function loadCountries() {
            try {
                const countries = await fetchCountries(firestore);
                setAllCountries(countries);
            } catch (e) {
                console.error(e);
            }
        }
        loadCountries();
    }
  }, [isOpen, firestore]);

  const t = translations[lang];
  const formSchema = createFormSchema(lang);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      interests: [],
    },
  });
  
  const { isSubmitting } = form.formState;
  
  const resetState = () => {
    setRecommendation(null);
    setError(null);
    form.reset();
  }
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
        resetState();
    }
    onOpenChange(open);
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setError(null);
    setRecommendation(null);
    
    if (allCountries.length === 0) {
        setError(t.noCountriesError);
        return;
    }

    try {
      const countryNames = allCountries.map(c => {
          if (lang === 'en' && c.name_en) return c.name_en;
          if (lang === 'ru' && c.name_ru) return c.name_ru;
          return c.name;
      });

      const response = await recommendCountry({ ...values, language: lang, countryList: countryNames });
      
      const recommendedCountryName = response.country.trim();
      const foundCountry = allCountries.find(c => 
          c.name.trim().toLowerCase() === recommendedCountryName.toLowerCase() ||
          (c.name_en && c.name_en.trim().toLowerCase() === recommendedCountryName.toLowerCase()) ||
          (c.name_ru && c.name_ru.trim().toLowerCase() === recommendedCountryName.toLowerCase())
      );

      if (foundCountry) {
          setRecommendation({ ...response, slug: foundCountry.slug });
      } else {
          // If AI returns a country not in our list, just show the text.
          setRecommendation({ ...response, slug: '' });
      }

    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Xəta',
        description: t.recommendationError,
      });
      setError(t.recommendationError);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'><Wand2 /> {t.title}</DialogTitle>
        </DialogHeader>
        
        {isSubmitting ? (
             <div className="flex flex-col items-center justify-center space-y-4 py-16">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">{t.recommendationTitle}...</p>
            </div>
        ) : recommendation ? (
            <div className='py-4 space-y-4'>
                <Alert>
                    <Sparkles className="h-4 w-4" />
                    <AlertTitle>{recommendation.country}</AlertTitle>
                    <AlertDescription>
                       {recommendation.reason}
                    </AlertDescription>
                </Alert>
                <div className='flex gap-2'>
                     {recommendation.slug && (
                        <Button asChild className='w-full'>
                            <Link href={`/${recommendation.slug}`} onClick={() => handleOpenChange(false)}>
                                {t.goToCountry} <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    )}
                    <Button variant="outline" onClick={resetState} className='w-full'>
                        {t.tryAgain}
                    </Button>
                </div>
            </div>
        ) : error ? (
             <div className='py-4 space-y-4 text-center'>
                 <Alert variant="destructive">
                    <X className="h-4 w-4" />
                    <AlertTitle>Xəta</AlertTitle>
                    <AlertDescription>
                       {error}
                    </AlertDescription>
                </Alert>
                <Button variant="outline" onClick={resetState}>
                    {t.tryAgain}
                </Button>
             </div>
        ) : (
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                    <FormItem className="space-y-3">
                    <FormLabel>{t.budget}</FormLabel>
                    <FormControl>
                        <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                        >
                        {Object.entries(t.budgetOptions).map(([key, value]) => (
                            <FormItem key={key} className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                    <RadioGroupItem value={key} />
                                </FormControl>
                                <FormLabel className="font-normal">{value}</FormLabel>
                            </FormItem>
                        ))}
                        </RadioGroup>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                
                <FormField
                control={form.control}
                name="travelStyle"
                render={({ field }) => (
                    <FormItem className="space-y-3">
                    <FormLabel>{t.travelStyle}</FormLabel>
                    <FormControl>
                        <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                        >
                        {Object.entries(t.travelStyleOptions).map(([key, value]) => (
                            <FormItem key={key} className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                    <RadioGroupItem value={key} />
                                </FormControl>
                                <FormLabel className="font-normal">{value}</FormLabel>
                            </FormItem>
                        ))}
                        </RadioGroup>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="interests"
                render={() => (
                    <FormItem>
                    <div className="mb-4">
                        <FormLabel className="text-base">{t.interests}</FormLabel>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        {interestsList.map((item) => (
                            <FormField
                            key={item}
                            control={form.control}
                            name="interests"
                            render={({ field }) => {
                                return (
                                <FormItem
                                    key={item}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                    <FormControl>
                                    <Checkbox
                                        checked={field.value?.includes(item)}
                                        onCheckedChange={(checked) => {
                                        return checked
                                            ? field.onChange([...(field.value || []), item])
                                            : field.onChange(
                                                field.value?.filter(
                                                (value) => value !== item
                                                )
                                            )
                                        }}
                                    />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                     {t.interestOptions[item as Interest]}
                                    </FormLabel>
                                </FormItem>
                                )
                            }}
                            />
                        ))}
                    </div>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t.getRecommendation}
                </Button>
            </form>
            </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
