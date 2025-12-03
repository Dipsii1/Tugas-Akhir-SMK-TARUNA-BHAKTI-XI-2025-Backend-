const express = require('express');
const router = express.Router();
const {
     getAllCategories,
     getIdCategories,
     createCategories
} = require('../controllers/categoriesControllers');

// GET all categories
router.get('/', getAllCategories);

// GET Id Categories
router.get('/:id',getIdCategories)

// POST create new book
router.post('/', createCategories);


module.exports = router;
