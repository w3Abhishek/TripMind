import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { TripDoc, ExpenseDoc, ChatMessage } from './types';

// ─── Trips ────────────────────────────────────────────────────────────────────

export async function createTrip(userId: string, partial: Partial<TripDoc>): Promise<string> {
  const ref = await addDoc(collection(db, 'trips'), {
    userId,
    title: partial.destination ?? 'New Trip',
    destination: partial.destination ?? '',
    startDate: partial.startDate ?? '',
    endDate: partial.endDate ?? '',
    duration: partial.duration ?? 0,
    travelers: partial.travelers ?? 1,
    budget: partial.budget ?? '',
    status: 'planning',
    itinerary: null,
    coverImage: '',
    createdAt: serverTimestamp(),
    sharedWith: [],
    isPublic: false,
  });
  return ref.id;
}

export async function getTrip(tripId: string): Promise<(TripDoc & { id: string }) | null> {
  const snap = await getDoc(doc(db, 'trips', tripId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as TripDoc & { id: string };
}

export async function getUserTrips(userId: string): Promise<(TripDoc & { id: string })[]> {
  const q = query(
    collection(db, 'trips'),
    where('userId', '==', userId)
    // Note: orderBy removed to avoid requiring a Firestore composite index.
    // Sort client-side instead.
  );
  const snaps = await getDocs(q);
  const trips = snaps.docs.map((d) => ({ id: d.id, ...d.data() } as TripDoc & { id: string }));

  // Sort by createdAt descending (most recent first)
  return trips.sort((a, b) => {
    const aTime = (a.createdAt as unknown as { seconds: number })?.seconds ?? 0;
    const bTime = (b.createdAt as unknown as { seconds: number })?.seconds ?? 0;
    return bTime - aTime;
  });
}

export async function updateTrip(tripId: string, data: Partial<TripDoc>): Promise<void> {
  await updateDoc(doc(db, 'trips', tripId), data as Record<string, unknown>);
}

export async function deleteTrip(tripId: string): Promise<void> {
  await deleteDoc(doc(db, 'trips', tripId));
}

// ─── Chat messages ────────────────────────────────────────────────────────────

export async function saveChatMessage(tripId: string, message: Omit<ChatMessage, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'trips', tripId, 'messages'), {
    ...message,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getChatMessages(tripId: string): Promise<ChatMessage[]> {
  const q = query(
    collection(db, 'trips', tripId, 'messages'),
    orderBy('createdAt', 'asc')
  );
  const snaps = await getDocs(q);
  return snaps.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      role: data.role,
      content: data.content,
      createdAt: (data.createdAt as Timestamp)?.toDate?.() ?? new Date(),
    } as ChatMessage;
  });
}

// ─── Expenses ─────────────────────────────────────────────────────────────────

export async function addExpense(expense: Omit<ExpenseDoc, 'date'> & { date?: Date }): Promise<string> {
  const ref = await addDoc(collection(db, 'expenses'), {
    ...expense,
    date: expense.date ? Timestamp.fromDate(expense.date) : serverTimestamp(),
  });
  return ref.id;
}

export async function getTripExpenses(tripId: string): Promise<(ExpenseDoc & { id: string })[]> {
  const q = query(
    collection(db, 'expenses'),
    where('tripId', '==', tripId),
    orderBy('date', 'desc')
  );
  const snaps = await getDocs(q);
  return snaps.docs.map((d) => ({ id: d.id, ...d.data() } as ExpenseDoc & { id: string }));
}

export async function updateExpense(expenseId: string, data: Partial<ExpenseDoc>): Promise<void> {
  await updateDoc(doc(db, 'expenses', expenseId), data as Record<string, unknown>);
}

export async function deleteExpense(expenseId: string): Promise<void> {
  await deleteDoc(doc(db, 'expenses', expenseId));
}
