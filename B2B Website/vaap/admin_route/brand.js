const express = require('express');
const router = express.Router();
const Brand = require('../model/Brand_master');
const product=require('../model/product_master');
const verifyUser = require('../middleware/adminverifyuser');
const { body, validationResult } = require('express-validator');


//..................................................................
// Route 1:Insert a new Brand - POST method API: /admin/brand/insert
//..................................................................

router.post('/insert', verifyUser, [
    body('brand_name').notEmpty().withMessage('Brand name is required!'),
    body('active').notEmpty().withMessage('Active is required!').isIn(['Yes', 'No']).withMessage('Active should be either "Yes" or "No"!')
  ], async (req, res) => {

  const errors = validationResult(req);
    
  if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({ status: 'error', field: errorsArray[0].param, mssg: errorsArray[0].msg });
    } else {
    try {
        const { userCode, brand_name, active,loginEntryPermision } = req.body;


        //check the login user have entry permission
        if (loginEntryPermision !== "Yes") {
          return res.status(200).json({ status: 'error', mssg: 'User does not have permission to create' });
        }


        // Check if a brand with the same name already exists
        const existingBrand = await Brand.findOne({ brand_name });
  
        if (existingBrand) {
          return res.status(200).json({ status: 'error', field: 'brand_name', mssg: 'Brand with the same name already exists!' });
        }
  
        const newBrand = await Brand.create({
          brand_name: brand_name,
          active: active,
          entry_user_code: userCode
        });
  
        res.status(200).json({ status: 'success', mssg: 'Brand created successfully', data: newBrand });
      } catch (error) {
        console.error(error.message);
        return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
      }
    }
  });

  

 //.................................................................
// Route 2:Get all Brand - get method API: /admin/brand/getAllBrands
//..................................................................

router.get('/getAllBrands', verifyUser, async (req, res) => {
    try {
        let loginViewPermision = req.body.loginViewPermision;
        //check the login user have View permission
        if (loginViewPermision !== "Yes") {
          return res.status(200).json({ status: 'error', mssg: 'User does not have permission to view' });
        }

        const brands = await Brand.find({}, { __v: 0, entry_user_code: 0, entry_date: 0 }).sort({ "entry_date": -1 });
        res.status(200).json({ status: 'success', mssg: 'All Brands fetched', data: brands });
      } catch (error) {
        console.error(error.message);
        return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
    }
  });

  

 //.................................................................
// Route 3:get a Brand details- POST method API: /admin/brand/getBrandDetails
//..................................................................  
router.post('/getBrandDetails', verifyUser, [
    body('brand_code')
      .notEmpty().withMessage('Brand code is empty!')
      .isMongoId().withMessage('Invalid brand code value!'),
  ], async (req, res) => {

  const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({ status: 'error', field: errorsArray[0].param, mssg: errorsArray[0].msg });
    } else {
    try {
          const { brand_code ,loginViewPermision} = req.body;

          //check the login user have View permission
          if (loginViewPermision !== "Yes") {
          return res.status(200).json({ status: 'error', mssg: 'User does not have permission to view' });
        }
  
          const brand = await Brand.findById(brand_code, { __v: 0, entry_user_code: 0, entry_date: 0 });
    
          if (brand) {
            res.status(200).json({ status: 'success', data: brand });
          } else {
            res.status(200).json({ status: 'error', mssg: 'Brand not found' });
          }
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
      }
    }
  });

  


 //.................................................................
// Route 4:Update a  Brand - POST method API: /admin/brand/update
//..................................................................  
router.post('/update', [
    body('brand_code')
    .notEmpty().withMessage('Brand code is empty!')
    .isMongoId().withMessage('Invalid brand code value!'),
        
    body('brand_name').notEmpty().withMessage('Brand name is required!'),
    body('active').notEmpty().withMessage('Active is required!').isIn(['Yes', 'No']).withMessage('Active should be either "Yes" or "No"!')
  ], async (req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({ status: 'error', field: errorsArray[0].param, mssg: errorsArray[0].msg });
    } else {
      try {
        const brandId = req.body.brand_code;
        const { 
                brand_name, 
                userCode,
                active , 
                loginEditPermision
              } = req.body;
          
                //check the login user have View permission
                if (loginEditPermision !== "Yes") {
                 return res.status(200).json({ status: 'error', mssg: 'User does not have permission to Edit' });
               }
        // Check if a brand with the same name already exists (excluding the current brand)
        const existingBrand = await Brand.findOne({
          _id: { $ne: brandId },
          brand_name: brand_name,
        });
  
        if (existingBrand) {
          return res.status(200).json({ status: 'error', field: 'brand_name', mssg: 'Brand with the same name already exists!' });
        }
  
        const updatedBrand = await Brand.findByIdAndUpdate(brandId, {
          brand_name: brand_name,
          entry_user_code:userCode,
          active: active
        }, { new: true });
  
        if (updatedBrand) {
          res.status(200).json({ status: 'success', mssg: 'Brand updated successfully', data: updatedBrand });
        } else {
          res.status(200).json({ status: 'error', mssg: 'Brand not found' });
        }
      } catch (error) {
        console.error(error.message);
        return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
      }
    }
  });
  





 //.................................................................
// Route 5:Delete a Brand - POST method API: /admin/brand/delete
//.................................................................. 
router.post('/delete', verifyUser, [
    body('brand_code')
      .notEmpty().withMessage('Brand code is empty!')
      .isMongoId().withMessage('Invalid brand code value!'),
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

          const brandId = req.body.brand_code;
    
          // Check if the brand to be deleted exists
          const brandToDelete = await Brand.findById(brandId);
          
          if (!brandToDelete) {
            return res.status(200).json({ status: 'error', mssg: 'Brand not found' });
          }
    
          // You can add additional checks here, such as ensuring that there are no associated products
    
          const result = await Brand.findByIdAndDelete(brandId);
    
          if (result) {
            res.status(200).json({ status: 'success', mssg: 'Brand deleted successfully' });
          } else {
            return res.status(200).json({ status: 'error', mssg: 'Failed to delete brand' });
          }
      } catch (error) {
        console.error(error.message);
        return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
      }
    }
  });
  



module.exports = router;