const express = require("express");
const router = express.Router();
const userpermissionapi = require("../../models/user_mode_permission");
const user_mode = require("../../models/user_mode");
const menu_master = require("../../models/menu_master");

const { body, validationResult } = require("express-validator");
const { default: mongoose } = require("mongoose");
const verifyUser = require("../../middleware/adminVerifyUser");


//.............................................................
// ROUTER 1:  Get User Mode List [get method api : /api/admin/userModePermission/getUserModeList ]
//.............................................................
router.get("/getUserModeList", async (req, res) => {
  try {

    const userModeList = await user_mode.find({ active: "Yes" }).sort({ user_mode: 1 }).select('_id user_mode');

    return res.status(200).json({
      status: "success",
      mssg: "Users Mode List fetched successfully",
      data: userModeList,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", mssg: "Server Error" });
  }
});


//.............................................................
// ROUTER 2:  Insert Data [get method api : /api/admin/userModePermission/insertData ]
//.............................................................
router.post("/insertData", verifyUser, [

    // Add validation rules using express-validator
    body("user_mode_code").notEmpty().withMessage("User Mode Code is required"),

    body('menu_list.*.menu_code').if(body('menu_list.*.menu_code').notEmpty())
      .isMongoId().withMessage('Menu Code Is Invalid !'),

    body('menu_list.*.sub_menu_code').if(body('menu_list.*.sub_menu_code').notEmpty())
      .isMongoId().withMessage('Sub Menu Code Is Invalid !'),

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
        user_mode_code,
        menu_list
      } = req.body;

      if (menu_list.length === 0) {
        return res.status(200).json({
          status: "error",
          field: 'menu_list',
          mssg: 'Menu List Blank. Pleace Select At Least One Menu!!',
        });
      }

      // Delete existing user permission data if it exists
      await userpermissionapi.deleteMany({
        user_mode_code: user_mode_code,
      });

      let insertData = [];

      for (let index = 0; index < menu_list.length; index++) {
        insertData.push({
          user_mode_code: user_mode_code,
          menu_code: menu_list[index].menu_code === "" ? null : menu_list[index].menu_code,
          sub_menu_code: menu_list[index].sub_menu_code === "" ? null : menu_list[index].sub_menu_code,
          type: menu_list[index].type,
          entry_user_code: userCode,
        });
      }

      userpermissionapi
        .insertMany(insertData)
        .then((data) => {
          return res.status(200).json({
            status: "success",
            mssg: "User Permission Saved Successfully",
          });
        })
        .catch((err) => {
          console.log(err);
          return res.status(200).json({ status: "error", mssg: err.message });
        });

    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error", mssg: "Server Error" });
    }
  }
);


//.............................................................
// ROUTER 3:  Get Menu & Sub Menu List [get method api : /api/admin/userModePermission/getMenuSubmenu ]
//.............................................................
router.post("/getMenuSubmenu", verifyUser, [

    // Add validation rules using express-validator
    body("user_mode_code").notEmpty().withMessage("User Mode Code is required"),

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
        user_mode_code
      } = req.body;

      const menuSubmenuList = await menu_master.aggregate([

        {
          $lookup: {
            from: "user_mode_permission",
            localField: "_id",
            foreignField: "menu_code",
            as: "menu_user_mode_permission",
            pipeline: [
              { '$match': { user_mode_code: new mongoose.Types.ObjectId(user_mode_code) } },
            ],
          },
        },


        {
          $lookup: {
            from: "sub_menu_master",
            localField: "_id",
            foreignField: "menu_code",
            as: "sub_menu_master",
            pipeline: [

              {
                $lookup: {
                  from: "user_mode_permission",
                  localField: "_id",
                  foreignField: "sub_menu_code",
                  as: "sub_menu_user_mode_permission",
                  pipeline: [
                    { '$match': { user_mode_code: new mongoose.Types.ObjectId(user_mode_code) } },
                  ],
                },
              },

              { $match: { active: "Yes" } },
              {
                $sort: { 'order_no': 1 }
              },

              {
                $project: {
                  "_id": 1,
                  "sub_menu_name": 1,
                  "file_name": 1,
                  "sub_menu_user_mode_permission": {
                    $size: '$sub_menu_user_mode_permission',
                  },
                }
              }

            ],
          },
        },

        { $match: { active: "Yes" } },
        {
          $sort: { 'order_no': 1 }
        },

        {
          $project: {
            "_id": 1,
            "menu_name": 1,
            "menu_icon": 1,
            "file_name": 1,
            "menu_user_mode_permission": {
              $size: '$menu_user_mode_permission',
            },
            "sub_menu_master._id": 1,
            "sub_menu_master.sub_menu_name": 1,
            "sub_menu_master.file_name": 1,
            "sub_menu_master.sub_menu_user_mode_permission": 1,
          }
        },
      ]);

      return res.status(200).json({
        status: "success",
        mssg: "Menu & Sub Menu List Fetched Succesfully",
        menuSubmenuList,
      });

    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error", mssg: "Server Error" });
    }
  }
);


module.exports = router;