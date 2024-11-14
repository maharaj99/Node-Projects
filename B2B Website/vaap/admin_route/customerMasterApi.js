const express = require("express");
const router = express.Router();
const customerMaster = require("../model/customerMasterSchema");
const { body, validationResult } = require("express-validator");
const verifyUser = require("../middleware/adminverifyuser");
const customerMasterImageandFile = require("../middleware/admin_uploadfiles");
const bcrypt = require('bcrypt');


//.............................................................
// ROUTER 1:  Customer Master post method api :/admin/CustomerMaster/add
//.............................................................
router.post(
  "/add",
  verifyUser,
  customerMasterImageandFile.customerFileAndImage,

  [
    // Add validation rules using express-validator
    body("customer_name").notEmpty().withMessage("Customer Name is required"),
    body("email").notEmpty().withMessage("Email is required"),
    body("country_code").notEmpty().withMessage("Country Code is required"),
    body("ph_num").notEmpty().withMessage("Phone No is required"),
    body("crredit_limit").notEmpty().withMessage("Credit Limit is required"),
    body("address").notEmpty().withMessage("Address is required"),
    body("user_name").notEmpty().withMessage("User Name is required"),
    body("password").notEmpty().withMessage("Password is required"),
    body("company_name").notEmpty().withMessage("Country Name is required"),
    body("contact_person").notEmpty().withMessage("Contact Person is required"),
    body("full_name").notEmpty().withMessage("Full Name is required"),
    body("dba_name").notEmpty().withMessage("DBA Name is required"),
    body("zip_code").notEmpty().withMessage("Zip Code is required"),
    body("street_address_1")
      .notEmpty()
      .withMessage("Street Address 1 is required"),
    body("street_address_2")
      .notEmpty()
      .withMessage("Street Address 2 is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("state").notEmpty().withMessage("State is required"),
    body("authority_number")
      .notEmpty()
      .withMessage("Authority Number is required"),
    body("ein").notEmpty().withMessage("EIN is required"),
    body("status")
      .notEmpty()
      .withMessage("Status is required!")
      .isIn(["Pending", "Approved", "Rejected"])
      .withMessage(
        'Active should be either "Pending" , "Approved" , "Rejected"!'
      ),
    body("active")
      .notEmpty()
      .withMessage("Active is required!")
      .isIn(["Yes", "No"])
      .withMessage('Active should be either "Yes" or "No"!'),

   


      body("upload_file_1")
      .custom((value, { req }) => {
        if (!req.files || (!req.files.upload_file_1)) {
          throw new Error("upload file 1 is required");
        }
        return true;
      }),
      body("upload_file_2")
      .custom((value, { req }) => {
        if (!req.files || (!req.files.upload_file_2)) {
          throw new Error("upload file 2 is required");
        }
        return true;
      }),
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
        customer_name,
        email,
        country_code,
        ph_num,
        crredit_limit,
        address,
        user_name,
        password,
        company_name,
        contact_person,
        full_name,
        dba_name,
        zip_code,
        street_address_1,
        street_address_2,
        city,
        state,
        authority_number,
        ein,
        status,
        active,
        loginEntryPermision,
      } = req.body;

      //check the login user have entry permission
      if (loginEntryPermision !== "Yes") {
        return res.status(200).json({
          status: "error",
          mssg: "User does not have permission to Create a Customer Master",
        });
      }

      const existingCustomerEmail = await customerMaster.findOne({
        email: email,
      });

      if (existingCustomerEmail) {
        return res
          .status(200)
          .json({ status: "error", mssg: "Customer Email already exists" });
      }

      const existingCustomerPhone = await customerMaster.findOne({
        ph_num: ph_num,
      });

      if (existingCustomerPhone) {
        return res.status(200).json({
          status: "error",
          mssg: "Customer Phone Number already exists",
        });
      }

      const existingCustomerUserName = await customerMaster.findOne({
        user_name: user_name,
      });

      if (existingCustomerUserName) {
        return res
          .status(200)
          .json({ status: "error", mssg: "Customer User Name already exists" });
      }

      const { upload_file_1, upload_file_2} = req.files || {};
      let filename1 = upload_file_1 ? upload_file_1[0].filename : "";
      let filename2 = upload_file_2 ? upload_file_2[0].filename : "";

      // Check if the user wants to upload an image
      const { customer_image } = req.files || {};
      let image = "customer_images/default.png"; // Default value

      if (customer_image) {
        image = "customer_images/" + customer_image[0].filename;
      }

      const salt = await bcrypt.genSalt(10);
      const encodedPassword = await bcrypt.hash(password, salt);

      //save data in mongo
      customerMaster
        .create({
          customer_name: customer_name,
          email: email,
          country_code: country_code,
          ph_num: ph_num,
          customer_image:image,
          crredit_limit: crredit_limit,
          address: address,
          user_name: user_name,
          password: encodedPassword,
          company_name: company_name,
          contact_person: contact_person,
          full_name: full_name,
          dba_name: dba_name,
          zip_code: zip_code,
          street_address_1: street_address_1, 
          street_address_2: street_address_2,
          city: city,
          state: state,
          authority_number: authority_number,
          ein: ein,
          status: status,
          active: active,
          entry_user_code: userCode,
          upload_file_1: "file_upload/" + filename1,
          upload_file_2: "file_upload/" + filename2,
        })

        .then((customerMaster) => {
          return res.status(200).json({
            status: "success",
            mssg: "Customer Master Data Saved Successfully",
            id: customerMaster._id,
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
// ROUTER 2:  Customer Master get method api :/admin/customerMaster/getcustomerMasterList
//.............................................................
router.get("/getcustomerMasterList", verifyUser, async (req, res) => {
  try {
    const { loginViewPermision } = req.body;
    //check the login user have entry permission
    if (loginViewPermision !== "Yes") {
      return res.status(200).json({
        status: "error",
        mssg: "User does not have permission to View a Customer Master",
      });
    }
    // const result = await customerMaster.find()
    // .select("customer_name email ph_num _id user_name");
    const result = await customerMaster.find(
      {},
      { __v: 0, entry_user_code: 0, entry_timestamp: 0 }
    ).sort({ "entry_timestamp": -1 });

    if (result) {
      res.status(200).json({
        status: "success",
        mssg: "Customer Master Fetched Successfully",
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
// ROUTER 3:  Customer Master get method api :/admin/customerMaster/getcustomerMasterDetail
//.............................................................
router.get(
  "/getcustomerMasterDetail",
  verifyUser,
  [
    body("customer_code")
      .notEmpty()
      .withMessage("Customer code Empty !")
      .isMongoId()
      .withMessage("Customer code Value Is Invalid !"),
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
      const customerCode = req.body.customer_code;

      const { loginViewPermision } = req.body;
      //check the login user have entry permission
      if (loginViewPermision !== "Yes") {
        return res.status(200).json({
          status: "error",
          mssg: "User does not have permission to View a Customer Master",
        });
      }
      // const result = await customerMaster
      //   .findById(customerCode)
      //   .select("customer_name email ph_num _id user_name");
      const result = await customerMaster.findById(customerCode,
        {},
        { __v: 0, entry_user_code: 0, entry_timestamp: 0 }
      ).sort({ "entry_timestamp": -1 });

      if (result) {
        res.status(200).json({
          status: "success",
          mssg: "Customer Master Detail Fetched Successfully",
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
// ROUTER 4:  Customer Master post method api :/admin/customerMaster/update
//.............................................................
router.post(
  "/update",
  customerMasterImageandFile.customerFileAndImage,
  [
    // Add validation rules using express-validator
    body("customer_code")
      .notEmpty()
      .withMessage("Customer code Empty !")
      .isMongoId()
      .withMessage("Customer code Value Is Invalid !"),
    body("customer_name").notEmpty().withMessage("Customer Name is required"),
    body("email").notEmpty().withMessage("Email is required"),
    body("country_code").notEmpty().withMessage("Country Code is required"),
    body("ph_num").notEmpty().withMessage("Phone No is required"),
    body("crredit_limit").notEmpty().withMessage("Credit Limit is required"),
    body("address").notEmpty().withMessage("Address is required"),
    body("user_name").notEmpty().withMessage("User Name is required"),
    body("company_name").notEmpty().withMessage("Country Name is required"),
    body("contact_person").notEmpty().withMessage("Contact Person is required"),
    body("full_name").notEmpty().withMessage("Full Name is required"),
    body("dba_name").notEmpty().withMessage("DBA Name is required"),
    body("zip_code").notEmpty().withMessage("Zip Code is required"),
    body("street_address_1")
      .notEmpty()
      .withMessage("Street Address 1 is required"),
    body("street_address_2")
      .notEmpty()
      .withMessage("Street Address 2 is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("state").notEmpty().withMessage("State is required"),
    body("authority_number")
      .notEmpty()
      .withMessage("Authority Number is required"),
    body("ein").notEmpty().withMessage("EIN is required"),
    body("status")
      .notEmpty()
      .withMessage("Status is required!")
      .isIn(["Pending", "Approved", "Rejected"])
      .withMessage(
        'Active should be either "Pending" , "Approved" , "Rejected"!'
      ),
    body("active")
      .notEmpty()
      .withMessage("Active is required!")
      .isIn(["Yes", "No"])
      .withMessage('Active should be either "Yes" or "No"!'),

  
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
        userCode,
        customer_code,
        customer_name,
        email,
        country_code,
        ph_num,
        crredit_limit,
        address,
        user_name,
        password,
        company_name,
        contact_person,
        full_name,
        dba_name,
        zip_code,
        street_address_1,
        street_address_2,
        city,
        state,
        authority_number,
        ein,
        status,
        active,
        loginEditPermision,
      } = req.body;

      //check the login user have entry permission
      if (loginEditPermision !== "Yes") {
        return res.status(200).json({
          status: "error",
          mssg: "User does not have permission to Update a Customer Master",
        });
      }

      const existingCustomerCode = await customerMaster.findOne({
        customer_code: customer_code,
      });

      if (existingCustomerCode) {
        return res
          .status(200)
          .json({ status: "error", mssg: "Customer does not Found." });
      }

      const existingCustomerEmail = await customerMaster.findOne({
        _id: { $ne: customer_code },
        email: email,
      });

      if (existingCustomerEmail) {
        return res
          .status(200)
          .json({ status: "error", mssg: "Customer Email already exists" });
      }

      const existingCustomerPhone = await customerMaster.findOne({
        _id: { $ne: customer_code },
        ph_num: ph_num,
      });

      if (existingCustomerPhone) {
        return res.status(200).json({
          status: "error",
          mssg: "Customer Phone Number already exists",
        });
      }

      const existingCustomerUserName = await customerMaster.findOne({
        _id: { $ne: customer_code },
        user_name: user_name,
      });

      if (existingCustomerUserName) {
        return res
          .status(200)
          .json({ status: "error", mssg: "Customer User Name already exists" });
      }

      const { upload_file_1, upload_file_2, customer_image } = req.files || {};
      let image
      let filename1
      let filename2

        const existingUser = await customerMaster.findById(customer_code);
        if (existingUser) {
          image = existingUser.customer_image;
          filename1= existingUser.upload_file_1
          filename2= existingUser.upload_file_2
        }

      if(upload_file_1){
         filename1 = upload_file_1 ? upload_file_1[0].filename : "";
      }
      else if(upload_file_2){
        filename2 = upload_file_2 ? upload_file_2[0].filename : "";
      }
      else if(customer_image ){
         image = customer_image ? customer_image[0].filename : "";
      }

      
      
      if(password){
        
         const salt = await bcrypt.genSalt(10);
         const encodedPassword = await bcrypt.hash(password, salt);

         await customerMaster.findByIdAndUpdate(
          customer_code,
          {
            password:encodedPassword,
          },
          { new: true }
        );
      }
    
      const updated = await customerMaster.findByIdAndUpdate(
        customer_code,
        {
          customer_name: customer_name,
          email: email,
          country_code: country_code,
          ph_num: ph_num,
          customer_image: "customer_image/" + image,
          crredit_limit: crredit_limit,
          address: address,
          user_name: user_name,
          company_name: company_name,
          contact_person: contact_person,
          full_name: full_name,
          dba_name: dba_name,
          zip_code: zip_code,
          street_address_1: street_address_1,
          street_address_2: street_address_2,
          city: city,
          state: state,
          authority_number: authority_number,
          ein: ein,
          status: status,
          active: active,
          entry_user_code: userCode,
          upload_file_1: "file_upload/" + filename1,
          upload_file_2: "file_upload/" + filename2,
        },
        { new: true }
      );

      if (updated) {
        res.status(200).json({
          status: "success",
          message: "Customer Master updated successfully",
          data: updated,
        });
      } else {
        res.status(200).send("Customer Master id not found");
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);


//.............................................................
// ROUTER 5:  Customer Master post method api :/admin/customerMaster/del
//.............................................................
router.post(
  "/del",
  verifyUser,
  [
    body("customer_code")
      .notEmpty()
      .withMessage("Customer code Empty !")
      .isMongoId()
      .withMessage("Customer code Value Is Invalid !"),
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
      const customerCode = req.body.customer_code;

      const { loginDeletePermision } = req.body;
      //check the login user have entry permission
      if (loginDeletePermision !== "Yes") {
        return res.status(200).json({
          status: "error",
          mssg: "User does not have permission to Delete a Customer Master",
        });
      }

      const result = await customerMaster.findByIdAndDelete(customerCode);
      if (result) {
        res.status(200).json({
          status: "success",
          mssg: "Customer Master Deleted Successfully",
        });
      } else {
        res
          .status(200)
          .json({ status: "error", mssg: "Customer Master Not Found" });
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ status: "error", mssg: "Server Error" });
    }
  }
);

module.exports = router;
