//imports
const express = require('express');
const router = express.Router();
const Registration = require('../model/customerMasterSchema')
const { body, validationResult } = require('express-validator');
const UploadFiles = require('../middleware/front_uploadfiles');
const verifyUser = require("../middleware/customerverifyuser");
const fs = require("fs");


const bcrypt = require('bcrypt');


//======================================
// Get Customer Profile Details
//=======================================
router.get('/getCustomerDetails', verifyUser, async (req, res) => {

  let customerCode = req.body.userCode;

  if (customerCode === "") {
    return res.status(200).json({ status: 'error', mssg: 'Customer Invalid' });
  }

  try {

    // Check if the customer exists
    const customerData = await Registration.findById(customerCode)
      .select("customer_name").select("email").select("country_code")
      .select("ph_num").select("customer_image").select("address")
      .select("user_name").select("company_name").select("contact_person")
      .select("full_name").select("dba_name").select("zip_code")
      .select("street_address_1").select("street_address_2").select("city")
      .select("state").select("authority_number").select("ein").select("upload_file_1").select("upload_file_2");

    if (!customerData) {
      return res.status(200).json({ status: 'error', mssg: 'Customer not found' });
    }

    res.status(200).json({
      status: "success",
      message: "Fetched successfully",
      customerData,
    });    
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 'error', mssg: 'Server Error' });
  }

});


//======================================
// Update a customer by ID
//=======================================
router.post('/updateCustomer',
  verifyUser,
  UploadFiles.updateDocument,
  [
    body("customer_name").notEmpty().withMessage("Customer Name is required"),
    body("email").notEmpty().withMessage("Email is required"),
    body("country_code").notEmpty().withMessage("Country Code is required"),
    body("ph_num").notEmpty().withMessage("Phone No is required"),
    body("address").notEmpty().withMessage("Address is required"),
    body("user_name").notEmpty().withMessage("User Name is required"),
    body("company_name").notEmpty().withMessage("Country Name is required"),
    body("contact_person").notEmpty().withMessage("Contact Person is required"),
    body("full_name").notEmpty().withMessage("Full Name is required"),
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

  ],
  async (req, res) => {
    let customerCode = req.body.userCode;

    if (customerCode === "") {
      return res.status(200).json({ status: 'error', mssg: 'Customer Invalid' });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({ status: 'error', field: errorsArray[0]['param'], mssg: errorsArray[0]['msg'] });
    } else {
      try {

        const {
          customer_name,
          email,
          country_code,
          ph_num,
          address,
          user_name,
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
        } = req.body;

        // Check if the customer exists
        const existingCustomer = await Registration.findById(customerCode);

        if (!existingCustomer) {
          return res.status(200).json({ status: 'error', mssg: 'Customer not found' });
        }

        const existingCustomerEmail = await Registration.findOne({
          _id: { $ne: customerCode },
          email: email,
        });

        if (existingCustomerEmail) {
          return res
            .status(200)
            .json({ status: "error", mssg: "This Email already exists" });
        }

        const existingCustomerPhone = await Registration.findOne({
          _id: { $ne: customerCode },
          ph_num: ph_num,
        });

        if (existingCustomerPhone) {
          return res.status(200).json({
            status: "error",
            mssg: "This Phone Number already exists",
          });
        }

        const existingCustomerUserName = await Registration.findOne({
          _id: { $ne: customerCode },
          user_name: user_name,
        });

        if (existingCustomerUserName) {
          return res
            .status(200)
            .json({ status: "error", mssg: "Customer User Name already exists" });
        }

        const { upload_file_1, upload_file_2, } = req.files || {};
        let filename1 = upload_file_1 ? upload_file_1[0].filename : "";
        let filename2 = upload_file_2 ? upload_file_2[0].filename : "";

        if(filename1!=""){
          await Registration.findByIdAndUpdate(customerCode,{
            upload_file_1: "file_upload/" + filename1,
          })
        }

        if(filename2!=""){
          await Registration.findByIdAndUpdate(customerCode,{
            upload_file_2: "file_upload/" + filename2,
          })
        }

        const updatedCustomer = await Registration.findByIdAndUpdate(
          customerCode,
          {
            customer_name: customer_name,
            email: email,
            country_code: country_code,
            ph_num: ph_num,
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
          },
          { new: true }
        );

        if (updatedCustomer) {
          res.status(200).json({
            status: "success",
            message: "Customer Master updated successfully",
            data: updatedCustomer,
          });
        } else {
          res.status(200).send("Customer Master id not found");
        }
      } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'error', mssg: 'Server Error' });
      }
    }
  });


//=============================
//castomer profile images chang
//=============================
router.post("/updateimage", verifyUser, UploadFiles.customer_profileimages, 

async (req, res) => {
 
    try {
      let customerCode = req.body.userCode;

      if (customerCode === "") {
        return res.status(200).json({ status: 'error', mssg: 'Customer Invalid' });
      }

      // Check if a new image is uploaded
      if (req.file) {
        const { filename } = req.file;

         //remove images if new images upload
         const existingUser = await Registration.findById(customerCode);
         if (existingUser) {
           const oldImageFilename = existingUser.customer_image;
           if (oldImageFilename !== "customer_images/default.png" && oldImageFilename !== "") {
             fs.unlink('./uploads/' + oldImageFilename, err => {
               if (err) return console.error(err);
               // console.log('success!')
             });
           }
         }

        // Update profile image in the database
        const updateuser = await Registration.findByIdAndUpdate(
          customerCode,
          { customer_image: "customer_images/" + filename }, // Update the field name to "customer_image"
          { new: true }
        );
        

        if (updateuser) {
          res.status(200).json({
            status: "success",
            message: "Profile Image updated successfully",
            data: updateuser,
          });
        } else {
          res.status(200).send({ status: "error", message: "Profile Image update failed" });
        }
      } else {
        res.status(200).json({
          status: "error",
          message: "No image uploaded",
        });
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).send({ status: "error", message: "Internal Server Error" });
    }
  
});


//=============================
//castomer password change
//=============================
router.post(
  "/updatepassword",
  verifyUser, // Assuming you have a verifyUser middleware
  [
    body("old_password").notEmpty().withMessage("Old Password Empty!"),
    body("password").notEmpty().withMessage("Password Empty!"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({
        status: "error",
        field: errorsArray[0]["param"],
        mssg: errorsArray[0]["msg"],
      });
    } else {
      try {
        let customerCode = req.body.userCode;

        if (customerCode === "") {
          return res.status(200).json({ status: 'error', mssg: 'Customer Invalid' });
        }

        const { old_password, password } = req.body;

        // Check if the old password matches the one in the database


        const user = await Registration.findById(customerCode);
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

        const updateuser = await Registration.findByIdAndUpdate(
          customerCode,
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
            .send({ status: "error", message: "Manage Profile not found" });
        }
      } catch (error) {
        console.error(error.message);
        res.status(500).send({ status: "error", message: "Internal Server Error" });
      }
    }
  }
);

module.exports = router;
