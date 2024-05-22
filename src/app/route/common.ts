const express = require('express');
const router = express.Router();
const CommonController = require('../controllers/CommonController');
const StudentAuth = require('../middleware/studentAuth');
const TeacherAuth = require('../middleware/teacherAuth');

router.route('/search')
    .get(
        // StudentAuth.verifyStudent,
        // TeacherAuth.verifyTeacher,
        CommonController.searchUser
    );


module.exports = router;


export {}