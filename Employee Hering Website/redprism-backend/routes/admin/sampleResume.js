//imports
const express = require('express');
const router = express.Router();

const sampleResume = require("../../models/sample_resume");

const { body, validationResult } = require('express-validator');
const verifyUser = require('../../middleware/adminVerifyUser');

const upload = require("../../middleware/uploadfiles");



//insert
router.post('/add', verifyUser, upload.sampleResumeFileImage,
  [
    body('title').notEmpty().withMessage('Title is required!')
      .custom(async (value) => {
        const existingtitle = await sampleResume.findOne({ title: value });
        if (existingtitle) {
          return Promise.reject('title name already exists');
        }
      }),

    body('type').notEmpty().withMessage('Type are required!'),

    body('details').notEmpty().withMessage('Details are required!'),


    body('resume_image').custom((value, { req }) => {
      if (!req.files || !req.files.resume_image) {
        throw new Error('Resume image is required');
      }
      return true;
    }),

    body('resume_file').custom((value, { req }) => {
      if (!req.files || !req.files.resume_file) {
        throw new Error('Resume file is required');
      }
      return true;
    }),


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
          type,
          details,
          active,
          loginEntryPermision
        } = req.body;

        // Check if the login user has entry permission
        if (loginEntryPermision !== "Yes") {
          return res.status(200).json({ status: 'error', mssg: 'User does not have permission to create' });
        }

        //resume upload
        const { resume_image, resume_file, } = req.files || {};
        let images = resume_image ? resume_image[0].filename : '';
        let file = resume_file ? resume_file[0].filename : '';

        const savedSampleResume = await sampleResume.create({
          title: title,
          type: type,
          details: details,
          resume_image: "sample_resume/" + images,
          resume_file: "sample_resume/" + file,
          active: active
        });

        res.status(200).json({ status: 'success', mssg: 'Sample resume added successfully', data: savedSampleResume });
      } catch (error) {
        console.error(error.message);
        res.status(500).json({ status: 'error', mssg: 'Internal server error' });
      }
    }
  });




//get
router.get('/list', verifyUser, async (req, res) => {
  try {
    let loginViewPermision = req.body.loginViewPermision;
    //check the login user have View permission
    if (loginViewPermision !== "Yes") {
      return res.status(200).json({ status: 'error', mssg: 'User does not have permission to view' });
    }
    const sampleResumes = await sampleResume.find({}, { __v: 0 });
    res.status(200).json({ status: 'success', data: sampleResumes, mssg: 'sample Resumes list fatched' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ status: 'error', mssg: 'Internal server error' });
  }
});





//update
router.post('/update', verifyUser, upload.sampleResumeFileImage, [
  body('resume_code').notEmpty().withMessage('Resume code is required!').isMongoId().withMessage('Invalid Resume code value!'),
  body('title').notEmpty().withMessage('Title is required!'),
  body('type').notEmpty().withMessage('Type is required!'),
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
        resume_code,
        title,
        type,
        details,
        active,
        loginEditPermision
      } = req.body;

      // Check if the login user has Edit permission
      if (loginEditPermision !== 'Yes') {
        return res.status(200).json({ status: 'error', mssg: 'User does not have permission to Edit' });
      }

      // Check if Resume already exists with the same title
      const existingResume = await sampleResume.findOne({
        _id: { $ne: resume_code },
        title: title,
      });

      if (existingResume) {
        return res.status(200).json({ status: 'error', field: 'title', mssg: 'Resume already exists' });
      }

      const currentResume = await sampleResume.findById(resume_code);

      let images = currentResume.resume_image || '';
      let file = currentResume.resume_file || '';

      const updatedsampleResume = await sampleResume.findByIdAndUpdate(resume_code, {
        title: title,
        type: type,
        details: details,
        active: active
      }, { new: true });

      if (req.files) {
        // Resume upload
        const { resume_image, resume_file } = req.files || {};
        if (resume_image) {
          await sampleResume.findByIdAndUpdate(resume_code, {
            resume_image: 'sample_resume/' +resume_image[0].filename
          }, { new: true });
        }
        if (resume_file) {
          await sampleResume.findByIdAndUpdate(resume_code, {
            resume_file: 'sample_resume/' +resume_file[0].filename
          }, { new: true });
        }

      }

      if (updatedsampleResume) {
        res.status(200).json({ status: 'success', mssg: 'sample Resume details updated successfully', data: updatedsampleResume });
      } else {
        res.status(200).send({ status: 'error', mssg: 'sample Resume code not found' });
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
    }
  }
});



//delete
//delete
router.post('/delete', verifyUser,
  [
    body('resume_code').notEmpty().withMessage('Resume code ID is Empty !')
      .isMongoId().withMessage('Resume code ID Value Is Invalid !'),
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'] });
    } else {
      try {
        const Resumecode = req.body.resume_code;

        const loginDeletePermision = req.body.loginDeletePermision;
        // Check if the login user has Delete permission
        if (loginDeletePermision !== "Yes") {
          return res.status(200).json({ status: 'error', mssg: 'User does not have permission to Delete' });
        }

        const ResumeDelete = await sampleResume.findById(Resumecode);
        if (!ResumeDelete) {
          return res.status(200).json({ status: 'error', mssg: 'Resume not found' });
        }

        const result = await sampleResume.findByIdAndDelete(Resumecode);
        if (result) {
          res.status(200).json({ status: 'success', mssg: 'Resume deleted successfully' });
        } else {
          return res.status(200).json({ status: 'error', mssg: 'Failed to delete Resume' });
        }
      } catch (error) {
        console.error(error.message);
        return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
      }
    }
  });

module.exports = router;