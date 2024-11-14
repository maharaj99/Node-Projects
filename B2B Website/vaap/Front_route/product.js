//imports
const express = require('express');
const products = require('../model/product_master');
const router = express.Router();
const mongoose = require('mongoose');
const category = require('../model/category_master');
const sub_category = require('../model/subcategory_master');
const { body, validationResult } = require('express-validator');





//............................................
//get product in api:|post:/front/product/getAllProduct
//.............................................

router.post('/getAllProduct', async (req, res) => {
  try {
    const skip = parseInt(req.body.skip) || 0;

    const limit = 50;

    //sort
    let sortOptions = {};

    if (req.body.sort === 'A to Z') {
      sortOptions.product_name = 1; // Ascending order for product_name
    } else if (req.body.sort === 'Z to A') {
      sortOptions.product_name = -1; // Descending order for product_name
    } else if (req.body.sort === 'low to high') {
      sortOptions.selling_price = 1; // Low to high for selling_price
    } else if (req.body.sort === 'high to low') {
      sortOptions.selling_price = -1; // High to low for selling_price
    } else {
      // Default sorting (e.g., if no valid sorting option provided)
      sortOptions.product_name = 1; // Ascending order for product_name
    }


    //search
    const { searchTerm } = req.body;


    const allProduct = await products.aggregate([
      {
        $lookup: {
          from: 'category_master',
          localField: 'category_code',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $lookup: {
          from: 'sub_category',
          localField: 'sub_category_code',
          foreignField: '_id',
          as: 'sub_category'
        }
      },
      {
        $lookup: {
          from: 'brand',
          localField: 'brand_code',
          foreignField: '_id',
          as: 'Brand'
        }
      },
      // {
      //   $addFields: {
      //     category: { $arrayElemAt: ['$category', 0] },
      //     sub_category: { $arrayElemAt: ['$sub_category', 0] },
      //     Brand: { $arrayElemAt: ['$Brand', 0] },
      //     Unit: { $arrayElemAt: ['$Unit', 0] }

      //   }
      // },
      {
        $skip: skip // Add a $skip stage to skip records
      },
      {
        $limit: limit // Add a $limit stage to limit the number of records
      },
      {
        $sort: sortOptions,
      },
      {
        $match: {
          "active": "Yes",
          $or: [
            { 'product_name': { $regex: new RegExp(searchTerm, 'i') } },
            // { 'category.category_name': { $regex: new RegExp(searchTerm, 'i') } },
            // { 'sub_category.sub_category_name': { $regex: new RegExp(searchTerm, 'i') } },
            // { 'Brand.brand_name': { $regex: new RegExp(searchTerm, 'i') } },
          ],
        }
      },
      {
        $project: {

          "_id": 1,
          "product_name": 1,
          "description": 1,
          "product_image_1": 1,
          "product_image_2": 1,
          "product_link": 1,
          "buying_price": 1,
          "mrp": 1,
          "selling_price": 1,
          "category._id": 1,
          "category.category_name": 1,
          "sub_category._id": 1,
          "sub_category.sub_category_name": 1,
          "Brand._id": 1,
          "Brand.brand_name": 1,
          "unit": 1,
          "unit_type": 1,
          "discount": 1,

        }
      },

    ])

    //get the number of all product
    const Products = await products.find({
      $or: [
        { product_name: { $regex: new RegExp(searchTerm, 'i') } },
      ],

    }, {});
    const numberOfProduct = Products.length;


    return res.status(200).json({ status: 'success', mssg: 'All product fetched successfully', product_count: numberOfProduct, data: allProduct });

  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 'error', mssg: 'Server Error' });
  }
});


//=======================================
//get product list by category code
//=======================================

