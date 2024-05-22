const express = require('express');
const router = express.Router();
const reviewController = require("../controllers/ReviewController");
const Authorize = require('../middleware/studentAuth');
const CheckingReview = require('../middleware/review');
const FileUpload = require('../../config/firebase/fileUpload');

router.route('/')
    .get(reviewController.getAllReviews)
    .post(
        Authorize.protectedAPI, 
        CheckingReview.checkCreateReview, 
        FileUpload.uploadImage,
        reviewController.uploadReviewImage,
        reviewController.createReview
    );

router.route('/:reviewId')
    .get(reviewController.getReviewById)
    .delete(
        Authorize.protectedAPI,
        CheckingReview.checkDeleteReview,
        reviewController.deleteReview
    );

router.route('/student/:studentId/page/:page')
    .get(reviewController.getReviewsBelongToStudent);

router.route('/teacher/:teacherId/page/:page')
    .get(reviewController.getReviewsForTeacher);

module.exports = router;

export {}