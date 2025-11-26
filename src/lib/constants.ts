import type { LucideIcon } from "lucide-react";
import { Bed, UtensilsCrossed, Landmark, FileText, BookOpen, MessageSquare, Soup, Hospital } from 'lucide-react';

export const AUTH_TOKEN_COOKIE = "firebase-auth-token";

type Category = {
  id: 'hotels' | 'restaurants' | 'attractions' | 'essentials' | 'culture' | 'useful_words' | 'cuisine' | 'hospitals';
  name: string; // English name
  name_az: string; // Azerbaijani name
  name_ru?: string; // Russian name (optional)
  icon: LucideIcon;
};

export const CATEGORIES: Category[] = [
  { id: 'hotels', name: 'Hotels', name_az: 'Hotellər', name_ru: 'Отели', icon: Bed },
  { id: 'restaurants', name: 'Restaurants', name_az: 'Restoranlar', name_ru: 'Рестораны', icon: UtensilsCrossed },
  { id: 'hospitals', name: 'Hospitals', name_az: 'Xəstəxanalar', name_ru: 'Больницы', icon: Hospital },
  { id: 'cuisine', name: 'Cuisine', name_az: 'Milli Mətbəx', name_ru: 'Национальная кухня', icon: Soup },
  { id: 'attractions', name: 'Attractions', name_az: 'Görməli Yerlər', name_ru: 'Достопримечательности', icon: Landmark },
  { id: 'essentials', name: 'Visa & Essentials', name_az: 'Viza & Zəruriyyətlər', name_ru: 'Виза и необходимое', icon: FileText },
  { id: 'culture', name: 'Culture & Tips', name_az: 'Mədəniyyət & Məsləhətlər', name_ru: 'Культура и советы', icon: BookOpen },
  { id: 'useful_words', name: 'Useful Words', name_az: 'Faydalı Sözlər', name_ru: 'Полезные слова', icon: MessageSquare },
];
