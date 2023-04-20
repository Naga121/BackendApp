const express = require('express');
const router = express.Router();

const uploads = require('../middlewares/fileuploade');
const oAuth = require('../controllers/OAuth-controller');

// Add user
router.post('/register', uploads.single('profilePic'), oAuth.add_new_user);

// verify email
router.get('/verify/:userId/:uniqueString', oAuth.email_verify);

// verified page route
router.get('/verified/', oAuth.verify_screen);

// Login User stuff
router.post('/login', oAuth.user_login);

//Request Password Reset stuff
router.post('/requestPasswordReset', oAuth.request_password_reset);

// reset password 
router.post('/resetPassword', oAuth.password_reset);

module.exports = router;
