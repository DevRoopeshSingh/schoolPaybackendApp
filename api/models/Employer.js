const sequelize = require('../../config/database');
const EmployerDetailsLayer = require("./database_layer/EmployerDetails");
const EmployerLayer = require("./database_layer/Employer");

let DateHelper = require('../../helpers/DateHelper');
let DateObj = new DateHelper();

const Employer = () => {

    // Function to get employer details
    const getEmployerDetails = async (userId) => {
        let query = `SELECT tbl_employer_new.first_name, tbl_employer_new.last_name, tbl_employer_new.mobile, tbl_employer_new.email, tbl_employer_new.verify_email, tbl_employer_new.password, tbl_employer_details.org_name, tbl_employer_details.sector_id, tbl_employer_details.state_id, 
        tbl_employer_details.skillset_id, tbl_employer_details.disability_and_inclusion_id, 
        tbl_employer_details.relevant_to_employer_id, tbl_employer_details.address, tbl_employer_details.profile_description, tbl_employer_details.accessibility_profiling,
        tbl_employer_details.inclusion_policy, tbl_employer_details.enhancements, 
        tbl_employer_details.implementation, tbl_employer_details.inclusion_training, tbl_employer_details.support_lc, tbl_employer_details.interested_lc 
        FROM tbl_employer_new 
        LEFT JOIN tbl_employer_details ON tbl_employer_new.users_id = tbl_employer_details.user_id
        WHERE tbl_employer_new.users_id = ${userId}`;

        let empDetails = await sequelize.query(query, {
            type: sequelize.QueryTypes.SELECT
        });
        return empDetails;
    };

    // Function to save and update employer profile details
    const saveUpdateEmpProfileDetails = async (reqData) => {
        let userId = reqData.user_id;
        let loggedUserId = reqData.logged_user_id;
        let firstName = reqData.first_name;
        let lastName = reqData.last_name;
        let orgName = reqData.org_name;
        let sector = reqData.sector;
        let state = reqData.state;
        let skillsets = reqData.skillsets;
        let disability_and_inclusion = reqData.disability_and_inclusion;
        let relevant_to_employer = reqData.relevant_to_employer;
        let address = reqData.address;
        let profile_description = reqData.profile_description;
        let accessibility = reqData.accessibility;
        let inclusion_policy = reqData.inclusion_policy;
        let enhancements = reqData.enhancements;
        let implementation = reqData.implementation;
        let inclusion_training = reqData.inclusion_training;
        let support_lc = reqData.support_lc;
        let interested_lc = reqData.interested_lc;

        let empDetailsData = {};

        let updatedEmpData = {
            first_name: firstName,
            last_name: lastName,
            mobile: reqData.mobile,
            password: reqData.password,
            email: reqData.email,
            verify_email: reqData.verify_email,
            updated_by: loggedUserId,
            updated_at: DateObj.getCurrentTimeStamp()
        }

        // Update employer primary data
        updateEmpData = await EmployerLayer.update(updatedEmpData, {
            where: {
                users_id: userId
            }
        });

        // Check employer record exists in details table
        let isEmpExists = await EmployerDetailsLayer.findAll({
            attributes: [
                ['user_id', "user_id"]
            ],
            where: {
                user_id: userId
            }
        });

        if (isEmpExists.length > 0) {
            // Update
            let updatedEmpProfileData = {
                org_name: orgName,
                sector_id: sector,
                state_id: state,
                skillset_id: skillsets,
                disability_and_inclusion_id: disability_and_inclusion,
                relevant_to_employer_id: relevant_to_employer,
                address: address,
                profile_description: profile_description,
                accessibility_profiling: accessibility,
                inclusion_policy: inclusion_policy,
                enhancements: enhancements,
                implementation: implementation,
                inclusion_training: inclusion_training,
                support_lc: support_lc,
                interested_lc: interested_lc,
                updated_by: loggedUserId,
                updated_at: DateObj.getCurrentTimeStamp()
            }

            empDetailsData = await EmployerDetailsLayer.update(updatedEmpProfileData, {
                where: {
                    user_id: userId
                }
            });
        } else {
            // Save
            let saveEmpProfileData = {
                user_id: userId,
                org_name: orgName,
                sector_id: sector,
                state_id: state,
                skillset_id: skillsets,
                disability_and_inclusion_id: disability_and_inclusion,
                relevant_to_employer_id: relevant_to_employer,
                address: address,
                profile_description: profile_description,
                accessibility_profiling: accessibility,
                inclusion_policy: inclusion_policy,
                enhancements: enhancements,
                implementation: implementation,
                inclusion_training: inclusion_training,
                support_lc: support_lc,
                interested_lc: interested_lc,
                created_by: loggedUserId,
                created_at: DateObj.getCurrentTimeStamp()
            }

            empDetailsData = await EmployerDetailsLayer.create(saveEmpProfileData);
        }

        return empDetailsData;
    }

    // Function to get list on filter option
    const getEmployerSearch = async (reqData) => {
        let nameEmailMobile = reqData.name_email_mobile;
        let user_id = reqData.user_id;
        let sector = reqData.sector;
        let state = reqData.state;
        let fromDate = reqData.from_date;
        let toDate = reqData.to_date;
        let offset = reqData.offset;
        let limit = reqData.limit;

        let queryEmployerList;
        let whereCondition = "WHERE tbl_employer_new.is_delete=0 ";
        if (nameEmailMobile != "") {
            whereCondition += ` AND (tbl_employer_new.mobile = '${nameEmailMobile}' OR tbl_employer_new.email like '%${nameEmailMobile}%' OR tbl_employer_new.first_name like '%${nameEmailMobile}%')`;
        }
        if (user_id != "") {
            whereCondition += ` AND tbl_employer_new.users_id ='${user_id}'`;
        }
        if (fromDate != "" && toDate != "") {
            whereCondition += ` AND (DATE(tbl_employer_new.created_at) BETWEEN '${fromDate}' AND  '${toDate}')`;
        } else {
            if (fromDate != "") {
                whereCondition += ` AND (DATE(tbl_employer_new.created_at) >= '${fromDate}')`;
            }
            if (toDate != "") {
                whereCondition += ` AND (DATE(tbl_employer_new.created_at) <= '${toDate}')`;
            }
        }
        if (state != "") {
            whereCondition += ` AND tbl_employer_details.state_id ='${state}'`;
        }
        if (sector != "") {
            whereCondition += ` AND tbl_employer_details.sector_id ='${sector}'`;
        }

        queryEmployerList = `SELECT tbl_employer_new.id, tbl_employer_new.users_id, tbl_employer_new.first_name, tbl_employer_new.last_name, tbl_employer_new.mobile, tbl_employer_new.status, 
        tbl_states.state_name 
        FROM tbl_employer_new 
        LEFT JOIN tbl_employer_details ON tbl_employer_new.users_id = tbl_employer_details.user_id 
        LEFT JOIN tbl_states ON tbl_employer_details.state_ID = tbl_states.state_id 
        ${whereCondition} ORDER BY tbl_employer_new.status DESC, tbl_employer_new.users_id DESC LIMIT ${limit} OFFSET ${offset};`;

        let employerList = await sequelize.query(queryEmployerList, {
            type: sequelize.QueryTypes.SELECT
        });
       
        queryCount = `SELECT COUNT(tbl_employer_new.users_id) totalCount 
        FROM tbl_employer_new 
        LEFT JOIN tbl_employer_details ON tbl_employer_new.users_id = tbl_employer_details.user_id 
        LEFT JOIN tbl_states ON tbl_employer_details.state_ID = tbl_states.state_id 
        ${whereCondition} ORDER BY tbl_employer_new.status DESC, tbl_employer_new.users_id DESC`;

        let employerCount = await sequelize.query(queryCount, {
            type: sequelize.QueryTypes.SELECT
        });
        
        return { employerList, employerCount };
    }

    // Function to update service provider record status
    const updateEmpStatus = async (reqData) => {
        let updateStatusData = {
            status: reqData.status,
            updated_by: reqData.logged_user_id,
            updated_at: DateObj.getCurrentTimeStamp()
        };

        updateStatusDetails = await EmployerLayer.update(updateStatusData, {
            where: {
                users_id: reqData.user_id
            }
        });

        return updateStatusDetails;
    }

    // Function to export emloyer data
    const exportsEmployerData = async (reqData) => {
        let nameEmailMobile = reqData.name_email_mobile;
        let user_id = reqData.user_id;
        let sector = reqData.sector;
        let state = reqData.state;
        let fromDate = reqData.from_date;
        let toDate = reqData.to_date;

        let queryEmployerList;
        let whereCondition = "WHERE tbl_employer_new.is_delete=0 ";
        if (nameEmailMobile) {
            whereCondition += ` AND (tbl_employer_new.mobile = '${nameEmailMobile}' OR tbl_employer_new.email like '%${nameEmailMobile}%' OR tbl_employer_new.first_name like '%${nameEmailMobile}%')`;
        }
        if (user_id) {
            whereCondition += ` AND tbl_employer_new.users_id ='${user_id}'`;
        }
        if (fromDate && toDate) {
            whereCondition += ` AND (DATE(tbl_employer_new.created_at) BETWEEN '${fromDate}' AND  '${toDate}')`;
        } else {
            if (fromDate) {
                whereCondition += ` AND (DATE(tbl_employer_new.created_at) >= '${fromDate}')`;
            }
            if (toDate) {
                whereCondition += ` AND (DATE(tbl_employer_new.created_at) <= '${toDate}')`;
            }
        }
        if (state) {
            whereCondition += ` AND tbl_employer_details.state_id ='${state}'`;
        }
        if (sector) {
            whereCondition += ` AND tbl_employer_details.sector_id ='${sector}'`;
        }

        queryEmployerList = `SELECT CONCAT('IND', LPAD(tbl_employer_new.id, 8, 0)) AS unique_id, tbl_employer_new.id AS employer_id, tbl_employer_new.first_name, tbl_employer_new.last_name, tbl_employer_new.mobile, tbl_employer_new.email, tbl_employer_new.status, tbl_employer_details.org_name, tbl_states.state_name, tbl_employer_details.address, tbl_employer_details.profile_description, tbl_employer_details.accessibility_profiling, tbl_employer_sector.name AS sector_name, tbl_employer_details.inclusion_policy, tbl_employer_details.enhancements, tbl_employer_details.implementation, tbl_employer_details.inclusion_training, tbl_employer_details.support_lc, tbl_employer_details.interested_lc, tbl_employer_details.skillset_id, tbl_employer_details.disability_and_inclusion_id, tbl_employer_details.relevant_to_employer_id 
        FROM tbl_employer_new 
        LEFT JOIN tbl_employer_details ON tbl_employer_new.users_id = tbl_employer_details.user_id 
        LEFT JOIN tbl_states ON tbl_employer_details.state_id = tbl_states.state_id 
        LEFT JOIN tbl_employer_sector ON tbl_employer_details.sector_id = tbl_employer_sector.id 
        ${whereCondition} ORDER BY tbl_employer_new.status DESC`;

        let employerList = await sequelize.query(queryEmployerList, {
            type: sequelize.QueryTypes.SELECT
        });

        return employerList;
    }

    return {
        getEmployerDetails,
        saveUpdateEmpProfileDetails,
        getEmployerSearch,
        updateEmpStatus,
        exportsEmployerData
    };
}

module.exports = Employer;