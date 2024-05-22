const Sequelize = require('sequelize');
const sequelize = new Sequelize('user_management', 'admin', '0974222365', {
  host: 'hcmut-thesis.cfsee8gs2fxd.ap-southeast-1.rds.amazonaws.com',
  dialect: 'mysql',
});

const connect = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

module.exports = { sequelize, connect }
