//imports
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const verifyUser = require('../../middleware/adminVerifyUser');
const Registration = require('../../models/admin_user_master');
const uploadFiles = require('../../middleware/admin_uploadfiles');
const fs = require('fs');
const mongoose = require('mongoose');
const userMode = require("../../models/user_mode");


//.............................................................
// ROUTER 1:  Get User Mode List [get method api : /api/admin/manageUser/getUserModeList ]
//.............................................................
router.get("/getUserModeList", verifyUser, async (req, res) => {
  try {
    let loginViewPermision = req.body.loginViewPermision;
    //check the login user have View permission
    if (loginViewPermision !== "Yes") {
      return res.status(200).json({ status: 'error', mssg: 'User does not have permission to view' });
    }
    const result = await userMode.find({}, { __id: 1, user_mode: 1 });

    if (result) {
      res.status(200).json({
        status: "success",
        mssg: "User Mode Fetched Successfully",
        data: result,
      });
    } else {
      res.status(200).json({ status: "error", mssg: "Not Found" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ status: "error", mssg: "Server Error" });
  }
});


//.............................................................
// ROUTER 2:  Insert Data [post method api : /api/admin/manageUser/insertData ]
//.............................................................
router.post('/insertData', verifyUser, uploadFiles.user_profileimages, [

    body('user_name').notEmpty().withMessage('User name is Empty !'),
    body('user_id').notEmpty().withMessage('user id is Empty !'),
    body('active').notEmpty().withMessage('active is Empty !'),
    body('entry_permission').notEmpty().withMessage('entry permission is Empty !'),
    body('view_permission').notEmpty().withMessage('view permission is Empty !'),
    body('edit_permission').notEmpty().withMessage('edit permission is Empty !'),
    body('delete_permissioin').notEmpty().withMessage('delete permissioin Empty !'),
    body('password').notEmpty().withMessage('Password Empty !'),

    body('email_id')
      .notEmpty().withMessage('Email ID is Empty !')
      .isEmail().withMessage('Enter A Valid Email !'),

    body('type').notEmpty().withMessage('type is Empty !'),

    body('user_mode_code')
      .notEmpty().withMessage('user mode code is Empty !')
      .isMongoId().withMessage('user mode code  Is Invalid !'),

  ], async (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    }
    else {
      try {

        const
          {
            userCode,
            user_id,
            user_name,
            password,
            email_id,
            user_mode_code,
            active,
            entry_permission,
            view_permission,
            edit_permission,
            delete_permissioin,
            type,
            loginEntryPermision


          } = req.body;
        //check the login user have entry permission
        if (loginEntryPermision !== "Yes") {
          return res.status(200).json({ status: 'error', mssg: 'User does not have permission to create ' });
        }

        // Check if req.file exists
        let upload_img = 'profile_images/default.png';
        // Default image value

        if (req.file) {
          const { filename } = req.file;
          upload_img = "profile_images/" + filename;
        }

        // Check Email ID exist or not
        let EmailID = await Registration.findOne({ email: email_id });
        if (EmailID) {
          return res.status(200).json({ status: 'error', field: 'email_id', mssg: 'Email ID Already Exist', });
        }

        // Check User id exist or not
        let Userid = await Registration.findOne({ user_id: user_id });
        if (Userid) {
          return res.status(200).json({ status: 'error', field: 'user_id', mssg: 'User id Already Exist', });
        }

        const salt = await bcrypt.genSalt(10);
        const encodedPassword = await bcrypt.hash(password, salt);




        Registration.create
          ({
            user_id: user_id,
            user_name: user_name,
            password: encodedPassword,
            email: email_id,
            user_mode_code: user_mode_code,
            active: active,
            entry_permission: entry_permission,
            view_permission: view_permission,
            edit_permission: edit_permission,
            delete_permissioin: delete_permissioin,
            profile_images: upload_img,
            type: type,
            entry_user_code: userCode





          })
          .then(Registration => {
            return res.status(200).json({ status: 'success', mssg: 'User Details Saved Successfully', id: Registration.id });
          })
          .catch(err => {
            console.log(err)
            return res.status(200).json({ status: 'error', mssg: err.message });
          })


      } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'error', mssg: 'Server Error' });
      }
    }
  })


