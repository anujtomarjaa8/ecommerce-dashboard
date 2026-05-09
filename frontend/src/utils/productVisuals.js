export const productVisuals = [
  { keywords: ['headphone', 'earphone', 'earbuds', 'audio'], emoji: '🎧', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
  { keywords: ['laptop', 'macbook', 'computer', 'notebook'], emoji: '💻', gradient: 'linear-gradient(135deg, #2d3748, #4a5568)' },
  { keywords: ['backpack', 'bag', 'luggage'], emoji: '🎒', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)' },
  { keywords: ['watch', 'smartwatch', 'fitness'], emoji: '⌚', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
  { keywords: ['shoe', 'sneaker', 'running', 'boot'], emoji: '👟', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
  { keywords: ['coffee', 'maker', 'espresso'], emoji: '☕', gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)' },
  { keywords: ['lamp', 'light', 'led'], emoji: '💡', gradient: 'linear-gradient(135deg, #ffecd2, #fcb69f)' },
  { keywords: ['speaker', 'bluetooth', 'sound', 'music'], emoji: '🔊', gradient: 'linear-gradient(135deg, #fa709a, #fee140)' },
  { keywords: ['yoga', 'mat', 'fitness', 'exercise'], emoji: '🧘', gradient: 'linear-gradient(135deg, #a1c4fd, #c2e9fb)' },
  { keywords: ['keyboard', 'mechanical', 'typing'], emoji: '⌨️', gradient: 'linear-gradient(135deg, #d4fc79, #96e6a1)' },
  { keywords: ['mouse', 'pad', 'gaming'], emoji: '🖱️', gradient: 'linear-gradient(135deg, #84fab0, #8fd3f4)' },
  { keywords: ['phone', 'mobile', 'smartphone', 'iphone'], emoji: '📱', gradient: 'linear-gradient(135deg, #a8edea, #fed6e3)' },
  { keywords: ['camera', 'photo', 'lens'], emoji: '📷', gradient: 'linear-gradient(135deg, #fccb90, #d57eeb)' },
  { keywords: ['book', 'reading', 'novel'], emoji: '📚', gradient: 'linear-gradient(135deg, #e0c3fc, #8ec5fc)' },
  { keywords: ['cable', 'usb', 'charger', 'wire'], emoji: '🔌', gradient: 'linear-gradient(135deg, #c1dfc4, #deecdd)' },
  { keywords: ['desk', 'stand', 'table'], emoji: '🪑', gradient: 'linear-gradient(135deg, #fdfcfb, #e2d1c3)' },
];

export function getProductVisual(productName) {
  const name = productName.toLowerCase();
  for (const visual of productVisuals) {
    if (visual.keywords.some(kw => name.includes(kw))) {
      return visual;
    }
  }
  return { emoji: '📦', gradient: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)' };
}