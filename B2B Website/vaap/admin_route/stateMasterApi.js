const express = require("express");
const router = express.Router();
const stateMaster = require("../model/stateMasterSchema");
const { body, validationResult } = require("express-validator");
const { default: mongoose } = require("mongoose");
const verifyUser = require("../middleware/adminverifyuser");

//.............................................................
// ROUTER 1:  State Master post method api :/admin/stateMaster/add
//.............................................................
router.post(
  "/add",
  verifyUser,
  [
    // Add validation rules using express-validator
    body("state").notEmpty().withMessage("State Name is required"),
    body("tax_percentage")
      .notEmpty()
      .withMessage("Tax Percentage  is required"),
    body("flat_tax").notEmpty().withMessage("Flat Tax is required"),
    body("delivery_charges")
      .notEmpty()
      .withMessage("Delivery Charge is required"),
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
      const {
        userCode,
        state,
        tax_percentage,
        flat_tax,
        delivery_charges,
        active,
        loginEntryPermision,
      } = req.body;


       //check the login user have entry permission
       if (loginEntryPermision !== "Yes") {
        return res
          .status(200)
          .json({
            status: "error",
            mssg: "User does not have permission to Create a State Master",
          });
      }

      const existingStateName = await stateMaster.findOne({
        state: state,
      });

      if (existingStateName) {
        return res
          .status(200)
          .json({ status: "error", mssg: "State name already exists" });
      }

      //save data in mongo
      stateMaster
        .create({
          state: state,
          tax_percentage: tax_percentage,
          flat_tax: flat_tax,
          delivery_charges: delivery_charges,
          active: active,
          entry_user_code: userCode,
        })

        .then((stateMaster) => {
          return res.status(200).json({
            status: "success",
            mssg: "State Master Data Saved Successfully",
            id: stateMaster.id,
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
// ROUTER 2:  State Master get method api :/admin/stateMaster/getAll
//.............................................................
router.get("/getAll", verifyUser, async (req, res) => {
  try {

    const {loginViewPermision} = req.body;
    //check the login user have entry permission
    if (loginViewPermision !== "Yes") {
     return res
       .status(200)
       .json({
         status: "error",
         mssg: "User does not have permission to View a State Master",
       });
   }
    const result = await stateMaster.find(
      {},
      { __v: 0, entry_user_code: 0, entry_timestamp: 0 }
    ).sort({ "entry_timestamp": -1 });

    if (result) {
      res.status(200).json({
        status: "success",
        mssg: "State Data Fetched Successfully",
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
// ROUTER 3:  State Master get method api :/admin/addressMaster/getDetail
//.............................................................
router.get(
  "/getDetail",
  verifyUser,
  [
    body("state_code")
      .notEmpty()
      .withMessage("State code Empty !")
      .isMongoId()
      .withMessage("State code Value Is Invalid !"),
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
      const stateCode = req.body.state_code;

      const {loginViewPermision} = req.body;
      //check the login user have entry permission
      if (loginViewPermision !== "Yes") {
       return res
         .status(200)
         .json({
           status: "error",
           mssg: "User does not have permission to View a State Master",
         });
     }
      const result = await stateMaster.findById(stateCode, {
        __v: 0,
        entry_user_code: 0,
        entry_timestamp: 0,
      });

      if (result) {
        res.status(200).json({
          status: "success",
          mssg: "State Data Fetched Successfully",
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
// ROUTER 5:  State Master get method api :/admin/stateMaster/update
//.............................................................
router.post(
  "/update",
  verifyUser,

  [
    // Add validation rules using express-validator
    body("state_code")
      .notEmpty()
      .withMessage("State Code Empty !")
      .isMongoId()
      .withMessage("State Code Value Is Invalid !"),
    body("state").notEmpty().withMessage("State Name is required"),
    body("tax_percentage")
      .notEmpty()
      .withMessage("Tax Percentage  is required"),
    body("flat_tax").notEmpty().withMessage("Flat Tax is required"),
    body("delivery_charges")
      .notEmpty()
      .withMessage("Delivery Charge is required"),
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
        status: "validation error",
        field: errorsArray[0]["path"],
        mssg: errorsArray[0]["msg"],
      });
    } else {
      try {
        const {
          userCode,
          state_code,
          state,
          tax_percentage,
          flat_tax,
          delivery_charges,
          active,
          loginEditPermision
        } = req.body;

         //check the login user have entry permission
         if (loginEditPermision !== "Yes") {
          return res
            .status(200)
            .json({
              status: "error",
              mssg: "User does not have permission to Update a State Master",
            });
        }
        

        // Check if a document with the same menu_name or state_name exists,
        const existingStateuName = await stateMaster.findOne({
        //  _id: { $ne: state_code },
          state: state,
        });


        if (existingStateuName) {
          return res
            .status(200)
            .json({ status: "error", mssg: "State name already exists" });
        }
        
        const updated = await stateMaster.findByIdAndUpdate(
            state_code,
          {
            state:state,
            tax_percentage:tax_percentage,
            flat_tax:flat_tax,
            delivery_charges:delivery_charges,
            active: active,
            entry_user_code: userCode,
          },
          { new: true }
        );
      ///  console.log("hii");
        if (updated) {
          res.status(200).json({
            status: "success",
            mssg: "State Master updated successfully",
            data: updated,
          });
        } else {
          res
            .status(200)
            .json({ status: "error", mssg: "State not Found" });
        }
      } catch (error) {
        console.log(error.mssg);
        res
          .status(200)
          .json({ status: "error", mssg: "Internal Server Error" });
      }
    }
  }
);

//.............................................................
// ROUTER 4:  State Master post method api :/admin/stateMaster/del
//.............................................................
router.post(
  "/del",
  verifyUser,
  [
    body("state_code")
      .notEmpty()
      .withMessage("State Code Empty !")
      .isMongoId()
      .withMessage("State Code Value Is Invalid !"),
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
      const state_code = req.body.state_code;

      const {loginDeletePermision} = req.body;
      //check the login user have entry permission
      if (loginDeletePermision !== "Yes") {
       return res
         .status(200)
         .json({
           status: "error",
           mssg: "User does not have permission to Delete a State Master",
         });
     }

      const result = await stateMaster.findByIdAndDelete(state_code);
      if (result) {
        res
          .status(200)
          .json({
            status: "success",
            mssg: "State Master Deleted Successfully",
          });
      } else {
        res.status(200).json({ status: "error", mssg: "State Not Found" });
      }
    } catch (error) {
      console.log(error.mssg);
      res.status(500).json({ status: "error", mssg: "Server Error" });
    }
  }
);

module.exports = router;
