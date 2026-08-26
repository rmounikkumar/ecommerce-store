import { discountPercent } from './format';

const CATEGORY_HINTS = [
  { key: 'mobiles', words: ['mobile', 'phone', 'smartphone'] },
  { key: 'electronics', words: ['laptop', 'headphone', 'earbud', 'electronics', 'speaker', 'camera', 'watch', 'tv'] },
  { key: 'fashion', words: ['shirt', 'tshirt', 't-shirt', 'dress', 'fashion', 'jeans', 'kurti', 'clothes', 'clothing'] },
  { key: 'footwear', words: ['shoe', 'shoes', 'sneaker', 'footwear', 'slipper', 'sandal', 'boot'] },
  { key: 'home & kitchen', words: ['kitchen', 'cookware', 'bottle', 'mattress', 'furniture', 'home '] },
  { key: 'appliances', words: ['appliance', 'washing machine', 'fridge', 'refrigerator', 'microwave', 'air conditioner', 'cooler', 'geyser'] },
  { key: 'beauty & grooming', words: ['beauty', 'cream', 'serum', 'grooming', 'trimmer', 'makeup', 'perfume', 'shampoo'] },
  { key: 'sports & fitness', words: ['sport', 'fitness', 'gym', 'dumbbell', 'yoga', 'cricket', 'bat', 'cycle'] },
  { key: 'toys & books', words: ['toy', 'book', 'puzzle', 'teddy', 'board game'] }
];

function detectPriceCap(text) {
  const match = text.match(/(?:under|below|less than|upto|up to|max)\s*(?:rs\.?|₹|inr)?\s*([\d,]+(?:\.\d+)?)/i);
  if (!match) {
    const bare = text.match(/₹\s*([\d,]{3,})/);
    if (!bare) return null;
    return Number(bare[1].replace(/,/g, ''));
  }
  return Number(match[1].replace(/,/g, ''));
}

function detectCategory(text) {
  const lower = ` ${text.toLowerCase()} `;
  for (const hint of CATEGORY_HINTS) {
    if (hint.words.some(word => lower.includes(word))) return hint.key;
  }
  return null;
}

function formatProducts(products) {
  return products.map(p => ({
    id: p.id ?? p._id,
    name: p.name,
    price: p.price,
    mrp: p.mrp,
    image: p.image
  }));
}

function searchProducts(products, { category = null, priceCap = null, limit = 4 } = {}) {
  let pool = [...products];
  if (category) {
    pool = pool.filter(p => (p.category || '').toLowerCase() === category);
  }
  if (priceCap) {
    pool = pool.filter(p => Number(p.price) <= priceCap);
  }
  if (pool.length === 0 && (category || priceCap)) {
    pool = [...products];
  }
  pool.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
  return formatProducts(pool.slice(0, limit));
}

function topDeals(products, { priceCap = null, limit = 4 } = {}) {
  let pool = [...products];
  if (priceCap) {
    const capped = pool.filter(p => Number(p.price) <= priceCap);
    if (capped.length >= 2) pool = capped;
  }
  return formatProducts(
    pool
      .sort((a, b) => discountPercent(b.price, b.mrp) - discountPercent(a.price, a.mrp))
      .slice(0, limit)
  );
}

async function trackOrder(api) {
  try {
    const data = await api('/orders/mine');
    const orders = Array.isArray(data) ? data : data.orders || [];
    if (orders.length === 0) {
      return { text: "You haven't placed any orders yet. 🛍️ Check out today's deals!", chips: ["Today's deals"] };
    }
    const latest = orders[0];
    const lines = orders.slice(0, 3).map(o =>
      `#${o.orderNumber} — ${o.status} — ₹${Number(o.total).toLocaleString('en-IN')}`
    );
    return {
      text:
        orders.length === 1
          ? `Your latest order:\n${lines[0]}`
          : `Your recent orders:\n${lines.join('\n')}`,
      note: latest.status === 'Shipped' ? '🚚 Your package is on the way!' : undefined
    };
  } catch {
    return { text: 'I could not reach your orders right now. Please try again in a moment.' };
  }
}

