import type { Metadata } from 'next';
import Script from 'next/script';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';
import './globals.css';

export const metadata: Metadata = {
  title: 'TripMind — AI Travel Planning',
  description:
    'Plan your perfect trip through a friendly AI conversation. TripMind builds personalized itineraries, tracks expenses, and keeps everything in one place.',
  keywords: ['travel planning', 'AI itinerary', 'trip planner', 'travel AI'],
  openGraph: {
    title: 'TripMind — AI Travel Planning',
    description: 'Plan your perfect trip through a friendly AI conversation.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <Script src="https://cdn.lordicon.com/lordicon.js" strategy="lazyOnload" />
        <ThemeProvider>
          <AuthProvider>
            {children}
            <div className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg border border-border bg-background/80 backdrop-blur-md p-1 animate-fade-up">
              <ThemeToggle />
            </div>
            <Toaster richColors position="top-center" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
