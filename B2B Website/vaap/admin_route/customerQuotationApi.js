const express = require("express");
const router = express.Router();
const customerquotation = require("../model/customerQuotationSchema");
const { body, validationResult } = require("express-validator");
const verifyUser = require("../middleware/adminverifyuser");
const { default: mongoose } = require("mongoose");

//.............................................................
// ROUTER 1:  Customer Quotation post method api :/admin/customerQuotation/add
//.............................................................
router.post(
  "/add",
  verifyUser,
  [
    //  Add validation rules using express-validator
    body("customer_code")
    .notEmpty().withMessage("Customer Code is required")
    .isMongoId()
    .withMessage("customer code  Value Is Invalid !"),

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
        customer_code,
        ph_num,
        email,
        userCode,
        address,
        message,
        name,
        loginEntryPermision,
      } = req.body;

      //check the login user have entry permission
      if (loginEntryPermision !== "Yes") {
        return res.status(200).json({
          status: "error",
          mssg: "User does not have permission to Create a Customer Quotation",
        });
      }

      if (customer_code) {
        // Check if customer_code is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(customer_code)) {
          return res
            .status(200)
            .json({ status: "error", mssg: "Invalid Customer Code" });
        }
      } else {
        req.body.customer_code = null; // Set default value if customer_code is not provided
      }

      // Create a new Customer quotation
      const newConfig = await customerquotation
        .create({
          customer_code: customer_code,
          entry_user_code: userCode,
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



//.............................................................
// ROUTER 2:  Customer Quotation get method api :/admin/customerQuotation/getQuotationList
//.............................................................
router.get("/getQuotationList", verifyUser, async (req, res) => {
  try {
    const { loginViewPermision } = req.body;
    //check the login user have entry permission
    if (loginViewPermision !== "Yes") {
      return res.status(200).json({
        status: "error",
        mssg: "User does not have permission to View a Customer Cart",
      });
    }

    const customerQuotationList = await customerquotation.aggregate([
      {
        $lookup: {
          from: "customer_master",
          localField: "customer_code",
          foreignField: "_id",
          as: "Customer",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          ph_num: 1,
          email:1,
          address:1,
          message:1,
          "Customer._id": 1,
          "Customer.customer_name": 1

        },
      },
    ]);

    if (customerQuotationList.length === 0) {
      return res.status(200).json({
        status: "error",
        mssg: "customer Quotation  not found",
      });
    } else {
      res.status(200).json({
        status: "success",
        data: customerQuotationList,
        mssg: "customer Quotation List Fatch Sucessfully",
      });
    }

  } catch (error) {
    console.log(error.message);
    res.status(500).json({ status: "error", mssg: "Server Error" });
  }
});



//.............................................................
// ROUTER 3:  Customer Quotation get method api :/admin/customerQuotation/getCustomerdetails
//.............................................................
router.post("/getCustomerdetails", verifyUser , [
  body("customer_Quotation_Code")
    .notEmpty()
    .withMessage("customer Quotation Code Empty !")
    .isMongoId()
    .withMessage("customer Quotation Code Value Is Invalid !"),
], async (req, res) => {
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
    const { loginViewPermision } = req.body;
    //check the login user have entry permission
    if (loginViewPermision !== "Yes") {
      return res.status(200).json({
        status: "error",
        mssg: "User does not have permission to View a Customer Cart",
      });
    }
    const id = req.body.customer_Quotation_Code;

    const customerQuotationList = await customerquotation.aggregate([
      {
        $lookup: {
          from: "customer_master",
          localField: "customer_code",
          foreignField: "_id",
          as: "Customer",
        },
      },
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        }, // Search by id
      },
      {
        $sort: { 'entry_timestamp': -1 }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          ph_num: 1,
          email:1,
          address:1,
          message:1,
          "Customer._id": 1,
          "Customer.customer_name": 1

        },
      },
    ]);

    if (customerQuotationList.length === 0) {
      return res.status(200).json({
        status: "error",
        mssg: "customer Quotation  not found",
      });
    } else {
      res.status(200).json({
        status: "success",
        data: customerQuotationList,
        mssg: "customer Quotation List Fatch Sucessfully",
      });
    }
   } catch (error) {
    console.log(error.message);
    res.status(500).json({ status: "error", mssg: "Server Error" });
  }
});



// ROUTER 4:  Delete a product by ID: DELETE "/admin/customerQuotation/delete"
router.post("/delete",  [
  // Add validation rules using express-validator
  body("customer_Quotation_Code")
    .notEmpty()
    .withMessage("customer Quotation code Empty !")
    .isMongoId()
    .withMessage("customer Quotation code Value Is Invalid !"),

], verifyUser, async (req, res) => {
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
    let loginDeletePermision = req.body.loginDeletePermision;
    //check the login user have View permission
    if (loginDeletePermision !== "Yes") {
      return res.status(200).json({
        status: "error",
        mssg: "User does not have permission to Delete",
      });
    }
    const Code = req.body.customer_Quotation_Code;

    const result = await customerquotation.findByIdAndDelete(Code);
    if (result) {
      res.status(200).json({
        status: "success",
        message: "customer quotation delete succesfully",
      });
    } else {
      return res
        .status(200)
        .json({ status: "error", message: "customerquotation not found" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
});



// ROUTER 5: Customer Quotation  post method api :/admin/customerQuotation/update
//.............................................................
router.post(
  "/update",
  verifyUser,

  [
    // Add validation rules using express-validator

    body("customer_Quotation_Code")
      .notEmpty()
      .withMessage("customer Quotation Code Empty !")
      .isMongoId()
      .withMessage("customer Quotation Code Value Is Invalid !"),

    body("customer_code")
      .notEmpty().withMessage("Customer Code is required")
      .isMongoId()
      .withMessage("customer code  Value Is Invalid !"),

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
        status: "validation error",
        field: errorsArray[0]["path"],
        mssg: errorsArray[0]["msg"],
      });
    } else {
      try {
        const {
          customer_Quotation_Code,
          customer_code,
          userCode,
          name,
          ph_num,
          email,
          address,
          message,
          loginEditPermision,
        } = req.body;

        //check the login user have entry permission
        if (loginEditPermision !== "Yes") {
          return res.status(200).json({
            status: "error",
            mssg: "User does not have permission to Update a Customer WishList",
          });
        }

        const updated = await customerquotation.findByIdAndUpdate(
          customer_Quotation_Code,
          {
            name: name,
            customer_code:customer_code,
            ph_num: ph_num,
            email: email,
            address: address,
            entry_user_code: userCode,
            message: message,
          },
          { new: true }
        );
        if (updated) {
          res.status(200).json({
            status: "success",
            mssg: "Customer Quotation updated successfully",
            data: updated,
          });
        } else {
          res
            .status(200)
            .json({ status: "error", mssg: "Customer Quotation not Found" });
        }
      } catch (error) {
        console.log(error.mssg);
        res
          .status(500)
          .json({ status: "error", mssg: "Internal Server Error" });
      }
    }
  }
);

module.exports = router;
