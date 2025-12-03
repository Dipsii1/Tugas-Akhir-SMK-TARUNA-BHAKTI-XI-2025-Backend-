const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const { 
  getAllBook, 
  getBookById, 
  createBook, 
  updateBook, 
  deleteBook 
} = require('../controllers/booksControllers');

// Konfigurasi penyimpanan file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/books'); // folder penyimpanan gambar
  },
  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() + '-' + file.originalname.replace(/\s+/g, '_')
    );
  },
});

// Hanya terima file gambar
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|webp/;
  const ext = allowedExtensions.test(
    path.extname(file.originalname).toLowerCase()
  );
  if (ext) cb(null, true);
  else cb(new Error("Only images allowed!"));
};

const upload = multer({ storage, fileFilter });

// GET all books
router.get('/', getAllBook);

// GET book by ID
router.get('/:id', getBookById);

// POST create new book + upload foto
router.post('/', upload.single('cover'), createBook);

// PUT update book + upload foto baru (opsional)
router.put('/:id', upload.single('cover'), updateBook);

// DELETE book
router.delete('/:id', deleteBook);

module.exports = router;
