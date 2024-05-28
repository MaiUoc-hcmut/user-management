
const { sequelize } = require('../../config/db');
import { Model, DataTypes } from 'sequelize';
const Category = require('./category');

class Teacher extends Model {
  declare id: number;
  declare name: string;
}

Teacher.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isEmail: true,
      }
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(10),
      validate: {
        len: [10, 10],
      }
    },
    address: DataTypes.STRING,
    avatar: DataTypes.STRING,
    gender: DataTypes.STRING(10),
    biostory: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
    degree: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // experience: {
    //   type: DataTypes.TEXT
    // },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    total_review: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
      allowNull: false,
    },
    average_rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      allowNull: false,
    },
    total_registration: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
      allowNull: false,
    },
    // bank_name: {
    //   type: DataTypes.STRING,
    // },
    // bank_account: {
    //   type: DataTypes.STRING
    // },
    resetToken: {
      type: DataTypes.STRING
    },
    resetTokenExpire: {
      type: DataTypes.DATE
    },
    createdAt: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.TIME,
      allowNull: false,
    },
  },
  {
    tableName: 'teacher',
    sequelize,
  },
);

Teacher.belongsToMany(Category, { through: 'category-teacher', foreignKey: 'id_teacher', otherKey: 'id_category' });
Category.belongsToMany(Teacher, { through: 'category-teacher', foreignKey: 'id_category', otherKey: 'id_teacher' });

module.exports = Teacher
