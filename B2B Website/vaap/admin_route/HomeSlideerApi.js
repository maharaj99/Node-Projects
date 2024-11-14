const express = require("express");
const router = express.Router();
const homeSlider = require("../model/homeSliderSchema");
const { body, validationResult } = require("express-validator");
const verifyUser = require("../middleware/adminverifyuser");
const imageSlider = require("../middleware/admin_uploadfiles");

//.............................................................
// ROUTER 1:  Home Slider post method api :/admin/homeSlider/add
//.............................................................
router.post(
  "/add",
  verifyUser,
  imageSlider.SliderImage,
  [
    //  Add validation rules using express-validator
    body("text").notEmpty().withMessage("Text is required"),
    body("link").notEmpty().withMessage("Link is required"),
    body("active")
      .notEmpty()
      .withMessage("Active Status is required!")
      .isIn(["Yes", "No"])
      .withMessage('Active Status should be either "Yes" or "No"!'),
    body("order_num").notEmpty().withMessage("Order Number is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({
        status: "error",
        field: errorsArray[0]["path"],
        mssg: errorsArray[0]["msg"],
      });
    }
    try {
      let { text, link, active, order_num, userCode, loginEntryPermision } =
        req.body;

      //check the login user have entry permission
      if (loginEntryPermision !== "Yes") {
        return res.status(200).json({
          status: "error",
          mssg: "User does not have permission to Create",
        });
      }
      const slider_image = req.file;
      if (!slider_image) {
        // If no file was uploaded, return an error
        return res.status(200).json({
          status: "error",
          field: "slider_image",
          mssg: "Home Slider Image is required",
        });
      }

      // Create a new Customer quotation
      const newConfig = await homeSlider
        .create({
          entry_user_code: userCode,
          text: text,
          link: link,
          active: active,
          slider_image: "slider_image/" + slider_image.filename,
          order_num: order_num,
        })
        .then((newConfig) => {
          return res.status(200).json({
            status: "success",
            mssg: "Home Slider Data Saved Successfully",
            id: newConfig.id,
          });
        })
        .catch((err) => {
          console.log(err);
          return res
            .status(200)
            .json({ status: "error", mssg: "Home Slider Data is Present" });
        });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error", mssg: "Server Error" });
    }
  }
);

//.............................................................
// ROUTER 2:  Home Slider  get method api :/admin/homeSlider/gethomeSliderList
//.............................................................
router.get("/gethomeSliderList", verifyUser, async (req, res) => {
  try {
    const { loginViewPermision } = req.body;
    //check the login user have entry permission
    if (loginViewPermision !== "Yes") {
      return res.status(200).json({
        status: "error",
        mssg: "User does not have permission to View",
      });
    }
    const result = await homeSlider.find(
      {},
      { __v: 0, entry_user_code: 0, entry_timestamp: 0 }
    ).sort({ "entry_timestamp": -1 });

    if (result) {
      res.status(200).json({
        status: "success",
        mssg: "Home Slider Fetched Successfully",
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

//.............................................................
// ROUTER 3:  Home Slider get method api :/admin/homeSlider/gethomeSliderDetail
//.............................................................
router.post(
    "/gethomeSliderDetail",
    verifyUser,
    [
      body("id")
        .notEmpty()
        .withMessage("ID Code Empty !")
        .isMongoId()
        .withMessage("ID  Value Is Invalid !"),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorsArray = errors.array();
        return res.status(200).json({
          status: "error",
          field: errorsArray[0]["path"],
          mssg: errorsArray[0]["msg"],
        });
      }
      try {
        const id = req.body.id;
        const { loginViewPermision } = req.body;
        //check the login user have entry permission
        if (loginViewPermision !== "Yes") {
          return res.status(200).json({
            status: "error",
            mssg: "User does not have permission to View",
          });
        }
        const result = await homeSlider.findById(
          id,
          { __v: 0, entry_user_code: 0, entry_timestamp: 0 }
        );
  
        if (result) {
          res.status(200).json({
            status: "success",
            mssg: "Home Slider Fetched Successfully",
            data: result,
          });
        } else {
          res.status(200).json({ status: "error", mssg: "Not Found" });
        }
      } catch (error) {
        console.log(error.message);
        res.status(500).json({ status: "error", mssg: "Server Error" });
      }
    }
  );

  // ROUTER 4:  Home Slider get method api :/admin/homeSlider/delete
router.post(
    "/delete",
    verifyUser,
    [
      body("id")
        .notEmpty()
        .withMessage("ID is Empty !")
        .isMongoId()
        .withMessage("ID Value Is Invalid !"),
    ],
  
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorsArray = errors.array();
        return res.status(200).json({
          status: "validation error",
          field: errorsArray[0]["path"],
          mssg: errorsArray[0]["msg"],
        });
      }
      try {
        const id = req.body.id;
        const { loginDeletePermision } = req.body;
        //check the login user have entry permission
        if (loginDeletePermision !== "Yes") {
          return res.status(200).json({
            status: "error",
            mssg: "User does not have permission to Delete",
          });
        }
  
        const result = await homeSlider.findByIdAndDelete(id);
        if (result) {
          res.status(200).json({
            status: "success",
            mssg: "Home Slider Deleted Successfully",
          });
        } else {
          res.status(200).json({ status: "error", mssg: "Home Slider Not Found" });
        }
      } catch (error) {
        console.log(error.mssg);
        res.status(500).json({ status: "error", mssg: "Server Error" });
      }
    }
  );


  //.............................................................
// ROUTER 6: Home Slider post method api :/admin/homeSlider/update
//.............................................................
router.post(
    "/update",
    verifyUser,
    imageSlider.SliderImage,
    [
      // Add validation rules using express-validator
      body("id")
        .notEmpty()
        .withMessage("ID is Empty !")
        .isMongoId()
        .withMessage("ID Value Is Invalid !"),
        body("text").notEmpty().withMessage("Text is required"),
    body("link").notEmpty().withMessage("Link is required"),
    body("active")
      .notEmpty()
      .withMessage("Active Status is required!")
      .isIn(["Yes", "No"])
      .withMessage('Active Status should be either "Yes" or "No"!'),
    body("order_num").notEmpty().withMessage("Order Number is required"),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorsArray = errors.array();
        return res.status(200).json({
          status: "validation error",
          field: errorsArray[0]["path"],
          mssg: errorsArray[0]["msg"],
        });
      }
      try {
        let { id, text, link, active, order_num,userCode, loginEditPermision } = req.body;
  
        //check the login user have entry permission
        if (loginEditPermision !== "Yes") {
          return res.status(200).json({
            status: "error",
            mssg: "User does not have permission to Update",
          });
        }


  
        const updateddata = {
          entry_user_code: userCode,
          text: text,
          link: link,
          active: active,
          order_num: order_num,
        };

        if (req.file) {
            const { filename } = req.file;
    
            updateddata.slider_image = "slider_image/" + filename;
          }
  
        const updated = await homeSlider.findByIdAndUpdate(id, updateddata, {
          new: true,
        });
  
        if (updated) {
          res.status(200).json({
            status: "success",
            mssg: "Home Slider updated successfully",
            data: updated,
          });
        } else {
          res.status(200).json({ status: "error", mssg: "Home Slider not Found" });
        }
      } catch (error) {
        console.log(error.mssg);
        res.status(200).json({ status: "error", mssg: "Internal Server Error" });
      }
    }
  );
  
module.exports = router;
