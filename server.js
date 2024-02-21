const mongoose = require('mongoose');
const dotenv = require('dotenv');

// handle all uncaught exception
process.on('uncaughtException', (err) => {
  console.log('ERROR💥', err.name, err.message);
  console.log('Uncaught Exception 💥 Shutting down...');
  process.exit(1);
});

/****** view env variable *****/
// console.log(app.get('env'));
dotenv.config({ path: './config.env' });
// console.log(process.env);

const port = process.env.PORT || 3000;
/****** configure mongoose *****/
// connnect to database using mongoose
const Database = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);
mongoose
  .connect(Database, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('Database connected successfully!'));
//.then((connection) => console.log(connection));

/********** Start Server **************/
const app = require('./app');

const server = app.listen(port, '127.0.0.1', () => {
  console.log(`App running on port ${port}`);
});

// handle all unhandled promise rejection
process.on('unhandledRejection', (err) => {
  console.log('ERROR💥', err.name, err.message);
  console.log('Unhandled Rejection💥 Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
