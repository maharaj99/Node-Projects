//imports
const express = require('express');
const router = express.Router();

const Employee = require("../../models/EmployeeDetails");

const { body, validationResult } = require('express-validator');
const verifyUser = require('../../middleware/adminVerifyUser');

const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');


//insert
router.post('/add', verifyUser,
  [
    body('employee_type').notEmpty().withMessage('Employee type is required!')
      .isIn(['Hr', 'Job Seeker']).withMessage('Invalid employee type'),

    body('employee_status').optional(),

    body('first_name').notEmpty().withMessage('First name is required!'),
    body('last_name').notEmpty().withMessage('Last name is required!'),
    body('user_name').notEmpty().withMessage('User name is required!')
      .isLength({ max: 50 }).withMessage('User name should be less than 50 characters')
      .custom(async (value) => {
        const existingEmployee = await Employee.findOne({ user_name: value });
        if (existingEmployee) {
          return Promise.reject('User name already exists');
        }
      }),
    body('password').notEmpty().withMessage('Password is required!'),
    body('ph_num').notEmpty().withMessage('Phone number is required!')
      .isNumeric().withMessage('Phone number must be numeric')
      .isLength({ max: 10 }).withMessage('Phone number should be 10 digits long')
      .custom(async (value) => {
        const existingEmployee = await Employee.findOne({ ph_num: value });
        if (existingEmployee) {
          return Promise.reject('Phone number already exists');
        }
      }),
    body('email_id').notEmpty().withMessage('Email ID is required!')
      .isEmail().withMessage('Invalid email format')
      .custom(async (value) => {
        const existingEmployee = await Employee.findOne({ email_id: value });
        if (existingEmployee) {
          return Promise.reject('Email ID already exists');
        }
      }),

      body('looking_job').notEmpty().withMessage('looking_job is required!').isIn(['Yes', 'No']).withMessage('looking_job should be either "Yes" or "No"!'),

      body('notice_period').notEmpty().withMessage('notice_period is required!').isIn(['Yes', 'No']).withMessage('notice_period should be either "Yes" or "No"!'),

      body('immediate_joinner').notEmpty().withMessage('immediate_joinner is required!').isIn(['Yes', 'No']).withMessage('immediate_joinner should be either "Yes" or "No"!'),

      body('fresher').notEmpty().withMessage('fresher is required!').isIn(['Yes', 'No']).withMessage('fresher should be either "Yes" or "No"!'),

      body('active').notEmpty().withMessage('Active is required!').isIn(['Yes', 'No']).withMessage('Active should be either "Yes" or "No"!'),


  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({ status: 'error', field: errorsArray[0]['param'], mssg: errorsArray[0]['msg'] });
    } else {
      try {
        const {
          employee_type, employee_status, first_name, last_name,
          user_name, password, ph_num, email_id, company_code, tech_code, exp_code, location_code,
          looking_job, notice_period, immediate_joinner, fresher, active,
          loginEntryPermision
        } = req.body;

        if (loginEntryPermision !== "Yes") {
          return res.status(200).json({ status: 'error', mssg: 'User does not have permission to create' });
        }

        const full_name = `${first_name} ${last_name}`;

        const salt = await bcrypt.genSalt(10);
        const encodedPassword = await bcrypt.hash(password, salt);

        const newEmployee = await Employee.create({
            employee_type:employee_type, 
            employee_status:employee_status, 
            first_name:first_name, 
            last_name:last_name,
            full_name:full_name, 
            user_name:user_name, 
            password:encodedPassword, 
            ph_num:ph_num, 
            email_id:email_id, 
            company_code:company_code, 
            tech_code:tech_code, 
            exp_code:exp_code, 
            location_code:location_code,
            looking_job:looking_job, 
            notice_period:notice_period, 
            immediate_joinner:immediate_joinner, 
            fresher:fresher, 
            active:active
        });

        res.status(200).json({ status: 'success', mssg: 'Employee added successfully', data: newEmployee });
      } catch (error) {
        console.error(error.message);
        res.status(500).json({ status: 'error', mssg: 'Internal server error' });
      }
    }
  });