export async function getBotReply({ message, products, user, api, pricing, currentProduct = null }) {
  const text = (message || '').toLowerCase().trim();

  if (!text) {
    return { text: 'Ask me anything about the store 😊' };
  }

  // Greetings
  if (/^(hi|hii+|hello|hey|namaste|good (morning|afternoon|evening))\b/.test(text)) {
    return {
      text: `Hi${user?.name ? ` ${user.name.split(' ')[0]}` : ''}! 👋 I'm the ShopEasy assistant. Ask me about products, deals, your orders, or store policies.`,
      chips: ['Track my order', "Today's deals", 'Payment options']
    };
  }

  if (/\b(thanks|thank you|thx|great|nice|awesome)\b/.test(text)) {
    return { text: 'Happy to help! 😊 Anything else?', chips: ["Today's deals", 'Shipping info'] };
  }

  // Questions about the currently viewed product
  if (
    currentProduct &&
    /\b(this|that|it\b|its|current)\b|about (this|the) (product|item)|tell me about/.test(text) &&
    !/(deal|discount|offer|sale|track)/.test(text)
  ) {
    const p = currentProduct;
    const price = Number(p.price);
    const mrp = Number(p.mrp || price);
    const off = discountPercent(price, mrp);
    const stock = Number(p.stock ?? 0);
    const stockLine = stock > 0
      ? `✅ In stock${stock <= 2 ? ' — only a couple left!' : ''}`
      : '❌ Currently out of stock.';
    return {
      text: `"${p.name}" — ₹${price.toLocaleString('en-IN')}${off ? ` (${off}% off)` : ''}.\n${stockLine}\n\n${(p.description || '').slice(0, 150)}${(p.description || '').length > 150 ? '…' : ''}`,
      products: formatProducts([p]),
      chips: ['Return policy', 'Shipping info']
    };
  }

  // Order tracking
  if (/(track|order status|my order|where.*(order|package)|delivery status)/.test(text)) {
    return trackOrder(api);
  }

  // Stock check
  if (/(stock|available|availability|back in)/.test(text)) {
    const words = text.replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length > 3);
    const match = products.find(p =>
      words.some(w => p.name.toLowerCase().includes(w))
    );
    if (match) {
      const stock = Number(match.stock ?? 0);
      return {
        text:
          stock > 0
            ? `✅ "${match.name}" is in stock${stock <= 2 ? ' — only a couple left!' : ` (${stock} units)`}.`
            : `❌ "${match.name}" is currently out of stock. Check back soon!`,
        products: formatProducts([match])
      };
    }
    return { text: 'Tell me which product you mean and I will check its stock.', chips: ["Today's deals"] };
  }

  // Deals / offers
  if (/(deal|discount|offer|sale|cheap|coupon)/.test(text)) {
    const priceCap = detectPriceCap(text);
    return {
      text: priceCap
        ? `🔥 Biggest discounts under ₹${priceCap.toLocaleString('en-IN')}:`
        : '🔥 Here are the biggest discounts right now:',
      products: topDeals(products, { priceCap }),
      chips: ['Track my order', 'Shipping info']
    };
  }

  // Product search / recommendations
  const priceCap = detectPriceCap(text);
  const category = detectCategory(text);
  const looksLikeSearch =
    priceCap || category || /(show|find|recommend|suggest|looking for|want|buy|best|trending|popular|product)/.test(text);
  if (looksLikeSearch) {
    const picks = searchProducts(products, { category, priceCap });
    if (picks.length > 0) {
      const label = [category ? category.replace(/\b\w/g, c => c.toUpperCase()) : null, priceCap ? `under ₹${priceCap.toLocaleString('en-IN')}` : null]
        .filter(Boolean)
        .join(' ');
      return {
        text: label ? `Here are some great ${label} picks:` : 'Here are some popular picks:',
        products: picks,
        chips: ["Today's deals"]
      };
    }
    return { text: 'I could not find matches for that — try naming a category like mobiles, shoes, or fitness.', chips: ['Show trending products'] };
  }

  // Shipping
  if (/(ship|deliver|arrive|how long|courier)/.test(text)) {
    return {
      text: `🚚 Delivery takes 2–5 business days. Shipping is FREE on orders over ₹${Number(pricing.freeShippingThreshold).toLocaleString('en-IN')}, otherwise ₹${pricing.shippingFee}. Cash on Delivery is available too!`,
      chips: ['Payment options', 'Returns policy']
    };
  }

  // Payments / COD
  if (/(pay|payment|cod|cash on delivery|upi|card|razorpay|net banking)/.test(text)) {
    return {
      text: '💳 You can pay online via UPI, cards, or net banking (Razorpay) — or choose Cash on Delivery and pay when your order arrives.',
      chips: ['Shipping info', "Today's deals"]
    };
  }

  // Returns
  if (/(return|refund|exchange|replace|cancel)/.test(text)) {
    return {
      text: '↩️ We offer easy 30-day returns. You can cancel pending or processing orders yourself from My Orders — stock is restored automatically and refunds are processed within 5–7 days for prepaid orders.',
      chips: ['Track my order', 'Payment options']
    };
  }

  // Contact / human
  if (/(contact|support|help|human|agent|email|phone|complain)/.test(text)) {
    return {
      text: '📮 Our team is at support@shopeasy.com — we reply within 24 hours. For order questions I can help right here!',
      chips: ['Track my order', 'Shipping info']
    };
  }

  // Fallback
  return {
    text: "I'm best at products, deals, orders, and store policies 🤖 Try one of these:",
    chips: ['Track my order', "Today's deals", 'Shipping info', 'Payment options']
  };
}
