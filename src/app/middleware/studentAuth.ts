const passport = require('passport');
const passportStudent = passport;
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const Student = require('../models/student');
const createError = require('http-errors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

import { Request, Response, NextFunction } from "express";

declare global {
    namespace Express {
        interface Request {
            student?: any;
        }
    }
}

// to authorize user using jwt
const jwtConfig = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken('Authorization'),
    secretOrKey: process.env.ACCESS_TOKEN_SECRET,
};
passportStudent.use(
    'student-jwt',
    new JWTStrategy(jwtConfig, async (payload: any, done: any) => {
        try {
            console.log(payload);
            const student = await Student.findOne({
                where: { id: payload.id }
            });
            if (!student) {
                done(new Error('User not found!'), false);
            }
            // success case
            return done(null, student);
        } catch (err) {
            done(err, false);
        }
    })
);

// middleware verify access token
exports.protectedAPI = (req: Request, res: Response, next: NextFunction) => {
    passportStudent.authenticate('student-jwt', { session: false }, (err: any, student: any) => {
        if (err || !student) {
            return next(createError.Unauthorized(err?.message ? err : "User is not authorized"));
        } else {
            req.student = student;
            next();
        }
    })(req, res, next);
};

exports.verifyStudent = (req: Request, res: Response, next: NextFunction) => {
    passportStudent.authenticate('student-jwt', { session: false }, (err: any, student: any) => {
        if (err || !student) {
            return next()
        } else {
            req.student = student;
            next();
        }
    })(req, res, next);
}


// to authenticate user with username and password
const localStudentConfig = {
    usernameField: 'email',
    passwordField: 'password',
};
passportStudent.use(
    'student-local',
    new LocalStrategy(localStudentConfig, async (email: string, password: string, done: any) => {
        try {
            if (!email || !password) {
                done(createError.BadRequest('Email and password are required'));
            }

            const student = await Student.findOne({
                where: { email: email },
                attribute: ['name', 'email']
            })
            if (!student) done(createError.Unauthorized("Invalid email!"));

            const isValidPassword = await bcrypt.compare(password, student.password);
            if (!isValidPassword) done(createError.Unauthorized("Wrong password!"));
            // console.log(student);
            done(null, student);
        } catch (err) {
            done(err, false);
        }
    })
);


exports.loginAuth = (req: Request, res: Response, next: NextFunction) => {
    passportStudent.authenticate('student-local', { session: false, failureMessage: true }, (err: any, student: any) => {
        if (err || !student) {
            if (err) console.log(err);
            return next(createError.BadRequest(err?.message ? err : "Login failed"));
        } else {
            delete student.password;
            delete student.createdAt;
            delete student.updatedAt;
            req.student = student;
            next();
        }
    })(req, res, next);
}
