'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getTrip } from '@/lib/firestore';
import { TripDoc } from '@/lib/types';
import ItineraryPanel from '@/components/ItineraryPanel';
import ExpensesTab from '@/components/ExpensesTab';
import GalleryTab from '@/components/GalleryTab';
import NotesTab from '@/components/NotesTab';
import { Edit, Share2, MapPin, MessageSquare, DollarSign, Users, FileText, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

const TABS = ['Itinerary', 'Expenses', 'Gallery', 'Notes'] as const;
type Tab = (typeof TABS)[number];

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [trip, setTrip] = useState<(TripDoc & { id: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('Itinerary');

  useEffect(() => {
    if (!id) return;
    getTrip(id)
      .then(setTrip)
      .catch(() => toast.error('Could not load trip'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Trip link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-4">
          <div className="skeleton h-8 w-48 rounded" />
          <div className="skeleton h-56 w-full rounded-xl" />
          <div className="skeleton h-32 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Trip not found.</p>
          <Link href="/trips" className="text-primary text-sm hover:underline">← Back to My Trips</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Trip header bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
          <div className="min-w-0">
            <h1 className="font-bold text-foreground truncate">{trip.destination || trip.title}</h1>
            <p className="text-xs text-muted-foreground">{trip.duration ? `${trip.duration} days` : ''} {trip.travelers ? `· ${trip.travelers} traveler${trip.travelers > 1 ? 's' : ''}` : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors">
            <Share2 className="w-4 h-4" /> Share
          </button>
          <Link href={`/chat/${id}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all">
            <Edit className="w-4 h-4" /> Edit
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-6 pt-3 border-b border-border bg-background flex-shrink-0">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-all -mb-px ${
              tab === t
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'Itinerary' && <MapPin className="w-3.5 h-3.5" />}
            {t === 'Expenses' && <DollarSign className="w-3.5 h-3.5" />}
            {t === 'Gallery' && <ImageIcon className="w-3.5 h-3.5" />}
            {t === 'Notes' && <FileText className="w-3.5 h-3.5" />}
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {tab === 'Itinerary' && (
          <ItineraryPanel
            itinerary={trip.itinerary}
            coverImage={trip.coverImage}
            tripId={id}
          />
        )}
        {tab === 'Expenses' && <ExpensesTab tripId={id} />}
        {tab === 'Gallery' && <GalleryTab tripId={id} trip={trip} onUpdate={setTrip} />}
        {tab === 'Notes' && <NotesTab tripId={id} initialNotes={trip.notes || ''} />}
      </div>
    </div>
  );
}
