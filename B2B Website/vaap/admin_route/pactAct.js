// imports
const express = require('express');
const router = express.Router();
const PactAct = require('../model/pactAct_master');
const { body, validationResult } = require('express-validator');
const verifyUser = require('../middleware/adminverifyuser');
const fileuplods=require('../middleware/admin_uploadfiles');
const mongoose = require('mongoose');



//===============================================
// Insert Pact Act - POST Method
//===============================================
router.post('/insert', verifyUser,
fileuplods.userPactfiles, // Use your file upload middleware here

[
  // Add validation rules using express-validator
  body('customer_code')
    .notEmpty().withMessage('customer code is empty!')
    .isMongoId().withMessage('Invalid customer code value!'),

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
  body('business_license_number').isNumeric().withMessage('Invalid business license number format'),
  body('tabacco_license_number').isNumeric().withMessage('Invalid tobacco license number format'),

  body("upload_file_1")
  .custom((value, { req }) => {
    if ((!req.files.upload_file_1)) {
      throw new Error("upload file 1 is required");
    }
    return true;
  }),
  
  body("upload_file_2")
  .custom((value, { req }) => {
    if ((!req.files.upload_file_2)) {
      throw new Error("upload file 2 is required");
    }
    return true;
  }),
  
  body("upload_file_3")
  .custom((value, { req }) => {
    if ((!req.files.upload_file_3)) {
      throw new Error("upload file 3 is required");
    }
    return true;
  }),
], 
async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorsArray = errors.array();
    return res.status(200).json({ status: 'error', field: errorsArray[0]['param'], mssg: errorsArray[0]['msg'] });
  }

  try {
    const {
        userCode,
        customer_code,
        email,
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
        loginEntryPermision
    } = req.body;

    //check the login user have entry permission
    if (loginEntryPermision !== "Yes") {
        return res.status(200).json({
          status: "error",
          mssg: "User does not have permission to Create a Customer Cart",
        });
      }
      //customer code duplicate checking
      const existingCustomer = await PactAct.findOne({ customer_code:customer_code });

      if (existingCustomer) {
        return res.status(200).json({ status: 'error', mssg:"Customer already exists" });
      }

    const { upload_file_1, upload_file_2, upload_file_3 } = req.files || {};

    let upload_file1 = upload_file_1 ? upload_file_1[0].filename : '';
    let upload_file2 = upload_file_2 ? upload_file_2[0].filename : ''; 
    let upload_file3 = upload_file_3 ? upload_file_3[0].filename : ''; 

    // Create a new record
    const newRecord = await PactAct.create({
        customer_code:customer_code,
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
        upload_file_1:"pact_Act_files/"+upload_file1,
        upload_file_2: "pact_Act_files/"+upload_file2,
        upload_file_3: "pact_Act_files/"+upload_file3,
        entry_user_code:userCode
    });

    return res.status(200).json({ status: 'success', mssg: 'Data Inserted Successfully', id: newRecord._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', mssg: 'Server Error' });
  }
});



//===================================
//update
//====================================
router.post('/update', verifyUser,
fileuplods.userPactfiles, // Use your file upload middleware here

[
    body('customer_code')
    .notEmpty().withMessage('customer code is empty!')
    .isMongoId().withMessage('Invalid customer code value!'),

    body('pact_code')
    .notEmpty().withMessage('pact code is empty!')
    .isMongoId().withMessage('pact code value!'),


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
  body('business_license_number').isNumeric().withMessage('Invalid business license number format'),
  body('tabacco_license_number').isNumeric().withMessage('Invalid tobacco license number format'),
  ], async (req, res) => {
  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    } 
    else 
    {
    try {
            const pactId = req.body.pact_code;
    
            const {
                userCode,
                customer_code,
                email,
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
                loginEditPermision
            } = req.body;
    
            //check the login user have View permission
            if (loginEditPermision !== "Yes") {
            return res.status(200).json({ status: 'error', mssg: 'User does not have permission to Edit' });
        }
    
            // Check if category same name in other _id already exists
            const existingcategory = await PactAct.findOne({
                _id: { $ne: pactId },
                customer_code: customer_code,
            });
        
            if (existingcategory) {
                    return res.status(200).json({ status: 'error', field: 'customer_code', mssg: 'customer already exists!' });
                }

            const { upload_file_1, upload_file_2, upload_file_3 } = req.files || {};
            let filename1
            let filename2
            let filename3
        
                const existingUser = await PactAct.findById(pactId);
                if (existingUser) {
                    filename1= existingUser.upload_file_1
                    filename2= existingUser.upload_file_2
                    filename3= existingUser.upload_file_3

                }
        
                if(upload_file_1){
                filename1 = upload_file_1 ? "pact_Act_files/"+upload_file_1[0].filename : "";
                }
                else if(upload_file_2){
                filename2 = upload_file_2 ? "pact_Act_files/"+upload_file_2[0].filename : "";
                }
                else if(upload_file_3 ){
                    filename3 = upload_file_3 ? "pact_Act_files/"+upload_file_3[0].filename : "";
                }
    
            const updatedpact = await PactAct.findByIdAndUpdate(pactId, {
                customer_code:customer_code,
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
                upload_file_1:filename1,
                upload_file_2:filename2,
                upload_file_3:filename3,
                entry_user_code:userCode
            }, { new: true });

            
    
            if (updatedpact) {
            res.status(200).json({ status: 'success', mssg: 'pact updated successfully', data: updatedpact });
            } else {
            res.status(200).send({ status: 'error', mssg:'pact id not found'});
            }
    
        } catch (error) {
            console.log(error.message);
            return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
        }
    }
});



