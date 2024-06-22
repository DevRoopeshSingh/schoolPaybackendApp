const UserAccountLayer = require('./database_layer/UserAccount');
const SeekersLayer = require('./database_layer/Seekers');
const EmployerLayer = require('./database_layer/Employer');
const PartnerLayer = require('./database_layer/Partner');
const PartnerContactLayer = require('./database_layer/PartnerContacts');
const EmployerContactsLayer = require('./database_layer/EmployerContacts');
const AdminDetailsLayer = require('./database_layer/AdminDetails');
const ServiceProviderLayer = require('./database_layer/ServiceProvider');

const sequelizeOperators = require('sequelize').Op;
let bcryptService = require('../services/bcrypt.service');

const CommonModel = () => {
    // When update Seeker, Employer, Service provider, Partner
    const checkMobileExists = async (mobile, userType, userId) => {
        let whereConditionSeeker = {
            mobile: mobile
        };
        // let whereConditionEmployerAndService = {
        //     mobile: mobile,
        //     is_old_record: 0
        // };
        let whereConditionEmployer = {
            mobile: mobile,
            is_delete: 0
        };
        let whereConditionPartner = {
            contact_phone: mobile
        };
        let whereConditionPartnerContact = {
            contact_phone: mobile
        };
        let whereConditionEmployerContact = {
            contact_phone: mobile
        };
        let whereConditionServiceProvider = {
            mobile: mobile
        };

        if (userType == 'Seeker') {
            whereConditionSeeker['users_id'] = { [sequelizeOperators.ne]: userId };
        } else if (userType == 'Employer') {
            whereConditionEmployer['users_id'] = { [sequelizeOperators.ne]: userId };
        } else if (userType == 'Partner') {
            whereConditionPartner['users_id'] = { [sequelizeOperators.ne]: userId };
        } else if (userType == 'Partner') {
            whereConditionPartner['users_id'] = { [sequelizeOperators.ne]: userId };
        } else if (userType == 'Partner Contact') {
            whereConditionPartnerContact['users_id'] = { [sequelizeOperators.ne]: userId };
            whereConditionPartnerContact['isdelete'] = { [sequelizeOperators.ne]: 1 };
        } else if (userType == 'Employer Contact') {
            whereConditionEmployerContact['users_id'] = { [sequelizeOperators.ne]: userId };
            whereConditionEmployerContact['isdelete'] = { [sequelizeOperators.ne]: 1 };
        } else if (userType == 'Service Provider') {
            whereConditionServiceProvider['users_id'] = { [sequelizeOperators.ne]: userId };
            whereConditionServiceProvider['is_delete'] = { [sequelizeOperators.ne]: 1 };
        }

        let querySeekerList = await SeekersLayer.findAll({
            attributes: [
                'id'
            ],
            where: whereConditionSeeker
        });

        // let queryEmployerServiceProviderList = await EmployerAndServiceProviderLayer.findAll({
        //     attributes: [
        //         'id',
        //     ],
        //     where: whereConditionEmployerAndService
        // });

        let queryEmployerList = await EmployerLayer.findAll({
            attributes: [
                'id',
            ],
            where: whereConditionEmployer
        });

        let queryPartnerList = await PartnerLayer.findAll({
            attributes: [
                'id'
            ],
            where: whereConditionPartner
        });

        let queryPartnerContactList = await PartnerContactLayer.findAll({
            attributes: [
                'id'
            ],
            where: whereConditionPartnerContact
        });

        let queryEmployerContactList = await EmployerContactsLayer.findAll({
            attributes: [
                'id'
            ],
            where: whereConditionEmployerContact
        });

        let queryServiceProviderList = await ServiceProviderLayer.findAll({
            attributes: [
                'id'
            ],
            where: whereConditionServiceProvider
        });

        let queryAdminList = await AdminDetailsLayer.findAll({
            attributes: [
                'id'
            ],
            where: {
                mobile: mobile
            }
        });

        let recordExists = 0;
        if (querySeekerList.length > 0 || queryEmployerList.length > 0 || queryPartnerList.length > 0 ||
            queryPartnerContactList.length > 0 || queryEmployerContactList.length > 0 || queryServiceProviderList.length > 0 || queryAdminList.length > 0) {
            recordExists = 1;
        }
        let response = {
            recordExists: recordExists
        }
        return response;
    }

    const updatePasswordByUserId = async (password, userId, ipAddress) => {
        let passwordData = bcryptService().password(password);
        let hashPassword = passwordData.hashPassword;
        let salt = passwordData.salt;
        let updatedData = {
            uacc_password: hashPassword,
            uacc_salt: salt,
            uacc_ip_address: ipAddress
        };

        updatePasswordRes = await UserAccountLayer.update(updatedData, {
            where: {
                uacc_id: userId
            }
        });

        return updatePasswordRes;
    }

    return {
        checkMobileExists,
        updatePasswordByUserId
    }
};

module.exports = CommonModel;