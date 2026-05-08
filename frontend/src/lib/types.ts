// ─── Firestore document types ─────────────────────────────────────────────────

export interface UserDoc {
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: Date;
  travelPreferences: string[];
}

export interface BudgetItem {
  label: string;
  amount: string;
  pct: number;
}

export interface Activity {
  time: string;
  name: string;
  description: string;
  cost: string;
  duration: string;
  tips: string;
}

export interface DayPlan {
  day: number;
  title: string;
  subtitle: string;
  vibe: string;
  tag: string;
  activities: Activity[];
}

export interface Highlight {
  emoji: string;
  name: string;
  reason: string;
}

export interface Itinerary {
  destination: string;
  tagline: string;
  duration: string;
  travelers: number;
  budget_total: string;
  budget_breakdown: BudgetItem[];
  days: DayPlan[];
  highlights: Highlight[];
  packing_essentials: string[];
  local_tips: string[];
  best_time_note: string;
  youtubeUrl?: string;
}

export interface TripDoc {
  userId: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  duration: number;
  travelers: number;
  budget: string;
  status: 'planning' | 'confirmed' | 'completed';
  itinerary: Itinerary | null;
  coverImage: string;
  createdAt: Date;
  sharedWith: string[];
  isPublic: boolean;
  gallery?: string[];
  notes?: string;
}

export interface ExpenseDoc {
  tripId: string;
  description: string;
  amount: number;
  currency: string;
  category: 'food' | 'transport' | 'hotel' | 'activity' | 'other';
  paidBy: string;
  splitBetween: string[];
  date: Date;
  addedBy: string;
}

export interface FriendDoc {
  friendId: string;
  displayName: string;
  email: string;
  photoURL: string;
  addedAt: Date;
}

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

// ─── API response types ───────────────────────────────────────────────────────

export interface ImageResponse {
  url: string;
  destination: string;
}

export interface ParsedExpense {
  description: string;
  amount: number;
  currency: string;
  category: ExpenseDoc['category'];
  paidBy: string;
  splitBetween: string[];
}

// ─── Chat action block types ──────────────────────────────────────────────────

export type ActionBlock =
  | { type: 'buttons'; options: string[] }
  | { type: 'input'; placeholder: string }
  | { type: 'view_trip_button'; label: string; trip_id: string }
  | { type: 'expense'; description: string; amount: number; currency: string; category: string; splitBetween: string[] };
