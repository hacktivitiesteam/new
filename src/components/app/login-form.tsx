'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { login } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, LogIn, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
      Daxil ol
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useFormState(login, undefined);
  
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (state?.error) {
      toast({
        variant: "destructive",
        title: "Giriş uğursuz oldu",
        description: state.error,
      });
    }
    if (state && state.error === null) {
       toast({
          title: "Giriş uğurludur",
          description: "Admin panelinə yönləndirilirsiniz...",
        });
       router.push('/admin');
    }
  }, [state, toast, router]);


  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Parol</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
        />
      </div>
      <SubmitButton />
    </form>
  );
}
