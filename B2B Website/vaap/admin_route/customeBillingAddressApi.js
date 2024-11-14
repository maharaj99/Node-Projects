const express = require("express");
const router = express.Router();
const customerBillingAddress = require("../model/customerBilllingAddressSchema");
const { body, validationResult } = require("express-validator");
const verifyUser = require("../middleware/adminverifyuser");
const customerMaster = require("../model/customerMasterSchema");
const { default: mongoose } = require("mongoose");


//.............................................................
// ROUTER 1: get all Customer list get method api :/admin/customerBillingAddress/getCustomerList
//.............................................................
router.get("/getCustomerList", verifyUser, async (req, res) => {
  try {
    const { loginViewPermision } = req.body;
    //check the login user have entry permission
    if (loginViewPermision !== "Yes") {
      return res.status(200).json({
        status: "error",
        mssg: "User does not have permission to View a Customer Billing Address",
      });
    }
    // const result = await customerMaster.find(
    //   {},
    //   { __v: 0, entry_user_code: 0, entry_timestamp: 0 }
    // );

    const result = await customerMaster
      .find()      
      .select("customer_name email ph_num _id user_name")
      .sort({ "entry_timestamp": -1 });


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
// ROUTER 2:  Customer Billing Address post method api :/admin/customerBillingAddress/add
//.............................................................
router.post(
  "/add",
  verifyUser,
  [
    // Add validation rules using express-validator
    body("customer_code")
    .notEmpty().withMessage("Customer Code is required")
    .isMongoId().withMessage('Invalid Customer code value!'),
    
    body("street").notEmpty().withMessage("Street is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("state").notEmpty().withMessage("State is required"),
    body("ph_num").notEmpty().withMessage("Phone Number is required"),
    body("zip_Code").notEmpty().withMessage("Zip Code is required"),
    body("country").notEmpty().withMessage("Country is required"),
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
      // Check if the customer already has an address
      const existingAddress = await customerBillingAddress.findOne({
        customer_code: req.body.customer_code,
      });

      if (existingAddress) {
        // Customer already has an address, return an error
        return res.status(200).json({
          status: "error",
          mssg: "Customer Billing Address already exists for this customer",
        });
      }

      // If the customer doesn't have an existing address, create a new on
      const {
        customer_code,
        userCode,
        street,
        city,
        state,
        ph_num,
        zip_Code,
        country,
        loginEntryPermision,
      } = req.body;

      //check the login user have entry permission
      if (loginEntryPermision !== "Yes") {
        return res.status(200).json({
          status: "error",
          mssg: "User does not have permission to Create a Customer Billing Address",
        });
      }

      // Create a new voucher config
      const newConfig = await customerBillingAddress
        .create({
          customer_code: customer_code,
          entry_user_code: userCode,
          street: street,
          city: city,
          state: state,
          ph_num: ph_num,
          zip_Code: zip_Code,
          country: country,
        })
        .then((newConfig) => {
          return res.status(200).json({
            status: "success",
            mssg: "Customer Billing Address Saved Successfully",
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
// ROUTER 3:  Customer Billing Address get method api :/admin/customerBillingAddress/getcustomerBillingAddressList
//.............................................................
router.get("/getcustomerBillingAddressList", verifyUser, async (req, res) => {
  try {
    const { loginViewPermision } = req.body;
    // Check if the login user has entry permission
    if (loginViewPermision !== "Yes") {
      return res.status(200).json({
        status: "error",
        mssg: "User does not have permission to view a Customer Cart",
      });
    }

    const CustomerDetails = await customerBillingAddress.aggregate([
      {
        $lookup: {
          from: "customer_master",
          localField: "customer_code",
          foreignField: "_id",
          as: "Customer",
        },
      },
      {
        $sort: { 'entry_timestamp': -1 }
      },
      {
        $project: {
          _id: 1,
            customer_code:1,
            street:1,
            city:1,
            state:1,
            ph_num:1,
            zip_Code:1,
            country:1,
          "Customer._id": 1,
          "Customer.customer_name": 1,
          "Customer.email": 1,
          "Customer.ph_num": 1,
          "Customer.user_name": 1,
        },
      },
    ]);

    if (CustomerDetails.length === 0) {
      return res.status(200).json({
        status: "error",
        mssg: "Customer Billing Address not found",
      });
    } else {
      res.status(200).json({
        status: "success",
        data: CustomerDetails,
        mssg: "Customer Billing Address Found Sucessfully",
      });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      status: "error",
      mssg: "Server Error",
    });
  }
});


//.............................................................
// ROUTER 4:  Customer Billing Address details get method api :/admin/customerBillingAddress/getcustomerBillingAddressDetails
//.............................................................
router.post(
  "/getcustomerBillingAddressDetails",
  verifyUser,
  [
    body("customer_billing_code")
      .notEmpty()
      .withMessage("customer_billing_code is Empty !")
      .isMongoId()
      .withMessage("customer_billing_code Value Is Invalid !"),
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
      const id = req.body.customer_billing_code;

      const { loginViewPermision } = req.body;
      //check the login user have entry permission
      if (loginViewPermision !== "Yes") {
        return res.status(200).json({
          status: "error",
          mssg: "User does not have permission to View a Customer Billing Address",
        });
      }

      const CustomerDetails = await customerBillingAddress.aggregate([
      
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
          $project: {
            _id: 1,
            customer_code:1,
            street:1,
            city:1,
            state:1,
            ph_num:1,
            zip_Code:1,
            country:1,
            "Customer._id":1,
            "Customer.customer_name":1,
            "Customer.email":1,
            "Customer.ph_num":1,
            "Customer.user_name":1,

           
          },
        },
      ]);

      if (CustomerDetails.length === 0) {
        return res
          .status(200)
          .json({ status: "error", mssg: "customer Details not found" });
      }

      if (CustomerDetails) {
        res.status(200).json({
          status: "success",
          mssg: "Customer Billing Address Fetched Successfully",
          data: CustomerDetails,
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
// ROUTER 5:  Customer Billing Address post method api :/admin/customerBillingAddress/update
//.............................................................
router.post(
  "/update",
  verifyUser,

  [
    // Add validation rules using express-validator
    body("customer_billing_code")
      .notEmpty()
      .withMessage("customer_billing_code is Empty !")
      .isMongoId()
      .withMessage("customer_billing_code Value Is Invalid !"),
    body("customer_code").notEmpty().withMessage("Customer Code is required"),
    body("street").notEmpty().withMessage("Street is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("state").notEmpty().withMessage("State is required"),
    body("ph_num").notEmpty().withMessage("Phone Number is required"),
    body("zip_Code").notEmpty().withMessage("Zip Code is required"),
    body("country").notEmpty().withMessage("Country is required"),
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
          customer_billing_code,
          userCode,
          customer_code,
          street,
          city,
          state,
          ph_num,
          zip_Code,
          country,
          loginEditPermision,
        } = req.body;
        //check the login user have entry permission
        if (loginEditPermision !== "Yes") {
          return res.status(200).json({
            status: "error",
            mssg: "User does not have permission to Update a Customer Billing Address",
          });
        }

        const updated = await customerBillingAddress.findByIdAndUpdate(
          customer_billing_code,
          {
            entry_user_code: userCode,
            street: street,
            city: city,
            state: state,
            ph_num: ph_num,
            zip_Code: zip_Code,
            customer_code: customer_code,
            country: country,
          },
          { new: true }
        );
        if (updated) {
          res.status(200).json({
            status: "success",
            mssg: "Customer Billing Address updated successfully",
            data: updated,
          });
        } else {
          res
            .status(200)
            .json({
              status: "error",
              mssg: "Customer Billing Address not Found",
            });
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

//.............................................................
// ROUTER 6:  Customer Billing Address post method api :/admin/customerBillingAddress/delete
//.............................................................
router.post(
  "/delete",
  verifyUser,
  [
    body("customer_billing_code")
      .notEmpty()
      .withMessage("customer_billing_code is Empty !")
      .isMongoId()
      .withMessage("customer_billing_code Value Is Invalid !"),
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
      const customercode = req.body.customer_billing_code;
      const { loginDeletePermision } = req.body;
      //check the login user have entry permission
      if (loginDeletePermision !== "Yes") {
        return res.status(200).json({
          status: "error",
          mssg: "User does not have permission to Delete a Customer Billing Address",
        });
      }

      const result = await customerBillingAddress.findByIdAndDelete(
        customercode
      );
      if (result) {
        res.status(200).json({
          status: "success",
          mssg: "Customer Billing Address Deleted Successfully",
        });
      } else {
        res
          .status(200)
          .json({
            status: "error",
            mssg: "Customer Billing Address Not Found",
          });
      }
    } catch (error) {
      console.log(error.mssg);
      res.status(500).json({ status: "error", mssg: "Server Error" });
    }
  }
);

module.exports = router;
