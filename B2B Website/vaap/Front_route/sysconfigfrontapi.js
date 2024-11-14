// imports
const express = require('express');
const router = express.Router();
const sysapi = require('../model/systemConfigSchema');


// Get all user details: GET:"http://localhost:5001/sysapiget/front/get"
router.get('/front/get', async (req, res) => {
    try {
      const ConfigData = await sysapi.find({}, {_id:0 ,__v: 0});
      // res.send(compdetails);
      res.status(200).json({ status: 'sucess', mssg: 'System Configuration data fetch', UserData: ConfigData });
    } catch (error) {
      console.log(error.message);
      res.status(500).send('Internal Server Error');
    }
  });
  module.exports = router;
