const express = require('express');

const { body, validationResult } = require('express-validator');
const verifyUser = require('../../middleware/adminVerifyUser');

const mongoose = require('mongoose');

const CompanyDetails = require('../../models/company_details');

const router = express.Router();


//insert
router.post('/add', verifyUser,
  [
    body('company_name').notEmpty().withMessage('Company name is required!')
      .custom(async (value) => {
        const existingCompany = await CompanyDetails.findOne({ company_name: value });
        if (existingCompany) {
          return Promise.reject('Company with the same name already exists');
        }
      }),
    body('ph_num').notEmpty().withMessage('Phone number is required!')
      .isNumeric().withMessage('Phone number must be numeric')
      .isLength({ max: 10 }).withMessage('Phone number should be 10 digits long'),
    body('logo').optional(),
    body('banner').optional(),
    body('active').notEmpty().withMessage('Active is required!').isIn(['Yes', 'No']).withMessage('Active should be either "Yes" or "No"!'),

  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'] });
    } else {
      try {
        const
          {
            company_name,
            ph_num,
            logo,
            banner,
            active,
            loginEntryPermision
          } = req.body;

        if (loginEntryPermision !== "Yes") {
          return res.status(200).json({ status: 'error', mssg: 'User does not have permission to create' });
        }

        const existingCompanyName = await CompanyDetails.findOne
          ({
            company_name: company_name
          });

        if (existingCompanyName) {
          return res.status(200).json({ status: 'error', mssg: 'Company Name already exists !' });
        }

        const existingPhNum = await CompanyDetails.findOne
          ({
            ph_num: ph_num
          });

        if (existingPhNum) {
          return res.status(200).json({ status: 'error', mssg: 'Phone Number already exists !' });
        }

        const newCompanyDetails = await CompanyDetails.create({
          company_name,
          ph_num,
          logo,
          banner,
          active
        });
        res.status(200).json({ status: 'success', mssg: 'Company details added successfully', data: newCompanyDetails });
      } catch (error) {
        console.error(error.message);
        res.status(500).json({ status: 'error', mssg: 'Internal server error' });
      }
    }
  });



router.post('/update', verifyUser,
  [
    body('company_id').notEmpty().withMessage('Company ID is required!')
      .isMongoId().withMessage('Company ID Value Is Invalid !'),
    body('company_name').notEmpty().withMessage('Company name is required!'),
    body('ph_num').notEmpty().withMessage('Phone number is required!')
      .isNumeric().withMessage('Phone number must be numeric')
      .isLength({ max: 10 }).withMessage('Phone number should be 10 digits long'),

    body('active').notEmpty().withMessage('Active is required!').isIn(['Yes', 'No']).withMessage('Active should be either "Yes" or "No"!'),

  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'] });
    } else {
      try {
        const {
          company_id,
          company_name,
          ph_num,
          logo,
          banner,
          active,
          loginEditPermision
        } = req.body;

        if (loginEditPermision !== "Yes") {
          return res.status(200).json({ status: 'error', mssg: 'User does not have permission to edit' });
        }

        const existingCompanyName = await CompanyDetails.findOne
          ({
            _id: { $ne: company_id },
            company_name: company_name
          });

        if (existingCompanyName) {
          return res.status(200).json({ status: 'error', mssg: 'Company Name already exists !' });
        }

        const existingPhNum = await CompanyDetails.findOne
          ({
            _id: { $ne: company_id },
            ph_num: ph_num
          });

        if (existingPhNum) {
          return res.status(200).json({ status: 'error', mssg: 'Phone Number already exists !' });
        }

        const updatedCompanyDetails = await CompanyDetails.findByIdAndUpdate(company_id, {
          company_name: company_name,
          ph_num: ph_num,
          logo: logo,
          banner: banner,
          active: active
        }, { new: true });
        if (updatedCompanyDetails) {
          res.status(200).json({ status: 'success', mssg: 'Company details updated successfully', data: updatedCompanyDetails });
        } else {
          res.status(200).json({ status: 'error', mssg: 'Company ID not found' });
        }
      } catch (error) {
        console.error(error.message);
        res.status(500).json({ status: 'error', mssg: 'Internal server error' });
      }
    }
  });



router.post('/delete', verifyUser,
  [
    body('company_id').notEmpty().withMessage('Company ID is Empty !')
      .isMongoId().withMessage('Company ID Value Is Invalid !'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'] });
    } else {
      try {
        const companyId = req.body.company_id;
        const loginDeletePermision = req.body.loginDeletePermision;
        if (loginDeletePermision !== "Yes") {
          return res.status(200).json({ status: 'error', mssg: 'User does not have permission to delete' });
        }
        const companyToDelete = await CompanyDetails.findById(companyId);
        if (!companyToDelete) {
          return res.status(200).json({ status: 'error', mssg: 'Company details not found' });
        }
        const result = await CompanyDetails.findByIdAndDelete(companyId);
        if (result) {
          res.status(200).json({ status: 'success', mssg: 'Company details deleted successfully' });
        } else {
          return res.status(200).json({ status: 'error', mssg: 'Failed to delete company details' });
        }
      } catch (error) {
        console.error(error.message);
        return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
      }
    }
  });



router.get('/list', verifyUser, async (req, res) => {
  try {

    let loginViewPermision = req.body.loginViewPermision;
    //check the login user have View permission
    if (loginViewPermision !== "Yes") {
      return res.status(200).json({ status: 'error', mssg: 'User does not have permission to view' });
    }
    const companyDetails = await CompanyDetails.find();
    res.status(200).json({ status: 'success', data: companyDetails, mssg: 'Company details fatched' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ status: 'error', mssg: 'Internal server error' });
  }
});

module.exports = router;
