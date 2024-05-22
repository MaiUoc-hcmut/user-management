const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const crypto = require('crypto');
const dotenv = require('dotenv').config();

class SignToken {
    signAccessToken = (id) => {
        return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
        });
    }

    signRefreshToken = (id) => {
        return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
        });
    }

    verifyRefreshToken = (token) => {
        return new Promise((resolve, reject) => {
            jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
                if (err) {
                    return reject(createError.Unauthorized('Wrong token'));
                }
                resolve(decoded.id);
            });
        });
    }

    generateResetToken = () => {
        return crypto.randomBytes(32).toString('hex');
    }
}

module.exports = new SignToken();