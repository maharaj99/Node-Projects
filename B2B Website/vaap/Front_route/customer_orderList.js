const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const verifyUser = require('../middleware/customerverifyuser');
const product_order = require('../new_model/product_order');
const { body, validationResult } = require('express-validator');
const { pipeline } = require('nodemailer/lib/xoauth2');




// ===================================================
// ROUTER : 2 get customer order list view ( post method api :/cutomer/productOrder/OrderList
// ===================================================
router.get('/OrderList', verifyUser, async (req, res) => {

  try {

    let customerCode = req.body.userCode

    if (customerCode === "") {
      return res.status(200).json({ status: 'error', mssg: 'Customer Invalid' });
    }

    const OrderProducts = await product_order.aggregate([

      {
        $lookup: {
          from: 'sub_product_master',
          localField: 'sub_product_code',
          foreignField: '_id',
          as: 'sub_product_master',
        //   pipeline: [
        //     {
        //       $lookup:
        //       {
        //         from: 'product_master',
        //         localField: 'product_code',
        //         foreignField: '_id',
        //         as: 'product'
        //       }
        //     },
        //   ]
        }
      },
      {
        $sort: { voucher_date: -1 } 
        // Sort by voucher_date in descending order
      },
      {
        $match: { customer_code: new mongoose.Types.ObjectId(customerCode) }
      },
      {
        $project: {
          "_id": 1,
          "voucher_number": 1,
          "voucher_date":1,
          "order_date":1,
          "quantity":1,
          "unit_type":1,
          "net_amount":1,
          "order_status":1,
          "sub_product_master._id": 1,
          "sub_product_master.sub_product_name": 1,
          "sub_product_master.sub_product_image": 1,
          "sub_product_master.selling_price": 1,
        },
      },

    ])
    if (OrderProducts.length === 0) {
      return res.status(200).json({ status: 'error', mssg: ' Products not found' });
    }

    return res.status(200).json({ status: 'success', mssg: 'all Order Products list fetched successfully', data: OrderProducts });

  }
  catch (error) {
    console.log(error);
    res.status(500).json({ status: 'server error', mssg: 'Internal Server Error' });
  }

});




//======================================
//Ger order shipment details
//======================================

router.post('/getOrderDetails', verifyUser, [

  body('order_code')
      .notEmpty().withMessage('Order Code Empty !')
      .isMongoId().withMessage('Order Code Is Invalid !'),

], async (req, res) => {

  try {
      const { order_code } = req.body;

      // Fetch Product Order List
      let productOrderList = await product_order.aggregate([

          {
              $lookup:
              {
                  from: "customer_master",
                  localField: "customer_code",
                  foreignField: "_id",
                  as: 'customer_master',
              }
          },
          {
              $lookup:
              {
                  from: "sub_product_master",
                  localField: "sub_product_code",
                  foreignField: "_id",
                  as: 'sub_product_master',
              }
          },
          {
              $lookup:
              {
                  from: "order_billing_address",
                  localField: "_id",
                  foreignField: "order_code",
                  as: 'order_billing_address',
              }
          },
          {
              $lookup:
              {
                  from: "order_shipment_address",
                  localField: "_id",
                  foreignField: "order_code",
                  as: 'order_shipment_address',
              }
          },
          {
            $lookup:
            {
                from: "order_shipment_details",
                localField: "_id",
                foreignField: "order_code",
                as: 'order_shipment_details',
            }
          },

          {
              $match: { "_id": new mongoose.Types.ObjectId(order_code) }
          },
          {
              $project: {
                  "_id": 1,
                  "voucher_number": 1,
                  "voucher_date": 1,
                  "voucher_type": 1,
                  "order_date": 1,
                  "customer_master._id":1,
                  "customer_master.customer_name": 1,
                  "customer_master.email": 1,
                  "customer_master.ph_num": 1,
                  "customer_master.user_name": 1,
                  "sub_product_master._id": 1,
                  "sub_product_master.sub_product_name": 1,
                  "sub_product_master.sub_product_image":1,
                  "quantity": 1,
                  "buying_price": 1,
                  "tax_type": 1,
                  "tax_amount": 1,
                  "total_tax_amount": 1,
                  "mrp": 1,
                  "discount_type": 1,
                  "discount": 1,
                  "selling_price": 1,
                  "total_price": 1,
                  "delivery_charges": 1,
                  "net_amount": 1,
                  "order_type": 1,
                  "delivery_option": 1,
                  "order_status": 1,
                  "note": 1,

                  "order_billing_address.ph_num": 1,
                  "order_billing_address.street": 1,
                  "order_billing_address.city": 1,
                  "order_billing_address.state": 1,
                  "order_billing_address.zip_code": 1,
                  "order_billing_address.country": 1,

                  "order_shipment_address.ph_num": 1,
                  "order_shipment_address.street": 1,
                  "order_shipment_address.city": 1,
                  "order_shipment_address.state": 1,
                  "order_shipment_address.zip_code": 1,
                  "order_shipment_address.country": 1,

                  "order_shipment_details.status":1,
                  "order_shipment_details.mssg":1,
                  "order_shipment_details.status_date":1


              }
          },

      ]);

      return res.status(200).json({
          status: 'success',
          mssg: "Fetched Successfully",
          data:productOrderList
      });

  } catch (error) {
      console.log(error);
      res.status(500).json({ status: 'error', mssg: 'Server Error' });
  }

})



module.exports = router;
