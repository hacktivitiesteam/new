'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppHeader from '@/components/app/app-header';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getReservations, fetchCountries } from '@/lib/firebase-actions';
import { useFirestore } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';

function ReservationChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const firestore = useFirestore();

  useEffect(() => {
    if (!firestore) return;

    async function loadData() {
      setLoading(true);
      try {
        const [reservations, countries] = await Promise.all([
          getReservations(firestore),
          fetchCountries(firestore)
        ]);
        
        const countryMap = new Map(countries.map(c => [c.slug, c.name]));
        const counts: { [key: string]: number } = {};

        countries.forEach(country => {
            counts[country.name] = 0;
        });

        reservations.forEach(reservation => {
          if (reservation.countrySlug) {
              const countryName = countryMap.get(reservation.countrySlug);
              if (countryName) {
                if (!counts[countryName]) {
                  counts[countryName] = 0;
                }
                counts[countryName]++;
              }
          }
        });

        const chartData = Object.keys(counts).map(countryName => ({
            name: countryName,
            reservations: counts[countryName]
        }));
        
        setData(chartData);
      } catch (error) {
        console.error("Failed to load chart data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [firestore]);

  if (loading) {
    return <Skeleton className="h-[350px] w-full" />;
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ 
            backgroundColor: 'hsl(var(--background))', 
            borderColor: 'hsl(var(--border))' 
          }}
        />
        <Legend />
        <Bar dataKey="reservations" fill="hsl(var(--primary))" name="Rezervasiyalar" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function StatisticsPage() {
  return (
    <>
    <AppHeader isAdmin={true} />
    <main className="p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Statistika</h1>
        <p className="text-muted-foreground">Rezervasiya və digər məlumatlar üzrə statistik göstəricilər.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ölkələr üzrə Rezervasiya Statistikası</CardTitle>
          <CardDescription>Hər bir ölkə üçün edilən ümumi rezervasiyaların sayı.</CardDescription>
        </CardHeader>
        <CardContent>
          <ReservationChart />
        </CardContent>
      </Card>
    </main>
    </>
  );
}
