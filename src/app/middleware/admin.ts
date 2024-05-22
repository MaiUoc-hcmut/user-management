const passport = require('passport');
const passportAdmin = passport;
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const Admin = require('../models/admin');
const createError = require('http-errors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

import { Request, Response, NextFunction } from "express";

declare global {
    namespace Express {
        interface Request {
            admin?: any;
        }
    }
}

// to authorize user using jwt
const jwtConfig = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken('Authorization'),
    secretOrKey: process.env.ACCESS_TOKEN_SECRET,
};
passportAdmin.use(
    'admin-jwt',
    new JWTStrategy(jwtConfig, async (payload: any, done: any) => {
        try {
            console.log(payload);
            const admin = await Admin.findOne({
                where: { id: payload.id }
            });
            if (!admin) {
                done(new Error('User not found!'), false);
            }
            // success case
            return done(null, admin);
        } catch (err) {
            done(err, false);
        }
    })
);

// middleware verify access token
exports.protectedAPI = (req: Request, res: Response, next: NextFunction) => {
    passportAdmin.authenticate('admin-jwt', { session: false }, (err: any, admin: any) => {
        if (err || !admin) {
            return next(createError.Unauthorized(err?.message ? err : "User is not authorized"));
        } else {
            req.admin = admin;
            next();
        }
    })(req, res, next);
};


// to authenticate user with username and password
const localAdminConfig = {
    usernameField: 'email',
    passwordField: 'password',
};
passportAdmin.use(
    'admin-local',
    new LocalStrategy(localAdminConfig, async (email: string, password: string, done: any) => {
        try {
            if (!email || !password) {
                done(createError.BadRequest('Email and password are required'));
            }

            const admin = await Admin.findOne({
                where: { email: email },
                attribute: ['name', 'email']
            })
            if (!admin) done(createError.Unauthorized("Invalid email!"));

            const isValidPassword = await bcrypt.compare(password, admin.password);
            if (!isValidPassword) done(createError.Unauthorized("Wrong password!"));
            done(null, admin);
        } catch (err) {
            done(err, false);
        }
    })
);


exports.loginAuth = (req: Request, res: Response, next: NextFunction) => {
    passportAdmin.authenticate('admin-local', { session: false, failureMessage: true }, (err: any, admin: any) => {
        if (err || !admin) {
            if (err) console.log(err);
            return next(createError.BadRequest(err?.message ? err : "Login failed"));
        } else {
            delete admin.password;
            delete admin.createdAt;
            delete admin.updatedAt;
            req.admin = admin;
            next();
        }
    })(req, res, next);
}
