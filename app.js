const express = require('express');
const morgan = require('morgan');
const cookieparser = require('cookie-parser');
const helmet = require('helmet');
const path = require('path');
const ratelimiter = require('express-rate-limit');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewsRouter = require('./routes/viewsRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const appError = require('./utils/appError');
const errorController = require('./controllers/errorController');
const mongosanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const pug = require('pug');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//serving static files to browser
app.use(express.static(`${__dirname}/public`));

// adding security http parameters to our http request
// Set Content Security Policy (CSP)

const scriptSrcUrls = [
  'https://unpkg.com/',
  'https://demotiles.maplibre.org/',
  'https://basemaps.cartocdn.com/',
  'https://demotiles.maplibre.org/',
  'https://basemaps.cartocdn.com/',
  'https://demotiles.maplibre.org/',
  'https://basemaps.cartocdn.com/',
  'ws://127.0.0.1:56438/',
  'ws://127.0.0.1:63491/',
  'https://js.stripe.com',
];
const styleSrcUrls = [
  'https://unpkg.com/',
  'https://fonts.googleapis.com/',
  'https://basemaps.cartocdn.com/',
];
const connectSrcUrls = [
  'https://unpkg.com/',
  'https://demotiles.maplibre.org/',
  'https://basemaps.cartocdn.com/',
  'https://tiles.basemaps.cartocdn.com/',
  'https://tiles-d.basemaps.cartocdn.com/',
  'https://tiles-a.basemaps.cartocdn.com/',
  'https://tiles-b.basemaps.cartocdn.com/',
  'https://tiles-c.basemaps.cartocdn.com/',
  'ws://127.0.0.1:63491/',
  'ws://127.0.0.1:56438/',
  'https://js.stripe.com',
];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];

app.use(express.urlencoded({ extended: true }));
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: ["'self'", 'blob:', 'data:'],
      fontSrc: ["'self'", ...fontSrcUrls],
      frameSrc: ["'self'", 'https://js.stripe.com'],
    },
  }),
);
// app.use(helmet());

//body parser
app.use(express.json());
app.use(cookieparser());

//data sanitisation against nosql query injection and xss
app.use(mongosanitize());

app.use(xss()); // protection against cross server modifications

// rate limiting
const limiter = ratelimiter({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'too many requests from the ip ,please try again in an hour',
});

app.use('/api', limiter);

// preventing parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
      'ratingsQuantity',
    ],
  }),
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use((req, res, next) => {
  // console.log(req.cookies, '🖐 cookies');
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
app.use('/api/v1/reviews', reviewRouter);
app.use('/', viewsRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  // const err = new Error(`couldnt find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;
  next(new appError(`couldnt find ${req.originalUrl} on this server`, 404));
});

app.use(errorController);

module.exports = app;
