import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Extract JSON action blocks from an AI message and return clean text + blocks. */
export function parseActionBlocks(text: string): {
  cleanText: string;
  actions: Record<string, unknown>[];
} {
  const actions: Record<string, unknown>[] = [];

  // Match JSON objects that start with {"type": on their own line
  const cleaned = text.replace(/\{[\s\S]*?"type"\s*:\s*"[^"]+[\s\S]*?\}/g, (match) => {
    try {
      const parsed = JSON.parse(match);
      if (parsed?.type) {
        actions.push(parsed);
        return '';
      }
    } catch {
      // not valid JSON, keep as-is
    }
    return match;
  });

  return { cleanText: cleaned.trim(), actions };
}

/** Extract <ITINERARY>…</ITINERARY> block from AI response text. */
export function parseItinerary(text: string): { itinerary: unknown | null; cleanText: string } {
  const match = text.match(/<ITINERARY>([\s\S]*?)<\/ITINERARY>/);
  if (!match) return { itinerary: null, cleanText: text };

  try {
    const itinerary = JSON.parse(match[1].trim());
    const cleanText = text.replace(/<ITINERARY>[\s\S]*?<\/ITINERARY>/g, '').trim();
    return { itinerary, cleanText };
  } catch {
    return { itinerary: null, cleanText: text };
  }
}

export function formatCurrency(amount: number, currency = 'INR'): string {
  if (currency === 'INR') return `₹${amount.toLocaleString('en-IN')}`;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    food: '🍽️',
    transport: '🚗',
    hotel: '🏨',
    activity: '🎯',
    other: '📦',
  };
  return icons[category] ?? '📦';
}
