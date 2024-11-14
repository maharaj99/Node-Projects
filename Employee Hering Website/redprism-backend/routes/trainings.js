const express = require('express');
const router = express.Router();

const verifyUser = require('../middleware/verifyUser');
const Trainings = require('../models/trainings');

const { body, validationResult } = require('express-validator');


// ===================================================
// ROUTER : 1 Get Active Training List ( GET method api : /api/trainings/getTrainingList )
// ===================================================
router.get('/getTrainingList', verifyUser, async (req, res) => {

  // Fetch Tech List
  let trainingList = await Trainings.find({ active: "Yes" })
    .select('title').select('details').select('trainings_poster').lean();

  if (trainingList) {
    return res.status(200).json({ status: 'success', mssg: 'Training List Fetched Successfully', trainingList });
  }
  else {
    return res.status(200).json({ status: 'error', mssg: 'Not Found', });
  }
})

// ===================================================
// ROUTER : 2 Get Single Training Details ( POST method api : /api/trainings/getTrainingDetails )
// ===================================================

router.post('/getTrainingDetails', verifyUser, [

  body('train_code')
    .notEmpty().withMessage('Training Empty !')
    .isMongoId().withMessage('Filed Value Is Invalid !'),

], async (req, res) => {

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const errorsArray = errors.array();
    return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
  }
  else {
    try {

      const {
        train_code
      } = req.body;

      // Fetch Training By ID
      const trainingDetails = await Trainings.findById(train_code)
        .select('title')
        .select('details')
        .select('trainings_poster');

      if (trainingDetails) {
        return res.status(200).json({ status: 'success', mssg: 'Training Details Fetched Successfully', trainingDetails });
      }
      else {
        return res.status(200).json({ status: 'error', mssg: 'Not Found', });
      }

    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }
  }
})

module.exports = router;