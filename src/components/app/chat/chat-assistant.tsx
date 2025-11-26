'use client';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, X, Loader2, Sparkles } from 'lucide-react';
import { travelAi } from '@/ai/flows/travel-ai-flow';
import type { TravelAiInput } from '@/ai/flows/travel-ai-types';
import { useToast } from '@/hooks/use-toast';
import './chat.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

type Lang = 'az' | 'en' | 'ru';

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [lang, setLang] = useState<Lang>('az');

    const translations = {
        az: {
            title: 'AI Köməkçi',
            greeting: 'Salam! Mən sizin səyahət köməkçinizəm. Səyahətinizlə bağlı hər hansı bir sualınız var?',
            placeholder: "Məsələn, 'Bakıda ən yaxşı kabab haradadır?'",
            errorTitle: 'AI Köməkçi Xətası',
            errorDesc: 'Xəta baş verdi',
        },
        en: {
            title: 'AI Assistant',
            greeting: 'Hello! I am your travel assistant. Do you have any questions about your trip?',
            placeholder: "E.g., 'Where is the best kebab in Baku?'",
            errorTitle: 'AI Assistant Error',
            errorDesc: 'An error occurred',
        },
        ru: {
            title: 'AI-помощник',
            greeting: 'Здравствуйте! Я ваш помощник по путешествиям. У вас есть вопросы о вашей поездке?',
            placeholder: "Напр., 'Где лучший кебаб в Баку?'",
            errorTitle: 'Ошибка AI-помощника',
            errorDesc: 'Произошла ошибка',
        }
    };
    
  useEffect(() => {
    const savedLang = (localStorage.getItem('app-lang') as Lang) || 'az';
    setLang(savedLang);

    const handleStorageChange = () => {
      const newLang = (localStorage.getItem('app-lang') as Lang) || 'az';
      if (newLang !== lang) {
        setLang(newLang);
        // Reset chat if language changes
        setMessages([
          {
            id: 'init-greet',
            text: translations[newLang].greeting,
            sender: 'ai'
          }
        ]);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Also handle initial language set via local storage on first load
    window.addEventListener('app-lang-change', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('app-lang-change', handleStorageChange);
    };
  }, [lang]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setIsLoading(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');

    try {
      const input: TravelAiInput = { 
          prompt: currentInput,
      };

      const aiResponse = await travelAi(input);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.response,
        sender: 'ai',
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error: any) {
        toast({
            variant: "destructive",
            title: translations[lang].errorTitle,
            description: `${translations[lang].errorDesc}: ${error.message}`,
        });
        setMessages(prev => prev.filter(m => m.id !== userMessage.id));

    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggle = () => {
    const newIsOpenState = !isOpen;
    setIsOpen(newIsOpenState);
     if (newIsOpenState && messages.length === 0) {
      setMessages([
        {
          id: 'init-greet',
          text: translations[lang].greeting,
          sender: 'ai'
        }
      ]);
    }
  }
  
  const t = translations[lang];

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleToggle}
          size="icon"
          className="rounded-full w-16 h-16 bg-primary hover:bg-primary/90 shadow-lg"
          aria-label="Toggle Chat"
        >
          {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
        </Button>
      </div>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40">
          <Card className="w-[360px] h-[550px] flex flex-col shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="text-primary"/>
                <CardTitle>{t.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full" ref={scrollAreaRef}>
                 <div className="p-4 space-y-4">
                      {messages.map(msg => (
                      <div key={msg.id} className={`chat-message ${msg.sender === 'user' ? 'user' : 'ai'}`}>
                          <div className="message-content">
                            <p>{msg.text}</p>
                          </div>
                      </div>
                      ))}
                      {isLoading && (
                          <div className="chat-message ai">
                              <div className="message-content">
                                  <Loader2 className="animate-spin h-5 w-5" />
                              </div>
                          </div>
                      )}
                 </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="p-4 border-t">
              <form onSubmit={handleSubmit} className="w-full space-y-2">
                  <div className="flex items-center gap-2">
                      <Input
                      placeholder={t.placeholder}
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      disabled={isLoading}
                      autoComplete="off"
                      />
                      <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()}>
                      <Send className="h-5 w-5" />
                      </Button>
                  </div>
              </form>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
}
