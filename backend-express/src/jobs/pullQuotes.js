const pool = require('../db');
const { quotesBySymbol } = require('../services/cmc');



async function upsertCrypto(symbol, name) {
  const [rows] = await pool.query('SELECT id FROM cryptocurrencies WHERE symbol = ?', [symbol]);
  if (rows.length) return rows[0].id;
  const [res] = await pool.query('INSERT INTO cryptocurrencies (symbol, name) VALUES (?,?)', [symbol, name]);
  return res.insertId;
}

async function saveSnapshot(symbol, item) {
  const id = await upsertCrypto(symbol, item.name);
  const q = item.quote?.USD;

  if (!q || q.price == null) {
    console.warn(`Datos incompletos para ${symbol}, no se guarda snapshot.`);
    return;
  }

  await pool.query(
    `INSERT INTO price_history (crypto_id, price, volume_24h, percent_change_24h)
     VALUES (?,?,?,?)`,
    [id, q.price, q.volume_24h, q.percent_change_24h]
  );
}


async function tick() {
  try {
    const [rows] = await pool.query('SELECT symbol, name FROM cryptocurrencies');
    const symbols = rows.map(r => r.symbol.toUpperCase());

    if (!symbols.length) return;

    const data = await quotesBySymbol(symbols, 'USD'); // llama a CMC

    await Promise.all(symbols.map(async (sym) => {
      const item = data[sym];
      if (!item || !item.quote || !item.quote.USD) {
        console.warn(`No se encontró data para símbolo: ${sym}, saltando...`);
        return;
      }
      await saveSnapshot(sym, item);
    }));

  } catch (e) {
    console.error('pullQuotes error', e.message);
  }
}


function start() {
  tick(); // primer disparo
  setInterval(tick, 300000);   // cada 5 minutos

  
}
 // cada 30 minutos 1800000
module.exports = { start,tick };
