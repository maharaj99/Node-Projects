//imports
const express = require('express');
const router = express.Router();
// const Registration = require('../model/customer_user_master');
const { body, validationResult } = require('express-validator');
const verifyUser = require('../middleware/customerverifyuser');




//.............................................................
// ROUTER :  Get user get method api :/customer/logged/details/get
//..............................................................

router.get('/logged/details/get',verifyUser, async (req, res) => {
  try {
    let userId = req.body.userCode;

    const Users = await Registration.find({_id: userId}, {_id:0 ,__v: 0});

    res.status(200).json({ status: 'sucess', mssg: 'User details fetch', data: Users });
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;