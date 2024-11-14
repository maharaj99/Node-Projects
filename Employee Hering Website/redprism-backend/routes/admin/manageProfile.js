const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const verifyUser = require("../../middleware/adminVerifyUser");
const manageProfile = require("../../models/admin_user_master");
const mongoose = require("mongoose");
const fs = require("fs");
const uploadFiles = require("../../middleware/admin_uploadfiles");
const bcrypt = require("bcrypt");


//.............................................................
// ROUTER 1:  Get Profile Details [get method api : /api/admin/manageProfile/getProfileDetails ]
//.............................................................
router.get('/getProfileDetails', verifyUser, async (req, res) => {
  try {
    let user_code = req.body.userCode;

    const userData = await manageProfile.find({ _id: user_code }, { user_id: 1, email: 1, user_name: 1 });

    res.status(200).json({
      status: 'success',
      mssg: 'User details fetch',
      data: userData
    });

  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
});


//.............................................................
// ROUTER 2:  Update Profile Details [post method api : /api/admin/manageProfile/updateProfileDetails ]
//.............................................................
router.post("/updateProfileDetails", verifyUser, [

  body("user_name").notEmpty().withMessage("user name is Empty !"),
  body("user_id").notEmpty().withMessage("user id is Empty !"),
  body("email")
    .notEmpty()
    .withMessage("Email ID Empty !")
    .isEmail()
    .withMessage("Enter A Valid Email !"),

],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({
        status: "error",
        field: errorsArray[0]["path"],
        mssg: errorsArray[0]["msg"],
      });
    } else {
      try {
        const {
          userCode, // //take form verifyuser middleware auth_token
          user_id,
          user_name,
          user_mode_code,
          email,
        } = req.body;

        // Check Email ID exist or not
        let existingEmailUser = await manageProfile.findOne({
          email: email,
          _id: { $ne: userCode }
        });

        if (
          existingEmailUser &&
          existingEmailUser._id &&
          existingEmailUser._id.toString() &&
          existingEmailUser._id.toString()
        ) {
          return res.status(200).json({
            status: "error",
            field: "email_id",
            mssg: "Email ID Already Exist",
          });
        }

        let existingUserid = await manageProfile.findOne({ user_id: user_id, _id: { $ne: userCode } });

        if (
          existingUserid &&
          existingUserid._id &&
          existingUserid._id.toString() &&
          existingUserid._id.toString()
        ) {
          return res.status(200).json({
            status: "error",
            field: "user_id",
            mssg: "User id Already Exist",
          });
        }

        let updateData = {
          user_id: user_id,
          user_name: user_name,
          email: email,
          user_mode_code: user_mode_code,
          entry_user_code: userCode,
        };

        //update
        const updateuser = await manageProfile.findByIdAndUpdate(
          userCode,
          updateData,
          { new: true }
        );

        if (updateuser) {
          res.status(200).json({
            status: "success",
            message: "Manage Profile updated successfully",
            data: updateuser,
          });
        } else {
          res
            .status(200)
            .send({ status: "error", message: "Manage Profile not found" });
        }
      } catch (error) {
        console.log(error.message);
        res
          .status(500)
          .send({ status: "error", message: "Internal Server Error" });
      }
    }
  }
);


//.............................................................
// ROUTER 3:  Update Password [post method api : /api/admin/manageProfile/updatePassword ]
//.............................................................
router.post("/updatePassword", verifyUser, [

  body("old_password").notEmpty().withMessage("Old Password Empty !"),
  body("password").notEmpty().withMessage("Password Empty !"),

], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorsArray = errors.array();
    return res.status(200).json({
      status: "error",
      field: errorsArray[0]["path"],
      mssg: errorsArray[0]["msg"],
    });
  } else {
    try {
      const {
        userCode, // //take form verifyuser middleware auth_token
        user_mode_code,
        old_password,
        password,
      } = req.body;


      let updateData = {
        user_mode_code: user_mode_code,
        entry_user_code: userCode,
        old_password: old_password,
        password: password,
      };

      // Check if the old password matches the one in the database
      const user = await manageProfile.findById(userCode);
      if (!user) {
        return res.status(200).json({
          status: "error",
          message: "User not found",
        });
      }


      const isPasswordValid = await bcrypt.compare(
        old_password,
        user.password
      );

      if (!isPasswordValid) {
        return res.status(200).json({
          status: "error",
          message: "Old password is incorrect",
        });
      }

      // If old password is correct, update the password
      const salt = await bcrypt.genSalt(10);
      const encodedPassword = await bcrypt.hash(password, salt);

      const updatedata = {
        password: encodedPassword,
      };

      const updateuser = await manageProfile.findByIdAndUpdate(
        userCode,
        updatedata,
        { new: true }
      );
      if (updateuser) {
        res.status(200).json({
          status: "success",
          message: "Manage Profile Password updated successfully",
          data: updateuser,
        });
      } else {
        res
          .status(200)
          .send({ status: "error", message: "Manage Profile  not found" });
      }
    } catch (error) {
      console.log(error.message);
      res
        .status(500)
        .send({ status: "error", message: "Internal Server Error" });
    }
  }
}
);


//.............................................................
// ROUTER 4:  Update Image [post method api : /api/admin/manageProfile/updateImage ]
//.............................................................
router.post( "/updateimage", verifyUser, uploadFiles.user_profileimages,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res
        .status(200)
        .json({
          status: "error",
          field: errorsArray[0]["path"],
          mssg: errorsArray[0]["msg"],
        });
    } else {
      try {
        const {
          userCode, // //take form verifyuser middleware auth_token
          user_mode_code,
        } = req.body;


        let updateData = {
          user_mode_code: user_mode_code,
          entry_user_code: userCode,
        };

        // Check if a new image is uploaded
        if (req.file) {
          const { filename } = req.file;
          updateData.profile_images = "profile_images/" + filename;

          //remove images if new images upload
          const existingUser = await manageProfile.findById(userCode);
          if (existingUser) {
            const oldImageFilename = existingUser.profile_images;
            if (
              oldImageFilename !== "profile_images/default.png" &&
              oldImageFilename !== ""
            ) {
              fs.unlink("./uploads/" + oldImageFilename, (err) => {
                if (err) return console.error(err);
                // console.log('success!')
              });
            }
          }
        }

        //update
        const updateuser = await manageProfile.findByIdAndUpdate(
          userCode,
          updateData,
          { new: true }
        );

        if (updateuser) {
          res
            .status(200)
            .json({
              status: "success",
              message: "Manage Profile Image updated successfully",
              data: updateuser,
            });
        } else {
          res
            .status(200)
            .send({ status: "error", message: "Manage Profile not found" });
        }
      } catch (error) {
        console.log(error.message);
        res
          .status(500)
          .send({ status: "error", message: "Internal Server Error" });
      }
    }
  }
);


module.exports = router;