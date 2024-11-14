const express = require("express");
const router = express.Router();

const { body, validationResult } = require("express-validator");
const verifyUser = require("../middleware/adminverifyuser");
const client_testimonial = require("../model/client_testimonial");

//.............................................................
// ROUTER 1:  Add Client Testimonial post method api :/admin/manageClientTestimonial/addClientTestimonial
//.............................................................
router.post("/addClientTestimonial", verifyUser, [

  body("client_name").notEmpty().withMessage("Client Name is required"),

  body("client_mssg").notEmpty().withMessage("Client Message is required"),

  body("active")
    .notEmpty()
    .withMessage("Active is required!")
    .isIn(["Yes", "No"])
    .withMessage('Active should be either "Yes" or "No"!'),

  body("order_no")
    .isNumeric().withMessage('Order Number Only Number Accepted !')
    .notEmpty().withMessage("Order Number is required"),

], async (req, res) => {
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
      client_name,
      client_mssg,
      active,
      order_no,
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

    //save data in mongo
    client_testimonial.create({
      client_name: client_name,
      client_mssg: client_mssg,
      active: active,
      order_no: order_no,
      entry_user_code: userCode,
    })
      .then((data) => {
        return res.status(200).json({
          status: "success",
          mssg: "Client Testimonial Saved Successfully",
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
// ROUTER 2:  Client Testimonial List Fetch get method api :/admin/manageClientTestimonial/getClientTestimonialList
//.............................................................
router.get("/getClientTestimonialList", verifyUser, async (req, res) => {
  try {
    const { loginViewPermision } = req.body;
    //check the login user have entry permission
    if (loginViewPermision !== "Yes") {
      return res
        .status(200)
        .json({
          status: "error",
          mssg: "User does not have permission to View any Data",
        });
    }
    const result = await client_testimonial.find({}, { __v: 0, entry_user_code: 0, entry_timestamp: 0, }).sort({ "entry_timestamp": -1 });

    if (result) {
      res
        .status(200)
        .json({
          status: "success",
          mssg: "Client Testimonial List Fetched Successfully",
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
// ROUTER 3:  Client Testimonial Details Fetched post method api :/admin/manageClientTestimonial/getClientTestimonialDetails
//.............................................................
router.post("/getClientTestimonialDetails", verifyUser, [

  body("client_testimonial_code")
    .notEmpty()
    .withMessage("Client Testimonial Code Empty !")
    .isMongoId()
    .withMessage("Client Testimonial Code Value Is Invalid !"),

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
      const client_testimonial_code = req.body.client_testimonial_code;
      const { loginViewPermision } = req.body;

      //check the login user have entry permission
      if (loginViewPermision !== "Yes") {
        return res
          .status(200)
          .json({
            status: "error",
            mssg: "User does not have permission to View any Data",
          });
      }

      const result = await client_testimonial.findById(client_testimonial_code, { __v: 0, entry_user_code: 0, entry_timestamp: 0, });

      if (result) {
        res
          .status(200)
          .json({
            status: "success",
            mssg: "Client Testimonial Fetched Successfully",
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
// ROUTER 4: Update Client Testimonial post method api :/admin/manageClientTestimonial/updateClientTestimonial
//.............................................................
router.post("/updateClientTestimonial", verifyUser, [

  // Add validation rules using express-validator
  body("client_testimonial_code")
    .notEmpty()
    .withMessage("Client Testimonial Code Empty !")
    .isMongoId()
    .withMessage("Client Testimonial Code Value Is Invalid !"),

  body("client_name").notEmpty().withMessage("Client Name is required"),

  body("client_mssg").notEmpty().withMessage("Client Message is required"),

  body("active")
    .notEmpty()
    .withMessage("Active is required!")
    .isIn(["Yes", "No"])
    .withMessage('Active should be either "Yes" or "No"!'),

  body("order_no")
    .isNumeric().withMessage('Order Number Only Number Accepted !')
    .notEmpty().withMessage("Order Number is required"),

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
          client_testimonial_code,
          userCode,
          client_name,
          client_mssg,
          active,
          order_no,
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

        const updated = await client_testimonial.findByIdAndUpdate(
          client_testimonial_code,
          {
            client_name: client_name,
            client_mssg: client_mssg,
            order_no: order_no,
            active: active,
            entry_user_code: userCode,
          },
          { new: true }
        );

        if (updated) {
          res.status(200).json({
            status: "success",
            mssg: "Client Testimonial updated successfully",
          });
        } else {
          res
            .status(200)
            .json({ status: "error", mssg: "Client Testimonial Id not Found." });
        }
      } catch (error) {
        console.log(error.message);
        res.status(500).json({ status: "error", mssg: "Server Error" });
      }
    }
  }
);
//.............................................................
// ROUTER 5:  Delete Client Testimonial post method api :/admin/manageClientTestimonial/deleteClientTestimonial
//.............................................................

router.post("/deleteClientTestimonial", verifyUser, [

  body("client_testimonial_code")
    .notEmpty()
    .withMessage("Client Testimonial Code Empty !")
    .isMongoId()
    .withMessage("Client Testimonial Code Value Is Invalid !"),
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
      const client_testimonial_code = req.body.client_testimonial_code;
      const { loginDeletePermision } = req.body;
      //check the login user have entry permissionmssg
      if (loginDeletePermision !== "Yes") {
        return res
          .status(200)
          .json({
            status: "error",
            mssg: "User does not have permission to Delete any Data",
          });
      }

      const result = await client_testimonial.findByIdAndDelete(client_testimonial_code);

      if (result) {
        res.status(200).json({
          status: "success",
          mssg: "Client Testimonial deleted successfully",
        });
      } else {
        return res
          .status(200)
          .json({ status: "error", mssg: "Failed to delete Client Testimonial" });
      }
    } catch (error) {
      console.log(error.mssg);
      res.status(500).json({ status: "error", mssg: "Server Error" });
    }
  }
);

module.exports = router;
