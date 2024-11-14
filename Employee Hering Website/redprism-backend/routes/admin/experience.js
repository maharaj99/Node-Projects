//imports
const express = require('express');
const router = express.Router();

const experiences = require("../../models/experience_master");

const { body, validationResult } = require('express-validator');
const verifyUser = require('../../middleware/adminVerifyUser');

const mongoose = require('mongoose');


//.............................................................
// ROUTER 1 : add experience by post method api :/api/admin/experience/add
//................................................ .............
router.post('/add', verifyUser,
  [
    body('experience').notEmpty().withMessage('experience is required!'),

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
            experience,
            details,
            active,
            loginEntryPermision
        } = req.body;

           //check the login user have entry permission
           if (loginEntryPermision !== "Yes") {
            return res.status(200).json({ status: 'error', mssg: 'User does not have permission to create ' });
          }

        // Check if a subcategory with the same name already exists
        const existingexperience = await experiences.findOne({ experience });

          if (existingexperience) {
              return res.status(200).json({ status: 'error', field: 'tech_name', mssg: 'Experiences with the same year already exists!' });
          }
      

        const newExperiences = await experiences.create({
            experience: experience,
            details: details,
            active: active,
        });

        res.status(200).json({ status: 'success', mssg: 'Experience add successfully', data: newExperiences });

      } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'server error', mssg: 'Internal Server Error' });
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
        const Allexperience = await experiences.find({}, { __v: 0});
        res.status(200).json({ status: 'sucess', mssg: 'All Experience fetch', data: Allexperience });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ status: 'error', mssg: 'Internal server error' });  }
  });





//.............................................................
// ROUTER 3 : update all experience by post method api :/api/admin/experience/update
//................................................ .............
router.post('/update', verifyUser,[
    body('experience_code').notEmpty().withMessage('experience code is required!')
    .isMongoId().withMessage('experience code ID Value Is Invalid !'),
    
    body('experience').notEmpty().withMessage('experience is required!'),

    body('active').notEmpty().withMessage('Active is required!').isIn(['Yes', 'No']).withMessage('Active should be either "Yes" or "No"!'),


  ], async (req, res) => {
  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    } else {
  try {
  
        const {
            experience_code,
            experience,
            details,
            active,
            loginEditPermision
        } = req.body;
  
        //check the login user have View permission
        if (loginEditPermision !== "Yes") {
         return res.status(200).json({ status: 'error', mssg: 'User does not have permission to Edit' });
       }
  
          // Check if category same name in other _id already exists
          const existingexperiences = await experiences.findOne({
            _id: { $ne: experience_code },
            experience: experience,
           });
    
          if (existingexperiences) {
                   return res.status(200).json({ status: 'error', field: 'experience', mssg: 'Experience with the same name already exists!' });
            }
  
        const updatedexperience = await experiences.findByIdAndUpdate(experience_code, {
            experience: experience,
          details: details,
          active: active,
        }, { new: true });
  
        if (updatedexperience) {
          res.status(200).json({ status: 'success', mssg: 'experience updated successfully', data: updatedexperience });
        } else {
          res.status(200).send({ status: 'error', mssg:'experience id not found'});
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

    body('experience_code')
      .notEmpty().withMessage('experience code ID is Empty !')
      .isMongoId().withMessage('experience code ID Value Is Invalid !'),
  
  ],
  
    async (req, res) => {
  
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        const errorsArray = errors.array();
        return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
      }
      else {
        try {
          const experienceId = req.body.experience_code;
  
          let loginDeletePermision = req.body.loginDeletePermision;
          //check the login user have View permission
          if (loginDeletePermision !== "Yes") {
           return res.status(200).json({ status: 'error', mssg: 'User does not have permission to Delete' });
         }
      
  
          const experiencesToDelete = await experiences.findById(experienceId);
          if (!experiencesToDelete) {
            return res.status(200).json({ status: 'error', mssg: 'Experience not found' });
          }
  
          const result = await experiences.findByIdAndDelete(experienceId);
          if (result) {
            res.status(200).json({ status: 'success', mssg: 'Experience deleted successfully' });
          } else {
            return res.status(200).json({ status: 'error', mssg: 'Failed to delete Experience' });
          }
        } catch (error) {
          console.log(error.message);
          return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
        }
      }
    });

  module.exports=router