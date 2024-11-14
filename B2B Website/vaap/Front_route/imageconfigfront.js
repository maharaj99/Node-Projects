const express = require('express');
const router = express.Router();
const imageapi = require('../model/imageConfigSchema');




  // http://localhost:5001/imageapi/front/get
  router.get('/front/get', async (req, res) => {
    try {
      const Data = await imageapi.find({}, {_id:0 ,__v: 0});
      // res.send(compdetails);
      res.status(200).json({ status: 'sucess', mssg: 'Image details fetch', UserData: Data });
    } catch (error) {
      console.log(error.message);
      res.status(500).send('Internal Server Error');
    }
  });

  module.exports = router;