const Sequelize = require('sequelize');
const sequelize = require('../../../config/database');

const tableName = 'tbl_employer_new';

const Employer = sequelize.define('Employer', {
    id: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true
    },
    users_id: {
        type: Sequelize.INTEGER(11)
    },
    first_name: {
        type: Sequelize.STRING
    },
    last_name: {
        type: Sequelize.STRING
    },
    mobile: {
        type: Sequelize.STRING
    },
    password: {
        type: Sequelize.STRING
    },
    email: {
        type: Sequelize.STRING
    },
    verify_email: {
        type: Sequelize.TINYINT
    },
    status: {
        type: Sequelize.TINYINT
    },
    is_delete: {
        type: Sequelize.TINYINT
    },
    created_by: {
        type: Sequelize.INTEGER(11)
    },
    updated_by: {
        type: Sequelize.INTEGER(11)
    },
    created_at: {
        type: 'TIMESTAMP',
    },
    updated_at: {
        type: 'TIMESTAMP',
    }
}, {
    tableName,
    timestamps: false
});

module.exports = Employer;