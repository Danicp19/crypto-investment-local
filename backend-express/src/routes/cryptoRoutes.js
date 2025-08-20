const express = require('express');
const router = express.Router();
const { getCryptos, getCryptoBySymbol, getHistory } = require('../controllers/cryptoController');
const { addToWatchlist, getWatchlist } = require('../controllers/watchlistController');

router.get('/cryptos', getCryptos);
router.get('/cryptos/:symbol', getCryptoBySymbol);
router.get('/history/:symbol', getHistory);
router.post('/watchlist', addToWatchlist);   
router.get('/watchlist', getWatchlist);   
module.exports = router;
