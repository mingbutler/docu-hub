import { useState, useCallback, useRef, useEffect } from "react";

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface UseChatReturn {
    messages: ChatMessage[];
    isStreaming: boolean;
    error: string | null;
    sendMessage: (query: string) => Promise<ChatMessage[]>;
    reset: () => void;
    loadSession: (saved: ChatMessage[], sessionId: string) => void;
} 

export function useChat(): UseChatReturn {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sessionIdRef = useRef<string>(crypto.randomUUID());

    const socketRef = useRef<WebSocket | null>(null);

    const messagesRef = useRef<ChatMessage[]>([]);
    useEffect(() => { messagesRef.current = messages; }, [messages]);

    // resolveRef lets onmessage resolve the Promise returned by sendMessage
    // when the server signals done or error — without recreating the socket handler.
    const resolveRef = useRef<((msgs: ChatMessage[]) => void) | null>(null);
    const rejectRef  = useRef<((err: Error) => void) | null>(null);

    useEffect(() => {
        // websocket connection
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const ws = new WebSocket(`${protocol}//${window.location.host}/api/v1/ws/chat`);

        socketRef.current = ws;

        ws.onopen = () => {
            console.log('WebSocket connected');
        };
      
        ws.onmessage = (event) => {
            console.log('Message received:', event.data);
            const parsedData = JSON.parse(event.data);

            if (parsedData.type === 'token') {
                // append token to the last (assistant) message
                setMessages(prev => {
                    const updated = [...prev];
                    const last = updated[updated.length - 1];
                    updated[updated.length - 1] = { ...last, content: last.content + parsedData.content };
                    return updated;
                });
            } else if (parsedData.type === 'done') {
                setIsStreaming(false);
                setMessages(prev => {
                    resolveRef.current?.(prev);
                    resolveRef.current = null;
                    rejectRef.current = null;
                    return prev;
                });
            } else if (parsedData.type === 'error') {
                setIsStreaming(false);
                // Remove the blank assistant placeholder on failure
                setMessages(prev => prev.slice(0, -1));
                const err = new Error(parsedData.message);
                setError(parsedData.message);
                rejectRef.current?.(err);
                resolveRef.current = null;
                rejectRef.current  = null;
            }
        };

        ws.onerror = () => {
            setError("Websocket error");
            setIsStreaming(false);
        };

        // cleanup on unmount
        return () => {
            ws.close();
            socketRef.current = null;
        };
    }, []);

    const sendMessage = useCallback(async (query: string): Promise<ChatMessage[]> => {
        const ws = socketRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            setError('WebSocket is not connected');
            return [];
        }

        // cancel in flight stream 
        ws.send(JSON.stringify({ type: 'cancel' }));

        // build history
        const history = messagesRef.current.filter(m => m.content).map(({ role, content}) => ({ role, content })).slice(-20);


        // append user message, then blank assistant message to stream into
        setMessages(prev => [
            ...prev,
            { role: 'user', content: query },
            { role: 'assistant', content: '' },
        ]);
        setIsStreaming(true);
        setError(null);

        // capture message 
        return new Promise<ChatMessage[]>((resolve, reject) => {
            resolveRef.current = resolve;
            rejectRef.current = reject;

            ws.send(JSON.stringify({
                type: 'chat',
                id: sessionIdRef.current,
                query, 
                history
            }));
        });
    }, []);

    const reset = useCallback(() => {
        const ws = socketRef.current;
        if (ws?.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'cancel' }));
            ws.close();
        }
        socketRef.current = null;
        sessionIdRef.current = crypto.randomUUID();
        resolveRef.current = null;
        rejectRef.current  = null;
        setMessages([]);
        setError(null);
        setIsStreaming(false);
    }, []);

    const loadSession = useCallback((saved: ChatMessage[], sessionId: string) => {
        const ws = socketRef.current;
        if (ws?.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'cancel' }));
        }
        sessionIdRef.current = sessionId;
        setMessages(saved);
        setError(null);
        setIsStreaming(false);
    }, []);

    return { messages, isStreaming, error, sendMessage, reset, loadSession };
}