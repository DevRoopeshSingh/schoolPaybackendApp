const publicRoutes = {
  'GET /jobability-roles': 'JobabilityRoleController.getRoles',
  'POST /auth/validate': 'AuthController.validate',
  'POST /register/save-registration-data': 'RegistrationController.saveRegistration',
  'POST /users/login-by-password': 'LoginController.loginWithPassword',
  'POST /users/login-by-otp': 'LoginController.loginWithOtp',
  'POST /check-user/forgot-password': 'RegistrationController.checkUserForForgotPass',
  'PUT /user/upadte-password': 'RegistrationController.updatePassword',

  'GET /disabilityCertificate/:file_name' : 'FileUploadController.downloadDisabilityCertificate',
};

module.exports = publicRoutes;
