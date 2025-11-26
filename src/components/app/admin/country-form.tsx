'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Country } from '@/lib/definitions';
import { createOrUpdateCountry } from '@/lib/firebase-actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { useEffect } from 'react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Ad (AZ) ən azı 2 hərf olmalıdır.' }),
  name_en: z.string().optional(),
  name_ru: z.string().optional(),
  description: z.string().min(10, { message: 'Təsvir (AZ) ən azı 10 hərf olmalıdır.' }),
  description_en: z.string().optional(),
  description_ru: z.string().optional(),
  imageUrl: z.string().url({ message: 'Düzgün bir URL daxil edin.' }),
});

interface CountryFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onFormSubmit: () => void;
  country?: Country | null;
}

export default function CountryForm({ isOpen, onOpenChange, onFormSubmit, country }: CountryFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      name_en: '',
      name_ru: '',
      description: '',
      description_en: '',
      description_ru: '',
      imageUrl: '',
    },
  });

  const { toast } = useToast();
  const { isSubmitting } = form.formState;
  const firestore = useFirestore();

  useEffect(() => {
    if (country) {
      form.reset({
        name: country.name,
        name_en: country.name_en || '',
        name_ru: country.name_ru || '',
        description: country.description,
        description_en: country.description_en || '',
        description_ru: country.description_ru || '',
        imageUrl: country.imageUrl,
      });
    } else {
      form.reset({
        name: '',
        name_en: '',
        name_ru: '',
        description: '',
        description_en: '',
        description_ru: '',
        imageUrl: '',
      });
    }
  }, [country, form]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if(!firestore) return;
    try {
      await createOrUpdateCountry(firestore, values, country?.id);
      toast({
        title: 'Uğurlu Əməliyyat',
        description: `Ölkə uğurla ${country ? 'yeniləndi' : 'yaradıldı'}.`,
      });
      onFormSubmit();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Xəta',
        description: 'Əməliyyat zamanı xəta baş verdi.',
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{country ? 'Ölkəni Redaktə Et' : 'Yeni Ölkə Əlavə Et'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ölkə Adı (AZ)</FormLabel>
                  <FormControl>
                    <Input placeholder="Məsələn: Azərbaycan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ölkə Adı (EN)</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g.: Azerbaijan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="name_ru"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ölkə Adı (RU)</FormLabel>
                  <FormControl>
                    <Input placeholder="Напр.: Азербайджан" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Təsvir (AZ)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ölkə haqqında qısa məlumat..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Təsvir (EN)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Brief information about the country..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="description_ru"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Təsvir (RU)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Краткая информация о стране..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Şəkil URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Ləğv et
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {country ? 'Yenilə' : 'Əlavə Et'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