//.............................................................
// ROUTER 3:  Get List [ get method api : /api/admin/manageUser/getList ]
//.............................................................
router.get('/getList', verifyUser, async (req, res) => {
  try {
    let userId = req.body.userCode;

    let loginViewPermision = req.body.loginViewPermision;
    //check the login user have View permission
    if (loginViewPermision !== "Yes") {
      return res.status(200).json({ status: 'error', mssg: 'User does not have permission to view' });
    }

    // Find the user  based on the provided authtoken
    const user = await Registration.findOne({ _id: userId });

    if (!user) {
      return res.status(200).json({ status: 'error', mssg: 'User mode not found' });
    }
    const User = await Registration.aggregate([

      {
        $lookup: {
          from: 'user_mode',
          localField: 'user_mode_code',
          foreignField: '_id',
          as: 'user_mode_master'
        }
      },
      {
        $project: {
          "_id": 1,
          "user_id": 1,
          "user_name": 1,
          "email": 1,
          "profile_images": 1,
          "user_mode_master.user_mode": 1,
          "user_mode_master._id": 1,
          "active": 1,
          "entry_permission": 1,
          "view_permission": 1,
          "edit_permission": 1,
          "delete_permissioin": 1,
          "type": 1,

        }
      },
      {
        $match: {
          type: "User"
        }
      },

    ])
    if (User.length === 0) {
      return res.status(200).json({ status: 'error', mssg: 'User details not found' });
    }

    return res.status(200).json({ status: 'success', mssg: 'User detailsfetched successfully', data: User });

  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
  }
});


//.............................................................
// ROUTER 4:  Get Details [ post method api : /api/admin/manageUser/getDetails ]
//.............................................................
router.post('/getDetails', verifyUser, [

    body('user_code')
      .notEmpty().withMessage('user code ID is Empty !')
      .isMongoId().withMessage('user code ID Value Is Invalid !'),

  ],

  async (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    }
    else {
      try {
        let userCode = req.body.user_code;

        let loginViewPermision = req.body.loginViewPermision;
        //check the login user have View permission
        if (loginViewPermision !== "Yes") {
          return res.status(200).json({ status: 'error', mssg: 'User does not have permission to view' });
        }

        // Find the user  based on the provided authtoken
        const user = await Registration.findOne({ _id: userCode });

        if (!user) {
          return res.status(200).json({ status: 'error', mssg: 'User mode not found' });
        }
        const User = await Registration.aggregate([
          {
            $match: {
              _id: new mongoose.Types.ObjectId(userCode) // Use the userId variable here
            }
          },
          {
            $lookup: {
              from: 'user_mode',
              localField: 'user_mode_code',
              foreignField: '_id',
              as: 'user_mode_master'
            }
          },
          {
            $project: {
              "_id": 1,
              "user_id": 1,
              "user_name": 1,
              "email": 1,
              "profile_images": 1,
              "user_mode_master.user_mode": 1,
              "user_mode_master._id": 1,
              "active": 1,
              "entry_permission": 1,
              "view_permission": 1,
              "edit_permission": 1,
              "delete_permissioin": 1,
              "type": 1,

            }
          }
        ])
        if (User.length === 0) {
          return res.status(200).json({ status: 'error', mssg: 'User details not found' });
        }

        return res.status(200).json({ status: 'success', mssg: 'User detailsfetched successfully', data: User });

      } catch (error) {
        console.log(error.message);
        return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
      }
    }
  });



