//imports
const express = require('express');
const router = express.Router();

const report_user = require("../../models/report_user");

const verifyUser = require('../../middleware/adminVerifyUser');


//.............................................................
// ROUTER 1:  Get Report List [ get method api : /api/admin/reportUser/getList ]
//.............................................................
router.get("/getList", verifyUser, async (req, res) => {
  try {

    const { loginViewPermision } = req.body;

    //check the login user have entry permission
    if (loginViewPermision !== "Yes") {
      return res
        .status(200)
        .json({
          status: "error",
          mssg: "User does not have permission to View Any Data",
        });
    }

    const dataGet = await report_user.aggregate([

      {
        $lookup: {
          from: "employee_details",
          localField: "report_to_employee_code",
          foreignField: "_id",
          as: "report_to_employee_details",
        },
      },

      {
        $lookup: {
          from: "employee_details",
          localField: "report_employee_code",
          foreignField: "_id",
          as: "report_employee_details",
        },
      },
      
      {
        $project: {
          "_id": 1,
          "report_to_employee_code": 1,
          "report_to_employee_details.employee_type": 1,
          "report_to_employee_details.first_name": 1,
          "report_to_employee_details.last_name": 1,
          "report_to_employee_details.full_name": 1,
          "report_to_employee_details.user_name": 1,
          "report_to_employee_details.ph_num": 1,
          "report_to_employee_details.email_id": 1,
          "report_to_employee_details.employee_image": 1,
          "message": 1,
          "report_employee_code": 1,
          "report_employee_details.employee_type": 1,
          "report_employee_details.first_name": 1,
          "report_employee_details.last_name": 1,
          "report_employee_details.full_name": 1,
          "report_employee_details.user_name": 1,
          "report_employee_details.ph_num": 1,
          "report_employee_details.email_id": 1,
          "report_employee_details.employee_image": 1,
          "report_datetime": 1,
        },
      },
    ]);

    return res.status(200).json({
      status: "success",
      mssg: "Data fetched successfully",
      data: dataGet,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", mssg: "Server Error" });
  }
});


module.exports = router;