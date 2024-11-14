const express = require("express");
const router = express.Router();
const emailMaster = require("../model/EmailMasterSchema");
const { body, validationResult } = require("express-validator");
const verifyUser = require("../middleware/adminverifyuser");

//.............................................................
// ROUTER 1:  Email Master post method api :/admin/emailMaster/add
//.............................................................
router.post(
  "/add",
  verifyUser,
  [
    //  Add validation rules using express-validator
    body("email_text")
      .notEmpty()
      .withMessage("Email Text is required"),
    body("email_type")
      .notEmpty()
      .withMessage("Email Type Status is required!")
      .isIn(["Email Verification", "Registration Confirmation", "Order Confirmation"])
      .withMessage('Email Type Status should be either "Email Verification","Registration Confirmation","Order Confirmation"'),
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
    }
    try {
      const { email_text, email_type, userCode, loginEntryPermision } = req.body;

      //check the login user have entry permission
      if (loginEntryPermision !== "Yes") {
        return res.status(200).json({
          status: "error",
          mssg: "User does not have permission to Create",
        });
      }

      const existingEmail = await emailMaster.findOne({
        email_type: email_type,
      });

      if (existingEmail) {
        return res
          .status(200)
          .json({ status: "error", mssg: "Email Type already exists" });
      }

      // Create a new Customer quotation
      const newConfig = await emailMaster
        .create({
          entry_user_code: userCode,
          email_text: email_text,
          email_type: email_type,
        })
        .then((newConfig) => {
          return res.status(200).json({
            status: "success",
            mssg: "Email Master Data Saved Successfully",
            id: newConfig.id,
          });
        })
        .catch((err) => {
          console.log(err);
          return res.status(200).json({ status: "error", mssg: err.mssg });
        });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error", mssg: "Server Error" });
    }
  }
);

//.............................................................
// ROUTER 2:  Email Master get method api :/admin/emailMaster/getEmailList
//.............................................................
router.get("/getEmailList", verifyUser, async (req, res) => {
  try {
    const { loginViewPermision } = req.body;
    //check the login user have entry permission
    if (loginViewPermision !== "Yes") {
      return res.status(200).json({
        status: "error",
        mssg: "User does not have permission to View",
      });
    }
    const result = await emailMaster.find(
      {},
      { __v: 0, entry_user_code: 0, entry_timestamp: 0 }
    ).sort({ "entry_timestamp": -1 });

    if (result) {
      res.status(200).json({
        status: "success",
        mssg: "Email Master List Fetched Successfully",
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
// ROUTER 3:  Email Master get method api :/admin/emailMaster/getEmailDetail
//.............................................................
router.post(
  "/getEmailDetail",
  verifyUser,
  [
    body("id")
      .notEmpty()
      .withMessage("ID Code Empty !")
      .isMongoId()
      .withMessage("ID  Value Is Invalid !"),
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
    }
    try {
      const id = req.body.id;
      const { loginViewPermision } = req.body;
      //check the login user have entry permission
      if (loginViewPermision !== "Yes") {
        return res.status(200).json({
          status: "error",
          mssg: "User does not have permission to View",
        });
      }
      const result = await emailMaster.findById(
        id,
        { __v: 0, entry_user_code: 0, entry_timestamp: 0 }
      );

      if (result) {
        res.status(200).json({
          status: "success",
          mssg: "Email Master Fetched Successfully",
          data: result,
        });
      } else {
        res.status(200).json({ status: "error", mssg: "Not Found" });
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ status: "error", mssg: "Server Error" });
    }
  }
);


//.............................................................
// ROUTER 4:  Email Master get method api :/admin/emailMaster/delete
//.............................................................
router.post(
  "/delete",
  verifyUser,
  [
    body("id")
      .notEmpty()
      .withMessage("ID is Empty !")
      .isMongoId()
      .withMessage("ID Value Is Invalid !"),
  ],

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({
        status: "validation error",
        field: errorsArray[0]["path"],
        mssg: errorsArray[0]["msg"],
      });
    }
    try {
      const id = req.body.id;
      const { loginDeletePermision } = req.body;
      //check the login user have entry permission
      if (loginDeletePermision !== "Yes") {
        return res.status(200).json({
          status: "error",
          mssg: "User does not have permission to Delete",
        });
      }

      const result = await emailMaster.findByIdAndDelete(id);
      if (result) {
        res.status(200).json({
          status: "success",
          mssg: "Email Master Deleted Successfully",
        });
      } else {
        res.status(200).json({ status: "error", mssg: "Email Master Not Found" });
      }
    } catch (error) {
      console.log(error.mssg);
      res.status(500).json({ status: "error", mssg: "Server Error" });
    }
  }
);


//.............................................................
// ROUTER 6:  Email Master get method api :/admin/emailMaster/update
//.............................................................
router.post(
  "/update",
  verifyUser,
  [
    // Add validation rules using express-validator
    body("id")
      .notEmpty()
      .withMessage("ID is Empty !")
      .isMongoId()
      .withMessage("ID Value Is Invalid !"),
    body("email_text")
      .notEmpty()
      .withMessage("Email Text is required"),
    body("email_type")
      .notEmpty()
      .withMessage("Email Type Status is required!")
      .isIn(["Email Verification", "Registration Confirmation", "Order Confirmation"])
      .withMessage('Email Type Status should be either "Email Verification","Registration Confirmation","Order Confirmation"'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({
        status: "validation error",
        field: errorsArray[0]["path"],
        mssg: errorsArray[0]["msg"],
      });
    }
    try {
      let { id, email_type, email_text, userCode, loginEditPermision } = req.body;

      //check the login user have entry permission
      if (loginEditPermision !== "Yes") {
        return res.status(200).json({
          status: "error",
          mssg: "User does not have permission to Update",
        });
      }
      const existingEmail = await emailMaster.findOne({
        _id: { $ne: id },
        email_type: email_type,
      });

      if (existingEmail) {
        return res
          .status(200)
          .json({ status: "error", error: "Email Type already exists" });
      }

      const updateddata = {
        email_type: email_type,
        entry_user_code: userCode,
        email_text: email_text,
      };

      const updated = await emailMaster.findByIdAndUpdate(id, updateddata, {
        new: true,
      });

      if (updated) {
        res.status(200).json({
          status: "success",
          mssg: "Email Master updated successfully",
          data: updated,
        });
      } else {
        res.status(200).json({ status: "error", mssg: "Email Master not Found" });
      }
    } catch (error) {
      console.log(error.mssg);
      res.status(200).json({ status: "error", mssg: "Internal Server Error" });
    }
  }
);
module.exports = router;