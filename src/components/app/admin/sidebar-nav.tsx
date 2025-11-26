'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ListOrdered, Rocket, MessageSquareQuote, BarChart } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LogoutButton } from '@/components/app/logout-button';

const links = [
  { name: 'İdarə Paneli', href: '/admin', icon: Home },
  { name: 'Rezervasiyalar', href: '/admin/reservations', icon: ListOrdered },
  { name: 'Müraciətlər', href: '/admin/feedback', icon: MessageSquareQuote },
  { name: 'Statistika', href: '/admin/statistics', icon: BarChart },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="p-4 border-b">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-2 rounded-lg">
            <Rocket className="h-6 w-6" />
          </div>
          <span className="text-lg font-semibold">Admin Panel</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-2 px-4 py-4">
        {links.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
              pathname === link.href && 'bg-muted text-primary'
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.name}
          </Link>
        ))}
      </nav>
      <div className="mt-auto p-4 border-t">
        <LogoutButton />
      </div>
    </div>
  );
}
