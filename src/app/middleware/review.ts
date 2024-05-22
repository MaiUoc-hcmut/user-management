const Teacher = require('../models/teacher');
const Review = require('../models/review');

import { Request, Response, NextFunction } from "express";
const createError = require('http-errors');

require('dotenv').config();


class CheckingReview {
    checkCreateReview = async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const body = req.body.data;

            if (!body.id_teacher) {
                let error = "You must choose exam to review!";
                return next(createError.BadRequest(error));
            }
            
            const teacher = await Teacher.findByPk(body.id_teacher);
            if (!teacher) {
                let e = "Teacher does not exist!";
                return next(createError.BadRequest(e));
            }
           
            next();
        } catch (error: any) {
            console.log(error.message);
            next(createError.InternalServerError(error.message));
        }
    }

    checkDeleteReview = async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const id_user = req.student.id;
            const id_review = req.params.reviewId;

            const review = await Review.findByPk(id_review);

            if (id_user !== review.id_student) {
                let error = "You do not have permission to delete this review!"
                return next(createError.Unauthorized(error));
            }
            next();
        } catch (error: any) {
            console.log(error.message);
            next(createError.InternalServerError(error.message));
        }
    }
}

module.exports = new CheckingReview();