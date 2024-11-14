// imports
const express = require('express');
const router = express.Router();
const product = require('../model/product_master');
const { body, validationResult } = require('express-validator');
const imagesupload = require('../middleware/admin_uploadfiles');
const verifyUser = require('../middleware/adminverifyuser');
const Category = require('../model/category_master');
const sub_category = require('../model/subcategory_master');
const productType = require('../model/product_type_master');
const Unit = require('../model/unit_master');
const brand = require('../model/Brand_master');
const fs = require('fs');
const mongoose = require('mongoose');




// .............................................................
// ROUTER : post method api :/admin/product/insert
// .............................................................

router.post('/insert',
  verifyUser,
  imagesupload.product_images,
  [
    body('product_name').notEmpty().withMessage('Product name is required!'),

    body('description').notEmpty().withMessage('Description is required!'),

    body('highlight').notEmpty().withMessage('Highlight is required!'),

    body('meta_keywords').notEmpty().withMessage('Meta keywords are required!'),

    body('meta_description').notEmpty().withMessage('Meta description is required!'),

    body('product_type_code').isMongoId().withMessage('Invalid product type code value!'),

    body('category_code').isMongoId().withMessage('Invalid category code value!'),

    body('sub_category_code').isMongoId().withMessage('Invalid sub-category code value!'),

    body('brand_code').isMongoId().withMessage('Invalid brand_code code value!'),

    body('unit').notEmpty().withMessage('Unit is required!'),

    body('buying_price').isNumeric().withMessage('Invalid buying price value!'),

    body('mrp').isNumeric().withMessage('Invalid MRP value!'),

    body('discount_type').isIn(['Percentage', 'Flat', 'Null']).withMessage('Invalid discount type value!'),

    body('discount').isNumeric().withMessage('Invalid discount value!'),

    body('selling_price').isNumeric().withMessage('Invalid selling price value!'),

    body('active').isIn(['Yes', 'No']).withMessage('Active should be either "Yes" or "No"!'),

    body('product_image_1').custom((value, { req }) => {
      if (!req.files || !req.files.product_images_1 || req.files.product_images_1.length === 0) {
        throw new Error('Product image 1 is required');
      }
      return true;
    }),

    body('product_image_2').custom((value, { req }) => {
      if (!req.files || !req.files.product_images_2 || req.files.product_images_2.length === 0) {
        throw new Error('Product image 2 is required');
      }
      return true;
    }),

  ], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({ status: 'error', field: errorsArray[0].param, mssg: errorsArray[0].msg });
    } else {
      try {
        let {
          userCode,
          product_name,
          description,
          highlight,
          meta_keywords,
          meta_description,
          product_type_code,
          category_code,
          sub_category_code,
          brand_code,
          unit,
          buying_price,
          mrp,
          discount_type,
          discount,
          selling_price,
          active,
          loginEntryPermision
        } = req.body;

        //check the login user have entry permission
        if (loginEntryPermision !== "Yes") {
          return res.status(200).json({ status: 'error', mssg: 'User does not have permission to create ' });
        }

        // product_link = product_name replace space with dash(-) and convert it in lowercase
        const product_link = product_name.replace(/ /g, '-').toLowerCase();

        //selling_price= If (discount=="Percentage"){ mrp - ( (mrp * discount) /100)}
        if (discount_type === "Percentage") {
          selling_price = ( Number(mrp) - ((Number(mrp) * Number(discount)) / 100) ).toFixed(2)
        }
        // selling_price= If (discount=="Flat"){ mrp - discount  }
        else if (discount_type === "Flat") {
          selling_price = ( Number(mrp) - Number(discount) ).toFixed(2)
        }
        else {
          selling_price = Number(mrp)
        }

        if (Number(discount) >= Number(mrp)) {
          return res.status(200).json({ status: 'error', mssg: 'Discount can not be Gaterthan or equel to Mrp' });
        }

        var per_pcs_buying_price = 0;
        var per_pcs_selling_price = 0;

        //product_images upload
        const { product_images_1, product_images_2 } = req.files || {};
        let filename1 = product_images_1[0].filename;
        let filename2 = product_images_2[0].filename;


        // Check if a product with the same name already exists
        const existingProduct = await product.findOne({ product_name });

        if (existingProduct) {
          return res.status(200).json({ status: 'error', field: 'product_name', mssg: 'Product with the same name already exists!' });
        }

        const newProduct = await product.create({
          product_name: product_name,
          description: description,
          highlight: highlight,
          meta_keywords: meta_keywords,
          meta_description: meta_description,
          product_link: product_link,

          product_image_1: "product_images/" + filename1,
          product_image_2: "product_images/" + filename2,

          product_type_code: product_type_code,
          category_code: category_code,
          sub_category_code: sub_category_code,
          brand_code:brand_code,
          unit: unit,
          buying_price: buying_price,
          per_pcs_buying_price: per_pcs_buying_price,
          mrp: mrp,
          discount_type: discount_type,
          discount: discount,
          selling_price: selling_price,
          per_pcs_selling_price: per_pcs_selling_price,
          active: active,
          entry_user_code: userCode
        });

        res.status(200).json({ status: 'success', mssg: 'Product created successfully', data: newProduct });
      } catch (error) {
        console.error(error.message);
        return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
      }
    }
  });



