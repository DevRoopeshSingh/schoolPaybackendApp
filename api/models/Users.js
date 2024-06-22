const UserDetails = require('./database_layer/UserDetails');
const UserState = require('./database_layer/UserState');
const State = require('./database_layer/States');
const User = require('./database_layer/User');
let UserAddress = require('./database_layer/UserAddress');
let UserAssessment = require('./database_layer/AssessmentResponse');
let UserAssessmentLanguage = require('./database_layer/AssessmentLanguageResponse');
let UserDocument = require('./database_layer/Document'); // Create Pradip
const sequelize = require('../../config/database');
let assessmentRequest = require('../../config/requestParams/AssessmentRequest');
const Logs = require('./database_layer/Logs');
const Tenants = require('./database_layer/Tenants');
const Roles = require('./database_layer/Roles');

let DateHelper = require('../../helpers/DateHelper');
let DateObj = new DateHelper();

const Users = () => {

    const getUserState = async (user_id) => {
        let userState = await UserState.findOne({
            where: {
                UserID: user_id
            }
        });
        //let stateDetails = {};
        let userDetails = {};
        if (userState) {

            // stateDetails = await State.findOne({
            //     where: {
            //         StateCode: userState.StateCode
            //     }
            // });

            userDetails = await User.findOne({
                attributes: ['FirstName', 'LastName', 'PartnerID'],
                where: {
                    UserID: user_id
                }
            })
        };

        return {
            user: userDetails,
            state: userState.StateCode,
            // message: stateDetails.StateDescription,
            active_tab: {
                "registration": userState.DetailedRegistrationTab,
                "assessment": userState.AssessmentTab
            }
        };
    };

    const savePersonalDetails = async (personal_details, user_id) => {

        let personalDetails = await UserDetails.create({
            UserID: user_id,
            Gender: personal_details.gender,
            DateOfBirth: personal_details.dob,
            Age: personal_details.age,
            CreatedAt: DateObj.getCurrentTimeStamp()
        });

        return personalDetails;
    };

    const getUserDetails = async (user_id) => {

        let userDetails = await UserDetails.findOne({
            where: {
                UserID: user_id
            }
        });

        return userDetails;

    };

    const CreateUser = async (first_name, last_name, mobile, user_registration_id, organisation, role, password, partner_user_id) => {
        // Modify # Pradip
        // Added partner_user_id parameter (CreateUser, CreatedBy)
        let user = await User.create({
            FirstName: first_name,
            LastName: last_name,
            Mobile: mobile,
            PartnerID: user_registration_id,
            RoleID: role,
            TenantID: organisation,
            CreatedBy: partner_user_id,
            CreatedAt: DateObj.getCurrentTimeStamp(),
            Password: password
        });

        return user;
    };

    const UpdateUser = async (first_name, last_name, mobile, user_registration_id) => {
        let user = await User.update({
            FirstName: first_name,
            LastName: last_name,
            Mobile: mobile,
            UpdatedAt: DateObj.getCurrentTimeStamp()
        }, {
            where: {
                PartnerID: user_registration_id
            }
        });

        return user;
    };

    const updateEmailId = async (email, user_id) => {

        let update = await User.update({
            Email: email
        }, {
            where: {
                UserID: user_id
            }
        });

        return update;
    };

    const getUserEmail = async (user_id) => {
        let email = await User.findOne({
            where: {
                UserID: user_id
            },
            attributes: ['Email']
        });

        return email;
    };

    const UpdateOrCreateUser = async (first_name, last_name, mobile, user_registration_id, organisation, role, password, partner_user_id) => {
        // Modify # Pradip
        // Added partner_user_id parameter (UpdateOrCreateUser,CreateUser)
        let user = {}
        let userId = await findUserByUserRegistrationId(user_registration_id);

        if (!userId) {

            let organisation_id = await Tenants.findOne({
                where: {
                    TenantKey: organisation
                },
                attributes: ["TenantID"]
            });

            let role_id = await Roles.findOne({
                where: {
                    RoleName: role
                },
                attributes: ["RoleID"]
            });

            organisation_id = organisation_id['TenantID'];
            role_id = role_id['RoleID'];

            user = await CreateUser(first_name, last_name, mobile, user_registration_id, organisation_id, role_id, password, partner_user_id);

            await UserState.create({
                UserID: user.UserID,
                StateCode: 1,
                CreatedAt: DateObj.getCurrentTimeStamp()
            });
        } else {
            await UpdateUser(first_name, last_name, mobile, user_registration_id);
            user = await User.findOne({
                where: {
                    UserID: userId.UserID
                }
            });
        }
        return user;
    }; // Modify # Pradip

    const findUserByUserRegistrationId = async (user_registration_id) => {

        let user = await User.findOne({
            attributes: ['UserID'],
            where: {
                PartnerID: user_registration_id
            }
        });

        return user;
    };

    const getSharedData = async (user_id) => {

        let userDetails = {};
        let userDetailsquery = `SELECT genders.Gender as gender, Age as age, DateOfBirth as dob, AltMobile as alternate_mobile, 
            ContactPerson as contact_person, ContactPreference as contact_preference, ProfileCreateBy as profile_created_by, Email as email_id
            FROM tbl_user_details as details
            INNER JOIN tbl_genders as genders ON genders.GenderID = details.Gender
            WHERE UserID = ${user_id}`;

        let detailedRegistation = await sequelize.query(userDetailsquery, {
            type: sequelize.QueryTypes.SELECT
        });

        userDetails['detailed_registation'] = detailedRegistation;

        let userState = await UserState.findOne({
            where: {
                UserID: user_id
            },
            attributes: ["StateCode"]
        });

        if (userState.StateCode == 5) {

            let assessmentFields = Object.keys(assessmentRequest);
            assessmentFields = assessmentFields.map(field => `res.${field}`);

            let userAssessmentQuery = `SELECT ${assessmentFields.toString()}, support.AidsSupport as aids_support_needed, marital_status.MaritalStatus as m_status,
                i_status.IncomeStatus as income_status, education.Education as highest_education, s_needed.SupportNeeded as support_required
                FROM tbl_assessment_response as res
                LEFT JOIN tbl_aids_support as support ON support.AidsSupportID = res.SupportUsed
                LEFT JOIN tbl_marital_status as marital_status ON marital_status.MaritalStatusID = res.MaritalStatus
                LEFT JOIN tbl_income_status as i_status ON i_status.IncomeStatusID = res.FamilyIncome
                LEFT JOIN tbl_educations as education ON education.EducationID = res.HighestEducation
                LEFT JOIN tbl_support_needed as s_needed ON s_needed.SupportNeededID = res.SupportRequired
                WHERE UserID  = ${user_id}`;

            let userAssessment = await sequelize.query(userAssessmentQuery, {
                type: sequelize.QueryTypes.SELECT
            });

            let languageQuery = `SELECT language.Language as language, al.Proficiency
                                    FROM tbl_assessment_languages as al
                                    INNER JOIN tbl_languages as language ON language.LanguageID = al.LanguageID
                                    WHERE UserID  = ${user_id}`;

            let languages = await sequelize.query(languageQuery, {
                type: sequelize.QueryTypes.SELECT
            });

            userDetails['user_assessment'] = userAssessment;
            userDetails['languages'] = languages;
        }

        return userDetails;
    };

    const getUserDataExtraction = async (search_filter) => {

        let userData = {};

        try {
            let searchFilers = [];

            if (search_filter['StateCode']) {
                searchFilers.push(`user_state.StateCode = ${search_filter['StateCode']}`);
            }

            if (search_filter['Country']) {
                searchFilers.push(`country.CountryID = ${search_filter['Country']}`);
            }

            if (search_filter['State']) {
                searchFilers.push(`state.StateID = ${search_filter['State']}`);
            }

            if (search_filter['City']) {
                searchFilers.push(`city.CityID = ${search_filter['City']}`);
            }
            searchFilers.push(`users.RoleID = 1`);

            let whereParam = searchFilers.join(" AND ");

            let assessmentFields = Object.keys(assessmentRequest);
            assessmentFields = assessmentFields.map(field => `res.${field}`);

            let searchQuery = `SELECT users.UserID as user_id, FirstName as first_name, LastName as last_name, Mobile as mobile, DATE_FORMAT(users.CreatedAt,"%d-%m-%Y") as registration_date,
                genders.Gender as gender, Age as age, DateOfBirth as dob, AltMobile as alternate_mobile,
                ContactPerson as contact_person, ContactPreference as contact_preference, ProfileCreateBy as profile_created_by, Email as email_id,
                user_address.Address as address, user_address.LivesIn as lives_in, user_address.ZipCode as zip_code, country.CountryName as country, 
                state.StateName as state, city.CityName as city,
                ${assessmentFields.toString()}, GROUP_CONCAT(DISTINCT(CONCAT(" ",support.AidsSupport))) as aids_support_needed, marital_status.MaritalStatus as m_status,
                i_status.IncomeStatus as income_status, education.Education as highest_education, GROUP_CONCAT(DISTINCT(CONCAT(" ",s_needed.SupportNeeded))) as support_required,user_state.DetailedRegistrationTab,user_state.AssessmentTab, users.PartnerID as partner_id, DATE_FORMAT(users.UpdatedAt,"%d-%m-%Y") as updated_at
                FROM tbl_users as users
                LEFT JOIN tbl_user_state as user_state ON users.UserID = user_state.UserID
                LEFT JOIN tbl_user_details as details ON users.UserID = details.UserID
                LEFT JOIN tbl_user_address user_address ON users.UserID = user_address.UserID
                LEFT JOIN tbl_genders as genders ON details.Gender = genders.GenderID
                LEFT JOIN tbl_countries as country ON user_address.Country = country.CountryID
                LEFT JOIN tbl_states as state ON user_address.State = state.StateID
                LEFT JOIN tbl_cities as city ON user_address.City = city.CityID
                LEFT JOIN tbl_assessment_response as res ON users.UserID = res.UserID
                LEFT JOIN tbl_aids_support as support ON FIND_IN_SET(support.AidsSupportID,res.SupportUsed)
                LEFT JOIN tbl_marital_status as marital_status ON marital_status.MaritalStatusID = res.MaritalStatus
                LEFT JOIN tbl_income_status as i_status ON i_status.IncomeStatusID = res.FamilyIncome
                LEFT JOIN tbl_educations as education ON education.EducationID = res.HighestEducation
                LEFT JOIN tbl_support_needed as s_needed ON FIND_IN_SET(s_needed.SupportNeededID,res.SupportRequired)
                WHERE ${whereParam}`;

            userData = await sequelize.query(searchQuery, {
                type: sequelize.QueryTypes.SELECT
            });


        } catch (err) {
            console.log('Error in getUserDataExtraction', err);
        }

        return userData;
    }; // (Modifiy # Pradip 17-04-2020)

    const getUsers = async (search_filter) => {

        let users = await User.findAll({
            where: search_filter,
            attributes: [
                ["UserID", "user_id"],
                ["PartnerID", "user_registration_id"],
                ["FirstName", "first_name"],
                ["LastName", "last_name"],
                ["Mobile", "mobile"],
                ["TenantID", "TenantID"],
            ]
        });

        return users;
    };

    const getUserRole = async (user_id) => {

        let role = null;
        let userRoleQuery = `SELECT role.RoleName FROM tbl_users as user
            INNER JOIN tbl_roles as role on user.RoleID = role.RoleID
            WHERE user.UserID = ${user_id}`;

        userRole = await sequelize.query(userRoleQuery, {
            type: sequelize.QueryTypes.SELECT
        });

        if (userRole) {
            role = userRole[0]
        }
        return role;
    };

    const deleteUsers = async (user_id, admin_id) => {

        let oldData = await getUsers({ UserID: user_id });

        await Logs.create({
            UserID: admin_id,
            Action: 'delete',
            OldData: oldData,
        })

        await User.destroy({
            where: {
                UserID: user_id
            }
        });

        await UserState.destroy({
            where: {
                UserID: user_id
            }
        });

        await UserDetails.destroy({
            where: {
                UserID: user_id
            }
        });

        await UserAddress.destroy({
            where: {
                UserID: user_id
            }
        });

        await UserAssessment.destroy({
            where: {
                UserID: user_id
            }
        });

        await UserAssessmentLanguage.destroy({
            where: {
                UserID: user_id
            }
        });

        await UserDocument.destroy({
            where: {
                UserID: user_id
            }
        }); // Added Pradip

        return true;
    };


    const getAllDetails = async (userId) => {
        let query = `SELECT tbl_users.FirstName,tbl_users.LastName,tbl_users.Mobile,tbl_user_details.Age,DATE_FORMAT(tbl_user_details.DateOfBirth, '%d-%m-%Y') AS DateOfBirth,CASE WHEN tbl_user_details.AltMobile="" THEN "Not Available" ELSE tbl_user_details.AltMobile END AS AltMobile,tbl_genders.Gender,GROUP_CONCAT(" ",tbl_mode_of_contact.ModeOfContact) ModeOfContact, CASE WHEN tbl_user_details.ContactPerson ="" then "Not Available" ELSE tbl_user_details.ContactPerson END As ContactPerson, CASE WHEN tbl_user_details.Email="" THEN "Not Available" ELSE tbl_user_details.Email END AS Email, tbl_countries.CountryName, tbl_states.StateName, tbl_cities.CityName, tbl_user_address.ZipCode, tbl_user_address.Address, tbl_user_address.LivesIn, tbl_user_document.UniqueID  FROM  tbl_user_details
        INNER JOIN tbl_users ON tbl_user_details.UserID = tbl_users.UserID INNER JOIN tbl_genders ON tbl_genders.GenderID = tbl_user_details.Gender INNER JOIN tbl_mode_of_contact ON FIND_IN_SET(tbl_mode_of_contact.ModeOfContactID,tbl_user_details.ContactPreference) INNER JOIN tbl_user_address oN tbl_user_address.UserID = tbl_users.UserID INNER JOIN tbl_countries ON tbl_countries.CountryID = tbl_user_address.Country INNER JOIN tbl_states ON tbl_states.StateID = tbl_user_address.State INNER JOIN tbl_cities ON tbl_cities.CityID = tbl_user_address.City INNER JOIN tbl_user_document ON tbl_user_document.UserID = tbl_users.UserID
         WHERE tbl_users.UserID= '${userId}'`;

        //let assessmentQuery = `SELECT tbl_assessment_response.*,GROUP_CONCAT("-",tbl_languages.Language) As Language,GROUP_CONCAT(tbl_assessment_languages.Proficiency) As Proficiency FROM tbl_assessment_response INNER JOIN tbl_assessment_languages ON tbl_assessment_languages.UserID = tbl_assessment_response.UserID INNER JOIN tbl_languages ON tbl_languages.LanguageID = tbl_assessment_languages.LanguageID WHERE tbl_assessment_languages.UserID='${userId}'`;
        let assessmentQuery = `SELECT tbl_assessment_response.*,tbl_marital_status.MaritalStatus As MaritalStatusText,tbl_educations.Education AS Qualification,tbl_income_status.IncomeStatus AS IncomeStatus FROM tbl_assessment_response LEFT JOIN tbl_marital_status ON tbl_assessment_response.MaritalStatus = tbl_marital_status.MaritalStatusID LEFT JOIN tbl_educations ON tbl_assessment_response.HighestEducation = tbl_educations.EducationID LEFT JOIN tbl_income_status ON tbl_assessment_response.FamilyIncome = tbl_income_status.IncomeStatusID WHERE tbl_assessment_response.UserID='${userId}'`;
        let languageQuery = `SELECT GROUP_CONCAT(" ",tbl_languages.Language) As Languages,GROUP_CONCAT(tbl_assessment_languages.Proficiency) AS Proficiency FROM tbl_assessment_languages INNER JOIN tbl_languages ON FIND_IN_SET(tbl_languages.LanguageID,tbl_assessment_languages.LanguageID) WHERE tbl_assessment_languages.UserID = '${userId}'`;
        
        let aidsSupportQuery =`SELECT GROUP_CONCAT(" ",tbl_aids_support.AidsSupport) As AidsSupport FROM tbl_assessment_response INNER JOIN tbl_aids_support ON FIND_IN_SET(tbl_aids_support.AidsSupportID,tbl_assessment_response.SupportUsed) WHERE tbl_assessment_response.UserID='${userId}'`;
        let supportRequiredQuery = `SELECT GROUP_CONCAT(" ",tbl_support_needed.SupportNeeded) As SupportNeeded FROM tbl_assessment_response INNER JOIN tbl_support_needed ON FIND_IN_SET(tbl_support_needed.SupportNeededID,tbl_assessment_response.SupportRequired) WHERE tbl_assessment_response.UserID='${userId}'`;
        
        let regData = await sequelize.query(query, {
            type: sequelize.QueryTypes.SELECT
        });

        let assessmentData = await sequelize.query(assessmentQuery, {
            type: sequelize.QueryTypes.SELECT
        });

        let languageData = await sequelize.query(languageQuery, {
            type: sequelize.QueryTypes.SELECT
        });

        let aidsSupportData = await sequelize.query(aidsSupportQuery, {
            type: sequelize.QueryTypes.SELECT
        });

        let supportRequiredData = await sequelize.query(supportRequiredQuery, {
            type: sequelize.QueryTypes.SELECT
        });

        let response = {};
        response['registrationData'] = regData;
        response['assessmentData'] = assessmentData;
        response['aidsSupportData'] = aidsSupportData;
        response['supportRequiredData'] = supportRequiredData;
        response['languageData'] = languageData;
        return response;
    } // Create # Pradip

    const getAllUserDetailsList = async () => {
        // For jobability

        let query = `SELECT tbl_users.FirstName,tbl_users.LastName,tbl_users.Mobile,tbl_user_details.Age,DATE_FORMAT(tbl_user_details.DateOfBirth, '%d-%m-%Y') AS DateOfBirth,CASE WHEN tbl_user_details.AltMobile="" THEN "Not Available" ELSE tbl_user_details.AltMobile END AS AltMobile,tbl_genders.Gender,GROUP_CONCAT(DISTINCT tbl_mode_of_contact.ModeOfContact) ModeOfContact, CASE WHEN tbl_user_details.ContactPerson ="" then "Not Available" ELSE tbl_user_details.ContactPerson END As ContactPerson, CASE WHEN tbl_user_details.Email="" THEN "Not Available" ELSE tbl_user_details.Email END AS Email, tbl_countries.CountryName, tbl_states.StateName, tbl_cities.CityName, tbl_user_address.ZipCode, tbl_user_address.Address, tbl_user_address.LivesIn,tbl_user_document.UniqueID,tbl_assessment_response.*,GROUP_CONCAT("-",tbl_languages.Language) As Language,GROUP_CONCAT(tbl_assessment_languages.Proficiency) As Proficiency,GROUP_CONCAT(DISTINCT tbl_support_needed.SupportNeeded) As SupportNeeded FROM  tbl_user_details
        INNER JOIN tbl_users ON tbl_user_details.UserID = tbl_users.UserID INNER JOIN tbl_genders ON tbl_genders.GenderID = tbl_user_details.Gender INNER JOIN tbl_mode_of_contact ON FIND_IN_SET(tbl_mode_of_contact.ModeOfContactID,tbl_user_details.ContactPreference) INNER JOIN tbl_user_address oN tbl_user_address.UserID = tbl_users.UserID INNER JOIN tbl_countries ON tbl_countries.CountryID = tbl_user_address.Country INNER JOIN tbl_states ON tbl_states.StateID = tbl_user_address.State INNER JOIN tbl_cities ON tbl_cities.CityID = tbl_user_address.City LEFT JOIN tbl_user_document ON tbl_user_document.UserID = tbl_users.UserID LEFT JOIN tbl_assessment_response ON tbl_assessment_response.UserID = tbl_users.UserID LEFT JOIN tbl_assessment_languages ON tbl_assessment_languages.UserID = tbl_assessment_response.UserID LEFT JOIN tbl_languages ON tbl_languages.LanguageID = tbl_assessment_languages.LanguageID LEFT JOIN tbl_support_needed  ON FIND_IN_SET(tbl_support_needed.SupportNeededID,tbl_assessment_response.SupportRequired) GROUP BY tbl_users.UserID`;

        let regData = await sequelize.query(query, {
            type: sequelize.QueryTypes.SELECT
        });

        let response = {};
        response['registrationData'] = regData;
        return response;

    } // Create # Pradip

    const getAboutMeDetailsByUserIdSyncData = async (partnerId) => {
        //For jobability (Dump jobability database) partnerId = Seeker User Id
        let queryUsers = `SELECT * FROM tbl_users WHERE PartnerID = '${partnerId}'`;

        let resQueryUsers = await sequelize.query(queryUsers, {
            type: sequelize.QueryTypes.SELECT
        });

        let response = {};

        if (resQueryUsers.length > 0) {
            const userId = resQueryUsers[0].UserID;

            let queryUsersAddress = `SELECT * FROM tbl_user_address WHERE UserID = '${userId}'`;

            let resQueryUsersAddress = await sequelize.query(queryUsersAddress, {
                type: sequelize.QueryTypes.SELECT
            });

            let queryUsersDetails = `SELECT * FROM tbl_user_details WHERE UserID = '${userId}'`;

            let resQueryUsersDetails = await sequelize.query(queryUsersDetails, {
                type: sequelize.QueryTypes.SELECT
            });

            let queryUsersState = `SELECT * FROM tbl_user_state WHERE UserID = '${userId}'`;

            let resQueryUsersState = await sequelize.query(queryUsersState, {
                type: sequelize.QueryTypes.SELECT
            });

            response['usersTableData'] = resQueryUsers;
            response['usersAddressTableData'] = resQueryUsersAddress;
            response['usersDetailsTableData'] = resQueryUsersDetails;
            response['usersStateTableData'] = resQueryUsersState;
        }

        return response;
    }

    const getAssessmentDetailsByUserIdSyncData = async (partnerId) => {
        //For jobability (Dump jobability database) partnerId = Seeker User Id
        let queryUsers = `SELECT * FROM tbl_users WHERE PartnerID = '${partnerId}'`;

        let resQueryUsers = await sequelize.query(queryUsers, {
            type: sequelize.QueryTypes.SELECT
        });

        let response = {};

        if (resQueryUsers.length > 0) {
            const userId = resQueryUsers[0].UserID;

            let queryAssessmentLanguage = `SELECT * FROM tbl_assessment_languages WHERE UserID = '${userId}'`;

            let resQueryAssessmentLanguage = await sequelize.query(queryAssessmentLanguage, {
                type: sequelize.QueryTypes.SELECT
            });

            let queryAssessmentResponse = `SELECT * FROM tbl_assessment_response WHERE UserID = '${userId}'`;

            let resQueryAssessmentResponse = await sequelize.query(queryAssessmentResponse, {
                type: sequelize.QueryTypes.SELECT
            });

            let queryUsersDocument = `SELECT * FROM tbl_user_document WHERE UserID = '${userId}'`;

            let resQueryUsersDocument = await sequelize.query(queryUsersDocument, {
                type: sequelize.QueryTypes.SELECT
            });

            let queryUsersState = `SELECT * FROM tbl_user_state WHERE UserID = '${userId}'`;

            let resQueryUsersState = await sequelize.query(queryUsersState, {
                type: sequelize.QueryTypes.SELECT
            });

            response['assessmentLanguageTableData'] = resQueryAssessmentLanguage;
            response['assessmentResponseTableData'] = resQueryAssessmentResponse;
            response['usersDocumentTableData'] = resQueryUsersDocument;
            response['usersStateTableData'] = resQueryUsersState;
        }

        return response;

    }

    const getUserDetailsByUserIdSyncData = async (partnerId) => {
        //For jobability (Dump jobability database) partnerId = Seeker User Id

        let queryUsers = `SELECT * FROM tbl_users WHERE PartnerID = '${partnerId}'`;

        let resQueryUsers = await sequelize.query(queryUsers, {
            type: sequelize.QueryTypes.SELECT
        });

        let response = {};

        if (resQueryUsers.length > 0) {

            const userId = resQueryUsers[0].UserID;

            let queryAssessmentLanguage = `SELECT * FROM tbl_assessment_languages WHERE UserID = '${userId}'`;

            let resQueryAssessmentLanguage = await sequelize.query(queryAssessmentLanguage, {
                type: sequelize.QueryTypes.SELECT
            });

            let queryAssessmentResponse = `SELECT * FROM tbl_assessment_response WHERE UserID = '${userId}'`;

            let resQueryAssessmentResponse = await sequelize.query(queryAssessmentResponse, {
                type: sequelize.QueryTypes.SELECT
            });

            let queryUsersAddress = `SELECT * FROM tbl_user_address WHERE UserID = '${userId}'`;

            let resQueryUsersAddress = await sequelize.query(queryUsersAddress, {
                type: sequelize.QueryTypes.SELECT
            });

            let queryUsersDetails = `SELECT * FROM tbl_user_details WHERE UserID = '${userId}'`;

            let resQueryUsersDetails = await sequelize.query(queryUsersDetails, {
                type: sequelize.QueryTypes.SELECT
            });

            let queryUsersDocument = `SELECT * FROM tbl_user_document WHERE UserID = '${userId}'`;

            let resQueryUsersDocument = await sequelize.query(queryUsersDocument, {
                type: sequelize.QueryTypes.SELECT
            });

            let queryUsersState = `SELECT * FROM tbl_user_state WHERE UserID = '${userId}'`;

            let resQueryUsersState = await sequelize.query(queryUsersState, {
                type: sequelize.QueryTypes.SELECT
            });

            response['assessmentLanguageTableData'] = resQueryAssessmentLanguage;
            response['assessmentResponseTableData'] = resQueryAssessmentResponse;
            response['usersTableData'] = resQueryUsers;
            response['usersAddressTableData'] = resQueryUsersAddress;
            response['usersDetailsTableData'] = resQueryUsersDetails;
            response['usersDocumentTableData'] = resQueryUsersDocument;
            response['usersStateTableData'] = resQueryUsersState;

        }

        return response;
    }

    const getUserDetailsBySyncData = async () => {
        //For jobability (Dump jobability database) partnerId = Seeker User Id

        let queryUsers = `SELECT * FROM tbl_users WHERE RoleID=1 ORDER BY UserID ASC`;

        let resQueryUsers = await sequelize.query(queryUsers, {
            type: sequelize.QueryTypes.SELECT
        });

        let response = {};

        if (resQueryUsers.length > 0) {

            let queryAssessmentLanguage = `SELECT * FROM tbl_assessment_languages ORDER BY UserID ASC`;

            let resQueryAssessmentLanguage = await sequelize.query(queryAssessmentLanguage, {
                type: sequelize.QueryTypes.SELECT
            });

            let queryAssessmentResponse = `SELECT * FROM tbl_assessment_response ORDER BY UserID ASC`;

            let resQueryAssessmentResponse = await sequelize.query(queryAssessmentResponse, {
                type: sequelize.QueryTypes.SELECT
            });

            let queryUsersAddress = `SELECT * FROM tbl_user_address ORDER BY UserID ASC`;

            let resQueryUsersAddress = await sequelize.query(queryUsersAddress, {
                type: sequelize.QueryTypes.SELECT
            });

            let queryUsersDetails = `SELECT * FROM tbl_user_details ORDER BY UserID ASC`;

            let resQueryUsersDetails = await sequelize.query(queryUsersDetails, {
                type: sequelize.QueryTypes.SELECT
            });

            let queryUsersDocument = `SELECT * FROM tbl_user_document ORDER BY UserID ASC`;

            let resQueryUsersDocument = await sequelize.query(queryUsersDocument, {
                type: sequelize.QueryTypes.SELECT
            });

            let queryUsersState = `SELECT tbl_user_state.* FROM tbl_user_state INNER JOIN tbl_users ON tbl_users.UserID = tbl_user_state.UserID WHERE tbl_users.RoleID=1 ORDER BY tbl_users.UserID ASC`;

            let resQueryUsersState = await sequelize.query(queryUsersState, {
                type: sequelize.QueryTypes.SELECT
            });

            response['assessmentLanguageTableData'] = resQueryAssessmentLanguage;
            response['assessmentResponseTableData'] = resQueryAssessmentResponse;
            response['usersTableData'] = resQueryUsers;
            response['usersAddressTableData'] = resQueryUsersAddress;
            response['usersDetailsTableData'] = resQueryUsersDetails;
            response['usersDocumentTableData'] = resQueryUsersDocument;
            response['usersStateTableData'] = resQueryUsersState;

        }

        return response;
    }

    const getMaxUserId = async () => {
        let queryUsers = `SELECT max(UserID) AS maxUserId FROM tbl_users`;

        let resQueryUsers = await sequelize.query(queryUsers, {
            type: sequelize.QueryTypes.SELECT
        });

        return resQueryUsers;
    } // Create # Pradip

    const getUserStateDetails = async (user_id) => {
        let userStateDetails = await UserState.findOne({
            where: {
                UserID: user_id
            }
        });

        let userDetails = await User.findOne({
            where: {
                UserID: user_id
            }
        });

        return {
            user: userDetails,
            user_state: userStateDetails
        }
    } // Create # Pradip

    const usersDelete = async (user_id) => {
        // User deletion from R&A when removed user from jobability
        await User.destroy({
            where: {
                UserID: user_id
            }
        });

        await UserState.destroy({
            where: {
                UserID: user_id
            }
        });

        await UserDetails.destroy({
            where: {
                UserID: user_id
            }
        });

        await UserAddress.destroy({
            where: {
                UserID: user_id
            }
        });

        await UserAssessment.destroy({
            where: {
                UserID: user_id
            }
        });

        await UserAssessmentLanguage.destroy({
            where: {
                UserID: user_id
            }
        });

        await UserDocument.destroy({
            where: {
                UserID: user_id
            }
        }); // Added Pradip

        return true;
    };

    const updateMobile = async (partnerId, updateMobile) => {
        // Mobile update into R&A when mobile update from jobability
        let updatedData = {
            Mobile: updateMobile
        };
        
        let update = null;
        
        try {

            update = await User.update(updatedData, {
                where: {
                    PartnerID: partnerId
                }
            });

        } catch (err) {
            console.error('Error in update mobile', err);
        }
        return update;
    }; // Create Pradip
    
    const getDocumentIdByUserId = async (userId) => {
        let queryUsersDocument = `SELECT UniqueID FROM tbl_user_document WHERE UserID = '${userId}'`;
        let resUsersDocument = await sequelize.query(queryUsersDocument, {
            type: sequelize.QueryTypes.SELECT
        });

        return resUsersDocument;
    } // (Create # Pradip 17-04-2020)
    
    const getUserRoleList = async () => {
        let queryRole = `SELECT RoleID,CONCAT(UCASE(LEFT(RoleName, 1)), SUBSTRING(RoleName, 2)) AS RoleName FROM tbl_roles WHERE RoleName!='admin'`;
        let resQueryRole = await sequelize.query(queryRole, {
            type: sequelize.QueryTypes.SELECT
        });
        return resQueryRole;
    }; // (Create # Pradip 11-04-2020)

    const getUserGroupsList = async () => {
        let queryUserGroups = `SELECT UserGroupsID,UserGroupName, UserGroupsValue FROM tbl_user_groups WHERE UserGroupAdmin='0'`;
        let resQueryUserGroups = await sequelize.query(queryUserGroups, {
            type: sequelize.QueryTypes.SELECT
        });
        return resQueryUserGroups;
    }; // (Create # Pradip 16-04-2020)

    const getUserDataByMobile = async (Partner_id) => {
        let userDetails = await User.findOne({
            where: {
                Mobile: Partner_id
            }
        });
        return userDetails;
    };

    const checkUserExists = async (detailsArray, flag) => {
        // 1: By Mobile 2: By First name, Last name and Mobile (Forgot password)
        let queryLogin = '';
        if (flag == 1) {
            queryLogin = `SELECT tbl_users.UserID, tbl_users.PartnerID as jobabilityUserId, tbl_roles.RoleName FROM tbl_users INNER JOIN tbl_roles ON tbl_users.RoleID = tbl_roles.RoleID WHERE tbl_users.Mobile= '${detailsArray.mobile}' `;
        } else if (flag == 2) {
            queryLogin = `SELECT tbl_users.UserID, tbl_users.PartnerID AS jobabilityUserId, tbl_roles.RoleName FROM tbl_users INNER JOIN tbl_roles ON tbl_users.RoleID = tbl_roles.RoleID WHERE tbl_users.Mobile= '${detailsArray.mobile}' AND FirstName = '${detailsArray.firstName}' AND LastName = '${detailsArray.lastName}'`;
        }

        let resQueryLogin = await sequelize.query(queryLogin, {
            type: sequelize.QueryTypes.SELECT
        });
        return resQueryLogin;
    };

    const updateUserPassword = async (updateArray) => {
        let updatedData = {
            Password: updateArray.password,
            UpdatedAt: DateObj.getCurrentTimeStamp()
        };
        
        let update = null;
        
        try {

            update = await User.update(updatedData, {
                where: {
                    UserID: updateArray.userId
                }
            });

        } catch (err) {
            console.error('Error in update password', err);
        }
        return update;
    }

    return {
        getUserState,
        savePersonalDetails,
        getUserDetails,
        CreateUser,
        updateEmailId,
        getUserEmail,
        UpdateOrCreateUser,
        getSharedData,
        getUserDataExtraction,
        getUsers,
        deleteUsers,
        getUserRole,
        getAllDetails,
        getAllUserDetailsList,
        getUserDetailsByUserIdSyncData,
        getAboutMeDetailsByUserIdSyncData,
        getAssessmentDetailsByUserIdSyncData,
        getUserDetailsBySyncData,
        getMaxUserId,
        getUserStateDetails,
        usersDelete,
        updateMobile,
        getDocumentIdByUserId,
        getUserRoleList,
        getUserGroupsList,
        getUserDataByMobile,
        checkUserExists,
        updateUserPassword
    }
};

module.exports = Users;