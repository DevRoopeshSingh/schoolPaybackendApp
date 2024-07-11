const Sequelize = require('sequelize');
const sequelize = require('../../../config/database');

const tableName = 'tbl_i2talent_user_address';

const UserAddress = sequelize.define('UserAddress', {
    UserAddressID: {
        type: Sequelize.INTEGER(11), 
        primaryKey: true,
        autoIncrement: true
    },
    UserID: {
        type: Sequelize.INTEGER(11)
    },
    Country: {
        type: Sequelize.INTEGER(11),
    },
    State: {
        type: Sequelize.INTEGER(11),
    },
    City: {
        type: Sequelize.INTEGER(11),
    },
    ZipCode: {
        type: Sequelize.STRING(45)
    },
    Address: {
        type: Sequelize.TEXT()
    },
    LivesIn: {
        type: Sequelize.STRING(45)
    }
}, {
    tableName,
    timestamps: false
});

module.exports = UserAddress;