// Delete a product by ID: DELETE "/admin/product/delete"
router.post('/delete', verifyUser, async (req, res) => {
  try {

    let loginDeletePermision = req.body.loginDeletePermision;
    //check the login user have View permission
    if (loginDeletePermision !== "Yes") {
      return res.status(200).json({ status: 'error', mssg: 'User does not have permission to Delete' });
    }

    const productCode = req.body.productCode;
    if (!productCode) {
      return res.status(200).json({ status: 'error', message: 'ID is required' });
    }

    const result = await product.findByIdAndDelete(productCode);
    if (result) {
      res.status(200).json({ status: 'success', message: 'Product delete succesfully' });
    } else {
      return res.status(200).json({ status: 'error', message: 'Product not found' });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
});


// Update an existing Product - POST method API: /product/update
router.post('/update', verifyUser, imagesupload.product_images, [

  body('product_code').notEmpty().withMessage('Product code is required!').isMongoId().withMessage('Invalid product code value!'),
  body('product_name').notEmpty().withMessage('Product name is required!'),
  body('description').notEmpty().withMessage('Description is required!'),
  body('highlight').notEmpty().withMessage('Highlight is required!'),
  body('meta_keywords').notEmpty().withMessage('Meta keywords are required!'),
  body('meta_description').notEmpty().withMessage('Meta description is required!'),
  body('product_type_code').isMongoId().withMessage('Invalid product type code value!'),
  body('category_code').isMongoId().withMessage('Invalid category code value!'),
  body('sub_category_code').isMongoId().withMessage('Invalid sub-category code value!'),
  body('brand_code').isMongoId().withMessage('Invalid brand code value!'),

  body('unit').notEmpty().withMessage('Unit is required!'),
  
  body('buying_price').isNumeric().withMessage('Invalid buying price value!'),
  body('mrp').isNumeric().withMessage('Invalid MRP value!'),
  body('discount_type').isIn(['Percentage', 'Flat', 'Null']).withMessage('Invalid discount type value!'),
  body('discount').isNumeric().withMessage('Invalid discount value!'),
  body('selling_price').isNumeric().withMessage('Invalid selling price value!'),
  body('active').isIn(['Yes', 'No']).withMessage('Active should be either "Yes" or "No"!')
], async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorsArray = errors.array();
    return res.status(200).json({ status: 'error', field: errorsArray[0].param, mssg: errorsArray[0].msg });
  } else {
    try {
      let {
        product_code,
        userCode,
        product_name,
        description,
        highlight,
        meta_keywords,
        meta_description,
        product_type_code,
        category_code,
        sub_category_code,
        brand_code,
        unit,
        buying_price,
        mrp,
        discount_type,
        discount,
        selling_price,
        active,
        loginEditPermision
      } = req.body;

      // Check if the login user has update permission
      if (loginEditPermision !== "Yes") {
        return res.status(200).json({ status: 'error', mssg: 'User does not have permission to update' });
      }

      // Check if Product already exists
      const Product = await product.findOne({
        _id: { $ne: product_code },
        product_name: product_name,
      });

      if (Product) {
        return res.status(200).json({ status: 'error', field: 'product_name', mssg: 'product name with the same name already exists!' });
      }


      // Check if the product with the given code exists
      const existingProduct = await product.findOne({ _id: product_code });

      if (!existingProduct) {
        return res.status(200).json({ status: 'error', field: 'product_code', mssg: 'Product not found' });
      }

      // Update the product_link to the lowercase version of product_name
      const productlink = product_name.replace(/ /g, '-').toLowerCase();

      //selling_price= If (discount=="Percentage"){ mrp - ( (mrp * discount) /100)}
      if (discount_type === "Percentage") {
        selling_price = (Number(mrp) - ((Number(mrp) * Number(discount)) / 100)).toFixed(2);
      }
      // selling_price= If (discount=="Flat"){ mrp - discount  }
      else if (discount_type === "Flat") {
        selling_price = (Number(mrp) - Number(discount)).toFixed(2);
      }
      else {
        selling_price = Number(mrp)
      }

      if (Number(discount) >= Number(mrp)) {
        return res.status(200).json({ status: 'error', mssg: 'Discount can not be Gaterthan or equel to Mrp' });
      }

      var per_pcs_buying_price = 0;
      var per_pcs_selling_price = 0;

      // Update the product record
      let updatedProduct = {
        product_name: product_name,
        description: description,
        highlight: highlight,
        meta_keywords: meta_keywords,
        meta_description: meta_description,
        product_link: productlink,
        product_type_code: product_type_code,
        category_code: category_code,
        sub_category_code: sub_category_code,
        brand_code:brand_code,
        unit: unit,
        buying_price: buying_price,
        per_pcs_buying_price: per_pcs_buying_price,
        mrp: mrp,
        discount_type: discount_type,
        discount: discount,
        selling_price: selling_price,
        per_pcs_selling_price: per_pcs_selling_price,
        active: active,
        entry_user_code: userCode
      }


      // Check if product images were uploaded
      if (req.files) {
        const { product_images_1, product_images_2 } = req.files;

        if (product_images_1 && product_images_1[0] && product_images_1[0].filename) {
          updatedProduct.product_image_1 = "product_images/" + product_images_1[0].filename;
        }

        if (product_images_2 && product_images_2[0] && product_images_2[0].filename) {
          updatedProduct.product_image_2 = "product_images/" + product_images_2[0].filename;
        }

        // Remove images if new images are uploaded
        const existingImages = await product.findById(product_code);
        if (existingImages) {
          const oldImage1 = existingImages.product_image_1;
          const oldImage2 = existingImages.product_image_2;

          if (oldImage1 && oldImage1 !== "") {
            fs.unlink('./uploads/' + oldImage1, err => {
              if (err) console.error(err);
              // Handle success or further processing here
            });
          }

          if (oldImage2 && oldImage2 !== "") {
            fs.unlink('./uploads/' + oldImage2, err => {
              if (err) console.error(err);
              // Handle success or further processing here
            });
          }
        }
      }



      const update = await product.findByIdAndUpdate(product_code, updatedProduct, { new: true });

      if (update) {
        res.status(200).json({ status: 'success', message: 'Product details updated successfully', data: update });
      } else {
        res.status(200).send({ status: 'error', message: 'Product not found' });
      }


    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
    }
  }
});




