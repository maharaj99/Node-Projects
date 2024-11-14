const express = require("express");
const router = express.Router();
const settings = require("../model/SettingsSchema");
const { body, validationResult } = require("express-validator");
const verifyUser = require("../middleware/adminverifyuser");


//.............................................................
// ROUTER 1:  Settings post method api :/admin/setting/add
//.............................................................

router.post('/add',
  verifyUser,
  [
    // Add validation rules using express-validator
    body('minimum_order_amount')
      .notEmpty().withMessage('minimum_order_amount is required'),
 

  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const errorsArray = errors.array();
        return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    } 

    try {
        const {
          userCode,
          minimum_order_amount,
          loginEntryPermision,
          loginEditPermision
        } = req.body;
        
        
       //check the login user have View permission
       if (loginEditPermision !== "Yes") {
        return res.status(200).json({ status: 'error', mssg: 'User does not have permission to Edit' });
      }
    

      // Check if a record exists
      const existingRecord = await settings.findOne();

      if (existingRecord) {
        // Update the existing record
        
        const updateData = {
          minimum_order_amount:minimum_order_amount,
          entry_user_code:userCode
        };

        await settings.findByIdAndUpdate(existingRecord._id, updateData);

        return res.status(200).json({ status: 'success', mssg: 'Data Updated Successfully', id: existingRecord._id });
      }

      //when first time data entry;
      else {

       //check the login user have entry permission
       if (loginEntryPermision !== "Yes") {
        return res.status(200).json({ status: 'error', mssg: 'User does not have permission to create ' });
      }


        const newRecord = await settings.create({

          minimum_order_amount:minimum_order_amount,
          entry_user_code:userCode

        });

        return res.status(200).json({ status: 'success', mssg: 'Data Inserted Successfully', id: newRecord._id });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }
});



//.............................................................
// ROUTER 2:  Setting get method api :/admin/setting/getSettingList
//.............................................................
router.get("/getSettingList", verifyUser, async (req, res) => {
  try {
    const { loginViewPermision } = req.body;
    //check the login user have entry permission
    if (loginViewPermision !== "Yes") {
      return res.status(200).json({
        status: "error",
        mssg: "User does not have permission to View",
      });
    }
    const result = await settings.find(
      {},
      { __v: 0, entry_user_code: 0, entry_timestamp: 0 }
    ).sort({ entry_timestamp: -1 });

    if (result) {
      res.status(200).json({
        status: "success",
        mssg: "Setting List Fetched Successfully",
        data: result,
      });
    } else {
      res.status(200).json({ status: "error", mssg: "Not Found" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ status: "error", mssg: "Server Error" });
  }
});




module.exports = router;
