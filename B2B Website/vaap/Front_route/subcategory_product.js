const express = require('express');
const router = express.Router();
const Product = require('../model/product_master');



//...................................................................
//Get those all product which under provided sub_category Post:/subcategory/product/get
//....................................................................

router.post('/product/get', async (req, res) => {
    try {
        const { sub_category_id } = req.body;

        if (!sub_category_id) {
            return res.status(400).json({ status: 'error', message: 'sub_category_id is required in the request body' });
        }

        const products = await Product.find({ subcategory_code: sub_category_id }).select('product_name').select('product_images_1').select('product_images_2').select('mrp').select('seling_price').select('discount');

        if (products.length === 0) {
            return res.status(200).json({ status: 'error', message: 'No products found for the provided sub-category ID' });
        }

        res.status(200).json({ status: 'success', message: 'Related products fetched', data: products });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
