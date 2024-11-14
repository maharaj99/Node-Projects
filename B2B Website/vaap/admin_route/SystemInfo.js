// imports
const express = require('express');
const router = express.Router();
const sysapi = require('../model/systemConfigSchema');
const { body, validationResult } = require('express-validator');
const Sysapi = require('../middleware/admin_uploadfiles');
const verifyUser = require('../middleware/adminverifyuser');




// .............................................................
// ROUTER 1 : post method api : /admin/systemConfig/add/SystemInfo
// .............................................................

router.post('/add/SystemInfo',
  verifyUser,
  Sysapi.systemConfigImage,
  [
    // Add validation rules using express-validator
    body('system_name').notEmpty().withMessage('system name is required'),
    body('email').notEmpty().withMessage('email is required'),
    body('address').notEmpty().withMessage('address is required'),
    body('ph_num').notEmpty().withMessage('ph_num is required'),


  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const errorsArray = errors.array();
        return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    } 

    try {
        const {
          userCode,
          system_name,
          email,
          address,
          ph_num,
          facebook,
          instagram,
          youtube,
          loginEntryPermision,
          loginEditPermision
        } = req.body;
        
        
       //check the login user have View permission
       if (loginEditPermision !== "Yes") {
        return res.status(200).json({ status: 'error', mssg: 'User does not have permission to Edit' });
      }

        //here files name must be match in middleware files name
        const { logo, favicon } = req.files || {};

    

      // Check if a record exists
      const existingRecord = await sysapi.findOne();

      if (existingRecord) {
        // Update the existing record
        
        // Update logo and favicon only if provided
        const updateData = {
          system_name: system_name,
          email: email,
          address: address,
          ph_num: ph_num,
          facebook: facebook,
          instagram: instagram,
          youtube: youtube,
          entry_user_code:userCode
        };

        if (logo) {
          updateData.logo ="systemInfo_images/"+ logo[0].filename;
        }

        if (favicon) {
          updateData.favicon ="systemInfo_images/"+ favicon[0].filename;
        }

        await sysapi.findByIdAndUpdate(existingRecord._id, updateData);

        return res.status(200).json({ status: 'success', mssg: 'Data Updated Successfully', id: existingRecord._id });
      }
      //when first time data entry;
      else {

       //check the login user have entry permission
       if (loginEntryPermision !== "Yes") {
        return res.status(200).json({ status: 'error', mssg: 'User does not have permission to create ' });
      }

        // Check if logo and favicon files are present for initial insert
        if (!logo || !favicon) {
          return res.status(200).json({ status: 'error', mssg: 'Logo and favicon are required' });
        }

        let Logo = logo ? logo[0].filename : '';
        let Favicon = favicon ? favicon[0].filename : ''; 


        const newRecord = await sysapi.create({
          system_name: system_name,
          logo:"systemInfo_images/"+Logo,
          favicon:"systemInfo_images/"+ Favicon,
          email: email,
          address: address,
          ph_num: ph_num,
          facebook: facebook,
          instagram: instagram,
          youtube: youtube,
          entry_user_code:userCode

        });

        return res.status(200).json({ status: 'success', mssg: 'Data Inserted Successfully', id: newRecord._id });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }
});



// .............................................................
// ROUTER 2 : Get method api : /admin/systemConfig/systemInfo/get
// .............................................................

router.get('/systemInfo/get',verifyUser, async (req, res) => {
  try {
    let loginViewPermision = req.body.loginViewPermision;
    //check the login user have View permission
    if (loginViewPermision !== "Yes") {
     return res.status(200).json({ status: 'error', mssg: 'User does not have permission to view' });
   }
    
    const ConfigData = await sysapi.find({}, {_id:1 ,__v: 0});
    // res.send(compdetails);
    res.status(200).json({ status: 'sucess', mssg: 'System Configuration data fetch', data: ConfigData });
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
});






module.exports = router;





