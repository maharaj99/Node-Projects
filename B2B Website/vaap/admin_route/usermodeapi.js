const express = require("express");
const router = express.Router();
const userMode = require("../model/User_modeSchema");
const { body, validationResult } = require("express-validator");
const verifyUser = require("../middleware/adminverifyuser");

//.............................................................
// ROUTER 1:  User Mode post method api :/admin/usermode/addUserMode
//.............................................................
router.post(
  "/addUserMode",
  verifyUser,
  [
    // Add validation rules using express-validator
    body("user_mode").notEmpty().withMessage("User Mode is required"),
    body("active")
      .notEmpty()
      .withMessage("Active is required!")
      .isIn(["Yes", "No"])
      .withMessage('Active should be either "Yes" or "No"!'),
  ],
  async (req, res) => {
    // Check for validation errors
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
      const { userCode, user_mode, active } = req.body;

      //save data in mongo
      const existingUserName = await userMode.findOne({
        user_mode: user_mode,
      });

      if (existingUserName) {
        return res
          .status(200)
          .json({ status: "error", message: "User Mode Name already exists" });
      }
      userMode
        .create({
          user_mode: user_mode,
          active: active,
          entry_user_code: userCode,
        })
        .then((userMode) => {
          return res.status(200).json({
            status: "success",
            mssg: "User Mode Data Saved Successfully",
            id: userMode.id,
          });
        })
        .catch((err) => {
          console.log(err);
          return res.status(200).json({ status: "error", mssg: err.message });
        });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error", mssg: "Server Error" });
    }
  }
);

//.............................................................
// ROUTER 2:  User Mode get method api :/admin/usermode/getUserModeList
//.............................................................
router.get("/getUserModeList", verifyUser, async (req, res) => {
  try {
    const result = await userMode.find({}, { __v: 0 }).sort({entry_timestamp:-1});

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
// ROUTER 3:  User Mode get method api :/admin/usermode/getUserModeDetail
//.............................................................
router.get(
  "/getUserModeDetail",
  verifyUser,
  [
    body("user_Mode_Code")
      .notEmpty()
      .withMessage("mode code  Empty !")
      .isMongoId()
      .withMessage("mode code  Value Is Invalid !"),
  ],
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
    }

    try {
      const userModeCode = req.body.user_Mode_Code;
      const result = await userMode.findById(userModeCode, { __v: 0 });

      if (result) {
        res
          .status(200)
          .json({
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
  }
);

//.............................................................
// ROUTER 4:  User Mode post method api :/admin/usermode/updateUserMode
//.............................................................
router.post(
  "/updateUserMode",
  verifyUser,

  [
    // Add validation rules using express-validator
    body("user_mode_code")
      .notEmpty()
      .withMessage("User Mode code Empty !")
      .isMongoId()
      .withMessage("User Mode code Value Is Invalid !"),
    body("user_mode").notEmpty().withMessage("User Mode is required"),
    body("active")
      .notEmpty()
      .withMessage("Active is required!")
      .isIn(["Yes", "No"])
      .withMessage('Active should be either "Yes" or "No"!'),
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
        const { user_mode, active, user_mode_code ,userCode } = req.body;

        const existingUserName = await userMode.findOne({
          _id: { $ne: user_mode_code },
          user_mode: user_mode,
        });

        if (existingUserName) {
          return res.status(200).json({
            status: "error",
            message: "User Mode name already exists",
          });
        }

        const updated = await userMode.findByIdAndUpdate(
          user_mode_code,
          {
            user_mode: user_mode,
            active: active,
            entry_user_code: userCode,
          },
          { new: true }
        );

        if (updated) {
          res.status(200).json({
            status: "success",
            message: "User Mode updated successfully",
            data: updated,
          });
        } else {
          res
            .status(200)
            .json({
              status: "error",
              mssg: "User Mode not updated Successfully",
            });
        }
      } catch (error) {
        console.log(error.message);
        res.status(500).json({ status: "error", mssg: "Server Error" });
      }
    }
  }
);

//.............................................................
// ROUTER 5:  User Mode post method api :/admin/usermode/deleteUserMode
//.............................................................
router.post(
  "/deleteUserMode",
  verifyUser,
  [
    body("user_Mode_Code")
      .notEmpty()
      .withMessage("User Code Mode Empty !")
      .isMongoId()
      .withMessage("User Code Mode Value Is Invalid !"),
  ],
  async (req, res) => {
    try {
      const userModeCode = req.body.user_Mode_Code;

      const result = await userMode.findByIdAndDelete(userModeCode);
      if (result) {
        res
          .status(200)
          .json({ status: "success", mssg: "User Mode Deleted Successfully" });
      } else {
        res.status(200).json({ status: "error", mssg: "User Mode Not Found" });
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ status: "error", mssg: "Server Error" });
    }
  }
);

module.exports = router;
