// imports
const express = require('express');
const router = express.Router();
const sub_category = require('../model/subcategory_master');
const product=require('../model/product_master');
const { body, validationResult } = require('express-validator');
const verifyUser = require('../middleware/adminverifyuser');
const category = require('../model/category_master');
const mongoose = require('mongoose');




//..................................................................
// Route 1:Insert a new Sub category - POST method API: /admin/subcategory/insert
//..................................................................
router.post('/insert', verifyUser,[
    body('sub_category_name').notEmpty().withMessage('sub_category_name is required!'),
    body('active').notEmpty().withMessage('Active is required!').isIn(['Yes', 'No']).withMessage('Active should be either "Yes" or "No"!'),
    body('category_code').notEmpty().withMessage('category code is required!'),

  ], async (req, res) => {
  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
  } else {
      try {
        const {
        userCode,
        sub_category_name,
        category_code,
        active,
        loginEntryPermision
        } = req.body;

          //check the login user have entry permission
          if (loginEntryPermision !== "Yes") {
            return res.status(200).json({ status: 'error', mssg: 'User does not have permission to create ' });
          }

        // Check if a subcategory with the same name already exists
        const existingSubcategory = await sub_category.findOne({ sub_category_name });

        if (existingSubcategory) {
                return res.status(200).json({ status: 'error', field: 'sub_category_name', mssg: 'Sub category with the same name already exists!' });
        }
  
        const subcategory = await sub_category.create({

        sub_category_name: sub_category_name,
        category_code:category_code,
        active: active,
        entry_user_code:userCode

        });
  
        res.status(200).json({ status: 'success', mssg: 'Sub category created successfully', data: subcategory });
  
      } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'server error', mssg: 'Internal Server Error' });
      }
    }
  });


//.............................................
// Route 2:Get Sub Category details: GET "/admin/subcategory/subcategoryDetails"
//.............................................

router.get('/subcategoryDetails',verifyUser,  [

  body('sub_category_code')
    .notEmpty().withMessage('Sub category code ID is Empty !')
    .isMongoId().withMessage('Sub category code ID Value Is Invalid !'),

],

  async (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    }
    else {

  try {

    let loginViewPermision = req.body.loginViewPermision;
     //check the login user have View permission
     if (loginViewPermision !== "Yes") {
      return res.status(200).json({ status: 'error', mssg: 'User does not have permission to view' });
    }

      let sub_category_code=req.body.sub_category_code;

      const sub_categorys = await sub_category.aggregate([

          {
            $lookup: {
              from: 'category_master',
              localField: 'category_code',
              foreignField: '_id',
              as:'category_master'
          }
          },
          //its when i need to remove array
          // {
          //   $addFields: {
          //     category_master: { $arrayElemAt: ['$category_master', 0] },
          //   }
          // },
          {
            $match: {
                "_id": new mongoose.Types.ObjectId(sub_category_code)
            }
          },
          {
              $project: {
                  "_id": 1,
                  "sub_category_name": 1,
                  "active":1,
                  "category_master._id": 1,
                  "category_master.category_name":1,
                 
              }
          }

      ])
      if (sub_categorys.length === 0) {
          return res.status(200).json({ status: 'error', mssg: 'sub_categorys not found' });
      }
  
      return res.status(200).json({ status: 'success', mssg: 'sub_categorys details fetched successfully', data:sub_categorys });
  
  }  
  catch (error) {
    console.log(error);
    res.status(500).json({ status: 'server error', mssg: 'Internal Server Error' });
  }
}
});


//.................................................................
// Route 3:Get all Sub Category : GET "/admin/subcategory/subcategoryGet"
//.................................................................

  router.get('/subcategoryGet',verifyUser, async (req, res) => {
    try {
         
    let loginViewPermision = req.body.loginViewPermision;
    //check the login user have View permission
    if (loginViewPermision !== "Yes") {
     return res.status(200).json({ status: 'error', mssg: 'User does not have permission to view' });
   }

      const sub_categorys = await sub_category.aggregate([

        {
          $lookup: {
            from: 'category_master',
            localField: 'category_code',
            foreignField: '_id',
            as:'category_master'
        }
        },
        { $sort: { entry_date: -1 } },
        {
            $project: {
                "_id": 1,
                "sub_category_name": 1,
                "active":1,
                "category_master._id": 1,
                "category_master.category_name":1,
               
            }
        }

    ])
    if (sub_categorys.length === 0) {
        return res.status(200).json({ status: 'error', mssg: 'sub_categorys not found' });
    }

    return res.status(200).json({ status: 'success', mssg: 'all sub_categorys fetched successfully', data:sub_categorys });

}  
catch (error) {
  console.log(error);
  res.status(500).json({ status: 'server error', mssg: 'Internal Server Error' });
}

});



