// Import necessary modules and schemas
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const verifyUser = require('../middleware/adminverifyuser'); // Include your user verification middleware
const StockManage = require('../model/stock_manage'); // Import your StockManage schema
const ProductTrans = require('../model/product_trans'); // Import your ProductTrans schema
const mongoose = require('mongoose');

//..................................................................
// Route 1:Insert a new stock - POST method API: /admin/stockManager/insert
//..................................................................
router.post('/insert', verifyUser, [
  body('voucher_date').notEmpty().withMessage('Voucher date is required!'),

  body('sub_product_code')
    .notEmpty().withMessage('Sub product code is required!')
    .isMongoId()
    .withMessage("Sub product code Value Is Invalid !"),

  body('quantity').notEmpty().withMessage('Quantity is required').isNumeric().withMessage('Quantity must be a number!'),

  body('rate').notEmpty().withMessage('Rate is required').isNumeric().withMessage('Rate must be a number!'),

  body('stock_type').notEmpty().withMessage('Stock type is required!').isIn(['In', 'Out']).withMessage('Stock type should be either "In" or "Out"!'),
], async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorsArray = errors.array();
    return res.status(200).json({ status: 'error', field: errorsArray[0].param, mssg: errorsArray[0].msg });
  } else {
    try {
      const session = await mongoose.startSession();
      session.startTransaction();

      const {
        userCode,
        voucher_date,
        sub_product_code,
        quantity,
        rate,
        stock_type,
        loginEntryPermision
      } = req.body;

      // Check if a user has permission to create a stock management entry
      if (loginEntryPermision !== "Yes") {
        session.endSession();
        return res.status(200).json({ status: 'error', mssg: 'User does not have permission to create' });
      }

      // Calculate the amount based on rate and quantity
      const amount = Number(rate) * Number(quantity);

      // Create a new stock management entry
      const newStockEntry = await StockManage.create(
        [
          {
            voucher_date: voucher_date,
            sub_product_code: sub_product_code,
            quantity: quantity,
            rate: rate || 0,
            amount: amount || 0,
            stock_type: stock_type,
            entry_user_code: userCode
          },
        ],
        { session }
      );

      // Determine voucher_code and voucher_num based on conditions
      let voucher_code = newStockEntry[0]._id;
      let in_quantity = 0;
      let out_quantity = 0;

      if (stock_type === 'In') {
        in_quantity = quantity;
        out_quantity = 0;
      } else if (stock_type === 'Out') {
        in_quantity = 0;
        out_quantity = quantity;
      }

      // Create a new product transaction entry
      const newProductTransEntry = await ProductTrans.create(
        [
          {
            voucher_code: voucher_code,
            voucher_type: 'Stock Manage',
            voucher_date: voucher_date,
            sub_product_code: sub_product_code,
            in_quantity: in_quantity,
            out_quantity: out_quantity,
            rate: rate || 0,
            amount: amount || 0,
            stock_type: stock_type,
            entry_user_code: userCode
          },
        ],
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({ status: 'success', mssg: 'Stock management and product transaction entries created successfully', Stock_Manage: newStockEntry, Product_Trans: newProductTransEntry });
    } catch (error) {
      console.error(error.message);
      session.endSession();
      return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
    }
  }
});



//..............................................................
// Route 2:get all Stock list:/admin/stockManager/getStockManage
//..............................................................
router.get('/getStockManage',
  verifyUser,
  async (req, res) => {
    try {

      let loginViewPermision = req.body.loginViewPermision;
      //check the login user have View permission
      if (loginViewPermision !== "Yes") {
        return res.status(200).json({ status: 'error', mssg: 'User does not have permission to view' });
      }

      const StockManageList = await StockManage.aggregate([

        {
          $lookup: {
            from: "sub_product_master",
            localField: "sub_product_code",
            foreignField: "_id",
            as: "subProductMaster",
          },
        },
        {
          $sort:{ entry_timestamp: -1 },
        },
        {
          $project: {
            _id: 1,
            voucher_type: 1,
            voucher_date: 1,
            quantity: 1,
            rate: 1,
            amount: 1,
            stock_type: 1,
            "subProductMaster._id": 1,
            "subProductMaster.sub_product_name": 1,
          },
        },
      ]);

      if (StockManageList.length === 0) {
        return res
          .status(200)
          .json({ status: "error", mssg: "Stock Manage list not found" });
      }

      if (StockManageList) {
        res.status(200).json({
          status: "success",
          mssg: "Stock Manage list Fetched Successfully",
          data: StockManageList,
        });
      } else {
        res.status(200).json({ status: "error", mssg: "Not Found" });
      }
    }
    catch (error) {
      console.log(error.message);
      return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
    }
  });



