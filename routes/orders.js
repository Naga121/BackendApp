const express = require('express');
const router = express.Router();

const ordersController = require('../controllers/orders-controller');
const checkAuth = require('../middlewares/middleware');

// getting all orders
router.get('/', checkAuth, ordersController.orders_get_all);

// Creating new order
router.post('/', checkAuth, ordersController.orders_post);

// get single order details 
router.get('/:orderId', checkAuth, ordersController.orders_get_single);

// router.patch('/:orderId', async (req, res, next) => {
//     let id = req.params.orderId;
//     res.status(200).json({ message: 'Updated your order details ID', data: id });
// });
router.delete('/:orderId', checkAuth, ordersController.orders_delete_single);

module.exports = router;