const express = require('express');
const router = express.Router();

const AdminController = require('../controllers/adminController');
const authController = require('../controllers/authController');
const Auth = require('../middleware/admin');

router.route('/login')
    .post(Auth.loginAuth, authController.loginAdmin);

router.route('/register')
    .post(authController.registerAdmin);

router.route('/:adminId')
    .get(AdminController.getAdmin)


module.exports = router;

export {}