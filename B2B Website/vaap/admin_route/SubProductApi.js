const express = require("express");
const router = express.Router();
const subProductMaster = require("../model/subProduct_Master");
const { body, validationResult } = require("express-validator");
const verifyUser = require("../middleware/adminverifyuser");
const productList = require("../model/product_master");
const unitList = require("../model/unit_master");
const subProductImage = require("../middleware/admin_uploadfiles");
const { default: mongoose } = require("mongoose");

//.............................................................
// ROUTER 1:  Sub Product Master get method api :/admin/subProductMaster/getProductList
//.............................................................
router.get("/getProductList", verifyUser, async (req, res) => {
  try {
    const { loginViewPermision } = req.body;
    //check the login user have entry permission
    if (loginViewPermision !== "Yes") {
      return res.status(200).json({
        status: "error",
        mssg: "User does not have permission to View a Sub Product Master",
      });
    }
    const result = await productList
      .find({ active: "Yes" }, { _id: 1, product_name: 1 })
      .sort({ product_name: 1 });

    if (result) {
      res.status(200).json({
        status: "success",
        mssg: "Product Lists Fetched Successfully",
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
// ROUTER 2:  Sub Product Master get method api :/admin/subProductMaster/getUnitList
//.............................................................
router.get("/getUnitList", verifyUser, async (req, res) => {
  try {
    const { loginViewPermision } = req.body;
    //check the login user have entry permission
    if (loginViewPermision !== "Yes") {
      return res.status(200).json({
        status: "error",
        mssg: "User does not have permission to View a Sub Product Master",
      });
    }
    const result = await unitList
      .find({ active: "Yes" }, { __v: 0, entry_user_code: 0, entry_date: 0 })
      .sort({ unit: 1 });

    if (result) {
      res.status(200).json({
        status: "success",
        mssg: "Unit Master List Fetched Successfully",
        result: result,
      });
    } else {
      res.status(200).json({ status: "error", mssg: "Not Found" });
    }
  } catch (error) {
    console.log(error.mssg);
    res.status(500).json({ status: "error", mssg: "Server Error" });
  }
});

//.............................................................
// ROUTER 3:  Sub Product Master post method api :/admin/subProductMaster/add
//.............................................................
router.post( "/add", verifyUser, subProductImage.subproductimage, [
    // Add validation rules using express-validator
    body("sub_product_name")
      .notEmpty()
      .withMessage("Sub Product Name is required"),

    body("unit_type")
      .notEmpty()
      .withMessage("Packaging Type Status is required!")
      .isIn(["Box", "Pcs"])
      .withMessage('Packaging Type Status should be either "Box" or "Pcs"!'),

    body("per_box_pcs").custom((value, { req }) => {
      if (req.body.unit_type === "Box" && !value) {
        throw new Error("Per box/pcs is required");
      }

      return true;
    }),

    body("product_code").notEmpty().withMessage("Product Code is required"),

    body("unit").notEmpty().withMessage("Unit is required"),

    body("unit_quantity")
      .notEmpty().withMessage("Unit Quantity is required")
      .isNumeric().withMessage("Unit Quantity only accept Numeric Value"),

    body("buying_price").notEmpty().withMessage("Buying Price is required"),
    body("mrp").notEmpty().withMessage("MRP is required"),
    body("discount_type")
      .notEmpty()
      .withMessage("Discount Type Status is required!")
      .isIn(["Percentage", "Flat", "Null"])
      .withMessage(
        'Unit Type Status should be either "Percentage" or "Flat" or "Null"!'
      ),
    body("discount").notEmpty().withMessage("Discount is required"),
    body("selling_price").notEmpty().withMessage("Selling Price is required"),
    body("active")
      .notEmpty()
      .withMessage("Active Status is required!")
      .isIn(["Yes", "No"])
      .withMessage('Active Status should be either "Yes" or "No"!'),
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
      let {
        sub_product_name,
        userCode,
        unit_type,
        product_code,
        unit,
        unit_quantity,
        per_box_pcs,
        buying_price,
        mrp,
        discount_type,
        discount,
        selling_price,
        active,
        loginEntryPermision,
      } = req.body;
      //  check the login user have entry permission
      if (loginEntryPermision !== "Yes") {
        return res.status(200).json({
          status: "error",
          mssg: "User does not have permission to Create a Sub Product Master",
        });
      }

      if (unit_type === "Pcs") {
        per_box_pcs = 0;
      }

      //selling_price= If (discount=="Percentage"){ mrp - ( (mrp * discount) /100)}
      if (discount_type === "Percentage") {
        selling_price = (Number(mrp) - ((Number(mrp) * Number(discount)) / 100)).toFixed(2);
      }
      // selling_price= If (discount=="Flat"){ mrp - discount  }
      else if (discount_type === "Flat") {
        selling_price = (Number(mrp) - Number(discount)).toFixed(2);
      }
      else {
        selling_price = Number(mrp)
      }

      if (Number(discount) >= Number(mrp)) {
        return res
          .status(200)
          .json({
            status: "error",
            mssg: "Discount can not be Gaterthan or equel to Mrp",
          });
      }

      // const sub_product_image = req.file;
      // let image = sub_product_image.filename;
      const sub_product_image = req.file;
      if (!sub_product_image) {
        // If no file was uploaded, return an error
        return res.status(200).json({
          status: "error",
          field: "sub_product_image",
          mssg: "Sub Product Image is required",
        });
      }

      // Check if a sub-product with the same name already exists
      const existingSubProduct = await subProductMaster.findOne({
        sub_product_name: sub_product_name,
      });

      if (existingSubProduct) {
        return res
          .status(200)
          .json({ status: "error", error: "Sub Product name already exists" });
      }

      var per_pcs_buying_price = 0;
      var per_pcs_selling_price = 0;
      if (unit_type === "Box") {
        per_pcs_buying_price = (Number(buying_price) / Number(per_box_pcs)).toFixed(2);
        per_pcs_selling_price = (Number(selling_price) / Number(per_box_pcs)).toFixed(2);
      }

      const newConfig = await subProductMaster
        .create({
          sub_product_name: sub_product_name,
          unit_type: unit_type,
          product_code: product_code,
          sub_product_image: "subProduct_images/" + sub_product_image.filename,
          unit: unit,
          unit_quantity: unit_quantity,
          per_box_pcs: per_box_pcs,
          buying_price: buying_price,
          per_pcs_buying_price: per_pcs_buying_price,
          mrp: mrp,
          discount_type: discount_type,
          discount: discount,
          selling_price: selling_price,
          per_pcs_selling_price: per_pcs_selling_price,
          active: active,
          entry_user_code: userCode,
        })
        .then((newConfig) => {
          return res.status(200).json({
            status: "success",
            mssg: "Sub Product Saved Successfully",
            id: newConfig.id,
          });
        })
        .catch((err) => {
          console.log(err);
          return res.status(200).json({ status: "error", mssg: err.mssg });
        });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error", mssg: "Server Error" });
    }
  }
);

//.............................................................
// ROUTER 4:  Sub Product Master get method api :/admin/subProductMaster/getsubProductList
//.............................................................
router.get("/getsubProductList", verifyUser, async (req, res) => {
  try {
    const { loginViewPermision } = req.body;
    // Check if the login user has entry permission
    if (loginViewPermision !== "Yes") {
      return res.status(200).json({
        status: "error",
        mssg: "User does not have permission to view a Customer Cart",
      });
    }

    const ProductDetails = await subProductMaster.aggregate([
      {
        $lookup: {
          from: "product_master",
          localField: "product_code",
          foreignField: "_id",
          as: "Product",
        },
      },
      { $sort: { entry_timestamp: -1 } },
      {
        $project: {
          _id: 1,
          sub_product_name: 1,
          product_code: 1,
          sub_product_image: 1,
          unit: 1,
          unit_quantity: 1,
          unit_type: 1,
          per_box_pcs: 1,
          buying_price: 1,
          per_pcs_buying_price: 1,
          mrp: 1,
          discount_type: 1,
          discount: 1,
          selling_price: 1,
          per_pcs_selling_price: 1,
          active: 1,
          "Product._id": 1,
          "Product.product_name": 1,
        },
      },
    ]);

    if (ProductDetails.length === 0) {
      return res.status(200).json({
        status: "error",
        mssg: "Product List not found",
      });
    } else {
      res.status(200).json({
        status: "success",
        data: ProductDetails,
        mssg: "Product List Found Sucessfully",
      });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      status: "error",
      mssg: "Server Error",
    });
  }
});

//.............................................................
// ROUTER 5:  Sub Product Master get method api :/admin/subProductMaster/getsubProductDetails
//.............................................................
router.post( "/getsubProductDetails", verifyUser, [
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
        status: "error",
        field: errorsArray[0]["path"],
        mssg: errorsArray[0]["msg"],
      });
    }

    try {
      const { loginViewPermision } = req.body;
      // Check if the login user has entry permission
      if (loginViewPermision !== "Yes") {
        return res.status(200).json({
          status: "error",
          mssg: "User does not have permission to view a Customer Cart",
        });
      }
      const id = req.body.id;

      const ProductDetails = await subProductMaster.aggregate([
        {
          $lookup: {
            from: "product_master",
            localField: "product_code",
            foreignField: "_id",
            as: "Product",
          },
        },
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
          }, // Search by id
        },
        {
          $project: {
            _id: 1,
            sub_product_name: 1,
            product_code: 1,
            sub_product_image: 1,
            unit: 1,
            unit_quantity: 1,
            unit_type: 1,
            per_box_pcs: 1,
            buying_price: 1,
            per_pcs_buying_price: 1,
            mrp: 1,
            discount_type: 1,
            discount: 1,
            selling_price: 1,
            per_pcs_selling_price: 1,
            active: 1,
            "Product._id": 1,
            "Product.product_name": 1,
          },
        },
      ]);

      if (ProductDetails.length === 0) {
        return res.status(200).json({
          status: "error",
          mssg: "Product List not found",
        });
      } else {
        res.status(200).json({
          status: "success",
          data: ProductDetails,
          mssg: "Product List Found Sucessfully",
        });
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).json({
        status: "error",
        mssg: "Server Error",
      });
    }
  }
);

