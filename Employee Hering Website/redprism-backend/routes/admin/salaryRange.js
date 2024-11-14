//imports
const express = require('express');
const router = express.Router();

const  SalaryRange = require("../../models/salary_range");

const { body, validationResult } = require('express-validator');
const verifyUser = require('../../middleware/adminVerifyUser');

const mongoose = require('mongoose');



// Define the route for adding a new salary range
router.post('/add', verifyUser,
  [
    body('salary_range').notEmpty().withMessage('Salary range is required!')
      .custom(async (value) => {
        const existingRange = await SalaryRange.findOne({ salary_range: value });
        if (existingRange) {
          return Promise.reject('Salary range already exists');
        }
      }),
    body('active').notEmpty().withMessage('Active is required!').isIn(['Yes', 'No']).withMessage('Active should be either "Yes" or "No"!'),

  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'] });
    } else {

        try {
            const { 
                    salary_range, 
                    details, 
                    active, 
                    loginEntryPermision 
                  } = req.body;

            if (loginEntryPermision !== "Yes") {
              return res.status(200).json({ status: 'error', mssg: 'User does not have permission to create' });
            }
            const newSalaryRange = await SalaryRange.create({

              salary_range:salary_range,
              details:details,
              active:active
              
            });
            res.status(200).json({ status: 'success', mssg: 'Salary range added successfully', data: newSalaryRange });
          } catch (error) {
            console.error(error.message);
            res.status(500).json({ status: 'error', mssg: 'Internal server error' });
        }
    }
  });



// Define the route for updating a salary range
router.post('/update', verifyUser,
  [
    body('salary_range_id').notEmpty().withMessage('Salary range ID is required!')
      .isMongoId().withMessage('Salary range ID Value Is Invalid !'),
    body('salary_range').notEmpty().withMessage('Salary range is required!'),
    body('active').notEmpty().withMessage('Active is required!').isIn(['Yes', 'No']).withMessage('Active should be either "Yes" or "No"!'),


  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'] });
    } else {

      try {
        const { 
                salary_range_id, 
                salary_range, 
                details, 
                active, 
                loginEditPermision 
              } = req.body;
       
        if (loginEditPermision !== "Yes") {
          return res.status(200).json({ status: 'error', mssg: 'User does not have permission to edit' });
        }

        const existingsalary = await SalaryRange.findOne
        ({
          _id: { $ne: salary_range_id },
          salary_range: salary_range,
        });

        if (existingsalary) {
          return res.status(200).json({ status: 'error', field: 'salary_range', mssg: 'Salary range already exists !' });
        }


        const updatedSalaryRange = await SalaryRange.findByIdAndUpdate(salary_range_id, {
          salary_range:salary_range,
          details:details,
          active:active
        }, { new: true });

        if (updatedSalaryRange) {
          res.status(200).json({ status: 'success', mssg: 'Salary range updated successfully', data: updatedSalaryRange });
        } else {
          res.status(200).json({ status: 'error', mssg: 'Salary range ID not found' });
        }
      } catch (error) {
        console.error(error.message);
        res.status(500).json({ status: 'error', mssg: 'Internal server error' });
      }
    }
  });



// Define the route for deleting a salary range
router.post('/delete', verifyUser,
  [
    body('salary_range_id').notEmpty().withMessage('Salary range ID is Empty !')
      .isMongoId().withMessage('Salary range ID Value Is Invalid !')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'] });
    } else {

      try {
        const salaryRangeId = req.body.salary_range_id;
        const loginDeletePermision = req.body.loginDeletePermision;

        if (loginDeletePermision !== "Yes") {
          return res.status(200).json({ status: 'error', mssg: 'User does not have permission to delete' });
        }

        const salaryRangeToDelete = await SalaryRange.findById(salaryRangeId);

        if (!salaryRangeToDelete) {
          return res.status(200).json({ status: 'error', mssg: 'Salary range not found' });
        }
        const result = await SalaryRange.findByIdAndDelete(salaryRangeId);
        if (result) {
          res.status(200).json({ status: 'success', mssg: 'Salary range deleted successfully' });
        } else {
          return res.status(200).json({ status: 'error', mssg: 'Failed to delete Salary range' });
        }
      } catch (error) {
        console.error(error.message);
        return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
      }
    }
  });


  
//.............................................................
// ROUTER 2 : get all experience by post method api :/api/admin/experience/get
//................................................ .............
router.get('/get', verifyUser, async (req, res) => {
    try 
    {
      let loginViewPermision = req.body.loginViewPermision;
        //check the login user have View permission
        if (loginViewPermision !== "Yes") {
        return res.status(200).json({ status: 'error', mssg: 'User does not have permission to view' });
      }
        const AllSalaryRange = await SalaryRange.find({}, { __v: 0});
        res.status(200).json({ status: 'sucess', mssg: 'All Salary Range fetch', data: AllSalaryRange });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ status: 'error', mssg: 'Internal server error' });  }
  });

module.exports = router;

