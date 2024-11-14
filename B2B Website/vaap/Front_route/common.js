// imports
const express = require('express');
const router = express.Router();
const systemapi = require('../model/systemConfigSchema');
const customercart = require("../model/CustomerCartSchema");
const customerWishlist = require("../model/CustomerWishlistSchema");
const Customer = require('../model/customerMasterSchema');
const category = require('../model/category_master');
const sub_product_master = require('../model/subProduct_Master');


const { body, validationResult } = require('express-validator');
const verifyUser = require('../middleware/customerverifyuser');



// .............................................................
// ROUTER 1 : Get method api : /front/commonPage/systemInfo/get
// .............................................................

router.get('/systemInfo/get', verifyUser, async (req, res) => {
  try {

    const ConfigData = await systemapi.find({}, { __v: 0, entry_timestamp: 0 });
    // res.send(compdetails);
    res.status(200).json({ status: 'sucess', mssg: 'System Configuration data fetch', data: ConfigData });
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
});


// .............................................................
// ROUTER 2 : Get cart api : /front/commonPage/cart/get
// .............................................................
router.get('/cart/get', verifyUser, async (req, res) => {
  try {
    if (req.body.userCode === "") {
      // Handle the case where userCode is empty (no auth token provided)
      res.status(200).json({
        status: 'success',
        mssg: 'Customer Number of cart fetch',
        numberOfItems: 0,
      });
    }
    else {
      let customerCode = req.body.userCode;

      const Cart = await customercart.find({ customer_code: customerCode }, {});

      // Calculate the number of items in the user's cart
      const numberOfItemsInCart = Cart.length;

      res.status(200).json({
        status: 'success',
        mssg: 'Customer Number of cart fetch',
        numberOfCarts: numberOfItemsInCart,
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
});



// .............................................................
// ROUTER 3 : Get wish api : /front/commonPage/wish/get
// .............................................................
router.get('/wish/get', verifyUser, async (req, res) => {
  try {
    if (req.body.userCode === "") {
      // Handle the case where userCode is empty (no auth token provided)
      res.status(200).json({
        status: 'success',
        mssg: 'Customer Number of cart fetch',
        numberOfItems: 0,
      });
    }
    else {
      let customerCode = req.body.userCode;

      const Wish = await customerWishlist.find({ customer_code: customerCode }, {});

      // Calculate the number of items in the user's cart
      const numberOfItemsInWish = Wish.length;

      res.status(200).json({
        status: 'success',
        mssg: 'Customer Number of wish product fetch',
        numberOfWish: numberOfItemsInWish,
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
});


// .............................................................
// ROUTER 4 : Get wish api : /front/commonPage/customerDetails/get
// .............................................................
router.get('/customerDetails/get', verifyUser, async (req, res) => {
  try {
    
    if (req.body.userCode === "") {
      // Handle the case where userCode is empty (no auth token provided)
      res.status(200).json({
        status: 'success',
        mssg: 'Customer details not found',
        data: []
      });
    }
    else {
      let customerCode = req.body.userCode;

      const customer = await Customer.find({ _id: customerCode }, { _id: 1, customer_name: 1, customer_image: 1,status:1 });

      res.status(200).json({
        status: 'success',
        mssg: 'Customer details fetch',
        data: customer
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
});


//............................................  
//ROUTER 5 :Get all category and sub_category;Get:/front/commonPage/category/subcategory
//............................................
router.get('/category/subcategory', async (req, res) => {
  try {
    const Categorys = await category.aggregate([
      {
        $lookup: {
          from: 'sub_category',
          localField: '_id',
          foreignField: 'category_code',
          as: 'sub_category',
          "pipeline": [
            { "$match": { "active": "Yes" } },
          ],
        }
      },
      { "$match": { "active": "Yes", "sub_category.active": "Yes" } },
      {
        $project: {
          "_id": 1,
          "category_name": 1,
          "sub_category._id": 1,
          "sub_category.sub_category_name": 1
        }
      }

    ])
    if (Categorys.length === 0) {
      return res.status(200).json({ status: 'error', mssg: 'Categorys not found' });
    }

    return res.status(200).json({ status: 'success', mssg: 'Category details fetched successfully', data: Categorys });

  }
  catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
});



//...........................
//ROUTER 6 :Add to cart api:/front/commonPage/addToCart
//...........................
router.post(
  "/addToCart",
  verifyUser,
  [
    body('cart_details.*.sub_product_code')
      .notEmpty().withMessage('Sub Product Empty !')
      .isMongoId().withMessage('Sub Product Is Invalid !'),

    body('cart_details.*.quantity')
      .notEmpty().withMessage('Quantity Empty !')
      .isNumeric().withMessage('Quantity Only Number Accepted !'),

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
        cart_details,
        userCode,
      } = req.body;

      if (!userCode) {
        res.status(200).json({ status: "error", mssg: "Customer invalid" });
      }
      else {

        for (let index = 0; index < cart_details.length; index++) {

          const sub_product_code = cart_details[index].sub_product_code;
          const quantity = cart_details[index].quantity;

          // First Delete Existing Cart Product
          await customercart.deleteOne({
            customer_code: userCode,
            sub_product_code: sub_product_code,
          });

          let subProductDataget = await sub_product_master.findById(sub_product_code).select("unit_type");

          await customercart
            .create({
              customer_code: userCode,
              sub_product_code: sub_product_code,
              unit_type: subProductDataget.unit_type,
              quantity: quantity,
            });

        }

        res.status(200).json({ status: 'success', message: 'Product Add To Cart Successfully' });

      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error", mssg: "Server Error" });
    }
  }
);



//...........................
//ROUTER 7 :Add to wish list api:/front/commonPage/addToWish
//...........................
router.post(
  "/addToWish",
  verifyUser,
  [
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
      const {
        sub_product_code,
        userCode,
      } = req.body;

      if (!userCode) {
        res.status(200).json({ status: "error", mssg: "Customer invalid" });
      }
      else {
        // Check if there is an existing product with the same customer_code and sub_product_code
        const existingProduct = await customerWishlist.findOne({
          customer_code: userCode,
          sub_product_code: sub_product_code,
        });

        if (existingProduct) {
          return res.status(200).json({
            status: "error",
            mssg: "customer Wish list with the same customer and sub-product already exists",
          });
        }

        // Create a new customercart 
        const newConfig = await customerWishlist
          .create({
            customer_code: userCode,
            sub_product_code: sub_product_code,
          });
        res.status(200).json({ status: 'success', message: 'add the product in wishlist successfully', data: newConfig });
      }

    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error", mssg: "Server Error" });
    }
  }
);


// ===================================================
// ROUTER 8 : Get Sub Product List By Product Code ( GET method api : /front/commonPage/getSubProductListByProductCode )
// ===================================================
router.post('/getSubProductListByProductCode', [

  body('product_code')
    .notEmpty().withMessage('Product Code Empty !')
    .isMongoId().withMessage('Product Code Is Invalid !'),

], async (req, res) => {

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const errorsArray = errors.array();
    return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
  }
  else {
    try {

      const {
        product_code,
      } = req.body;

      let subProductList = await sub_product_master.find({ product_code: product_code, active: "Yes" }, {
        sub_product_name: 1,
        sub_product_image: 1,
        unit: 1,
        unit_type: 1,
        per_box_pcs: 1,
        buying_price: 1,
        mrp: 1,
        discount_type: 1,
        discount: 1,
        selling_price: 1,
      }).sort({ sub_product_name: 1 });

      return res.status(200).json({
        status: 'success',
        mssg: "Fetched Successfully",
        subProductList
      });

    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }
  }

})

module.exports = router
