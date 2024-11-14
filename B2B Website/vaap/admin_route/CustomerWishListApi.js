 const express = require("express");
const router = express.Router();
const customerWishlist = require("../model/CustomerWishlistSchema");
const { body, validationResult } = require("express-validator");
const verifyUser = require("../middleware/adminverifyuser");
const customerList = require("../model/customerMasterSchema");
const subProductList = require('../model/subProduct_Master');
const { default: mongoose } = require("mongoose");


//.............................................................
// ROUTER 1:  Customer Master get method api :/admin/customerWishlist/getcustomerMasterList
//.............................................................
router.get("/getcustomerMasterList", verifyUser, async (req, res) => {
  try {
    const {loginViewPermision} = req.body;
    //check the login user have entry permission
    if (loginViewPermision !== "Yes") {
     return res
       .status(200)
       .json({
         status: "error",
         mssg: "User does not have permission to View a Customer WishList",
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
// ROUTER 2:  Product Master get method api :/admin/customerWishlist/getSubProductList
//.............................................................
router.get("/getSubProductList", verifyUser, async (req, res) => {
  try {
    const {loginViewPermision} = req.body;
    //check the login user have entry permission
    if (loginViewPermision !== "Yes") {
     return res
       .status(200)
       .json({
         status: "error",
         mssg: "User does not have permission to View a Customer WishList",
       });
   }
    const result = await subProductList.find(
      {active:"Yes"},
      { __v: 0, entry_user_code: 0, entry_timestamp: 0 }
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
// ROUTER 3:  Customer WishList post method api :/admin/customerWishlist/add
//.............................................................
router.post(
  "/add",
  verifyUser,
  [
    body("customer_code")
    .notEmpty().withMessage("Customer Code is required")
    .isMongoId()
    .withMessage("customer code  Value Is Invalid !"),

    body("sub_product_code")
      .notEmpty()
      .withMessage("Sub Product code is required")
      .isMongoId()
    .withMessage("Sub Product code  Value Is Invalid !"),
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
      const { customer_code, sub_product_code, product_code, userCode,loginEntryPermision } =
        req.body;

         //check the login user have entry permission
         if (loginEntryPermision !== "Yes") {
          return res
            .status(200)
            .json({
              status: "error",
              mssg: "User does not have permission to Create a Customer WishList",
            });
        }
            // Check if there is an existing product with the same customer_code and sub_product_code
          const existingProduct = await customerWishlist.findOne({
            customer_code: customer_code,
            sub_product_code: sub_product_code,
          });

          if (existingProduct) {
            return res.status(200).json({
              status: "error",
              mssg: "customer Wishlist with the same customer and sub-product already exists",
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

      if (!productcode) {
        return res.status(200).json({
          status: 'error',
          mssg: 'Product code not found in subProductList',
        });
      }

 

      const newConfig = await customerWishlist
        .create({
          customer_code: customer_code,
          entry_user_code: userCode,
          product_code: productcode.product_code,
          sub_product_code: sub_product_code,
        })
        .then((newConfig) => {
          return res.status(200).json({
            status: "success",
            mssg: "Customer WishList Saved Successfully",
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
// ROUTER 4:  Customer Cart get method api :/admin/customerWishlist/getcustomerWishList
//.............................................................
router.get("/getcustomerWishList", verifyUser, async (req, res) => {
  try {
    const { loginViewPermision } = req.body;
    // Check if the login user has entry permission
    if (loginViewPermision !== "Yes") {
      return res.status(200).json({
        status: "error",
        mssg: "User does not have permission to view a Customer Cart",
      });
    }

    const CustomerDetails = await customerWishlist.aggregate([
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
        mssg: "Customer WishList not found",
      });
    } else {
      res.status(200).json({
        status: "success",
        data: CustomerDetails,
        mssg: "Customer WishList Found Sucessfully",
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
// ROUTER 5:  Customer Wishlist get method api :/admin/customerWishlist/getcustomerWishlistdetail
//.............................................................
router.post(
  "/getcustomerWishlistdetail",
  verifyUser,
  [
    body("customer_wish_code")
      .notEmpty()
      .withMessage("customer wish code is Empty !")
      .isMongoId()
      .withMessage("customer wish code Value Is Invalid !"),
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
      const id = req.body.customer_wish_code;

      const { loginViewPermision } = req.body;
      //check the login user have entry permission
      if (loginViewPermision !== "Yes") {
        return res.status(200).json({
          status: "error",
          mssg: "User does not have permission to View a Customer WishList",
        });
      }

      const CustomerDetails = await customerWishlist.aggregate([
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
          .json({ status: "error", mssg: "Customer WishList  Details not found" });
      }

      if (CustomerDetails) {
        res.status(200).json({
          status: "success",
          mssg: "Customer WishList Fetched Successfully",
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

// ROUTER 6:  Customer Wishlist post method api :/admin/customerWishlist/update
//.............................................................
router.post(
  "/update",
  verifyUser,

  [
    // Add validation rules using express-validator
    body("customer_wish_code")
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
          customer_wish_code,
          userCode,
          customer_code,
          sub_product_code,
          loginEditPermision,
        } = req.body;
      
             //check the login user have entry permission
         if (loginEditPermision !== "Yes") {
          return res
            .status(200)
            .json({
              status: "error",
              mssg: "User does not have permission to Update a Customer WishList",
            });
        }
        
        // Check if Product already exists
        const existingcustomerSubproduct = await customerWishlist.findOne({
            _id: { $ne: customer_wish_code },
            customer_code: customer_code,
            sub_product_code:sub_product_code

        });
    
        if (existingcustomerSubproduct) {
          return res.status(200).json({ status: 'error',           
          mssg: "customer wishlist with the same customer and sub-product already exists",
        });
        }

        const productData = await subProductList.findOne({ _id: sub_product_code });

        if (!productData) {
          return res.status(200).json({
            status: 'error',
            mssg: 'Sub Product not found',
          });
        }
        
        const product_code = productData.product_code;

      //check the value of productcode before attempting to access its properties
        if (!product_code) {
          return res.status(200).json({
            status: 'error',
            mssg: 'Product code not found in subProductList',
          });
        }
        


        const updated = await customerWishlist.findByIdAndUpdate(
          customer_wish_code,
          {
            customer_code: customer_code,
            entry_user_code: userCode,
            product_code: product_code.product_code,
            sub_product_code: sub_product_code,
          },
          { new: true }
        );
        if (updated) {
          res.status(200).json({
            status: "success",
            mssg: "Customer WishList updated successfully",
            data: updated,
          });
        } else {
          res
            .status(200)
            .json({ status: "error", mssg: "Customer WishList not Found" });
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
// ROUTER 7:  Customer WishList post method api :/admin/customerWishlist/del
//.............................................................
router.post(
    "/del",
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
        const {loginDeletePermision} = req.body;
        //check the login user have entry permission
        if (loginDeletePermision !== "Yes") {
         return res
           .status(200)
           .json({
             status: "error",
             mssg: "User does not have permission to Delete a Customer WishList",
           });
       }
  
        const result = await customerWishlist.findByIdAndDelete(cartcode);
        if (result) {
          res.status(200).json({
            status: "success",
            mssg: "Customer WishList Deleted Successfully",
          });
        } else {
          res
            .status(200)
            .json({ status: "error", mssg: "Customer WishList Not Found" });
        }
      } catch (error) {
        console.log(error.mssg);
        res.status(500).json({ status: "error", mssg: "Server Error" });
      }
    }
  );

module.exports = router;
