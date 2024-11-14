const express = require("express");
const router = express.Router();
const customercart = require("../model/CustomerCartSchema");
const { body, validationResult } = require("express-validator");
const verifyUser = require("../middleware/adminverifyuser");
const customerList = require("../model/customerMasterSchema");
const subProductList = require("../model/subProduct_Master");
const { default: mongoose } = require("mongoose");


//.............................................................
// ROUTER 1:  Customer Master get method api :/admin/customerCart/getcustomerMasterList
//.............................................................
router.get("/getcustomerMasterList", verifyUser, async (req, res) => {
  try {
    const { loginViewPermision } = req.body;
    //check the login user have entry permission
    if (loginViewPermision !== "Yes") {
      return res.status(200).json({
        status: "error",
        mssg: "User does not have permission to View a Customer Cart",
      });
    }

    const result = await customerList.find({active:"Yes"},{_id:1,customer_name:1,email:1,ph_num:1,user_name:1}).sort({ "entry_timestamp": -1 })

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
// ROUTER 2:  Product Master get method api :/admin/customerCart/getSubProductList
//.............................................................
router.get("/getSubProductList", verifyUser, async (req, res) => {
  try {
    const { loginViewPermision } = req.body;
    //check the login user have entry permission
    if (loginViewPermision !== "Yes") {
      return res.status(200).json({
        status: "error",
        mssg: "User does not have permission to View a Customer Cart",
      });
    }
    const result = await subProductList.find(
      {active:"Yes"},
      {_id:1,sub_product_name:1 }
    ).sort({ "entry_timestamp": -1 });

    if (result) {
      res.status(200).json({
        status: "success",
        mssg: "Sub Product List Fetched Successfully",
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
// ROUTER 3:  Customer Cart post method api :/admin/customerCart/add
//.............................................................
router.post(
  "/add",
  verifyUser,
  [
    // Add validation rules using express-validator
    body("customer_code")
    .notEmpty().withMessage("Customer Code is required")
    .isMongoId()
    .withMessage("customer code  Value Is Invalid !"),

    body("sub_product_code")
      .notEmpty()
      .withMessage("Sub Product code is required")
      .isMongoId()
    .withMessage("Sub Product code  Value Is Invalid !"),

    body("quantity").notEmpty().withMessage("Quantity is required"),
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
        sub_product_code,
        quantity,
        userCode,
        loginEntryPermision,
      } = req.body;
      //check the login user have entry permission
      if (loginEntryPermision !== "Yes") {
        return res.status(200).json({
          status: "error",
          mssg: "User does not have permission to Create a Customer Cart",
        });
      }

      // Check if there is an existing product with the same customer_code and sub_product_code
      const existingProduct = await customercart.findOne({
        customer_code: customer_code,
        sub_product_code: sub_product_code,
      });

      if (existingProduct) {
        return res.status(200).json({
          status: "error",
          mssg: "customer cartlist with the same customer and sub-product already exists",
        });
      }

      //toke the product_code form sub_product_muster
      const productData = await subProductList.findOne({ _id: sub_product_code });

      if (!productData) {
        return res.status(200).json({
          status: 'error',
          mssg: 'Sub Product not found',
        });
      }
      
      const productcode = productData.product_code;
      const unit_type = productData.unit_type;
      
      //check the value of productcode before attempting to access its properties

      if (!productcode) {
        return res.status(200).json({
          status: 'error',
          mssg: 'Product code not found in subProductList',
        });
      }

      // Create a new customercart 
      const newConfig = await customercart
        .create({
          customer_code: customer_code,
          entry_user_code: userCode,
          product_code: productcode.product_code,
          unit_type: unit_type,
          sub_product_code: sub_product_code,
          quantity: quantity,
        })
        .then((newConfig) => {
          return res.status(200).json({
            status: "success",
            mssg: "Customer Cart Saved Successfully",
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
// ROUTER 4:  Customer Cart get method api :/admin/customerCart/getcustomerCartList
//.............................................................
router.get("/getcustomerCartList", verifyUser, async (req, res) => {
  try {
    const { loginViewPermision } = req.body;
    // Check if the login user has entry permission
    if (loginViewPermision !== "Yes") {
      return res.status(200).json({
        status: "error",
        mssg: "User does not have permission to view a Customer Cart",
      });
    }

    const CustomerDetails = await customercart.aggregate([
      {
        $lookup: {
          from: "customer_master",
          localField: "customer_code",
          foreignField: "_id",
          as: "Customer",
        },
      },
      {
        $lookup: {
          from: "sub_product_master",
          localField: "sub_product_code",
          foreignField: "_id",
          as: "subProduct",
        },
      },
      {
        $lookup: {
          from: "product_master",
          localField: "product_code",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $sort: { 'entry_timestamp': -1 }
      },
      {
        $project: {
          _id: 1,
          quantity: 1,
          purchase: 1,
          "Customer._id": 1,
          "Customer.customer_name": 1,
          "Customer.email": 1,
          "Customer.ph_num": 1,
          "Customer.user_name": 1,
          "product._id":1,
          "product.product_name":1,
          "subProduct._id": 1,
          "subProduct.sub_product_name": 1,


        },
      },
    ]);

    if (CustomerDetails.length === 0) {
      return res.status(200).json({
        status: "error",
        mssg: "Customer Cart not found",
      });
    } else {
      res.status(200).json({
        status: "success",
        data: CustomerDetails,
        mssg: "Customer Cart Found Sucessfully",
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
// ROUTER 5:  Customer Cart get method api :/admin/customerCart/getcustomerCartdetail
//.............................................................
router.post(
  "/getcustomerCartdetail",
  verifyUser,
  [
    body("customer_cart_code")
      .notEmpty()
      .withMessage("customer_cart_code is Empty !")
      .isMongoId()
      .withMessage("customer_cart_code Value Is Invalid !"),
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
      const { loginViewPermision } = req.body;
      //check the login user have entry permission
      if (loginViewPermision !== "Yes") {
        return res.status(200).json({
          status: "error",
          mssg: "User does not have permission to View a Customer Cart",
        });
      }
      const id = req.body.customer_cart_code;


      const CustomerDetails = await customercart.aggregate([
        {
          $lookup: {
            from: "customer_master",
            localField: "customer_code",
            foreignField: "_id",
            as: "Customer",
          },
        },
        {
          $lookup: {
            from: "sub_product_master",
            localField: "sub_product_code",
            foreignField: "_id",
            as: "subProduct",
          },
        },
        {
          $lookup: {
            from: "product_master",
            localField: "product_code",
            foreignField: "_id",
            as: "product",
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
            quantity: 1,
            purchase: 1,
            "Customer._id": 1,
            "Customer.customer_name": 1,
            "Customer.email": 1,
            "Customer.ph_num": 1,
            "Customer.user_name": 1,
            "product._id":1,
            "product.product_name":1,
            "subProduct._id": 1,
            "subProduct.sub_product_name": 1,
          },
        },
      ]);

      if (CustomerDetails.length === 0) {
        return res
          .status(200)
          .json({ status: "error", mssg: "Customer Cart Details not found" });
      }

      if (CustomerDetails) {
        res.status(200).json({
          status: "success",
          mssg: "Customer Cart Fetched Successfully",
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
// ROUTER 6:  Customer Cart post method api :/admin/customerCart/update
//.............................................................
router.post(
  "/update",
  verifyUser,

  [
    // Add validation rules using express-validator
    body("customer_cart_code")
      .notEmpty()
      .withMessage("Cart code Empty !")
      .isMongoId()
      .withMessage("Cart code Value Is Invalid !"),

    body("customer_code")
      .notEmpty()
      .withMessage("Customer code Empty !")
      .isMongoId()
      .withMessage("Customer code Value Is Invalid !"),

    body("sub_product_code")
      .notEmpty()
      .withMessage("Sub Product code Empty !")
      .isMongoId()
      .withMessage("Sub Product code Value Is Invalid !"),

    body("quantity").notEmpty().withMessage("Quantity is required"),
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
          customer_cart_code,
          userCode,
          customer_code,
          sub_product_code,
          quantity,
          loginEditPermision,
        } = req.body;

        //check the login user have entry permission
        if (loginEditPermision !== "Yes") {
          return res.status(200).json({
            status: "error",
            mssg: "User does not have permission to Update a Customer Cart",
          });
        }

        // Check if Product already exists
        const existingcustomerSubproduct = await customercart.findOne({
            _id: { $ne: customer_cart_code },
            customer_code: customer_code,
            sub_product_code:sub_product_code

        });
    
        if (existingcustomerSubproduct) {
          return res.status(200).json({ status: 'error',           
          mssg: "customer cart with the same customer and sub-product already exists",
        });
        }

      //toke the product_code form sub_product_muster
      const productData = await subProductList.findOne({ _id: sub_product_code });

      if (!productData) {
        return res.status(200).json({
          status: 'error',
          mssg: 'Sub Product not found',
        });
      }
      
      const productcode = productData.product_code;
      const unit_type = productData.unit_type;

      if (!productcode) {
        return res.status(200).json({
          status: 'error',
          mssg: 'Product code not found in subProductList',
        });
      }


        const updated = await customercart.findByIdAndUpdate(
          customer_cart_code,
          {
            customer_code: customer_code,
            entry_user_code: userCode,
            product_code: productcode.product_code,
            unit_type: unit_type,
            sub_product_code: sub_product_code,
            quantity: quantity,
          },
          { new: true }
        );

        if (updated) {
          res.status(200).json({
            status: "success",
            mssg: "Customer Cart updated successfully",
            data: updated,
          });
        } else {
          res
            .status(200)
            .json({ status: "error", mssg: "Customer Cart not Found" });
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
// ROUTER 6:  Customer Cart post method api :/admin/customerCart/del
//.............................................................
router.post(
  "/delete",
  verifyUser,
  [
    body("cart_code")
      .notEmpty()
      .withMessage("Cart code Empty !")
      .isMongoId()
      .withMessage("Cart code Value Is Invalid !"),
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
      const cartcode = req.body.cart_code;
      const { loginDeletePermision } = req.body;
      //check the login user have entry permission
      if (loginDeletePermision !== "Yes") {
        return res.status(200).json({
          status: "error",
          mssg: "User does not have permission to Delete a Customer Cart",
        });
      }

      const result = await customercart.findByIdAndDelete(cartcode);
      if (result) {
        res.status(200).json({
          status: "success",
          mssg: "Customer Cart Deleted Successfully",
        });
      } else {
        res
          .status(200)
          .json({ status: "error", mssg: "Customer Cart Not Found" });
      }
    } catch (error) {
      console.log(error.mssg);
      res.status(500).json({ status: "error", mssg: "Server Error" });
    }
  }
);

module.exports = router;