//==================================
//get all pact 
//==================================
router.get('/pactGet',verifyUser,  
    async (req, res) => {
    try {
  
      let loginViewPermision = req.body.loginViewPermision;
       //check the login user have View permission
       if (loginViewPermision !== "Yes") {
        return res.status(200).json({ status: 'error', mssg: 'User does not have permission to view' });
      }
  
      const pactId = req.body.pact_code;
  
        const AllPactAct = await PactAct.aggregate([
  
            {
              $lookup: {
                from: 'customer_master',
                localField: 'customer_code',
                foreignField: '_id',
                as:'customer_master'
            }
            },
            {
              $sort:{
                entry_timestamp:-1
              }
            },
            {
                $project: {
                    "_id": 1,
                    "email":1,
                    "owner_legal_firstname":1,
                    "owner_legal_lastname":1,
                    "legal_company_name":1,
                    "street_adress":1,
                    "adress_line_2":1,
                    "city":1,
                    "select_state":1,
                    "zipcode":1,
                    "phone_number":1,
                    "FEIN":1,
                    "business_license_number":1,
                    "tabacco_license_number":1,
                    "upload_file_1":1,
                    "upload_file_2":1,
                    "upload_file_3":1,
                    "customer_master._id":1,
                    "customer_master.customer_name":1
                   
                }
            }
  
        ])
        if (AllPactAct.length === 0) {
            return res.status(200).json({ status: 'error', mssg: 'pact not found' });
        }
    
        return res.status(200).json({ status: 'success', mssg: 'All pact fetched successfully', data:AllPactAct });
    
    }  
    catch (error) {
      console.log(error);
      res.status(500).json({ status: 'server error', mssg: 'Internal Server Error' });
    }
  });
  

//===========================
//Delete
//===========================
router.post('/deletePact', verifyUser,[

    body('pact_code')
        .notEmpty().withMessage('pact code ID is Empty !')
        .isMongoId().withMessage('pact  code ID Value Is Invalid !'),
  
  ], 
  
  async (req, res) => {
    
          const errors = validationResult(req)
          if (!errors.isEmpty()) {
              const errorsArray = errors.array();
              return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
          }
          else {
    try {
  
          let loginDeletePermision = req.body.loginDeletePermision;
          //check the login user have View permission
          if (loginDeletePermision !== "Yes") {
          return res.status(200).json({ status: 'error', mssg: 'User does not have permission to Delete' });
        }
        
        const pactId = req.body.pact_code;
  
        const subpactToDelete = await PactAct.findById(pactId);
        if (!subpactToDelete) {
            return res.status(200).json({ status: 'error', mssg: 'pact not found' });
        }
  
        const result = await PactAct.findByIdAndDelete(pactId);
        if (result) {
            res.status(200).json({ status: 'success', mssg: 'pact act deleted successfully' });
        } else {
            return res.status(200).json({ status: 'error', mssg: 'Failed to delete pact Act' });
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ status: 'error', mssg: 'Internal server error' });  }
  }
  });

module.exports = router;
