// imports
const express = require('express');
const router = express.Router();
const customercart = require("../model/CustomerCartSchema");
const sub_product_master = require("../model/subProduct_Master");

const { body, validationResult } = require('express-validator');
const verifyUser = require('../middleware/customerverifyuser');
const mongoose = require('mongoose');




// ===================================================
// ROUTER : 1 customer cart list view ( get method api :/front/cart/customerCartListget
// ===================================================

router.get('/customerCartListget', verifyUser, async (req, res) => {

  try {

    let customerCode = req.body.userCode

    if (customerCode === "") {
      return res.status(200).json({ status: 'error', mssg: 'Customer Invalid' });
    }

    const cartProducts = await customercart.aggregate([

      {
        $lookup: {
          from: 'sub_product_master',
          localField: 'sub_product_code',
          foreignField: '_id',
          as: 'sub_product_master',
          pipeline: [
            {
              $lookup:
              {
                from: 'product_master',
                localField: 'product_code',
                foreignField: '_id',
                as: 'product'
              }
            },
          ]
        }
      },
      {
        $match: { customer_code: new mongoose.Types.ObjectId(customerCode) }
      },
      {
        $project: {
          "_id": 1,
          "quantity": 1,
          "unit_type": 1,
          "sub_product_master._id": 1,
          "sub_product_master.sub_product_name": 1,
          "sub_product_master.sub_product_image": 1,
          "sub_product_master.unit": 1,
          "sub_product_master.unit_type": 1,
          "sub_product_master.per_box_pcs": 1,
          "sub_product_master.selling_price": 1,
          "sub_product_master.per_pcs_selling_price": 1,
          "sub_product_master.product._id": 1,
          "sub_product_master.product.product_name": 1,
        },
      },

    ])

    if (cartProducts.length === 0) {
      return res.status(200).json({ status: 'error', mssg: 'Product not found' });
    }

    return res.status(200).json({ status: 'success', mssg: 'all cart Products fetched successfully', data: cartProducts });

  }
  catch (error) {
    console.log(error);
    res.status(500).json({ status: 'server error', mssg: 'Internal Server Error' });
  }

});

// ===================================================
// ROUTER : 2 Update customer cart ( get method api :/front/cart/updateCustomerCart
// ===================================================
router.post('/updateCustomerCart', verifyUser, [

  body('sub_product_code')
    .notEmpty().withMessage('Sub product code is empty!')
    .isMongoId().withMessage('Invalid Sub product code value!'),

  body('quantity')
    .notEmpty().withMessage('Quantity Empty !')
    .isNumeric().withMessage('Quantity Only Number Accepted !'),

  body("unit_type")
    .notEmpty()
    .withMessage("Unit Type is required!")
    .isIn(["Box", "Pcs"])
    .withMessage('Unit Type should be either "Box" or "Pcs"!'),

], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorsArray = errors.array();
    return res.status(200).json({ status: 'error', field: errorsArray[0].param, mssg: errorsArray[0].msg });
  } else {
    try {

      let {
        userCode,
        sub_product_code,
        quantity,
        unit_type,
      } = req.body;

      const customerCode = userCode;

      if (customerCode === "") {
        return res.status(200).json({ status: 'error', mssg: 'Customer Invalid' });
      }

      let subProductDataget = await sub_product_master.findById(sub_product_code).select("unit_type");

      if (subProductDataget === null) {
        return res.status(200).json({ status: 'error', mssg: 'Sub Product Not Found' });
      }

      if (subProductDataget.unit_type === "Pcs") {
        unit_type = "Pcs";
      }

      // First Delete Existing Cart Product
      let customercartdataget = await customercart.find({ customer_code: userCode, sub_product_code: sub_product_code });

      if (customercartdataget.length > 0) {        
        await customercart.findByIdAndUpdate(customercartdataget[0]._id, {
          unit_type: unit_type,
          quantity: quantity,
        })
      }
      else {
        await customercart
          .create({
            customer_code: userCode,
            sub_product_code: sub_product_code,
            unit_type: unit_type,
            quantity: quantity,
          });
      }

      return res.status(200).json({ status: 'success', mssg: 'Cart Updated' });

    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
    }
  }
});



// ===================================================
// ROUTER : 3 delete customer cart list view ( post method api :/front/cart/delete
// ===================================================

router.post('/delete', verifyUser, [
  body('sub_product_code')
    .notEmpty().withMessage('sub product code is empty!')
    .isMongoId().withMessage('Invalid sub product code value!'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorsArray = errors.array();
    return res.status(200).json({ status: 'error', field: errorsArray[0].param, mssg: errorsArray[0].msg });
  } else {
    try {
      const sub_product_code = req.body.sub_product_code;
      const customerCode = req.body.userCode;

      if (customerCode === "") {
        return res.status(200).json({ status: 'error', mssg: 'Customer Invalid' });
      }

      const carts = await customercart.find({ sub_product_code: sub_product_code, customer_code: customerCode }, {});

      if (carts.length === 0) {
        return res.status(200).json({ status: 'error', mssg: 'Cart not found' });
      } else {
        // Delete the found cart (assuming there's only one cart with the same sub_product_code and customer_code)
        const deletedCart = await customercart.deleteOne({ _id: carts[0]._id });
        if (deletedCart.deletedCount === 1) {
          return res.status(200).json({ status: 'success', mssg: 'Cart delete sucessfully' });
        } else {
          return res.status(200).json({ status: 'error', mssg: 'delete cart Failed' });
        }
      }
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
    }
  }
});

module.exports = router;