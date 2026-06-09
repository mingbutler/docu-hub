import { useState, useCallback, useRef } from "react";

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface UseChatReturn {
    messages: ChatMessage[];
    isStreaming: boolean;
    error: string | null;
    sendMessage: (query: string) => void;
    reset: () => void;
    loadSession: (saved: ChatMessage[], sessionId: string) => void;
} 

export function useChat(): UseChatReturn {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const sessionIdRef = useRef<string>(crypto.randomUUID());

    const sendMessage = useCallback(async (query: string) => {
        // cancel any mid stream request
        abortRef.current?.abort();
        abortRef.current = new AbortController();

        // append user message, then blank assistant message to stream into
        setMessages(prev => [
            ...prev,
            { role: 'user', content: query },
            { role: 'assistant', content: '' },
        ]);
        setIsStreaming(true);
        setError(null);
        
        const history = messages.filter(m => m.content).map(({ role, content }) => ({ role, content })) // only send messages with content and strips sources

        try {
            const response = await fetch('/api/v1/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: sessionIdRef.current, query, history: history.slice(-20) }),
                signal: abortRef.current.signal,
            });

            if (!response.ok) throw new Error('Chat request failed');
            if (!response.body) throw new Error('No response body');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                const events = buffer.split('\n\n');
                buffer = events.pop() ?? '';

                for (const event of events) {
                    const line = event.trim();
                    if (!line.startsWith('data:')) continue;

                    const jsonStr = line.slice('data:'.length).trim();
                    if (!jsonStr) continue;

                    const parsed = JSON.parse(jsonStr);

                    if (parsed.type === 'token') {
                        // append token to the last (assistant) message
                        setMessages(prev => {
                            const updated = [...prev];
                            const last = updated[updated.length - 1];
                            updated[updated.length - 1] = { ...last, content: last.content + parsed.content };
                            return updated;
                        });
                    } else if (parsed.type === 'error') {
                        throw new Error(parsed.message);
                    }
                }
            }
        } catch (err) {
            if ((err as Error).name === 'AbortError') return; // ignore intentional cancels
            const message = err instanceof Error ? err.message : 'Unknown error';
            setError(message);
            // remove the blank assistant message on failure
            setMessages(prev => prev.slice(0, -1));
        } finally {
            setIsStreaming(false);
        }
    }, []);

    const reset = useCallback(() => {
        abortRef.current?.abort();
        sessionIdRef.current = crypto.randomUUID();
        setMessages([]);
        setError(null);
        setIsStreaming(false);
    }, []);

    const loadSession = useCallback((saved: ChatMessage[], sessionId: string) => {
        abortRef.current?.abort();
        sessionIdRef.current = sessionId;
        setMessages(saved);
        setError(null);
        setIsStreaming(false);
    }, []);

    return { messages, isStreaming, error, sendMessage, reset, loadSession };
}