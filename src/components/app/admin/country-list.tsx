'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { fetchCountries, deleteCountry } from '@/lib/firebase-actions';
import { Country } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MoreHorizontal, PlusCircle, Trash2, Edit } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import CountryForm from './country-form';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useFirestore } from '@/firebase';

export default function CountryList() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const { toast } = useToast();
  const firestore = useFirestore();

  const loadCountries = useCallback(async () => {
    if (!firestore) return;
    setLoading(true);
    try {
      const data = await fetchCountries(firestore);
      setCountries(data);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Xəta', description: 'Ölkələri yükləmək mümkün olmadı.' });
    } finally {
      setLoading(false);
    }
  }, [firestore, toast]);

  useEffect(() => {
    loadCountries();
  }, [loadCountries]);

  const handleAddClick = () => {
    setSelectedCountry(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (country: Country) => {
    setSelectedCountry(country);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (country: Country) => {
    setSelectedCountry(country);
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedCountry || !firestore) return;
    try {
      await deleteCountry(firestore, selectedCountry.id);
      toast({ title: 'Uğurlu', description: `${selectedCountry.name} ölkəsi silindi.` });
      loadCountries();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Xəta', description: 'Ölkəni silmək mümkün olmadı.' });
    } finally {
      setIsAlertOpen(false);
      setSelectedCountry(null);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleAddClick}>
          <PlusCircle className="mr-2 h-4 w-4" /> Yeni Ölkə Əlavə Et
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {countries.map((country) => (
          <Card key={country.id} className="relative group">
            <Image src={country.imageUrl} alt={country.name} width={400} height={200} className="rounded-t-lg object-cover w-full aspect-video" />
            <div className="p-4">
              <CardTitle>{country.name}</CardTitle>
              <CardDescription className="line-clamp-2">{country.description}</CardDescription>
            </div>
            <div className="absolute top-2 right-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEditClick(country)}>
                    <Edit className="mr-2 h-4 w-4" /> Redaktə et
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDeleteClick(country)} className="text-red-500">
                    <Trash2 className="mr-2 h-4 w-4" /> Sil
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        ))}
      </div>

      <CountryForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onFormSubmit={loadCountries}
        country={selectedCountry}
      />

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Silməni təsdiqləyirsiz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu əməliyyat geri qaytarıla bilməz. Bu, '{selectedCountry?.name}' ölkəsini və ona aid bütün məlumatları sistemdən siləcək.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ləğv et</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Bəli, Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
