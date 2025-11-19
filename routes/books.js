const express = require('express');
const router = express.Router();
const { 
  getAllBook, 
  getBookById, 
  createBook, 
  updateBook, 
  deleteBook 
} = require('../controllers/booksControllers');

// GET all books
router.get('/', getAllBook);

// GET book by ID
router.get('/:id', getBookById);

// POST create new book
router.post('/', createBook);

// PUT update book
router.put('/:id', updateBook);

// DELETE book
router.delete('/:id', deleteBook);

module.exports = router;