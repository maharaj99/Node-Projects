const express = require("express");
const router = express.Router();
const subMenu = require("../../models/sub_menu_master");
const { body, validationResult } = require("express-validator");
const { default: mongoose } = require("mongoose");
const verifyUser = require("../../middleware/adminVerifyUser");
const menuMaster = require("../../models/menu_master");

//.............................................................
// ROUTER 1:  Get Menu List [get method api : /api/admin/manageSubMenuMaster/getMenuList ]
//.............................................................
router.get("/getMenuList", verifyUser, async (req, res) => {
  try {
    const {loginViewPermision} = req.body;
    //check the login user have entry permission
    if (loginViewPermision !== "Yes") {
     return res
       .status(200)
       .json({
         status: "error",
         mssg: "User does not have permission to View a Customer Shipping Address",
       });
   }
    const result = await menuMaster.find({active: 'Yes', sub_menu_status: 'Yes'}, {_id:1,menu_name:1});

    if (result) {
      res
        .status(200)
        .json({
          status: "success",
          mssg: "Menu Master Fetched Successfully",
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
// ROUTER 2:  Insert Data [ post method api : /api/admin/manageSubMenuMaster/insertData ]
//.............................................................
router.post( "/insertData", verifyUser, [

    // Add validation rules using express-validator
    body("sub_menu_name").notEmpty().withMessage("Sub Menu Name is required"),
    body("menu_code").notEmpty().withMessage("Menu Code no is required"),
    body("file_name").notEmpty().withMessage("File name is required"),
    body("order_no").notEmpty().withMessage("Order No is required"),
    body("active")
      .notEmpty()
      .withMessage("Active is required!")
      .isIn(["Yes", "No"])
      .withMessage('Active should be either "Yes" or "No"!'),
  ],
  async (req, res) => {
    // Check for validation errors
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
      const {
        userCode,
        sub_menu_name,
        menu_code,
        sub_menu_status,
        file_name,
        order_no,
        active,
        loginEntryPermision,
      } = req.body;

        //check the login user have entry permission
        if (loginEntryPermision !== "Yes") {
          return res
            .status(200)
            .json({
              status: "error",
              mssg: "User does not have permission to Create a Customer Shipping Address",
            });
        }

      const existingSubMenuName = await subMenu.findOne({
        sub_menu_name: sub_menu_name,
      });
      const existingFileName = await subMenu.findOne({
        file_name: file_name,
      });

      if (existingSubMenuName) {
        return res
          .status(200)
          .json({ status: "error", mssg: "Sub Menu name already exists" });
      }

      if (existingFileName) {
        return res
          .status(200)
          .json({ status: "error", mssg: "File name already exists" });
      }

      //save data in mongo
      subMenu
        .create({
          sub_menu_name: sub_menu_name,
          menu_code: menu_code,
          sub_menu_status: sub_menu_status,
          file_name: file_name,
          order_no: order_no,
          active: active,
          entry_user_code: userCode,
        })

        .then((subMenu) => {
          return res.status(200).json({
            status: "success",
            mssg: "Sub Menu Data Saved Successfully",
            id: subMenu.id,
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
// ROUTER 3:  Get List [ get method api : /api/admin/manageSubMenuMaster/getList ]
//.............................................................
router.get("/getList", verifyUser, async (req, res) => {
  try {
    const {loginViewPermision} = req.body;
    //check the login user have entry permission
    if (loginViewPermision !== "Yes") {
     return res
       .status(200)
       .json({
         status: "error",
         mssg: "User does not have permission to View a Customer Shipping Address",
       });
   }
    const subMenuDetails = await subMenu.aggregate([
      {
        $lookup: {
          from: "menu_master",
          localField: "menu_code",
          foreignField: "_id",
          as: "menu_details",
        },
      },
      {
        $unwind: "$menu_details",
      },
      {
        $project: {
          sub_menu_name: 1,
          file_name: 1,
          order_no: 1,
          active: 1,
          entry_user_code: 1,
          entry_timestamp: 1,
          "menu_details.menu_name": 1,
          "menu_details._id": 1,
        },
      },
    ]);

    if (subMenuDetails.length === 0) {
      return res
        .status(200)
        .json({ status: "error", mssg: "Sub Menu Details not found" });
    }

    return res.status(200).json({
      status: "success",
      mssg: "Sub Menu Details fetched successfully",
      data: subMenuDetails,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", mssg: "Server Error" });
  }
});


//.............................................................
// ROUTER 4:  Get Details [ post method api : /api/admin/manageSubMenuMaster/getDetails ]
//.............................................................
router.post( "/getDetails", verifyUser, [

    body("sub_menu_code")
      .notEmpty()
      .withMessage("Sub Menu Code Empty !")
      .isMongoId()
      .withMessage("Sub Menu Code Value Is Invalid !"),
  ],
  async (req, res) => {
    try {
      const sub_menu_code = req.body.sub_menu_code;
      const {loginViewPermision} = req.body;
      //check the login user have entry permission
      if (loginViewPermision !== "Yes") {
       return res
         .status(200)
         .json({
           status: "error",
           mssg: "User does not have permission to View Any Data",
         });
     }
      if (!sub_menu_code) {
        return res
          .status(200)
          .json({ error: "Sub Menu User Code is required" });
      }

      const subMenuDetails = await subMenu.aggregate([
        {
          $lookup: {
            from: "menu_master",
            localField: "menu_code",
            foreignField: "_id",
            as: "menu_details",
          },
        },
        {
          $unwind: "$menu_details",
        },
        {
          $project: {
            sub_menu_name: 1,
            file_name: 1,
            order_no: 1,
            active: 1,
            entry_user_code: 1,
            entry_timestamp: 1,
            "menu_details._id": 1,
            "menu_details.menu_name": 1,
          },
        },
        {
          $match: {
            _id: new mongoose.Types.ObjectId(sub_menu_code), // Convert user code to ObjectId
          },
        },
      ]);

      if (subMenuDetails.length === 0) {
        return res
          .status(200)
          .json({ status: "error", mssg: "Sub Menu Details not found" });
      }

      return res.status(200).json({
        status: "success",
        mssg: "Sub Menu Details fetched successfully",
        data: subMenuDetails,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error", mssg: "Server Error" });
    }
  }
);


//.............................................................
// ROUTER 5:  Update Data [ post method api : /api/admin/manageSubMenuMaster/updateData ]
//.............................................................
router.post( "/updateData", verifyUser, [

    // Add validation rules using express-validator
    body("sub_menu_code")
      .notEmpty()
      .withMessage("Sub Menu Code Empty !")
      .isMongoId()
      .withMessage("Sub Menu Code Value Is Invalid !"),
    body("sub_menu_name").notEmpty().withMessage("Sub Menu Name is required"),
    body("file_name").notEmpty().withMessage("File name is required"),
    body("order_no").notEmpty().withMessage("Order No is required"),
    body("menu_code").notEmpty().withMessage("Menu Code is required"),
    body("active")
      .notEmpty()
      .withMessage("Active is required!")
      .isIn(["Yes", "No"])
      .withMessage('Active should be either "Yes" or "No"!'),

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
    } else {
      try {
        const {
          userCode,
          sub_menu_code,
          sub_menu_name,
          menu_code,
          file_name,
          order_no,
          active,
          loginEditPermision,
        } = req.body;
          //check the login user have entry permission
          if (loginEditPermision !== "Yes") {
            return res
              .status(200)
              .json({
                status: "error",
                mssg: "User does not have permission to Update a Customer Shipping Address",
              });
          }

        // Check if a document with the same menu_name or file_name exists, excluding the current document being updated
        const existingMenuName = await subMenu.findOne({
          _id: { $ne: sub_menu_code },
          sub_menu_name: sub_menu_name,
        });
        const existingFileName = await subMenu.findOne({
          _id: { $ne: sub_menu_code },
          file_name: file_name,
        });

        if (existingMenuName) {
          return res
            .status(200)
            .json({ status: "error", mssg: "Sub Menu name already exists" });
        }

        if (existingFileName) {
          return res
            .status(200)
            .json({ status: "error", mssg: "File name already exists" });
        }

        const updated = await subMenu.findByIdAndUpdate(
          sub_menu_code,
          {
            sub_menu_name: sub_menu_name,
            menu_code: menu_code,
            file_name: file_name,
            order_no: order_no,
            active: active,
            entry_user_code: userCode,
          },
          { new: true }
        );

        if (updated) {
          res.status(200).json({
            status: "success",
            mssg: "Sub Menu Master updated successfully",
            data: updated,
          });
        } else {
          res
            .status(200)
            .json({ status: "error", mssg: "Sub Menu Code Id not Found" });
        }
      } catch (error) {
        console.log(error.mssg);
        res
          .status(200)
          .json({ status: "error", mssg: "Internal Server Error" });
      }
    }
  }
);


//.............................................................
// ROUTER 6:  Delete Data [ post method api : /api/admin/manageSubMenuMaster/deleteData ]
//.............................................................
router.post( "/deleteData", verifyUser, [

    body("sub_menu_code")
      .notEmpty()
      .withMessage("Sub Menu Code Empty !")
      .isMongoId()
      .withMessage("Sub Menu Code Value Is Invalid !"),
  ],
  async (req, res) => {
    try {
      const sub_menu_code = req.body.sub_menu_code;
      const {loginDeletePermision} = req.body;
      //check the login user have entry permission
      if (loginDeletePermision !== "Yes") {
       return res
         .status(200)
         .json({
           status: "error",
           mssg: "User does not have permission to Delete a Customer Shipping Address",
         });
     }

      const result = await subMenu.findByIdAndDelete(sub_menu_code);
      if (result) {
        res
          .status(200)
          .json({ status: "success", mssg: "Sub Menu Deleted Successfully" });
      } else {
        res.status(200).json({ status: "error", mssg: "Sub Menu Not Found" });
      }
    } catch (error) {
      console.log(error.mssg);
      res.status(500).json({ status: "error", mssg: "Server Error" });
    }
  }
);

module.exports = router;