//get all product list:/admin/product/getProduct
router.get('/getProduct',
  verifyUser,
  async (req, res) => {
    try {

      let loginViewPermision = req.body.loginViewPermision;
      //check the login user have View permission
      if (loginViewPermision !== "Yes") {
        return res.status(200).json({ status: 'error', mssg: 'User does not have permission to view' });
      }

      // Fetch Products List
      let productList = await product.aggregate([

        {
          $lookup:
          {
            from: "product_type_master",
            localField: "product_type_code",
            foreignField: "_id",
            as: 'product_type_master'
          }
        },

        {
          $lookup:
          {
            from: "category_master",
            localField: "category_code",
            foreignField: "_id",
            as: 'category_master'
          }
        },

        {
          $lookup:
          {
            from: "sub_category",
            localField: "sub_category_code",
            foreignField: "_id",
            as: 'sub_category'
          }
        },
        {
          $lookup:
          {
            from: "brand",
            localField: "brand_code",
            foreignField: "_id",
            as: 'Brand'
          }
        },

        { $sort: { entry_timestamp: -1 } },

        {
          $project: {
            "_id": 1,
            "product_name": 1,
            "description": 1,
            "highlight": 1,
            "meta_keywords": 1,
            "meta_description": 1,
            "product_link": 1,
            "product_image_1": 1,
            "product_image_2": 1,
            "product_type_code": 1,
            "product_type_master._id": 1,
            "product_type_master.product_type": 1,
            "category_code": 1,
            "category_master._id": 1,
            "category_master.category_name": 1,
            "sub_category_code": 1,
            "sub_category._id": 1,
            "sub_category.sub_category_name": 1,
            "Brand._id": 1,
            "Brand.brand_name": 1,
            "unit": 1,
            "buying_price": 1,
            "per_pcs_buying_price": 1,
            "mrp": 1,
            "discount_type": 1,
            "discount": 1,
            "selling_price": 1,
            "per_pcs_selling_price": 1,
            "active": 1,
          }
        },

      ]);

      if (productList) {
        return res.status(200).json({ status: 'success', mssg: 'Product List Fetched Successfully', productList });
      }
      else {
        return res.status(200).json({ status: 'error', mssg: 'Not Found', });
      }

    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
    }
  });



