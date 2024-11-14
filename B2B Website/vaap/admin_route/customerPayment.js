const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const verifyUser = require('../middleware/adminverifyuser');

const product_order = require('../new_model/product_order');
const customer_master = require('../model/customerMasterSchema');
const customer_order_amount_trans = require('../new_model/customerOrderAmountTrans');

const { body, validationResult } = require('express-validator');


// ===================================================
// ROUTER : 1 Get Customer List ( GET method api : /admin/customerPayment/getCustomerList )
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
// ROUTER : 2 Get Customer Due Order List ( GET method api : /admin/customerPayment/getCustomerOrderDueList )
// ===================================================
router.post('/getCustomerOrderDueList', verifyUser, [

    body('customer_code')
        .notEmpty().withMessage('Customer Code Empty !')
        .isMongoId().withMessage('Customer Code Is Invalid !'),

], async (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const errorsArray = errors.array();
        return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    }
    else {
        try {

            const {
                customer_code,
            } = req.body;

            // Get Customer List
            let getOrderList = await product_order.aggregate([
                {
                    $match: {
                        "customer_code": new mongoose.Types.ObjectId(customer_code),
                        "due_amount": { $ne: 0 },
                        "accept_order": "Yes",
                    }
                },
                {
                    $project: {
                        "_id": 1,
                        "voucher_number": 1,
                    }
                },
            ]);

            return res.status(200).json({ status: 'success', mssg: 'Fetched Successfully', getOrderList });


        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 'error', mssg: 'Server Error' });
        }
    }
})

// ===================================================
// ROUTER : 3 Save Customer Payment ( GET method api : /admin/customerPayment/saveCustomerPayment )
// ===================================================
router.post('/saveCustomerPayment', verifyUser, [

    body('order_code')
        .notEmpty().withMessage('Order Empty !')
        .isMongoId().withMessage('Order Is Invalid !'),

    body('customer_code')
        .notEmpty().withMessage('Customer Empty !')
        .isMongoId().withMessage('Customer Is Invalid !'),

    body('payment_type')
        .notEmpty().withMessage('Payment Type Empty !'),

    body('paid_amount')
        .notEmpty().withMessage('Paid Amount Empty !')
        .isNumeric().withMessage('Paid Amount Accepted Only Number'),

    body('pay_date')
        .notEmpty().withMessage('Pay Date Empty !'),

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
                order_code,
                customer_code,
                payment_type,
                payment_details,
                paid_amount,
                pay_date,
                loginEntryPermision,
            } = req.body;

            //check the login user have entry permission
            if (loginEntryPermision !== "Yes") {
                return res.status(200).json({ status: 'error', mssg: 'User does not have permission to create ' });
            }

            // Get Product Order Details
            let productOrderDetails = await product_order.findOne({ _id: order_code }).select("paid_amount").select("due_amount");

            if (productOrderDetails === null) {
                return res.status(200).json({ status: 'error', mssg: 'Order Details not Found' });
            }

            if (Number(paid_amount) > Number(productOrderDetails.due_amount)) {
                return res.status(200).json({ status: 'error', mssg: 'Paid amount greater than due amount, this bill due amount ' + productOrderDetails.due_amount });
            }

            let newPayAmount = (Number(productOrderDetails.paid_amount) + Number(paid_amount)).toFixed(2);
            let newDueAmount = (Number(productOrderDetails.due_amount) - Number(paid_amount)).toFixed(2);

            // Update product order
            await product_order.findByIdAndUpdate(order_code, {
                paid_amount: newPayAmount,
                due_amount: newDueAmount,
            })
                .then(data => {
                })
                .catch(err => {
                    console.log(err)
                })

            // Insert in customer order amount trans
            await customer_order_amount_trans.create({
                order_code: order_code,
                customer_code: customer_code,
                paid_amount: paid_amount,
                payment_type: payment_type,
                payment_details: payment_details,
                pay_date: pay_date,
                entry_user_code: userCode,
            })
                .then(data => {
                    return res.status(200).json({ status: 'success', mssg: "Customer Payment Saved Successfully" });
                })
                .catch(err => {
                    console.log(err)
                })

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 'error', mssg: 'Server Error' });
        }
    }

})


