import { Card, CardContent } from '@/components/ui/card';
import { Volume2 } from 'lucide-react';
import { InfoItem } from '@/lib/definitions';
import { Button } from '../ui/button';

interface UsefulWordCardProps {
  item: InfoItem;
}

export default function UsefulWordCard({ item }: UsefulWordCardProps) {
    
    const handleSpeak = (text: string) => {
        if ('speechSynthesis' in window && text) {
            const utterance = new SpeechSynthesisUtterance(text);
            // You can configure language if you have it in your data
            // utterance.lang = 'tr-TR' or 'it-IT' etc.
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <Card className="p-4">
            <CardContent className="p-0 flex items-center justify-between">
                <div>
                    <p className="text-lg font-semibold">{item.word}</p>
                    <p className="text-muted-foreground">{item.translation}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleSpeak(item.word || '')} aria-label={`Listen to ${item.word}`}>
                    <Volume2 className="h-6 w-6" />
                </Button>
            </CardContent>
        </Card>
    );
}
