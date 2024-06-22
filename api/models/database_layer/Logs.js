const Sequelize = require('sequelize');
const sequelize = require('../../../config/database');

const tableName = 'tbl_logs';

const Logs = sequelize.define('Logs', {
  LogID: {
    type: Sequelize.INTEGER(10), 
    primaryKey: true,
    autoIncrement: true
  },
  UserID: {
    type: Sequelize.INTEGER(10)
  },
  Action: {
    type: Sequelize.INTEGER(10)
  },
  OldData:{
    type: Sequelize.JSON
  },
  CreatedAt:{
    type: 'TIMESTAMP',
  }
}, {
  tableName,
  timestamps: false
});

module.exports = Logs;