const UserDetails = require('./database_layer/UserDetails');
const SeekerLayer = require('./database_layer/Seekers');

let DateHelper = require('../../helpers/DateHelper');
let DateObj = new DateHelper();

const Details = () => {


    const savePersonalDetails = async (personal_details, user_id) => {

        let saveDetails = {};
        try {

            let data = {
                UserID: user_id,
                Gender: personal_details.gender,
                Age: personal_details.age,
                CreatedAt: DateObj.getCurrentTimeStamp()
            };
            let genderCode = 'm';
            switch (personal_details.gender) {
                case '2':
                    genderCode = 'f';
                    break;
                case '3':
                    genderCode = 't';
                    break;
                case '4':
                    genderCode = 'd';
                    break;
            };

            let jobabilityUserData = {
                gender: genderCode
            }

            if (personal_details.dob) {
                data['DateOfBirth'] = personal_details.dob;
                jobabilityUserData['dob'] = personal_details.dob;
            }
            saveDetails = await UserDetails.create(data);

            jobabilityUserData['update_date'] = DateObj.getCurrentTimeStamp();

            updateSeekerDetails = await SeekerLayer.update(jobabilityUserData, {
                where: {
                    users_id: personal_details.seeker_user_id
                }
            });
        } catch (err) {
            console.log('Error in savePersonalDetails : ', err);
        }
        return saveDetails;
    };

    const updatePersonalDetails = async (personal_details, user_id) => {

        let updateDetails = {};

        try {

            let genderCode = 'm';

            let jobabilityUserData = {}

            let updatedData = {};
            if (personal_details.dob) {
                updatedData['DateOfBirth'] = personal_details.dob;
                jobabilityUserData['dob'] = personal_details.dob;
            }

            if (personal_details.gender != "" && personal_details.gender != null) {
                updatedData['Gender'] = personal_details.gender;
                switch (personal_details.gender) {
                    case '2':
                        genderCode = 'f';
                        break;
                    case '3':
                        genderCode = 't';
                        break;
                    case '4':
                        genderCode = 'd';
                        break;
                };
                jobabilityUserData['gender'] = genderCode;
            }

            if (personal_details.age != "" && personal_details.age != null) {
                updatedData['Age'] = personal_details.age;
            }
            updatedData['UpdatedAt'] = DateObj.getCurrentTimeStamp();
            jobabilityUserData['update_date'] = DateObj.getCurrentTimeStamp();

            updateDetails = await UserDetails.update(updatedData, {
                where: {
                    UserID: user_id
                }
            });

            updateSeekerDetails = await SeekerLayer.update(jobabilityUserData, {
                where: {
                    users_id: personal_details.seeker_user_id
                }
            });
        } catch (err) {
            console.log('Error in updatePersonalDetails : ', err);
        }
        return updateDetails;
    };

    const saveContactInformation = async (contact_information, user_id) => {

        let personalDetails = await UserDetails.create({
            UserID: user_id,
            Gender: contact_information.gender,
            DateOfBirth: contact_information.dob,
            Age: contact_information.age
        });
        return personalDetails;
    };

    const updateContactInformation = async (contact_information, user_id) => {

        let update = null;
        try {
            update = await UserDetails.update({
                AltMobile: contact_information.alt_number,
                ContactPerson: contact_information.contact_person,
                Email: contact_information.email,
                UpdatedAt: DateObj.getCurrentTimeStamp()
            }, {
                where: {
                    UserID: user_id
                }
            }
            );
        } catch (err) {
            console.log('Error in updateContactInformation : ', err);
        }

        return update;
    };

    const saveModOfContact = async (personal_details, user_id) => {

        let personalDetails = await UserDetails.create({
            UserID: user_id,
            Gender: contact_information.gender,
            DateOfBirth: contact_information.dob,
            Age: contact_information.age,
        });
        return personalDetails;
    };

    const updateModOfContact = async (contact_mod, user_id) => {

        let updatedData = {};
        let update = null;

        try {

            if (contact_mod.contact_preference) {
                updatedData['ContactPreference'] = contact_mod.contact_preference.toString();
            }

            if (contact_mod.profile_created_by) {
                updatedData['ProfileCreateBy'] = contact_mod.profile_created_by;
            }

            updatedData['DisabilityID'] = contact_mod.disability_id.toString();

            updatedData['UpdatedAt'] = DateObj.getCurrentTimeStamp()

            update = await UserDetails.update(updatedData, {
                where: {
                    UserID: user_id
                }
            });

        } catch (err) {
            console.error('Error in update mod of contact', err);
        }
        return update;
    };

    const getUserDetails = async (user_id) => {

        let userDetails = await UserDetails.findOne({
            where: {
                UserID: user_id
            }
        });

        return userDetails;

    };

    const isUserDetailsExists = async (user_id) => {

        let isExists = false;
        let userDetails = await UserDetails.findOne({
            where: {
                UserID: user_id
            }
        });

        if (userDetails) {
            isExists = true;
        }
        return isExists;
    }

    return {
        getUserDetails,
        savePersonalDetails,
        updatePersonalDetails,
        saveContactInformation,
        updateContactInformation,
        saveModOfContact,
        updateModOfContact
    }
};

module.exports = Details;