const Sequelize = require('sequelize');
const sequelize = require('../../../config/database');

const tableName = 'tbl_i2talent_users';

const User = sequelize.define('User', {
  UserID: {
    type: Sequelize.INTEGER(10), 
    primaryKey: true,
    autoIncrement: true
  },
  FirstName: {
    type: Sequelize.STRING
  },
  LastName: {
    type: Sequelize.STRING
  },
  Mobile: {
    type: Sequelize.STRING
  },
  RoleID: {
    type: Sequelize.TINYINT
  },
  TenantID: {
    type: Sequelize.TINYINT
  },
  PartnerID: {
    type: Sequelize.STRING
  },
  CreatedBy:{
    type: Sequelize.INTEGER(10),
  },
  CreatedAt:{
    type: 'TIMESTAMP',
  },
  UpdatedAt:{
      type: 'TIMESTAMP',
  }
  
}, {
  tableName,
  timestamps: false
});

module.exports = User;