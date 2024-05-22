const express = require('express');
const routerStudent = express.Router();
const AuthStudent = require('../controllers/authController');
require('passport');
const authStudent = require('../middleware/studentAuth');

routerStudent.post('/register', AuthStudent.registerStudent);
routerStudent.post(
    '/login', 
    authStudent.loginAuth,
    AuthStudent.loginStudent
);
routerStudent.post('/refresh-token', AuthStudent.refreshToken);
 
module.exports = routerStudent;

export {}