const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const verifyUser = require('../middleware/adminverifyuser');

const product_order = require('../new_model/product_order');
const order_shipment_details = require('../new_model/orderShipmentDetails');

const { body, validationResult } = require('express-validator');


// ===================================================
// ROUTER : 1 Get Product Order List ( GET method api : /admin/orderStatus/getProductOrderList )
// ===================================================
router.get('/getProductOrderList', verifyUser, async (req, res) => {
    try {

        // Get Order Voucher Number Details
        let productOrderList = await product_order.find({accept_order: "Yes"}, { _id: 1, voucher_number: 1, }).sort({ "entry_timestamp": -1 });

        return res.status(200).json({ status: 'success', mssg: 'Fetched Successfully', productOrderList });

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }
})

// ===================================================
// ROUTER : 2 Save Order Status ( GET method api : /admin/orderStatus/saveOrderStatus )
// ===================================================
router.post('/saveOrderStatus', verifyUser, [

    body('order_code')
        .notEmpty().withMessage('Order Code Empty !')
        .isMongoId().withMessage('Order Code Is Invalid !'),

    body('status')
        .notEmpty().withMessage('Status Empty !')
        .isIn(["Pending", "Under Review", "Accepted", "Dispatch", "Delivery", "Drop Off"]).withMessage('Status does contain invalid value'),

    body('mssg')
        .notEmpty().withMessage('Message Empty !'),

    body('status_date')
        .notEmpty().withMessage('Status Date Empty !'),

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
                status,
                mssg,
                status_date,
                loginEntryPermision,
            } = req.body;

            //check the login user have entry permission
            if (loginEntryPermision !== "Yes") {
                return res.status(200).json({ status: 'error', mssg: 'User does not have permission to create ' });
            }

            // Check Same Status Exist Or Not
            let dataGet = await order_shipment_details.findOne({ order_code: order_code, status: status });

            if (dataGet != null) {
                return res.status(200).json({ status: 'error', mssg: 'Already Exist Same Order Status' });
            }

            await product_order.findByIdAndUpdate(order_code,{
                order_status: status,
            })

            // Insert in product trans
            await order_shipment_details.create({
                order_code: order_code,
                status: status,
                mssg: mssg,
                status_date: status_date,
                entry_user_code: userCode,
            })
                .then(data => {
                    return res.status(200).json({ status: 'success', mssg: "Order Status Saved Successfully" });
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
// ROUTER : 3 Get Order Status List ( GET method api : /admin/orderStatus/getOrderStatusList )
// ===================================================
router.get('/getOrderStatusList', verifyUser, async (req, res) => {

    try {

        const { loginViewPermision } = req.body;
        //check the login user have entry permission
        if (loginViewPermision !== "Yes") {
            return res.status(200).json({
                status: "error",
                mssg: "User does not have permission to View any data",
            });
        }

        // Fetch Order Status List
        let orderStatusList = await order_shipment_details.aggregate([

            {
                $lookup:
                {
                    from: "product_order",
                    localField: "order_code",
                    foreignField: "_id",
                    as: 'product_order'
                }
            },

            { $sort: { entry_timestamp: -1 } },

            {
                $project: {
                    "_id": 1,
                    "order_code": 1,
                    "product_order._id": 1,
                    "product_order.voucher_number": 1,
                    "status": 1,
                    "mssg": 1,
                    "status_date": 1,
                }
            },

        ]);

        return res.status(200).json({
            status: 'success',
            mssg: "Fetched Successfully",
            orderStatusList
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }

})


// ===================================================
// ROUTER : 4 Get Order Status Details ( GET method api : /admin/orderStatus/getOrderStatusDetails )
// ===================================================
router.post('/getOrderStatusDetails', verifyUser, [

    body('order_status_code')
        .notEmpty().withMessage('Order Status Code Empty !')
        .isMongoId().withMessage('Order Status Code Is Invalid !'),

], async (req, res) => {

    try {

        const { loginViewPermision, order_status_code } = req.body;
        //check the login user have entry permission
        if (loginViewPermision !== "Yes") {
            return res.status(200).json({
                status: "error",
                mssg: "User does not have permission to View any data",
            });
        }

        // Fetch Order Status List
        let orderStatusList = await order_shipment_details.aggregate([

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
                $match: { "_id": new mongoose.Types.ObjectId(order_status_code) }
            },
            {
                $project: {
                    "_id": 1,
                    "order_code": 1,
                    "product_order._id": 1,
                    "product_order.voucher_number": 1,
                    "status": 1,
                    "mssg": 1,
                    "status_date": 1,
                }
            },

        ]);

        return res.status(200).json({
            status: 'success',
            mssg: "Fetched Successfully",
            orderStatusList
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }

})


// ===================================================
// ROUTER : 5 Update Order Status ( GET method api : /admin/orderStatus/updateOrderStatus )
// ===================================================
router.post('/updateOrderStatus', verifyUser, [

    body('order_status_code')
        .notEmpty().withMessage('Order Status Code Empty !')
        .isMongoId().withMessage('Order Status Code Is Invalid !'),

    body('order_code')
        .notEmpty().withMessage('Order Code Empty !')
        .isMongoId().withMessage('Order Code Is Invalid !'),

    body('status')
        .notEmpty().withMessage('Status Empty !')
        .isIn(["Pending", "Under Review", "Accepted", "Dispatch", "Delivery", "Drop Off"]).withMessage('Status does contain invalid value'),

    body('mssg')
        .notEmpty().withMessage('Message Empty !'),

    body('status_date')
        .notEmpty().withMessage('Status Date Empty !'),

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
                order_status_code,
                order_code,
                status,
                mssg,
                status_date,
                loginEntryPermision,
            } = req.body;

            //check the login user have entry permission
            if (loginEntryPermision !== "Yes") {
                return res.status(200).json({ status: 'error', mssg: 'User does not have permission to create ' });
            }

            // Check Same Status Exist Or Not
            let dataGet = await order_shipment_details.findOne({_id: { $ne: order_status_code }, order_code: order_code, status: status });

            if (dataGet != null) {
                return res.status(200).json({ status: 'error', mssg: 'Already Exist Same Order Status' });
            }

            await product_order.findByIdAndUpdate(order_code,{
                order_status: status,
            })

            // Insert in product trans
            const updateProcess = await order_shipment_details.findOneAndUpdate({ _id: order_status_code },{
                order_code: order_code,
                status: status,
                mssg: mssg,
                status_date: status_date,
                entry_user_code: userCode,
            });

            if (updateProcess) {
                res.status(200).json({ status: 'success', mssg: 'Data Updated Successfully' });
            }
            else {
                res.status(200).json({ status: 'error', mssg: 'Details Not Found' });
            }

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 'error', mssg: 'Server Error' });
        }
    }

})


// ===================================================
// ROUTER : 6 Delete Order Status Details ( GET method api : /admin/orderStatus/deleteOrderStatus )
// ===================================================
router.post('/deleteOrderStatus', verifyUser, [

    body('order_status_code')
        .notEmpty().withMessage('Order Status Code Empty !')
        .isMongoId().withMessage('Order Status Code Is Invalid !'),

], async (req, res) => {

    try {

        const { loginDeletePermision, order_status_code } = req.body;
        //check the login user have delete permission
        if (loginDeletePermision !== "Yes") {
            return res.status(200).json({ status: 'error', mssg: 'User does not have permission to Delete' });
        }


        await order_shipment_details.deleteOne({ _id: order_status_code });

        return res.status(200).json({
            status: 'success',
            mssg: "Order Status Deleted Successfully",
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }

})

module.exports = router;