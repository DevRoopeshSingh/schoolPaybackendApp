const privateRoutes = {
  
  // Employer
  'GET /employer/:id/profile-details': 'EmployerController.getEmployeeDetails',
  'POST /save-update/emp-profile-details': 'EmployerController.saveUpdateEmpProfileDetails',
  'POST /employer-search': 'EmployerController.getEmployerSearch',
  'POST /employer/data-export': 'EmployerController.exportsEmployerData',
  'PUT /employer/update-status': 'EmployerController.updateEmpStatus',

  // Employer contacts
  'POST /table/employer-contact/all-list': 'EmployerContactsController.getAllEmpContactListForTable',
  'POST /employer-contact/save-data': 'EmployerContactsController.saveEmployerContacts',
  'PUT /employer-contact/update-data': 'EmployerContactsController.updateEmployerContacts',
  'PUT /delete/employer-contact': 'EmployerContactsController.deleteEmployerContactsOnId',
  'POST /employer-contact/data-export': 'EmployerContactsController.exportsEmployerContactData',

  // Employer Skillset
  'GET /employer-skillset': 'EmployerSkillsetController.getEmpSkillset',
  
};

module.exports = privateRoutes;
