import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { user } = useAuth();
  const { products } = useProducts();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState(() => [
    {
      from: 'bot',
      text: "Hi! 👋 I'm the ShopEasy assistant. Ask me about products, deals, your orders, or store policies.",
      chips: STARTER_CHIPS
    }
  ]);
  const listRef = useRef(null);
  const busyRef = useRef(false);

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
      const reply = await getBotReply({ message, products, user, api, pricing });
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
        {open ? '✕' : '💬'}
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