//.............................................................
// ROUTER 5:  Update Data [ post method api : /api/admin/manageUser/updateData ]
//.............................................................
router.post('/updateData', verifyUser, uploadFiles.user_profileimages, [

    body('user_code')
      .notEmpty().withMessage('user code is Empty !')
      .isMongoId().withMessage('user code ID Value Is Invalid !'),


    body('user_name').notEmpty().withMessage('user name is Empty !'),
    body('user_id').notEmpty().withMessage('user id is Empty !'),
    body('active').notEmpty().withMessage('active is Empty !'),
    body('entry_permission').notEmpty().withMessage('entry permission is Empty !'),
    body('view_permission').notEmpty().withMessage('view permission is Empty !'),
    body('edit_permission').notEmpty().withMessage('edit permission is Empty !'),
    body('delete_permissioin').notEmpty().withMessage('delete permissioin is Empty !'),

    body('email_id')
      .notEmpty().withMessage('Email ID Empty !')
      .isEmail().withMessage('Enter A Valid Email !'),

  ], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    } else {

      try {

        const {
          user_code, //take this usercode form user for update
          userCode,// //take form verifyuser middleware auth_token
          user_id,
          user_name,
          email_id,
          user_mode_code,
          active,
          entry_permission,
          view_permission,
          edit_permission,
          delete_permissioin,
          type,
          loginEditPermision
        } = req.body;

        //check the login user have View permission
        if (loginEditPermision !== "Yes") {
          return res.status(200).json({ status: 'error', mssg: 'User does not have permission to Edit' });
        }


        // Check Email ID exist or not
        let existingEmailUser = await Registration.findOne({ email: email_id });

        if (existingEmailUser && existingEmailUser._id && existingEmailUser._id.toString() && existingEmailUser._id.toString() !== user_code.toString()) {
          return res.status(200).json({ status: 'error', field: 'email_id', mssg: 'Email ID Already Exist' });
        }


        let existingUserid = await Registration.findOne({ user_id: user_id });

        if (existingUserid && existingUserid._id && existingUserid._id.toString() && existingUserid._id.toString() !== user_code.toString()) {
          return res.status(200).json({ status: 'error', field: 'user_id', mssg: 'User id Already Exist' });
        }

        let updateData = {
          user_id: user_id,
          user_name: user_name,
          email: email_id,
          user_mode_code: user_mode_code,
          active: active,
          entry_permission: entry_permission,
          view_permission: view_permission,
          edit_permission: edit_permission,
          delete_permissioin: delete_permissioin,
          type: type,
          entry_user_code: userCode

        };

        // Check if a new password is provided
        if (req.body.password !== undefined && req.body.password !== null && req.body.password !== "") {
          const salt = await bcrypt.genSalt(10);
          const encodedPassword = await bcrypt.hash(req.body.password, salt);
          updateData.password = encodedPassword;
          // await Registration.findByIdAndUpdate(user_code, {
          //   password: encodedPassword
          // }, { new: true });
        }

        // Check if a new image is uploaded
        if (req.file) {
          const { filename } = req.file;
          updateData.profile_images = "profile_images/" + filename;

          //remove images if new images upload
          const existingUser = await Registration.findById(user_code);
          if (existingUser) {
            const oldImageFilename = existingUser.profile_images;
            if (oldImageFilename !== "profile_images/default.png" && oldImageFilename !== "") {
              fs.unlink('./uploads/' + oldImageFilename, err => {
                if (err) return console.error(err);
                // console.log('success!')
              });
            }
          }

        }

        //update
        const updateuser = await Registration.findByIdAndUpdate(user_code, updateData, { new: true });



        if (updateuser) {
          res.status(200).json({ status: 'success', message: 'user updated successfully', data: updateuser });
        } else {
          res.status(200).send({ status: 'error', message: 'user not found' });
        }

      } catch (error) {
        console.log(error.message);
        res.status(500).send({ status: 'error', message: 'Internal Server Error' });
      }
    }
  });


//.............................................................
// ROUTER 6:  Delete Data [ post method api : /api/admin/manageUser/deleteData ]
//.............................................................
router.post('/deleteData', verifyUser, [

    body('user_code')
      .notEmpty().withMessage('user code ID is Empty !')
      .isMongoId().withMessage('user code ID Value Is Invalid !'),

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

        const user_code = req.body.user_code;
        if (!user_code) {
          return res.status(200).json({ status: 'error', message: 'user code is required' });
        }

        const result = await Registration.findByIdAndDelete(user_code);

        if (result) {
          res.status(200).json({ status: 'success', message: 'User delete succesfully' });
        } else {
          return res.status(200).json({ status: 'error', message: 'User not found' });
        }
      } catch (error) {
        console.log(error.message);
        return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
      }
    }
  });


module.exports = router;