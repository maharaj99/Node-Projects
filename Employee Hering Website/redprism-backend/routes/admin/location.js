//imports
const express = require('express');
const router = express.Router();

const location = require("../../models/location_master");

const { body, validationResult } = require('express-validator');
const verifyUser = require('../../middleware/adminVerifyUser');

const mongoose = require('mongoose');



//.............................................................
// ROUTER 1 : add location by post method api :/api/admin/experience/add
//................................................ .............
router.post('/add', verifyUser,
  [
    body('state').notEmpty().withMessage('state is required!'),
    body('city').notEmpty().withMessage('city is required!'),
    body('area').notEmpty().withMessage('area is required!'),

    body('active').notEmpty().withMessage('Active is required!').isIn(['Yes', 'No']).withMessage('Active should be either "Yes" or "No"!'),


  ], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    } else {
      try 
      {
        const {
            state,
            city,
            area,
            active,
            loginEntryPermision
        } = req.body;

           //check the login user have entry permission
           if (loginEntryPermision !== "Yes") {
            return res.status(200).json({ status: 'error', mssg: 'User does not have permission to create ' });
          }

        // Check if a subcategory with the same name already exists
        const existinglocation = await location.findOne({ state,city,area });

          if (existinglocation) {
              return res.status(200).json({ status: 'error', field: 'tech_name', mssg: 'Location with the same data already exists!' });
          }
      

        const newlocation = await location.create({
            state:state,
            city:city,
            area:area,
            active: active,
        });

        res.status(200).json({ status: 'success', mssg: 'Location add successfully', data: newlocation });

      } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'server error', mssg: 'Location Server Error' });
      }
    }
  });



//.............................................................
// ROUTER 2 : get all location by post method api :/api/admin/experience/get
//................................................ .............
router.get('/get', verifyUser, async (req, res) => {
    try 
    {
      let loginViewPermision = req.body.loginViewPermision;
        //check the login user have View permission
        if (loginViewPermision !== "Yes") {
        return res.status(200).json({ status: 'error', mssg: 'User does not have permission to view' });
      }
        const Alllocation = await location.find({}, { __v: 0});
        res.status(200).json({ status: 'sucess', mssg: 'All location fetch', data: Alllocation });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ status: 'error', mssg: 'Internal server error' });  }
  });



//.............................................................
// ROUTER 3 : update all experience by post method api :/api/admin/experience/update
//................................................ .............
router.post('/update', verifyUser,[
    body('location_code').notEmpty().withMessage('location code is required!')
    .isMongoId().withMessage('experience code ID Value Is Invalid !'),
    
    body('state').notEmpty().withMessage('state is required!'),
    body('city').notEmpty().withMessage('city is required!'),
    body('area').notEmpty().withMessage('area is required!'),

    body('active').notEmpty().withMessage('Active is required!').isIn(['Yes', 'No']).withMessage('Active should be either "Yes" or "No"!'),

  ], async (req, res) => {
  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    } else {
  try {
  
        const {
            location_code,
            state,
            city,
            area,
            active,
            loginEditPermision
        } = req.body;
  
        //check the login user have View permission
        if (loginEditPermision !== "Yes") {
         return res.status(200).json({ status: 'error', mssg: 'User does not have permission to Edit' });
       }
  
          // Check if category same name in other _id already exists
          const existinglocation = await location.findOne({
            _id: { $ne: location_code },
            state:state,
            city:city,
            area:area,
           });
    
          if (existinglocation) {
                   return res.status(200).json({ status: 'error', field: 'experience', mssg: 'Location with the same name already exists!' });
            }
  
        const updatedlocation = await location.findByIdAndUpdate(location_code, {
            state:state,
            city:city,
            area:area,
          active: active,
        }, { new: true });
  
        if (updatedlocation) {
          res.status(200).json({ status: 'success', mssg: 'Location updated successfully', data: updatedlocation });
        } else {
          res.status(200).send({ status: 'error', mssg:'Location id not found'});
        }
  
      } catch (error) {
        console.log(error.message);
        return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
      }
    }
  });


//.............................................................
// ROUTER 4 : delete experience by post method api :/api/admin/experience/delete
//................................................ .............
router.post('/delete', verifyUser, [

    body('location_code')
      .notEmpty().withMessage('location code ID is Empty !')
      .isMongoId().withMessage('location code ID Value Is Invalid !'),
  
  ],
  
    async (req, res) => {
  
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        const errorsArray = errors.array();
        return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
      }
      else {
        try {
          const locationid = req.body.location_code;
  
          let loginDeletePermision = req.body.loginDeletePermision;
          //check the login user have View permission
          if (loginDeletePermision !== "Yes") {
           return res.status(200).json({ status: 'error', mssg: 'User does not have permission to Delete' });
         }
      
  
          const locationToDelete = await location.findById(locationid);
          if (!locationToDelete) {
            return res.status(200).json({ status: 'error', mssg: 'location not found' });
          }
  
          const result = await location.findByIdAndDelete(locationid);
          if (result) {
            res.status(200).json({ status: 'success', mssg: 'location deleted successfully' });
          } else {
            return res.status(200).json({ status: 'error', mssg: 'Failed to delete location' });
          }
        } catch (error) {
          console.log(error.message);
          return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
        }
      }
    });

  module.exports=router;