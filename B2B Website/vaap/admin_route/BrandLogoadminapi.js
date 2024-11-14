const express = require('express');
const router = express.Router();
const brandapi = require('../model/brandlogoSchema');
const Brandapi = require('../middleware/uploadfiles');


// API endpoint to insert a new product
// http://localhost:5001/brandlogo/admin/add
router.post('/admin/add',
  Brandapi.brand,
  async (req, res) => {
    try {

        const  {filename} = req.file;
        let image=filename
    //   let image=(req.file.filename);
  

      //save data in mongo 
      brandapi.create
        ({
          brand_image:"image_logo/"+image,

        })

        .then(brandapi => {
          return res.status(200).json({ status: 'success', mssg: 'Brand Logo Saved Successfully', id: brandapi.id });
        })
        .catch(err => {
          console.log(err)
          return res.status(500).json({ status: 'error', mssg: err.message });
        })
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }
  });


// Get all user details: GET:"http://localhost:5001/brandlogoget/admin/get
router.get('/admin/get', async (req, res) => {
    try {
      const BrandData = await brandapi.find({}, {_id:0 ,__v: 0});
      // res.send(compdetails);
      res.status(200).json({ status: 'sucess', mssg: 'Brand details fetch', UserData: BrandData });
    } catch (error) {
      console.log(error.message);
      res.status(500).send('Internal Server Error');
    }
  });


  // Delete a category by ID: DELETE "http://localhost:5001/brandlogogdel/admin/del
router.post('/admin/del', async (req, res) => {
    try {
      const brandId = req.body.id;
      if (!brandId) {
        return res.status(400).json({ status: 'error', message: 'ID is required' })
      } 
      //findByIdAndDelete(categoryId);
  
      const result = await brandapi.findByIdAndDelete(brandId);
      if (result) {
        res.send('Brang Logo deleted successfully');
      } else {
        res.status(404).send('Brand Logo not found');
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).send('Internal Server Error');
    }
  });


//route for updating an existing sysconfig api:/http://localhost:5001/brandlogo/admin/update
router.post('/admin/update', 
Brandapi.brand, async (req, res) => {


    try {
      const brandiId = req.body.id;

        const  {filename} = req.file;
        let image1=filename

      const updatedbrand = await brandapi.findByIdAndUpdate(brandiId, {
        image:"image_logo/"+image1
      }, { new: true });

      if (updatedbrand) {
        res.status(200).json({ status: 'success', message: 'Brand Logo updated successfully', data: updatedbrand });
      } else {
        res.status(404).send('Brand Logo id not found');
      }

    } catch (error) {
      console.log(error.message);
      res.status(500).send('Internal Server Error');
    }
  
});


module.exports = router;

