// imports
const express = require('express');
const router = express.Router();
const customerWishlist = require("../model/CustomerWishlistSchema");

const { body, validationResult } = require('express-validator');
const verifyUser = require('../middleware/customerverifyuser');
const mongoose = require('mongoose');




router.get('/customerWishListget', verifyUser, async (req, res) => {

  try {

    let customerCode = req.body.userCode

    if (customerCode === "") {
      return res.status(200).json({ status: 'error', mssg: 'Customer Invalid' });
    }

    const WishProducts = await customerWishlist.aggregate([

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
          "sub_product_master._id": 1,
          "sub_product_master.sub_product_name": 1,
          "sub_product_master.sub_product_image": 1,
          "sub_product_master.unit": 1,
          "sub_product_master.unit_type": 1,
          "sub_product_master.per_box_pcs": 1,
          "sub_product_master.mrp": 1,
          " sub_product_master.selling_price": 1,
          "sub_product_master.product._id": 1,
          "sub_product_master.product.product_name": 1,
          "sub_product_master.product.product_link": 1,

        },
      },

    ])
    if (WishProducts.length === 0) {
      return res.status(200).json({ status: 'error', mssg: ' wish Products not found' });
    }

    return res.status(200).json({ status: 'success', mssg: 'all wish list added Products fetched successfully', data: WishProducts });

  }
  catch (error) {
    console.log(error);
    res.status(500).json({ status: 'server error', mssg: 'Internal Server Error' });
  }

});



// ===================================================
// ROUTER : 1 delete customer cart list view ( post method api :/front/wish/delete
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

      const wishes = await customerWishlist.find({ sub_product_code: sub_product_code, customer_code: customerCode }, {});

      if (wishes.length === 0) {
        return res.status(200).json({ status: 'error', mssg: 'Wish not found' });
      } else {
        // Delete the found wish (assuming there's only one wish with the same sub_product_code and customer_code)
        const deletedWish = await customerWishlist.deleteOne({ _id: wishes[0]._id });
        if (deletedWish.deletedCount === 1) {
          return res.status(200).json({ status: 'success', mssg: 'Wish deleted' });
        } else {
          return res.status(200).json({ status: 'error', mssg: 'Failed to delete wish' });
        }
      }
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
    }
  }
});


module.exports = router;