//.............................................................
// ROUTER 6:  Sub Product Master post method api :/admin/subProductMaster/update
//.............................................................

// Update API for VoucherNumberConfig
router.post( "/update", verifyUser, subProductImage.subproductimage, [
    // Add validation rules using express-validator
    body("sub_product_master_id")
      .notEmpty()
      .withMessage("Sub Product Master is Empty !")
      .isMongoId()
      .withMessage("Sub Product Master Value Is Invalid !"),
    body("sub_product_name")
      .notEmpty()
      .withMessage("Sub Product Name is required"),

    body("unit_type")
      .notEmpty()
      .withMessage("Packaging Type Status is required!")
      .isIn(["Box", "Pcs"])
      .withMessage('Packaging Type Status should be either "Box" or "Pcs"!'),

    body("product_code").notEmpty().withMessage("Product Code is required"),

    body("unit").notEmpty().withMessage("Unit is required"),

    body("unit_quantity")
      .notEmpty().withMessage("Unit Quantity is required")
      .isNumeric().withMessage("Unit Quantity only accept Numeric Value"),

    body("per_box_pcs").custom((value, { req }) => {
      if (req.body.unit_type === "Box" && !value) {
        throw new Error("Per box/pcs is required");
      } else {
      }
      return true;
    }),

    body("buying_price").notEmpty().withMessage("Buying Price is required"),
    body("mrp").notEmpty().withMessage("MRP is required"),
    body("discount_type")
      .notEmpty()
      .withMessage("Discount Type Status is required!")
      .isIn(["Percentage", "Flat", "Null"])
      .withMessage(
        'Unit Type Status should be either "Percentage" or "Flat" or "Null"!'
      ),
    body("discount").notEmpty().withMessage("Discount is required"),
    body("selling_price").notEmpty().withMessage("Selling Price is required"),
    body("active")
      .notEmpty()
      .withMessage("Active Status is required!")
      .isIn(["Yes", "No"])
      .withMessage('Active Status should be either "Yes" or "No"!'),
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
      let {
        sub_product_master_id,
        sub_product_name,
        userCode,
        unit_type,
        product_code,
        unit,
        unit_quantity,
        per_box_pcs,
        buying_price,
        mrp,
        discount_type,
        discount,
        selling_price,
        active,
        loginEditPermision,
      } = req.body;

      //check the login user have entry permission
      if (loginEditPermision !== "Yes") {
        return res.status(200).json({
          status: "error",
          mssg: "User does not have permission to Update a Sub Product Master",
        });
      }

      if (unit_type === "Pcs") {
        per_box_pcs = 0;
      }

      //selling_price= If (discount=="Percentage"){ mrp - ( (mrp * discount) /100)}
      if (discount_type === "Percentage") {
        selling_price = (Number(mrp) - ((Number(mrp) * Number(discount)) / 100)).toFixed(2);
      }
      // selling_price= If (discount=="Flat"){ mrp - discount  }
      else if (discount_type === "Flat") {
        selling_price = (Number(mrp) - Number(discount)).toFixed(2);
      }
      else {
        selling_price = Number(mrp)
      }

      if (Number(discount) >= Number(mrp)) {
        return res
          .status(200)
          .json({
            status: "error",
            mssg: "Discount can not be Gaterthan or equel to Mrp",
          });
      }

      // Check if Sub Product already exists
      const duplicateSubProduct = await subProductMaster.findOne({
        _id: { $ne: sub_product_master_id },
        sub_product_name: sub_product_name,
      });

      if (duplicateSubProduct) {
        return res.status(200).json({ status: 'error', field: 'sub_product_name', mssg: 'Sub Product name with the same name already exists!' });
      }

      var per_pcs_buying_price = 0;
      var per_pcs_selling_price = 0;
      if (unit_type === "Box") {
        per_pcs_buying_price = (Number(buying_price) / Number(per_box_pcs)).toFixed(2);
        per_pcs_selling_price = (Number(selling_price) / Number(per_box_pcs)).toFixed(2);
      }

      const updateddata = {
        sub_product_name: sub_product_name,
        entry_user_code: userCode,
        unit_type: unit_type,
        product_code: product_code,
        unit: unit,
        unit_quantity: unit_quantity,
        per_box_pcs: per_box_pcs,
        buying_price: buying_price,
        per_pcs_buying_price: per_pcs_buying_price,
        mrp: mrp,
        discount_type: discount_type,
        discount: discount,
        selling_price: selling_price,
        per_pcs_selling_price: per_pcs_selling_price,
        active: active,
      };

      if (req.file) {
        const { filename } = req.file;

        updateddata.sub_product_image = "subProduct_images/" + filename;
      }

      const updated = await subProductMaster.findByIdAndUpdate(
        sub_product_master_id,
        updateddata,
        { new: true }
      );

      if (updated) {
        res.status(200).json({
          status: "success",
          mssg: "Sub Product updated successfully",
          data: updated,
        });
      } else {
        res
          .status(200)
          .json({ status: "error", mssg: "Sub Product not Found" });
      }
    } catch (error) {
      console.log(error.mssg);
      res.status(200).json({ status: "error", mssg: "Internal Server Error" });
    }
  }
);

//.............................................................
// ROUTER 7:  Sub Product Master post method api :/admin/subProductMaster/del
//.............................................................
router.post( "/del", verifyUser, [

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
      const subProductcode = req.body.id;
      const { loginDeletePermision } = req.body;
      //check the login user have entry permission
      if (loginDeletePermision !== "Yes") {
        return res.status(200).json({
          status: "error",
          mssg: "User does not have permission to Delete a Sub Product Master",
        });
      }

      const result = await subProductMaster.findByIdAndDelete(subProductcode);
      if (result) {
        res.status(200).json({
          status: "success",
          mssg: "Sub Product Master Deleted Successfully",
        });
      } else {
        res
          .status(200)
          .json({ status: "error", mssg: "Sub Product Master Not Found" });
      }
    } catch (error) {
      console.log(error.mssg);
      res.status(500).json({ status: "error", mssg: "Server Error" });
    }
  }
);


module.exports = router;