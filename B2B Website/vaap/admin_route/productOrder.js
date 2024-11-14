const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const verifyUser = require('../middleware/adminverifyuser');
const voucherNumberConfig = require('../model/vocherNumberConfigSchema');
const customer_master = require('../model/customerMasterSchema');
const customer_billing_address = require('../model/customerBilllingAddressSchema');
const customer_shpping_address = require('../model/customerShippingAddressSchema');
const address_master = require('../model/addressMasterSchema');
const sub_product_master = require('../model/subProduct_Master');
const product_trans = require('../model/product_trans');
const product_master = require('../model/product_master');
const category_master = require('../model/category_master');
const state_master = require('../model/stateMasterSchema');
const product_order = require('../new_model/product_order');
const order_billing_address = require('../new_model/orderBillingAddress');
const order_shipment_address = require('../new_model/orderShippingAddress');

const sendMail = require('../middleware/email_sender');

const { body, validationResult } = require('express-validator');


// ===================================================
// ROUTER : 1 Get Product Order Voucher Number ( GET method api : /admin/productOrder/getVoucherNumber )
// ===================================================
router.get('/getVoucherNumber', verifyUser, async (req, res) => {
    try {
        // Get Order Voucher Number Details
        let voucherNumberInfo = await voucherNumberConfig.findOne({ voucher_type: "Order Number" })
            .select('prefix_text').select('mid_character_length')
            .select('suffix_text').select('current_number').lean().sort({ "entry_timestamp": -1 });

        if (voucherNumberInfo) {

            let prefix_text = voucherNumberInfo.prefix_text;
            let mid_character_length = voucherNumberInfo.mid_character_length;
            let suffix_text = voucherNumberInfo.suffix_text;
            let current_number = voucherNumberInfo.current_number.toString();

            const middileNumber = current_number.padStart(mid_character_length, "0");

            const voucherNumber = prefix_text + middileNumber + suffix_text;

            return res.status(200).json({ status: 'success', mssg: 'Fetched Successfully', voucherNumber });
        }
        else {
            return res.status(200).json({ status: 'error', mssg: 'Voucher Number Not Found' });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }
})

// ===================================================
// ROUTER : 2 Get Customer List ( GET method api : /admin/productOrder/getCustomerList )
// ===================================================
router.get('/getCustomerList', verifyUser, async (req, res) => {
    try {
        // Get Customer List
        let customerList = await customer_master.find({ active: "Yes" }, { _id: 1, customer_name: 1, email: 1, user_name: 1 }).sort({ "entry_timestamp": -1 });

        return res.status(200).json({ status: 'success', mssg: 'Fetched Successfully', customerList });


    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }
})


// ===================================================
// ROUTER : 3 Get Customer Billing Address ( GET method api : /admin/productOrder/getCustomerBillingAddress )
// ===================================================
router.post('/getCustomerBillingAddress', verifyUser, [

    body('customer_code')
        .notEmpty().withMessage('Customer Empty !')
        .isMongoId().withMessage('Customer Is Invalid !'),

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
                customer_code,
            } = req.body;

            let addressData = await customer_billing_address.findOne({ customer_code: customer_code })
                .select("street").select("city").select("state").select("ph_num").select("zip_Code").select("country").sort({ "entry_timestamp": -1 });

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
// ROUTER : 4 Get Customer Shipping Address ( GET method api : /admin/productOrder/getCustomerShippingAddress )
// ===================================================
router.post('/getCustomerShippingAddress', verifyUser, [

    body('customer_code')
        .notEmpty().withMessage('Customer Empty !')
        .isMongoId().withMessage('Customer Is Invalid !'),

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
                customer_code,
            } = req.body;

            let addressData = await customer_shpping_address.findOne({ customer_code: customer_code })
                .select("street").select("city").select("state").select("ph_num").select("zip_Code").select("country").sort({ "entry_timestamp": -1 });

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
// ROUTER : 5 Get Address Details By Zipcode ( GET method api : /admin/productOrder/getAddressByZipcode )
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
                .select("state").select("city").sort({ "entry_timestamp": -1 });

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
// ROUTER : [eta vul etar thik ta 15 num] 6 Get Customer Bill Due Amount ( GET method api : /admin/productOrder/getCustomerBillDueAmount )
// ===================================================
// router.post('/getCustomerBillDueAmount', verifyUser, [

//     body('customer_code')
//         .notEmpty().withMessage('Customer Empty !')
//         .isMongoId().withMessage('Customer Is Invalid !'),

// ], async (req, res) => {

//     const errors = validationResult(req)
//     if (!errors.isEmpty()) {
//         const errorsArray = errors.array();
//         return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
//     }
//     else {
//         try {

//             const {
//                 userCode,
//                 customer_code,
//             } = req.body;

//             let dataget = await product_order.find({ customer_code: customer_code }, { demo: { $sum: "$due_amount" } })

//             return res.status(200).json({
//                 status: 'success',
//                 mssg: "Fetched Successfully",
//                 dataget
//             });

//         } catch (error) {
//             console.log(error);
//             res.status(500).json({ status: 'error', mssg: 'Server Error' });
//         }
//     }

// })

// ===================================================
// ROUTER : 7 Get Sub Product List ( GET method api : /admin/productOrder/getSubProductList )
// ===================================================
router.get('/getSubProductList', verifyUser, async (req, res) => {

    try {

        let subProductList = await sub_product_master.find({ active: "Yes" }, { _id: 1, sub_product_name: 1, }).sort({ sub_product_name: 1 });

        return res.status(200).json({
            status: 'success',
            mssg: "Fetched Successfully",
            subProductList
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }

})


// ===================================================
// ROUTER : 8 Get Sub Product Details ( GET method api : /admin/productOrder/getSubProductDetails )
// ===================================================
router.post('/getSubProductDetails', verifyUser, [

    body('sub_product_code')
        .notEmpty().withMessage('Sub Product Empty !')
        .isMongoId().withMessage('Sub Product Is Invalid !'),

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
                sub_product_code,
            } = req.body;

            let unit, unit_type,
                per_box_pcs, buying_price,
                per_pcs_buying_price, mrp,
                discount_type, discount, selling_price, tax_type, per_pcs_selling_price = "";

            let subProductData = await sub_product_master.findOne({ _id: sub_product_code })
                .select("product_code").select("unit")
                .select("unit_type").select("per_box_pcs")
                .select("buying_price").select("per_pcs_buying_price")
                .select("mrp").select("discount_type")
                .select("discount").select("selling_price").select("per_pcs_selling_price").sort({ "entry_timestamp": -1 });

            if (subProductData) {

                unit = subProductData.unit;
                unit_type = subProductData.unit_type;
                per_box_pcs = subProductData.per_box_pcs;
                buying_price = subProductData.buying_price;
                per_pcs_buying_price = subProductData.per_pcs_buying_price;
                mrp = subProductData.mrp;
                discount_type = subProductData.discount_type;
                discount = subProductData.discount;
                selling_price = subProductData.selling_price;
                per_pcs_selling_price = subProductData.per_pcs_selling_price;

                let getProdutDetails = await product_master.findOne({ _id: subProductData.product_code })
                    .select("category_code");

                if (getProdutDetails) {

                    let categoryData = await category_master.findOne({ _id: getProdutDetails.category_code })
                        .select("tax_type");

                    if (categoryData) {
                        tax_type = categoryData.tax_type;
                    }

                }

            }

            const data = {
                unit: unit,
                unit_type: unit_type,
                per_box_pcs: per_box_pcs,
                buying_price: buying_price,
                per_pcs_buying_price: per_pcs_buying_price,
                mrp: mrp,
                discount_type: discount_type,
                discount: discount,
                selling_price: selling_price,
                per_pcs_selling_price: per_pcs_selling_price,
                tax_type: tax_type,
            }

            return res.status(200).json({
                status: 'success',
                mssg: "Fetched Successfully",
                data
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 'error', mssg: 'Server Error' });
        }
    }

})


// ===================================================
// ROUTER : 9 Get State Details ( GET method api : /admin/productOrder/getStateDetails )
// ===================================================
router.post('/getStateDetails', verifyUser, async (req, res) => {

    try {

        const {
            userCode,
            billing_state,
            shipping_state,
            delivery_option,
        } = req.body;

        let tax_percentage = 0;
        let flat_tax = 0;
        let delivery_charges = 0;

        let stateDetails = await state_master.findOne({ state: billing_state })
            .select("tax_percentage").select("flat_tax").sort({ "entry_timestamp": -1 });

        if (stateDetails) {
            tax_percentage = stateDetails.tax_percentage;
            flat_tax = stateDetails.flat_tax;
        }

        let shippingStateDetails = await state_master.findOne({ state: shipping_state })
            .select("delivery_charges");

        if (shippingStateDetails) {
            delivery_charges = shippingStateDetails.delivery_charges
        }

        if (delivery_option != "Delivery") {
            delivery_charges = 0;
        }

        return res.status(200).json({
            status: 'success',
            mssg: "Fetched Successfully",
            tax_percentage,
            flat_tax,
            delivery_charges
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }


})


// ===================================================
// ROUTER : 10 Save Product Order ( GET method api : /admin/productOrder/saveProductOrder )
// ===================================================
router.post('/saveProductOrder', verifyUser, [

    body('voucher_date')
        .notEmpty().withMessage('Voucher Date Empty !'),

    body('order_date')
        .notEmpty().withMessage('Order Date Empty !'),

    body('customer_code')
        .notEmpty().withMessage('Customer Empty !')
        .isMongoId().withMessage('Customer Is Invalid !'),

    body('sub_product_code')
        .notEmpty().withMessage('Sub Product Empty !')
        .isMongoId().withMessage('Sub Product Is Invalid !'),

    body('unit_type')
        .notEmpty().withMessage('Unit Type Empty !')
        .isIn(['Box', 'Pcs']).withMessage('Unit Type does contain invalid value'),

    body('quantity')
        .notEmpty().withMessage('Quantity Empty !')
        .isNumeric().withMessage('Quantity Is Only Number Field !'),

    body('selling_price')
        .notEmpty().withMessage('Selling Price Empty !')
        .isNumeric().withMessage('Selling Price Is Only Number Field !'),

    body('buying_price')
        .notEmpty().withMessage('Buying Price Empty !')
        .isNumeric().withMessage('Buying Price Is Only Number Field !'),

    body('tax_type')
        .notEmpty().withMessage('Tax Type Empty !')
        .isIn(['Percentage', 'Flat', 'null']).withMessage('Tax Type does contain invalid value'),

    body('tax_amount')
        .notEmpty().withMessage('Tax Amount Empty !')
        .isNumeric().withMessage('Tax Amount Is Only Number Field !'),

    body('mrp')
        .notEmpty().withMessage('MRP Empty !')
        .isNumeric().withMessage('MRP Is Only Number Field !'),

    body('discount_type')
        .notEmpty().withMessage('Discount Type Empty !')
        .isIn(['Percentage', 'Flat', 'Null']).withMessage('Discount Type does contain invalid value'),

    body('discount')
        .notEmpty().withMessage('Discount Empty !')
        .isNumeric().withMessage('Discount Is Only Number Field !'),

    body('delivery_charges')
        .notEmpty().withMessage('Delivery Charges Empty !')
        .isNumeric().withMessage('Delivery Charges Is Only Number Field !'),

    body('order_type')
        .notEmpty().withMessage('Order Type Empty !')
        .isIn(['Sample Order', 'Order']).withMessage('Order Type does contain invalid value'),

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

    body('accept_order')
        .notEmpty().withMessage('Accept Order Type Empty !')
        .isIn(['Yes', 'No']).withMessage('Accept Order does contain invalid value'),

], async (req, res, next) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const errorsArray = errors.array();
        return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    }
    else {
        try {

            let {
                userCode,
                voucher_date,
                order_date,
                customer_code,
                sub_product_code,
                unit_type,
                selling_price,
                quantity,
                buying_price,
                tax_type,
                tax_amount,
                mrp,
                discount_type,
                discount,
                delivery_charges,
                order_type,
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
                accept_order,
                loginEntryPermision,
            } = req.body;

            //check the login user have entry permission
            if (loginEntryPermision !== "Yes") {
                return res.status(200).json({ status: 'error', mssg: 'User does not have permission to create ' });
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
                })
            }
            else {
                delivery_charges = 0;
            }

            // Here calculation part
            var total_tax_amount = 0;
            if (tax_type === "Percentage") {
                total_tax_amount = (((Number(tax_amount) * Number(buying_price)) / 100) * Number(quantity)).toFixed(2);
            }
            if (tax_type === "Flat") {
                total_tax_amount = (Number(tax_amount) * Number(quantity)).toFixed(2);
            }

            // var selling_price = 0;
            // if (discount_type === "Percentage") {
            //     selling_price = (Number(mrp) - ((Number(discount) * Number(mrp)) / 100)).toFixed(2);
            // }
            // if (discount_type === "Flat") {
            //     selling_price = (Number(mrp) * Number(discount)).toFixed(2);
            // }
            // if (discount_type === "Null") {
            //     selling_price = mrp;
            // }

            let total_price = (Number(selling_price) * Number(quantity)).toFixed(2);

            let net_amount = (Number(total_price) + Number(total_tax_amount) + Number(delivery_charges)).toFixed(2);

            // Sub product details dataget
            let subProductDetails = await sub_product_master.findById(sub_product_code).select("product_code").select("per_box_pcs");

            if (subProductDetails === null) {
                return res.status(200).json({ status: 'error', mssg: 'Sub Product Details Not Found' });
            }

            var total_pcs = quantity;
            if (unit_type === "Box") {
                total_pcs = (Number(subProductDetails.per_box_pcs) * Number(quantity)).toFixed(2);
            }

            let order_code = "";

            // Insert in product order
            await product_order.create({
                voucher_number: voucherNumber,
                voucher_date: voucher_date,
                voucher_type: "Order Number",
                order_date: order_date,
                customer_code: customer_code,
                sub_product_code: sub_product_code,
                product_code: subProductDetails.product_code,
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
                order_type: order_type,
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
                    // return res.status(500).json({ status: 'error', mssg: err.message });
                })

            if (order_code != "") {

                if (accept_order === "Yes") {

                    // Insert in product trans
                    await product_trans.create({
                        voucher_code: order_code,
                        voucher_num: voucherNumber,
                        voucher_type: "Order Number",
                        voucher_date: voucher_date,
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

                if (accept_order === "Yes") {
                    next();
                }
            }

            return res.status(200).json({ status: 'success', mssg: "Product Order Saved Successfully" });

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 'error', mssg: 'Server Error' });
        }
    }

}, sendMail.OrderConfirmationSendMail)


// ===================================================
// ROUTER : 11 Get Product Order List ( GET method api : /admin/productOrder/getOrderList )
// ===================================================
router.get('/getOrderList', verifyUser, async (req, res) => {

    try {

        const { loginViewPermision } = req.body;
        //check the login user have entry permission
        if (loginViewPermision !== "Yes") {
            return res.status(200).json({
                status: "error",
                mssg: "User does not have permission to View any data",
            });
        }

        // Fetch Product Order List
        let productOrderList = await product_order.aggregate([

            {
                $lookup:
                {
                    from: "customer_master",
                    localField: "customer_code",
                    foreignField: "_id",
                    as: 'customer_master'
                }
            },
            {
                $lookup:
                {
                    from: "sub_product_master",
                    localField: "sub_product_code",
                    foreignField: "_id",
                    as: 'sub_product_master'
                }
            },
            {
                $lookup:
                {
                    from: "order_billing_address",
                    localField: "_id",
                    foreignField: "order_code",
                    as: 'order_billing_address'
                }
            },
            {
                $lookup:
                {
                    from: "order_shipment_address",
                    localField: "_id",
                    foreignField: "order_code",
                    as: 'order_shipment_address'
                }
            },

            { $sort: { entry_timestamp: -1 } },

            {
                $project: {
                    "_id": 1,
                    "voucher_number": 1,
                    "voucher_date": 1,
                    "voucher_type": 1,
                    "order_date": 1,
                    "customer_code": 1,
                    "customer_master._id": 1,
                    "customer_master.customer_name": 1,
                    "customer_master.email": 1,
                    "customer_master.ph_num": 1,
                    "customer_master.user_name": 1,
                    "sub_product_code": 1,
                    "sub_product_master._id": 1,
                    "sub_product_master.sub_product_name": 1,
                    "sub_product_master.unit": 1,
                    "sub_product_master.unit_type": 1,
                    "sub_product_master.per_box_pcs": 1,
                    "sub_product_master.buying_price": 1,
                    "sub_product_master.per_pcs_buying_price": 1,
                    "sub_product_master.mrp": 1,
                    "sub_product_master.discount_type": 1,
                    "sub_product_master.discount": 1,
                    "sub_product_master.selling_price": 1,
                    "sub_product_master.per_pcs_selling_price": 1,
                    "unit_type": 1,
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
                    "accept_order": 1,

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

                }
            },

        ]);

        return res.status(200).json({
            status: 'success',
            mssg: "Fetched Successfully",
            productOrderList
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }

})


// ===================================================
// ROUTER : 12 Get Product Order Details ( GET method api : /admin/productOrder/getOrderDetails )
// ===================================================
router.post('/getOrderDetails', verifyUser, [

    body('order_code')
        .notEmpty().withMessage('Order Code Empty !')
        .isMongoId().withMessage('Order Code Is Invalid !'),

], async (req, res) => {

    try {

        const { loginViewPermision, order_code } = req.body;
        //check the login user have entry permission
        if (loginViewPermision !== "Yes") {
            return res.status(200).json({
                status: "error",
                mssg: "User does not have permission to View any data",
            });
        }

        // Fetch Product Order List
        let productOrderList = await product_order.aggregate([

            {
                $lookup:
                {
                    from: "customer_master",
                    localField: "customer_code",
                    foreignField: "_id",
                    as: 'customer_master'
                }
            },
            {
                $lookup:
                {
                    from: "sub_product_master",
                    localField: "sub_product_code",
                    foreignField: "_id",
                    as: 'sub_product_master'
                }
            },
            {
                $lookup:
                {
                    from: "order_billing_address",
                    localField: "_id",
                    foreignField: "order_code",
                    as: 'order_billing_address'
                }
            },
            {
                $lookup:
                {
                    from: "order_shipment_address",
                    localField: "_id",
                    foreignField: "order_code",
                    as: 'order_shipment_address'
                }
            },

            {
                $match: { "_id": new mongoose.Types.ObjectId(order_code) }
            },

            { $sort: { entry_timestamp: -1 } },

            {
                $project: {
                    "_id": 1,
                    "voucher_number": 1,
                    "voucher_date": 1,
                    "voucher_type": 1,
                    "order_date": 1,
                    "customer_code": 1,
                    "customer_master.customer_name": 1,
                    "customer_master.email": 1,
                    "customer_master.ph_num": 1,
                    "customer_master.user_name": 1,
                    "sub_product_code": 1,
                    "sub_product_master.sub_product_name": 1,
                    "sub_product_master.unit": 1,
                    "sub_product_master.unit_type": 1,
                    "sub_product_master.per_box_pcs": 1,
                    "sub_product_master.buying_price": 1,
                    "sub_product_master.per_pcs_buying_price": 1,
                    "sub_product_master.mrp": 1,
                    "sub_product_master.discount_type": 1,
                    "sub_product_master.discount": 1,
                    "sub_product_master.selling_price": 1,
                    "sub_product_master.per_pcs_selling_price": 1,
                    "unit_type": 1,
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
                    "accept_order": 1,

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

                }
            },

        ]);

        return res.status(200).json({
            status: 'success',
            mssg: "Fetched Successfully",
            productOrderList
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }

})


// ===================================================
// ROUTER : 13 Update Product Order ( GET method api : /admin/productOrder/updateProductOrder )
// ===================================================
router.post('/updateProductOrder', verifyUser, [

    body('order_code')
        .notEmpty().withMessage('Order Code Empty !')
        .isMongoId().withMessage('Order Code Is Invalid !'),

    body('voucher_number')
        .notEmpty().withMessage('Voucher Number Empty !'),

    body('voucher_date')
        .notEmpty().withMessage('Voucher Date Empty !'),

    body('order_date')
        .notEmpty().withMessage('Order Date Empty !'),

    body('customer_code')
        .notEmpty().withMessage('Customer Empty !')
        .isMongoId().withMessage('Customer Is Invalid !'),

    body('sub_product_code')
        .notEmpty().withMessage('Sub Product Empty !')
        .isMongoId().withMessage('Sub Product Is Invalid !'),

    body('unit_type')
        .notEmpty().withMessage('Unit Type Empty !')
        .isIn(['Box', 'Pcs']).withMessage('Unit Type does contain invalid value'),

    body('quantity')
        .notEmpty().withMessage('Quantity Empty !')
        .isNumeric().withMessage('Quantity Is Only Number Field !'),

    body('selling_price')
        .notEmpty().withMessage('Selling Price Empty !')
        .isNumeric().withMessage('Selling Price Is Only Number Field !'),

    body('buying_price')
        .notEmpty().withMessage('Buying Price Empty !')
        .isNumeric().withMessage('Buying Price Is Only Number Field !'),

    body('tax_type')
        .notEmpty().withMessage('Tax Type Empty !')
        .isIn(['Percentage', 'Flat', 'null']).withMessage('Tax Type does contain invalid value'),

    body('tax_amount')
        .notEmpty().withMessage('Tax Amount Empty !')
        .isNumeric().withMessage('Tax Amount Is Only Number Field !'),

    body('mrp')
        .notEmpty().withMessage('MRP Empty !')
        .isNumeric().withMessage('MRP Is Only Number Field !'),

    body('discount_type')
        .notEmpty().withMessage('Discount Type Empty !')
        .isIn(['Percentage', 'Flat', 'Null']).withMessage('Discount Type does contain invalid value'),

    body('discount')
        .notEmpty().withMessage('Discount Empty !')
        .isNumeric().withMessage('Discount Is Only Number Field !'),

    body('delivery_charges')
        .notEmpty().withMessage('Delivery Charges Empty !')
        .isNumeric().withMessage('Delivery Charges Is Only Number Field !'),

    body('order_type')
        .notEmpty().withMessage('Order Type Empty !')
        .isIn(['Sample Order', 'Order']).withMessage('Order Type does contain invalid value'),

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

    body('accept_order')
        .notEmpty().withMessage('Accept Order Type Empty !')
        .isIn(['Yes', 'No']).withMessage('Accept Order does contain invalid value'),

], async (req, res, next) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const errorsArray = errors.array();
        return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    }
    else {
        try {

            let {
                userCode,
                order_code,
                voucher_number,
                voucher_date,
                order_date,
                customer_code,
                sub_product_code,
                unit_type,
                selling_price,
                quantity,
                buying_price,
                tax_type,
                tax_amount,
                mrp,
                discount_type,
                discount,
                delivery_charges,
                order_type,
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
                accept_order,
                loginEditPermision,
            } = req.body;

            //check the login user have View permission
            if (loginEditPermision !== "Yes") {
                return res.status(200).json({ status: 'error', mssg: 'User does not have permission to Edit' });
            }

            let productOrderDetails = await product_order.findById(order_code).select("order_status").select("accept_order").select("paid_amount");

            if (productOrderDetails === null) {
                return res.status(200).json({ status: 'error', mssg: 'Product Order Details not Found' });
            }

            let order_status = productOrderDetails.order_status;
            let previous_accept_order = productOrderDetails.accept_order;
            let paid_amount = productOrderDetails.paid_amount;

            let voucherNumber = voucher_number;

            if (voucherNumber === "") {
                return res.status(200).json({ status: 'error', mssg: 'Voucher Number Is Not Generating' });
            }

            // Update customer billing address
            await customer_billing_address.findOneAndUpdate({ customer_code: customer_code }, {
                street: order_billing_street,
                city: order_billing_city,
                state: order_billing_state,
                ph_num: order_billing_ph_num,
                zip_Code: order_billing_zip_code,
                country: order_billing_country,
                entry_user_code: userCode,
            })

            if (delivery_option === "Delivery") {
                // Update customer shipping address
                await customer_shpping_address.findOneAndUpdate({ customer_code: customer_code }, {
                    street: order_shipping_street,
                    city: order_shipping_city,
                    state: order_shipping_state,
                    ph_num: order_shipping_ph_num,
                    zip_Code: order_shipping_zip_code,
                    country: order_shipping_country,
                    entry_user_code: userCode,

                })
            }
            else {
                delivery_charges = 0;
            }

            // Here calculation part
            var total_tax_amount = 0;
            if (tax_type === "Percentage") {
                total_tax_amount = (((Number(tax_amount) * Number(buying_price)) / 100) * Number(quantity)).toFixed(2);
            }
            if (tax_type === "Flat") {
                total_tax_amount = (Number(tax_amount) * Number(quantity)).toFixed(2);
            }

            // var selling_price = 0;
            // if (discount_type === "Percentage") {
            //     selling_price = (Number(mrp) - ((Number(discount) * Number(mrp)) / 100)).toFixed(2);
            // }
            // if (discount_type === "Flat") {
            //     selling_price = (Number(mrp) * Number(discount)).toFixed(2);
            // }
            // if (discount_type === "Null") {
            //     selling_price = mrp;
            // }

            let total_price = (Number(selling_price) * Number(quantity)).toFixed(2);

            let net_amount = (Number(total_price) + Number(total_tax_amount) + Number(delivery_charges)).toFixed(2);

            var due_amount = (Number(net_amount) - Number(paid_amount)).toFixed(2);
            due_amount = due_amount < 0 ? 0 : due_amount;

            // Sub product details dataget
            let subProductDetails = await sub_product_master.findById(sub_product_code).select("product_code").select("per_box_pcs");

            if (subProductDetails === null) {
                return res.status(200).json({ status: 'error', mssg: 'Sub Product Details Not Found' });
            }

            var total_pcs = quantity;
            if (unit_type === "Box") {
                total_pcs = (Number(subProductDetails.per_box_pcs) * Number(quantity)).toFixed(2);
            }

            await product_order.deleteOne({ _id: order_code });
            await product_trans.deleteOne({ voucher_code: order_code });
            await order_billing_address.deleteOne({ order_code: order_code });
            await order_shipment_address.deleteOne({ order_code: order_code });

            // Insert in product order
            await product_order.create({
                _id: order_code,
                voucher_number: voucherNumber,
                voucher_date: voucher_date,
                voucher_type: "Order Number",
                order_date: order_date,
                customer_code: customer_code,
                sub_product_code: sub_product_code,
                product_code: subProductDetails.product_code,
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
                paid_amount: paid_amount,
                due_amount: due_amount,
                order_type: order_type,
                delivery_option: delivery_option,
                order_status: order_status,
                note: note,
                accept_order: accept_order,
                entry_user_code: userCode,

            })
                .then(data => {
                    order_code = data._id;
                })
                .catch(err => {
                    console.log(err)
                    // return res.status(500).json({ status: 'error', mssg: err.message });
                })

            if (order_code != "") {

                if (accept_order === "Yes") {
                    // Insert in product trans
                    await product_trans.create({
                        voucher_code: order_code,
                        voucher_num: voucherNumber,
                        voucher_type: "Order Number",
                        voucher_date: voucher_date,
                        sub_product_code: sub_product_code,
                        out_quantity: total_pcs,
                        rate: selling_price,
                        amount: total_price,
                        stock_type: "In",
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

                if (accept_order === "Yes" && previous_accept_order === "No") {
                    next();
                }
            }

            return res.status(200).json({ status: 'success', mssg: "Product Order Saved Successfully" });

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 'error', mssg: 'Server Error' });
        }
    }

}, sendMail.OrderConfirmationSendMail)


// ===================================================
// ROUTER : 14 Delete Product Order Details ( GET method api : /admin/productOrder/deleteOrderDetails )
// ===================================================
router.post('/deleteOrderDetails', verifyUser, [

    body('order_code')
        .notEmpty().withMessage('Order Code Empty !')
        .isMongoId().withMessage('Order Code Is Invalid !'),

], async (req, res) => {

    try {

        const { loginDeletePermision, order_code } = req.body;
        //check the login user have delete permission
        if (loginDeletePermision !== "Yes") {
            return res.status(200).json({ status: 'error', mssg: 'User does not have permission to Delete' });
        }

        let productOrderDetails = await product_order.findById(order_code);

        if (productOrderDetails === null) {
            return res.status(200).json({ status: 'error', mssg: 'Product Order Details not Found' });
        }

        await product_order.deleteOne({ _id: order_code });
        await product_trans.deleteOne({ voucher_code: order_code });
        await order_billing_address.deleteOne({ order_code: order_code });
        await order_shipment_address.deleteOne({ order_code: order_code });

        return res.status(200).json({
            status: 'success',
            mssg: "Order Deleted Successfully",
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }

})



// ===================================================
// ROUTER : 15 calculate Due Amount ( post method api : /admin/productOrder/calculateDueAmount )
// ===================================================
router.post("/calculateDueAmount", verifyUser, [

    body('customer_code')
        .notEmpty().withMessage('customer Code Empty !')
        .isMongoId().withMessage('customer Code Is Invalid !'),

], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorsArray = errors.array();
        return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    } else {
        try {
            const { customer_code } = req.body; // Get the customer code from the query parameters

            // Find all records with the matching customer code
            const orders = await product_order.aggregate([
                {
                    "$match": {
                        customer_code: new mongoose.Types.ObjectId(customer_code),
                        accept_order: "Yes",
                    }
                },
                {
                    "$group": {
                        "_id": null,
                        "total_due_amount": { "$sum": "$due_amount" }
                    }
                }
            ]);

            if (orders.length > 0) {
                return res.json({ totalDueAmount: orders[0].total_due_amount });
            }
            else {
                return res.json({ totalDueAmount: 0 });
            }

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "An error occurred" });
        }
    }
});


// ===================================================
// ROUTER : 16 calculate Sub Product Total Stock ( post method api : /admin/productOrder/calculateSubProductTotalStock )
// ===================================================
router.post("/calculateSubProductTotalStock", verifyUser, [

    body('sub_product_code')
        .notEmpty().withMessage('Sub Product Empty !')
        .isMongoId().withMessage('Sub Product Is Invalid !'),

], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorsArray = errors.array();
        return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    } else {
        try {
            const { sub_product_code } = req.body;

            // Find Total In Stock & Out Stock
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

            if (subProductStock.length > 0) {
                return res.json({ totalStock: subProductStock[0].total_stock });
            }
            else {
                return res.json({ totalStock: 0 });
            }

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "An error occurred" });
        }
    }
});

module.exports = router;