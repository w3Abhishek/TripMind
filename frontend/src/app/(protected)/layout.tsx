'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  MapPin, Plus, Compass, Users, User, LogOut, Menu, X,
  Home, DollarSign,
} from 'lucide-react';
import { useState } from 'react';
import { getUserTrips } from '@/lib/firestore';
import { TripDoc } from '@/lib/types';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [trips, setTrips] = useState<(TripDoc & { id: string })[]>([]);

  useEffect(() => {
    if (!loading && !user) router.replace('/');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      getUserTrips(user.uid).then(setTrips).catch(console.error);
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center animate-pulse">
            <MapPin className="w-5 h-5 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">Loading TripMind…</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: '/trips',   icon: Home,       label: 'My Trips'   },
    { href: '/chat',    icon: Compass,    label: 'New Trip'   },
    { href: '/account', icon: User,       label: 'Account'    },
  ];

  const isActive = (href: string) =>
    href === '/chat' ? pathname.startsWith('/chat') : pathname.startsWith(href);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ── Sidebar (desktop) ── */}
      <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border flex-shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-sidebar-border">
          <Link href="/trips" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <MapPin className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-sidebar-foreground">TripMind</span>
          </Link>
        </div>

        {/* New Trip button */}
        <div className="px-4 pt-4">
          <Link
            href="/chat"
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            New Trip
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 pt-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive(href)
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          ))}

          {/* Recent trips */}
          {trips.length > 0 && (
            <div className="pt-4">
              <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                Recent Trips
              </p>
              {trips.slice(0, 6).map(trip => (
                <Link
                  key={trip.id}
                  href={`/trip/${trip.id}`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all truncate ${
                    pathname === `/trip/${trip.id}`
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
                  <span className="truncate">{trip.destination || trip.title}</span>
                </Link>
              ))}
            </div>
          )}
        </nav>

        {/* User footer */}
        <div className="px-4 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-3">
            {user.photoURL ? (
              <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="w-8 h-8 rounded-full flex-shrink-0 object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-primary" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user.displayName}</p>
              <p className="text-xs text-sidebar-foreground/50 truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={signOut}
              className="flex items-center gap-2 flex-1 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* ── Mobile header + bottom nav ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-background">
          <Link href="/trips" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">TripMind</span>
          </Link>
          <div className="flex items-center gap-1">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-muted">
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile drawer */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
            <div className="relative w-64 bg-sidebar h-full flex flex-col shadow-xl animate-slide-in">
              <div className="px-4 py-4 border-b border-sidebar-border flex items-center justify-between">
                <span className="font-bold text-sidebar-foreground">TripMind</span>
                <button onClick={() => setSidebarOpen(false)}><X className="w-5 h-5 text-sidebar-foreground" /></button>
              </div>
              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {navItems.map(({ href, icon: Icon, label }) => (
                  <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                      isActive(href) ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                    }`}>
                    <Icon className="w-4 h-4" />{label}
                  </Link>
                ))}
              </nav>
              <div className="px-4 py-4 border-t border-sidebar-border">
                <button onClick={signOut} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:text-destructive">
                  <LogOut className="w-4 h-4" />Sign out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-hidden">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden flex items-center justify-around border-t border-border bg-background py-2 px-4">
          {[
            { href: '/trips', icon: Home, label: 'Trips' },
            { href: '/chat',  icon: Plus, label: 'Plan', primary: true },
            { href: '/account', icon: User, label: 'Account' },
          ].map(({ href, icon: Icon, label, primary }) => (
            <Link key={href} href={href}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                primary
                  ? 'bg-primary text-primary-foreground rounded-xl px-5'
                  : isActive(href)
                    ? 'text-primary'
                    : 'text-muted-foreground'
              }`}>
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
