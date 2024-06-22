const Sequelize = require('sequelize');
const sequelize = require('../../../config/database');

const tableName = 'tbl_i2talent_user_details';

const UserDetails = sequelize.define('UserDetails', {
    UserDetailsID: {
        type: Sequelize.INTEGER(10), 
        primaryKey: true,
        autoIncrement: true
    },
    UserID: {
        type: Sequelize.INTEGER(10)
    },
    Gender: {
        type: Sequelize.ENUM,
        values: ['1', '2', '3', '4']
    },
    DateOfBirth: {
        type: Sequelize.DATEONLY
    },
    Age:{
        type: Sequelize.TINYINT(4)
    },
    AltMobile: {
        type: Sequelize.STRING(10)
    },
    ContactPerson: {
        type: Sequelize.STRING(100)
    },
    ContactPreference: {
        type: Sequelize.STRING(45)
    },
    ProfileCreateBy: {
        type: Sequelize.ENUM,
        values: ['1', '2']
    },
    Email: {
        type: Sequelize.STRING(200)
    },
    DisabilityID: {
        type: Sequelize.STRING
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

module.exports = UserDetails;