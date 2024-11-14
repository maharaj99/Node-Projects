const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const verifyUser = require('../middleware/customerverifyuser');
const product_order = require('../new_model/product_order');
const { body, validationResult } = require('express-validator');



router.get('/getpendingInvoice', verifyUser,

  async (req, res) => {
    try {
        let customerCode = req.body.userCode

        if (customerCode === "") {
          return res.status(200).json({ status: 'error', mssg: 'Customer Invalid' });
        }  
       
          const pendingInvoice = await product_order.find({customer_code:customerCode,due_amount: {$ne : 0} }, {__v:0,entry_user_code:0,entry_timestamp:0});

          // console.log('Pending Invoice:', pendingInvoice);

  
          if (pendingInvoice) {
            // Category details found, send a success response
            return res.status(200).json({ status: 'success', data: pendingInvoice });
          } else {
            // Category not found, send an error response
            return res.status(200).json({ status: 'error', mssg: 'pending in voice not found' });
          }
        
      } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
      }
  });


  module.exports=router