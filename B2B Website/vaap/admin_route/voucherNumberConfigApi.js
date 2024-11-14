const express = require("express");
const router = express.Router();
const voucherNumberConfig = require("../model/vocherNumberConfigSchema");
const { body, validationResult } = require("express-validator");
const verifyUser = require("../middleware/adminverifyuser");

//.............................................................
// ROUTER 1:  Voucher Number Config post method api :/admin/voucherNumberConfig/add
//.............................................................
router.post(
  "/add",
  verifyUser,
  [
    // Add validation rules using express-validator
    body("voucher_type")
      .notEmpty()
      .withMessage("Voucher Type Status is required!")
      .isIn(["Order Number", "Shipping Number"])
      .withMessage(
        'Voucher Type Status should be either "Order Number" or "Shipping Number"!'
      ),
    body("prefix_text").notEmpty().withMessage("Prefix Text is required"),
    body("mid_character_length")
      .notEmpty()
      .withMessage("Mid Character Length is required"),
    body("suffix_text").notEmpty().withMessage("Suffix Text is required"),
    body("starting_number")
      .notEmpty()
      .withMessage("Starting Number is required"),
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
      const {
        voucher_type,
        userCode,
        prefix_text,
        mid_character_length,
        suffix_text,
        starting_number,
        loginEntryPermision,
      } = req.body;
        //check the login user have entry permission
        if (loginEntryPermision !== "Yes") {
          return res
            .status(200)
            .json({
              status: "error",
              mssg: "User does not have permission to Create a Customer Shipping Address",
            });
        }

      // Check if voucher_type already exists
      const existingVoucherType = await voucherNumberConfig.findOne({
        voucher_type: voucher_type,
      });

      if (existingVoucherType) {
        return res
          .status(200)
          .json({ status: "error", mssg: "Voucher Type already exists" });
      }

      // Create a new voucher config
      const newConfig = await voucherNumberConfig
        .create({
          voucher_type: voucher_type,
          prefix_text: prefix_text,
          mid_character_length: mid_character_length,
          suffix_text: suffix_text,
          starting_number: starting_number,
          current_number: starting_number, // Set current_number same as starting_number
          entry_user_code: userCode,
        })
        .then((newConfig) => {
          return res.status(200).json({
            status: "success",
            mssg: "Vocher Number Config Saved Successfully",
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
// ROUTER 2:  Voucher Number Config get method api :/admin/voucherNumberConfig/getVoucherNumberConfigList
//.............................................................
router.get("/getVoucherNumberConfigList", verifyUser, async (req, res) => {
  try {
    const {loginViewPermision} = req.body;
    //check the login user have entry permission
    if (loginViewPermision !== "Yes") {
     return res
       .status(200)
       .json({
         status: "error",
         mssg: "User does not have permission to View a Customer Shipping Address",
       });
   }
    const result = await voucherNumberConfig.find({}, { __v: 0,entry_user_code:0,entry_timestamp:0});

    if (result) {
      res.status(200).json({
        status: "success",
        mssg: "Voucher Number Config Fetched Successfully",
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
// ROUTER 3:  Voucher Number Config get method api :/admin/voucherNumberConfig/getVoucherNumberConfigDetail
//.............................................................
router.get(
  "/getVoucherNumberConfigDetail",
  verifyUser,
  [
    body("voucher_code")
      .notEmpty()
      .withMessage("Voucher code Empty !")
      .isMongoId()
      .withMessage("Voucher code Value Is Invalid !"),
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
      const voucherCode = req.body.voucher_code;
      const {loginViewPermision} = req.body;
      //check the login user have entry permission
      if (loginViewPermision !== "Yes") {
       return res
         .status(200)
         .json({
           status: "error",
           mssg: "User does not have permission to View a Customer Shipping Address",
         });
     }
      const result = await voucherNumberConfig.findById(voucherCode, {
        __v: 0,
        entry_user_code:0,
        entry_timestamp:0 
      });

      if (result) {
        res.status(200).json({
          status: "success",
          mssg: "Voucher Number Config Fetched Successfully",
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
// ROUTER 4:  Voucher Number Config post method api :/admin/voucherNumberConfig/update
//.............................................................

// Update API for VoucherNumberConfig
router.post(
  "/update",
  [
    // Add validation rules using express-validator
    body("voucher_code")
      .notEmpty()
      .withMessage("Voucher Code Empty !")
      .isMongoId()
      .withMessage("Voucher Code Value Is Invalid !"),
    body("voucher_type")
      .notEmpty()
      .withMessage("Voucher Type Status is required!")
      .isIn(["Order Number", "Shipping Number"])
      .withMessage(
        'Voucher Type Status should be either "Order Number" or "Shipping Number"!'
      ),
    body("prefix_text").notEmpty().withMessage("Prefix Text is required"),
    body("mid_character_length")
      .notEmpty()
      .withMessage("Mid Character Length is required"),
    body("suffix_text").notEmpty().withMessage("Suffix Text is required"),
    body("starting_number")
      .notEmpty()
      .withMessage("Starting Number is required"),
  ],
  verifyUser,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorsArray = errors.array();
        return res.status(200).json({
          status: "error",
          field: errorsArray[0]["path"],
          mssg: errorsArray[0]["msg"],
        });
      }

//const voucherCode = req.body.voucher_code;
      const {
        voucher_code,
        prefix_text,
        mid_character_length,
        suffix_text,
        current_number,
        starting_number,
        voucher_type,
        loginEditPermision,
        ...updatedFields
      } = req.body;
         //check the login user have entry permission
         if (loginEditPermision !== "Yes") {
          return res
            .status(200)
            .json({
              status: "error",
              mssg: "User does not have permission to Update a Customer Shipping Address",
            });
        }
      
                //  Check if voucher_code already exists
                const existingVoucherCode = await voucherNumberConfig.findOne({
              //  _id: { $ne: voucher_code },
             voucher_code: voucher_code,
                });
          
                if (existingVoucherCode) {
                  return res
                    .status(200)
                    .json({ status: "error", mssg: "Voucher Code does not Found." });
                }


              // Check if voucher_type already exists
      const existingVoucherType = await voucherNumberConfig.findOne({
        _id: { $ne: voucher_code },
        voucher_type: voucher_type,
      });

      if (existingVoucherType) {
        return res
          .status(200)
          .json({ status: "error", mssg: "Voucher Type already exists" });
      }
          


      if (current_number != starting_number) {
        // Update all fields except current_number and starting_number
        const updatedVoucher = await voucherNumberConfig.findByIdAndUpdate(
          voucher_code,
          { $set: updatedFields,suffix_text:suffix_text,prefix_text:prefix_text,mid_character_length:mid_character_length},
          { new: true },
          // Update the starting_number here
         // (voucherCode.suffix_text = req.body.suffix_text,voucherCode.prefix_text = req.body.prefix_text,voucherCode.mid_character_length = req.body.mid_character_length)
        );
        res.status(200).json({
          status: "success",
          mssg: "Voucher Number Config Updated Successfully",
          data: updatedVoucher,
        });
      } else {
        // Update all fields
        const updatedVoucher = await voucherNumberConfig.findByIdAndUpdate(
          voucher_code,
          {
            $set: updatedFields,
            starting_number: starting_number,
            current_number: starting_number,
            suffix_text: suffix_text,
            prefix_text: prefix_text,
            mid_character_length: mid_character_length,
          },
          { new: true }
        );
        res.status(200).json({
          status: "success",
          mssg: "Voucher Number Config Updated Successfully",
          data: updatedVoucher,
        });
      }
      
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ status: "error", mssg: "Server Error" });
    }

  }
);

//.............................................................
// ROUTER 5:  Voucher Number Config post method api :/admin/voucherNumberConfig/del
//.............................................................
router.post(
  "/del",
  verifyUser,
  [
    body("voucher_code")
      .notEmpty()
      .withMessage("Voucher Code Empty !")
      .isMongoId()
      .withMessage("Voucher Code Value Is Invalid !"),
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
      const voucherCode = req.body.voucher_code;
      const {loginDeletePermision} = req.body;
      //check the login user have entry permission
      if (loginDeletePermision !== "Yes") {
       return res
         .status(200)
         .json({
           status: "error",
           mssg: "User does not have permission to Delete a Customer Shipping Address",
         });
     }

      const result = await voucherNumberConfig.findByIdAndDelete(voucherCode);
      if (result) {
        res.status(200).json({
          status: "success",
          mssg: "Voucher Number Config Deleted Successfully",
        });
      } else {
        res
          .status(200)
          .json({ status: "error", mssg: "Voucher Number Config Not Found" });
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ status: "error", mssg: "Server Error" });
    }
  }
);

module.exports = router;

