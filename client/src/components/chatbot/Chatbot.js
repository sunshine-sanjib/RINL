import React, { useState, useRef, useEffect } from 'react';
import { API } from '../../context/AuthContext';
import { useAuth } from '../../context/AuthContext';
import './Chatbot.css';

const QUICK_PROMPTS = [
  'How do I raise a complaint?',
  'What are the SLA timelines?',
  'How to submit a PM report?',
  'How to track my complaint?',
];

function Message({ msg }) {
  const isBot = msg.role === 'assistant';
  return (
    <div className={`chat-message ${isBot ? 'bot' : 'user'}`}>
      {isBot && <div className="chat-avatar-bot">V</div>}
      <div className={`chat-bubble ${isBot ? 'bot-bubble' : 'user-bubble'}`}>
        {msg.content.split('\n').map((line, i) => {
          if (line.startsWith('**') && line.endsWith('**')) {
            return <strong key={i} style={{display:'block',marginBottom:2,color:'var(--text-primary)'}}>{line.slice(2,-2)}</strong>;
          }
          if (line.startsWith('- ') || line.startsWith('• ')) {
            return <div key={i} style={{paddingLeft:12,marginBottom:2}}>· {line.slice(2)}</div>;
          }
          if (line.match(/^\d+\./)) {
            return <div key={i} style={{paddingLeft:12,marginBottom:2}}>{line}</div>;
          }
          return line ? <span key={i} style={{display:'block',marginBottom:2}}>{line}</span> : <br key={i}/>;
        })}
      </div>
      {!isBot && <div className="chat-avatar-user">{msg.userName?.charAt(0)?.toUpperCase() || 'U'}</div>}
    </div>
  );
}

export default function Chatbot() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: `Hello ${user?.name?.split(' ')[0] || 'there'}! I'm **VISHWA** — your RINL Contract Management Assistant.\n\nI can help you with complaints, PM reports, SLA policies, and portal navigation. What do you need today?`
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: msg, userName: user?.name };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    try {
      const apiMessages = newMessages
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role, content: m.content }));

      const { data } = await API.post('/chatbot', { messages: apiMessages });
      const botMsg = { role: 'assistant', content: data.message };
      setMessages(m => [...m, botMsg]);
      if (!open) setUnread(n => n + 1);
    } catch {
      setMessages(m => [...m, { role:'assistant', content:'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      {/* Floating Button */}
      <button className={`chatbot-fab ${open ? 'open' : ''}`} onClick={() => setOpen(!open)} title="VISHWA — AI Assistant">
        <span className="fab-icon">{open ? '✕' : '💬'}</span>
        {!open && unread > 0 && <span className="fab-badge">{unread}</span>}
        {!open && <span className="fab-label">VISHWA</span>}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="chatbot-window">
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-header-avatar">V</div>
              <div>
                <div className="chat-header-name">VISHWA</div>
                <div className="chat-header-sub">RINL AI Assistant · Always Online</div>
              </div>
            </div>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <button className="chat-clear-btn" onClick={() => setMessages([{role:'assistant',content:'Chat cleared. How can I help you?'}])} title="Clear chat">🗑</button>
              <button className="chat-close-btn" onClick={() => setOpen(false)}>✕</button>
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((m, i) => <Message key={i} msg={m} />)}
            {loading && (
              <div className="chat-message bot">
                <div className="chat-avatar-bot">V</div>
                <div className="chat-bubble bot-bubble typing-indicator">
                  <span/><span/><span/>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Prompts */}
          <div className="quick-prompts">
            {QUICK_PROMPTS.map(p => (
              <button key={p} className="quick-prompt-btn" onClick={() => sendMessage(p)} disabled={loading}>{p}</button>
            ))}
          </div>

          <div className="chat-input-area">
            <textarea
              ref={inputRef}
              className="chat-input"
              placeholder="Ask me anything about RINL CMS..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={2}
              disabled={loading}
            />
            <button className="chat-send-btn" onClick={() => sendMessage()} disabled={!input.trim() || loading}>
              {loading ? '⏳' : '→'}
            </button>
          </div>
          <div className="chat-footer-note">Powered by Claude AI · RINL IT & ERP Dept</div>
        </div>
      )}
    </>
  );
}
