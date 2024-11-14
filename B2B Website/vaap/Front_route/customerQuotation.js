const express = require("express");
const router = express.Router();
const customerquotation = require("../model/customerQuotationSchema");
const { body, validationResult } = require("express-validator");
const verifyUser = require("../middleware/customerverifyuser");





//.............................................................
// ROUTER 1:  Customer Quotation post method api :/admin/customerQuotation/add
//.............................................................
router.post(
  "/insert",
  verifyUser,
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("ph_num").notEmpty().withMessage("Phone Number is required"),
    body("email").notEmpty().withMessage("Email is required"),
    body("address").notEmpty().withMessage("Address is required"),
    body("message").notEmpty().withMessage("Message is required"),
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
      // If the customer doesn't have an existing address, create a new on
      const {
        userCode,        
        ph_num,
        email,
        address,
        message,
        name,
      } = req.body;


      // Create a new Customer quotation
      const newConfig = await customerquotation
        .create({
          customer_code: userCode || null,
          ph_num: ph_num,
          email: email,
          address: address,
          message: message,
          name: name,
        })
        .then((newConfig) => {
          return res.status(200).json({
            status: "success",
            mssg: "Customer Quotation Saved Successfully",
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


module.exports = router;
