import { SidebarNav } from '@/components/app/admin/sidebar-nav';
import AppHeader from '@/components/app/app-header';
import { ThemeProvider } from '@/components/app/theme-provider';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
     <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
          <div className="hidden border-r bg-muted/40 lg:block">
            <SidebarNav />
          </div>
          <div className="flex flex-col">
            <main className="flex-1 bg-background">
              {children}
            </main>
          </div>
        </div>
    </ThemeProvider>
  );
}
