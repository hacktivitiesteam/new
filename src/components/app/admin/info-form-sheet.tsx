'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Country, InfoItem, InfoCategory } from '@/lib/definitions';
import { CATEGORIES } from '@/lib/constants';
import { createOrUpdateInfoItem } from '@/lib/firebase-actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useFirestore } from '@/firebase';

const formSchema = z.object({
  countryId: z.string().min(1, 'Ölkə seçmək məcburidir.'),
  category: z.string().min(1, 'Kateqoriya seçmək məcburidir.'),
  name: z.string().optional(),
  name_en: z.string().optional(),
  name_ru: z.string().optional(),
  description: z.string().optional(),
  description_en: z.string().optional(),
  description_ru: z.string().optional(),
  imageUrl: z.string().optional(),
  rating: z.any().optional(),
  price: z.string().optional(),
  phrase: z.string().optional(),
  phrase_en: z.string().optional(),
  phrase_ru: z.string().optional(),
  translation: z.string().optional(),
  language: z.string().optional(),
  googleMapsUrl: z.string().url({ message: 'Düzgün bir URL daxil edin.' }).optional().or(z.literal('')),
  ingredients: z.string().optional(),
  ingredients_en: z.string().optional(),
  ingredients_ru: z.string().optional(),
  menu: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  entranceFee: z.string().optional(),
  nearbyRestaurants: z.string().optional(),
  nearbyRestaurantImageUrl: z.string().optional(),
});


interface InfoFormSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onFormSubmit: () => void;
  item?: InfoItem | null;
  countries: Country[];
}

const pronunciationLanguages = [
    { value: 'az-AZ', label: 'Azərbaycanca' },
    { value: 'tr-TR', label: 'Türkcə' },
    { value: 'en-US', label: 'İngiliscə' },
    { value: 'ru-RU', label: 'Rusca' },
]

