const Sequelize = require('sequelize');
const sequelize = require('../../../config/database');

const tableName = 'tbl_employer_details';

const EmployerDetails = sequelize.define('EmployerDetails', {
    id: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: Sequelize.INTEGER(11)
    },
    org_name: {
        type: Sequelize.STRING
    },
    sector_id: {
        type: Sequelize.INTEGER(11)
    },
    state_id: {
        type: Sequelize.INTEGER(11)
    },
    skillset_id: {
        type: Sequelize.STRING
    },
    disability_and_inclusion_id: {
        type: Sequelize.STRING
    },
    relevant_to_employer_id: {
        type: Sequelize.STRING
    },
    address: {
        type: Sequelize.STRING
    },
    profile_description: {
        type: Sequelize.STRING
    },
    accessibility_profiling: {
        type: Sequelize.STRING
    },
    inclusion_policy: {
        type: Sequelize.TINYINT
    },
    enhancements: {
        type: Sequelize.TINYINT
    },
    implementation: {
        type: Sequelize.TINYINT
    },
    inclusion_training: {
        type: Sequelize.TINYINT
    },
    support_lc: {
        type: Sequelize.TINYINT
    },
    interested_lc: {
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

module.exports = EmployerDetails;