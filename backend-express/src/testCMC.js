require('dotenv').config();
const { listLatest, quotesBySymbol } = require('./services/cmc');

async function test() {
  try {
    console.log('=== Listado de criptos ===');
    const list = await listLatest({ limit: 3 });
    console.log(list.map(c => ({ symbol: c.symbol, price: c.quote.USD.price })));

    console.log('=== Quotes por símbolo ===');
    const quotes = await quotesBySymbol(['BTC','ETH']);
    console.log(Object.values(quotes).map(c => ({ symbol: c.symbol, price: c.quote.USD.price })));
  } catch (e) {
    console.error('Error en CMC:', e.response?.data || e.message);
  }
}

test();
