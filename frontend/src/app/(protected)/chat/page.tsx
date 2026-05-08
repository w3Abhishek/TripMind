import type { Metadata } from 'next';
import ChatPageClient from '@/components/ChatPageClient';

export const metadata: Metadata = {
  title: 'Plan a Trip — TripMind',
  description: 'Start a new trip conversation with TripMind AI.',
};

export default function NewChatPage() {
  return <ChatPageClient />;
}
