// backend-express/src/controllers/watchlistController.js
const pool = require('../db');

// 👉 Agregar a la watchlist
const addToWatchlist = async (req, res) => {
  try {
    const { symbol, name, user_id = 1 } = req.body; // por defecto user_id = 1
    if (!symbol || !name) {
      return res.status(400).json({ message: 'Symbol and name required' });
    }

    // Verificar si la cripto existe en la tabla cryptocurrencies
    let [rows] = await pool.query('SELECT id FROM cryptocurrencies WHERE symbol = ?', [symbol]);
    if (rows.length === 0) {
      const [result] = await pool.query(
        'INSERT INTO cryptocurrencies (symbol, name) VALUES (?, ?)',
        [symbol, name]
      );
      rows = [{ id: result.insertId }];
    }

    const cryptoId = rows[0].id;

    // Insertar en la watchlist (evitar duplicados para ese usuario)
    const [exists] = await pool.query(
      'SELECT id FROM watchlist WHERE user_id = ? AND symbol = ?',
      [user_id, symbol]
    );

    if (exists.length > 0) {
      return res.status(200).json({ message: `${symbol} is already in watchlist` });
    }

    await pool.query(
      'INSERT INTO watchlist (user_id, symbol) VALUES (?, ?)',
      [user_id, symbol]
    );

    res.json({ message: `${symbol} added to watchlist` });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error adding to watchlist' });
  }
};

// 👉 Listar la watchlist de un usuario
const getWatchlist = async (req, res) => {
  try {
    const user_id = req.query.user_id || 1; // por defecto el usuario 1
    const [rows] = await pool.query(
      `SELECT w.id, w.symbol, c.name, w.created_at
       FROM watchlist w
       JOIN cryptocurrencies c ON c.symbol = w.symbol
       WHERE w.user_id = ? 
       ORDER BY w.created_at DESC`,
      [user_id]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error retrieving watchlist' });
  }
};

module.exports = { addToWatchlist, getWatchlist };