//update
router.post('/update', verifyUser,
  [
    body('employer_code').notEmpty().withMessage('Employer code is required!')
      .isMongoId().withMessage('Employer code ID Value Is Invalid !'),

    body('employee_type').notEmpty().withMessage('Employee type is required!')
          .isIn(['Hr', 'Job Seeker']).withMessage('Invalid employee type'),
    
        body('employee_status').optional(),
    
        body('first_name').notEmpty().withMessage('First name is required!'),
        body('last_name').notEmpty().withMessage('Last name is required!'),
        body('user_name').notEmpty().withMessage('User name is required!')
          .isLength({ max: 50 }).withMessage('User name should be less than 50 characters'),

        body('password').notEmpty().withMessage('Password is required!'),
        body('ph_num').notEmpty().withMessage('Phone number is required!')
          .isNumeric().withMessage('Phone number must be numeric')
          .isLength({ max: 10 }).withMessage('Phone number should be 10 digits long'),
        body('email_id').notEmpty().withMessage('Email ID is required!')
          .isEmail().withMessage('Invalid email format'),
    
          body('looking_job').notEmpty().withMessage('looking_job is required!').isIn(['Yes', 'No']).withMessage('looking_job should be either "Yes" or "No"!'),
    
          body('notice_period').notEmpty().withMessage('notice_period is required!').isIn(['Yes', 'No']).withMessage('notice_period should be either "Yes" or "No"!'),
    
          body('immediate_joinner').notEmpty().withMessage('immediate_joinner is required!').isIn(['Yes', 'No']).withMessage('immediate_joinner should be either "Yes" or "No"!'),
    
          body('fresher').notEmpty().withMessage('fresher is required!').isIn(['Yes', 'No']).withMessage('fresher should be either "Yes" or "No"!'),
    
          body('active').notEmpty().withMessage('Active is required!').isIn(['Yes', 'No']).withMessage('Active should be either "Yes" or "No"!'),
    
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({ status: 'error', field: errorsArray[0]['param'], mssg: errorsArray[0]['msg'] });
    } else {
      try {
        const {
            employer_code,
            employee_type, employee_status, first_name, last_name,
            user_name, password, ph_num, email_id, company_code, tech_code, exp_code, location_code,
            looking_job, notice_period, immediate_joinner, fresher, active,
            loginEditPermision
        } = req.body;

        const full_name = `${first_name} ${last_name}`;


        // Check if the login user has Edit permission
        if (loginEditPermision !== "Yes") {
          return res.status(200).json({ status: 'error', mssg: 'User does not have permission to Edit' });
        }

        // Check if a company with the same phone number exists (excluding the current company)
        const existingPhone = await Employee.findOne({
          _id: { $ne: employer_code },
                ph_num,
        });

        if (existingPhone) {
          return res.status(200).json({ status: 'error', field: 'ph_num', mssg: 'Employer with the same phone number   already exists!' });
        }
        const existingName = await Employee.findOne({
          _id: { $ne: employer_code },
                user_name,
        });

        if (existingName) {
          return res.status(200).json({ status: 'error', field: 'ph_num', mssg: 'Employer with the same name already exists!' });
        }
        const existingEmail = await Employee.findOne({
          _id: { $ne: employer_code },

                email_id
        });

        if (existingEmail) {
          return res.status(200).json({ status: 'error', field: 'ph_num', mssg: 'Employer with the same email  already exists!' });
        }

        const salt = await bcrypt.genSalt(10);
        const encodedPassword = await bcrypt.hash(password, salt);

        const updatedEmployer = await Employee.findByIdAndUpdate(employer_code, {
            employee_type:employee_type, 
            employee_status:employee_status, 
            first_name:first_name, 
            last_name:last_name,
            full_name:full_name, 
            user_name:user_name, 
            password:encodedPassword, 
            ph_num:ph_num, 
            email_id:email_id, 
            company_code:company_code, 
            tech_code:tech_code, 
            exp_code:exp_code, 
            location_code:location_code,
            looking_job:looking_job, 
            notice_period:notice_period, 
            immediate_joinner:immediate_joinner, 
            fresher:fresher, 
            active:active
        }, { new: true });

        if (updatedEmployer) {
          res.status(200).json({ status: 'success', mssg: 'Employer details updated successfully', data: updatedEmployer });
        } else {
          res.status(200).send({ status: 'error', mssg: 'Employer code not found' });
        }

      } catch (error) {
        console.log(error.message);
        return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
      }
    }
  });



