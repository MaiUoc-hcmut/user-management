'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('student', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      phone: Sequelize.STRING(20),
      address: Sequelize.STRING,
      avatar: Sequelize.STRING,
      gender: Sequelize.STRING(10),
      grade: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdAt: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.TIME,
        allowNull: false,
      },
    });
    await queryInterface.createTable('teacher', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      phone: Sequelize.STRING(20),
      address: Sequelize.STRING,
      avatar: Sequelize.STRING,
      gender: Sequelize.STRING(10),
      biostory: {
        type: Sequelize.STRING(1000),
        allowNull: false,
      },
      degree: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      total_review: {
        type: Sequelize.INTEGER.UNSIGNED
      },
      average_rating: {
        type: Sequelize.FLOAT
      },
      total_registration: {
        type: Sequelize.INTEGER.UNSIGNED
      },
      createdAt: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.TIME,
        allowNull: false,
      },
    });
    await queryInterface.createTable('admin', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdAt: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.TIME,
        allowNull: false,
      },
    });
    await queryInterface.createTable('par_category', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING(20),
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
    await queryInterface.createTable('category', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      id_par_category: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'par_category',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING(30),
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
    await queryInterface.createTable('category-teacher', {
      id_teacher: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'teacher',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      id_category: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'category',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
    await queryInterface.createTable('review', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
      },
      id_student: {
        type: Sequelize.UUID,
        references: {
          model: 'student',
          key: 'id',
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      id_teacher: {
        type: Sequelize.UUID,
        references: {
          model: 'teacher',
          key: 'id',
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      content: {
        type: Sequelize.STRING(1000)
      },
      image: {
        type: Sequelize.TEXT
      },
      rating: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('review');
    await queryInterface.dropTable('category-teacher');
    await queryInterface.dropTable('category');
    await queryInterface.dropTable('par_category');
    await queryInterface.dropTable('student');
    await queryInterface.dropTable('teacher');
    await queryInterface.dropTable('admin');
  },
};
