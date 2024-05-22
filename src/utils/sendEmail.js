const nodemailer = require('nodemailer');
const dotenv = require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST_TEST,
    port: process.env.EMAIL_PORT_TEST,
    auth: {
        user: process.env.EMAIL_USERNAME_TEST,
        pass: process.env.EMAIL_PASSWORD_TEST
    },
    tls: {
        rejectUnauthorized: false
    }
})

module.exports = transporter;

