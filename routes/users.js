const express = require('express');
const router = express.Router();

const checkAuth = require('../middlewares/middleware'); 
const userController = require('../controllers/users-controller')


// user details
// get all User details
router.get('/getallusers', checkAuth, userController.get_all_users);

// get single user details
router.get('/getuser/:email', checkAuth, userController.get_single_user);

// update single user details
router.patch('/updateuser/:email', checkAuth, userController.update_single_user);

// gelete Single User details
router.delete('/deleteuser/:email', checkAuth, userController.delete_single_user);

module.exports = router;
