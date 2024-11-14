const express = require('express');
const router = express.Router();

const verifyUser = require('../middleware/verifyUser');
const sample_resume = require('../models/sample_resume');

const { body, validationResult } = require('express-validator');


// ===================================================
// ROUTER : 1 Get Active Sample Resume List ( GET method api : /api/sampleResume/getSampleResumeList )
// ===================================================
router.get('/getSampleResumeList', verifyUser, async (req, res) => {

  // Fetch Tech List
  let sampleResumeList = await sample_resume.find({ active: "Yes" })
    .select('title').select('type').select('details').select('resume_image').select('resume_file').lean();

  if (sampleResumeList) {
    return res.status(200).json({ status: 'success', mssg: 'Sample Resume List Fetched Successfully', sampleResumeList });
  }
  else {
    return res.status(200).json({ status: 'error', mssg: 'Not Found', });
  }
})


// ===================================================
// ROUTER : 2 Get Single Sample Resume Details ( POST method api : /api/sampleResume/getSampleResumeDetails )
// ===================================================

router.post('/getSampleResumeDetails', verifyUser, [

  body('resume_id')
    .notEmpty().withMessage('Resume Empty !')
    .isMongoId().withMessage('Resume Value Is Invalid !'),

], async (req, res) => {

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const errorsArray = errors.array();
    return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
  }
  else {
    try {

      const {
        resume_id
      } = req.body;

      // Fetch Sample Resume By ID
      const sampleResumeDetails = await sample_resume.findById(resume_id)
        .select('title')
        .select('type')
        .select('details')
        .select('resume_image')
        .select('resume_file');

      if (sampleResumeDetails) {
        return res.status(200).json({ status: 'success', mssg: 'Sample Resume Details Fetched Successfully', sampleResumeDetails });
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