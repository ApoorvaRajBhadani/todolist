const Sequelize = require('sequelize');
const db = require('../config/database');

const Todo = db.define('todo',{
  desc: {
    type: Sequelize.STRING
  }
});

module.exports = Todo;
