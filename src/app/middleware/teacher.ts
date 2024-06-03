const Teacher = require('../models/teacher');

import { Request, Response, NextFunction } from "express";
const createError = require('http-errors');

require('dotenv').config();


class CheckingTeacher {
    checkUpdateTeacher = async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const id_teacher = req.params.teacherId;
            const id_user = req.teacher.id;
            const teacher = Teacher.findByPk(id_teacher);
            if (!teacher) return next(createError.NotFound("This teacher does not exist"));

            if (id_user !== id_teacher) {
                let error = "You do not have permission to do this action!";
                return next(createError.Unauthorized(error));
            }
            next();
        } catch (error: any) {
            console.log(error.message);
            next(createError.InternalServerError(error.message));
        }
    }
}


module.exports = new CheckingTeacher();