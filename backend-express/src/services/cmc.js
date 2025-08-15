const axios = require('axios');

const client = axios.create({
  baseURL: 'https://pro-api.coinmarketcap.com/v1',
  timeout: 30000,
  headers: {
    'Accepts': 'application/json',
    'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY
  }
});

async function listLatest({ start = 1, limit = 50, convert = 'USD' } = {}) {
  const { data } = await client.get('/cryptocurrency/listings/latest', {
    params: { start, limit, convert }
  });
  return data.data; // array
}

async function quotesBySymbol(symbols, convert = 'USD') {
  const symbolParam = Array.isArray(symbols) ? symbols.join(',') : symbols;
  const { data } = await client.get('/cryptocurrency/quotes/latest', {
    params: { symbol: symbolParam, convert }
  });
  return data.data; // objeto por símbolo
}

module.exports = { listLatest, quotesBySymbol };
