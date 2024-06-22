const LoginHistoryLayer = require("./database_layer/LoginHistory");

let DateHelper = require('../../helpers/DateHelper');
let DateObj = new DateHelper();

const LoginHistory = () => {

    const saveLoginData = async (reqData) => {
        let loginData = {
            users_id: reqData.users_id,
            role_id: reqData.role_id,
            login_type: reqData.login_type,
            created_at: DateObj.getCurrentTimeStamp()
        };
        let loginDetails = await LoginHistoryLayer.create(loginData);

        return loginDetails;
    };

    return {
        saveLoginData
    };
}

module.exports = LoginHistory;