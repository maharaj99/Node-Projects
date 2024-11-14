// imports
const express = require('express');
const router = express.Router();
const category = require('../model/category_master');
const product = require('../model/product_master');
const { body, validationResult } = require('express-validator');
const verifyUser = require('../middleware/adminverifyuser');
const mongoose = require('mongoose');




//.............................................................
// ROUTER 1 : Create a category by post method api :/category/insert
//................................................ .............
router.post('/insert', verifyUser,
  [
    body('category_name').notEmpty().withMessage('category_name is required!'),
    body('tax_type').notEmpty().withMessage('tax_type is required!').isIn(["Percentage", "Flat", 'null']).withMessage('Active should be either "Percentage","Flat","null"!'),
    body('active').notEmpty().withMessage('Active is required!').isIn(['Yes', 'No']).withMessage('Active should be either "Yes" or "No"!')

  ], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    } else {
      try 
      {
        const {
          userCode,
          category_name,
          tax_type,
          active,
          loginEntryPermision
        } = req.body;

           //check the login user have entry permission
           if (loginEntryPermision !== "Yes") {
            return res.status(200).json({ status: 'error', mssg: 'User does not have permission to create ' });
          }

        // Check if a subcategory with the same name already exists
        const existingcategory = await category.findOne({ category_name });

          if (existingcategory) {
              return res.status(200).json({ status: 'error', field: 'category_name', mssg: 'category with the same name already exists!' });
          }
      

        const newcategory = await category.create({
          category_name: category_name,
          tax_type: tax_type,
          active: active,
          entry_user_code: userCode
        });

        res.status(200).json({ status: 'success', mssg: 'Category created successfully', data: newcategory });

      } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'server error', mssg: 'Internal Server Error' });
      }
    }
  });


//.............................................................
// ROUTER 2 :  Get all category get method api :/category/getCategorys
//................................................ .............
router.get('/getCategorys', verifyUser, async (req, res) => {
  try 
  {
    let loginViewPermision = req.body.loginViewPermision;
      //check the login user have View permission
      if (loginViewPermision !== "Yes") {
      return res.status(200).json({ status: 'error', mssg: 'User does not have permission to view' });
    }
      const Category = await category.find({}, { __v: 0,entry_user_code:0,entry_date:0 }).sort({ "entry_date": -1 });
      res.status(200).json({ status: 'sucess', mssg: 'All Category fetch', data: Category });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ status: 'error', mssg: 'Internal server error' });  }
});




// //.............................................................
// // ROUTER 3 :  Get specific user details post method api :/admin/user/getUserDetails
// //................................................ .............
// router.get('/downget', async (req, res) => {
//   try {
//     const Category = await category.find({}, { _id: 1, category_name: 1 });
//     res.status(200).json({ status: 'sucess', mssg: 'All Category fetch', data: Category });
//   } catch (error) {
//     console.log(error.message);
//     res.status(500).send('Internal Server Error');
//   }
// });





//..........................................................................
// ROUTER 3 :Get details for specific Category:Get "/category/getCategoryDetails"
//..........................................................................
router.post('/getCategoryDetails', verifyUser, [
  body('category_code')
    .notEmpty().withMessage('Category code is empty!')
    .isMongoId().withMessage('Invalid category code value!'),
],
async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorsArray = errors.array();
    return res.status(200).json({ status: 'error', field: errorsArray[0].param, mssg: errorsArray[0].msg });
  } else {
  try {
        const { category_code,loginViewPermision } = req.body; 

        //check the login user have View permission
        if (loginViewPermision !== "Yes") {
         return res.status(200).json({ status: 'error', mssg: 'User does not have permission to view' });
       }
 

        const Category = await category.find({_id:category_code }, {__v:0,entry_user_code:0,entry_date:0});

        if (Category) {
          // Category details found, send a success response
          return res.status(200).json({ status: 'success', data: Category });
        } else {
          // Category not found, send an error response
          return res.status(200).json({ status: 'error', mssg: 'Category not found' });
        }
      
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
    }
  }
});





//.............................................................
// ROUTER 4 :  Delete specific category details post method api :/category/delete
//................................................ .............
router.post('/delete', verifyUser, [

  body('category_code')
    .notEmpty().withMessage('category code ID is Empty !')
    .isMongoId().withMessage('category code ID Value Is Invalid !'),

],

  async (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    }
    else {
      try {
        const categoryId = req.body.category_code;

        let loginDeletePermision = req.body.loginDeletePermision;
        //check the login user have View permission
        if (loginDeletePermision !== "Yes") {
         return res.status(200).json({ status: 'error', mssg: 'User does not have permission to Delete' });
       }
    

        const categoryToDelete = await category.findById(categoryId);
        if (!categoryToDelete) {
          return res.status(200).json({ status: 'error', mssg: 'Category not found' });
        }

        // const matchingProducts = await product.find({ category_code: categoryId});
        // if (matchingProducts.length > 0) {
        //     return  res.status(200).json({ status: 'have_product', message: 'Category cannot be deleted because it is associated with products' });
        // }

        const result = await category.findByIdAndDelete(categoryId);
        if (result) {
          res.status(200).json({ status: 'success', mssg: 'Category deleted successfully' });
        } else {
          return res.status(200).json({ status: 'error', mssg: 'Failed to delete category' });
        }
      } catch (error) {
        console.log(error.message);
        return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
      }
    }
  });



//.............................................................
// ROUTER 5 :  Update specific category details post method api :/admin/category/update
//................................................ .............
router.post('/update', verifyUser,[
  body('category_code').notEmpty().withMessage('category code is required!'),
  body('category_name').notEmpty().withMessage('category_name is required!'),
  body('tax_type').notEmpty().withMessage('tax_type is required!').isIn(["Percentage", "Flat", "null"]).withMessage('Active should be either "Percentage","Flat","null"!'),
  body('active').notEmpty().withMessage('Active is required!').isIn(['Yes', 'No']).withMessage('Active should be either "Yes" or "No"!')
], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorsArray = errors.array();
    return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
  } else {
try {
      const categoryId = req.body.category_code;

      const {
        userCode,
        category_name,
        tax_type,
        active,
        loginEditPermision
      } = req.body;

      //check the login user have View permission
      if (loginEditPermision !== "Yes") {
       return res.status(200).json({ status: 'error', mssg: 'User does not have permission to Edit' });
     }

        // Check if category same name in other _id already exists
        const existingcategory = await category.findOne({
          _id: { $ne: categoryId },
          category_name: category_name,
         });
  
        if (existingcategory) {
                 return res.status(200).json({ status: 'error', field: 'category_name', mssg: 'category with the same name already exists!' });
          }

      const updatedcategory = await category.findByIdAndUpdate(categoryId, {
        category_name: category_name,
        tax_type: tax_type,
        active: active,
        entry_user_code: userCode
      }, { new: true });

      if (updatedcategory) {
        res.status(200).json({ status: 'success', mssg: 'category updated successfully', data: updatedcategory });
      } else {
        res.status(200).send({ status: 'error', mssg:'category id not found'});
      }

    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
    }
  }
});

module.exports = router;
