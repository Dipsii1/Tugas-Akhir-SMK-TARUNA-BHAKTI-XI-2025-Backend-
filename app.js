require('dotenv').config();

// Import modules
const createError = require('http-errors');
const express = require('express');
const path = require('path');
var cors = require('cors');
const rateLimit = require('express-rate-limit');

// Import Router
const indexRouter = require('./routes/index');
const booksRouter = require('./routes/books');
const categoriesRouter = require('./routes/categories');
const borrowedRouter = require('./routes/borrowed');

const app = express();
app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

const limiterBorrowed = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 1, // limit tiap IP
  message: {
    success: false,
    message: "Too many requests, please try again later."
  }
});

// cors 
app.use(cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 📌 Tambahkan ini agar gambar bisa diakses via URL
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/', indexRouter);
app.use('/books', booksRouter);
app.use('/categories', categoriesRouter);
app.use('/borrowed', borrowedRouter);

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

const port = process.env.APP_PORT || 4000;
const env = process.env.ENV_TYPE || 'production';

app.listen(port, () => {
  console.log(`Server running in ${env} mode on port ${port}`);
});

module.exports = app;
