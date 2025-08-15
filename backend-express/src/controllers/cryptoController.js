const pool = require('../db');
const { listLatest, quotesBySymbol } = require('../services/cmc');

const getCryptos = async (req, res) => {
  try {
    if (process.env.MOCK === 'true') {
      return res.json([
        { symbol: 'BTC', name: 'Bitcoin', price: 60000, volume: 1000000000, percent_change_24h: 2.5 },
        { symbol: 'ETH', name: 'Ethereum', price: 4000, volume: 500000000, percent_change_24h: -1.2 },
        { symbol: 'ADA', name: 'Cardano', price: 2.15, volume: 200000000, percent_change_24h: 0.8 }
      ]);
    }

    const items = await listLatest({ start: 1, limit: 50, convert: 'USD' });
    const mapped = items.map(i => ({
      symbol: i.symbol,
      name: i.name,
      price: i.quote.USD.price,
      volume: i.quote.USD.volume_24h,
      percent_change_24h: i.quote.USD.percent_change_24h
    }));
    res.json(mapped);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error obteniendo criptomonedas' });
  }
};

const getCryptoBySymbol = async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const data = await quotesBySymbol(symbol, 'USD');
    const item = data[symbol];
    if (!item) return res.status(404).json({ message: 'Crypto not found' });

    const out = {
      symbol: item.symbol,
      name: item.name,
      price: item.quote.USD.price,
      volume: item.quote.USD.volume_24h,
      percent_change_24h: item.quote.USD.percent_change_24h
    };

    // 🔹 Guardar snapshot inicial en la BD para histórico
    let cryptoId;
    const [rows] = await pool.query('SELECT id FROM cryptocurrencies WHERE symbol = ?', [symbol]);
    if (rows.length) {
      cryptoId = rows[0].id;
    } else {
      const [insertRes] = await pool.query(
        'INSERT INTO cryptocurrencies (symbol, name) VALUES (?, ?)',
        [symbol, item.name]
      );
      cryptoId = insertRes.insertId;
    }

    await pool.query(
      `INSERT INTO price_history (crypto_id, price, volume_24h, percent_change_24h)
       VALUES (?, ?, ?, ?)`,
      [cryptoId, out.price, out.volume, out.percent_change_24h]
    );

    res.json(out);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error obteniendo la crypto' });
  }
};

const getHistory = async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const { from, to, range } = req.query;

    let rangeCondition = '';
    if (range) {
      switch (range) {
        case '1h':
          rangeCondition = "AND ph.timestamp >= NOW() - INTERVAL 1 HOUR";
          break;
        case '24h':
          rangeCondition = "AND ph.timestamp >= NOW() - INTERVAL 1 DAY";
          break;
        case '7d':
          rangeCondition = "AND ph.timestamp >= NOW() - INTERVAL 7 DAY";
          break;
        case '1m':
          rangeCondition = "AND ph.timestamp >= NOW() - INTERVAL 1 MONTH";
          break;
        case 'YTD':
          rangeCondition = "AND YEAR(ph.timestamp) = YEAR(CURDATE())";
          break;
      }
    }

    const [rows] = await pool.query(
      `
      SELECT ph.timestamp, ph.price
      FROM price_history ph
      JOIN cryptocurrencies c ON c.id = ph.crypto_id
      WHERE c.symbol = ?
        AND ( ? IS NULL OR ph.timestamp >= ? )
        AND ( ? IS NULL OR ph.timestamp <= ? )
        ${rangeCondition}
      ORDER BY ph.timestamp ASC
      `,
      [symbol, from || null, from || null, to || null, to || null]
    );

    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error obteniendo histórico' });
  }
};


module.exports = { getCryptos, getCryptoBySymbol, getHistory };
