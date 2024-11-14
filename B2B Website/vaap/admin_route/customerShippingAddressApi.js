const express = require("express");
const router = express.Router();
const customerShippingAddress = require("../model/customerShippingAddressSchema");
const { body, validationResult } = require("express-validator");
const verifyUser = require("../middleware/adminverifyuser");
const customerMaster = require("../model/customerMasterSchema");
const { default: mongoose } = require("mongoose");

//.............................................................
// ROUTER 1:  Customer Master get method api :/admin/customershippingAddress/getcustomerMasterList
//.............................................................
router.get("/getcustomerMasterList", verifyUser, async (req, res) => {
  try {
    const { loginViewPermision } = req.body;
    //check the login user have entry permission
    if (loginViewPermision !== "Yes") {
      return res.status(200).json({
        status: "error",
        mssg: "User does not have permission to View a Customer Shipping Address",
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
// ROUTER 2:  Customer Billing Address post method api :/admin/customershippingAddress/add
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
      const existingAddress = await customerShippingAddress.findOne({
        customer_code: req.body.customer_code,
      });

      if (existingAddress) {
        // Customer already has an address, return an error
        return res.status(200).json({
          status: "error",
          mssg: "Customer Shipping Address already exists for this customer",
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
          mssg: "User does not have permission to Create a Customer Shipping Address",
        });
      }

      // Create a new voucher config
      const newConfig = await customerShippingAddress
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
            mssg: "Customer Shipping Address Saved Successfully",
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
// ROUTER 3:  Customer Shipping Address get method api :/admin/customerShippingAddress/getcustomerShippingAddressList
//.............................................................
router.get("/getcustomerShippingAddressList", verifyUser, async (req, res) => {
  try {
    const { loginViewPermision } = req.body;
    // Check if the login user has entry permission
    if (loginViewPermision !== "Yes") {
      return res.status(200).json({
        status: "error",
        mssg: "User does not have permission to view a Customer Cart",
      });
    }

    const CustomerDetails = await customerShippingAddress.aggregate([
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
            customer_code: 1,
            street: 1,
            city: 1,
            state: 1,
            ph_num: 1,
            zip_Code: 1,
            country: 1,
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
        mssg: "Customer Shipping Address not found",
      });
    } else {
      res.status(200).json({
        status: "success",
        data: CustomerDetails,
        mssg: "Customer Shipping Address Found Sucessfully",
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
// ROUTER 4:  Customer Shipping Address get method api :/admin/customerShippingAddress/getcustomerShippingAddressDetails
//.............................................................
router.post(
  "/getcustomerShippingAddressDetails",
  verifyUser,
  [
    body("customer_shipping_code")
      .notEmpty()
      .withMessage("customer shipping code is Empty !")
      .isMongoId()
      .withMessage("customer shipping code Value Is Invalid !"),
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
      const id = req.body.customer_shipping_code;

      const { loginViewPermision } = req.body;
      //check the login user have entry permission
      if (loginViewPermision !== "Yes") {
        return res.status(200).json({
          status: "error",
          mssg: "User does not have permission to View a Customer Shipping Address",
        });
      }

      const CustomerDetails = await customerShippingAddress.aggregate([
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
            customer_code: 1,
            street: 1,
            city: 1,
            state: 1,
            ph_num: 1,
            zip_Code: 1,
            country: 1,
            "Customer._id": 1,
            "Customer.customer_name": 1,
            "Customer.email": 1,
            "Customer.ph_num": 1,
            "Customer.user_name": 1,
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
          mssg: "Customer Shipping Address Fetched Successfully",
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
// ROUTER 5:  Customer Shipping Address post method api :/admin/customerShippingAddress/update
//.............................................................
router.post(
  "/update",
  verifyUser,

  [
    // Add validation rules using express-validator
    body("customer_shipping_code")
      .notEmpty()
      .withMessage("customer shipping code is Empty !")
      .isMongoId()
      .withMessage("customer shipping code Value Is Invalid !"),
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
          customer_shipping_code,
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
            mssg: "User does not have permission to Update a Customer Shipping Address",
          });
        }

        const updated = await customerShippingAddress.findByIdAndUpdate(
          customer_shipping_code,
          {
            entry_user_code: userCode,
            customer_code: customer_code,
            street: street,
            city: city,
            state: state,
            ph_num: ph_num,
            zip_Code: zip_Code,
            country: country,
          },
          { new: true }
        );
        if (updated) {
          res.status(200).json({
            status: "success",
            mssg: "Customer Shipping Address updated successfully",
            data: updated,
          });
        } else {
          res
            .status(200)
            .json({
              status: "error",
              mssg: "Customer Shipping Address not Found",
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
// ROUTER 6:  Customer Shipping Address post method api :/admin/customerShippingAddress/del
//.............................................................
router.post(
  "/delete",
  verifyUser,
  [
    body("customer_shipping_code")
      .notEmpty()
      .withMessage("customer shipping code is Empty !")
      .isMongoId()
      .withMessage("customer shipping code Value Is Invalid !"),
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
      const customercode = req.body.customer_shipping_code;
      const { loginDeletePermision } = req.body;
      //check the login user have entry permission
      if (loginDeletePermision !== "Yes") {
        return res.status(200).json({
          status: "error",
          mssg: "User does not have permission to Delete a Customer Shipping Address",
        });
      }

      const result = await customerShippingAddress.findByIdAndDelete(
        customercode
      );
      if (result) {
        res.status(200).json({
          status: "success",
          mssg: "Customer Shipping Deleted Successfully",
        });
      } else {
        res
          .status(200)
          .json({
            status: "error",
            mssg: "Customer Shipping Address Not Found",
          });
      }
    } catch (error) {
      console.log(error.mssg);
      res.status(500).json({ status: "error", mssg: "Server Error" });
    }
  }
);


module.exports = router;
