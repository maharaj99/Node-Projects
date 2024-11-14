// imports
const express = require('express');
const router = express.Router();

const { body, validationResult } = require('express-validator');
const verifyUser = require('../middleware/customerverifyuser');
const mongoose = require('mongoose');

const customercart = require("../model/CustomerCartSchema");
const voucherNumberConfig = require('../model/vocherNumberConfigSchema');
const customer_master = require('../model/customerMasterSchema');
const customer_billing_address = require('../model/customerBilllingAddressSchema');
const customer_shpping_address = require('../model/customerShippingAddressSchema');
const address_master = require('../model/addressMasterSchema');
const sub_product_master = require('../model/subProduct_Master');
const product_master = require('../model/product_master');
const category_master = require('../model/category_master');
const state_master = require('../model/stateMasterSchema');
const product_trans = require('../model/product_trans');
const product_order = require('../new_model/product_order');
const order_billing_address = require('../new_model/orderBillingAddress');
const order_shipment_address = require('../new_model/orderShippingAddress');

const sendMail = require('../middleware/email_sender');




// ===================================================
// ROUTER : 1 Get Customer Billing Address ( GET method api : /customer/checkout/getCustomerBillingAddress )
// ===================================================
router.get('/getCustomerBillingAddress', verifyUser, async (req, res) => {

  let customer_code = req.body.userCode

  if (customer_code === "") {
    return res.status(200).json({ status: 'error', mssg: 'Customer Invalid' });
  }

  try {

    let addressData = await customer_billing_address.findOne({ customer_code: customer_code })
      .select("street").select("city").select("state").select("ph_num").select("zip_Code").select("country");

    if (addressData) {
      return res.status(200).json({
        status: 'success',
        mssg: "Customer Billing Address Fetched Successfully",
        addressData: addressData,
      });
    }

    //if billing address not exist then send customer address
    let customerAddress = await customer_master.findOne({ _id: customer_code })
      .select("street_address_1").select("city").select("state").select("ph_num").select("zip_Code");

    if (customerAddress) {
      return res.status(200).json({
        status: 'success',
        mssg: "Fetched Successfully",
        addressData: {
          "street": customerAddress.street_address_1,
          "city": customerAddress.city,
          "state": customerAddress.state,
          "ph_num": customerAddress.ph_num,
          "zip_Code": customerAddress.zip_Code,
          "country": ""
        },
      });
    }

    return res.status(200).json({
      status: 'error',
      mssg: "Not A Valid Execution",
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 'error', mssg: 'Server Error' });
  }

})


// ===================================================
// ROUTER : 2 Get Customer Shipping Address ( GET method api : /customer/checkout/getCustomerShippingAddress )
// ===================================================
router.get('/getCustomerShippingAddress', verifyUser, async (req, res) => {

  let customer_code = req.body.userCode

  if (customer_code === "") {
    return res.status(200).json({ status: 'error', mssg: 'Customer Invalid' });
  }
  try {

    let addressData = await customer_shpping_address.findOne({ customer_code: customer_code })
      .select("street").select("city").select("state").select("ph_num").select("zip_Code").select("country");

    return res.status(200).json({
      status: 'success',
      mssg: "Fetched Successfully",
      addressData
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 'error', mssg: 'Server Error' });
  }

})


// ===================================================
// ROUTER : 3 Get Address Details By Zipcode ( GET method api : /customer/checkout/getAddressByZipcode )
// ===================================================
router.post('/getAddressByZipcode', verifyUser, [

  body("zipcode")
    .notEmpty()
    .withMessage("Zipcode is required"),

], async (req, res) => {

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const errorsArray = errors.array();
    return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
  }
  else {
    try {

      const {
        userCode,
        zipcode,
      } = req.body;

      let addressData = await address_master.findOne({ zipcode: zipcode, active: "Yes" })
        .select("state").select("city");

      if (!addressData) {
        return res.status(200).json({ status: 'error', mssg: 'zip code does not exist' });
      }

      return res.status(200).json({
        status: 'success',
        mssg: "Fetched Successfully",
        addressData
      });

    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }
  }

})


