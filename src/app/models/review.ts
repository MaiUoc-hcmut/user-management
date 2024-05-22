const { sequelize } = require('../../config/db');
import { Model, DataTypes } from 'sequelize';

const Teacher = require('./teacher');
const Student = require('./student');

class Review extends Model {}

Review.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        id_student: {
            type: DataTypes.UUID,
            allowNull: false
        },
        id_teacher: DataTypes.UUID,
        content: DataTypes.STRING(1000),
        image: DataTypes.STRING(255),
        rating: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    }, {
        tableName: 'review',
        freezeTableName: true,
        sequelize
    }
);

Review.belongsTo(Teacher, {
    foreignKey: 'id_teacher'
});

Teacher.hasMany(Review, {
    foreignKey: 'id_teacher',
    as: 'ratings'
});

Review.belongsTo(Student, {
    foreignKey: 'id_student'
});

Student.hasMany(Review, {
    foreignKey: 'id_student',
    as: 'ratings'
});
module.exports = Review;