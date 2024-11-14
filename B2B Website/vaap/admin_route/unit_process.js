// imports
const express = require('express');
const router = express.Router();
const Unit = require('../model/unit_master');
const { body, validationResult } = require('express-validator');
const verifyUser = require('../middleware/adminverifyuser');



// add a unit: POST "/unit/insert"
router.post('/insert', verifyUser,[
    body('unit').notEmpty().withMessage('unit is required!'),
    body('active').notEmpty().withMessage('Active is required!').isIn(['Yes', 'No']).withMessage('Active should be either "Yes" or "No"!')
  ], async (req, res) => {
  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
  } else {
      try {
        const {
        unit,
        userCode,
        active,
        loginEntryPermision
      } = req.body;


       //check the login user have entry permission
       if (loginEntryPermision !== "Yes") {
        return res.status(200).json({ status: 'error', mssg: 'User does not have permission to create ' });
      }


           // Check if a subcategory with the same name already exists
           const existingUnit = await Unit.findOne({ unit });

           if (existingUnit) {
                   return res.status(200).json({ status: 'error', field: 'Unit', mssg: 'Unit with the same name already exists!' });
           }
  
        const newunits = await Unit.create({
        unit: unit,
        entry_user_code:userCode,
        active: active
        });
  
        res.status(200).json({ status: 'success', mssg: 'Unit created successfully', data: newunits });
  
      } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'server error', mssg: 'Internal Server Error' });
      }
    }
  });



// Get all unit: GET "/unit/getAllUnit"
router.get('/getAllUnit',verifyUser, async (req, res) => {
  try {

       
    let loginViewPermision = req.body.loginViewPermision;
     //check the login user have View permission
     if (loginViewPermision !== "Yes") {
      return res.status(200).json({ status: 'error', mssg: 'User does not have permission to view' });
    }

    const units = await Unit.find({}, {__v: 0,entry_user_code:0,entry_date:0}).sort({"entry_date" : -1});
    res.status(200).json({ status: 'sucess', mssg: 'All units fetch', data: units });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ status: 'error', mssg: 'Internal server error' });  }
});


//
router.post('/getUnitDetails', verifyUser, [
  body('unit_code')
    .notEmpty().withMessage('Unit code is empty!')
    .isMongoId().withMessage('Unit category code value!'),
],

async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorsArray = errors.array();
    return res.status(200).json({ status: 'error', field: errorsArray[0].param, mssg: errorsArray[0].msg });
  } else {
    try {
        const { unit_code ,loginViewPermision} = req.body; 
           
        //check the login user have View permission
        if (loginViewPermision !== "Yes") {
        return res.status(200).json({ status: 'error', mssg: 'User does not have permission to view' });
      }

        const unit_details = await Unit.find({_id:unit_code }, {__v:0,entry_user_code:0,entry_date:0});

        if (unit_details) {
          // Category details found, send a success response
          return res.status(200).json({ status: 'success', data: unit_details });
        } else {
          // Category not found, send an error response
          return res.status(200).json({ status: 'error', mssg: 'Unit not found' });
        }
      
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
    }
  }
});

// // Get all unit_type: GET "/unit.drop/downget"
// router.get('/downget', async (req, res) => {
//   try {
//     const units = await Unit.find({}, {__id: 1,unit_type:1}).sort({"entry_date" : -1});
//     res.status(200).json({ status: 'sucess', mssg: 'All units fetch', data: units });
//   } catch (error) {
//     console.log(error.message);
//     res.status(500).send('Internal Server Error');
//   }
// });



// Delete a category by ID: DELETE "/unit/UnitDelete"
router.post('/UnitDelete',verifyUser,[

  body('unit_code')
      .notEmpty().withMessage('Unit code ID is Empty !')
      .isMongoId().withMessage('Unit code ID Value Is Invalid !'),

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
      
      const unitId = req.body.unit_code;
      
      if (!unitId) {
          return res.status(200).json({ status: 'error', mssg: 'unit code is required' });
      } 

      const unitToDelete = await Unit.findById(unitId);
      if (!unitToDelete) {
          return res.status(200).json({ status: 'error', mssg: 'Unit not found' });
      }

      // const matchingProducts = await product.find({ unit_code: unitId});
      // if (matchingProducts.length > 0) {
      //   return  res.status(200).json({ status: 'have_product', message: ' cannot be deleted because it is associated with products' });
      // }

      const result = await Unit.findByIdAndDelete(unitId);
      if (result) {
          res.status(200).json({ status: 'success', mssg: 'unit deleted successfully' });
      } else {
          return res.status(200).json({ status: 'error', mssg: 'Failed to delete Unit' });
      }
  } catch (error) {
      console.log(error.message);
      res.status(500).send({ status: 'error', mssg:'Internal Server Error'});
  }
}
});




// Update an unit by ID: PATCH "/unit/updateUnit"
router.post('/updateUnit',verifyUser, [
  body('unit_code').notEmpty().withMessage('unit code is required!'),
  body('unit').notEmpty().withMessage('unit  is required!'),
  body('active').notEmpty().withMessage('Active is required!').isIn(['Yes', 'No']).withMessage('Active should be either "Yes" or "No"!')
], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorsArray = errors.array();
    return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
} else {
    try {
      const unitid = req.body.unit_code;
      const {
        unit,
        userCode,
        active,
        loginEditPermision
      } = req.body;

      //check the login user have View permission
      if (loginEditPermision !== "Yes") {
       return res.status(200).json({ status: 'error', mssg: 'User does not have permission to Edit' });
     }
  
      // Check if voucher_type already exists
      const existingUnit = await Unit.findOne({
        _id: { $ne: unitid },
        unit: unit,
      });

      if (existingUnit) {
              return res.status(200).json({ status: 'error', field: 'unit', mssg: 'Unit with the same name already exists!' });
        }

      const updatedunit = await Unit.findByIdAndUpdate(unitid, {
        unit:unit,
        entry_user_code:userCode,
        active:active
      }, { new: true });

      if (updatedunit) {
        res.status(200).json({ status: 'success', mssg: 'Unit updated successfully', data: updatedunit });
      } else {
        res.status(200).send({ status: 'error', mssg:'Unit id not found'});
      }

    } catch (error) {
      console.log(error.message);
      res.status(500).send({ status: 'server error', mssg:'Internal Server Error'});
    }
  }
});


module.exports=router;