// ===================================================
// ROUTER : 4 Get Customer Bill Due List & Amount ( GET method api : /customer/checkout/getCustomerBillDueList )
// ===================================================
router.get('/getCustomerBillDueList', verifyUser, async (req, res) => {

  let customer_code = req.body.userCode

  if (customer_code === "") {
    return res.status(200).json({ status: 'error', mssg: 'Customer Invalid' });
  }

  try {


    let billDueList = await product_order.find({ customer_code: customer_code, due_amount: { $ne: 0 }, accept_order: "Yes" })
      .select("voucher_number").select("due_amount");

    return res.status(200).json({
      status: 'success',
      mssg: "Fetched Successfully",
      billDueList
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 'error', mssg: 'Server Error' });
  }

})


// ===================================================
// ROUTER : 5 Get Customer Cart Product Total ( GET method api : /customer/checkout/getCustomerProductTotal )
// ===================================================
router.post('/getCustomerProductTotal', verifyUser, async (req, res) => {

  let customer_code = req.body.userCode

  if (customer_code === "") {
    return res.status(200).json({ status: 'error', mssg: 'Customer Invalid' });
  }

  try {

    const {
      billing_state,
      shipping_state,
      delivery_option,
    } = req.body;

    const stateDetails = await state_master.findOne({ state: billing_state })
      .select("tax_percentage").select("flat_tax");

    const shippingStateDetails = await state_master.findOne({ state: shipping_state })
      .select("delivery_charges");

    let delivery_charges = shippingStateDetails != null ? shippingStateDetails.delivery_charges : 0;
    let tax_percentage = stateDetails != null ? stateDetails.tax_percentage : 0;
    let flat_tax = stateDetails != null ? stateDetails.flat_tax : 0;

    if (delivery_option != "Delivery") {
      delivery_charges = 0;
    }

    let cartdataget = await customercart.find({ customer_code: customer_code }).select("sub_product_code").select("unit_type").select("quantity");


    let main_total_tax_amount = 0;
    let main_total_price = 0;
    let main_total_delivery_charges = 0;

    for (let index = 0; index < cartdataget.length; index++) {

      const sub_product_code = cartdataget[index].sub_product_code;
      const unit_type = cartdataget[index].unit_type;
      const quantity = cartdataget[index].quantity;


      let subProductData = await sub_product_master.findOne({ _id: sub_product_code })
        .select("product_code").select("buying_price").select("unit_type").select("per_pcs_buying_price")
        .select("discount_type").select("discount").select("selling_price").select("per_pcs_selling_price");

      if (subProductData) {

        let discount_type = subProductData.discount_type;
        let discount = subProductData.discount;


        let buying_price = 0;

        if (subProductData.unit_type === "Pcs") {
          buying_price = subProductData.buying_price;
        }
        else {
          buying_price = unit_type === "Box" ? subProductData.buying_price : subProductData.per_pcs_buying_price;
        }

        let selling_price = 0;

        if (subProductData.unit_type === "Pcs") {
          selling_price = subProductData.selling_price;
        }
        else {
          selling_price = unit_type === "Box" ? subProductData.selling_price : subProductData.per_pcs_selling_price;
        }


        let getProdutDetails = await product_master.findOne({ _id: subProductData.product_code })
          .select("category_code");

        if (getProdutDetails) {

          let categoryData = await category_master.findOne({ _id: getProdutDetails.category_code })
            .select("tax_type");

          if (categoryData) {
            tax_type = categoryData.tax_type;
          }

        }

        var total_tax_amount = 0;
        if (tax_type === "Percentage") {
          total_tax_amount = (((Number(tax_percentage) * Number(buying_price)) / 100) * Number(quantity)).toFixed(2);
        }
        if (tax_type === "Flat") {
          total_tax_amount = (Number(flat_tax) * Number(quantity)).toFixed(2);
        }

        main_total_tax_amount += Number(total_tax_amount);

        let total_price = (Number(selling_price) * Number(quantity)).toFixed(2);

        main_total_price += Number(total_price);
        main_total_delivery_charges += Number(delivery_charges);

      }

    }

    return res.status(200).json({
      status: 'success',
      mssg: "Fetched Successfully",
      main_total_tax_amount: stateDetails != null ? main_total_tax_amount : "Please Select State for show the charges",
      main_total_price: main_total_price,
      main_total_delivery_charges: shipping_state != null ? main_total_delivery_charges : "Please Select Shipping State for show the Delivery charges",
      net_amount: (Number(main_total_tax_amount) + Number(main_total_price) + Number(main_total_delivery_charges)).toFixed(2),
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 'error', mssg: 'Server Error' });
  }

})


