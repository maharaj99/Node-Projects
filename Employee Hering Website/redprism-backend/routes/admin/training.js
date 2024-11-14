//imports
const express = require('express');
const router = express.Router();

const Training = require("../../models/trainings");

const { body, validationResult } = require('express-validator');
const verifyUser = require('../../middleware/adminVerifyUser');

const upload = require("../../middleware/uploadfiles");


//insert
router.post('/add', verifyUser,upload.trainingPoster,
  [
    body('title').notEmpty().withMessage('Title is required!')
    .custom(async (value) => {
      const existingtitle = await Training.findOne({ title: value });
      if (existingtitle) {
        return Promise.reject('title name already exists');
      }
    }),

    body('trainings_poster').custom((value, { req }) => {
      // console.log(value);
      // console.log(req.file);
      if (!req.file) {
        throw new Error('trainings poster is required');
      }
      return true;
    }),
 

    body('details').notEmpty().withMessage('Details are required!'),

    
    body('active').notEmpty().withMessage('Active is required!')
      .isIn(['Yes', 'No']).withMessage('Active should be either "Yes" or "No"!')
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'] });
    } else {
      try {
        const {
          title, 
          details,
          active, 
          loginEntryPermision
        } = req.body;

        // Check if the login user has entry permission
        if (loginEntryPermision !== "Yes") {
          return res.status(200).json({ status: 'error', mssg: 'User does not have permission to create' });
        }

        //product_images upload
        const trainings_poster = req.file || {};
        let filename = trainings_poster.filename;

        const savedTraining = await Training.create({
          title:title, 
          details:details,
          trainings_poster:"trainings_poster/"+filename,
          active:active
        });

        res.status(200).json({ status: 'success', mssg: 'Training added successfully', data: savedTraining });
      } catch (error) {
        console.error(error.message);
        res.status(500).json({ status: 'error', mssg: 'Internal server error' });
      }
    }
  });



//get
  router.get('/list', async (req, res) => {
    try {
      const trainings = await Training.find({},{__v:0});
      res.status(200).json({ status: 'success', data: trainings , mssg: 'Training list fatched'});
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ status: 'error', mssg: 'Internal server error' });
    }
  });
  

  //delete
  router.post('/delete', verifyUser,
  [
    body('training_code').notEmpty().withMessage('Training code ID is Empty !')
      .isMongoId().withMessage('Training code ID Value Is Invalid !'),
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'] });
    } else {
      try {
        const trainingCode = req.body.training_code;

        const loginDeletePermision = req.body.loginDeletePermision;
        // Check if the login user has Delete permission
        if (loginDeletePermision !== "Yes") {
          return res.status(200).json({ status: 'error', mssg: 'User does not have permission to Delete' });
        }

        const trainingToDelete = await Training.findById(trainingCode);
        if (!trainingToDelete) {
          return res.status(200).json({ status: 'error', mssg: 'Training not found' });
        }

        const result = await Training.findByIdAndDelete(trainingCode);
        if (result) {
          res.status(200).json({ status: 'success', mssg: 'Training deleted successfully' });
        } else {
          return res.status(200).json({ status: 'error', mssg: 'Failed to delete Training' });
        }
      } catch (error) {
        console.error(error.message);
        return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
      }
    }
  });




//update
router.post('/update', verifyUser,upload.trainingPoster,
[
    body('training_code').notEmpty().withMessage('Training code is required!').isMongoId().withMessage('Invalid training code value!'),
    body('title').notEmpty().withMessage('Title is required!'),
    body('details').notEmpty().withMessage('Details are required!'),
    body('active').notEmpty().withMessage('Active is required!')
      .isIn(['Yes', 'No']).withMessage('Active should be either "Yes" or "No"!')
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'] });
    } else {
      try {
        const {
            training_code,
            title,
            details,
            active,
            loginEditPermision
        } = req.body;

        // Check if the login user has Edit permission
        if (loginEditPermision !== "Yes") {
          return res.status(200).json({ status: 'error', mssg: 'User does not have permission to Edit' });
        }

       // Check if Training already exists with the same title
       const existingTraining = await Training.findOne({
        _id: { $ne: training_code },
        title: title,
      });

      if (existingTraining) {
        return res.status(200).json({ status: 'error', field: 'title', mssg: 'Title already exists' });
      }

      const currentTraining = await Training.findById(training_code);
      let filename = currentTraining ? currentTraining.trainings_poster : '';

      // console.log(currentTraining);
      if (req.file) {
        const trainings_poster = req.file || {};
        filename = 'trainings_poster/' + trainings_poster.filename;
      }

        const updatedTraining = await Training.findByIdAndUpdate(training_code, {
            title:title,
            trainings_poster:filename,
            details:details,
            active:active,
        }, { new: true });

        if (updatedTraining) {
          res.status(200).json({ status: 'success', mssg: 'Training details updated successfully', data: updatedTraining });
        } else {
          res.status(200).send({ status: 'error', mssg: 'Training code not found' });
        }

      } catch (error) {
        console.log(error.message);
        return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
      }
    }
  });

  
module.exports = router;
