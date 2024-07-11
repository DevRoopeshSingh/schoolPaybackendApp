const UserAccountLayer = require('./database_layer/UserAccount');
const sequelize = require('../../config/database');
const sequelizeOperators  = require('sequelize').Op;
let DateHelper = require('../../helpers/DateHelper');
let bcryptService = require('../services/bcrypt.service');

let DateObj = new DateHelper();

const UserAccount = () => {

    const saveData = async (reqData) => {
        let ipAddress = reqData.ip_address;
        let password = reqData.password;
        let role = reqData.role;
        let passwordData = bcryptService().password(password);
        let hashPassword = passwordData.hashPassword;
        let salt = passwordData.salt;

        let saveDataJson = {
            uacc_group_fk: role,
            uacc_password: hashPassword,
            uacc_ip_address: ipAddress,
            uacc_salt: salt,
            uacc_active: 1,
            uacc_date_added: DateObj.getCurrentTimeStamp()
        };

        if (reqData.email) {
            saveDataJson['uacc_email'] = reqData.email;
        }

        let saveAccountData = await UserAccountLayer.create(saveDataJson);
        return saveAccountData;
    }

    // Function to update password and email only
    const updatePassEmail = async (reqData) => {
        let ipAddress = reqData.ip_address;
        let password = reqData.password;
        let userId = reqData.user_id;

        let passwordData = bcryptService().password(password);
        let hashPassword = passwordData.hashPassword;
        let salt = passwordData.salt;
        let updateDataJson = {
            uacc_password: hashPassword,
            uacc_email: reqData.email,
            uacc_ip_address: ipAddress,
            uacc_salt: salt,
        };

        let updateAccountData = await UserAccountLayer.update(updateDataJson, {
            where: {
                uacc_id: userId
            }
        });
        return updateAccountData;
    }

    const getAccountDetailsByUserId = async (userId) => {
        let queryAccountDetails = await UserAccountLayer.findAll({
            attributes: [
                ['uacc_id', 'uacc_id'],
                ['uacc_group_fk', 'uacc_group_fk'],
                ['uacc_password', 'uacc_password'],
                ['uacc_salt', 'uacc_salt'],
                ['uacc_active', 'status']
            ],
            where: {
                uacc_id: userId
            }
        });
        return queryAccountDetails;
    }

    // Function to check email exists or not
    const checkEmailExists = async (email, userId = 0) => {
        let whereCondition = {
            uacc_email: email,
            uacc_active: 1
        };
        if (userId > 0) {
            whereCondition['uacc_id'] = { [sequelizeOperators.ne]: userId };
        }
        let queryAccountDetails = await UserAccountLayer.findAll({
            attributes: [
                ['uacc_id', 'uacc_id']
            ],
            where: whereCondition
        });

        return queryAccountDetails;
    }

    // Function to deactive account status
    const deactiveMainAccount = async (userId) => {
        let updatedData = {
            uacc_active: 0
        }
        updateAccountDetails = await UserAccountLayer.update(updatedData,{
            where: {
                uacc_id: userId
            }
        });
        return updateAccountDetails;
    }

    return {
        saveData,
        updatePassEmail,
        getAccountDetailsByUserId,
        checkEmailExists,
        deactiveMainAccount
    }
};

module.exports = UserAccount;