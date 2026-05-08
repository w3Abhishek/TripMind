import type { Metadata } from 'next';
import ChatPageClient from '@/components/ChatPageClient';

export const metadata: Metadata = {
  title: 'Continue Planning — TripMind',
};

interface Props {
  params: Promise<{ tripId: string }>;
}

export default async function ExistingChatPage({ params }: Props) {
  const { tripId } = await params;
  return <ChatPageClient tripId={tripId} />;
}
