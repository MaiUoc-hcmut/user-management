const Review = require('../models/review');

const Photo = require('../../config/firebase/photo');
const { firebaseConfig } = require('../../config/firebase/firebase');
const admin = require('firebase-admin');
const { ref, getDownloadURL, uploadBytesResumable, getStorage } = require('firebase/storage');
const { initializeApp } = require('firebase/app');

const Teacher = require('../models/teacher');
const Category = require('../models/category');
const ParentCategory = require('../models/par_category');
const createError = require('http-errors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SignToken = require('../../utils/jwt');
const transporter = require('../../utils/sendEmail');

const axios = require('axios');
require('dotenv').config();

initializeApp(firebaseConfig);
const storage = getStorage();

import { Request, Response, NextFunction } from 'express';

const { sequelize } = require('../../config/db/index');

const { Op } = require('sequelize');

declare global {
  namespace Express {
    interface Request {
      teacher?: any;
      student?: any;
      admin?: any;
      // user?: USER;
      getAll?: boolean;
      authority?: number;
    }
  }

  // type USER = {
  //     user?: any,
  //     role?: string,
  // }
}

class TeacherController {

  getAllTeacher = async (req: Request, res: Response, _next: NextFunction) => {
    try {
      const categories = [];

      const { subject } = req.query;

      if (!subject) {

      } else if (Array.isArray(subject)) {
        categories.push(...subject)
      } else {
        categories.push(subject)
      }

      enum SortQuery {
        Rating = 'rating',
        Registration = 'registration'
      }
      enum SortOrder {
        ASC = 'asc',
        DESC = 'desc'
      }

      const sortFactor = {
        [SortQuery.Rating]: 'average_rating',
        [SortQuery.Registration]: 'total_registration'
      }
      const orderFactor = {
        [SortOrder.ASC]: 'asc',
        [SortOrder.DESC]: 'desc',
      }


      const sortQuery = req.query.sort as SortQuery;
      const orderSort = req.query.order as SortOrder;

      let defaultQuery = 'average_rating';
      let defaultOrder = 'desc';

      if (typeof sortQuery === "string" && Object.values(SortQuery).includes(sortQuery)) {
        defaultQuery = sortFactor[sortQuery as SortQuery];
      }
      if (typeof orderSort === "string" && Object.values(SortOrder).includes(orderSort)) {
        defaultOrder = orderFactor[orderSort as SortOrder];
      }

      const currentPage = +req.params.page;
      const pageSize = parseInt(process.env.SIZE_OF_PAGE || '10');

      const queryOption: any = {
        include: [
          {
            model: Category,
            through: {
              attributes: [],
            },
          },
        ]
      }

      if (categories.length > 0) {
        queryOption.include[0].where = {
          id: {
            [Op.or]: categories,
          },
        }
      }

      const count = await Teacher.findAll({
        ...queryOption,
        attributes: ['id'],
        distinct: true
      });

      const teachers = await Teacher.findAll({
        ...queryOption,
        order: [[defaultQuery, defaultOrder]],
        limit: pageSize,
        offset: pageSize * (currentPage - 1),
        subQuery: false
      });

      const response = [];

      for (const teacher of teachers) {
        const courseServiceInformation = await axios.get(`${process.env.BASE_URL_COURSE_LOCAL}/informations/teacher/${teacher.id}`);
        const examServiceInformation = await axios.get(`${process.env.BASE_URL_EXAM_LOCAL}/informations/teacher/${teacher.id}`);

        const teacher_category = await Teacher.findOne({
          where: { id: teacher.id },
          include: [
            {
              model: Category,
              attributes: ['id', 'id_par_category', 'name'],
              through: {
                attributes: []
              }
            }
          ]
        })

        for (const category of teacher_category.Categories) {
          const parCategory = await ParentCategory.findByPk(category.id_par_category);
          category.dataValues[`${parCategory.name}`] = category.name;
          delete category.dataValues.name;
          delete category.dataValues.id_par_category;
        }
        teacher.dataValues.Categories = teacher_category.dataValues.Categories;

        response.push({
          ...teacher.dataValues,
          ...courseServiceInformation.data,
          ...examServiceInformation.data
        });
      }

      res.status(200).json({
        count: count.length,
        teachers: response
      });
    } catch (error: any) {
      console.log(error.message);
      res.status(500).json({
        error,
        message: error.message
      });
    }
  }

  getTeacherById = async (req: Request, res: Response, _next: NextFunction) => {
    try {
      const id_teacher = req.params.teacherId;
      const teacher = await Teacher.findByPk(id_teacher, {
        include: [{
          model: Category,
          attributes: ['id', 'id_par_category', 'name'],
          through: {
            attributes: []
          }
        }]
      });

      if (!teacher) return res.status(404).json({ message: "Teacher not found!" });

      for (const category of teacher.Categories) {
        const parCategory = await ParentCategory.findByPk(category.id_par_category);
        teacher.dataValues[`${parCategory.name}`] = category.id;
      }
      delete teacher.dataValues.Categories;

      res.status(200).json(teacher);
    } catch (error: any) {
      console.log(error.message);
      res.status(400).json(error.message);
    }
  }

  getProfileTeacher = async (req: Request, res: Response, _next: NextFunction) => {
    try {
      const id_teacher = req.params.teacherId;
      const teacher = await Teacher.findByPk(id_teacher, {
        include: [{
          model: Category,
          attributes: ['id', 'id_par_category', 'name'],
          through: {
            attributes: []
          }
        }]
      });

      if (!teacher) return res.status(404).json({ message: "Teacher not found!" });

      const headers = {
        'Authorization': req.headers.authorization
      };

      const courseServiceInformation = await axios.get(`${process.env.BASE_URL_COURSE_LOCAL}/informations/teacher/${id_teacher}`, {
        headers
      });
      const examServiceInformation = await axios.get(`${process.env.BASE_URL_EXAM_LOCAL}/informations/teacher/${id_teacher}`);

      for (const category of teacher.Categories) {
        const parCategory = await ParentCategory.findByPk(category.id_par_category);
        teacher.dataValues[`${parCategory.name}`] = category.name;
      }
      delete teacher.dataValues.Categories;

      const response = {
        ...teacher.dataValues,
        ...courseServiceInformation.data,
        ...examServiceInformation.data
      }

      res.status(200).json(response);
    } catch (error: any) {
      console.log(error.message);
      res.status(400).json(error.message);
    }
  }

  getTeacherByEmail = async (req: Request, res: Response, _next: NextFunction) => {
    try {
      const teacher = await Teacher.findOne({
        where: { email: req.body.email }
      })

      if (!teacher) return res.status(404).json({ message: "Teacher not found!" });

      res.status(200).json(teacher);
    } catch (error: any) {
      console.log(error.message);
      res.status(400).json(error.message);
    }
  }

  updateTeacher = async (req: Request, res: Response, _next: NextFunction) => {
    const t = await sequelize.transaction();
    try {
      const body = req.body.data;
      
      const { categories, ...teacherBody } = body;

      const teacher = await Teacher.findByPk(req.params.teacherId);

      const categoryInstances: any[] = [];
      for (const categoryId of categories) {
        const category = await Category.findByPk(categoryId);
        categoryInstances.push(category);
      }

      await teacher.setCategories(categoryInstances, { transaction: t });
      await teacher.update({
        ...teacherBody
      }, {
        transaction: t
      });

      await t.commit();

      res.status(200).json({
        teacher
      });
    } catch (error: any) {
      console.log(error.message);
      await t.rollback();
      res.status(500).json({
        error,
        message: error.message
      });
    }
  }

  uploadAvatar = async (req: Request, res: Response, _next: NextFunction) => {
    try {
      const file = req.file;
      let downloadURL = "";
      if (file) {
        const teacherId = req.params.teacherId;
        if (req.teacher.dataValues.id !== teacherId) return res.status(401).json(createError.Unauthorized('You do not have permission to do this action!'));
        const teacher = await Teacher.findOne({
          where: {
            id: teacherId
          }
        })

        if (!teacher) return res.status(404).json(createError.NotFound("teacher doesn't exist"));

        const dateTime = Photo.giveCurrentDateTime();

        const storageRef = ref(storage, `files/${file.originalname + "       " + dateTime}`);

        // Create file metadata including the content type
        const metadata = {
          contentType: file.mimetype,
        };

        // Upload the file in the bucket storage
        const snapshot = await uploadBytesResumable(storageRef, file.buffer, metadata);
        //by using uploadBytesResumable we can control the progress of uploading like pause, resume, cancel

        // Grab the public url
        const downloadURL = await getDownloadURL(snapshot.ref);

        await teacher.update({
          avatar: downloadURL
        });
      }


      res.status(200).json({
        avatar: downloadURL
      })

    } catch (error: any) {
      console.log(error.message);
      res.json(error.message);
    }
  }

  changePassword = async (req: Request, res: Response, _next: NextFunction) => {
    const t = await sequelize.transaction();
    try {
      const { oldPassword, newPassword, confirmPassword } = req.body.data;
      if (!oldPassword) return res.status(400).json({ message: "You must provide old password!" });
      if (newPassword !== confirmPassword) return res.status(400).json({ message: 'Your new password does not match!' });

      const teacher = req.teacher;

      const verifyPassword = await bcrypt.compare(oldPassword, teacher.password);
      if (verifyPassword) {
        const hashPassword = await bcrypt.hash(newPassword, 12);
        await teacher.update({ password: hashPassword }, { transaction: t });
      } else {
        return res.status(400).send("wrong old password");
      }

      await t.commit();

      res.status(200).json({
        message: "Password updated!",
        teacher
      })

    } catch (error: any) {
      console.log(error.message);
    }
  }

  forgotPassword = async (req: Request, res: Response, _next: NextFunction) => {
    // 1. Find teacher
    const teacher = await Teacher.findOne({
      where: { email: req.body.email }
    })

    if (!teacher) return res.status(404).json({ message: "Teacher not found!" });

    // 2. Generate reset token and store to database
    const resetToken = SignToken.generateResetToken();
    await teacher.update({
      resetToken,
      resetTokenExpire: Date.now() + 900000
    })

    // 3. Send the link to reset the password to user's email
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/teacher/reset-password/${resetToken}`;

    const message = `<p>Nhập mật khẩu mới và xác nhận mật khẩu tại đường dẫn sau: ${resetURL}\n</p>`;

    try {
      await transporter.sendMail({
        from: 'Study365 system',
        to: teacher.email,
        subject: 'LINK TO RESET PASSWORD',
        html: message
      })

      res.status(200).json({
        resetToken
      })
    } catch (error: any) {
      console.log(error.message);
      teacher.resetToken = undefined;
      teacher.resetTokenExpire = undefined;
    }
  }

  resetPassword = async (req: Request, res: Response, _next: NextFunction) => {
    try {
      const teacher = Teacher.findOne({
        where: {
          resetToken: req.params.resetToken,
          resetTokenExpire: { $gt: Date.now() }
        }
      });

      if (!teacher) return res.status(400).json({ error: "Invalid or expired reset token!" });

      teacher.password = await bcrypt.hash(req.body.password, 12);
      teacher.resetToken = undefined;
      teacher.resetTokenExpire = undefined;

      const accessToken = SignToken.signAccessToken(teacher.id);
      const refreshToken = SignToken.signRefreshToken(teacher.id);

      res.status(200).json({
        accessToken,
        refreshToken,
        teacher
      })
    } catch (error: any) {
      console.log(error.message);
    }
  }

}

module.exports = new TeacherController();