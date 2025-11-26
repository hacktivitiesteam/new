'use client';
import { z } from 'zod';

export type Country = {
  id: string;
  name: string;
  name_en?: string;
  name_ru?: string;
  slug: string;
  imageUrl: string;
  description: string;
  description_en?: string;
  description_ru?: string;
};

export type InfoCategory = 'hotels' | 'restaurants' | 'attractions' | 'essentials' | 'culture' | 'useful_words' | 'cuisine' | 'hospitals';

export type InfoItem = {
  id: string;
  countryId: string;
  countrySlug: string;
  category: InfoCategory;
  
  name: string; 
  name_en?: string;
  name_ru?: string;
  
  description: string;
  description_en?: string;
  description_ru?: string;

  imageUrl?: string;
  rating?: number;
  price?: string;

  phrase?: string; 
  phrase_en?: string;
  phrase_ru?: string;
  translation?: string; 
  language?: string; 
  
  googleMapsUrl?: string;
  
  ingredients?: string; 
  ingredients_en?: string;
  ingredients_ru?: string;
  
  menu?: string; 
  address?: string; 
  phone?: string; 
  entranceFee?: string; 

  nearbyRestaurants?: string; 
  nearbyRestaurantImageUrl?: string;
};

export type Reservation = {
  id: string;
  itemId: string;
  itemName: string;
  countrySlug?: string;
  userName: string;
  email: string;
  date: string;
  time: string;
  guests: number;
  specialRequests?: string;
  createdAt: any;
};

export type Feedback = {
  id: string;
  name: string;
  surname: string;
  email: string;
  message: string;
  createdAt: any;
};


export const TtsInputSchema = z.object({
  text: z.string().describe('The text to be converted to speech.'),
  languageCode: z.string().describe('The language of the text (e.g., "az-AZ", "en-US").'),
});

export type TtsInput = z.infer<typeof TtsInputSchema>;

export const TtsOutputSchema = z.object({
  audioContent: z.string().describe('The base64 encoded audio content.'),
});

export type TtsOutput = z.infer<typeof TtsOutputSchema>;
