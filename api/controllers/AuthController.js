const User = require('../models/Users');
const authService = require('../services/auth.service');
const connection = require('../../config/connection');
const path = require("path");

const moment = require('moment')
const fs = require('fs')
const childProcess = require('child_process');

const AuthController = () => {

  const register = async (req, res) => {
    const { body } = req;

    if (isValidUserRequest(body)) {
      try {

        const user = await User().UpdateOrCreateUser(body.first_name, body.last_name, body.mobile, body.user_registration_id,
          body.organization, body.role, req.body.password, body.partner_user_id);

        const userRole = await User().getUserRole(user.UserID);
        //Jwt
        // const token = authService().issue(userData);
        // return res.status(200).json({
        //   msg: 'User jwt token success',
        //   token: token,
        //   data:userData,
        //   success: true
        // });

        //oauth 
        const userData={
          id: user.UserID,
          tenant: user.TenantID,
          role: userRole.RoleName,
          jobabilityUserId: body.user_registration_id
        };
        await requestGetOAuthToken.then((response) => {
          return res.status(200).json({
            msg: 'User token success',
            success: true,
            token: response,
            data: userData
          });
  
        }).catch((error) => {
          console.log(error);
        });
        

      } catch (err) {
        console.log(err);
        return res.status(500).json({
          msg: 'Something went wrong',
          success: false
        });
      }
    }
    else{
      return res.status(400).json({
        msg: 'Required data is missing',
        success: false
      });
    }
  }; // Create # Pradip

  const validate = async (req, res) => {
    const { token } = req.body;

    authService().verify(token, (err, data) => {
      if (err) {
        return res.status(401).json({ isvalid: false, err: 'Invalid Token!' });
      }
      return res.status(200).json({
        isValid: true
      });
    });
  }; // Create # Pradip

  const isValidUserRequest = (request) => {
    return (request.first_name && request.last_name && request.mobile && request.organization && request.role
      && request.user_registration_id) ? true : false;
  } // Create # Pradip

  const generateToken = async (req, res) => {
    try {
      const user = await User().getUserDataByMobile(req.body.mobile);
      if(user!=null){
     
        const userRole = await User().getUserRole(user.UserID);
        const token = authService().issue({
          id: user.UserID,
          tenant: user.TenantID,
          role: userRole.RoleName,
          jobabilityUserId: user.PartnerID
        });
  
        return res.status(200).json({
          msg: 'User token success',
          token: token,
          success: true
        });
      } else{
        return res.status(200).json({
          msg: 'User does not exist',
          success: false
        });
      }
     
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        msg: 'Something went wrong',
        success: false
      });
    }


  } // Create # Pradip

  const checkUserExist = async (req, res) => {
    try {
      let mobile = req.body.mobile;
      let flag = req.body.flag;
      let detailsArray = {};
      let userDetails = '';

      if (flag == 1) {
        detailsArray = {
          mobile: mobile
        }
        userDetails = await User().checkUserExists(detailsArray, 1);
      } else if (flag == 2) {
        // Forgot password
        detailsArray = {
          mobile: mobile,
          firstName: req.body.first_name,
          lastName: req.body.last_name
        }
        userDetails = await User().checkUserExists(detailsArray, 2);
        if(userDetails.length>0){
          sendOtpFunction(mobile);
        }
      }

      if (userDetails.length > 0) {
        return res.status(200).json({
          msg: 'This mobile number is already registered',
          success: true,
          data: userDetails
        });
      }
      else {
        return res.status(200).json({
          msg: 'This mobile number is not registred',
          success: false
        });
      }
    } catch (err) {
      console.error(err)
      return res.status(500).json({ msg: 'Internal server error' });
    }
  }; // Create # Pradip
   
  const sendOtp = async (req, res) => {
    const { body } = req;
    const detailsArray = {
      mobile: body.mobile
    }
    // 1: Login with OTP
    let userDetails = await User().checkUserExists(detailsArray, 1);
    if (userDetails.length > 0) {
      const SendOtp = require('sendotp');
      const sendOtp = new SendOtp('276393Ahs2EKDPDoH05cd922a5');
      sendOtp.send(body.mobile, "eiDApp", function (error, data) {
        if (data.type == 'success') {
          return res.status(200).json({
            success: true,
            data: userDetails
          });
        }
        else {
          return res.status(200).json({
            success: false,
            data: data
          });
        }
      });
    } else {
      return res.status(200).json({
        success: false,
        data: 'This mobile number is not registred'
      });
    }
  } // Create # Pradip

  const verifyOtp = async (req, res) => {
    const { body } = req;
    const SendOtp = require('sendotp');
    const sendOtp = new SendOtp('276393Ahs2EKDPDoH05cd922a5');
    sendOtp.verify(body.mobile, body.otp, function (error, data) {
      if (data.type == 'success') {
        let userId = body.user_id;
        let role = body.role;
        let jobabilityUserId = body.jobability_user_id;
        let tokenResponse = tokenGenerate(role, userId, jobabilityUserId);
        return res.status(200).json({
          msg: 'OTP verified successfully',
          success: true,
          data: tokenResponse
        });
      }
      if (data.type == 'error') {
        return res.status(200).json({
          msg: data,
          success: false
        });
      }
    });
  } // Create # Pradip

  function tokenGenerate(role, user_id, jobability_user_id) {
    try {
      const token = authService().issue({
        id: user_id,
        tenant: 1,
        role: role,
        jobabilityUserId: jobability_user_id
      });
      return token
    } catch (err) {
      console.log(err);
      return 'Something went wrong';
    }
  } // Create # Pradip

  function sendOtpFunction(mobile) {
    const SendOtp = require('sendotp');
    const sendOtp = new SendOtp('276393Ahs2EKDPDoH05cd922a5');
    sendOtp.send(mobile, "eiDApp", function (error, data) {
    });
  } // Create # Pradip

  function verifyOtpFunction(mobile, otp) {
    const SendOtp = require('sendotp');
    const sendOtp = new SendOtp('276393Ahs2EKDPDoH05cd922a5');
    sendOtp.verify(mobile, otp, function (error, data) {
      if (data.type == 'success') {
        let response = {
          success: true,
          data: data
        }
        return response;
      }
      if (data.type == 'error') {
        let response = {
          success: false,
          data: data
        }
        return response;
      }
    });
  } // Create # Pradip

  const updatePassword = async (req, res) => {
    updateArray = {
      password: req.body.password,
      userId: req.body.user_id
    }
    
    userDetails = await User().updateUserPassword(updateArray, 1);
    let successFalg = true;
    if(userDetails==null){
      successFalg = false;
    }
    return res.status(200).json({
      success: successFalg,
      data: userDetails
    });

  } // Create # Pradip

  // let requestGetOAuthToken = new Promise((resolve, reject) => {
  //   var request = require('request');
  //   var options = {
  //     'method': 'POST',
  //     'url': 'https://login.microsoftonline.com/0c8d1604-9dbf-4be6-adbd-9a7d0a80f233/oauth2/v2.0/token',
  //     formData: {
  //       'client_id': '7187f928-4e26-4713-aecf-22851ba57341',
  //       'client_secret': 'Cs~A7avfCoFpmNK0Y1ns~j-64HRI_s_.0u',
  //       'scope': 'api://b352cadc-24a0-4930-a080-3b33e0509100/.default',
  //       'grant_type': 'client_credentials'
  //     }
  //   };
  //   let accessToken;
  //   request(options, function (error, response) {
  //     if (error) throw new Error(error);
  //     accessToken = JSON.parse(response.body).access_token;
  //     resolve(accessToken);
  //   });
  // });
  // const generateOauthToken = async (req, res) => {

  //   try {
  //     const user = await User().getUserDataByMobile(req.body.mobile);
  //     const userRole = await User().getUserRole(user.UserID);
     
  //     const userData = {
  //       id: user.UserID,
  //       tenant: user.TenantID,
  //       role: userRole.RoleName,
  //       jobabilityUserId: user.PartnerID,
  //       firstName:user.FirstName
  //     };
     
  //     const request = require('request-promise-native');

  //     const options = {
  //       'method': 'POST',
  //       'url': 'https://login.microsoftonline.com/0c8d1604-9dbf-4be6-adbd-9a7d0a80f233/oauth2/v2.0/token',
  //       formData: {
  //         'client_id': '7187f928-4e26-4713-aecf-22851ba57341',
  //         'client_secret': 'Cs~A7avfCoFpmNK0Y1ns~j-64HRI_s_.0u',
  //         'scope': 'api://b352cadc-24a0-4930-a080-3b33e0509100/.default',
  //         'grant_type': 'client_credentials'
  //       }
  //     };

  //     request(options).then(response => {
  //       accessTokenResponse = JSON.parse(response);
  //       return res.status(200).json({
  //         msg: 'Access Token',
  //         success: true,
  //         token: accessTokenResponse.access_token,
  //         data: userData
  //       });
  //     }, error => {
  //         console.log(error);
  //     });

  //     // requestGetOAuthToken.then((response) => {
  //     //   return res.status(200).json({
  //     //     msg: 'Access Token',
  //     //     success: true,
  //     //     token: response,
  //     //     data: userData
  //     //   });

  //     // }).catch((error) => {
  //     //   console.log(error);
  //     // });
      
  //   } catch (err) {
  //     console.log(err);
  //   }

  // }
  // const generateOauthToken = async (req, res) => {

  //   try {
  //     const user = await User().getUserDataByMobile(req.body.mobile);
  //     const userRole = await User().getUserRole(user.UserID);
  //     const userData = {
  //       id: user.UserID,
  //       tenant: user.TenantID,
  //       role: userRole.RoleName,
  //       jobabilityUserId: user.PartnerID
  //     };

  //     requestGetOAuthToken.then((response) => {
  //       return res.status(200).json({
  //         msg: 'Access Token',
  //         success: true,
  //         token: response,
  //         data: userData
  //       });

  //     }).catch((error) => {
  //       console.log(error);
  //     });
      
  //   } catch (err) {
  //     console.log(err);
  //   }

  // } // Create # Pradip

  const validateOauthToken = async (req, res) => {
    var request = require('request');
    var jobabilityUserId = req.body.jobability_user_id;
    var options = {
      'method': 'POST',
      'url': 'https://dev-lc-ai-career-accelerator.azure-api.net/0c8d1604-9dbf-4be6-adbd-9a7d0a80f233/assessment/'+jobabilityUserId,
      headers: {
        Authorization: "Bearer " + req.body.token
      }
    };
    let checkToken = false;
    let accessToken;
    request(options, function (error, response) {
      
      if (error) throw new Error(error);
      //accessToken = JSON.parse(response.body).access_token;
      //console.log("Validate", response.statusCode);
      // if(response.statusCode==200)
      // {
      //   checkToken=true;
      // }
      return res.status(200).json({
        msg: 'Access Token',
        success: true,
        data: response
        //isValid:checkToken,
      });
    });


  } // Create # Pradip

  return {
    register,
    validate,
    generateToken,
    checkUserExist,
    sendOtp,
    verifyOtp,
    tokenGenerate,
    sendOtpFunction,
    verifyOtpFunction,
    updatePassword,
    //generateOauthToken,
    validateOauthToken
  };
};

module.exports = AuthController;
