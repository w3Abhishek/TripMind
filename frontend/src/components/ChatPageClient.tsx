'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { parseActionBlocks, parseItinerary } from '@/lib/utils';
import { createTrip, saveChatMessage, getChatMessages, updateTrip } from '@/lib/firestore';
import { ChatMessage, ActionBlock, Itinerary } from '@/lib/types';
import { toast } from 'sonner';
import { Send, MapPin } from 'lucide-react';
import ItineraryPanel from '@/components/ItineraryPanel';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'https://backend-1074735360467.europe-west1.run.app';

interface ChatPageClientProps {
  tripId?: string;
}

export default function ChatPageClient({ tripId: initialTripId }: ChatPageClientProps) {
  const { user } = useAuth();
  const router = useRouter();

  const [tripId, setTripId] = useState<string | null>(initialTripId ?? null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [coverImage, setCoverImage] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load existing chat on mount
  useEffect(() => {
    if (initialTripId) {
      getChatMessages(initialTripId).then(setMessages).catch(console.error);
    } else {
      setMessages([{
        role: 'assistant',
        content: "Hey! I'm TripMind 🌍 Where are you dreaming of going? Tell me a destination, or just describe your vibe and I'll suggest some great options.",
        createdAt: new Date(),
      }]);
    }
  }, [initialTripId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const fetchImage = useCallback(async (destination: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/images?destination=${encodeURIComponent(destination)}`);
      const data = await res.json();
      if (data.url) setCoverImage(data.url);
    } catch {
      // Silently fail — fallback image will show
    }
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: ChatMessage = { role: 'user', content: text.trim(), createdAt: new Date() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);

    // Ensure trip exists
    let currentTripId = tripId;
    if (!currentTripId && user) {
      currentTripId = await createTrip(user.uid, {});
      setTripId(currentTripId);
      // Use history.replaceState to change URL without unmounting the component and losing stream state
      window.history.replaceState(null, '', `/chat/${currentTripId}`);
    }

    // Save user message
    if (currentTripId) {
      await saveChatMessage(currentTripId, userMsg).catch(console.error);
    }

    try {
      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
        }),
      });

      if (!res.ok) throw new Error('Backend error');

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      const aiMsg: ChatMessage = { role: 'assistant', content: '', createdAt: new Date() };
      setMessages(prev => [...prev, aiMsg]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        // While streaming, hide the <ITINERARY> block so it doesn't flash as raw JSON
        const streamDisplay = fullText
          .replace(/<ITINERARY>[\s\S]*?<\/ITINERARY>/g, '')  // complete block
          .replace(/<ITINERARY>[\s\S]*$/, '')                  // partial/unclosed block
          .trim();
        setMessages(prev => {
          const copy = [...prev];
          copy[copy.length - 1] = { ...aiMsg, content: streamDisplay };
          return copy;
        });
      }

      // Parse itinerary + action blocks from full response
      const { itinerary: parsed, cleanText } = parseItinerary(fullText);
      if (parsed) {
        let finalItinerary = parsed as Itinerary;
        setItinerary(finalItinerary);
        fetchImage(finalItinerary.destination);

        // Run updates
        const doUpdate = async (it: Itinerary) => {
          if (currentTripId) {
            await updateTrip(currentTripId, {
              itinerary: it,
              destination: it.destination,
              title: it.destination,
              status: 'planning',
            }).catch(console.error);
          }
        };

        // Fetch YouTube video in background
        fetch(`${BACKEND_URL}/youtube?q=${encodeURIComponent(finalItinerary.destination)}`)
          .then(res => res.json())
          .then(data => {
            if (data.youtubeUrl) {
              finalItinerary = { ...finalItinerary, youtubeUrl: data.youtubeUrl };
              setItinerary(finalItinerary);
            }
            doUpdate(finalItinerary);
          })
          .catch(() => doUpdate(finalItinerary));
      }

      // Display the clean text (without <ITINERARY> block) in the chat bubble
      const displayText = parsed ? cleanText : fullText;
      const finalMsg: ChatMessage = { role: 'assistant', content: displayText, createdAt: new Date() };
      setMessages(prev => {
        const copy = [...prev];
        copy[copy.length - 1] = finalMsg;
        return copy;
      });

      // Save assistant message
      if (currentTripId) {
        await saveChatMessage(currentTripId, finalMsg).catch(console.error);
      }
    } catch (err) {
      toast.error('Could not reach TripMind AI. Please try again.');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsTyping(false);
    }
  }, [messages, isTyping, tripId, user, router, fetchImage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Left: Chat panel ── */}
      <div className="flex flex-col w-full md:w-[42%] md:max-w-[520px] border-r border-border bg-background">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <MapPin className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">TripMind AI</p>
            <p className="text-xs text-muted-foreground">Your personal travel planner</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((msg, i) => (
            <MessageBubble
              key={i}
              message={msg}
              onAction={sendMessage}
              onViewTrip={(id) => router.push(`/trip/${id}`)}
            />
          ))}

          {isTyping && (
            <div className="flex items-end gap-2 animate-fade-in">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <MapPin className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <div className="chat-bubble-ai">
                <div className="flex items-center gap-1.5 py-0.5">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-border">
          <div className="flex items-end gap-2 rounded-xl border border-border bg-card px-3 py-2 focus-within:ring-2 focus-within:ring-ring/30 transition-all">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Where do you want to go?…"
              className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none min-h-[36px] max-h-40"
              style={{ lineHeight: '1.5' }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
              className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 text-center">Enter to send · Shift+Enter for newline</p>
        </div>
      </div>

      {/* ── Right: Itinerary panel ── */}
      <div className="hidden md:flex flex-1 overflow-y-auto">
        <ItineraryPanel itinerary={itinerary} coverImage={coverImage} tripId={tripId} />
      </div>
    </div>
  );
}

// ─── Message bubble with action rendering ────────────────────────────────────

function MessageBubble({
  message,
  onAction,
  onViewTrip,
}: {
  message: ChatMessage;
  onAction: (text: string) => void;
  onViewTrip: (id: string) => void;
}) {
  const { cleanText, actions } = parseActionBlocks(message.content);

  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="chat-bubble-user text-sm whitespace-pre-wrap">{message.content}</div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2">
      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mb-0.5">
        <MapPin className="w-3.5 h-3.5 text-primary-foreground" />
      </div>
      <div className="space-y-2 max-w-[85%]">
        {cleanText && (
          <div className="chat-bubble-ai text-sm whitespace-pre-wrap">{cleanText}</div>
        )}
        {actions.map((action, i) => (
          <ActionRenderer key={i} action={action as ActionBlock} onAction={onAction} onViewTrip={onViewTrip} />
        ))}
      </div>
    </div>
  );
}

function ActionRenderer({
  action,
  onAction,
  onViewTrip,
}: {
  action: ActionBlock;
  onAction: (text: string) => void;
  onViewTrip: (id: string) => void;
}) {
  const [inlineInput, setInlineInput] = useState('');

  if (action.type === 'buttons') {
    return (
      <div className="flex flex-wrap gap-2">
        {action.options.map(opt => (
          <button key={opt} onClick={() => onAction(opt)} className="pill-btn">
            {opt}
          </button>
        ))}
      </div>
    );
  }

  if (action.type === 'input') {
    return (
      <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
        <input
          type="text"
          value={inlineInput}
          onChange={e => setInlineInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && inlineInput.trim()) { onAction(inlineInput); setInlineInput(''); } }}
          placeholder={action.placeholder}
          className="flex-1 bg-transparent text-sm focus:outline-none text-foreground placeholder:text-muted-foreground"
        />
        <button
          onClick={() => { if (inlineInput.trim()) { onAction(inlineInput); setInlineInput(''); } }}
          className="p-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90"
        >
          <Send className="w-3 h-3" />
        </button>
      </div>
    );
  }

  if (action.type === 'view_trip_button') {
    return (
      <button
        onClick={() => onViewTrip(action.trip_id)}
        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all hover:-translate-y-0.5 hover:shadow-lg w-full justify-center"
      >
        <MapPin className="w-4 h-4" />
        {action.label}
      </button>
    );
  }

  return null;
}
