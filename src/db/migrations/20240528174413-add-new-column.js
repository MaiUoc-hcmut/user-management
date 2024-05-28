'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('student', 'resetToken', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('student', 'resetTokenExpire', {
      type: Sequelize.DATE
    });
    await queryInterface.addColumn('teacher', 'resetToken', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('teacher', 'resetTokenExpire', {
      type: Sequelize.DATE
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('teacher', 'resetTokenExpire');
    await queryInterface.removeColumn('teacher', 'resetToken');
    await queryInterface.removeColumn('student', 'resetTokenExpire');
    await queryInterface.removeColumn('student', 'resetToken');
  }
};
