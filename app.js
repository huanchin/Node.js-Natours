const path = require('path');
const fs = require('fs');
const express = require('express');

const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globelErrorHandler = require('./controllers/errorControllers');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const app = express();

const limiter = rateLimit({
  max: 50, // Limit each IP to maximum 50 requests per `window` (here, per 15 minutes).
  windowMs: 15 * 60 * 1000, // 15 minutes
});

// const corsOptions = {
//   origin: ['http://localhost:8000', 'http://127.0.0.1:8000'], // 允许的来源
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // 允许的HTTP方法
//   credentials: true, // 允许发送凭证(cookie)
// };

// set view engine to pug
app.set('view engine', 'pug');
// defined views folder's path
app.set('views', path.join(__dirname, 'views'));

/********** Application-level Middleware **************/
// console.log(process.env.NODE_ENV);

// Serving static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

// Helmet helps secure Express apps by setting HTTP response headers
// app.use(helmet());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'default-src': [
          "'self'",
          'https://js.stripe.com/v3/',
          'https://cdnjs.cloudflare.com',
        ],
        'script-src': [
          "'self'",
          'https://js.stripe.com/v3/',
          'https://cdnjs.cloudflare.com',
        ],
      },
    },
  }),
);

// Cross-Origin Resource Sharing (CORS)
// app.use(cors(corsOptions));

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same IP
app.use('/api', limiter);

// Body parser. It parses incoming JSON requests and puts the parsed data in req.body.
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
// It parses incoming cookie and puts the parsed data in req.cookie.
app.use(cookieParser());

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

app.use(compression());
// create our own middleware
// app.use((req, res, next) => {
//   console.log('Hello from the middleware...');
//   next();
// });

// create our own middleware. test...
app.use((req, res, next) => {
  req.reqestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// mount the router(tourRouter/ userRouter) on the app
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/booking', bookingRouter);

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
