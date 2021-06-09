const Sequelize = require('sequelize');
require('dotenv').config();
module.exports = new Sequelize('todo_db',process.env.POSTGRES_USER,process.env.POSTGRES_PASS,{
  host: 'localhost',
  dialect: 'postgres',
  operatorsAliases: false,

  pool:{
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});
