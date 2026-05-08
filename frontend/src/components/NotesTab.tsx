import { useState, useEffect } from 'react';
import { updateTrip } from '@/lib/firestore';
import { Loader2 } from 'lucide-react';

interface NotesTabProps {
  tripId: string;
  initialNotes: string;
}

export default function NotesTab({ tripId, initialNotes }: NotesTabProps) {
  const [notes, setNotes] = useState(initialNotes || '');
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (notes === initialNotes) return;
      
      setSaving(true);
      try {
        await updateTrip(tripId, { notes });
        setSavedAt(new Date());
      } catch (error) {
        console.error('Failed to save notes:', error);
      } finally {
        setSaving(false);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [notes, tripId, initialNotes]);

  return (
    <div className="flex flex-col h-full bg-background relative">
      <div className="absolute top-4 right-6 flex items-center gap-2 text-xs text-muted-foreground pointer-events-none">
        {saving && (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Saving...
          </>
        )}
        {!saving && savedAt && (
          <span>Last saved at {savedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        )}
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Jot down your travel plans, flight numbers, packing lists, or random thoughts here..."
        className="flex-1 w-full p-6 bg-transparent resize-none outline-none text-foreground placeholder:text-muted-foreground/50 leading-relaxed"
      />
    </div>
  );
}
