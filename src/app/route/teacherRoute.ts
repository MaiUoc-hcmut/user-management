const express = require('express');
const router = express.Router();

const TeacherController = require('../controllers/TeacherController');
const Authorize = require('../middleware/teacherAuth');
const Photo = require('../../config/firebase/photo');

router.route('/page/:page')
    .get(TeacherController.getAllTeacher);

router.route('/get-profile-teacher/:teacherId')
    .get(TeacherController.getProfileTeacher);

router.route('/get-teacher-by-id/:teacherId')
    .get(TeacherController.getTeacherById);

router.route('/get-teacher-by-email')
    .get(TeacherController.getTeacherByEmail);

router.route('/change-password')
    .put(Authorize.protectedAPI, TeacherController.changePassword);

router.route('/forgot-password')
    .post(TeacherController.forgotPassword);

router.route('/reset-password/:resetToken')
    .put(TeacherController.resetPassword);

router.route('/upload-avatar/:teacherId')
    .post(Authorize.protectedAPI, Photo.upload, TeacherController.uploadAvatar);

module.exports = router;

export {}