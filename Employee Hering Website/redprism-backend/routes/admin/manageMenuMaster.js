const express = require("express");
const router = express.Router();
const menuMaster = require("../../models/menu_master");
const { body, validationResult } = require("express-validator");
const verifyUser = require("../../middleware/adminVerifyUser");

//.............................................................
// ROUTER 1:  Insert Data [ post method api : /api/admin/manageMenuMaster/insertData ]
//.............................................................
router.post("/insertData", verifyUser, [

    // Add validation rules using express-validator
    body("menu_name").notEmpty().withMessage("Menu Name is required"),
    body("menu_icon").notEmpty().withMessage("Menu Icon no is required"),
    body("sub_menu_status")
      .notEmpty()
      .withMessage("Sub Menu Status is required!")
      .isIn(["Yes", "No"])
      .withMessage('Sub Menu Status should be either "Yes" or "No"!'),

    body('file_name').if(body('sub_menu_status').equals('No'))
        .notEmpty().withMessage('File Name is required!'),

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
      let {
        userCode,
        menu_name,
        menu_icon,
        sub_menu_status,
        file_name,
        order_no,
        active,
        loginEntryPermision
      } = req.body;
       //check the login user have entry permission
       if (loginEntryPermision !== "Yes") {
        return res
          .status(200)
          .json({
            status: "error",
            mssg: "User does not have permission to Insert any data",
          });
      }

      const existingMenuName = await menuMaster.findOne({
        menu_name: menu_name,
      });
      if (existingMenuName) {
        return res
          .status(200)
          .json({ status: "error", mssg: "Menu name already exists" });
      }

      // Check for duplicate file_name when sub_menu_status is "No"
      if (sub_menu_status === "No") {
        const existingMenu = await menuMaster.findOne({
          sub_menu_status: "No",
          file_name:file_name,
        });
        if (existingMenu) {
          return res
            .status(200)
            .json({ status: "error", mssg: "File name already exists." });
        }
      }
      else{
        file_name = "";
      }

      //save data in mongo
      menuMaster
        .create({
          menu_name: menu_name,
          menu_icon: menu_icon,
          sub_menu_status: sub_menu_status,
          file_name: file_name,
          order_no: order_no,
          active: active,
          entry_user_code: userCode,
        })
        .then((menuMaster) => {
          return res.status(200).json({
            status: "success",
            mssg: "Menu Data Saved Successfully",
            id: menuMaster.id,
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
// ROUTER 2:  Get List [ get method api : /api/admin/manageMenuMaster/getList ]
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
         mssg: "User does not have permission to View Any Data",
       });
   }
    const result = await menuMaster.find({}, { __v: 0 });

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
// ROUTER 3:  Get Details [ post method api : /api/admin/manageMenuMaster/getDetails ]
//.............................................................
router.post("/getDetails", verifyUser, [

    body("menu_code")
      .notEmpty()
      .withMessage("Menu Code Empty !")
      .isMongoId()
      .withMessage("Menu Code Value Is Invalid !"),

  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res
        .status(200)
        .json({
          status: "error",
          field: errorsArray[0]["path"],
          mssg: errorsArray[0]["msg"],
        });
    }

    try {
      const menu_code = req.body.menu_code;
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
      const result = await menuMaster.findById(menu_code, { __v: 0 });

      if (result) {
        res
          .status(200)
          .json({
            status: "success",
            mssg: "Menu Master Fetched Successfully",
            data: result,
          });
      } else {
        res.status(200).json({ status: "error", mssg: "Not Found" });
      }
    } catch (error) {
      console.log(error.mssg);
      res.status(500).json({ status: "error", mssg: "Server Error" });
    }
  }
);

//.............................................................
// ROUTER 4:  Update Data [ post method api : /api/admin/manageMenuMaster/updateData ]
//.............................................................
router.post("/updateData", verifyUser, [

    // Add validation rules using express-validator
    body("menu_code")
      .notEmpty()
      .withMessage("Menu Code Empty !")
      .isMongoId()
      .withMessage("Menu Code Value Is Invalid !"),
    body("menu_name").notEmpty().withMessage("Menu Name is required"),
    body("menu_icon").notEmpty().withMessage("Menu Icon no is required"),
    body("sub_menu_status")
      .notEmpty()
      .withMessage("Sub Menu Status is required!")
      .isIn(["Yes", "No"])
      .withMessage('Sub Menu Status should be either "Yes" or "No"!'),
      body('file_name').if(body('sub_menu_status').equals('No'))
      .notEmpty().withMessage('File Name is required!'),
    body("order_no").notEmpty().withMessage("Order No is required"),
    body("active").notEmpty().withMessage("Status is required"),
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
        status: "error",
        field: errorsArray[0]["path"],
        mssg: errorsArray[0]["msg"],
      });
    } else {
      try {
        let {
          menu_code,
          userCode,
          menu_name,
          menu_icon,
          sub_menu_status,
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
                mssg: "User does not have permission to Update any data",
              });
          }

        const existingMenuName = await menuMaster.findOne({
          _id: { $ne: menu_code },
          menu_name: menu_name,
        });
        if (existingMenuName) {
          return res
            .status(200)
            .json({ status: "error", mssg: "Menu name already exists" });
        }

        // Check for duplicate file_name when sub_menu_status is "No"
        if (sub_menu_status === "No") {
          const existingMenu = await menuMaster.findOne({
            _id: { $ne: menu_code },
            sub_menu_status: "No",
            file_name:file_name,
          });
          if (existingMenu) {
            return res
              .status(200)
              .json({ status: "error", mssg: "File name already exists." });
          }
        }
        else{
          file_name='';
        }

        const updated = await menuMaster.findByIdAndUpdate(
          menu_code,
          {
            menu_name: menu_name,
            menu_icon: menu_icon,
            sub_menu_status: sub_menu_status,
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
            message: "Menu Master updated successfully",
            data: updated,
          });
        } else {
          res
            .status(200)
            .json({ status: "error", mssg: "Menu Master Id not Found." });
        }
      } catch (error) {
        console.log(error.message);
        res.status(500).json({ status: "error", mssg: "Server Error" });
      }
    }
  }
);


//.............................................................
// ROUTER 5:  Delete Data [ post method api : /api/admin/manageMenuMaster/deleteData ]
//.............................................................
router.post("/deleteData", verifyUser, [

    body("menu_code")
      .notEmpty()
      .withMessage("Menu Code Empty !")
      .isMongoId()
      .withMessage("Menu Code Value Is Invalid !"),

  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res
        .status(200)
        .json({
          status: "error",
          field: errorsArray[0]["path"],
          mssg: errorsArray[0]["msg"],
        });
    }
    try {
      const menu_code = req.body.menu_code;
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

      const menuToDelete = await menuMaster.findById(menu_code);
      if (!menuToDelete) {
        return res
          .status(200)
          .json({ status: "error", mssg: "Menu Master not found" });
      }

      const result = await menuMaster.findByIdAndDelete(menu_code);
      
      if (result) {
        res.status(200).json({
          status: "success",
          mssg: "Menu Master deleted successfully",
        });
      } else {
        return res
          .status(200)
          .json({ status: "error", mssg: "Failed to delete Menu" });
      }
    } catch (error) {
      console.log(error.mssg);
      res.status(500).json({ status: "error", mssg: "Server Error" });
    }
  }
);

module.exports = router;
