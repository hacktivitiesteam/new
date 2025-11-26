'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';

type Lang = 'az' | 'en' | 'ru';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const countrySlug = searchParams.get('country');
  
  const [lang, setLang] = useState<Lang>('az');

  useEffect(() => {
    const savedLang = localStorage.getItem('app-lang') as Lang;
    if (savedLang) {
      setLang(savedLang);
    }
  }, []);
  
  const pageLang = lang;
  
  const t = {
    az: { title: 'Rezervasiya Uğurludur!', description: 'Rezervasiyanız uğurla qeydə alındı. Təyin etdiyiniz zamanda sizi gözləyəcəyik.', new_reservation: 'Yeni Rezervasiya', back_to_country: 'Ölkəyə Qayıt' },
    en: { title: 'Reservation Successful!', description: 'Your reservation has been successfully registered. We will be waiting for you at the appointed time.', new_reservation: 'New Reservation', back_to_country: 'Back to Country' },
    ru: { title: 'Бронирование успешно!', description: 'Ваше бронирование успешно зарегистрировано. Мы будем ждать вас в назначенное время.', new_reservation: 'Новое бронирование', back_to_country: 'Вернуться в страну' },
  }[pageLang];


  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400">
            <CheckCircle className="h-8 w-8" />
          </div>
          <CardTitle className="mt-4 text-2xl">{t.title}</CardTitle>
          <CardDescription className="mt-2">
            {t.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-2">
            <Button className="w-full" variant="outline" onClick={() => router.back()}>{t.new_reservation}</Button>
            {countrySlug && (
                <Button className="w-full" onClick={() => router.push(`/${countrySlug}`)}>{t.back_to_country}</Button>
            )}
        </CardContent>
      </Card>
    </main>
  );
}

function LoadingFallback() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    )
}

export default function ReservationSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SuccessContent />
    </Suspense>
  );
}
