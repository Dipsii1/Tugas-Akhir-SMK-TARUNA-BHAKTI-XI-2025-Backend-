require('dotenv').config();

// Import modules
const createError = require('http-errors');
const express = require('express');
const path = require('path');
var cors = require('cors');

// Import Router
const indexRouter = require('./routes/index');
const booksRouter = require('./routes/books');
const categoriesRouter = require('./routes/categories');

const app = express();
app.use(
  cors({
    origin: 'http://localhost:8080',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);


// cors 
app.use(cors())

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', indexRouter);
app.use('/books', booksRouter);
app.use('/categories', categoriesRouter);

// 404 handler
app.use((req, res, next) => {
  next(createError(404));
});

// Error handler (MUST use 4 parameters)
app.use((err, req, res, next) => {
  const env = req.app.get('env');
  const statusCode = err.status || 500;

  res.status(statusCode).json({
    error: true,
    message: err.message,
    ...(env === 'development' && { stack: err.stack }),
  });
});

// Server configuration
const port = process.env.APP_PORT || 4000;
const env = process.env.ENV_TYPE || 'production';

// Always start server unless explicitly disabled
app.listen(port, () => {
  console.log(`Server running in ${env} mode on port ${port}`);
});

module.exports = app;
