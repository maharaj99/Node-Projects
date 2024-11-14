const express = require('express');
const router = express.Router();
const Product = require('../model/product_master');
const { body, validationResult } = require('express-validator');

//.......................
// Search Products API:Post:/search/searchProducts
//.......................
router.post('/searchProducts', [
  body('searchTerm').notEmpty().isString().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { searchTerm } = req.body;

    const products = await Product.aggregate([
        
      {
        $lookup: {
          from: 'category',
          localField: 'category_code',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $lookup: {
          from: 'sub_category',
          localField: 'subcategory_code',
          foreignField: '_id',
          as: 'subcategory',
        },
      },
      {
        $lookup: {
          from: 'Brand',
          localField: 'brand_code',
          foreignField: '_id',
          as: 'brand',
        },
      },
      {
        $match: {
          $or: [
            { 'product_name': { $regex: new RegExp(searchTerm, 'i') } },
            { 'category.category_name': { $regex: new RegExp(searchTerm, 'i') } },
            { 'subcategory.sub_category_name': { $regex: new RegExp(searchTerm, 'i') } },
            { 'brand.brand_name': { $regex: new RegExp(searchTerm, 'i') } },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          product_name: 1,
          product_images_1: 1,
          sale_price: 1,
          'category.category_name': 1,
          'subcategory.sub_category_name': 1,
          'brand.brand_name': 1,
        },
      },
    ]).limit(10); // Adjust the limit as needed

    res.json({ products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports=router; 


