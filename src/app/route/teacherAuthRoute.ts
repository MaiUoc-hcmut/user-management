const express = require('express');
const routerTeacher = express.Router();
const AuthTeacher = require('../controllers/authController');
const passportTeacher = require('passport');
const authTeacher = require('../middleware/teacherAuth');

routerTeacher.post('/register', AuthTeacher.registerTeacher);
routerTeacher.post(
    '/login', 
    authTeacher.loginAuth,
    AuthTeacher.loginTeacher
);
routerTeacher.post('/refresh-token', AuthTeacher.refreshToken);

module.exports = routerTeacher;