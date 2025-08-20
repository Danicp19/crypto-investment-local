const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { start: startQuotesJob } = require('./jobs/pullQuotes');
const cryptoRoutes = require('./routes/cryptoRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', cryptoRoutes);

app.listen(process.env.PORT || 4000, () => {
  console.log(`Servidor escuchando en puerto ${process.env.PORT || 4000}`);
  if (process.env.MOCK !== 'true') startQuotesJob();
});
