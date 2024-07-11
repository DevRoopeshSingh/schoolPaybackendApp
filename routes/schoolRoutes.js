// schoolRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../db')   


// Create School
router.post('/schools', async (req, res) => {
  const {
    school_name, address, city, state, zip_code, country,
    contact_number, email_address, website, principal_name,
    established_year, school_type, grades_offered, affiliation_number,
    accreditation, number_of_students, number_of_teachers,
    facilities, logo, mission_statement, vision_statement,
    school_board, extracurricular_activities
  } = req.body;

  console.log('Inside Schools API')

  try {
    const [result] = await pool.query(
      'INSERT INTO school_mst (school_name, address, city, state, zip_code, country, ' +
      'contact_number, email_address, website, principal_name, established_year, ' +
      'school_type, grades_offered, affiliation_number, accreditation, number_of_students, ' +
      'number_of_teachers, facilities, logo, mission_statement, vision_statement, ' +
      'school_board, extracurricular_activities) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        school_name, address, city, state, zip_code, country,
        contact_number, email_address, website, principal_name,
        established_year, school_type, grades_offered, affiliation_number,
        accreditation, number_of_students, number_of_teachers,
        facilities, logo, mission_statement, vision_statement,
        school_board, extracurricular_activities
      ]
    );

  
    res.status(201).json({ id: result.insertId , message:"School created successfully"});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// View School List
router.get('/schools', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM school_mst');
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Edit School Information
router.put('/schools/:id', async (req, res) => {
  const { id } = req.params;
  const {
    school_name, address, city, state, zip_code, country,
    contact_number, email_address, website, principal_name,
    established_year, school_type, grades_offered, affiliation_number,
    accreditation, number_of_students, number_of_teachers,
    facilities, logo, mission_statement, vision_statement,
    school_board, extracurricular_activities
  } = req.body;

  try {
    await pool.query(
      'UPDATE school_mst SET school_name = ?, address = ?, city = ?, state = ?, zip_code = ?, country = ?, ' +
      'contact_number = ?, email_address = ?, website = ?, principal_name = ?, established_year = ?, ' +
      'school_type = ?, grades_offered = ?, affiliation_number = ?, accreditation = ?, number_of_students = ?, ' +
      'number_of_teachers = ?, facilities = ?, logo = ?, mission_statement = ?, vision_statement = ?, ' +
      'school_board = ?, extracurricular_activities = ? WHERE school_id = ?',
      [
        school_name, address, city, state, zip_code, country,
        contact_number, email_address, website, principal_name,
        established_year, school_type, grades_offered, affiliation_number,
        accreditation, number_of_students, number_of_teachers,
        facilities, logo, mission_statement, vision_statement,
        school_board, extracurricular_activities, id
      ]
    );
    res.json({ message: 'School updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
  

module.exports = router;
