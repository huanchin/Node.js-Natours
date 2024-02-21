const fs = require('fs');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globelErrorHandler = require('./controllers/errorControllers');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const app = express();

const limiter = rateLimit({
  max: 50, // Limit each IP to maximum 50 requests per `window` (here, per 15 minutes).
  windowMs: 15 * 60 * 1000, // 15 minutes
});
/********** Application-level Middleware **************/
// console.log(process.env.NODE_ENV);

// Helmet helps secure Express apps by setting HTTP response headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same IP
app.use('/api', limiter);

// Body parser. It parses incoming JSON requests and puts the parsed data in req.body.
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

// Serving static files
app.use(express.static(`${__dirname}/public`));

// create our own middleware
// app.use((req, res, next) => {
//   console.log('Hello from the middleware...');
//   next();
// });

// create our own middleware. test...
app.use((req, res, next) => {
  req.reqestTime = new Date().toISOString();
  next();
});

// mount the router(tourRouter/ userRouter) on the app
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// handling unhandle routes
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server!`,
  // });

  // create an error
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;
  // next(err);

  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Globel error handling middleware
app.use(globelErrorHandler);

module.exports = app;
