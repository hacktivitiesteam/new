'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { getInfoItemById, getCountryData } from '@/lib/firebase-actions';
import { InfoItem, Country } from '@/lib/definitions';
import AppHeader from '@/components/app/app-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ReservationForm from '@/components/app/reservation-form';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Star, ArrowLeft } from 'lucide-react';
import { useFirestore } from '@/firebase';

type Lang = 'az' | 'en' | 'ru';

export default function ReservationPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = Array.isArray(params.itemId) ? params.itemId[0] : params.itemId;
  const firestore = useFirestore();
  
  const [item, setItem] = useState<InfoItem | null>(null);
  const [country, setCountry] = useState<Country | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<Lang>('az');

  useEffect(() => {
    const savedLang = localStorage.getItem('app-lang') as Lang;
    if (savedLang) {
      setLang(savedLang);
    }
  }, []);

  const handleSetLang = (newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem('app-lang', newLang);
  };
  
  const pageLang = lang;

  useEffect(() => {
    if (!itemId || !firestore) return;
    async function loadItem() {
      setLoading(true);
      try {
        const itemData = await getInfoItemById(firestore, itemId);
        setItem(itemData);
        if (itemData) {
            const countryData = await getCountryData(firestore, itemData.countrySlug);
            setCountry(countryData);
        }
      } catch (error) {
        console.error("Failed to load item data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadItem();
  }, [itemId, firestore]);
  
  const t = {
    az: { back: 'Geri', not_found: 'Məkan tapılmadı.', hotel: 'Otel', restaurant: 'Restoran', details: 'Rezervasiya Detalları' },
    en: { back: 'Back', not_found: 'Location not found.', hotel: 'Hotel', restaurant: 'Restaurant', details: 'Reservation Details' },
    ru: { back: 'Назад', not_found: 'Место не найдено.', hotel: 'Отель', restaurant: 'Ресторан', details: 'Детали бронирования' },
  }[pageLang];


  if (loading) {
    return (
        <>
            <AppHeader lang={lang} setLang={handleSetLang} />
            <main className="container mx-auto px-4 py-8">
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <div>
                        <Skeleton className="w-full h-80 rounded-lg" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-3/4" />
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                </div>
            </main>
        </>
    );
  }

  if (!item) {
    return (
      <>
        <AppHeader lang={lang} setLang={handleSetLang} />
        <div className="text-center py-20">{t.not_found}</div>
      </>
    );
  }
  
  const name = (pageLang === 'en' && item.name_en) ? item.name_en : (pageLang === 'ru' && item.name_ru) ? item.name_ru : item.name;
  const description = (pageLang === 'en' && item.description_en) ? item.description_en : (pageLang === 'ru' && item.description_ru) ? item.description_ru : item.description;

  return (
    <>
      <AppHeader lang={lang} setLang={handleSetLang} />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t.back}
            </Button>
          <Card>
            <div className="grid md:grid-cols-2">
                <div className="relative h-64 md:h-full">
                    <Image src={item.imageUrl || ''} alt={name} layout="fill" objectFit="cover" className="rounded-t-lg md:rounded-l-lg md:rounded-t-none" />
                </div>
                <div>
                    <CardHeader>
                        <CardTitle className="text-3xl">{name}</CardTitle>
                        <CardDescription>
                            {item.rating && (
                                <div className="flex items-center gap-1 text-sm mt-1">
                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                    <span>{item.rating.toFixed(1)}</span>
                                    <span className="text-muted-foreground">· {item.category === 'hotels' ? t.hotel : t.restaurant}</span>
                                </div>
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-6 text-muted-foreground">{description}</p>
                        <h3 className="font-semibold mb-4 text-lg border-t pt-4">{t.details}</h3>
                        <ReservationForm item={item} lang={pageLang} />
                    </CardContent>
                </div>
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}
