const express = require("express");
const router = express.Router();
const settings = require("../../models/settings");
const { body, validationResult } = require("express-validator");
const verifyUser = require("../../middleware/adminVerifyUser");

//.............................................................
// ROUTER 1:  Insert Data [ post method api : /api/admin/settings/insertData ]
//.............................................................
router.post("/insertData", verifyUser, [

  body("job_post_auto_approve")
    .notEmpty()
    .withMessage("Job Post Auto Approve is required!")
    .isIn(["Yes", "No"])
    .withMessage('Job Post Auto Approve should be either "Yes" or "No"!'),

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
        job_post_auto_approve,
        loginEntryPermision,
        loginEditPermision
      } = req.body;

      let settingsDataget = await settings.findOne().select("_id");

      if (settingsDataget) {

        //check the login user have entry permission
        if (loginEditPermision !== "Yes") {
          return res
            .status(200)
            .json({
              status: "error",
              mssg: "User does not have permission to Update any data",
            });
        }

        const updated = await settings.findByIdAndUpdate(
          settingsDataget._id,
          {
            job_post_auto_approve: job_post_auto_approve,
          },
          { new: true }
        );

        if (updated) {
          res.status(200).json({
            status: "success",
            message: "Data updated successfully",
            data: updated,
          });
        } else {
          res
            .status(200)
            .json({ status: "error", mssg: "Data Not Updated" });
        }

      }
      else {

        //check the login user have entry permission
        if (loginEntryPermision !== "Yes") {
          return res
            .status(200)
            .json({
              status: "error",
              mssg: "User does not have permission to Insert any data",
            });
        }

        //save data in mongo
        await settings
          .create({
            job_post_auto_approve: job_post_auto_approve,
          })
          .then((menuMaster) => {
            return res.status(200).json({
              status: "success",
              mssg: "Data Saved Successfully",
            });
          })
          .catch((err) => {
            console.log(err);
            return res.status(200).json({ status: "error", mssg: err.mssg });
          });

      }

    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error", mssg: "Server Error" });
    }
  }
);


//.............................................................
// ROUTER 2:  Get Data [ post method api : /api/admin/settings/getData ]
//.............................................................
router.get("/getData", verifyUser, async (req, res) => {

  try {

    let settingsDataget = await settings.find({}, { __v: 0 });

    res.status(200).json({
      status: "success",
      message: "Data Fetched successfully",
      data: settingsDataget,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", mssg: "Server Error" });
  }
}
);


module.exports = router;