// ===================================================
// ROUTER : 4 Get Customer Payment List ( GET method api : /admin/customerPayment/getCustomerPaymentList )
// ===================================================
router.get('/getCustomerPaymentList', verifyUser, async (req, res) => {

    try {

        const { loginViewPermision } = req.body;
        //check the login user have entry permission
        if (loginViewPermision !== "Yes") {
            return res.status(200).json({
                status: "error",
                mssg: "User does not have permission to View any data",
            });
        }

        // Fetch Customer Payment List
        let customerPaymentList = await customer_order_amount_trans.aggregate([

            {
                $lookup:
                {
                    from: "product_order",
                    localField: "order_code",
                    foreignField: "_id",
                    as: 'product_order'
                }
            },
            {
                $lookup:
                {
                    from: "customer_master",
                    localField: "customer_code",
                    foreignField: "_id",
                    as: 'customer_master'
                }
            },

            { $sort: { entry_timestamp: -1 } },

            {
                $project: {
                    "_id": 1,
                    "order_code": 1,
                    "product_order._id": 1,
                    "product_order.voucher_number": 1,
                    "customer_code": 1,
                    "customer_master._id": 1,
                    "customer_master.customer_name": 1,
                    "customer_master.email": 1,
                    "customer_master.ph_num": 1,
                    "customer_master.user_name": 1,
                    "paid_amount": 1,
                    "payment_type": 1,
                    "payment_details": 1,
                    "pay_date": 1,
                }
            },

        ]);

        return res.status(200).json({
            status: 'success',
            mssg: "Fetched Successfully",
            customerPaymentList
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }

})


// ===================================================
// ROUTER : 5 Delete Customer Payment Details ( GET method api : /admin/customerPayment/deleteCustomerPayment )
// ===================================================
router.post('/deleteCustomerPayment', verifyUser, [

    body('payment_code')
        .notEmpty().withMessage('Payment Code Empty !')
        .isMongoId().withMessage('Payment Code Is Invalid !'),

], async (req, res) => {

    try {

        const { loginDeletePermision, payment_code } = req.body;
        //check the login user have delete permission
        if (loginDeletePermision !== "Yes") {
            return res.status(200).json({ status: 'error', mssg: 'User does not have permission to Delete' });
        }

        // Get Payment details
        let paymentDetails = await customer_order_amount_trans.findOne({ _id: payment_code }).select("paid_amount").select("order_code");

        if (paymentDetails === null) {
            return res.status(200).json({ status: 'error', mssg: 'Payment Details not Found' });
        }

        let order_code = paymentDetails.order_code;
        let paid_amount = paymentDetails.paid_amount;

        // Get Product Order Details
        let productOrderDetails = await product_order.findOne({ _id: order_code }).select("paid_amount").select("due_amount");

        if (productOrderDetails === null) {
            return res.status(200).json({ status: 'error', mssg: 'Order Details not Found' });
        }

        let newPayAmount = (Number(productOrderDetails.paid_amount) - Number(paid_amount)).toFixed(2);
        let newDueAmount = (Number(productOrderDetails.due_amount) + Number(paid_amount)).toFixed(2);

        // Update product order
        await product_order.findByIdAndUpdate(order_code, {
            paid_amount: newPayAmount,
            due_amount: newDueAmount,
        })
            .then(data => {
            })
            .catch(err => {
                console.log(err)
            })

        await customer_order_amount_trans.deleteOne({ _id: payment_code });

        return res.status(200).json({
            status: 'success',
            mssg: "Customer Payment Deleted Successfully",
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }

})

// ===================================================
// ROUTER : 6 Get Order Due Amount ( GET method api : /admin/customerPayment/getOrderDueAmount )
// ===================================================
router.post('/getOrderDueAmount', verifyUser, [

    body('order_code')
        .notEmpty().withMessage('Product Order Empty !')
        .isMongoId().withMessage('Product Order Is Invalid !'),

], async (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const errorsArray = errors.array();
        return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    }
    else {
        try {

            const {
                order_code,
            } = req.body;

            // Get Product Order Details
            let productOrderDetails = await product_order.findOne({ _id: order_code }).select("due_amount");

            if (productOrderDetails === null) {
                return res.status(200).json({ status: 'error', mssg: 'Order Details not Found' });
            }

            return res.status(200).json({ status: 'success', mssg: 'Fetched Successfully', due_amount: productOrderDetails.due_amount });


        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 'error', mssg: 'Server Error' });
        }
    }
})

// ===================================================
// ROUTER : 7 calculate Due Amount ( post method api : /admin/customerPayment/calculateDueAmount )
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
            const orders = await product_order.find({ customer_code: customer_code, accept_order: "Yes" });

            // Calculate the sum of due_amount for matching records
            const totalDueAmount = orders.reduce((sum, order) => sum + order.due_amount, 0).toFixed(2);

            res.json({ totalDueAmount });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "An error occurred" });
        }
    }
});

module.exports = router;