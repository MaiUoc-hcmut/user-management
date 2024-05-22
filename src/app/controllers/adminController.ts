const Admin = require('../models/admin');

import { Request, Response, NextFunction } from 'express';


class AdminController {

    // [GET] /admin/:adminId
    getAdmin = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const id_admin = req.params.adminId;
            const admin = await Admin.findByPk(id_admin);

            if (!admin) {
                return res.status(404).json({
                    message: "Admin does not exist!"
                });
            }

            res.status(200).json(admin);
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({
                error,
                message: error.message
            });
        }
    }
}


module.exports = new AdminController();