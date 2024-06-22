let UserAccountModel = require('../models/UserAccount');
let i2talentModel = require('../models/i2talent');
let RegistrationModel = require('../models/Registration');
let LoginHistoryModel = require('../models/LoginHistory');
let bcryptService = require('../services/bcrypt.service');
const authService = require('../services/auth.service');
const SendOtp = require('sendotp');
const msg91SendOtp = new SendOtp('276393Ahs2EKDPDoH05cd922a5');

const LoginController = () => {

    const loginWithPassword = async (req, res) => {
        let mobile = req.body.mobile;
        let password = req.body.password;

        let userId;
        let i2talent_user_id = 0;
        let firstName = "", lastName = "", status = "", partnerId = 0; id = 0;

        let userResponse = await RegistrationModel().checkMobileExists(mobile);
        let response = {};

        if (userResponse.recordExists > 0) {
            if (userResponse.seeker.length > 0) {
                userResponse.seeker[0]['created_by'] = userResponse.seeker[0].users_id;
                let i2talentUserData = await i2talentModel().checkAndSaveI2talentUser(userResponse.seeker[0]);
                i2talent_user_id = i2talentUserData.dataValues.UserID;
                id = userResponse.seeker[0].id;
                userId = userResponse.seeker[0].users_id;
                firstName = userResponse.seeker[0].first_name;
                lastName = userResponse.seeker[0].last_name;
                partnerId = userResponse.seeker[0].partner_id;
                status = userResponse.seeker[0].status;
            } else if (userResponse.employer.length > 0) {
                id = userResponse.employer[0].id;
                userId = userResponse.employer[0].users_id;
                firstName = userResponse.employer[0].first_name;
                lastName = userResponse.employer[0].last_name;
                status = userResponse.employer[0].status;
            } else if (userResponse.partner.length > 0) {
                id = userResponse.partner[0].id;
                partnerId = userResponse.partner[0].id;
                userId = userResponse.partner[0].users_id;
                status = userResponse.partner[0].status;
                firstName = userResponse.partner[0].first_name;
            } else if (userResponse.partnerContacts.length > 0) {
                id = userResponse.partnerContacts[0].id;
                userId = userResponse.partnerContacts[0].users_id;
                firstName = userResponse.partnerContacts[0].first_name;
                lastName = userResponse.partnerContacts[0].last_name;
                status = userResponse.partnerContacts[0].status;
            } else if (userResponse.admin.length > 0) {
                id = userResponse.admin[0].id;
                userId = userResponse.admin[0].users_id;
                firstName = userResponse.admin[0].first_name;
                lastName = userResponse.admin[0].last_name;
                status = userResponse.admin[0].status;
            } else if (userResponse.employerContacts.length > 0) {
                id = userResponse.employerContacts[0].id;
                userId = userResponse.employerContacts[0].users_id;
                firstName = userResponse.employerContacts[0].first_name;
                lastName = userResponse.employerContacts[0].last_name;
                status = userResponse.employerContacts[0].status;
            } else if (userResponse.serviceProvider.length > 0) {
                id = userResponse.serviceProvider[0].id;
                userId = userResponse.serviceProvider[0].users_id;
                firstName = userResponse.serviceProvider[0].first_name;
                lastName = userResponse.serviceProvider[0].last_name;
                status = userResponse.serviceProvider[0].status;
            }

            let userAccountDetails = await UserAccountModel().getAccountDetailsByUserId(userId);
            let hashPassword, salt;
            if (userAccountDetails.length > 0) {
                hashPassword = userAccountDetails[0].uacc_password;
                salt = userAccountDetails[0].uacc_salt;
                try {
                    let generateHashPassword = await bcryptService().generateHashPassword(password, salt);
                    if (generateHashPassword === hashPassword) {

                        const loginData = {
                            users_id: userId,
                            role_id: userAccountDetails[0].uacc_group_fk,
                            login_type: 1
                        };
                        let loginDetails = await LoginHistoryModel().saveLoginData(loginData);

                        //Jwt token
                        const userData = {
                            first_name: firstName,
                            last_name: lastName,
                            id: id,
                            users_id: userId,
                            partner_id: partnerId,
                            i2talent_user_id: i2talent_user_id,
                            role_id: userAccountDetails[0].uacc_group_fk,
                            account_status: status,
                            user_exists: 1
                        };
                        const token = authService().issue(userData);

                        response = {
                            first_name: firstName,
                            last_name: lastName,
                            role_id: userAccountDetails[0].uacc_group_fk,
                            users_id: userId,
                            id: id,
                            partner_id: partnerId,
                            account_status: status,
                            user_exists: 1,
                            password_verify: 1,
                            forget_password: 0,
                            token: token
                        };

                    } else {
                        response = {
                            user_exists: 1,
                            password_verify: 0,
                            forget_password: 0
                        }
                    }
                } catch (err) {
                    response = {
                        user_exists: 1,
                        password_verify: 0,
                        forget_password: 1
                    }
                }
            }
        } else {
            response = {
                user_exists: 0,
                password_verify: 0,
                forget_password: 0
            }
        }

        return res.status(200).json({
            msg: "Login Status success",
            success: true,
            data: response
        });
    };

    // Function to login with otp
    const loginWithOtp = async (req, res) => {
        let flag = req.body.flag;  // 1: Send Otp 2: Verify Otp
        let mobile = req.body.mobile;

        if (flag == 1) {
            let userId;
            let i2talent_user_id = 0;
            let firstName = "", lastName = "", status = "", partnerId = 0; id = 0;

            let userResponse = await RegistrationModel().checkMobileExists(mobile);
            let response = {};
            if (userResponse.recordExists > 0) {
                let otpSendResponse = await commonSendOtp(mobile).then(async function (responseOtp) {
                    if (responseOtp.type == 'success') {
                        if (userResponse.seeker.length > 0) {
                            userResponse.seeker[0]['created_by'] = userResponse.seeker[0].users_id;
                            let i2talentUserData = await i2talentModel().checkAndSaveI2talentUser(userResponse.seeker[0]);
                            i2talent_user_id = i2talentUserData.dataValues.UserID;
                            id = userResponse.seeker[0].id;
                            userId = userResponse.seeker[0].users_id;
                            firstName = userResponse.seeker[0].first_name;
                            lastName = userResponse.seeker[0].last_name;
                            partnerId = userResponse.seeker[0].partner_id;
                            status = userResponse.seeker[0].status;
                        } else if (userResponse.employer.length > 0) {
                            id = userResponse.employer[0].id;
                            userId = userResponse.employer[0].users_id;
                            firstName = userResponse.employer[0].first_name;
                            lastName = userResponse.employer[0].last_name;
                            status = userResponse.employer[0].status;
                        } else if (userResponse.partner.length > 0) {
                            id = userResponse.partner[0].id;
                            partnerId = userResponse.partner[0].id;
                            userId = userResponse.partner[0].users_id;
                            status = userResponse.partner[0].status;
                            firstName = userResponse.partner[0].first_name;
                        } else if (userResponse.partnerContacts.length > 0) {
                            id = userResponse.partnerContacts[0].id;
                            userId = userResponse.partnerContacts[0].users_id;
                            firstName = userResponse.partnerContacts[0].first_name;
                            lastName = userResponse.partnerContacts[0].last_name;
                            status = userResponse.partnerContacts[0].status;
                        } else if (userResponse.admin.length > 0) {
                            id = userResponse.admin[0].id;
                            userId = userResponse.admin[0].users_id;
                            firstName = userResponse.admin[0].first_name;
                            lastName = userResponse.admin[0].last_name;
                            status = userResponse.admin[0].status;
                        } else if (userResponse.serviceProvider.length > 0) {
                            id = userResponse.serviceProvider[0].id;
                            userId = userResponse.serviceProvider[0].users_id;
                            firstName = userResponse.serviceProvider[0].first_name;
                            lastName = userResponse.serviceProvider[0].last_name;
                            status = userResponse.serviceProvider[0].status;
                        }

                        let userAccountDetails = await UserAccountModel().getAccountDetailsByUserId(userId);

                        const loginData = {
                            users_id: userId,
                            role_id: userAccountDetails[0].uacc_group_fk,
                            login_type: 2
                        };
                        let loginDetails = await LoginHistoryModel().saveLoginData(loginData);

                        //Jwt token
                        const userData = {
                            first_name: firstName,
                            last_name: lastName,
                            id: id,
                            users_id: userId,
                            partner_id: partnerId,
                            i2talent_user_id: i2talent_user_id,
                            role_id: userAccountDetails[0].uacc_group_fk,
                            account_status: status,
                            user_exists: 1
                        };

                        const token = authService().issue(userData);

                        response = {
                            first_name: firstName,
                            last_name: lastName,
                            role_id: userAccountDetails[0].uacc_group_fk,
                            users_id: userId,
                            id: id,
                            partner_id: partnerId,
                            account_status: status,
                            user_exists: 1,
                            password_verify: 1,
                            forget_password: 0,
                            token: token,
                            opt_send: 1
                        };
                    } else {
                        response = { user_exists: 1, opt_send: 0 };
                    }
                });


            } else {
                response = { user_exists: 0, opt_send: 0 };
            }

            return res.status(200).json({
                success: true,
                data: response
            });
        } else {
            let otpData = {
                mobile: mobile,
                otp: req.body.otp
            };

            let otpVerifyResponse = await commonVerifyotp(otpData).then(async function (responseOtp) {
                if (responseOtp.type == 'success') {
                    return res.status(200).json({
                        success: true,
                        msg: 'OTP verified successfully',
                        data: 1
                    });
                } else {
                    return res.status(200).json({
                        success: true,
                        msg: responseOtp,
                        data: 0
                    });
                }
            });
        }
    }

    // Function to send otp
    async function commonSendOtp(mobile) {
        return new Promise(resolve => {
            msg91SendOtp.send(mobile, "JOBIND", function (error, data) {
                resolve(data);
            });
        });
    }

    // Function to send otp
    async function commonVerifyotp(reqData) {
        return new Promise(resolve => {
            msg91SendOtp.verify(reqData.mobile, reqData.otp, function (error, data) {
                resolve(data);
            });
        });
    }

    // Function to send otp
    const sendOtp = async (req, res) => {
        const { body } = req;
        const detailsArray = {
            mobile: body.mobile
        }
        msg91SendOtp.send(body.mobile, "JOBIND", function (error, data) {
            if (data.type == 'success') {
                return res.status(200).json({
                    success: true,
                    data: data
                });
            }
            else {
                return res.status(200).json({
                    success: false,
                    data: data
                });
            }
        });
    }

    // Function to verify otp
    const verifyOtp = async (req, res) => {
        const { body } = req;
        msg91SendOtp.verify(body.mobile, body.otp, function (error, data) {
            if (data.type == 'success') {
                return res.status(200).json({
                    msg: 'OTP verified successfully',
                    success: true
                });
            }
            if (data.type == 'error') {
                return res.status(200).json({
                    msg: data,
                    success: false
                });
            }
        });
    }

    return {
        loginWithPassword,
        sendOtp,
        verifyOtp,
        loginWithOtp
    }
};

module.exports = LoginController;