export default function InfoFormSheet({ isOpen, onOpenChange, onFormSubmit, item, countries }: InfoFormSheetProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      countryId: '',
      category: '',
      name: '',
      name_en: '',
      name_ru: '',
      description: '',
      description_en: '',
      description_ru: '',
      imageUrl: '',
      price: '',
      phrase: '',
      phrase_en: '',
      phrase_ru: '',
      translation: '',
      language: '',
      googleMapsUrl: '',
      ingredients: '',
      ingredients_en: '',
      ingredients_ru: '',
      menu: '',
      address: '',
      phone: '',
      entranceFee: '',
      nearbyRestaurants: '',
      nearbyRestaurantImageUrl: '',
    }
  });
  const firestore = useFirestore();

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: item?.name || '',
        name_en: item?.name_en || '',
        name_ru: item?.name_ru || '',
        description: item?.description || '',
        description_en: item?.description_en || '',
        description_ru: item?.description_ru || '',
        countryId: item?.countryId || '',
        category: item?.category || '',
        imageUrl: item?.imageUrl || '',
        rating: item?.rating || undefined,
        price: item?.price || '',
        phrase: item?.phrase || '',
        phrase_en: item?.phrase_en || '',
        phrase_ru: item?.phrase_ru || '',
        translation: item?.translation || '',
        language: item?.language || '',
        googleMapsUrl: item?.googleMapsUrl || '',
        ingredients: item?.ingredients || '',
        ingredients_en: item?.ingredients_en || '',
        ingredients_ru: item?.ingredients_ru || '',
        menu: item?.menu || '',
        address: item?.address || '',
        phone: item?.phone || '',
        entranceFee: item?.entranceFee || '',
        nearbyRestaurants: item?.nearbyRestaurants || '',
        nearbyRestaurantImageUrl: item?.nearbyRestaurantImageUrl || '',
      });
    }
  }, [item, form, isOpen]);


  const { toast } = useToast();
  const { isSubmitting } = form.formState;
  const selectedCategory = form.watch('category');

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;
    
    try {
      const selectedCountry = countries.find(c => c.id === values.countryId);
      if (!selectedCountry) {
        throw new Error("Seçilmiş ölkə tapılmadı.");
      }

      let itemData: Partial<InfoItem> = {
        countryId: values.countryId,
        countrySlug: selectedCountry.slug,
        category: values.category as InfoCategory,
        name: values.name || '',
        name_en: values.name_en || '',
        name_ru: values.name_ru || '',
        description: values.description || '',
        description_en: values.description_en || '',
        description_ru: values.description_ru || '',
        imageUrl: values.imageUrl || '',
        rating: values.rating ? Number(values.rating) : undefined,
        price: values.price || '',
        phrase: values.phrase || '',
        phrase_en: values.phrase_en || '',
        phrase_ru: values.phrase_ru || '',
        translation: values.translation || '',
        language: values.language || '',
        googleMapsUrl: values.googleMapsUrl || '',
        ingredients: values.ingredients || '',
        ingredients_en: values.ingredients_en || '',
        ingredients_ru: values.ingredients_ru || '',
        menu: values.menu || '',
        address: values.address || '',
        phone: values.phone || '',
        entranceFee: values.entranceFee || '',
        nearbyRestaurants: values.nearbyRestaurants,
        nearbyRestaurantImageUrl: values.nearbyRestaurantImageUrl,
      };
      
      Object.keys(itemData).forEach(key => {
          const itemKey = key as keyof typeof itemData;
          if (itemData[itemKey] === '' || itemData[itemKey] === undefined || itemData[itemKey] === null) {
              delete itemData[itemKey];
          }
      });

      await createOrUpdateInfoItem(firestore, itemData, item?.id);
      
      toast({
        title: 'Uğurlu Əməliyyat',
        description: `Məlumat uğurla ${item ? 'yeniləndi' : 'yaradıldı'}.`,
      });
      onFormSubmit();
      onOpenChange(false);
    } catch (error) {
        console.error(error);
      toast({
        variant: 'destructive',
        title: 'Xəta',
        description: 'Əməliyyat zamanı xəta baş verdi.',
      });
    }
  }

  const showNameField = !['useful_words'].includes(selectedCategory || '');
  const showDescriptionField = !['useful_words'].includes(selectedCategory || '');

  const showImageField = ['hotels', 'restaurants', 'attractions', 'cuisine', 'hospitals'].includes(selectedCategory || '');
  const showLocationFields = ['hotels', 'restaurants', 'attractions', 'hospitals'].includes(selectedCategory || '');
  const showPhoneField = ['hospitals', 'hotels', 'restaurants'].includes(selectedCategory || '');
  const showPriceField = ['cuisine', 'restaurants', 'hotels'].includes(selectedCategory || '');
  const showRatingField = ['hotels', 'restaurants', 'attractions'].includes(selectedCategory || '');
  
  const showCuisineFields = selectedCategory === 'cuisine';
  const showRestaurantFields = selectedCategory === 'restaurants';
  const showHotelFields = selectedCategory === 'hotels';
  const showAttractionFields = selectedCategory === 'attractions';

  const showUsefulWordsFields = selectedCategory === 'useful_words';


  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{item ? 'Məlumatı Redaktə Et' : 'Yeni Məlumat Əlavə Et'}</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="countryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ölkə</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Ölkə seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {countries.map(country => (
                        <SelectItem key={country.id} value={country.id}>{country.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kateqoriya</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Kateqoriya seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name_az}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {selectedCategory && (
                <>
                    {showNameField && (
                        <div className="p-4 border rounded-lg space-y-4">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem><FormLabel>Başlıq (AZ)</FormLabel><FormControl><Input placeholder="Məkanın və ya məlumatın adı" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="name_en" render={({ field }) => (
                                <FormItem><FormLabel>Başlıq (EN)</FormLabel><FormControl><Input placeholder="Title in English" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="name_ru" render={({ field }) => (
                                <FormItem><FormLabel>Başlıq (RU)</FormLabel><FormControl><Input placeholder="Название на русском" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                    )}

                    {showDescriptionField && (
                        <div className="p-4 border rounded-lg space-y-4">
                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem><FormLabel>Məzmun (AZ)</FormLabel><FormControl><Textarea placeholder="Ətraflı məlumat..." {...field} value={field.value || ''} rows={10} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="description_en" render={({ field }) => (
                                <FormItem><FormLabel>Məzmun (EN)</FormLabel><FormControl><Textarea placeholder="Content in English..." {...field} value={field.value || ''} rows={10} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="description_ru" render={({ field }) => (
                                <FormItem><FormLabel>Məzmun (RU)</FormLabel><FormControl><Textarea placeholder="Содержимое на русском..." {...field} value={field.value || ''} rows={10} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                    )}
                    
                    {showImageField && (
                        <FormField control={form.control} name="imageUrl" render={({ field }) => (
                            <FormItem><FormLabel>Şəkil URL</FormLabel><FormControl><Input placeholder="https://example.com/image.jpg" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                    )}
                    
                    {showLocationFields && (
                        <FormField control={form.control} name="googleMapsUrl" render={({ field }) => (
                            <FormItem><FormLabel>Google Maps URL</FormLabel><FormControl><Input placeholder="https://maps.app.goo.gl/..." {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                    )}

                    {showLocationFields && (
                        <FormField control={form.control} name="address" render={({ field }) => (
                            <FormItem><FormLabel>Ünvan</FormLabel><FormControl><Input placeholder="Məs: Bakı, Tbilisi pr. 1045" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                    )}

                    {showPhoneField && (
                        <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem><FormLabel>Telefon</FormLabel><FormControl><Input placeholder="+994 12 430 00 00" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                    )}

                    {showPriceField && (
                        <FormField control={form.control} name="price" render={({ field }) => (
                            <FormItem><FormLabel>Qiymət</FormLabel><FormControl><Input placeholder="$$ - $$$" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                    )}

                    {showRatingField && (
                        <FormField control={form.control} name="rating" render={({ field }) => (
                            <FormItem><FormLabel>Reytinq (0-5)</FormLabel><FormControl><Input type="number" step="0.1" min="0" max="5" placeholder="4.5" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                    )}

                    {(showRestaurantFields || showHotelFields) && (
                        <FormField control={form.control} name="menu" render={({ field }) => (
                            <FormItem><FormLabel>Menyu (Link və ya Məzmun)</FormLabel><FormControl><Textarea placeholder="https://example.com/menu.pdf və ya menyu məzmunu" {...field} value={field.value || ''} rows={3} /></FormControl><FormMessage /></FormItem>
                        )} />
                    )}

                    {showCuisineFields && (
                        <div className="p-4 border rounded-lg space-y-4">
                            <FormField control={form.control} name="ingredients" render={({ field }) => (
                                <FormItem><FormLabel>İnqrediyentlər (AZ)</FormLabel><FormControl><Textarea placeholder="Yeməyin tərkibi..." {...field} value={field.value || ''} rows={3} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="ingredients_en" render={({ field }) => (
                                <FormItem><FormLabel>İnqrediyentlər (EN)</FormLabel><FormControl><Textarea placeholder="Ingredients in English..." {...field} value={field.value || ''} rows={3} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="ingredients_ru" render={({ field }) => (
                                <FormItem><FormLabel>İnqrediyentlər (RU)</FormLabel><FormControl><Textarea placeholder="Ингредиенты на русском..." {...field} value={field.value || ''} rows={3} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                    )}
                    
                     {(showAttractionFields || showHotelFields) && (
                        <div className='p-4 border rounded-lg space-y-4'>
                            <h4 className='font-medium text-center'>Yaxınlıqdakı Restoran Məlumatları</h4>
                            <FormDescription>
                                Bu məkanı ziyarət edənlərə yaxınlıqdakı bir restoranı tövsiyə edin. Sistem restoranı adına görə tapacaq.
                            </FormDescription>
                            <FormField control={form.control} name="nearbyRestaurants" render={({ field }) => (
                                <FormItem><FormLabel>Restoranın Adı</FormLabel><FormControl><Input placeholder="Sistemdəki restoranın dəqiq adı" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="nearbyRestaurantImageUrl" render={({ field }) => (
                                <FormItem><FormLabel>Restoran Şəkli (URL)</FormLabel><FormControl><Input placeholder="https://example.com/image.jpg" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                    )}

                    {showUsefulWordsFields && (
                         <div className="p-4 border rounded-lg space-y-4">
                            <FormField control={form.control} name="phrase" render={({ field }) => (
                                <FormItem><FormLabel>İfadə (AZ)</FormLabel><FormControl><Input placeholder="Məs: Salam" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="phrase_en" render={({ field }) => (
                                <FormItem><FormLabel>İfadə (EN)</FormLabel><FormControl><Input placeholder="Məs: Hello" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                            )} />
                              <FormField control={form.control} name="phrase_ru" render={({ field }) => (
                                <FormItem><FormLabel>İfadə (RU)</FormLabel><FormControl><Input placeholder="Məs: Привет" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="translation" render={({ field }) => (
                                <FormItem><FormLabel>Tələffüz Ediləcək Söz</FormLabel><FormControl><Input placeholder="Tələffüz üçün söz (məs: Privet)" {...field} value={field.value || ''} /></FormControl><FormMessage><FormDescription>Buraya daxil etdiyiniz söz seçilmiş tələffüz dilində səsləndiriləcək.</FormDescription></FormMessage></FormItem>
                            )} />
                            <FormField
                              control={form.control}
                              name="language"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tələffüz dili</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Dil seçin" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {pronunciationLanguages.map(lang => (
                                        <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                        </div>
                    )}
                    
                </>
            )}

            <SheetFooter className="pt-4">
              <SheetClose asChild>
                <Button type="button" variant="outline">Ləğv et</Button>
              </SheetClose>
              <Button type="submit" disabled={isSubmitting || !selectedCategory}>
                 {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {item ? 'Yenilə' : 'Əlavə Et'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
