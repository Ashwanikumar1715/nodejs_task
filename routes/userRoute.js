const express = require('express');
const { registerUser, loginUser,forgotPassword} = require('../controllers/userController');
const { isAuthenticatedUser } = require('../middlewares/auth');

const router = express.Router();

router.post('/register',registerUser)
router.route('/login').post(loginUser);

router.route('/password/forgot').post(forgotPassword);


module.exports = router;