router.post('/category/getProduct',
  [
    body('category_code')
      .notEmpty().withMessage('category code is empty!')
      .isMongoId().withMessage('category code value!'),
  ],

  async (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    }
    else {

      try {
        const categoryCode = req.body.category_code

        const skip = parseInt(req.body.skip) || 0;;

        const limit = 50;

        let sortOptions = {};

        if (req.body.sort === 'A to Z') {
          sortOptions.product_name = 1; // Ascending order for product_name
        } else if (req.body.sort === 'Z to A') {
          sortOptions.product_name = -1; // Descending order for product_name
        } else if (req.body.sort === 'low to high') {
          sortOptions.selling_price = 1; // Low to high for selling_price
        } else if (req.body.sort === 'high to low') {
          sortOptions.selling_price = -1; // High to low for selling_price
        } else {
          // Default sorting (e.g., if no valid sorting option provided)
          sortOptions.product_name = 1; // Ascending order for product_name
        }

        const allProduct = await products.aggregate([
          {
            $lookup: {
              from: 'category_master',
              localField: 'category_code',
              foreignField: '_id',
              as: 'category'
            }
          },
          {
            $lookup: {
              from: 'sub_category',
              localField: 'sub_category_code',
              foreignField: '_id',
              as: 'sub_category'
            }
          },
          {
            $lookup: {
              from: 'brand',
              localField: 'brand_code',
              foreignField: '_id',
              as: 'Brand'
            }
          },
          {
            $skip: skip
            // Add a $skip stage to skip records
          },
          {
            $limit: limit
            // Add a $limit stage to limit the number of records
          },
          {
            $sort: sortOptions,
          },
          {
            $match: {
              "category_code": new mongoose.Types.ObjectId(categoryCode),
              "active": "Yes"
            }
          },
          {
            $project: {

              "_id": 1,
              "product_name": 1,
              "description": 1,
              "product_image_1": 1,
              "product_image_2": 1,
              "product_link": 1,
              "buying_price": 1,
              "mrp": 1,
              "selling_price": 1,
              "category._id": 1,
              "category.category_name": 1,
              "sub_category._id": 1,
              "sub_category.sub_category_name": 1,
              "Brand._id": 1,
              "Brand.brand_name": 1,
              "unit": 1,
              "unit_type": 1,
              "discount": 1,

            }
          },

        ])

        const Category = await category.find({ _id: categoryCode }, { _id: 1, category_name: 1 });

        //get the number of all product
        const Products = await products.find({ category_code: categoryCode }, {});
        const numberOfProduct = Products.length;


        return res.status(200).json({
          status: 'success', mssg: 'All product fetched successfully',
          Product_count: numberOfProduct, category: Category, product: allProduct
        });

      } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'error', mssg: 'Server Error' });
      }
    }
  });



//=======================================
//get product list by category code & sub_category code
//=======================================
router.post('/category/sub/getProduct',
  [
    body('category_code')
      .notEmpty().withMessage('category code is empty!')
      .isMongoId().withMessage('category code value!'),

    body('sub_category_code')
      .notEmpty().withMessage('Sub category code is empty!')
      .isMongoId().withMessage('category code value!'),
  ],

  async (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    }
    else {

      try {
        const categoryCode = req.body.category_code
        const subcategory_code = req.body.sub_category_code

        const skip = parseInt(req.body.skip) || 0;;

        const limit = 50;

        let sortOptions = {};

        if (req.body.sort === 'A to Z') {
          sortOptions.product_name = 1; // Ascending order for product_name
        } else if (req.body.sort === 'Z to A') {
          sortOptions.product_name = -1; // Descending order for product_name
        } else if (req.body.sort === 'low to high') {
          sortOptions.selling_price = 1; // Low to high for selling_price
        } else if (req.body.sort === 'high to low') {
          sortOptions.selling_price = -1; // High to low for selling_price
        } else {
          // Default sorting (e.g., if no valid sorting option provided)
          sortOptions.product_name = 1; // Ascending order for product_name
        }

        const allProduct = await products.aggregate([
          {
            $lookup: {
              from: 'category_master',
              localField: 'category_code',
              foreignField: '_id',
              as: 'category'
            }
          },
          {
            $lookup: {
              from: 'sub_category',
              localField: 'sub_category_code',
              foreignField: '_id',
              as: 'sub_category'
            }
          },
          {
            $lookup: {
              from: 'brand',
              localField: 'brand_code',
              foreignField: '_id',
              as: 'Brand'
            }
          },
          {
            $skip: skip
            // Add a $skip stage to skip records
          },
          {
            $limit: limit
            // Add a $limit stage to limit the number of records
          },
          {
            $sort: sortOptions,
          },
          {
            $match: {
              "category_code": new mongoose.Types.ObjectId(categoryCode),
              "sub_category_code": new mongoose.Types.ObjectId(subcategory_code),
              "active": "Yes"
            }
          },
          {
            $project: {

              "_id": 1,
              "product_name": 1,
              "description": 1,
              "product_image_1": 1,
              "product_image_2": 1,
              "product_link": 1,
              "buying_price": 1,
              "mrp": 1,
              "selling_price": 1,
              "category._id": 1,
              "category.category_name": 1,
              "sub_category._id": 1,
              "sub_category.sub_category_name": 1,
              "Brand._id": 1,
              "Brand.brand_name": 1,
              "unit": 1,
              "unit_type": 1,
              "discount": 1,

            }
          },

        ])

        const Category = await category.find({ _id: categoryCode }, { _id: 1, category_name: 1 });

        const SubCategory = await sub_category.find({ _id: subcategory_code }, { _id: 1, sub_category_name: 1 });


        //get the number of all product
        const Products = await products.find({ category_code: categoryCode, sub_category_code: subcategory_code }, {});
        const numberOfProduct = Products.length;

        return res.status(200).json({
          status: 'success', mssg: 'All product fetched successfully', product_count: numberOfProduct,
          category: Category, sub_category: SubCategory, product: allProduct
        });

      } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'error', mssg: 'Server Error' });
      }
    }
  });


module.exports = router;