//.........................................................
// Route 3:get a stock details by code:/admin/stockManager/getStockManageDetails
//.........................................................
router.post(
  "/getStockManageDetails",
  verifyUser,
  [
    body("stock_manage_code")
      .notEmpty()
      .withMessage("stock_manage_code is Empty !")
      .isMongoId()
      .withMessage("stock_manage_code Value Is Invalid !"),
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
      const id = req.body.stock_manage_code;

      const { loginViewPermision } = req.body;
      //check the login user have entry permission
      if (loginViewPermision !== "Yes") {
        return res.status(200).json({
          status: "error",
          mssg: "User does not have permission to View a Customer Billing Address",
        });
      }

      const StockManageDetails = await StockManage.aggregate([

        {
          $lookup: {
            from: "sub_product_master",
            localField: "sub_product_code",
            foreignField: "_id",
            as: "subProductMaster",
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
            voucher_code: 1,
            voucher_type: 1,
            voucher_date: 1,
            quantity: 1,
            rate: 1,
            amount: 1,
            stock_type: 1,
            "subProductMaster._id": 1,
            "subProductMaster.sub_product_name": 1,


          },
        },
      ]);

      if (StockManageDetails.length === 0) {
        return res
          .status(200)
          .json({ status: "error", mssg: "Stock Manage Details not found" });
      }

      if (StockManageDetails) {
        res.status(200).json({
          status: "success",
          mssg: "Stock Manage Details Fetched Successfully",
          data: StockManageDetails,
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



//.........................................................
// Route 4:update a stock details by code:/admin/stockManager/update
//.........................................................
router.post('/update', verifyUser, [

  body('stock_manage_code')
    .notEmpty().withMessage('Stock manage code is required!')
    .isMongoId()
    .withMessage("stock manage code Value Is Invalid !"),

  body('voucher_date').notEmpty().withMessage('Voucher date is required!'),

  body('sub_product_code')
    .notEmpty().withMessage('Sub product code is required!')
    .isMongoId()
    .withMessage("Sub product code Value Is Invalid !"),

  body('quantity').notEmpty().withMessage('Quantity is required').isNumeric().withMessage('Quantity must be a number!'),
  body('rate').notEmpty().withMessage('Rate is required').isNumeric().withMessage('Rate must be a number!'),
  body('stock_type').notEmpty().withMessage('Stock type is required!').isIn(['In', 'Out']).withMessage('Stock type should be either "In" or "Out"!'),
], async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorsArray = errors.array();
    return res.status(200).json({ status: 'error', field: errorsArray[0].param, mssg: errorsArray[0].msg });
  } else {
    try {
      const session = await mongoose.startSession();
      session.startTransaction();

      const {
        voucher_date,
        sub_product_code,
        quantity,
        rate,
        stock_type,
        loginEditPermision,
        userCode,
      } = req.body;

      const stock_manage_code = req.body.stock_manage_code;

      // Check if a user has permission to update a stock management entry
      if (loginEditPermision !== "Yes") {
        session.endSession();
        return res.status(200).json({ status: 'error', mssg: 'User does not have permission to update' });
      }

      // Calculate the amount based on rate and quantity
      const amount = Number(rate) * Number(quantity);

      // Find the corresponding "product_trans" entry and delete it
      await ProductTrans.deleteOne({ voucher_code: stock_manage_code }, { session });


      // Determine voucher_code and voucher_num based on conditions
      let in_quantity = 0;
      let out_quantity = 0;

      if (stock_type === 'In') {
        in_quantity = quantity;
        out_quantity = 0;
      } else if (stock_type === 'Out') {
        in_quantity = 0;
        out_quantity = quantity;
      }

      // Create a new product transaction entry
      const newProductTransEntry = await ProductTrans.create(
        [
          {
            voucher_code: stock_manage_code,
            voucher_type: 'Stock Manage',
            voucher_date: voucher_date,
            sub_product_code: sub_product_code,
            in_quantity: in_quantity,
            out_quantity: out_quantity,
            rate: rate || 0,
            amount: amount || 0,
            stock_type: stock_type,
            entry_user_code: userCode
          },
        ],
        { session }
      );

      // Update the "stock_manage" entry
      const updatedStockEntry = await StockManage.findByIdAndUpdate(
        stock_manage_code,
        {
          voucher_date: voucher_date,
          sub_product_code: sub_product_code,
          quantity: quantity,
          rate: rate || 0,
          amount: amount || 0,
          stock_type: stock_type,
          entry_user_code: userCode

        },
        { new: true, session }
      );

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({ status: 'success', mssg: 'Stock management entry updated successfully', stock_manage: updatedStockEntry, Product_Trans: newProductTransEntry });
    } catch (error) {
      console.error(error.message);
      // session.endSession();
      return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
    }
  }
});



//.........................................................
// Route 5:Delete a stock details by code:/admin/stockManager/delete
//.........................................................
router.post('/delete', verifyUser,
  [
    body("stock_manage_code")
      .notEmpty()
      .withMessage("stock manage code Empty !")
      .isMongoId()
      .withMessage("stock manage code Value Is Invalid !"),
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
      const stock_manage_code = req.body.stock_manage_code;

      // Start a MongoDB session
      const session = await mongoose.startSession();
      session.startTransaction();

      // Delete the related product_trans entries
      await ProductTrans.deleteMany({ voucher_code: stock_manage_code }, { session });

      // Delete the stock_manage entry
      await StockManage.findByIdAndDelete(stock_manage_code, { session });

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      res.status(200).json({ status: 'success', mssg: 'Stock management entry and related product transaction entries deleted successfully' });
    } catch (error) {
      console.error(error.message);
      session.endSession();
      return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
    }
  });


//..................................................................
// Route 6: Insert Multiple Stock - POST method API: /admin/stockManager/insertMultipleStock
//..................................................................
router.post('/insertMultipleStock', verifyUser, [

  body('voucher_date').notEmpty().withMessage('Voucher date is required!'),

  body('stockDetails.*.sub_product_code')
    .notEmpty().withMessage('Sub product code is required!')
    .isMongoId()
    .withMessage("Sub product code Value Is Invalid !"),

  body('stock_type').notEmpty().withMessage('Stock type is required!').isIn(['In', 'Out']).withMessage('Stock type should be either "In" or "Out"!'),

], async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorsArray = errors.array();
    return res.status(200).json({ status: 'error', field: errorsArray[0].param, mssg: errorsArray[0].msg });
  } else {
    try {

      const {
        userCode,
        voucher_date,
        stockDetails,
        stock_type,
        loginEntryPermision
      } = req.body;

      // Check if a user has permission to create a stock management entry
      if (loginEntryPermision !== "Yes") {
        return res.status(200).json({ status: 'error', mssg: 'User does not have permission to create' });
      }

      let insertData = 'No';

      for (let index = 0; index < stockDetails.length; index++) {

        let sub_product_code = stockDetails[index]['sub_product_code'];
        let quantity = stockDetails[index]['quantity'];
        let rate = stockDetails[index]['rate'];

        if (quantity > 0) {

          // Calculate the amount based on rate and quantity
          let amount = Number(rate) * Number(quantity);

          let voucher_code = '';

          // Create a new stock management entry
          let newStockEntry = await StockManage.create({
            voucher_date: voucher_date,
            sub_product_code: sub_product_code,
            quantity: quantity,
            rate: rate || 0,
            amount: amount || 0,
            stock_type: stock_type,
            entry_user_code: userCode
          })
            .then(data => {
              voucher_code = data._id;
              insertData = "Yes";
            })
            .catch(err => {
              console.log(err);
            });

          // Determine voucher_code and voucher_num based on conditions
          let in_quantity = 0;
          let out_quantity = 0;

          if (stock_type === 'In') {
            in_quantity = quantity;
            out_quantity = 0;
          } else if (stock_type === 'Out') {
            in_quantity = 0;
            out_quantity = quantity;
          }

          // Create a new product transaction entry
          await ProductTrans.create({
            voucher_code: voucher_code,
            voucher_type: 'Stock Manage',
            voucher_date: voucher_date,
            sub_product_code: sub_product_code,
            in_quantity: in_quantity,
            out_quantity: out_quantity,
            rate: rate || 0,
            amount: amount || 0,
            stock_type: stock_type,
            entry_user_code: userCode
          });

        }

      }

      if(insertData==="Yes"){
        return res.status(200).json({ status: 'success', mssg: 'Stock management and product transaction entries created successfully' });
      }
      else{
        return res.status(200).json({ status: 'error', mssg: 'No data inserted' });
      }

    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
    }
  }
});


// Export the router
module.exports = router;