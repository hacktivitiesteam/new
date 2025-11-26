'use client';

import { logout } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useFormStatus } from 'react-dom';

export function LogoutButton() {
  const { pending } = useFormStatus();

  return (
    <form action={logout}>
      <Button 
        type="submit" 
        variant="ghost" 
        className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50"
        disabled={pending}
        aria-disabled={pending}
      >
        <LogOut className="mr-2 h-4 w-4" />
        <span>Çıxış</span>
      </Button>
    </form>
  );
}
