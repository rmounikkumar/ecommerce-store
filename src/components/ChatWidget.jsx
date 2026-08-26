import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductsContext';
import { api } from '../api/client';
import { pricing } from '../config/site';
import { formatCurrency } from '../utils/format';
import { getBotReply } from '../utils/chatBrain';
import './ChatWidget.css';

const STARTER_CHIPS = ['Track my order', "Today's deals", 'Shipping info', 'Payment options'];

export function ChatWidget() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { products } = useProducts();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState(() => [
    {
      from: 'bot',
      text: "Hi! 👋 I'm the ShopEasy assistant. Ask me about products, deals, your orders, or policies — and on any product page just ask \"tell me about this\"!",
      chips: STARTER_CHIPS
    }
  ]);
  const listRef = useRef(null);
  const busyRef = useRef(false);

  const productId = location.pathname.match(/^\/product\/([^/?]+)/)?.[1] || null;
  const currentProduct = productId
    ? products.find(p => (p.id ?? p._id) === productId) || null
    : null;

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, typing, open]);

  const send = async (raw) => {
    const message = (raw ?? input).trim();
    if (!message || busyRef.current) return;
    setInput('');
    setMessages(prev => [...prev, { from: 'me', text: message }]);
    busyRef.current = true;
    setTyping(true);
    try {
      const reply = await getBotReply({ message, products, user, api, pricing, currentProduct });
      setMessages(prev => [
        ...prev,
        { from: 'bot', text: reply.text, note: reply.note, products: reply.products, chips: reply.chips }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { from: 'bot', text: 'Something went wrong on my side. Please try again.' }
      ]);
    } finally {
      setTyping(false);
      busyRef.current = false;
    }
  };

  const openProduct = (id) => {
    setOpen(false);
    navigate(`/product/${id}`);
  };

  return (
    <>
      <button
        className={`chat-fab ${open ? 'chat-fab--open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close chat' : 'Open chat assistant'}
      >
        {open ? (
          '✕'
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M9.8 3.3a1.2 1.2 0 0 1 2.26-.06l.94 2.6a4 4 0 0 0 2.4 2.4l2.6.94a1.2 1.2 0 0 1 .06 2.26l-2.66.96a4 4 0 0 0-2.4 2.4l-.94 2.6a1.2 1.2 0 0 1-2.26.06l-.94-2.6a4 4 0 0 0-2.4-2.4l-2.6-.94a1.2 1.2 0 0 1-.06-2.26l2.66-.96a4 4 0 0 0 2.4-2.4l.94-2.6Z" />
            <path d="M18.5 15.7a.8.8 0 0 1 1.5 0l.35.97c.16.45.52.8.97.97l.97.35a.8.8 0 0 1 0 1.5l-.97.35a1.5 1.5 0 0 0-.97.97l-.35.97a.8.8 0 0 1-1.5 0l-.35-.97a1.5 1.5 0 0 0-.97-.97l-.97-.35a.8.8 0 0 1 0-1.5l.97-.35c.45-.17.8-.52.97-.97l.35-.97Z" />
            <path d="M6 15.9a.65.65 0 0 1 1.23 0l.22.62c.09.25.29.45.54.54l.62.22a.65.65 0 0 1 0 1.23l-.62.22c-.25.09-.45.29-.54.54l-.22.62a.65.65 0 0 1-1.23 0l-.22-.62a1.05 1.05 0 0 0-.54-.54l-.62-.22a.65.65 0 0 1 0-1.23l.62-.22c.25-.09.45-.29.54-.54l.22-.62Z" />
          </svg>
        )}
      </button>

      {open && (
        <div className="chat-panel" role="dialog" aria-label="ShopEasy chat assistant">
          <header className="chat-header">
            <span className="chat-avatar">🤖</span>
            <div>
              <strong>ShopEasy Assistant</strong>
              <span className="chat-status">Online · replies instantly</span>
            </div>
          </header>

          <div className="chat-messages" ref={listRef}>
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg chat-msg--${msg.from}`}>
                <div className="chat-bubble">
                  <p className="chat-text">{msg.text}</p>
                  {msg.note && <p className="chat-note">{msg.note}</p>}
                  {msg.products?.length > 0 && (
                    <div className="chat-products">
                      {msg.products.map(p => (
                        <button key={p.id} className="chat-product" onClick={() => openProduct(p.id)}>
                          <img src={p.image} alt={p.name} loading="lazy" />
                          <span className="chat-product-name">{p.name}</span>
                          <span className="chat-product-price">{formatCurrency(p.price)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {msg.from === 'bot' && msg.chips?.length > 0 && (
                  <div className="chat-chips">
                    {msg.chips.map(chip => (
                      <button key={chip} className="chat-chip" onClick={() => send(chip)}>
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {typing && (
              <div className="chat-msg chat-msg--bot">
                <div className="chat-bubble chat-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
          </div>

          <form
            className="chat-input-row"
            onSubmit={e => {
              e.preventDefault();
              send();
            }}
          >
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about products, orders…"
              aria-label="Chat message"
              maxLength={200}
            />
            <button type="submit" disabled={!input.trim()} aria-label="Send message">
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
}
