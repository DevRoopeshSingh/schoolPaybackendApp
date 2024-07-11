const Sequelize = require('sequelize');
const sequelize = require('../../../config/database');

const tableName = 'tbl_user_accounts';

const UserAccount = sequelize.define('UserAccount', {
    uacc_id: {
        type: Sequelize.INTEGER(10),
        primaryKey: true,
        autoIncrement: true
    },
    uacc_group_fk: {
        type: Sequelize.INTEGER(10)
    },
    uacc_email: {
        type: Sequelize.STRING
    },
    uacc_username: {
        type: Sequelize.STRING
    },
    uacc_password: {
        type: Sequelize.STRING
    },
    uacc_ip_address: {
        type: Sequelize.STRING
    },
    uacc_salt: {
        type: Sequelize.STRING
    },
    uacc_active: {
        type: Sequelize.TINYINT
    },
    uacc_date_added: {
        type: 'TIMESTAMP',
    }

}, {
    tableName,
    timestamps: false
});

module.exports = UserAccount;