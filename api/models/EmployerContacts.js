const EmployerContactsLayer = require("./database_layer/EmployerContacts");
const sequelize = require('../../config/database');
let DateHelper = require('../../helpers/DateHelper');
const UserAccountModel = require('../models/UserAccount');
let DateObj = new DateHelper();

const EmployerContacts = () => {
    // Function to get all employer contacts list for table (Active, Inactive)
    const getAllEmpContactListForTable = async (reqData) => {
        let limit = reqData.limit;
        let offset = reqData.offset;
        let nameMobile = reqData.name_mobile;
        let stateId = reqData.state;
        let loggedUserId = reqData.logged_user_id;
        let whereCondition = "WHERE tbl_employer_contacts.isdelete=0 ";
        if(nameMobile!=""){
            whereCondition+= ` AND (tbl_employer_contacts.first_name LIKE '%${nameMobile}%' OR tbl_employer_contacts.last_name LIKE '%${nameMobile}%' OR tbl_employer_contacts.contact_phone LIKE '%${nameMobile}%')`;
        }
        if(loggedUserId > 1){
            whereCondition+= ` AND tbl_employer_contacts.employer_user_id=${loggedUserId}`;
        }
        if(stateId!=""){
            whereCondition+= ` AND tbl_employer_contacts.service_state=${stateId}`;
        }

        let queryEmployerContacts = `SELECT tbl_employer_contacts.id, tbl_employer_contacts.users_id, tbl_employer_contacts.employer_user_id, tbl_employer_contacts.first_name, tbl_employer_contacts.last_name, tbl_employer_contacts.password, tbl_employer_contacts.contact_phone, tbl_employer_contacts.email, tbl_employer_contacts.verify_email, tbl_employer_contacts.service_state, tbl_employer_contacts.status, tbl_country_state.name AS state_name  
        FROM tbl_employer_contacts 
        LEFT JOIN tbl_country_state ON tbl_employer_contacts.service_state = tbl_country_state.id 
        ${whereCondition} 
        ORDER BY tbl_employer_contacts.status DESC, tbl_employer_contacts.id ASC 
        LIMIT ${limit} OFFSET ${offset}`;

        let resEmployerContactsList = await sequelize.query(queryEmployerContacts, {
            type: sequelize.QueryTypes.SELECT
        });
        let queryEmployerContactsCount = `SELECT COUNT(tbl_employer_contacts.id) As totalRecord FROM tbl_employer_contacts ${whereCondition}`;
        let resEmployerContactsCount = await sequelize.query(queryEmployerContactsCount, {
            type: sequelize.QueryTypes.SELECT
        });
        let totalRecord = resEmployerContactsCount[0].totalRecord;
        return {resEmployerContactsList, totalRecord};
    };

    const getEmployerContactByUserId = async (userId) => {

        let queryEmployerContacts = `SELECT tbl_employer_contacts.id, tbl_employer_contacts.users_id, tbl_employer_contacts.employer_user_id, tbl_employer_contacts.password, tbl_employer_contacts.first_name, tbl_employer_contacts.last_name, tbl_employer_contacts.contact_phone, tbl_employer_contacts.email, tbl_employer_contacts.verify_email, tbl_employer_contacts.service_state, tbl_employer_contacts.status, tbl_country_state.name AS state_name  
        FROM tbl_employer_contacts 
        LEFT JOIN tbl_country_state ON tbl_employer_contacts.service_state = tbl_country_state.id 
        WHERE tbl_employer_contacts.isdelete=0 AND tbl_employer_contacts.users_id= ${userId} 
        ORDER BY tbl_employer_contacts.id ASC`;
        let resEmployerContactsList = await sequelize.query(queryEmployerContacts, {
            type: sequelize.QueryTypes.SELECT
        });
        return resEmployerContactsList;
    }

    // Function to save employer contacts data
    const saveData = async (reqData) => {
        let verifyEmail = 1;
        if(reqData.email){
            verifyEmail = 0;
        }

        employerContactResponse = await EmployerContactsLayer.create({
            first_name: reqData.first_name,
            last_name: reqData.last_name,
            users_id: reqData.users_id,
            employer_user_id: reqData.employer,
            contact_phone: reqData.mobile,
            email: reqData.email,
            password: reqData.password,
            verify_email: verifyEmail,
            service_state: reqData.state,
            status: reqData.is_active,
            created_by: reqData.logged_user_id,
            created_at: DateObj.getCurrentTimeStamp()
        });

        return employerContactResponse;
    }

    // Function to update employer contacts data
    const updateData = async (reqData) => {
        // let verifyEmail = 1;
        // if(reqData.email){
        //     verifyEmail = 0;
        // }

        let updatedData = {
            first_name: reqData.first_name,
            last_name: reqData.last_name,
            users_id: reqData.users_id,
            employer_user_id: reqData.employer,
            contact_phone: reqData.mobile,
            email: reqData.email,
            password: reqData.password,
            verify_email: reqData.verify_email,
            service_state: reqData.state,
            status: reqData.is_active,
            updated_by: reqData.logged_user_id,
            updated_at: DateObj.getCurrentTimeStamp()
        };

        updateEmployerContact = await EmployerContactsLayer.update(updatedData,{
            where: {
                users_id: reqData.users_id
            }
        });

        return updateEmployerContact;
    }

    // Function to delete employer contacts on id
    const deleteEmployerContactsOnId = async (reqData) => {
        let updatedData = {
            isdelete: 1,
            updated_by: reqData.logged_user_id,
            updated_at: DateObj.getCurrentTimeStamp()
        }

        updateEmployerConData = await EmployerContactsLayer.update(updatedData,{
            where: {
                id: reqData.employer_contact_id
            }
        });
        return updateEmployerConData;
    }

    // Function to export employer contacts data
    const exportsEmployerContactData = async (reqData) => {
        let nameMobile = reqData.name_mobile;
        let stateId = reqData.state;
        let loggedUserId = reqData.logged_user_id;
        let whereCondition = "WHERE tbl_employer_contacts.isdelete=0 ";
        if(nameMobile!=""){
            whereCondition+= ` AND (tbl_employer_contacts.first_name LIKE '%${nameMobile}%' OR tbl_employer_contacts.last_name LIKE '%${nameMobile}%' OR tbl_employer_contacts.contact_phone LIKE '%${nameMobile}%')`;
        }
        if(loggedUserId > 1){
            whereCondition+= ` AND tbl_employer_contacts.employer_user_id=${loggedUserId}`;
        }
        if(stateId!=""){
            whereCondition+= ` AND tbl_employer_contacts.service_state=${stateId}`;
        }

        let queryEmployerContacts = `SELECT CONCAT('IND', LPAD(tbl_employer_contacts.id, 8, 0)) AS unique_id, tbl_employer_contacts.id AS employer_contacts_id, tbl_employer_contacts.employer_user_id, tbl_employer_contacts.first_name, tbl_employer_contacts.last_name, tbl_employer_contacts.contact_phone, tbl_employer_contacts.email, tbl_employer_contacts.password, tbl_employer_contacts.service_state, tbl_country_state.name AS state_name, tbl_employer_contacts.status As account_staus, DATE(tbl_employer_contacts.created_at) As created_at 
        FROM tbl_employer_contacts 
        LEFT JOIN tbl_country_state ON tbl_employer_contacts.service_state = tbl_country_state.id 
        ${whereCondition} 
        ORDER BY tbl_employer_contacts.status DESC, tbl_employer_contacts.id ASC`;

        let resEmployerContactsList = await sequelize.query(queryEmployerContacts, {
            type: sequelize.QueryTypes.SELECT
        });
        
        return resEmployerContactsList;
    }
    return {
        getAllEmpContactListForTable,
        getEmployerContactByUserId,
        saveData,
        updateData,
        deleteEmployerContactsOnId,
        exportsEmployerContactData
    };
}

module.exports = EmployerContacts;