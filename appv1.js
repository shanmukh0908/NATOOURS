const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestedAt = new Date().toISOString();
  next();
});

// app.get('/api/v1/tours', gettours);
// app.post('/api/v1/tours', posttour);
// app.get('/api/v1/tours/:id', gettour);
// app.patch('/api/v1/tours/:id', updatetour);
// app.delete('/api/v1/tours/:id', deletetour);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
