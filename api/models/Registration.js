const SeekersLayer = require('./database_layer/Seekers');
const EmployerLayer = require('./database_layer/Employer');
const EmployerAndServiceProviderLayer = require('./database_layer/EmployerAndServiceProvider');
const PartnerLayer = require('./database_layer/Partner');
const PartnerContactsLayer = require('./database_layer/PartnerContacts');
const EmployerContactsLayer = require('./database_layer/EmployerContacts');
const AdminDetailsLayer = require('./database_layer/AdminDetails');
const UserStateLayer = require('./database_layer/UserState');
const UserAccountLayer = require('./database_layer/UserAccount');
const ServiceProviderLayer = require('./database_layer/ServiceProvider');

const UserAccountModel = require('../models/UserAccount');
const i2talentModel = require('../models/i2talent');

const sequelize = require('../../config/database');
let bcryptService = require('../services/bcrypt.service');

let DateHelper = require('../../helpers/DateHelper');
let DateObj = new DateHelper();

const Registration = () => {
    // Save Job seeker, Employer and service provider data

    const saveData = async (reqData) => {

        let mobileNumber = reqData.mobile;
        let mobleExists = await checkMobileExists(mobileNumber);
        let isEmailsExists = [];
        if (reqData.email) {
            isEmailsExists = await UserAccountModel().checkEmailExists(reqData.email, 0);
        }
        if (mobleExists.recordExists == 0 && isEmailsExists.length == 0) {
            let userAccountData = await UserAccountModel().saveData(reqData);
            let userId = userAccountData.uacc_id;
            let roleId = reqData.role;
            let first_name = reqData.first_name;
            let last_name = reqData.last_name;

            let partnerId = reqData.partner_id;
            let accountStatus = reqData.account_status;
            let currentDate = new Date();
            let yearOnly = currentDate.getFullYear();
            let registrationData = {
                first_name: first_name,
                last_name: last_name,
                role_id: roleId,
                users_id: userId
            };

            if (!partnerId) {
                partnerId = 0;
            }
            let createdBy = 0;
            switch (parseInt(roleId)) {
                case 4:
                    
                    if(reqData.created_by==0){
                        createdBy = userId;
                    } else{
                        createdBy = reqData.created_by;
                    }
                    let employerData = {
                        users_id: userId,
                        first_name: first_name,
                        last_name: last_name,
                        mobile: mobileNumber,
                        password: reqData.password,
                        status: accountStatus,
                        verify_email: 1,
                        created_by: createdBy,
                        created_at: DateObj.getCurrentTimeStamp()
                    }
                    if (reqData.email) {
                        employerData['email'] = reqData.email;
                        employerData['verify_email'] = 0;
                    }
                    employerResponse = await EmployerLayer.create(employerData);
                    registrationData['id'] = employerResponse.id;
                    registrationData['account_status'] = accountStatus;
                    registrationData['i2talent_user_id'] = 0;
                    break;
                case 5:
                    if(reqData.created_by==0){
                        createdBy = userId;
                    } else{
                        createdBy = reqData.created_by;
                    }
                    let seekerData = {
                        users_id: userId,
                        first_name: first_name,
                        last_name: last_name,
                        mobile: mobileNumber,
                        folder_name: yearOnly,
                        verify_email: 1,
                        status: 1,
                        sms_notification: 1,
                        alert_account_msg: 1,
                        alert_service_provider_msg: 1,
                        alert_employer_msg: 1,
                        alert_job_msg: 1,
                        user_type: 0,
                        created_by: createdBy,
                        create_date: DateObj.getCurrentTimeStamp()
                    }

                    seekerData['partner_id'] = partnerId;
                    if (reqData.email) {
                        seekerData['email'] = reqData.email;
                        seekerData['verify_email'] = 0;
                    }

                    seekerResponse = await SeekersLayer.create(seekerData);
                    let seekerDetailsI2talent = {
                        first_name: first_name,
                        last_name: last_name,
                        mobile: mobileNumber,
                        users_id: seekerResponse.users_id,
                        created_by: createdBy
                    };

                    let i2talentUserData = await i2talentModel().checkAndSaveI2talentUser(seekerDetailsI2talent);
                    i2talent_user_id = i2talentUserData.dataValues.UserID;

                    registrationData['id'] = seekerResponse.id;
                    registrationData['account_status'] = 1;
                    registrationData['i2talent_user_id'] = i2talentUserData.dataValues.UserID;
                    break;
                case 8:

                    if(reqData.created_by==0){
                        createdBy = userId;
                    } else{
                        createdBy = reqData.created_by;
                    }

                    let serviceProviderData = {
                        users_id: userId,
                        first_name: first_name,
                        last_name: last_name,
                        mobile: mobileNumber,
                        password: reqData.password,
                        verify_email: 1,
                        status: accountStatus,
                        created_by: createdBy,
                        created_at: DateObj.getCurrentTimeStamp()
                    }
                    if (reqData.email) {
                        serviceProviderData['email'] = reqData.email;
                        serviceProviderData['verify_email'] = 0;
                    }
                    
                    serviceProviderResponse = await ServiceProviderLayer.create(serviceProviderData);
                    registrationData['id'] = serviceProviderResponse.id;
                    registrationData['account_status'] = accountStatus;
                    registrationData['i2talent_user_id'] = 0;
                    break;
            }
            registrationData['partner_id'] = partnerId;
            registrationData['user_exists'] = 0;
            registrationData['email_exists'] = 0;
            return registrationData;
        } else {
            if (mobleExists.recordExists > 0 && isEmailsExists.length > 0) {
                return { user_exists: 1, email_exists: 1 };
            } else if (mobleExists.recordExists > 0) {
                return { user_exists: 1, email_exists: 0 };
            } else if (isEmailsExists.length > 0) {
                return { user_exists: 0, email_exists: 1 };
            }
        }
    }

    // Function to check user exists or not
    const checkMobileExists = async (mobile) => {
        let querySeekerList = await SeekersLayer.findAll({
            attributes: [
                'id',
                'users_id',
                'first_name',
                'last_name',
                'partner_id',
                'status',
                'mobile'
            ],
            where: {
                mobile: mobile
            }
        });

        // let queryEmployerServiceProviderList = await EmployerAndServiceProviderLayer.findAll({
        //     attributes: [
        //         'id',
        //         ['user_id', 'users_id'],
        //         'first_name',
        //         'last_name',
        //         'status'
        //     ],
        //     where: {
        //         mobile: mobile,
        //         is_old_record: 0
        //     }
        // });

        let queryEmployerList = await EmployerLayer.findAll({
            attributes: [
                'id',
                'users_id',
                'first_name',
                'last_name',
                'status'
            ],
            where: {
                mobile: mobile,
                is_delete: 0
            }
        });

        let queryPartnerList = await PartnerLayer.findAll({
            attributes: [
                'id',
                'users_id',
                'status',
                'first_name',
                'last_name',
            ],
            where: {
                contact_phone: mobile
            }
        });

        let queryPartnerContactsList = await PartnerContactsLayer.findAll({
            attributes: [
                'id',
                'users_id',
                'partner_user_id',
                'first_name',
                'last_name',
                'status'
            ],
            where: {
                contact_phone: mobile,
                isdelete: 0
            }
        });

        let queryEmployerContactsList = await EmployerContactsLayer.findAll({
            attributes: [
                'id',
                'users_id',
                'status'
            ],
            where: {
                contact_phone: mobile,
                isdelete: 0
            }
        });

        let queryServiceProviderList = await ServiceProviderLayer.findAll({
            attributes: [
                'id',
                'users_id',
                'first_name',
                'last_name',
                'status'
            ],
            where: {
                mobile: mobile,
                is_delete: 0
            }
        });

        let queryAdminList = await AdminDetailsLayer.findAll({
            attributes: [
                'id',
                'users_id',
                'first_name',
                'last_name',
                'status'
            ],
            where: {
                mobile: mobile
            }
        });

        let recordExists = 0;

        if (querySeekerList.length > 0 || queryEmployerList.length > 0 || queryPartnerList.length > 0 ||
            queryPartnerContactsList.length > 0 || queryEmployerContactsList.length > 0 || queryServiceProviderList.length > 0 || queryAdminList.length > 0) {
            recordExists = 1;
        }
        let response = {
            recordExists: recordExists,
            seeker: querySeekerList,
            employer: queryEmployerList,
            partner: queryPartnerList,
            partnerContacts: queryPartnerContactsList,
            employerContacts: queryEmployerContactsList,
            serviceProvider: queryServiceProviderList,
            admin: queryAdminList,
        }
        return response;
    }

    // Function to check user exists or not for forgot password
    const checkUserForForgotPass = async (reqData) => {
        let userId = 0;
        let querySeekerData = await SeekersLayer.findAll({
            attributes: [
                'users_id'
            ],
            where: {
                first_name: reqData.first_name,
                last_name: reqData.last_name,
                mobile: reqData.mobile,
                status: 1
            }
        });
        if (querySeekerData.length > 0) {
            userId = querySeekerData[0].users_id;
        } else {
            let queryPartnerData = await PartnerLayer.findAll({
                attributes: [
                    'users_id'
                ],
                where: {
                    first_name: reqData.first_name,
                    last_name: reqData.last_name,
                    contact_phone: reqData.mobile,
                    status: 1
                }
            });
            if (queryPartnerData.length > 0) {
                userId = queryPartnerData[0].users_id;
            } else {
                let queryEmployerData = await EmployerLayer.findAll({
                    attributes: [
                        'users_id'
                    ],
                    where: {
                        first_name: reqData.first_name,
                        last_name: reqData.last_name,
                        mobile: reqData.mobile,
                        is_delete: 0,
                        status: 1
                    }
                });
                if (queryEmployerData.length > 0) {
                    userId = queryEmployerData[0].users_id;
                } else {
                    let queryPartnerContactsData = await PartnerContactsLayer.findAll({
                        attributes: [
                            'users_id'
                        ],
                        where: {
                            first_name: reqData.first_name,
                            last_name: reqData.last_name,
                            contact_phone: reqData.mobile,
                            status: 1,
                            isdelete: 0
                        }
                    });
                    if (queryPartnerContactsData.length > 0) {
                        userId = queryPartnerContactsData[0].users_id;
                    } else {
                        let queryEmployerContactsData = await EmployerContactsLayer.findAll({
                            attributes: [
                                'users_id'
                            ],
                            where: {
                                first_name: reqData.first_name,
                                last_name: reqData.last_name,
                                contact_phone: reqData.mobile,
                                status: 1,
                                isdelete: 0
                            }
                        });
                        if (queryEmployerContactsData.length > 0) {
                            userId = queryEmployerContactsData[0].users_id;
                        }
                    }
                }
            }
        }
        return { user_id: userId };
    }

    // Function to update password
    const updatePassword = async (userData) => {
        let userId = userData.user_id;
        let roleId = userData.role_id;
        let password = userData.password;
        let passwordData = bcryptService().password(password);
        let hashPassword = passwordData.hashPassword;
        let salt = passwordData.salt;
        let updateAccountData = {
            uacc_password: hashPassword,
            uacc_salt: salt
        }
        updateAccountDetails = await UserAccountLayer.update(updateAccountData, {
            where: {
                uacc_id: userId
            }
        });

        switch (roleId) {
            case 9:
                let partnerPasswordUpdate = {
                    password: password
                }
                updatePartnerPassword = await PartnerLayer.update(partnerPasswordUpdate, {
                    where: {
                        users_id: userId
                    }
                });
                break;
            case 11:
                let partnerConPasswordUpdate = {
                    password: password,
                    update_date: DateObj.getCurrentTimeStamp()
                }
                updatePartnerConPassword = await PartnerContactsLayer.update(partnerConPasswordUpdate, {
                    where: {
                        users_id: userId
                    }
                });
                break;
            case 12:
                let employerConPasswordUpdate = {
                    password: password,
                    update_date: DateObj.getCurrentTimeStamp()
                }
                updateEmployerConPassword = await EmployerContactsLayer.update(employerConPasswordUpdate, {
                    where: {
                        users_id: userId
                    }
                });
                break;
        }
        return updateAccountDetails;
    }

    return {
        saveData,
        checkMobileExists,
        checkUserForForgotPass,
        updatePassword
    }
};

module.exports = Registration;