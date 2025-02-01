const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

process.on('uncaughtException', (err) => {
  console.log('uncaught exception 💥', err.name, err.message);
  process.exit(1);
});

const app = require('./app');

const port = 3000;

const server = app.listen(port, () => {
  console.log('listenning to the server in port 3000');
});

process.on('unhandledRejection', (err) => {
  console.log('unhandledrejection 💥', err.name, err.message);
  server.close(() => process.exit(1));
});