//get active category list:/admin/product/getCategorys
router.get('/getCategorys',
  verifyUser,
  async (req, res) => {
    try {

      let loginViewPermision = req.body.loginViewPermision;
      //check the login user have View permission
      if (loginViewPermision !== "Yes") {
        return res.status(200).json({ status: 'error', mssg: 'User does not have permission to view' });
      }

      const category = await Category.find({ active: "Yes" }, { _id: 1, category_name: 1 }).sort({ "category_name": 1 });
      res.status(200).json({ status: 'sucess', mssg: 'All Category fetch', data: category });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
    }
  });



// get active Sub_category list: /admin/product/getSubCategorys
router.post('/getSubCategorys',
  verifyUser,
  [
    // Validate the category_code parameter
    body('categoryCode')
      .notEmpty().withMessage('Category code is required!')
      .isMongoId().withMessage('Invalid category code value!')
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorsArray = errors.array();
        return res.status(200).json({ status: 'error', field: errorsArray[0].param, mssg: errorsArray[0].msg });
      }

      let loginViewPermision = req.body.loginViewPermision;
      let categoryCode = req.body.categoryCode;

      // Check the login user's view permission
      if (loginViewPermision !== "Yes") {
        return res.status(200).json({ status: 'error', mssg: 'User does not have permission to view' });
      }

      // Fetch subcategories based on the category code
      const subCategory = await sub_category.find({ active: "Yes", category_code: categoryCode }, { _id: 1, sub_category_name: 1 }).sort({ "sub_category_name": 1 });

      if (subCategory.length === 0) {
        return res.status(200).json({ status: 'error', mssg: 'Sub Category not found' });
      }
      res.status(200).json({ status: 'success', mssg: 'All Sub Category fetch', data: subCategory });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
    }
  });




// Get all unit: GET "/admin/unit/getAllUnit"
router.get('/getAllUnit',
  verifyUser,
  async (req, res) => {
    try {


      let loginViewPermision = req.body.loginViewPermision;
      //check the login user have View permission
      if (loginViewPermision !== "Yes") {
        return res.status(200).json({ status: 'error', mssg: 'User does not have permission to view' });
      }

      const units = await Unit.find({ active: "Yes" }, { _id0: 1, unit: 1 }).sort({ "unit": 1 });
      res.status(200).json({ status: 'sucess', mssg: 'All units fetch', data: units });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
    }
  });



