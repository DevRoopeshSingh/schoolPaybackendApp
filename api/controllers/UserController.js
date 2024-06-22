let Users = require('../models/Users');
let UserDetails = require('../models/UserDetails');
let Address = require('../models/Address');
let parseToken = require('../../helpers/parse_token');

let SearchFilters = require('../../helpers/SearchFilters')
let searchFilters = new SearchFilters();

const UserController = () => {

    const getUserState = async (req, res) => {

        //let userId = parseToken(req.token).getUserId();
        let userId = req.params.id;
        let userState = await Users().getUserState(userId);

        return res.status(200).json({
            msg: "Get user state success",
            success: true,
            data: userState
        });
    };

    const savePersonalDetails = async (req, res) => {
        try {
            let userId = req.params.id;
            let saveDetails = await UserDetails().savePersonalDetails(req.body, userId);

            if (saveDetails) {
                getUserDetails(req, res);
            } else {
                return res.status(500).json({
                    msg: 'Internal server error',
                    success: false
                });
            }
        } catch (error) {
            return res.status(500).json({
                msg: error,
                success: false
            });
        }

    };

    const updatePersonalDetails = async (req, res) => {
        try {

            let userId = req.params.id;
            let updateDetails = await UserDetails().updatePersonalDetails(req.body, userId);

            if (updateDetails) {
                await getUserDetails(req, res);
            } else {
                return res.status(500).json({
                    msg: 'Internal server error',
                    success: false
                });
            }

        } catch (err) {
            console.error(err);
            return res.status(500).json({
                msg: 'Internal server error',
                success: false
            });
        }

    };

    const saveContactInformation = async (req, res) => {
        let userId = req.params.id;
        let contactDetails = await UserDetails().saveContactInformation(req.body, userId);
        return res.status(200).json(contactDetails);
    };

    const updateContactInformation = async (req, res) => {

        try {

            let userId = req.params.id;
            let updateDetails = UserDetails().updateContactInformation(req.body, userId);
            await updateDetails;

        } catch (err) {
            console.error(err);
        }

        getUserDetails(req, res);

    };

    const saveModOfContact = async (req, res) => {
        let userId = req.params.id;
        let contactDetails = await UserDetails().saveModOfContact(req.body, userId);
        return res.status(200).json(contactDetails);
    };

    const updateModOfContact = async (req, res) => {
        try {
          
            let userId = req.params.id;
            let updateDetails = await UserDetails().updateModOfContact(req.body, userId);
            let userDetails = await getUserDetails(req, res);

        } catch (err) {
            console.error(err);
            return res.status(500).json({ msg: 'Internal server error' });
        }

    };

    const getUserDetails = async (req, res) => {

        try {
            let userId = req.params.id;
            let userDetails = await Users().getUserDetails(userId);
            let userAddress = await Address().getAddress(userId);

            let formattedUserDetails = {}
            if (userDetails) {
                formattedUserDetails = formatUserDetails(userDetails, userAddress);
            }
            return res.status(200).json({
                msg: 'User details data success',
                success: true,
                data: formattedUserDetails
            });
        } catch (err) {
            console.error(err)
            return res.status(500).json({ msg: 'Internal server error' });
        }
    };

    const formatUserDetails = (user_details, address) => {

        let details = {
            'detail_id': user_details.UserDetailsID,
            'personal': {
                'gender': user_details.Gender,
                'dob': user_details.DateOfBirth,
                'age': user_details.Age
            },
            'contact_information': {
                'alt_number': user_details.AltMobile,
                'contact_person': user_details.ContactPerson,
                'email_id': user_details.Email
            },
            'mode_of_contact': {
                'contact_preference': user_details.ContactPreference,
                'profile_created_by': user_details.ProfileCreateBy,
                'disability_id': user_details.DisabilityID
            }
        };

        details['address'] = {
            'address_id': '',
            'pin_code': '',
            'country': '',
            'state': '',
            'city': '',
            'postal_address': '',
            'lives_in': ''
        };
        if (address) {
            details['address'] = {
                'address_id': address.UserAddressID,
                'pin_code': address.ZipCode,
                'country': address.Country,
                'state': address.State,
                'city': address.City,
                'postal_address': address.Address,
                'lives_in': address.LivesIn
            };
        }

        return details;
    };

    const getUsers = async (req, res) => {

        let search_filters = searchFilters.getSearchFilters(req.body);
        search_filters['RoleID'] = 1;
        let users = await Users().getUsers(search_filters);

        return res.status(200).json({
            msg: 'User details data success',
            success: true,
            data: users
        });
    };

    const deleteUsers = async (req, res) => {

        let user_id = req.body.userId;
        let admin_id = parseToken(req.token).getUserId();

        let userDelete = await Users().deleteUsers(user_id, admin_id);

        return res.status(200).json({
            msg: 'User data deletion success',
            success: true,
            data: userDelete
        });
    };

    const getAllRegistrationDetails = async (req, res) => {

        //let userId = parseToken(req.token).getUserId();
        let userId = req.params.id;
        let getAllDetails = await Users().getAllDetails(userId);

        return res.status(200).json({
            msg: "Get user details success",
            success: true,
            data: getAllDetails
        });
    }; // Create # Pradip

    const getMaxUserId = async (req, res) => {

        let getMaxId = await Users().getMaxUserId();

        return res.status(200).json({
            msg: "Get user details success",
            success: true,
            data: getMaxId
        });
    }; // Create # Pradip

    const getUserStateDetails = async (req, res) => {

        let userId = req.params.id;
        let userStateDetails = await Users().getUserStateDetails(userId);

        return res.status(200).json({
            msg: "Get user state success",
            success: true,
            data: userStateDetails
        });
    }; // Create # Pradip

    const usersDelete = async (req, res) => {
        let search_filters = searchFilters.getSearchFilters(req.body);
        let users = await Users().getUsers(search_filters);

        if (Object.keys(users).length > 0) {
            let user_id = users[0]['dataValues'].user_id;
            let userDelete = await Users().usersDelete(user_id);
            return res.status(200).json({
                msg: "User data deletion success",
                success: true,
                data: user_id
            });
        } else {
            return res.status(200).json({
                msg: "User data not deleted",
                success: false,
                data: 0
            });
        }
    };  // Create # Pradip

    const updateMobile = async (req, res) => {
        try {
            // Mobile update into R&A when mobile update from jobability
            let partner_id = req.body.partner_id;
            
            let update_mobile = req.body.update_mobile;
            let updateMobile = await Users().updateMobile(partner_id, update_mobile);
            if(updateMobile==null){
                return res.status(200).json({
                    msg: "User mobile not updated",
                    success: true,
                    data: updateMobile
                });
            } else{
                return res.status(200).json({
                    msg: "User mobile updated successfully",
                    success: true,
                    data: updateMobile
                });
            }
            
        } catch (err) {
            console.error(err);
            return res.status(500).json({ msg: 'Internal server error' });
        }

    }; // Create # Pradip

    return {
        getUserState,
        getUserDetails,
        savePersonalDetails,
        updatePersonalDetails,
        saveContactInformation,
        updateContactInformation,
        saveModOfContact,
        updateModOfContact,
        getUsers,
        deleteUsers,
        getAllRegistrationDetails,
        getMaxUserId,
        getUserStateDetails,
        usersDelete,
        updateMobile
    };
};

module.exports = UserController;