const passport = require('passport');
const passportTeacher = passport;
const JWTStrategy = require('passport-jwt').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const { ExtractJwt } = require('passport-jwt');
const dotenv = require('dotenv').config();
const bcrypt = require('bcryptjs');
const createError = require('http-errors');
const Teacher = require('../models/teacher');

import { Request, Response, NextFunction } from "express";



declare global {
    namespace Express {
        interface Request {
            teacher?: any;
        }
    }
}

// to authorize user using jwt
const jwtConfig = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken('Authorization'),
    secretOrKey: process.env.ACCESS_TOKEN_SECRET,
};
passportTeacher.use(
    'teacher-jwt',
    new JWTStrategy(jwtConfig, async (payload: any, done: any) => {
        try {
            const teacher = await Teacher.findOne({
                where: { id: payload.id }
            });
            if (!teacher) {
                done(new Error('User not found!'), false);
            }
            // success case
            return done(null, teacher);
        } catch (err) {
            done(err, false);
        }
    })
);


// middleware verify access token
exports.protectedAPI = (req: Request, res: Response, next: NextFunction) => {
    passportTeacher.authenticate('teacher-jwt', { session: false }, (err: any, teacher: any) => {
        if (err || !teacher) {
            return next(createError.Unauthorized(err?.message ? err : "User is not authorized"));
        } else {
            req.teacher = teacher;
            next();
        }
    })(req, res, next);
};

exports.verifyTeacher = (req: Request, res: Response, next: NextFunction) => {
    passportTeacher.authenticate('teacher-jwt', { session: false }, (err: any, teacher: any) => {
        if (req.student) {
            return next();
        }
        else if (err || !teacher) {
            return next(createError.Unauthorized("Token is invalid!"))
        } else {
            req.teacher = teacher;
            next();
        }
    })(req, res, next);
}



// to authenticate user with username and password
const localTeacherConfig = {
    usernameField: 'email',
    passwordField: 'password',
};
passportTeacher.use(
    'teacher-local',
    new LocalStrategy(localTeacherConfig, async (email: string, password: string, done: any) => {
        try {
            if (!email || !password) {
                done(createError.BadRequest('Email and password are required'));
            }

            const teacher = await Teacher.findOne({
                where: { email: email },
                attribute: ['name', 'email']
            })
            if (!teacher) done(createError.Unauthorized("Invalid email!"));

            const isValidPassword = await bcrypt.compare(password, teacher.password);
            if (!isValidPassword) done(createError.Unauthorized("Wrong password!"));
            // console.log(student);
            done(null, teacher);
        } catch (err) {
            done(err, false);
        }
    })
);


exports.loginAuth = (req: Request, res: Response, next: NextFunction) => {
    passportTeacher.authenticate('teacher-local', { session: false, failureMessage: true }, (err: any, teacher: any) => {
        if (err || !teacher) {
            return next(createError.BadRequest(err?.message ? err : "Login failed"));
        } else {
            req.teacher = teacher;
            next();
        }
    })(req, res, next);
}