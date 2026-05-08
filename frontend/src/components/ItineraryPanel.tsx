'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Itinerary, DayPlan, Activity } from '@/lib/types';
import {
  MapPin, ChevronDown, ChevronUp, Clock, DollarSign,
  Lightbulb, Package, Info, Star,
} from 'lucide-react';

// Leaflet must be loaded client-side only
const LeafletMap = dynamic(() => import('./LeafletMap'), { ssr: false });

interface ItineraryPanelProps {
  itinerary: Itinerary | null;
  coverImage: string;
  tripId: string | null;
}

const TAG_COLORS: Record<string, string> = {
  culture:     'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  adventure:   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  food:        'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  relaxation:  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  nightlife:   'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  nature:      'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
};

export default function ItineraryPanel({ itinerary, coverImage, tripId }: ItineraryPanelProps) {
  if (!itinerary) return <EmptyState />;
  return (
    <div className="w-full h-full overflow-y-auto bg-background">
      <DestinationHeader itinerary={itinerary} coverImage={coverImage} />
      <div className="max-w-2xl mx-auto px-4 pb-12 space-y-6 pt-6">
        <BudgetBreakdown itinerary={itinerary} />
        {itinerary.youtubeUrl && <YoutubeEmbed url={itinerary.youtubeUrl} />}
        <DaysList days={itinerary.days} />
        <HighlightsSection itinerary={itinerary} />
        <TipsAndPacking itinerary={itinerary} />
        {tripId && <LeafletMap destination={itinerary.destination} />}
      </div>
    </div>
  );
}

