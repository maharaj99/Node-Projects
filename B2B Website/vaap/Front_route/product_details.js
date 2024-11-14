// imports
const express = require('express');
const router = express.Router();
const Product = require('../model/product_master');
const systemapi = require('../model/systemConfigSchema');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');



//api:/prodetails/getproduct
  router.post('/getDetails',
  [
    body("product_link")
      .notEmpty()
      .withMessage("Product Link is required")

  ],
  async (req, res) =>
   {   
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
          const product_link = req.body.product_link;

            const productDetails = await Product.aggregate([
                {
                    $lookup: {
                        from: 'category_master',
                        localField: 'category_code',
                        foreignField: '_id',
                        as:'category'
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
                    $lookup: {
                        from: 'sub_product_master',
                        localField: '_id',
                        foreignField: 'product_code',
                        as: 'sub_product'
                    }
                },
                {
                    $match: { product_link: product_link } 
                    // Search by product name
                },
                {
                    $lookup: {
                        from: 'product_master',
                        localField: 'category_code',
                        foreignField: 'category_code',
                        as: 'related_products',
                        pipeline:[
                            {
                                $lookup: {
                                    from: 'category_master',
                                    localField: 'category_code',
                                    foreignField: '_id',
                                    as:'category'
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
                        ]
                    }
                },

                {
                    $project: {
                        "_id": 1,
                        "product_name": 1,
                        "description":1,
                        "highlight":1,
                        "meta_keywords":1,
                        "meta_description":1,
                        "product_image_1":1,
                        "product_image_2":1,
                        "product_link":1,
                        "mrp":1,
                        "selling_price":1,
                        "category._id":1,
                        "category.category_name":1,
                        "sub_category._id":1,
                        "sub_category.sub_category_name":1,
                        "Brand._id":1,
                        "Brand.brand_name":1,
                        "unit":1,
                        "unit_type":1,
                        "discount":1,
                        "sub_product._id":1, 
                        "sub_product.sub_product_name":1,
                        "sub_product.sub_product_image": 1,
                        "sub_product.unit": 1,
                        "sub_product.unit_type": 1,
                        "sub_product.per_box_pcs": 1,
                        "sub_product.buying_price": 1,
                        "sub_product.mrp": 1,
                        "sub_product.discount_type": 1,
                        "sub_product.discount": 1,
                        "sub_product.selling_price": 1,

                        "related_products": {
                        $map: {
                            input:{ 
                                $filter: {
                                input: "$related_products",
                                as: "related",
                                cond: {
                                    $ne: ["$$related.product_link", product_link]
                                }
                            }}, 
                            as: "related",
                            in: {
                                "_id": "$$related._id",
                                "product_name": "$$related.product_name",
                                "product_link":"$$related.product_link",
                                "selling_price":"$$related.selling_price",
                                "mrp":"$$related.mrp",
                                "product_images_1":"$$related.product_image_1",
                                "product_images_2":"$$related.product_image_2",
                                "discount":"$$related.discount",
                                "category":"$$related.category.category_name",
                                "Sub_category":"$$related.sub_category.sub_category_name",
                                "brand":"$$related.Brand.brand_name",


                                


                                }
                            },                        
                        }   
                          
                    }
                }
            ]);

            if (productDetails.length === 0) {
                return res.status(200).json({ status: 'error', mssg: 'Product not found' });
            }

            //geting system configaration 
            const ConfigData = await systemapi.find({}, {system_name:1});

            return res.status(200).json({ status: 'success', mssg: 'Product details fetched successfully', data:productDetails, systeminfo:ConfigData });

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 'error', mssg: 'Server Error' });
        }
});



module.exports = router;