// ===================================================
// ROUTER : 6 Save Product Order ( GET method api : /customer/checkout/saveProductOrder )
// ===================================================
router.post('/saveProductOrder', verifyUser, [

  body('delivery_option')
    .notEmpty().withMessage('Delivery Option Empty !')
    .isIn(['Pick Up', 'Delivery']).withMessage('Delivery Option does contain invalid value'),

  // Order billing address

  body('order_billing_ph_num')
    .notEmpty().withMessage('Billing Address Phone Number Empty !')
    .isMobilePhone().withMessage('Enter A Valid Billing Address Phone Number !')
    .isLength({ min: 10, max: 10 }).withMessage('Enter A Valid Billing Address Phone Number !'),

  body('order_billing_street')
    .notEmpty().withMessage('Billing Address Street Address Empty !'),

  body('order_billing_city')
    .notEmpty().withMessage('Billing Address City Address Empty !'),

  body('order_billing_state')
    .notEmpty().withMessage('Billing Address State Address Empty !'),

  body('order_billing_zip_code')
    .notEmpty().withMessage('Billing Address Zipcode Address Empty !'),

  body('order_billing_country')
    .notEmpty().withMessage('Billing Address Country Address Empty !'),

  // Order shipping address 

  body('order_shipping_ph_num').if(body('delivery_option').equals('Delivery'))
    .notEmpty().withMessage('Shipping Address Phone Number Empty !')
    .isMobilePhone().withMessage('Enter A Valid Shipping Address Phone Number !')
    .isLength({ min: 10, max: 10 }).withMessage('Enter A Valid Shipping Address Phone Number !'),

  body('order_shipping_street').if(body('delivery_option').equals('Delivery'))
    .notEmpty().withMessage('Shipping Address Street Address Empty !'),

  body('order_shipping_city').if(body('delivery_option').equals('Delivery'))
    .notEmpty().withMessage('Shipping Address City Address Empty !'),

  body('order_shipping_state').if(body('delivery_option').equals('Delivery'))
    .notEmpty().withMessage('Shipping Address State Address Empty !'),

  body('order_shipping_zip_code').if(body('delivery_option').equals('Delivery'))
    .notEmpty().withMessage('Shipping Address Zipcode Address Empty !'),

  body('order_shipping_country').if(body('delivery_option').equals('Delivery'))
    .notEmpty().withMessage('Shipping Address Country Address Empty !'),

], async (req, res, next) => {

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const errorsArray = errors.array();
    return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
  }
  else {
    try {

      const {
        userCode,
        delivery_option,
        note,
        order_billing_ph_num,
        order_billing_street,
        order_billing_city,
        order_billing_state,
        order_billing_zip_code,
        order_billing_country,
        order_shipping_ph_num,
        order_shipping_street,
        order_shipping_city,
        order_shipping_state,
        order_shipping_zip_code,
        order_shipping_country,
      } = req.body;

      let billing_state = order_billing_state;

      let customer_code = req.body.userCode

      if (customer_code === "") {
        return res.status(200).json({ status: 'error', mssg: 'Customer Invalid' });
      }


      const customerDetailsDataget = await customer_master.findById({ _id: customer_code });
      if (customerDetailsDataget.status !==	 "Approved") {
        return res.status(200).json({ status: 'error', mssg: 'you have not the permissions to place orders' });

      }
      // Generate Voucher Number and save new current number
      let voucherNumberInfo = await voucherNumberConfig.findOne({ voucher_type: "Order Number" })
        .select('prefix_text').select('mid_character_length')
        .select('suffix_text').select('current_number').lean();

      let voucherNumber = '';

      if (voucherNumberInfo) {

        let prefix_text = voucherNumberInfo.prefix_text;
        let mid_character_length = voucherNumberInfo.mid_character_length;
        let suffix_text = voucherNumberInfo.suffix_text;
        let current_number = voucherNumberInfo.current_number.toString();

        const middileNumber = current_number.padStart(mid_character_length, "0");

        voucherNumber = prefix_text + middileNumber + suffix_text;

        current_number = (Number(current_number) + 1).toFixed(0);

        await voucherNumberConfig.findOneAndUpdate({ voucher_type: "Order Number" }, { current_number: current_number })
      }
      else {
        return res.status(200).json({ status: 'error', mssg: 'Voucher Number Not Found' });
      }

      if (voucherNumber === "") {
        return res.status(200).json({ status: 'error', mssg: 'Voucher Number Is Not Generating' });
      }

      // Update customer billing address
      await customer_billing_address.findOneAndDelete({ customer_code: customer_code })
      await customer_billing_address.create({
        customer_code: customer_code,
        street: order_billing_street,
        city: order_billing_city,
        state: order_billing_state,
        ph_num: order_billing_ph_num,
        zip_Code: order_billing_zip_code,
        country: order_billing_country,
        entry_user_code: userCode,
      })


      const stateDetails = await state_master.findOne({ state: billing_state })
        .select("tax_percentage").select("flat_tax");

      const shippingStateDetails = await state_master.findOne({ state: order_shipping_state })
        .select("delivery_charges");

      let delivery_charges = shippingStateDetails != null ? shippingStateDetails.delivery_charges : 0;
      let tax_percentage = stateDetails != null ? stateDetails.tax_percentage : 0;
      let flat_tax = stateDetails != null ? stateDetails.flat_tax : 0;


      if (delivery_option === "Delivery") {
        // Update customer shipping address
        await customer_shpping_address.findOneAndDelete({ customer_code: customer_code })
        await customer_shpping_address.create({
          customer_code: customer_code,
          street: order_shipping_street,
          city: order_shipping_city,
          state: order_shipping_state,
          ph_num: order_shipping_ph_num,
          zip_Code: order_shipping_zip_code,
          country: order_shipping_country,
          entry_user_code: userCode,
        });
      }
      else {
        delivery_charges = 0;
      }



      let cartdataget = await customercart.find({ customer_code: customer_code }).select("sub_product_code").select("unit_type").select("quantity");

      if (cartdataget.length === 0) {
        return res.status(200).json({ status: 'error', mssg: 'Please Add At Least One Product To Cart' });
      }

      var orderDone = "No";

      for (let index = 0; index < cartdataget.length; index++) {

        const sub_product_code = cartdataget[index].sub_product_code;
        const unit_type = cartdataget[index].unit_type;
        const quantity = cartdataget[index].quantity;


        let subProductData = await sub_product_master.findOne({ _id: sub_product_code })
          .select("product_code").select("unit").select("unit_type").select("per_box_pcs").select("buying_price").select("per_pcs_buying_price").select("mrp")
          .select("discount_type").select("discount").select("selling_price").select("per_pcs_selling_price");


        // Product Stock Fetch
        const subProductStock = await product_trans.aggregate([
          {
            "$match": {
              sub_product_code: new mongoose.Types.ObjectId(sub_product_code),
            }
          },
          {
            "$group": {
              "_id": null,
              "total_stock": { "$sum": { $subtract: ["$in_quantity", "$out_quantity"] } },
            }
          }
        ]);

        let productStock = 0;
        let accept_order = 'Yes';

        if (subProductStock.length > 0) {
          productStock = subProductStock[0].total_stock;
        }

        if (subProductData) {

          var total_pcs = quantity;
          if (unit_type === "Box") {
            total_pcs = (Number(subProductData.per_box_pcs) * Number(quantity)).toFixed(2);
          }

          if (total_pcs > productStock) {
            accept_order = 'No';
          }

          let product_code = subProductData.product_code;
          let unit = subProductData.unit;
          let buying_price = 0;

          if (subProductData.unit_type === "Pcs") {
            buying_price = subProductData.buying_price;
          }
          else {
            buying_price = unit_type === "Box" ? subProductData.buying_price : subProductData.per_pcs_buying_price;
          }

          let mrp = subProductData.mrp;
          let discount_type = subProductData.discount_type;
          let discount = subProductData.discount;

          let selling_price = 0;

          if (subProductData.unit_type === "Pcs") {
            selling_price = subProductData.selling_price;
          }
          else {
            selling_price = unit_type === "Box" ? subProductData.selling_price : subProductData.per_pcs_selling_price;
          }

          let getProdutDetails = await product_master.findOne({ _id: subProductData.product_code })
            .select("category_code");

          if (getProdutDetails) {

            let categoryData = await category_master.findOne({ _id: getProdutDetails.category_code })
              .select("tax_type");

            if (categoryData) {
              tax_type = categoryData.tax_type;
            }

          }

          var total_tax_amount = 0;
          var tax_amount = 0;

          if (tax_type === "Percentage") {
            tax_amount = tax_percentage;
            total_tax_amount = (((Number(tax_percentage) * Number(buying_price)) / 100) * Number(quantity)).toFixed(2);
          }
          if (tax_type === "Flat") {
            tax_amount = flat_tax;
            total_tax_amount = (Number(flat_tax) * Number(quantity)).toFixed(2);
          }

          let total_price = (Number(selling_price) * Number(quantity)).toFixed(2);

          let net_amount = (Number(total_price) + Number(total_tax_amount) + Number(delivery_charges)).toFixed(2);

          let order_code = "";

          // Insert in product order
          await product_order.create({
            voucher_number: voucherNumber,
            voucher_type: "Order Number",
            customer_code: customer_code,
            sub_product_code: sub_product_code,
            product_code: product_code,
            unit_type: unit_type,
            quantity: quantity,
            total_pcs: total_pcs,
            buying_price: buying_price,
            tax_type: tax_type,
            tax_amount: tax_amount,
            total_tax_amount: total_tax_amount,
            mrp: mrp,
            discount_type: discount_type,
            discount: discount,
            selling_price: selling_price,
            total_price: total_price,
            delivery_charges: delivery_charges,
            net_amount: net_amount,
            due_amount: net_amount,
            order_type: "Order",
            delivery_option: delivery_option,
            note: note,
            accept_order: accept_order,
            entry_user_code: userCode,

          })
            .then(data => {
              order_code = data._id;
            })
            .catch(err => {
              console.log(err)
            })


          if (order_code != "") {


            if (accept_order === "Yes") {

              // Insert in product trans
              await product_trans.create({
                voucher_code: order_code,
                voucher_num: voucherNumber,
                voucher_type: "Order Number",
                voucher_date: Date.now(),
                sub_product_code: sub_product_code,
                out_quantity: total_pcs,
                rate: selling_price,
                amount: total_price,
                stock_type: "Out",
                entry_user_code: userCode,

              })
                .then(data => {
                })
                .catch(err => {
                  console.log(err)
                  // return res.status(500).json({ status: 'error', mssg: err.message });
                })
            }

            // Insert in order billing address
            await order_billing_address.create({
              order_code: order_code,
              ph_num: order_billing_ph_num,
              street: order_billing_street,
              city: order_billing_city,
              state: order_billing_state,
              zip_code: order_billing_zip_code,
              country: order_billing_country,
              entry_user_code: userCode,

            })
              .then(data => {
              })
              .catch(err => {
                console.log(err)
                // return res.status(500).json({ status: 'error', mssg: err.message });
              })

            // Insert in order shipping address
            if (delivery_option === "Delivery") {
              await order_shipment_address.create({
                order_code: order_code,
                ph_num: order_shipping_ph_num,
                street: order_shipping_street,
                city: order_shipping_city,
                state: order_shipping_state,
                zip_code: order_shipping_zip_code,
                country: order_shipping_country,
                entry_user_code: userCode,

              })
                .then(data => {
                  
                })
                .catch(err => {
                  console.log(err)
                  // return res.status(500).json({ status: 'error', mssg: err.message });
                })
            }
          }

          await customercart.deleteOne({ customer_code: customer_code, sub_product_code: sub_product_code });

          orderDone = "Yes";

        }

      }

      if (orderDone === "Yes") {
        if(accept_order==="Yes"){
          next();
        }
        return res.status(200).json({ status: 'success', mssg: 'Order Submission Request Saved Successfully.' });
      }
      else {
        return res.status(200).json({ status: 'error', mssg: 'Order Submission Request Falied. Try After Some Time Or Contact to Admin' });
      }

    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }
  }

}, sendMail.OrderConfirmationSendMail)

module.exports = router;