function EmptyState() {
  const steps = [
    { label: 'Destination', icon: <MapPin className="w-6 h-6" /> },
    { label: 'Budget', icon: <DollarSign className="w-6 h-6" /> },
    { label: 'Activities', icon: <Star className="w-6 h-6" /> },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 p-12 text-center bg-background h-full">
      <div className="w-20 h-20 bg-secondary/10 border border-secondary/20 flex items-center justify-center">
        <MapPin className="w-10 h-10 text-secondary opacity-80 animate-bounce-subtle" />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Your trip will appear here</h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          As you chat with TripMind, your personalized itinerary will be built live in this panel.
        </p>
      </div>
      <div className="flex gap-8 text-center mt-4">
        {steps.map(s => (
          <div key={s.label} className="space-y-3 opacity-60">
            <div className="h-14 w-16 mx-auto flex items-center justify-center bg-muted border border-border text-foreground transition-colors duration-300">
              {s.icon}
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DestinationHeader({ itinerary, coverImage }: { itinerary: Itinerary; coverImage: string }) {
  return (
    <div className="relative w-full h-[400px] overflow-hidden rounded-b-[3rem] shadow-2xl mb-8 border-b border-border/10">
      {coverImage ? (
        <Image
          src={coverImage}
          alt={itinerary.destination}
          fill
          className="object-cover animate-float"
          unoptimized
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-pink-500 to-rose-500 animate-float" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
      <div className="absolute inset-0 flex flex-col justify-end p-10 max-w-4xl mx-auto">
        <div className="flex flex-wrap gap-3 mb-4">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-semibold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" /> {itinerary.duration}
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-semibold uppercase tracking-wider">
            <Star className="w-3.5 h-3.5" /> {itinerary.travelers} traveler{itinerary.travelers > 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/80 backdrop-blur-md border border-secondary/50 text-secondary-foreground text-xs font-bold uppercase tracking-wider">
            <DollarSign className="w-3.5 h-3.5" /> {itinerary.budget_total}
          </span>
        </div>
        
        <h1 className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight mb-3 flex items-center gap-4">
          <MapPin className="w-10 h-10 text-primary animate-bounce-subtle" />
          {itinerary.destination}
        </h1>
        <p className="text-xl sm:text-2xl text-white/80 font-medium max-w-2xl leading-relaxed">
          &ldquo;{itinerary.tagline}&rdquo;
        </p>
      </div>
    </div>
  );
}

function BudgetBreakdown({ itinerary }: { itinerary: Itinerary }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-semibold text-foreground mb-4">Budget Breakdown</h3>
      <div className="space-y-3">
        {itinerary.budget_breakdown.map(item => (
          <div key={item.label}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-foreground font-medium">{item.label}</span>
              <span className="text-muted-foreground">{item.amount} <span className="text-xs">({item.pct}%)</span></span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="budget-bar h-full bg-secondary transition-all" style={{ width: `${item.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-border flex justify-between text-sm">
        <span className="text-muted-foreground">Total</span>
        <span className="font-bold text-foreground">{itinerary.budget_total}</span>
      </div>
    </div>
  );
}

function DaysList({ days }: { days: DayPlan[] }) {
  const [openDay, setOpenDay] = useState<number | null>(1);

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-foreground">Day-by-Day Itinerary</h3>
      {days.map(day => (
        <DayCard key={day.day} day={day} isOpen={openDay === day.day}
          onToggle={() => setOpenDay(openDay === day.day ? null : day.day)} />
      ))}
    </div>
  );
}

function DayCard({ day, isOpen, onToggle }: { day: DayPlan; isOpen: boolean; onToggle: () => void }) {
  const tagClass = TAG_COLORS[day.tag] ?? 'bg-muted text-muted-foreground';

  return (
    <div className="bg-card border border-border rounded-xl mb-4 animate-fade-up overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-5 px-6 py-5 text-left hover:bg-muted/40 transition-colors"
      >
        <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/20 transition-colors duration-300">
          <span className="text-secondary font-bold text-lg">{day.day}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <p className="font-bold text-foreground text-lg">{day.title}</p>
            <span className={`tag-chip text-xs px-2.5 py-1 font-bold ${tagClass}`}>{day.tag}</span>
          </div>
          <p className="text-xs text-muted-foreground truncate">{day.subtitle}</p>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
      </button>

      {isOpen && (
        <div className="px-6 pb-6 border-t border-border/50 animate-fade-in bg-card/40">
          {day.vibe && (
            <p className="text-sm font-medium text-primary italic py-4 mb-6 border-b border-border/50">
              ✨ {day.vibe}
            </p>
          )}
          <div className="space-y-6">
            {day.activities.map((act, i) => (
              <ActivityItem key={i} activity={act} isLast={i === day.activities.length - 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ActivityItem({ activity, isLast }: { activity: Activity; isLast: boolean }) {
  return (
    <div className="flex gap-6 group/item">
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-secondary flex-shrink-0 mt-1.5 shadow-[0_0_10px_var(--secondary)]" />
        {!isLast && <div className="w-0.5 bg-gradient-to-b from-secondary via-border to-border flex-grow mt-2 min-h-[30px]" />}
      </div>
      <div className={`pb-6 flex-1 min-w-0 ${isLast ? '' : ''}`}>
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-xs text-muted-foreground font-medium">{activity.time}</span>
          {activity.duration && (
            <span className="text-xs text-muted-foreground">· {activity.duration}</span>
          )}
          {activity.cost && (
            <span className="tag-chip text-xs">{activity.cost}</span>
          )}
        </div>
        <p className="font-bold text-lg text-foreground mb-1 group-hover/item:text-primary transition-colors">{activity.name}</p>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed max-w-xl">{activity.description}</p>
        {activity.tips && (
          <div className="flex items-start gap-1.5 mt-2 bg-primary/5 rounded-lg px-3 py-2">
            <Lightbulb className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-xs text-foreground/80">{activity.tips}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function HighlightsSection({ itinerary }: { itinerary: Itinerary }) {
  if (!itinerary.highlights?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-semibold text-foreground mb-4">Trip Highlights</h3>
      <div className="grid grid-cols-3 gap-3">
        {itinerary.highlights.map(h => (
          <div key={h.name} className="text-center p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
            <div className="text-2xl mb-1">{h.emoji}</div>
            <p className="text-xs font-semibold text-foreground mb-1">{h.name}</p>
            <p className="text-xs text-muted-foreground">{h.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TipsAndPacking({ itinerary }: { itinerary: Itinerary }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {itinerary.local_tips?.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" /> Local Tips
          </h3>
          <ul className="space-y-2">
            {itinerary.local_tips.map((tip, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">·</span>{tip}
              </li>
            ))}
          </ul>
          {itinerary.best_time_note && (
            <p className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground italic">{itinerary.best_time_note}</p>
          )}
        </div>
      )}

      {itinerary.packing_essentials?.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" /> Pack These
          </h3>
          <div className="flex flex-wrap gap-2">
            {itinerary.packing_essentials.map(item => (
              <span key={item} className="tag-chip">{item}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function YoutubeEmbed({ url }: { url: string }) {
  let videoId = '';
  if (url.includes('v=')) {
    videoId = url.split('v=')[1]?.split('&')[0];
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0];
  }
  if (!videoId) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <span className="text-red-500">▶</span> Cinematic Preview
      </h3>
      <div className="relative w-full pt-[56.25%] rounded-lg overflow-hidden bg-muted">
        <iframe
          className="absolute top-0 left-0 w-full h-full border-0"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="Destination Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
