const express = require('express');
const router = express.Router();
const { getCryptos, getCryptoBySymbol, getHistory } = require('../controllers/cryptoController');

router.get('/cryptos', getCryptos);
router.get('/cryptos/:symbol', getCryptoBySymbol);
router.get('/history/:symbol', getHistory);

module.exports = router;
