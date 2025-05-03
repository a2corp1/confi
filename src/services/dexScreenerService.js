// client/src/services/dexScreenerService.js (now powered by GeckoTerminal)
import axios from 'axios';

const GECKO_TERMINAL_BASE_URL = 'https://api.geckoterminal.com/api/v2';

// Fallback image generator
const generateFallbackImage = (symbol) => {
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');

  const r = Math.floor(Math.random() * 128 + 127);
  const g = Math.floor(Math.random() * 128 + 127);
  const b = Math.floor(Math.random() * 128 + 127);

  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(0, 0, 200, 200);

  ctx.fillStyle = 'white';
  ctx.font = 'bold 80px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(symbol?.[0] || '?', 100, 110);

  return canvas.toDataURL();
};

// Replaces DexScreener with GeckoTerminal
export const fetchDexScreenerData = async (tokenAddress) => {
  try {
    const response = await axios.get(
      `${GECKO_TERMINAL_BASE_URL}/networks/solana/tokens/${tokenAddress}`,
      {
        timeout: 10000,
        headers: {
          Accept: 'application/json',
          'Cache-Control': 'no-cache',
        },
      }
    );

    const attributes = response.data?.data?.attributes;
    if (!attributes) throw new Error('Invalid response structure from GeckoTerminal API');

    return {
      name: attributes.name,
      symbol: attributes.symbol,
      price: parseFloat(attributes.price_usd || 0),
      priceChange: null, // GeckoTerminal doesn't return price change directly
      volume_24h: parseFloat(attributes.volume_usd?.h24 || 0),
      market_cap: parseFloat(attributes.fdv_usd || 0),
      lastUpdated: new Date(),
      url: `https://www.geckoterminal.com/solana/pools/${attributes.address}`,
      image: attributes.image_url || generateFallbackImage(attributes.symbol),
    };
  } catch (error) {
    console.error('Error fetching GeckoTerminal data:', error);
    throw error;
  }
};
