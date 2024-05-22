const Student = require('../models/student');
const Teacher = require('../models/teacher');
const Admin = require('../models/admin');
const Category = require('../models/category');
const createError = require('http-errors');
const SignToken = require('../../utils/jwt');
const bcrypt = require('bcryptjs');

const axios = require('axios');

import { Request, Response, NextFunction } from 'express';

const { sequelize } = require('../../config/db/index');

declare global {
  namespace Express {
    interface Request {
      student?: any;
      teacher?: any;
      admin?: any;
    }
  }
}

class Auth {
  registerStudent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, confirmPassword, name, grade, gender, address } = req.body;
      if (!name || !email || !password || !confirmPassword) {
        return res.status(400).send("Information missed!");
      }
      const existedStudent = await Student.findOne({
        where: { email: email }
      });
      if (existedStudent) return res.send(createError.Conflict("The email already exist!"));
      if (password !== confirmPassword) return res.send(createError.BadRequest("Password does not match!"));
      const hashPassword = await bcrypt.hash(password, 12);
      const newStudent = await Student.create({
        email,
        password: hashPassword,
        name,
        grade,
        gender,
        address
      })

      const accessToken = SignToken.signAccessToken(newStudent.id);
      const refreshToken = SignToken.signRefreshToken(newStudent.id);

      const cart = await axios.post(`${process.env.BASE_URL_PAYMENT_LOCAL}/cart`, {
        id_user: newStudent.id
      });

      res.status(201).send({
        student: newStudent,
        accessToken,
        refreshToken
      })

    } catch (error: any) {
      if (error?.code === 11000) {
        return next(createError.BadRequest('Email already exists'));
      }
      console.log(error.message)
      return next(createError.InternalServerError('Server error'));
    }
  }

  registerTeacher = async (req: Request, res: Response, next: NextFunction) => {
    const t = await sequelize.transaction();
    try {
      const { name, email, password, confirmPassword, gender, address, subjects, phone } = req.body;
      if (!name || !email || !password || !confirmPassword) {
        return res.status(400).send("Information missed!");
      }
      const existedTeacher = await Teacher.findOne({
        where: { email: email }
      });
      if (existedTeacher) return res.send(createError.Conflict("The email already exist!"));
      if (password !== confirmPassword) return res.send(createError.BadRequest("Password does not match!"));
      const hashPassword = await bcrypt.hash(password, 12);

      const subjectIntances: any[] = [];

      for (const subject of subjects) {
        const subjectIntance = await Category.findByPk(subject);
        if (subjectIntance) subjectIntances.push(subjectIntance);
      }
      const newTeacher = await Teacher.create({
        email,
        password: hashPassword,
        name,
        gender,
        address,
        phone,
        biostory: '',
        degree: 'bachelor'
      }, {
        transaction: t
      });

      await newTeacher.addCategories(subjectIntances, {
        transaction: t
      });

      const accessToken = SignToken.signAccessToken(newTeacher.id);
      const refreshToken = SignToken.signRefreshToken(newTeacher.id);

      await t.commit();

      res.status(201).send({
        teacher: newTeacher,
        accessToken,
        refreshToken
      });

    } catch (error: any) {
      await t.rollback();
      if (error?.code === 11000) {
        return next(createError.BadRequest('Email already exists'));
      }
      console.log(error.message)
      return next(createError.InternalServerError('Server error'));
    }
  }

  registerAdmin = async (req: Request, res: Response, _next: NextFunction) => {
    try {
      const { email, name, password, confirmPassword } = req.body.data;

      const existedAdmin = await Admin.findOne({
        where: {
          email
        }
      });
      if (existedAdmin) {
        let error = "This email already exist!";
        res.send(createError.Conflict(error));
      }

      if (password !== confirmPassword) {
        res.status(400).json({
          message: "Password and confirm password does not match!"
        });
      }

      const hashPassword = await bcrypt.hash(password, 12);
      const admin = await Admin.create({
        email,
        name,
        password: hashPassword
      });

      res.status(201).json(admin);
    } catch (error: any) {
      console.log(error.message);
      res.status(500).json({
        error,
        message: error.message
      });
    }
  }

  loginStudent = async (req: Request, res: Response, _next: NextFunction) => {
    try {
      const accessToken = SignToken.signAccessToken(req.student.id);
      const refreshToken = SignToken.signRefreshToken(req.student.id);

      const student = req.student.dataValues;
      const user = {
        ...student,
        role: "student"
      }

      res.status(200).json({
        success: true,
        accessToken,
        refreshToken,
        user
      });
    } catch (error: any) {
      console.log(error?.message);
      res.status(500).json({
        error,
        message: error.message
      });
    }
  }

  loginTeacher = async (req: Request, res: Response, _next: NextFunction) => {
    try {
      const accessToken = SignToken.signAccessToken(req.teacher.id);
      const refreshToken = SignToken.signRefreshToken(req.teacher.id);

      const teacher = req.teacher.dataValues;
      const user = {
        ...teacher,
        role: "teacher"
      }

      res.status(200).json({
        success: true,
        accessToken,
        refreshToken,
        user
      });
    } catch (error: any) {
      console.log(error?.message);
      res.status(500).json({
        error,
        message: error.message
      });
    }
  }

  loginAdmin = async (req: Request, res: Response, _next: NextFunction) => {
    try {
      const accessToken = SignToken.signAccessToken(req.admin.id);
      const refreshToken = SignToken.signRefreshToken(req.admin.id);

      const admin = req.admin.dataValues;
      const user = {
        ...admin,
        role: "admin"
      }

      res.status(200).json({
        success: true,
        accessToken,
        refreshToken,
        user
      });
    } catch (error: any) {
      console.log(error?.message);
      res.status(500).json({
        error,
        message: error.message
      });
    }
  }

  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { parsedRefreshToken } = req.body;
      if (!parsedRefreshToken) return next(createError.BadRequest('Refresh token are required'));
      const id = await SignToken.verifyRefreshToken(parsedRefreshToken);
      const accessToken = SignToken.signAccessToken(id);
      const refToken = SignToken.signRefreshToken(id);
      res.status(200).json({
        success: true,
        accessToken,
        refreshToken: refToken,
      });
    } catch (error: any) {
      console.log(error.message);
    }
  }
}

module.exports = new Auth();