const express = require('express');
const router = express.Router();

const checkAuth = require('../middlewares/middleware');
const productsController = require('../controllers/products-controller'); 
const uploads = require('../middlewares/fileuploade');


// Get All Products
router.get('/', checkAuth,  productsController.products_get_all);

// Post new Product
router.post('/', checkAuth, uploads.single('productImage'), productsController.products_post);

// Get Single product
router.get('/:productId', checkAuth, productsController.products_get_single );

// Update exist product
router.patch('/:productId', checkAuth, productsController.products_update_single );

// Delete exist product
router.delete('/:productId', checkAuth, productsController.products_delete_single );

module.exports = router;