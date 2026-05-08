'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/AuthModal';
import { MapPin, Sparkles, ArrowRight, Star } from 'lucide-react';
import LordIcon from '@/components/LordIcon';

type ModalTab = 'signin' | 'signup';

const features = [
  { iconSrc: 'https://cdn.lordicon.com/whtfgdfm.json', title: 'AI-Powered Planning', desc: "Chat naturally and let TripMind build your perfect itinerary in minutes.", color: 'primary:#ff7b54,secondary:#ffd166', bg: 'bg-primary/10' },
  { iconSrc: 'https://cdn.lordicon.com/qwwuykwi.json', title: 'Anywhere on Earth',   desc: "From Goa weekenders to month-long Europe trips — every destination covered.", color: 'primary:#06d6a0,secondary:#118ab2', bg: 'bg-secondary/10' },
  { iconSrc: 'https://cdn.lordicon.com/abfofllj.json', title: 'Day-by-Day Detail',   desc: "Full timeline with activities, timings, costs, and insider tips.", color: 'primary:#ef476f,secondary:#ffd166', bg: 'bg-accent/10' },
  { iconSrc: 'https://cdn.lordicon.com/qhviklyi.json', title: 'Budget Tracking',     desc: "Track every rupee spent, split expenses, and settle up effortlessly.", color: 'primary:#06d6a0,secondary:#06d6a0', bg: 'bg-green-500/10' },
  { iconSrc: 'https://cdn.lordicon.com/dxjqnldu.json', title: 'Plan Together',       desc: "Share trips with travel buddies and collaborate on the perfect group itinerary.", color: 'primary:#ef476f,secondary:#ff7b54', bg: 'bg-orange-500/10' },
  { iconSrc: 'https://cdn.lordicon.com/oaflahpk.json', title: 'Interactive Maps',    desc: "See your entire trip on an interactive OSM map with every stop pinned.", color: 'primary:#118ab2,secondary:#06d6a0', bg: 'bg-blue-500/10' },
];

const testimonials = [
  { name: 'Priya S.', text: "Planned my Bali trip in 10 minutes. Felt like texting a friend who'd been there 10 times.", avatar: '🧳' },
  { name: 'Arjun M.', text: "The expense split feature saved us so much hassle on our Ladakh road trip.", avatar: '🏔️' },
  { name: 'Sneha R.', text: "TripMind suggested places I'd never have found on my own. Absolute gem.", avatar: '✨' },
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [modal, setModal] = useState<{ open: boolean; tab: ModalTab }>({ open: false, tab: 'signin' });

  useEffect(() => {
    if (!loading && user) router.replace('/trips');
  }, [user, loading, router]);

  const openModal = (tab: ModalTab) => setModal({ open: true, tab });
  const closeModal = () => setModal(m => ({ ...m, open: false }));

  return (
    <div className="min-h-screen bg-background">
      {/* ── Nav ── */}
      <nav className="fixed top-0 inset-x-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">TripMind</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openModal('signin')}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-foreground hover:bg-muted transition-all"
            >
              Sign In
            </button>
            <button
              onClick={() => openModal('signup')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all hover:-translate-y-0.5"
            >
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-36 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            Powered by Gemini 3 Flash
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-foreground leading-tight tracking-tight mb-6 animate-fade-up">
            Your AI travel planner,<br />
            <span className="text-primary">always ready to chat.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Tell TripMind where you want to go — or just describe your vibe — and get a personalized,
            day-by-day itinerary in minutes. No forms, no friction.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <button
              onClick={() => openModal('signup')}
              className="flex items-center gap-3 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:opacity-90 transition-all hover:-translate-y-1 hover:shadow-xl shadow-lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Get Started — it&apos;s free
            </button>
            <button
              onClick={() => openModal('signin')}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
            >
              Already have an account? Sign in →
            </button>
          </div>
        </div>
      </section>

      {/* ── Demo preview strip ── */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
          <div className="bg-muted px-4 py-3 flex items-center gap-2 border-b border-border">
            <div className="w-3 h-3 rounded-full bg-destructive/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-400/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/50" />
            <span className="ml-2 text-xs text-muted-foreground font-mono">tripmind.app/chat</span>
          </div>
          <div className="p-6 space-y-4 min-h-[200px]">
            <div className="flex items-end gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="chat-bubble-ai text-sm">
                Hey! I&apos;m TripMind 🌍 Where are you dreaming of going? Or tell me your vibe and I&apos;ll suggest some ideas.
              </div>
            </div>
            <div className="flex justify-end">
              <div className="chat-bubble-user text-sm">
                I want a 4-day beach trip with good nightlife, budget around ₹40,000
              </div>
            </div>
            <div className="flex items-end gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="space-y-2">
                <div className="chat-bubble-ai text-sm">
                  Goa is calling your name! ✨ North has the best nightlife (Vagator, Anjuna) while south is pristine — which vibe suits you?
                </div>
                <div className="flex gap-2 flex-wrap">
                  {['North Goa', 'South Goa', 'Mix of both'].map(o => (
                    <span key={o} className="pill-btn text-xs cursor-default">{o}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-bold text-center text-foreground mb-12">Everything you need to travel smarter</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ iconSrc, title, desc, color, bg }) => (
            <div key={title} className="p-6 rounded-xl border border-border bg-card hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center mb-5`}>
                <LordIcon src={iconSrc} colors={color} size={36} trigger="hover" />
              </div>
              <h3 className="font-extrabold text-foreground mb-2 text-lg">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="bg-muted/40 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">Travellers love TripMind</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="p-6 rounded-xl bg-card border border-border shadow-sm">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />)}
                </div>
                <p className="text-sm text-foreground mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{t.avatar}</span>
                  <span className="font-medium text-sm text-foreground">{t.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 text-center">
        <h2 className="text-4xl font-bold text-foreground mb-4">Ready to plan your next adventure?</h2>
        <p className="text-muted-foreground mb-8 text-lg">Takes less than 10 minutes to get a full itinerary.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => openModal('signup')}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:opacity-90 transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            Get Started — it&apos;s free <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => openModal('signin')}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-border text-foreground font-semibold text-base hover:bg-muted transition-all"
          >
            Sign In
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-8 px-6 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
            <MapPin className="w-3 h-3 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground">TripMind</span>
        </div>
        <p>© {new Date().getFullYear()} TripMind. Built with ❤️ and Gemini AI.</p>
      </footer>

      {/* ── Auth Modal ── */}
      {modal.open && (
        <AuthModal defaultTab={modal.tab} onClose={closeModal} />
      )}
    </div>
  );
}
