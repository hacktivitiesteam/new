'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import AppHeader from '@/components/app/app-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ReservationForm from '@/components/app/reservation-form';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { InfoItem } from '@/lib/definitions';

type Lang = 'az' | 'en' | 'ru';

function ReservationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const name = searchParams.get('name') || 'Restaurant';
  const imageUrl = searchParams.get('image');
  const countrySlug = searchParams.get('countrySlug') || '';
  
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
  
  const t = {
    az: { back: 'Geri', not_available: 'Şəkil yoxdur', nearby_restaurant: 'Yaxınlıqdakı Restoran', description: 'Rezervasiya etmək üçün aşağıdakı formu doldurun.', details: 'Rezervasiya Detalları' },
    en: { back: 'Back', not_available: 'Image not available', nearby_restaurant: 'Nearby Restaurant', description: 'Please fill out the form below to make a reservation.', details: 'Reservation Details' },
    ru: { back: 'Назад', not_available: 'Изображение недоступно', nearby_restaurant: 'Ближайший ресторан', description: 'Пожалуйста, заполните форму ниже, чтобы сделать бронирование.', details: 'Детали бронирования' },
  }[pageLang];


  // Create a mock InfoItem for the reservation form
  const mockItem: InfoItem = {
    id: `nearby-${name.replace(/\s+/g, '-').toLowerCase()}`,
    name: name,
    countrySlug: countrySlug,
    // Add other required fields with default/mock values
    countryId: '',
    category: 'restaurants',
    description: `Reservation for ${name}`,
  };

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
                {imageUrl ? (
                  <Image src={imageUrl} alt={name} layout="fill" objectFit="cover" className="rounded-t-lg md:rounded-l-lg md:rounded-t-none" />
                ) : (
                  <div className="flex items-center justify-center h-full bg-muted rounded-t-lg md:rounded-l-lg md:rounded-t-none">
                    <p className="text-muted-foreground">{t.not_available}</p>
                  </div>
                )}
              </div>
              <div>
                <CardHeader>
                  <CardTitle className="text-3xl">{name}</CardTitle>
                  <CardDescription>
                    {t.nearby_restaurant}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-6 text-muted-foreground">
                    {t.description}
                  </p>
                  <h3 className="font-semibold mb-4 text-lg border-t pt-4">{t.details}</h3>
                  <ReservationForm item={mockItem} lang={pageLang} />
                </CardContent>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}

function ReservationFallback() {
    const [lang, setLang] = useState<'az' | 'en' | 'ru'>('az');
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


export default function NearbyReservationPage() {
  return (
    <Suspense fallback={<ReservationFallback />}>
      <ReservationContent />
    </Suspense>
  );
}
