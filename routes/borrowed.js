const express = require('express');
const router = express.Router();
const {
  getAllBorrowed,
  getBorrowedById,
  getBorrowedByUserId,
  createBorrow,
  updateBorrow,
  deleteBorrow
} = require('../controllers/borrowedControllers');

// Borrowed books routes
router.get('/', getAllBorrowed);
router.get('/user/:userId', getBorrowedByUserId);
router.get('/:id', getBorrowedById);
router.post('/', createBorrow);
router.put('/:id', updateBorrow);
router.delete('/:id', deleteBorrow);

module.exports = router;