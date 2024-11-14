const express = require("express");
const router = express.Router();
const customerBillingAddress = require("../model/customerBilllingAddressSchema");
const customerShippingAddress = require("../model/customerShippingAddressSchema");
const address_master = require('../model/addressMasterSchema');
const { body, validationResult } = require("express-validator");
const verifyUser = require("../middleware/customerverifyuser");


//.............................................................
// ROUTER 0:  Get City & State by zipcode post method api :/customer/adresss/getAddressByZipcode
//.............................................................
router.post("/getAddressByZipcode", [

  body("zipcode")
    .notEmpty()
    .withMessage("Zipcode is required"),

], async (req, res) => {

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const errorsArray = errors.array();
    return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
  }
  else {
    try {

      let customerCode = req.body.userCode;
      const {
        zipcode
      } = req.body;

      if (customerCode === "") {
        return res.status(200).json({ status: 'error', mssg: 'Customer Invalid' });
      }
      else {

        let addressData = await address_master.findOne({ zipcode: zipcode, active: "Yes" })
          .select("state").select("city");

        return res.status(200).json({
          status: 'success',
          mssg: "Fetched Successfully",
          addressData
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
// ROUTER 1:  Customer Billing Address post method api :/customer/adresss/getcustomerBillingAddressDetails
//.............................................................
router.get(
  "/getcustomerBillingAddressDetails",
  verifyUser,
  async (req, res) => {
    try {

      let customerCode = req.body.userCode;

      if (customerCode === "") {
        return res.status(200).json({ status: 'error', mssg: 'Customer Invalid' });
      }
      else {

        const BillingAdress = await customerBillingAddress.find({ customer_code: customerCode }, { __v: 0, entry_user_code: 0, entry_date: 0 });


        if (BillingAdress.length === 0) {
          return res
            .status(200)
            .json({ status: "error", mssg: "customer Billing adress not found" });
        }

        if (BillingAdress) {
          res.status(200).json({
            status: "success",
            mssg: "Customer Billing Address Fetched Successfully",
            data: BillingAdress,
          });
        } else {
          res.status(200).json({ status: "error", mssg: "Not Found" });
        }
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ status: "error", mssg: "Server Error" });
    }
  }
);



//.....................................................................
//ROUTER 4:update shipping adress:/customer/adresss/add/billingAddress
//.....................................................................  
router.post('/add/billingAddress',
  verifyUser,
  [
    // Add validation rules using express-validator
    body("street").notEmpty().withMessage("Street is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("state").notEmpty().withMessage("State is required"),
    body("ph_num").notEmpty().withMessage("Phone Number is required"),
    body("zip_Code").notEmpty().withMessage("Zip Code is required"),
    body("country").notEmpty().withMessage("Country is required"),
  ],
  async (req, res) => {
    let customerCode = req.body.userCode;

    if (customerCode === "") {
      return res.status(200).json({ status: 'error', mssg: 'Customer Invalid' });
    }
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    }

    try {

      const {
        userCode,
        street,
        city,
        state,
        ph_num,
        zip_Code,
        country,
      } = req.body;


      // Check if a record exists
      const existingRecord = await customerBillingAddress.findOne();

      if (existingRecord) {
        // Update the existing record

        // Update logo and favicon only if provided
        const updateData = {
          customer_code: userCode,
          street: street,
          city: city,
          state: state,
          ph_num: ph_num,
          zip_Code: zip_Code,
          country: country,
        };

        await customerBillingAddress.findByIdAndUpdate(existingRecord._id, updateData);

        return res.status(200).json({ status: 'success', mssg: 'Data Updated Successfully', id: existingRecord._id });
      }
      //when first time data entry;
      else {


        const newRecord = await customerBillingAddress.create({
          customer_code: userCode,
          street: street,
          city: city,
          state: state,
          ph_num: ph_num,
          zip_Code: zip_Code,
          country: country,
        });

        return res.status(200).json({ status: 'success', mssg: 'Data Insert Successfully', id: newRecord._id });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }
  });



//.............................................................
// ROUTER 3:  Customer Billing Address post method api :/customer/adresss/getcustomerShippingAddressDetails
//.............................................................
router.get(
  "/getcustomerShippingAddressDetails",
  verifyUser,
  async (req, res) => {
    try {

      let customerCode = req.body.userCode;

      if (customerCode === "") {
        return res.status(200).json({ status: 'error', mssg: 'Customer Invalid' });
      }
      else {
        let customerCode = req.body.userCode;

        const CustomerShippingAdress = await customerShippingAddress.find({ customer_code: customerCode }, { __v: 0, entry_user_code: 0, entry_date: 0 });


        if (CustomerShippingAdress.length === 0) {
          return res
            .status(200)
            .json({ status: "error", mssg: "customer Shipping adress not found" });
        }

        if (CustomerShippingAdress) {
          res.status(200).json({
            status: "success",
            mssg: "Customer Shipping Address Fetched Successfully",
            data: CustomerShippingAdress,
          });
        } else {
          res.status(200).json({ status: "error", mssg: "Not Found" });
        }
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ status: "error", mssg: "Server Error" });
    }
  }
);


//.....................................................................
//ROUTER 4:update shipping adress:/customer/adresss/add/ShippingAddress
//.....................................................................

router.post('/add/ShippingAddress',
  verifyUser,
  [
    // Add validation rules using express-validator
    body("street").notEmpty().withMessage("Street is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("state").notEmpty().withMessage("State is required"),
    body("ph_num").notEmpty().withMessage("Phone Number is required"),
    body("zip_Code").notEmpty().withMessage("Zip Code is required"),
    body("country").notEmpty().withMessage("Country is required"),
  ],
  async (req, res) => {
    let customerCode = req.body.userCode;

    if (customerCode === "") {
      return res.status(200).json({ status: 'error', mssg: 'Customer Invalid' });
    }
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    }

    try {

      const {
        userCode,
        street,
        city,
        state,
        ph_num,
        zip_Code,
        country,
      } = req.body;


      // Check if a record exists
      const existingRecord = await customerShippingAddress.findOne();

      if (existingRecord) {
        // Update the existing record

        // Update logo and favicon only if provided
        const updateData = {
          customer_code: userCode,
          street: street,
          city: city,
          state: state,
          ph_num: ph_num,
          zip_Code: zip_Code,
          country: country,
        };

        await customerShippingAddress.findByIdAndUpdate(existingRecord._id, updateData);

        return res.status(200).json({ status: 'success', mssg: 'Data Updated Successfully', id: existingRecord._id });
      }
      //when first time data entry;
      else {


        const newRecord = await customerShippingAddress.create({
          customer_code: userCode,
          street: street,
          city: city,
          state: state,
          ph_num: ph_num,
          zip_Code: zip_Code,
          country: country,
        });

        return res.status(200).json({ status: 'success', mssg: 'Data Inserted Successfully', id: newRecord._id });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }
  });

module.exports = router;
