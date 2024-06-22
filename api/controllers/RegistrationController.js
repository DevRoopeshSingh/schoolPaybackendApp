
let RegistrationModel = require('../models/Registration');
let UserAccountModel = require('../models/UserAccount');
const authService = require('../services/auth.service');

const RegistrationController = () => {
    // Save Job seeker, Employer and Service provider data
    const saveRegistration = async (req, res) => {
        req.body['ip_address'] = req.connection.remoteAddress;
        let registrationData = await RegistrationModel().saveData(req.body);

        //Jwt token
        const userData = {
            first_name: registrationData.first_name,
            last_name: registrationData.last_name,
            role_id: registrationData.role_id,
            users_id: registrationData.users_id,
            id: registrationData.id,
            i2talent_user_id: registrationData.i2talent_user_id,
            account_status: registrationData.account_status,
            partner_id: registrationData.partner_id,
            user_exists: registrationData.user_exists,
        };
        const token = authService().issue(userData);

        return res.status(200).json({
            msg: 'Registraion Data saved successfully',
            success: true,
            data: registrationData,
            token: token
        });
    }

    // Function to check user exists or not for forgot password
    const checkUserForForgotPass = async (req, res) => {
        let userData = await RegistrationModel().checkUserForForgotPass(req.body);
        return res.status(200).json({
            msg: 'User data',
            success: true,
            data: userData
        });
    }

    // Function to update password
    const updatePassword = async (req, res) => {

        let userAccountData = await UserAccountModel().getAccountDetailsByUserId(req.body.user_id);
        let userData = {
            user_id: req.body.user_id,
            password: req.body.password,
            role_id: userAccountData[0].uacc_group_fk
        }
        let updateData = await RegistrationModel().updatePassword(userData);
        return res.status(200).json({
            msg: 'Password Updated successfully',
            success: true,
            data: updateData
        });
    }

    return {
        saveRegistration,
        checkUserForForgotPass,
        updatePassword
    }
}

module.exports = RegistrationController