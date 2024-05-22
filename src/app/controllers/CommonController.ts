const Student = require('../models/student');
const Teacher = require('../models/teacher');


import { Request, Response, NextFunction } from 'express';

const { Op } = require('sequelize');
const { sequelize } = require('../../config/db/index');

const axios = require('axios');


class CommonController {

    // [GET] /commons/search?query=
    searchUser = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const { query } = req.query;

            const result: any[] = [];

            const headers = {
                'Authorization': req.headers.authorization
            }

            const groups = await axios.get(`${process.env.BASE_URL_CHAT_LOCAL}/groups/list`, { headers });

            const students = await Student.findAll({
                where: {
                    email: {
                        [Op.like]: `%${query}%`
                    }
                },
                attributes: ['id', 'email', 'name', 'avatar']
            });

            for (const student of students) {
                student.dataValues.role = "student";
                for (const group of groups.data.student) {
                    if (group.members.includes(student.id)) {
                        student.dataValues.id_group = group.id;
                    } else {
                        student.dataValues.id_group = null;
                    }
                }
            }

            const teachers = await Teacher.findAll({
                where: {
                    email: {
                        [Op.like]: sequelize.fn('lower', `%${query}%`)
                    }
                },
                attributes: ['id', 'email', 'name', 'avatar']
            });

            for (const teacher of teachers) {
                teacher.dataValues.role = "teacher";
                for (const group of groups.data.student) {
                    if (group.members.includes(teacher.id)) {
                        teacher.dataValues.id_group = group.id;
                    } else {
                        teacher.dataValues.id_group = null;
                    }
                }
            }

            result.push(...students);
            result.push(...teachers);

            res.status(200).json(result);
        } catch (error: any) {
            console.log(error.message);
            // res.status(500).json({
            //     message: error.message,
            //     error
            // })
        }
    }
}


module.exports = new CommonController();