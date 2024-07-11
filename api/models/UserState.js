const userState = require('./database_layer/UserState');

let DateHelper = require('../../helpers/DateHelper');
let DateObj = new DateHelper();

const UserState = () => {
    
    const updateUserState = async (userId, stateCode) => {

        let update = await userState.update({
            StateCode: stateCode,
            UpdatedAt: DateObj.getCurrentTimeStamp()
        },{
            where: {
                UserID: userId
            }
        });

        return update;
    };

     updateActiveTab = async (user_id, active_index, module_name) => {

        let updateIndex = null;
        let updateData = {};

        if( module_name === 'registration' ) {
            updateData['DetailedRegistrationTab'] = active_index
        } else {
            updateData['AssessmentTab'] = active_index
        }

        updateIndex = await userState.update(updateData,{
            where: {
                UserID: user_id
            }
        });

        return updateIndex;
    }

    

    return {
        updateUserState,
        updateActiveTab
    }
};

module.exports = UserState;