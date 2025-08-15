const { tick } = require('./jobs/pullQuotes'); // ajusta la ruta si tu archivo se llama distinto

tick().then(() => {
  console.log('Job ejecutado manualmente.');
  process.exit();
}).catch(err => {
  console.error('Error al ejecutar el job:', err);
  process.exit(1);
});
