'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { User, Mail, LogOut, MapPin, Upload, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { uploadToImgBB } from '@/lib/imgbb';

export default function AccountPage() {
  const { user, signOut, updateProfilePicture } = useAuth();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await uploadToImgBB(file);
      await updateProfilePicture(url);
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!user) return null;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-lg mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-8">Account</h1>

        {/* Profile card */}
        <div className="rounded-2xl border border-border bg-card p-6 mb-6">
          <div className="flex items-center gap-5 mb-6">
            <div className="relative group cursor-pointer" onClick={() => !uploading && fileInputRef.current?.click()}>
              {uploading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 rounded-2xl">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="w-6 h-6 text-white" />
              </div>
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="w-16 h-16 rounded-2xl object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{user.displayName}</h2>
              <p className="text-muted-foreground text-sm flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5" /> {user.email}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-t border-border">
              <span className="text-sm text-muted-foreground">Signed in with</span>
              <span className="text-sm font-medium text-foreground flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-t border-border">
              <span className="text-sm text-muted-foreground">User ID</span>
              <span className="text-xs font-mono text-muted-foreground truncate max-w-[160px]">{user.uid}</span>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="rounded-2xl border border-border bg-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">TripMind</span>
          </div>
          <p className="text-sm text-muted-foreground">AI-powered travel planning, powered by Google Gemini 2.5 Flash. Built for the Google PromptWars Hackathon.</p>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-destructive/30 text-destructive text-sm font-semibold hover:bg-destructive/5 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
