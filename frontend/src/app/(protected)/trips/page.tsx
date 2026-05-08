'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getUserTrips, deleteTrip } from '@/lib/firestore';
import { TripDoc } from '@/lib/types';
import { MapPin, Plus, Calendar, Users, Clock, ArrowRight, Trash2 } from 'lucide-react';

const STATUS_BADGE: Record<string, string> = {
  planning:  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  confirmed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  completed: 'bg-muted text-muted-foreground',
};

const FILTERS = ['All', 'Planning', 'Confirmed', 'Completed'] as const;
type Filter = (typeof FILTERS)[number];

export default function TripsPage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<(TripDoc & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('All');

  useEffect(() => {
    if (!user) return;
    getUserTrips(user.uid)
      .then(setTrips)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = trips.filter(t =>
    filter === 'All' ? true : t.status.toLowerCase() === filter.toLowerCase()
  );

  const handleDelete = async (tripId: string) => {
    if (!confirm('Are you sure you want to delete this trip?')) return;
    try {
      await deleteTrip(tripId);
      setTrips(prev => prev.filter(t => t.id !== tripId));
    } catch (error) {
      console.error('Failed to delete trip:', error);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Trips</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {trips.length} trip{trips.length !== 1 ? 's' : ''} planned
            </p>
          </div>
          <Link
            href="/chat"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" /> New Trip
          </Link>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card border border-border rounded-none overflow-hidden">
                <div className="skeleton h-48 w-full rounded-none" />
                <div className="p-5 space-y-3">
                  <div className="skeleton h-6 w-3/4 rounded-full" />
                  <div className="skeleton h-4 w-1/2 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && trips.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
              <MapPin className="w-8 h-8 text-primary opacity-60" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No trips yet</h3>
            <p className="text-muted-foreground text-sm mb-6">Start planning your first adventure with TripMind AI</p>
            <Link
              href="/chat"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all"
            >
              Plan my first trip <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Trip grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(trip => (
              <TripCard key={trip.id} trip={trip} onDelete={() => handleDelete(trip.id)} />
            ))}
          </div>
        )}

        {/* Filter empty */}
        {!loading && trips.length > 0 && filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No {filter.toLowerCase()} trips found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TripCard({ trip, onDelete }: { trip: TripDoc & { id: string }, onDelete: () => void }) {
  const badgeClass = STATUS_BADGE[trip.status] ?? STATUS_BADGE.planning;

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete();
  };

  return (
    <Link
      href={`/trip/${trip.id}`}
      className="bg-card border border-border rounded-none group block overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative"
    >
      {/* Cover */}
      <div className="relative h-48 overflow-hidden bg-muted">
        {trip.coverImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={trip.coverImage}
            alt={trip.destination}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-pink-400 via-pink-500 to-rose-500 group-hover:scale-105 transition-transform duration-500" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <span className={`absolute top-4 left-4 text-xs font-bold px-3 py-1.5 rounded-none backdrop-blur-md bg-secondary text-secondary-foreground border border-secondary/20 shadow-sm uppercase tracking-wider`}>
          {trip.status}
        </span>
        <button
          onClick={handleDeleteClick}
          className="absolute top-4 right-4 p-2 rounded-none bg-red-500/90 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Info */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-extrabold text-foreground text-lg leading-tight truncate">{trip.destination || trip.title}</h3>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-colors">
            <ArrowRight className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground flex-wrap">
          {(trip.startDate || trip.endDate) && (
            <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              {trip.startDate || 'TBD'} {trip.endDate ? `→ ${trip.endDate}` : ''}
            </span>
          )}
          {trip.duration > 0 && (
            <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
              <Clock className="w-3.5 h-3.5 text-secondary" />{trip.duration}d
            </span>
          )}
          {trip.travelers > 0 && (
            <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
              <Users className="w-3.5 h-3.5 text-accent" />{trip.travelers}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
