const Sequelize = require('sequelize');
const sequelize = require('../../../config/database');

const tableName = 'tbl_roles';

const Roles = sequelize.define('Roles', {
  RoleID: {
    type: Sequelize.INTEGER(10), 
    primaryKey: true,
    autoIncrement: true
  },
  RoleName: {
    type: Sequelize.STRING(100)
  },
}, {
  tableName,
  timestamps: false
});

module.exports = Roles;