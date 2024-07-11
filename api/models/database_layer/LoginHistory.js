const Sequelize = require('sequelize');
const sequelize = require('../../../config/database');

const tableName = 'tbl_login_history';

const LoginHistory = sequelize.define('LoginHistory', {
    id: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true
    },
    users_id: {
        type: Sequelize.INTEGER(11)
    },
    role_id: {
        type: Sequelize.INTEGER(11)
    },
    login_type: {
        type: Sequelize.TINYINT
    },
    created_at: {
        type: 'TIMESTAMP',
    }
}, {
    tableName,
    timestamps: false
});

module.exports = LoginHistory;