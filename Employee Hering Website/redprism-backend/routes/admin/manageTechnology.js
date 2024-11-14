//imports
const express = require('express');
const router = express.Router();

const technology = require("../../models/technology_master");

const { body, validationResult } = require('express-validator');
const verifyUser = require('../../middleware/adminVerifyUser');

const mongoose = require('mongoose');


//.............................................................
// ROUTER 1 : Create a technology by post method api :/api/admin/manageTechnology/insert
//................................................ .............
router.post('/insert', verifyUser,
  [
    body('tech_name').notEmpty().withMessage('tech name is required!'),

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
          tech_name,
          details,
          active,
          loginEntryPermision
        } = req.body;

           //check the login user have entry permission
           if (loginEntryPermision !== "Yes") {
            return res.status(200).json({ status: 'error', mssg: 'User does not have permission to create ' });
          }

        // Check if a subcategory with the same name already exists
        const existingtechnology = await technology.findOne({ tech_name });

          if (existingtechnology) {
              return res.status(200).json({ status: 'error', field: 'tech_name', mssg: 'Technology with the same name already exists!' });
          }
      

        const newTechnology = await technology.create({
            tech_name: tech_name,
            details: details,
            active: active,
        });

        res.status(200).json({ status: 'success', mssg: 'Technology created successfully', data: newTechnology });

      } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'server error', mssg: 'Internal Server Error' });
      }
    }
  });



//.............................................................
// ROUTER 2 : get all technology by post method api :/api/admin/manageTechnology/get
//................................................ .............
router.get('/get', verifyUser, async (req, res) => {
    try 
    {
      let loginViewPermision = req.body.loginViewPermision;
        //check the login user have View permission
        if (loginViewPermision !== "Yes") {
        return res.status(200).json({ status: 'error', mssg: 'User does not have permission to view' });
      }
        const technologys = await technology.find({}, { __v: 0});
        res.status(200).json({ status: 'sucess', mssg: 'All Technology fetch', data: technologys });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ status: 'error', mssg: 'Internal server error' });  }
  });


//.............................................................
// ROUTER 3 : update all technology by post method api :/api/admin/manageTechnology/update
//................................................ .............
  router.post('/update', verifyUser,[
    body('tech_code').notEmpty().withMessage('tech name is required!')
    .isMongoId().withMessage('tech code ID Value Is Invalid !'),
    
    body('tech_name').notEmpty().withMessage('tech name is required!'),

    body('active').notEmpty().withMessage('Active is required!').isIn(['Yes', 'No']).withMessage('Active should be either "Yes" or "No"!'),

  ], async (req, res) => {
  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    } else {
  try {
        const techcode = req.body.tech_code;
  
        const {
          tech_name,
          details,
          active,
          loginEditPermision
        } = req.body;
  
        //check the login user have View permission
        if (loginEditPermision !== "Yes") {
         return res.status(200).json({ status: 'error', mssg: 'User does not have permission to Edit' });
       }
  
          // Check if category same name in other _id already exists
          const existingtechnology = await technology.findOne({
            _id: { $ne: techcode },
            tech_name: tech_name,
           });
    
          if (existingtechnology) {
                   return res.status(200).json({ status: 'error', field: 'tech_name', mssg: 'Technology with the same name already exists!' });
            }
  
        const updatedtechnology = await technology.findByIdAndUpdate(techcode, {
          tech_name: tech_name,
          details: details,
          active: active,
        }, { new: true });
  
        if (updatedtechnology) {
          res.status(200).json({ status: 'success', mssg: 'Technology updated successfully', data: updatedtechnology });
        } else {
          res.status(200).send({ status: 'error', mssg:'Technology id not found'});
        }
  
      } catch (error) {
        console.log(error.message);
        return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
      }
    }
  });




//.............................................................
// ROUTER 4 : delete technology by post method api :/api/admin/manageTechnology/delete
//................................................ .............
  router.post('/delete', verifyUser, [

    body('tech_code')
      .notEmpty().withMessage('Tech code ID is Empty !')
      .isMongoId().withMessage('Tech code ID Value Is Invalid !'),
  
  ],
  
    async (req, res) => {
  
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        const errorsArray = errors.array();
        return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
      }
      else {
        try {
          const techId = req.body.tech_code;
  
          let loginDeletePermision = req.body.loginDeletePermision;
          //check the login user have View permission
          if (loginDeletePermision !== "Yes") {
           return res.status(200).json({ status: 'error', mssg: 'User does not have permission to Delete' });
         }
      
  
          const technologyToDelete = await technology.findById(techId);
          if (!technologyToDelete) {
            return res.status(200).json({ status: 'error', mssg: 'Technology not found' });
          }
  
          const result = await technology.findByIdAndDelete(techId);
          if (result) {
            res.status(200).json({ status: 'success', mssg: 'Technology deleted successfully' });
          } else {
            return res.status(200).json({ status: 'error', mssg: 'Failed to delete Technology' });
          }
        } catch (error) {
          console.log(error.message);
          return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
        }
      }
    });



module.exports=router;