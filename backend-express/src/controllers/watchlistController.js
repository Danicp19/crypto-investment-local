// backend-express/src/controllers/watchlistController.js
const pool = require('../db');

const addToWatchlist = async (req, res) => {
  try {
    const { symbol, name } = req.body;
    if (!symbol || !name) return res.status(400).json({ message: 'Symbol and name required' });

    // Insertar en la tabla de cryptos si no existe
    const [rows] = await pool.query('SELECT id FROM cryptocurrencies WHERE symbol = ?', [symbol]);
    if (rows.length === 0) {
      await pool.query('INSERT INTO cryptocurrencies (symbol, name) VALUES (?, ?)', [symbol, name]);
    }

    res.json({ message: `${symbol} added to watchlist` });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error adding to watchlist' });
  }
};

module.exports = { addToWatchlist };
