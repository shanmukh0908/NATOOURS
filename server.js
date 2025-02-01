const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('uncaught exception 💥', err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<db_password>',
  process.env.MONGO_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('connection successful'))
  .catch(() => console.log('some error in connection'));

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log('listenning to the server in port 3000');
});

process.on('unhandledRejection', (err) => {
  console.log('unhandledrejection 💥', err.name, err.message);
  server.close(() => process.exit(1));
});
