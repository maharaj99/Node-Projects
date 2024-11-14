// imports
const express = require('express');
const router = express.Router();
const ProductType = require('../model/product_type_master');
const { body, validationResult } = require('express-validator');
const verifyUser = require('../middleware/adminverifyuser');
const mongoose = require('mongoose');



//................................................................
// ROUTER 1:Route for inserting a new product type Post method:/admin/prodcutType/insert
//................................................................

router.post('/insert', verifyUser, [
    body('product_type').notEmpty().withMessage('product_type is required!'),

    body('show_home_page').notEmpty().withMessage('show_home_page is required!').isIn(['Yes', 'No']),

    body('active').notEmpty().withMessage('Active is required!').isIn(['Yes', 'No']).withMessage('Active should be either "Yes" or "No"!')
  ], async (req, res) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({
        status: 'error',
        field: errorsArray[0]['param'],
        mssg: errorsArray[0]['msg'],
      });
    } else {
      try {
        const {
          product_type,
          show_home_page,
          active,
          userCode,
          loginEntryPermision
        } = req.body;


         //check the login user have entry permission
         if (loginEntryPermision !== "Yes") {
          return res.status(200).json({ status: 'error', mssg: 'User does not have permission to create ' });
        }

  
        // Check if a product type with the same _id already exists
        const existingProductType = await ProductType.findOne({ product_type });
  
        if (existingProductType) {
          return res.status(200).json({
            status: 'error',
            field: 'product_type',
            mssg: 'Product type with the same product type already exists!',
          });
        }
  
        const newProductType = await ProductType.create({
          product_type:product_type,
          show_home_page:show_home_page,
          active:active,
          entry_user_code:userCode,
        });
  
        res.status(201).json({
          status: 'success',
          mssg: 'Product type created successfully',
          data: newProductType,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({
          status: 'server error',
          mssg: 'Internal Server Error',
        });
      }
    }
  });





//..............................................................
// ROUTER 2: Get all product types - GET method API:/admin/prodcutType/getProductTypes
//................................................................

router.get('/getProductTypes', verifyUser, async (req, res) => {
    try {

      let loginViewPermision = req.body.loginViewPermision;
      //check the login user have View permission
      if (loginViewPermision !== "Yes") {
       return res.status(200).json({ status: 'error', mssg: 'User does not have permission to view' });
     }

      // Use the ProductType model (assuming you've defined it) to find all active product types
      const ProductTypes = await ProductType.find({}, { __v: 0, entry_user_code: 0, entry_timestamp: 0 })
        .sort({ entry_timestamp: -1 });
  
      res.status(200).json({ status: 'success', message: 'All Product Types fetched', data: ProductTypes });
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  });
  



  
//......................................................................
// ROUTER 3: Get details for a specific Product Type - POST method API: //admin/prodcutType/getProductTypeDetails
//......................................................................

router.post('/getProductTypeDetails', verifyUser, [
  body('productType_code')
    .notEmpty().withMessage('productType_code is empty!')
    .isMongoId().withMessage('Invalid productType_code value for product type!'),
],

async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorsArray = errors.array();
    return res.status(200).json({ status: 'error', field: errorsArray[0].param, mssg: errorsArray[0].msg });
  } else {
    try {
      const { productType_code ,loginViewPermision} = req.body;

      //check the login user have View permission
      if (loginViewPermision !== "Yes") {
       return res.status(200).json({ status: 'error', mssg: 'User does not have permission to view' });
     }

      // Use the ProductType model to find a specific product type
      const productType = await ProductType.findOne({ _id:productType_code}, { __v: 0, entry_user_code: 0, entry_timestamp: 0 });

      if (productType) {
        // Product type details found, send a success response
        return res.status(200).json({ status: 'success', data: productType });
      } else {
        // Product type not found, send an error response
        return res.status(200).json({ status: 'error', mssg: 'Product type not found' });
      }

    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
    }
  }
});



//.................................................................
// ROUTER 4:Update a Product Type - POST method API: /admin/prodcutType/update
//.................................................................

router.post('/update', verifyUser,[
  body('productType_code')
  .notEmpty().withMessage('productType_code is required!')
  .isMongoId().withMessage('Invalid productType_code value for product'),

  body('product_type').notEmpty().withMessage('product_type is required!'),

  body('show_home_page').notEmpty().withMessage('show_home_page is required!').isIn(['Yes', 'No']).withMessage('show_home_page should be either "Yes" or "No"!'),

  body('active').notEmpty().withMessage('Active is required!').isIn(['Yes', 'No']).withMessage('Active should be either "Yes" or "No"!')
], async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorsArray = errors.array();
    return res.status(200).json({ status: 'error', field: errorsArray[0].param, mssg: errorsArray[0].msg });
  } else {
    try {
      const productTypeId = req.body.productType_code;
      const {
        userCode,
        product_type,
        show_home_page,
        active,
        loginEditPermision
      } = req.body;

      //check the login user have View permission
      if (loginEditPermision !== "Yes") {
       return res.status(200).json({ status: 'error', mssg: 'User does not have permission to Edit' });
     }
      // Check if a product type with the same name already exists
      const existingProductType = await ProductType.findOne({
        _id: { $ne: productTypeId },
        product_type: product_type,
      });

      if (existingProductType) {
        return res.status(200).json({ status: 'error', field: 'product_type', mssg: 'Product type with the same name already exists!' });
      }

      const updatedProductType = await ProductType.findByIdAndUpdate(productTypeId, {
        product_type: product_type,
        show_home_page:show_home_page,
        entry_user_code:userCode,
        active: active
      }, { new: true });

      if (updatedProductType) {
        res.status(200).json({ status: 'success', mssg: 'Product type updated successfully', data: updatedProductType });
      } else {
        res.status(200).json({ status: 'error', mssg: 'Product type not found' });
      }

    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
    }
  }
});




//..................................................................
//ROUTER 5:dmin Delete a Product Type - POST method API: /admin/prodcutType/delete
//..................................................................

router.post('/delete', verifyUser, [
  body('productType_code')
    .notEmpty().withMessage('productType_code is required!')
    .isMongoId().withMessage('Invalid productType_code value for product type!'),
], async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorsArray = errors.array();
    return res.status(200).json({ status: 'error', field: errorsArray[0].param, mssg: errorsArray[0].msg });
  } else {
    try {

      let loginDeletePermision = req.body.loginDeletePermision;
      //check the login user have View permission
      if (loginDeletePermision !== "Yes") {
       return res.status(200).json({ status: 'error', mssg: 'User does not have permission to Delete' });
     }

      const productTypeId = req.body.productType_code;

      // // Check if the product type to be deleted exists
      // const productTypeToDelete = await ProductType.findById(productTypeId);
      
      // if (!productTypeToDelete) {
      //   return res.status(404).json({ status: 'error', mssg: 'Product type not found' });
      // }

      // // You can add additional checks here, such as ensuring that there are no associated products

      const result = await ProductType.findByIdAndDelete(productTypeId);

      if (result) {
        res.status(200).json({ status: 'success', mssg: 'Product type deleted successfully' });
      } else {
        return res.status(200).json({ status: 'error', mssg: 'Failed to delete product type' });
      }
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
    }
  }
});



module.exports = router;