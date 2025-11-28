import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Footer from '@/components/app/footer';
import { FirebaseClientProvider } from '@/firebase';
import ChatAssistant from '@/components/app/chat/chat-assistant';
import { ThemeProvider } from '@/components/app/theme-provider';
import { AnimationProvider } from '@/components/app/animation-provider';
import { ReadingModeProvider } from '@/components/app/reading-mode-provider';

export const metadata: Metadata = {
  title: 'Turism Helper',
  description: 'Your guide to exploring the world.',
  icons: {
    icon: 'data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2024%2024%22%20fill=%22none%22%20stroke=%22%233B82F6%22%20stroke-width=%222%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22%3E%3Ccircle%20cx=%2212%22%20cy=%2212%22%20r=%2210%22%3E%3C/circle%3E%3Cpath%20d=%22M12%202a14.5%2014.5%200%200%200%200%2020%2014.5%2014.5%200%200%200%200-20%22%3E%3C/path%3E%3Cpath%20d=%22M2%2012h20%22%3E%3C/path%3E%3C/svg%3E',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <AnimationProvider>
              <ReadingModeProvider>
                <div className="flex-grow">
                  {children}
                </div>
                <ChatAssistant />
                <Footer />
                <Toaster />
              </ReadingModeProvider>
            </AnimationProvider>
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
