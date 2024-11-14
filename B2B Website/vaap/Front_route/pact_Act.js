// imports
const express = require('express');
const router = express.Router();
const pact = require('../model/pactAct_master');
const { body, validationResult } = require('express-validator');
const verifyUser = require('../middleware/customerverifyuser');
const fileuplods=require('../middleware/front_uploadfiles');

//===============================================
//get pact act :get method:
//===============================================
router.get('/get', verifyUser, async (req, res) => {
    try {
      if (req.body.userCode === "") {
        // Handle the case where userCode is empty (no auth token provided)
        res.status(200).json({
          status: 'success',
          mssg: 'Customer inavalid',
        });
      }
      else {
        let customerCode = req.body.userCode;
  
        const pactAct = await pact.find({ customer_code: customerCode }, {});
        if(pactAct.length==0){
           return res.status(200).json({ status: 'error', mssg: 'pact Act not found' });
        }
        else{   
          return res.status(200).json({
            status: 'success',
            mssg: 'Customer pact act fetch',
            data: pactAct,
          });
        }
      }
    } catch (error) {
      console.log(error.message);
        res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }
  });




//===============================================
//insert pact act :post method:
//===============================================

router.post('/insert',
  verifyUser,
  fileuplods.userPactfiles, // Use your file upload middleware here
  [
    // Add validation rules using express-validator
    body('email').isEmail().withMessage('Invalid email format'),
    body('owner_legal_firstname').notEmpty().withMessage('Owner first name is required'),
    body('owner_legal_lastname').notEmpty().withMessage('Owner last name is required'),
    body('legal_company_name').notEmpty().withMessage('Legal company name is required'),
    body('street_adress').notEmpty().withMessage('Street address is required'),
    body('adress_line_2').notEmpty().withMessage('Address line 2 is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('select_state').notEmpty().withMessage('State is required'),
    body('zipcode').isNumeric().withMessage('Invalid zipcode format'),
    body('phone_number').isNumeric().withMessage('Invalid phone number format'),
    body('FEIN').isNumeric().withMessage('FEIN is required'),
    body('business_license_number').isNumeric().withMessage('Invali business license number format'),
    body('tabacco_license_number').isNumeric().withMessage('Invalid tobacco license number format'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({ status: 'error', field: errorsArray[0]['param'], mssg: errorsArray[0]['msg'] });
    }

    try {
      const {
        email,
        userCode,
        owner_legal_firstname,
        owner_legal_lastname,
        legal_company_name,
        street_adress,
        adress_line_2,
        city,
        select_state,
        zipcode,
        phone_number,
        FEIN,
        business_license_number,
        tabacco_license_number,
      } = req.body;

      const { upload_file_1, upload_file_2, upload_file_3 } = req.files || {};


      // Check if a record exists
      const existingRecord = await pact.findOne({ email });

      if (existingRecord) {
        // Update the existing record

        const updateData = {
          customer_code:userCode,
          email:email,
          owner_legal_firstname:owner_legal_firstname,
          owner_legal_lastname:owner_legal_lastname,
          legal_company_name:legal_company_name,
          street_adress:street_adress,
          adress_line_2:adress_line_2,
          city:city,
          select_state:select_state,
          zipcode:zipcode,
          phone_number:phone_number,
          FEIN:FEIN,
          business_license_number:business_license_number,
          tabacco_license_number:tabacco_license_number,
        };

        // Update uploaded files if provided
        if (req.files) {
          if (req.files.upload_file_1) {
            updateData.upload_file_1 ="pact_Act_files/"+ req.files.upload_file_1[0].filename;
          }
          if (req.files.upload_file_2) {
            updateData.upload_file_2 = "pact_Act_files/"+req.files.upload_file_2[0].filename;
          }
          if (req.files.upload_file_3) {
            updateData.upload_file_3 = "pact_Act_files/"+req.files.upload_file_3[0].filename;
          }
        }

        await pact.findByIdAndUpdate(existingRecord._id, updateData);

        return res.status(200).json({ status: 'success', mssg: 'Data Updated Successfully', id: existingRecord._id });
      }
      else {

        // Create a new record
        // Check if logo and favicon files are present for initial insert
        if (!upload_file_1 || !upload_file_2 || !upload_file_3) {
          return res.status(200).json({ status: 'error', mssg: 'files are required' });
        }

        let upload_file1 = upload_file_1 ? upload_file_1[0].filename : '';
        let upload_file2 = upload_file_2 ? upload_file_2[0].filename : ''; 
        let upload_file3 = upload_file_3 ? upload_file_3[0].filename : ''; 


        const newRecord = await pact.create({
          email:email,
          customer_code:userCode,
          owner_legal_firstname:owner_legal_firstname,
          owner_legal_lastname:owner_legal_lastname,
          legal_company_name:legal_company_name,
          street_adress:street_adress,
          adress_line_2:adress_line_2,
          city:city,
          select_state:select_state,
          zipcode:zipcode,
          phone_number:phone_number,
          FEIN:FEIN,
          business_license_number:business_license_number,
          tabacco_license_number:tabacco_license_number,
          upload_file_1:"pact_Act_files/"+upload_file1,
          upload_file_2: "pact_Act_files/"+upload_file2,
          upload_file_3: "pact_Act_files/"+upload_file3
        });
        

        return res.status(200).json({ status: 'success', mssg: 'Data Inserted Successfully', id: newRecord._id });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }
  });

module.exports = router;