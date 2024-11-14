// Import necessary modules and dependencies
const express = require('express');
const { body, validationResult } = require('express-validator');
const verifyUser = require('../../middleware/adminVerifyUser');
const ServiceAreaDetails = require('../../models/service_area_details');

// Create a new router for this API
const router = express.Router();

// Define the route for adding service area details
router.post('/add', verifyUser,
  [
    body('service_area').notEmpty().withMessage('Service area is required!'),
    body('active').notEmpty().withMessage('Active is required!').isIn(['Yes', 'No']).withMessage('Active should be either "Yes" or "No"!'),


  ], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'] });
    } else {
      try {
        const {
          service_area,
          details,
          active,
          loginEntryPermision // Make sure to use the correct field name
        } = req.body;

        // Check if the login user has entry permission
        if (loginEntryPermision !== "Yes") {
          return res.status(200).json({ status: 'error', mssg: 'User does not have permission to create' });
        }

        // Check if a service area with the same name already exists
        const existingServiceArea = await ServiceAreaDetails.findOne({ service_area });

        if (existingServiceArea) {
          return res.status(200).json({ status: 'error', field: 'service_area', mssg: 'Service area with the same data already exists!' });
        }

        const newServiceAreaDetails = await ServiceAreaDetails.create({
          service_area,
          details,
          active
        });

        res.status(200).json({ status: 'success', mssg: 'Service area details added successfully', data: newServiceAreaDetails });

      } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'server error', mssg: 'Service area details Server Error' });
      }
    }
  });




//.............................................................
// ROUTER 2 : get all service by post method api :/api/admin/serviceAreaDetails/get
//................................................ .............
router.get('/get', verifyUser, async (req, res) => {
    try 
    {
      let loginViewPermision = req.body.loginViewPermision;
        //check the login user have View permission
        if (loginViewPermision !== "Yes") {
        return res.status(200).json({ status: 'error', mssg: 'User does not have permission to view' });
      }
        const AllServiceAreaDetails = await ServiceAreaDetails.find({}, { __v: 0});
        res.status(200).json({ status: 'sucess', mssg: 'All Service Area Details fetch', data: AllServiceAreaDetails });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ status: 'error', mssg: 'Internal server error' });  }
  });




// Define the route for updating service area details
router.post('/update', verifyUser,
  [
    body('service_area_id').notEmpty().withMessage('Service area ID is required!')
      .isMongoId().withMessage('Service area ID Value Is Invalid !'),

    body('service_area').notEmpty().withMessage('Service area is required!'),

    body('active').notEmpty().withMessage('Active is required!').isIn(['Yes', 'No']).withMessage('Active should be either "Yes" or "No"!'),

  ], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'] });
    } else {
      try {

        const {
          service_area_id,
          service_area,
          details,
          active,
          loginEditPermision // Make sure to use the correct field name
        } = req.body;

        // Check if the login user has edit permission
        if (loginEditPermision !== "Yes") {
          return res.status(200).json({ status: 'error', mssg: 'User does not have permission to edit' });
        }

        // Check if another service area with the same name already exists (excluding the current service_area_id)
        const existingServiceArea = await ServiceAreaDetails.findOne({
          _id: { $ne: service_area_id },
          service_area: service_area,
        });

        if (existingServiceArea) {
          return res.status(200).json({ status: 'error', field: 'service_area', mssg: 'Service area with the same name already exists!' });
        }

        const updatedServiceAreaDetails = await ServiceAreaDetails.findByIdAndUpdate(service_area_id, {
          service_area: service_area,
          details: details,
          active: active,
        }, { new: true });

        if (updatedServiceAreaDetails) {
          res.status(200).json({ status: 'success', mssg: 'Service area details updated successfully', data: updatedServiceAreaDetails });
        } else {
          res.status(200).json({ status: 'error', mssg: 'Service area ID not found' });
        }

      } catch (error) {
        console.error(error.message);
        return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
      }
    }
  });




// Define the route for deleting service area details
router.post('/delete', verifyUser,
[
  body('service_area_id')
    .notEmpty().withMessage('Service area ID is Empty !')
    .isMongoId().withMessage('Service area ID Value Is Invalid !'),
],
async (req, res) => {

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const errorsArray = errors.array();
    return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
  }
  else {
    try {
      const serviceAreaId = req.body.service_area_id;

      let loginDeletePermision = req.body.loginDeletePermision; // Make sure to use the correct field name
      // Check if the login user has delete permission
      if (loginDeletePermision !== "Yes") {
        return res.status(200).json({ status: 'error', mssg: 'User does not have permission to delete' });
      }

      const serviceAreaToDelete = await ServiceAreaDetails.findById(serviceAreaId);
      if (!serviceAreaToDelete) {
        return res.status(200).json({ status: 'error', mssg: 'Service area details not found' });
      }

      const result = await ServiceAreaDetails.findByIdAndDelete(serviceAreaId);
      if (result) {
        res.status(200).json({ status: 'success', mssg: 'Service area details deleted successfully' });
      } else {
        return res.status(200).json({ status: 'error', mssg: 'Failed to delete service area details' });
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
    }
  }
});


// Export the router
module.exports = router;
