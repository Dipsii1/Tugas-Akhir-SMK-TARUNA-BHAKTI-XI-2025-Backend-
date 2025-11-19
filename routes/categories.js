const express = require('express');
const router = express.Router();
const {
     getAllCategories
} = require('../controllers/categoriesControllers');

// GET all categories
router.get('/', getAllCategories);


module.exports = router;