//Get all productType :GET:/admin/unit/getProductTypes
router.get('/getProductTypes',
  verifyUser,
  async (req, res) => {
    try {


      let loginViewPermision = req.body.loginViewPermision;
      //check the login user have View permission
      if (loginViewPermision !== "Yes") {
        return res.status(200).json({ status: 'error', mssg: 'User does not have permission to view' });
      }

      // Use the ProductType model (assuming you've defined it) to find all active product types
      const ProductTypes = await productType.find({ active: "Yes" }, { _id: 1, product_type: 1 })
        .sort({ product_type: 1 });

      res.status(200).json({ status: 'success', message: 'All Product Types fetched', data: ProductTypes });
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  });



//Get all brands :GET:/admin/unit/getAllBrands
router.get('/getAllBrands', verifyUser, async (req, res) => {
  try {


    let loginViewPermision = req.body.loginViewPermision;
    //check the login user have View permission
    if (loginViewPermision !== "Yes") {
      return res.status(200).json({ status: 'error', mssg: 'User does not have permission to view' });
    }

    const brands = await brand.find({ active: "Yes" }, { _id: 1, brand_name: 1 }).sort({ brand_name: 1 });
    res.status(200).json({ status: 'success', mssg: 'All Brands fetched', data: brands });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
  }
});




// get all product details : /admin/product/getProductDetails
router.get('/getProductDetails',
  verifyUser,
  [
    // Validate the category_code parameter
    body('productCode')
      .notEmpty().withMessage('Product code is required!')
      .isMongoId().withMessage('Invalid Product code value!')
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorsArray = errors.array();
        return res.status(200).json({ status: 'error', field: errorsArray[0].param, mssg: errorsArray[0].msg });
      }

      let loginViewPermision = req.body.loginViewPermision;
      let productCode = req.body.productCode;

      // Check the login user's view permission
      if (loginViewPermision !== "Yes") {
        return res.status(200).json({ status: 'error', mssg: 'User does not have permission to view' });
      }

      // Fetch Products Details
      let productDetails = await product.aggregate([

        {
          $lookup:
          {
            from: "product_type_master",
            localField: "product_type_code",
            foreignField: "_id",
            as: 'product_type_master'
          }
        },

        {
          $lookup:
          {
            from: "category_master",
            localField: "category_code",
            foreignField: "_id",
            as: 'category_master'
          }
        },

        {
          $lookup:
          {
            from: "sub_category",
            localField: "sub_category_code",
            foreignField: "_id",
            as: 'sub_category'
          }
        },

        {
          $lookup:
          {
            from: "brand",
            localField: "brand_code",
            foreignField: "_id",
            as: 'Brand'
          }
        },

        {
          $match: { "_id": new mongoose.Types.ObjectId(productCode) }
        },

        { $sort: { entry_timestamp: -1 } },

        {
          $project: {
            "_id": 1,
            "product_name": 1,
            "description": 1,
            "highlight": 1,
            "meta_keywords": 1,
            "meta_description": 1,
            "product_link": 1,
            "product_image_1": 1,
            "product_image_2": 1,
            "product_type_code": 1,
            "product_type_master._id": 1,
            "product_type_master.product_type": 1,
            "category_code": 1,
            "category_master._id": 1,
            "category_master.category_name": 1,
            "sub_category_code": 1,
            "sub_category._id": 1,
            "sub_category.sub_category_name": 1,
            "Brand._id": 1,
            "Brand.brand_name": 1,
            "unit": 1,
            "buying_price": 1,
            "per_pcs_buying_price": 1,
            "mrp": 1,
            "discount_type": 1,
            "discount": 1,
            "selling_price": 1,
            "per_pcs_selling_price": 1,
            "active": 1,
          }
        },

      ]);

      if (productDetails) {
        return res.status(200).json({ status: 'success', mssg: 'Product Details Fetched Successfully', productDetails });
      }
      else {
        return res.status(200).json({ status: 'error', mssg: 'Not Found', });
      }

    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
    }
  });




module.exports = router;


//// Check if product images were uploaded and get filenames////
// const product_images_1_filename = req.files?.product_images_1?.[0]?.filename;
// const product_images_2_filename = req.files?.product_images_2?.[0]?.filename;

// // Update the product images if filenames are provided
// if (product_images_1_filename) {
//   updatedProduct.product_image_1 = "product_images/" + product_images_1_filename;
// }

// if (product_images_2_filename) {
//   updatedProduct.product_image_2 = "product_images/" + product_images_2_filename;
// }

// // Remove old images if new images are uploaded
// const existingImages = await product.findById(product_code);
// if (existingImages) {
//   const oldImage1 = existingImages.product_image_1;
//   const oldImage2 = existingImages.product_image_2;

//   if (oldImage1) {
//     fs.unlink('./uploads/' + oldImage1, err => {
//       if (err) console.error(err);
//       // Handle success or further processing here
//     });
//   }

//   if (oldImage2) {
//     fs.unlink('./uploads/' + oldImage2, err => {
//       if (err) console.error(err);
//       // Handle success or further processing here
//     });
//   }
// }