//get
router.get('/getEmployeeDetails', verifyUser, async (req, res) => {
    try {
        let loginViewPermision = req.body.loginViewPermision;
        //check the login user have View permission
        if (loginViewPermision !== "Yes") {
        return res.status(200).json({ status: 'error', mssg: 'User does not have permission to view' });
      }

      const Employer = await Employee.aggregate([
        {
          $lookup: {
            from: 'company_details',
            localField: 'company_code',
            foreignField: '_id',
            as: 'company_details'
          }
        },
        {
            $lookup: {
              from: 'technology',
              localField: 'tech_code',
              foreignField: '_id',
              as: 'technology'
            }
          },
          {
            $lookup: {
              from: 'experience_master',
              localField: 'exp_code',
              foreignField: '_id',
              as: 'experience_master'
            }
          },
          {
            $lookup: {
              from: 'location',
              localField: 'location_code',
              foreignField: '_id',
              as: 'location'
            }
          },
        {
          $project: {
            "employee_type":1,
            "employee_status":1 ,
            "status_icon": 1,
            "first_name": 1,
            "last_name": 1,
            "full_name":1,
            "user_name":1,
            "password":1 ,
            "ph_num":1,
            "email_id": 1,
            "employee_image": 1,
            "employee_avatar": 1,
            "resume": 1,
            "achievement": 1,

            "company_details._id":1 ,
            "company_details.company_name":1,

            "technology._id":1 ,
            "technology.tech_name":1 ,

            "experience_master._id":1,
            "experience_master.experience":1,

            "location._id":1 ,
            "location.state":1,
            "location.city":1,
            "location.area":1,


            "looking_job": 1,
            "notice_period":1,
            "immediate_joinner": 1,
            "fresher": 1,
            "active": 1,
  
          }
        }
      ])
      if (Employer.length === 0) {
        return res.status(200).json({ status: 'error', mssg: 'Employer details not found' });
      }
  
      return res.status(200).json({ status: 'success', mssg: 'Employer detailsfetched successfully', data: Employer });
  
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
    }
  });



//delete
router.post('/delete', verifyUser, [

    body('employer_code').notEmpty().withMessage('Employer code is required!')
    .isMongoId().withMessage('Employer code ID Value Is Invalid !'),
  
  ],
  
    async (req, res) => {
  
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        const errorsArray = errors.array();
        return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
      }
      else {
        try {
          const employer_code = req.body.employer_code;
  
          let loginDeletePermision = req.body.loginDeletePermision;
          //check the login user have View permission
          if (loginDeletePermision !== "Yes") {
           return res.status(200).json({ status: 'error', mssg: 'User does not have permission to Delete' });
         }
      
  
          const EmployeeToDelete = await Employee.findById(employer_code);
          if (!EmployeeToDelete) {
            return res.status(200).json({ status: 'error', mssg: 'Employee not found' });
          }
  
          const result = await Employee.findByIdAndDelete(employer_code);
          if (result) {
            res.status(200).json({ status: 'success', mssg: 'Employee deleted successfully' });
          } else {
            return res.status(200).json({ status: 'error', mssg: 'Failed to delete Employee' });
          }
        } catch (error) {
          console.log(error.message);
          return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
        }
      }
    });


//get company list
const CompanyDetails = require('../../models/company_details');

router.get('/CompanyDetails/list', verifyUser, async (req, res) => {
  try {

    let loginViewPermision = req.body.loginViewPermision;
    //check the login user have View permission
    if (loginViewPermision !== "Yes") {
      return res.status(200).json({ status: 'error', mssg: 'User does not have permission to view' });
    }
    const companyDetails = await CompanyDetails.find({active:"Yes"},{_id:1,company_name:1});
    res.status(200).json({ status: 'success', data: companyDetails, mssg: 'Company details fatched' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ status: 'error', mssg: 'Internal server error' });
  }
});


//get location list
const location = require("../../models/location_master");

router.get('/location/list', verifyUser, async (req, res) => {
  try 
  {
    let loginViewPermision = req.body.loginViewPermision;
      //check the login user have View permission
      if (loginViewPermision !== "Yes") {
      return res.status(200).json({ status: 'error', mssg: 'User does not have permission to view' });
    }
      const Alllocation = await location.find({active:"Yes"}, { _id: 1,state:1,city:1,area:1});
      res.status(200).json({ status: 'sucess', mssg: 'All location fetch', data: Alllocation });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ status: 'error', mssg: 'Internal server error' });  }
});


//get technology list
const technology = require("../../models/technology_master");

router.get('/technology/list', verifyUser, async (req, res) => {
  try 
  {
    let loginViewPermision = req.body.loginViewPermision;
      //check the login user have View permission
      if (loginViewPermision !== "Yes") {
      return res.status(200).json({ status: 'error', mssg: 'User does not have permission to view' });
    }
      const technologys = await technology.find({active:"Yes"}, { _id:1,tech_name:1});
      res.status(200).json({ status: 'sucess', mssg: 'All Technology fetch', data: technologys });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ status: 'error', mssg: 'Internal server error' });  }
});


//get experiences list
const experiences = require("../../models/experience_master");

router.get('/experiences/list', verifyUser, async (req, res) => {
  try 
  {
    let loginViewPermision = req.body.loginViewPermision;
      //check the login user have View permission
      if (loginViewPermision !== "Yes") {
      return res.status(200).json({ status: 'error', mssg: 'User does not have permission to view' });
    }
      const Allexperience = await experiences.find({active:"Yes"}, {_id:1,experience:1});
      res.status(200).json({ status: 'sucess', mssg: 'All Experience fetch', data: Allexperience });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ status: 'error', mssg: 'Internal server error' });  }
});


module.exports = router;
