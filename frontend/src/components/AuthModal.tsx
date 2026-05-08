'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { X, Mail, Lock, User, Eye, EyeOff, MapPin } from 'lucide-react';
import { toast } from 'sonner';

type Tab = 'signin' | 'signup';

interface AuthModalProps {
  defaultTab?: Tab;
  onClose: () => void;
}

export default function AuthModal({ defaultTab = 'signin', onClose }: AuthModalProps) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [tab, setTab] = useState<Tab>(defaultTab);

  // Sign-in form
  const [siEmail, setSiEmail] = useState('');
  const [siPassword, setSiPassword] = useState('');
  const [siShowPw, setSiShowPw] = useState(false);

  // Sign-up form
  const [suName, setSuName] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPassword, setSuPassword] = useState('');
  const [suConfirm, setSuConfirm] = useState('');
  const [suShowPw, setSuShowPw] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      onClose();
    } catch (e: unknown) {
      toast.error((e as Error).message ?? 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siEmail || !siPassword) { toast.error('Fill in all fields'); return; }
    try {
      setLoading(true);
      await signInWithEmail(siEmail, siPassword);
      onClose();
    } catch (e: unknown) {
      const msg = (e as { code?: string }).code;
      if (msg === 'auth/invalid-credential' || msg === 'auth/wrong-password') {
        toast.error('Incorrect email or password');
      } else if (msg === 'auth/user-not-found') {
        toast.error('No account found with this email');
      } else {
        toast.error('Sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suName || !suEmail || !suPassword) { toast.error('Fill in all fields'); return; }
    if (suPassword !== suConfirm) { toast.error('Passwords do not match'); return; }
    if (suPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    try {
      setLoading(true);
      await signUpWithEmail(suName, suEmail, suPassword);
      toast.success('Account created! Welcome to TripMind 🌍');
      onClose();
    } catch (e: unknown) {
      const msg = (e as { code?: string }).code;
      if (msg === 'auth/email-already-in-use') {
        toast.error('An account with this email already exists');
      } else if (msg === 'auth/weak-password') {
        toast.error('Password is too weak — use at least 8 characters');
      } else {
        toast.error('Sign-up failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl animate-fade-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">TripMind</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex mx-6 mb-5 bg-muted rounded-xl p-1 gap-1">
          <button
            onClick={() => setTab('signin')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === 'signin'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setTab('signup')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === 'signup'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Create Account
          </button>
        </div>

        <div className="px-6 pb-6 space-y-4">
          {/* Google button */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-border bg-background hover:bg-muted transition-all text-sm font-semibold text-foreground disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-medium">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* ── Sign In form ── */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={siEmail}
                  onChange={e => setSiEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={siShowPw ? 'text' : 'password'}
                  value={siPassword}
                  onChange={e => setSiPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setSiShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {siShowPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50"
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
              <p className="text-center text-xs text-muted-foreground">
                No account yet?{' '}
                <button type="button" onClick={() => setTab('signup')} className="text-primary hover:underline font-medium">
                  Create one →
                </button>
              </p>
            </form>
          )}

          {/* ── Sign Up form ── */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={suName}
                  onChange={e => setSuName(e.target.value)}
                  placeholder="Full name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all"
                  required
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={suEmail}
                  onChange={e => setSuEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={suShowPw ? 'text' : 'password'}
                  value={suPassword}
                  onChange={e => setSuPassword(e.target.value)}
                  placeholder="Password (min. 8 characters)"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setSuShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {suShowPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={suShowPw ? 'text' : 'password'}
                  value={suConfirm}
                  onChange={e => setSuConfirm(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50"
              >
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
              <p className="text-center text-xs text-muted-foreground">
                Already have an account?{' '}
                <button type="button" onClick={() => setTab('signin')} className="text-primary hover:underline font-medium">
                  Sign in →
                </button>
              </p>
            </form>
          )}

          <p className="text-center text-xs text-muted-foreground">
            By continuing you agree to our terms of service.
          </p>
        </div>
      </div>
    </div>
  );
}
