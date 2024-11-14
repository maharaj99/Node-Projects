const express = require("express");
const router = express.Router();
const addressMaster = require("../model/addressMasterSchema");
const { body, validationResult } = require("express-validator");
const { default: mongoose } = require("mongoose");
const verifyUser = require("../middleware/adminverifyuser");
const stateMaster = require("../model/stateMasterSchema");


//.............................................................
// ROUTER 1:  Address Master get method api :/admin/addressMaster/getStateAll
//.............................................................
router.get("/getStateAll", verifyUser, async (req, res) => {
    try {

      const {loginViewPermision} = req.body;
      //check the login user have entry permission
      if (loginViewPermision !== "Yes") {
       return res
         .status(200)
         .json({
           status: "error",
           mssg: "User does not have permission to View a Address Master",
         });
     }
      const result = await stateMaster.find({active:"Yes"},
        { __v: 0, entry_user_code: 0, entry_timestamp: 0,tax_percentage:0,flat_tax:0,_id:0,delivery_charges:0,active:0}
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
// ROUTER 2:   Address Master post method api :/admin/addressMaster/add
//.............................................................
router.post(
    "/add",
    verifyUser,
    [
      // Add validation rules using express-validator
      body("state").notEmpty().withMessage("State Name is required"),
      body("zipcode")
        .notEmpty()
        .withMessage("Zip Code  is required"),
      body("city").notEmpty().withMessage("City is required"),
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
          zipcode,
          city,
          active,
          loginEntryPermision,
        } = req.body;

          //check the login user have entry permission
       if (loginEntryPermision !== "Yes") {
        return res
          .status(200)
          .json({
            status: "error",
            mssg: "User does not have permission to Create a Address Master",
          });
      }
  
        const existingAddress = await addressMaster.findOne({
          state: state,
          city:city,
          zipcode:zipcode,
        });
  
        if (existingAddress) {
          return res
            .status(200)
            .json({ status: "error", mssg: "Address already exists" });
        }
        //save data in mongo
        addressMaster
          .create({
            state: state,
            city:city,
            zipcode:zipcode,
            active: active,
            entry_user_code: userCode,
          })
  
          .then((addressMaster) => {
            return res.status(200).json({
              status: "success",
              mssg: "Address Master Data Saved Successfully",
              id: addressMaster.id,
            });
          })
          .catch((err) => {
            console.log(err);
            return res.status(200).json({ status: "error", mssg: "Not Found" });
          });
      } catch (error) {
        console.log(error);
        res.status(500).json({ status: "error", mssg: "Server Error" });
      }
    }
  );

  //.............................................................
// ROUTER 3:  Address Master get method api :/admin/addressMaster/getAll
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
           mssg: "User does not have permission to View a Address Master",
         });
     }
      const result = await addressMaster.find(
        {},
        { __v: 0, entry_user_code: 0, entry_timestamp: 0 }
      ).sort({ "entry_timestamp": -1 });
  
      if (result) {
        res.status(200).json({
          status: "success",
          mssg: "Address Data Fetched Successfully",
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
// ROUTER 3:  Address Master get method api :/admin/stateMaster/getAll
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
           mssg: "User does not have permission to View a Address Master",
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
  // ROUTER 4:  Address Master get method api :/admin/stateMaster/getDetail
  //.............................................................
  router.get(
    "/getDetail",
    verifyUser,
    [
      body("address_code")
        .notEmpty()
        .withMessage("Addresss code Empty !")
        .isMongoId()
        .withMessage("Address code Value Is Invalid !"),
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
        const addressCode = req.body.address_code;
        const {loginViewPermision} = req.body;
        //check the login user have entry permission
        if (loginViewPermision !== "Yes") {
         return res
           .status(200)
           .json({
             status: "error",
             mssg: "User does not have permission to View a Address Master",
           });
       }
        const result = await addressMaster.findById(addressCode, {
          __v: 0,
          entry_user_code: 0,
          entry_timestamp: 0,
        }).sort({ "entry_timestamp": -1 });
  
        if (result) {
          res.status(200).json({
            status: "success",
            mssg: "Address Data Fetched Successfully",
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
// ROUTER 5:  Address Master post method api :/admin/addressMaster/update
//.............................................................
router.post(
    "/update",
    verifyUser,
  
    [
      // Add validation rules using express-validator
      body("address_code")
        .notEmpty()
        .withMessage("Address Code Empty !")
        .isMongoId()
        .withMessage("Address Code Value Is Invalid !"),
        body("state").notEmpty().withMessage("State Name is required"),
        body("zipcode")
          .notEmpty()
          .withMessage("Zip Code  is required"),
        body("city").notEmpty().withMessage("City is required"),
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
            address_code,
            state,
            zipcode,
            city,
            active,
            loginEditPermision
          } = req.body;

          //check the login user have entry permission
         if (loginEditPermision !== "Yes") {
          return res
            .status(200)
            .json({
              status: "error",
              mssg: "User does not have permission to Update a Address Master",
            });
        }
          
  
          const existingAddress = await addressMaster.findOne({
            _id: { $ne: address_code },
            state: state,
            city:city,
            zipcode:zipcode,
          });
    
          if (existingAddress) {
            return res
              .status(200)
              .json({ status: "error", mssg: "Address already exists" });
          }
          
          const updated = await addressMaster.findByIdAndUpdate(
              address_code,
            {
                state: state,
                city:city,
                zipcode:zipcode,
                active: active,
                entry_user_code: userCode,
            },
            { new: true }
          );
          if (updated) {
            res.status(200).json({
              status: "success",
              mssg: "Address Master updated successfully",
              data: updated,
            });
          } else {
            res
              .status(200)
              .json({ status: "error", mssg: "Address Master not Found" });
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
// ROUTER 6:  Address Master post method api :/admin/addressMaster/del
//.............................................................
router.post(
    "/del",
    verifyUser,
    [
        body("address_code")
        .notEmpty()
        .withMessage("Addresss code Empty !")
        .isMongoId()
        .withMessage("Address code Value Is Invalid !"),
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
        const addresscode = req.body.address_code;
  
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
        const result = await addressMaster.findByIdAndDelete(addresscode);
        if (result) {
          res
            .status(200)
            .json({
              status: "success",
              mssg: "Address Master Deleted Successfully",
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