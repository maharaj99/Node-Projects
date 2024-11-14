const express = require("express");
const router = express.Router();
const addtocartapi = require("../model/addtocartSchema");
const { default: mongoose } = require("mongoose");


// Get all user details: GET:"http://localhost:5001/addtocartget/admin/get
router.get("/admin/get", async (req, res) => {
    try {
      const { user_code } = req.body;
  
      if (!user_code) {
        return res
          .status(400)
          .json({ status: "error", message: "ID is required" });
      }
      const FlavorDetails = await addtocartapi.aggregate([
        {
          $match: {
            user_code: new mongoose.Types.ObjectId(user_code),
  
          }, // Search by id
        },
        {
          $lookup: {
            from: "Flavor",
            localField: "flavor_code",
            foreignField: "_id",
            as: "Flavors",
          },
        },
        { 
          $project: {
            _id: 1,
            Flavors:{
              _id:1,
              flavor_name:1,
              image:1,
              mrp:1,
              seling_price:1
            },
          },
        },
      ]);
   //   console.log(FlavorDetails.length);
  
      if (FlavorDetails.length === 0) {
        return res
          .status(404)
          .json({ status: "error", mssg: "Flavor Details not found" });
      }
  
      return res
        .status(200)
        .json({
          status: "success",
          mssg: "Flavor Details fetched successfully",
          data: FlavorDetails,
        });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error", mssg: "Server Error" });
    }
  });

  module.exports = router;