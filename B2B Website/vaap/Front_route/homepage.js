// imports
const express = require('express');
const router = express.Router();
const slider = require('../model/homeSliderSchema');
const Product_types = require('../model/product_type_master');
const client_testimonial = require("../model/client_testimonial");


// Get all Slider in Front page : GET:"/front/homePage/getslider"
router.get('/getslider', async (req, res) => {
  try {
    const Sliders = await slider.find({ active: "Yes" }, { __v: 0, order_no: 0, active: 0 }).sort({ "order_no": 1 });
    //.limit(1).skip(4).
    res.status(200).json({ status: 'sucess', mssg: 'Slider details fetch', data: Sliders });
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
})


//Get product_type: GET:"/front/homePage/productTypeGet"
router.get('/productTypeGet', async (req, res) => {

  try {

    const Products = await Product_types.aggregate([

      {
        $lookup: {
          from: 'product_master',
          localField: '_id',
          foreignField: 'product_type_code',
          as: 'product_master',
          pipeline: [
            {
              $lookup:
              {
                from: 'category_master',
                localField: 'category_code',
                foreignField: '_id',
                as: 'category'
              }
            },
            {
              $lookup:
              {
                from: 'sub_category',
                localField: 'sub_category_code',
                foreignField: '_id',
                as: 'subCategory'
              }
            },
            {
              $lookup:
              {
                from: 'brand',
                localField: 'brand_code',
                foreignField: '_id',
                as: 'Brand'
              }
            },
            {
              $lookup:
              {
                from: 'sub_product_master',
                localField: '_id',
                foreignField: 'product_code',
                as: 'sub_product_master'
              }
            },

            {
              $match: { active: 'Yes', "sub_product_master.active": "Yes" } // Filter active products
            },

            {
              $project: {
                "_id": 1,
                "product_link": 1,
                "product_name": 1,
                "product_image_1": 1,
                "product_image_2": 1,
                "unit": 1,
                "unit_type": 1,
                "mrp": 1,
                "selling_price": 1,
                "active": 1,
                "category.category_name": 1,
                "Brand.brand_name": 1,
                "subCategory.sub_category_name": 1,
                "totalSubProduct": {
                  $size: '$sub_product_master',
                },
              },
            },

          ]
        }
      },
      {
        $match: { active: 'Yes', show_home_page: "Yes", "product_master.active": "Yes" }
      },
      {
        $project: {
          "_id": 1,
          "product_type": 1,
          "product_master._id": 1,
          "product_master.product_link": 1,
          "product_master.product_name": 1,
          "product_master.product_image_1": 1,
          "product_master.product_image_2": 1,
          "product_master.unit": 1,
          "product_master.unit_type": 1,
          "product_master.mrp": 1,
          "product_master.selling_price": 1,
          "product_master.category.category_name": 1,
          "product_master.Brand.brand_name": 1,
          "product_master.subCategory.sub_category_name": 1,
          "product_master.totalSubProduct": 1,
        },
      },

    ])
    if (Products.length === 0) {
      return res.status(200).json({ status: 'error', mssg: 'Products not found' });
    }

    return res.status(200).json({ status: 'success', mssg: 'all Products fetched successfully', data: Products });

  }
  catch (error) {
    console.log(error);
    res.status(500).json({ status: 'server error', mssg: 'Internal Server Error' });
  }

});



//get client testomonial| GET:"/front/homePage/getClientTestimonialList"
router.get("/getClientTestimonialList", async (req, res) => {
  try {

    const result = await client_testimonial.find({ active: "Yes" }, { __v: 0, entry_user_code: 0, entry_timestamp: 0, order_no: 0, active: 0 }).sort({ "order_no": 1 });

    if (result) {
      res
        .status(200)
        .json({
          status: "success",
          mssg: "Client Testimonial List Fetched Successfully",
          result: result,
        });
    } else {
      res.status(200).json({ status: "error", mssg: "Not Found" });
    }
  } catch (error) {
    console.log(error.mssg);
    res.status(500).json({ status: "error", mssg: "Server Error" });
  }
});



module.exports = router;