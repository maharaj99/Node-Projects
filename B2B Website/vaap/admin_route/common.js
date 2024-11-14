//imports
const express = require('express');
const router = express.Router();

const menuMaster = require("../model/Menu_masterSchema");
const subMenuMaster = require("../model/subMenuMasterSchema");
const usermaster = require("../model/admin_user_master");

const { body, validationResult } = require('express-validator');
const verifyUser = require('../middleware/adminverifyuser');

const mongoose = require('mongoose');


//.............................................................
// ROUTER 1:  Get user details by authtoken, get method api :/admin/logged/userDetails/get
//................................................ .............

router.get('/userDetails/get', verifyUser, async (req, res) => {
  try {
    let userId = req.body.userCode;

    // Find the user  based on the provided authtoken
    const user = await usermaster.findOne({ _id: userId });

    if (!user) {
      return res.status(200).json({ status: 'error', mssg: 'User mode not found' });
    }
    const User = await usermaster.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId) // Use the userId variable here
        }
      },
      {
        $lookup: {
          from: 'user_mode',
          localField: 'user_mode_code',
          foreignField: '_id',
          as: 'user_mode_master'
        }
      },
      {
        $project: {
          "_id": 1,
          "user_id": 1,
          "user_name": 1,
          "email": 1,
          "profile_images": 1,
          "user_mode_master._id": 1,
          "user_mode_master.user_mode": 1,
          "entry_permission": 1,
          "view_permission": 1,
          "edit_permission": 1,
          "delete_permissioin": 1,
          "type": 1,

        }
      }
    ])
    if (User.length === 0) {
      return res.status(200).json({ status: 'error', mssg: 'User details not found' });
    }

    return res.status(200).json({ status: 'success', mssg: 'User details fetched successfully', data: User });

  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
  }
});



//.........................................................
//ROUTER 2 : Get Access Menu & Sub Menu By Auth Token, get method api :/admin/logged/getMenuSubmenu
//...........................................................

router.get('/getMenuSubmenu', verifyUser, async (req, res) => {
  try {
    let userCode = req.body.userCode;

    // Find the user  based on the provided authtoken
    const user = await usermaster.findOne({ _id: userCode });

    if (!user) {
      return res.status(200).json({ status: 'error', mssg: 'User Details Not Valid' });
    }


    if (user.type === "Projectadmin") {

      let menuSubMenuList = await menuMaster.aggregate([

        {
          $lookup: {
            from: 'sub_menu_master',
            localField: '_id',
            foreignField: 'menu_code',
            as: 'sub_menu',
            pipeline: [
              {
                $match: {
                  active: "Yes"
                }
              },
              {
                $sort: {
                  order_no: 1
                }
              }
            ]
          }
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
            "sub_menu._id": 1,
            "sub_menu.sub_menu_name": 1,
            "sub_menu.file_name": 1

          }
        }
      ])


      if (menuSubMenuList.length === 0) {
        return res.status(200).json({ status: 'error', mssg: 'Menus not found' });
      }
      else{
        return res.status(200).json({ status: 'success', mssg: 'Menu details fetched successfully', menuSubMenuList });
      }

    }
    else {
      let useModecode = user.user_mode_code

      let menuSubMenuList = await menuMaster.aggregate([

        {
          $lookup: {
            from: "user_mode_permission",
            localField: "_id",
            foreignField: "menu_code",
            as: "menu_user_mode_permission",
          },
        },


        {
          $lookup: {
            from: "sub_menu_master",
            localField: "_id",
            foreignField: "menu_code",
            as: "sub_menu",
            pipeline: [

              {
                $lookup: {
                  from: "user_mode_permission",
                  localField: "_id",
                  foreignField: "sub_menu_code",
                  as: "sub_menu_user_mode_permission"
                },
              },

              { $match: { active: "Yes", "sub_menu_user_mode_permission.user_mode_code": new mongoose.Types.ObjectId(useModecode) } },
              {
                $sort: { 'order_no': 1 }
              },

              {
                $project: {
                  "_id": 1,
                  "sub_menu_name": 1,
                  "file_name": 1,
                }
              }

            ],
          },
        },

        { $match: { active: "Yes", "menu_user_mode_permission.user_mode_code": new mongoose.Types.ObjectId(useModecode) } },
        {
          $sort: { 'order_no': 1 }
        },

        {
          $project: {
            "_id": 1,
            "menu_name": 1,
            "menu_icon": 1,
            "file_name": 1,
            "sub_menu._id": 1,
            "sub_menu.sub_menu_name": 1,
            "sub_menu.file_name": 1,
          }
        },
      ]);

      if (menuSubMenuList.length === 0) {
        return res.status(200).json({ status: 'error', mssg: 'Menus not found' });
      }
      else{
        return res.status(200).json({ status: 'success', mssg: 'Menu details fetched successfully', menuSubMenuList });
      }

    }


  }
  catch (error) {
    console.log(error.message);
    return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
  }
})



//.............................................................
// ROUTER 3:  Check User Can Access Page or Not, post method api :/admin/logged/pagePermissionCheck
//.............................................................
router.post("/pagePermissionCheck", verifyUser,
  [
    // Add validation rules using express-validator
    body("page_name").notEmpty().withMessage("Page Name is required"),

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
        page_name
      } = req.body;

      // Get User Details
      const userDetails = await usermaster.findById(userCode).select('type user_mode_code');

      if (userDetails.type==="Projectadmin") {
        return res.status(200).json({
          status: "success",
          mssg: "User can access this page",
          page_access: "Yes",
        });
      }
      else{

        // Get Sub Menu Details by page_name
        let subMenuMasterDetails = await subMenuMaster.aggregate([

          {
            $lookup: {
              from: "user_mode_permission",
              localField: "_id",
              foreignField: "sub_menu_code",
              as: "user_mode_permission",
            },
          },

          {
            $match: {
              file_name: page_name,
              "user_mode_permission.user_mode_code": userDetails.user_mode_code
            }
          }

        ]);

        if(subMenuMasterDetails.length > 0){
          return res.status(200).json({
            status: "success",
            mssg: "User can access this page",
            page_access: "Yes",
          });
        }


        // Get Menu Details by page_name
        let menuMasterDetails = await menuMaster.aggregate([

          {
            $lookup: {
              from: "user_mode_permission",
              localField: "_id",
              foreignField: "menu_code",
              as: "user_mode_permission",
            },
          },

          {
            $match: {
              file_name: page_name,
              "user_mode_permission.user_mode_code": userDetails.user_mode_code
            }
          }

        ]);

        if(menuMasterDetails.length > 0){
          return res.status(200).json({
            status: "success",
            mssg: "User can access this page",
            page_access: "Yes",
          });
        }

      }

      return res.status(200).json({
        status: "success",
        mssg: "User can't access this page",
        page_access: "No",
      });

    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error", mssg: "Server Error" });
    }
  }
);

module.exports = router;