//............................................................
//Route 4: Delete a category by ID: DELETE "/admin/subcategory/deleteSubCategory"
//............................................................
router.post('/deleteSubCategory', verifyUser,[

  body('sub_category_code')
      .notEmpty().withMessage('sub category code ID is Empty !')
      .isMongoId().withMessage('sub category code ID Value Is Invalid !'),

], 

async (req, res) => {
  
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            const errorsArray = errors.array();
            return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
        }
        else {
  try {

        let loginDeletePermision = req.body.loginDeletePermision;
        //check the login user have View permission
        if (loginDeletePermision !== "Yes") {
        return res.status(200).json({ status: 'error', mssg: 'User does not have permission to Delete' });
      }
      
      const subcategoryId = req.body.sub_category_code;

      const subcategoryToDelete = await sub_category.findById(subcategoryId);
      if (!subcategoryToDelete) {
          return res.status(200).json({ status: 'error', mssg: 'sub Category not found' });
      }

      // const matchingProducts = await product.find({ subcategory_code: subcategoryId});
      // if (matchingProducts.length > 0) {
      //   return  res.status(200).json({ status: 'have_product', message: 'sub_Category cannot be deleted because it is associated with products' });
      // }

      const result = await sub_category.findByIdAndDelete(subcategoryId);
      if (result) {
          res.status(200).json({ status: 'success', mssg: 'sub category  deleted successfully' });
      } else {
          return res.status(200).json({ status: 'error', mssg: 'Failed to delete Sub category' });
      }
  } catch (error) {
      console.log(error.message);
      return res.status(500).json({ status: 'error', mssg: 'Internal server error' });  }
}
});



//..........................................................
// Route 5:Update an subcategory by ID: PATCH "/admin/subcategory/updateSubcategory"
//..........................................................
router.post('/updateSubcategory',
 verifyUser,
 [
  body('sub_category_code')
  .notEmpty().withMessage('Sub category ID is required!')
  .isMongoId().withMessage('sub category code ID Value Is Invalid !'),

  body('sub_category_name').notEmpty().withMessage('sub_category_name is required!'),
    body('active').notEmpty().withMessage('Active is required!').isIn(['Yes', 'No']).withMessage('Active should be either "Yes" or "No"!'),
  body('category_code').notEmpty().withMessage('category code is required!')
                      .isMongoId().withMessage('category code ID Value Is Invalid !'),


], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorsArray = errors.array();
    return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
} else {
    try {
      const subcategoryid = req.body.sub_category_code;
      const {
        userCode,
        sub_category_name,
        category_code,
        active,
        loginEditPermision
      } = req.body;

      //check the login user have View permission
      if (loginEditPermision !== "Yes") {
       return res.status(200).json({ status: 'error', mssg: 'User does not have permission to Edit' });
     }

      // Check if voucher_type already exists
       const existingSubcategory = await sub_category.findOne({
        _id: { $ne: subcategoryid },
        sub_category_name: sub_category_name,
       });

      if (existingSubcategory) {
               return res.status(200).json({ status: 'error', field: 'sub_category_name', mssg: 'Sub category with the same name already exists!' });
        }

      const updatedsubcategory = await sub_category.findByIdAndUpdate(subcategoryid, {
        sub_category_name: sub_category_name,
        category_code:category_code,
        active: active,
        entry_user_code:userCode
      }, { new: true });

      if (updatedsubcategory) {
        res.status(200).json({ status: 'success', mssg: 'Sub category updated successfully', data: updatedsubcategory });
      } else {
        res.status(200).send({ status: 'error', mssg:'Sub category id not found'});
      }

    } catch (error) {
      console.log(error.message);
      res.status(500).send({ status: 'error', mssg:'Internal Server Error'});
    }
  }
});


// //.............................................................
// // ROUTER 6 :  Get all category get method api :/admin/category/getAllCategory
// //................................................ .............

router.get('/getAllCategory',verifyUser, async (req, res) => {
  try {
    const Category = await category.find({ active: "Yes" }, { _id: 1, category_name: 1 });
    res.status(200).json({ status: 'sucess', mssg: 'All Category fetch', data: Category });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ status: 'error', mssg:'Internal Server Error'});  }
});
  

module.exports = router;

