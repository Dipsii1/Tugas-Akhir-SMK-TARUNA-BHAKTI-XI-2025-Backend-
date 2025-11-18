const express = require('express');
const router = express.Router();
const { 
  getAllBuku, 
  getBukuById, 
  tambahBuku, 
  updateBuku, 
  deleteBuku 
} = require('../controllers/booksControllers');

// GET all books
router.get('/', getAllBuku);

// GET book by ID
router.get('/:id', getBukuById);

// POST create new book
router.post('/', tambahBuku);

// PUT update book
router.put('/:id', updateBuku);

// DELETE book
router.delete('/:id', deleteBuku);

module.exports = router;