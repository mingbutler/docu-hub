import './App.css'

import React, { useState, useRef, useEffect } from 'react';
import { TechnologiesPage } from './components/Technologies';
import { useChat, type ChatMessage } from './hooks/useChat';

type ActiveTab = 'chat' | 'technologies';

interface Session {
  id: string;
  preview: string;        // first user message, truncated
  createdAt: number;
  messages: ChatMessage[];
}

// Home page
function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');

  const { messages, isStreaming, error, sendMessage, reset, loadSession } = useChat();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [sessions, setSessions] = useState<Session[]>(() =>
    JSON.parse(localStorage.getItem('stackwiz-sessions') || '[]')
  );

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // auto scroll to bottom of new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // handle input change to auto resize textarea
  const handleInput = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  };
  
  const handleSend = async () => {
    const query = inputRef.current?.value.trim();
    if (!query || isStreaming) return; 
    inputRef.current!.value = '';

    // create/update session preview for chat history
    const upsertSession = (id: string, msgs: ChatMessage[]) => {
      const preview  = msgs[0]?.content.slice(0, 60) || 'New Chat';
      setSessions(prev => {
        const existing = prev.filter(s => s.id !== id);
        const next = [{ id, preview, createdAt: Date.now(), messages: msgs }, ...existing];
        localStorage.setItem('stackwiz-sessions', JSON.stringify(next));
        return next;
      })
    };

    const finalMessages = await sendMessage(query);
    upsertSession(activeSessionId || crypto.randomUUID(), finalMessages);
  };

  const handleSelectSession = (id: string) => {
    const session = sessions.find(s => s.id === id);
    if (!session) return;
    setActiveSessionId(id);
    loadSession(session.messages, session.id);
    setActiveTab('chat');
  };

  // send message on enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    reset();
    setActiveTab('chat');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div className="shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 12v4"/><path d="M16 6a2 2 0 0 1 1.414.586l4 4A2 2 0 0 1 22 12v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 .586-1.414l4-4A2 2 0 0 1 8 6z"/><path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M2 14h20"/><path d="M8 12v4"/></svg>
          </div>
          <span className="sidebar-brand-name">Stackwiz</span>
        </div>
 
        <nav className="sidebar-nav">
          {/* New Chat */}
          <button className="sidebar-new-chat-btn" onClick={handleNewChat}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            New Chat
          </button>
 
          {/* Technologies tab */}
          <div className="sidebar-nav-group-label" style={{ marginTop: 12 }}>Workspace</div>
          <button
            className={`sidebar-nav-item ${activeTab === 'technologies' ? 'sidebar-nav-item--active' : ''}`}
            onClick={() => setActiveTab('technologies')}
          >
            <svg className="sidebar-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6"/>
              <polyline points="8 6 2 12 8 18"/>
            </svg>
            Technologies
          </button>
 
          {/* Chat history */}
          {sessions.length > 0 && (
            <>
              <div className="sidebar-nav-group-label" style={{ marginTop: 12 }}>History</div>
              {sessions.map(session => (
                <button
                  key={session.id}
                  className={`sidebar-chat-item ${session.id === activeSessionId && activeTab === 'chat' ? 'sidebar-chat-item--active' : ''}`}
                  onClick={() => handleSelectSession(session.id)}
                >
                  <svg style={{ width: 12, height: 12, flexShrink: 0, opacity: 0.5 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  <span className="sidebar-chat-preview">{session.preview}</span>
                </button>
              ))}
            </>
          )} 
        </nav>
      </aside>
 
      {/* ── Main ── */}
      <main className="main">
        {activeTab === 'technologies' ? (
          <TechnologiesPage />
        ) : (
          <div className="chat-home">
            {/* Messages or welcome */}
            {messages.length === 0 ? (
              <div className="chat-welcome">
                <div className="chat-welcome-logo">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 12v4"/><path d="M16 6a2 2 0 0 1 1.414.586l4 4A2 2 0 0 1 22 12v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 .586-1.414l4-4A2 2 0 0 1 8 6z"/><path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M2 14h20"/><path d="M8 12v4"/></svg>
                </div>
                <div className="chat-welcome-title">Ask <span>Anything</span></div>
                <p className="chat-welcome-sub">Ask about your stack, get recommendations, or explore technologies for your next project.</p>
              </div>
            ) : (
              <div className="chat-messages">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`chat-msg chat-msg--${msg.role}`}
                  >
                    <div className="chat-msg-avatar">
                      {msg.role === 'user' ? 'YOU' : 'AI'}
                    </div>
                    <div className="chat-msg-bubble">
                      {msg.content}
                      {msg.role === 'assistant' && isStreaming && i === messages.length - 1 && (
                        <span className="chat-cursor" />
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
 
            {/* Error */}
            {error && (
              <div className="chat-error">{error}</div>
            )}
 
            {/* Input bar */}
            <div className="chat-input-bar">
              <div className="chat-input-wrap">
                <textarea
                  ref={inputRef}
                  id='chatInput'
                  name='chat-input'
                  className="chat-input"
                  placeholder="Ask about your tech stack…"
                  rows={1}
                  onInput={handleInput}
                  onKeyDown={handleKeyDown}
                  disabled={isStreaming}
                />
                <button
                  className="chat-send-btn"
                  onClick={handleSend}
                  disabled={isStreaming}
                  title="Send (Enter)"
                >
                  {isStreaming ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="6" y="6" width="12" height="12"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App
