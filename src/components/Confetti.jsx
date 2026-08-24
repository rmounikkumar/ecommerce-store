import { useState, useEffect } from 'react';
import './Confetti.css';

const COLORS = ['#22D3EE', '#FFC24D', '#FBBF24', '#34D399', '#818CF8', '#FB7185', '#A3E635', '#F97316'];

export function Confetti({ count = 120 }) {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    const items = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 6 + Math.random() * 8,
      delay: Math.random() * 0.5,
      duration: 2.5 + Math.random() * 2.5,
      rotation: Math.random() * 360,
      color: COLORS[i % COLORS.length],
      shape: i % 3
    }));
    setPieces(items);
    const timer = setTimeout(() => setPieces([]), 6500);
    return () => clearTimeout(timer);
  }, [count]);

  if (pieces.length === 0) {
    return null;
  }

  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map(p => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.shape === 1 ? p.size * 0.4 : p.size,
            background: p.color,
            borderRadius: p.shape === 0 ? '50%' : '2px',
            transform: `rotate(${p.rotation}deg)`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`
          }}
        />
      ))}
    </div>
  );
}
