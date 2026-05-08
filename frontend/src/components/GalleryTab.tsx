import { useState, useRef } from 'react';
import { TripDoc } from '@/lib/types';
import { updateTrip } from '@/lib/firestore';
import { uploadToImgBB } from '@/lib/imgbb';
import { Upload, Loader2, ImageIcon, Trash2 } from 'lucide-react';

interface GalleryTabProps {
  tripId: string;
  trip: TripDoc & { id: string };
  onUpdate: (trip: TripDoc & { id: string }) => void;
}

export default function GalleryTab({ tripId, trip, onUpdate }: GalleryTabProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const images = trip.gallery || [];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    try {
      setUploading(true);
      const newUrls: string[] = [];
      for (const file of files) {
        const url = await uploadToImgBB(file);
        newUrls.push(url);
      }

      const updatedGallery = [...images, ...newUrls];
      await updateTrip(tripId, { gallery: updatedGallery });
      onUpdate({ ...trip, gallery: updatedGallery });
    } catch (error) {
      console.error('Failed to upload images:', error);
      alert('Failed to upload some images.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (urlToRemove: string) => {
    if (!confirm('Remove this image from the gallery?')) return;
    try {
      const updatedGallery = images.filter(url => url !== urlToRemove);
      await updateTrip(tripId, { gallery: updatedGallery });
      onUpdate({ ...trip, gallery: updatedGallery });
    } catch (error) {
      console.error('Failed to remove image:', error);
    }
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Trip Gallery</h2>
        <button
          onClick={() => !uploading && fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'Uploading...' : 'Upload Photos'}
        </button>
        <input
          type="file"
          accept="image/*"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {images.length === 0 && !uploading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <ImageIcon className="w-8 h-8 text-muted-foreground/60" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">No photos yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Upload pictures from your trip to remember the best moments.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((url, i) => (
          <div key={i} className="group relative aspect-square rounded-xl overflow-hidden bg-muted border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="Trip photo" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-end p-2">
              <button
                onClick={() => handleDelete(url)}
                className="p-1.5 bg-destructive/90 text-destructive-foreground rounded-full hover:bg-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {uploading && (
          <div className="aspect-square rounded-xl overflow-hidden bg-muted border border-border flex items-center justify-center">
             <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
