const Photo = require('../../config/firebase/photo');
const { firebaseConfig } = require('../../config/firebase/firebase');
const admin = require('firebase-admin');
const { ref, getDownloadURL, uploadBytesResumable, getStorage } = require('firebase/storage');
const { initializeApp } = require('firebase/app');

const Student = require('../models/student');
const createError = require('http-errors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SignToken = require('../../utils/jwt');
const transporter = require('../../utils/sendEmail');

import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';

const { sequelize } = require('../../config/db/index');

initializeApp(firebaseConfig);
const storage = getStorage();


class StudentController {
    getAllStudent = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const categories = [];

            const { class: _class } = req.query;

            if (!_class) {

            } else if (Array.isArray(_class)) {
                categories.push(..._class)
            } else {
                categories.push(_class)
            }

            const currentPage = +req.params.page;
            const pageSize = 20;

            const count = await Student.count({
                where: {
                    grade: {
                        [Op.or]: categories
                    }
                }
            });


            const students = await Student.findAll({
                where: {
                    grade: {
                        [Op.or]: categories
                    }
                },
                limit: pageSize,
                offset: pageSize * (currentPage - 1)
            });
            res.status(200).json({
                count,
                students
            });
        } catch (error: any) {
            console.log(error.message);
            res.status(400).json({ error: error.message });
        }
    }

    getStudentById = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const student = await Student.findOne({
                where: { id: req.params.studentId }
            })

            if (!student) return res.status(404).json({ message: "Student not found!" });

            res.status(200).json(student);
        } catch (error: any) {
            console.log(error.message);
            res.status(400).json(error.message);
        }
    }

    getStudentByEmail = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const student = await Student.findOne({
                where: { email: req.body.email }
            })

            if (!student) return res.status(404).json({ message: "Student not found!" });

            res.status(200).json(student);
        } catch (error: any) {
            console.log(error.message);
            res.status(400).json(error.message);
        }
    }

    updateStudent = async (req: Request, res: Response, _next: NextFunction) => {
        const t = await sequelize.transaction();
        try {
            const studentId = req.params.studentId;

            if (studentId != req.student.dataValues.id)
                return res.status(401).json({ message: "You do not have permission to do this action!" });

            const student = await Student.findOne({
                where: { id: studentId }
            });

            await student.update({
                ...req.body.data
            }, {
                transaction: t
            });
            await t.commit();
            res.status(200).send({
                updated: true,
                student
            });
        } catch (error: any) {
            await t.rollback()
            console.log(error.message);
            res.status(500).json({
                error,
                message: error.message
            });
        }
    }

    uploadAvatar = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const studentId = req.params.studentId;
            if (req.student.dataValues.id != studentId) 
                return res.status(401).json(createError.Unauthorized('You do not have permission to do this action!'));
            const student = await Student.findOne({
                where: {
                    id: studentId
                }
            })

            if (!student) return res.status(404).json(createError.NotFound("Student doesn't exist"));
            let avatar = student.avatar;

            const dateTime = Photo.giveCurrentDateTime();

            const file = req.file;

            if (file) {
                const storageRef = ref(storage, `avatars/${file.originalname + "       " + dateTime}`);

                // Create file metadata including the content type
                const metadata = {
                    contentType: file.mimetype,
                };

                // Upload the file in the bucket storage
                const snapshot = await uploadBytesResumable(storageRef, file.buffer, metadata);
                //by using uploadBytesResumable we can control the progress of uploading like pause, resume, cancel

                // Grab the public url
                const downloadURL = await getDownloadURL(snapshot.ref);
                avatar = downloadURL
            }

            await student.update({
                avatar
            })

            res.status(200).json(student)
            
        } catch (error: any) {
            console.log(error.message);
            res.json(error.message);
        }
    }

    changePassword = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const { oldPassword, newPassword, confirmPassword } = req.body.data;
            if (!oldPassword) return res.status(400).json({ message: "You must provide old password!" });
            if (newPassword !== confirmPassword) return res.status(400).json({ message: 'Your new password does not match!' });

            const student = req.student;

            const verifyPassword = await bcrypt.compare(oldPassword, student.password);
            if (verifyPassword) {
                const hashPassword = await bcrypt.hash(newPassword, 12);
                await student.update({ password: hashPassword });
              } else {
                return res.status(400).send("wrong old password");
              }

            res.status(200).json({
                message: "Password updated!",
                student
            });

        } catch (error: any) {
            console.log(error.message);
        }
    }

    forgotPassword = async (req: Request, res: Response, _next: NextFunction) => {
        // 1. Find student
        const student = await Student.findOne({
            where: { email: req.body.email }
        })

        if (!student) return res.status(404).json({ message: "Student not found!" });

        // 2. Generate reset token and store to database
        const resetToken = SignToken.generateResetToken();
        await student.update({
            resetToken,
            resetTokenExpire: Date.now() + 900000
        })

        // 3. Send the link to reset the password to user's email
        const resetURL = `${req.protocol}://${req.get(
            'host'
        )}/api/v1/student/reset-password/${resetToken}`;
    
        const message = `<p>Quên mật khẩu của bạn? Nhập mật khẩu mới và xác nhận mật khẩu tại đường dẫn sau: ${resetURL}\n</p>`;

        try {
            await transporter.sendMail({
                from: 'Study365 system',
                to: student.email,
                subject: 'LINK TO RESET PASSWORD',
                html: message
            })

            res.status(200).json({
                resetToken
            })  
        } catch (error: any) {
            console.log(error.message);
            student.resetToken = undefined;
            student.resetTokenExpire = undefined;
        }
    }

    resetPassword = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const student = Student.findOne({
                where: {
                    resetToken: req.params.resetToken,
                    resetTokenExpire: { $gt: Date.now() }
                }
            });
    
            if (!student) return res.status(400).json({ error: "Invalid or expired reset token!" });
    
            student.password = await bcrypt.hash(req.body.password, 12);
            student.resetToken = undefined;
            student.resetTokenExpire = undefined;
    
            const accessToken = SignToken.signAccessToken(student.id);
            const refreshToken = SignToken.signRefreshToken(student.id);
    
            res.status(200).json({
                accessToken,
                refreshToken,
                student
            })
        } catch (error: any) {
            console.log(error.message);
        }
    }

}

module.exports = new StudentController();