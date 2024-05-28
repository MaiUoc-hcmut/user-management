
const { sequelize } = require('../../config/db');
import { Model, DataTypes, UUIDV4 } from 'sequelize';

class Student extends Model {
  declare id: number;
  declare name: string;
}

Student.init(
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
    grade: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 10,
        max: 12,
      },
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
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
    tableName: 'student',
    sequelize,
  },
);

module.exports = Student

// import { Sequelize, Model, DataTypes, CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';

// const db = require('../../config/db');
// const sequelize: Sequelize = db.sequelize

// interface StudentModel extends Model<InferAttributes<StudentModel>, InferCreationAttributes<StudentModel>> {
//   id: CreationOptional<number>;
//   email: string;
//   password: string;
//   name: string | null;
//   phone: string | null;
//   address: string | null;
//   avatar: string | null;
//   gender: string | null;
//   grade: number;
//   status: boolean;
//   createdAt: string;
//   updatedAt: string;
// }


// const StudentModel = sequelize.define<StudentModel>('Student', {
//   id: {
//     type: DataTypes.INTEGER.UNSIGNED,
//     autoIncrement: true,
//     primaryKey: true,
//   },
//   email: {
//     type: DataTypes.STRING(50),
//     allowNull: false,
//     // validate: {
//     //   isEmail: true,
//     //   msg: 'Email not valid'
//     // }
//   },
//   password: {
//     type: DataTypes.STRING(100),
//     allowNull: false,
//   },
//   name: {
//     type: DataTypes.STRING(50),
//     allowNull: false,
//   },
//   phone: {
//     type: DataTypes.STRING(20),
//     validate: {
//       len: [10, 10],
//       msg: "The phone number must have a length of 10"
//     }
//   },
//   address: DataTypes.STRING,
//   avatar: DataTypes.STRING,
//   gender: DataTypes.STRING(10),
//   grade: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     // validate: {
//     //   min: 10,
//     //   max: 12,
//     //   msg: "Grade must be between 10 and 12"
//     // },
//   },
//   status: {
//     type: DataTypes.BOOLEAN,
//     allowNull: false,
//     defaultValue: true,
//   },
//   createdAt: {
//     type: DataTypes.TIME,
//     allowNull: false,
//   },
//   updatedAt: {
//     type: DataTypes.TIME,
//     allowNull: false,
//   },
// });


// const test = async () => {
//   const newUser = StudentModel.create({
//     email: 'j',
//     password: 'c',
//     name: 'd',
//     grade: 10,
//     status: true,
//     createdAt: '1',
//     updatedAt: '2'
//   })
//   // const user = await Student.findByPk(2)
//   // console.log(user.id, user.email);
// }

// test()

// module.exports = StudentModel