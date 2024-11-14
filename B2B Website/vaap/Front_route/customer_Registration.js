//imports
const express = require('express');
const router = express.Router();
const Registration=require('../model/customerMasterSchema')
const otpdetails = require('../model/otp_details');
const address= require('../model/addressMasterSchema');
const { body, validationResult } = require('express-validator');
const UploadFiles = require('../middleware/front_uploadfiles');
const sendMail = require('../middleware/email_sender');
const bcrypt = require('bcrypt');

  
//.............................................................
// ROUTER 1 :  Register post method api :/customer/registration/insertCustomer
//.............................................................

router.post('/insertCustomer', 
UploadFiles.userDocument, 
[
    body('customer_name').notEmpty().withMessage('customer Name Empty !')
    .isLength({ max: 50 }).withMessage('customer Name Max Length Is 50 !'),

    body('email')
    .notEmpty().withMessage('Email ID Empty !')
    .isEmail().withMessage('Enter A Valid Email !'),

    body("country_code").notEmpty().withMessage("Country Code is required"),

    
    body('ph_num')
        .notEmpty().withMessage('Phone Number Empty !')
        .isMobilePhone().withMessage('Enter A Valid Phone Number !')
        .isLength({ min: 10, max: 10 }).withMessage('Enter A Valid Phone Number !'),


    body("address").notEmpty().withMessage("Address is required"),

    body('user_name').notEmpty().withMessage('User Name Empty !')
    .isLength({ max: 50 }).withMessage('User Name Max Length Is 50 !'),

    body('password')
    .notEmpty().withMessage('Password Empty !')
    .matches(/[\W_]/).withMessage('Password must contain at least one special character (e.g., !@#$%^&*)'),
    
    body('company_name').notEmpty().withMessage('Company Name Empty !'),

    body("contact_person")
        .notEmpty().withMessage("Contact Person is required")
        .isMobilePhone().withMessage('Enter A Valid Phone Number !')
        .isLength({ min: 10, max: 10 }).withMessage('Enter A Valid Phone Number !'),

    body("full_name").notEmpty().withMessage("Full Name is required"),


    body('zip_code').notEmpty().withMessage('zipcode Name Empty !')
    .isNumeric().withMessage('zipcode must be a numeric value'),

    body("street_address_1")
    .notEmpty()
    .withMessage("Street Address 1 is required"),

    body("street_address_2")
        .notEmpty()
        .withMessage("Street Address 2 is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("state").notEmpty().withMessage("State is required"),

    body("authority_number")
        .notEmpty()
        .withMessage("Authority Number is required"),

    body("ein").notEmpty().withMessage("EIN is required"),


], 
async (req, res,next) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const errorsArray = errors.array();
        return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    }
    else {
        try {
                const 
                {

                    customer_name,
                    email,
                    country_code,
                    ph_num,
                    address,
                    user_name,
                    password,
                    company_name,
                    contact_person,
                    full_name,
                    dba_name,
                    zip_code,
                    street_address_1,
                    street_address_2,
                    city,
                    state,
                    authority_number,
                    ein,


                } = req.body;
               
                
                // Check User Name exist or not
                let UserName = await Registration.findOne({ user_name: user_name });
                if (UserName) {
                    return res.status(200).json({ status: 'error', field: 'user_name', mssg: 'User Name Already Exist', });
                }

                // Check Phone Number exist or not
                let PhNum = await Registration.findOne({ ph_num: ph_num });
                if (PhNum) {
                    return res.status(200).json({ status: 'error', field: 'ph_num', mssg: 'Phone Number Already Exist', });
                }

                // Check Email ID exist or not
                let EmailID = await Registration.findOne({ email: email });
                if (EmailID) {
                    return res.status(200).json({ status: 'error', field: 'email_id', mssg: 'Email ID Already Exist', });
                }

               

                const { upload_file_1, upload_file_2} = req.files || {};
                
                let filename1 = upload_file_1 ? upload_file_1[0].filename : "";
                let filename2 = upload_file_2 ? upload_file_2[0].filename : "";

              



                const salt = await bcrypt.genSalt(10);
                const encodedPassword = await bcrypt.hash(password, salt);


                //save data in mongo 
                Registration.create
                ({
                    customer_name: customer_name,
                    email: email,
                    country_code: country_code,
                    ph_num: ph_num,
                    address: address,
                    user_name: user_name,
                    password: encodedPassword,
                    company_name: company_name,
                    contact_person: contact_person,
                    full_name: full_name,
                    dba_name: dba_name,
                    zip_code: zip_code,
                    street_address_1: street_address_1, 
                    street_address_2: street_address_2,
                    city: city,
                    state: state,
                    authority_number: authority_number,
                    ein: ein,
                    upload_file_1: "file_upload/" + filename1,
                    upload_file_2: "file_upload/" + filename2,


                })
                    .then(Registration => {
                        next();
                        return res.status(200).json({ status: 'success', mssg: 'Employee Details Saved Successfully', id: Registration.id });
                    })
                    .catch(err => {
                        console.log(err)
                        return res.status(200).json({ status: 'error', mssg: err.message });
                    })


        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 'error', mssg: 'Server Error' });
        }
    }
},sendMail.RagisterConfirmationSendMail)



//.......................................
// ROUTER 2 : Register Send Otp :/customer/registration/SendOtp
//.........................................

router.post('/SendOtp',[
    body('email')
    .notEmpty().withMessage('Email ID Empty !')
    .isEmail().withMessage('Enter A Valid Email !')
], async (req, res,next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            const errorsArray = errors.array();
            return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg']});
        }

    try {
                const {
                    // user_name,
                    email
                } = req.body;

                // Check Email ID exist or not
                let EmailID = await Registration.findOne({ email: email });
                if (EmailID) {
                    return res.status(200).json({ status: 'error', field: 'email_id', mssg: 'Email ID Already Exist'});
                }
            // Generate the OTP
            const digits = '0123456789';
            let otp = (1 + Math.floor(Math.random() * 9)).toString(); 
            // First digit between 1 and 9

            for (let i = 1; i < 6; i++) {
                otp += digits[Math.floor(Math.random() * 10)];
            }

            // Log the generated OTP to the console
            // console.log('Generated OTP:', otp);


                    // Save the OTP details to the database
                        await otpdetails.deleteMany({ email: email, otp: { $ne: otp } });
                        await otpdetails.create({
                            email: email,
                            otp: otp
                        })

                        .then(reg_otp => {
                            next();
                        return res.status(200).json({
                            status: 'success',
                            mssg: 'OTP Sent Successfully via Email',
                            otp: '',
                            otp_id: reg_otp.id
                        });
                    }) .catch (err => {
                        console.log(err);
                        return res.status(200).json({ status: 'error', mssg: err.message });
                    })
            
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }
},sendMail.otpSendMail);





// ===================================================
// ROUTER : 3 Register Otp Check ( POST method api : /customer/registration/otpCheck )
// ===================================================

router.post('/otpCheck', [

    // body('otp_id')
    //     .notEmpty().withMessage('OTP Id Empty !'),

    body('email')
        .notEmpty().withMessage('Email ID Empty !')
        .isEmail().withMessage('Enter A Valid Email !'),

    body('otp')
        .notEmpty().withMessage('Otp Empty !')
        .isNumeric().withMessage('Only Number Accepted !')
        .isLength({ min: 6, max: 6 }).withMessage('Enter A Valid OTP !'),

], async (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const errorsArray = errors.array();
        return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    }
    else {
        try {

            const {
                // otp_id,
                email,
                otp
            } = req.body;

            // Check email_id and otp valid or not
            let RegisterOtpDetails = await otpdetails.findOne({ email: email, otp: otp});
            if (!RegisterOtpDetails) {
                return res.status(200).json({ status: 'error', mssg: 'OTP is invalid' });
            }
            await otpdetails.deleteMany({ email: email, otp: otp });

            res.status(200).json({ status: 'success', mssg: 'Otp Match Successfully', });

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 'error', mssg: 'Server Error' });
        }
    }
})




// ===================================================
// ROUTER : 4 Username Check ( POST method api : /customer/registration/userNameCheck
// ===================================================

router.post('/userNameCheck', [

    body('user_name')
        .notEmpty().withMessage('User Name Empty !')
        .isLength({ max: 50 }).withMessage('User Name Max Length Is 50 !'),

], async (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const errorsArray = errors.array();
        return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    }
    else {
        try {

            const {
                user_name
            } = req.body;

            // Check Username exist or not
            let UserDetails = await Registration.findOne({ user_name: user_name });
            if (UserDetails) {
                return res.status(200).json({ status: 'error', field: 'user_name', mssg: 'Username Already Exist', });
            }
            else {
                return res.status(200).json({ status: 'success', field: 'user_name', mssg: 'Username is available', });
            }

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 'error', mssg: 'Server Error' });
        }
    }
})


// ===================================================
// ROUTER : 5 Email Check ( POST method api : /customer/registration/userEmailCheck
// ===================================================

router.post('/userEmailCheck', [

    body('email')
    .notEmpty().withMessage('Email ID Empty !')
    .isEmail().withMessage('Enter A Valid Email !'),

], async (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const errorsArray = errors.array();
        return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    }
    else {
        try {

            const {
                email
            } = req.body;

            // Check Username exist or not
            let UserDetails = await Registration.findOne({ email: email });
            if (UserDetails) {
                return res.status(200).json({ status: 'error', field: 'email', mssg: 'Email Already Exist', });
            }
            else {
                return res.status(200).json({ status: 'success', field: 'email', mssg: 'Email can be use', });
            }

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 'error', mssg: 'Server Error' });
        }
    }
})




// ===================================================
// ROUTER : 6 phone number Check ( POST method api : /customer/registration/userPhoneNumberCheck
// ===================================================

router.post('/userPhoneNumberCheck', [

    body('ph_num')
    .notEmpty().withMessage('Phone Number Empty !')
    .isMobilePhone().withMessage('Enter A Valid Phone Number !')
    .isLength({ min: 10, max: 10 }).withMessage('Enter A Valid Phone Number !'),

], async (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const errorsArray = errors.array();
        return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    }
    else {
        try {

            const {
                ph_num
            } = req.body;

            // Check Username exist or not
            let UserDetails = await Registration.findOne({ ph_num: ph_num });
            if (UserDetails) {
                return res.status(200).json({ status: 'error', field: 'ph_num', mssg: 'Phone Number Already Exist', });
            }
            else {
                return res.status(200).json({ status: 'success', field: 'ph_num', mssg: 'Phone number can be use', });
            }

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 'error', mssg: 'Server Error' });
        }
    }
})


// ===================================================
// ROUTER : 7 city & state fatch by zipcode ( POST method api : /customer/registration/CityState
// ===================================================

router.post('/CityState', [
    body('zip_code').notEmpty().withMessage('zipcode Name Empty !')
    .isNumeric().withMessage('zipcode must be a numeric value'),

  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.status(200).json({ status: 'error', field: errorsArray[0].param, mssg: errorsArray[0].msg });
    }
    else {
        try {
          const { zip_code } = req.body; 
   
  
          const Address = await address.find({zipcode:zip_code }, {city:1,state:1});
  
          if (Address) {
            // Category details found, send a success response
            return res.status(200).json({ status: 'success', mssg: 'city & State fatch successfully',data: Address });
          } else {
            // Category not found, send an error response
            return res.status(200).json({ status: 'error', mssg: 'zipcode not found' });
          }
        
         } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 'error', mssg: 'Internal server error' });
      }
    }
  });







// .......................................................................
// ROUTER :password,confirm_pw Check :/nextcheck/finalCheck ..UN
// .......................................................................

// router.post('/finalCheck', [
//     body('user_name')
//         .notEmpty().withMessage('User Name Empty !')
//         .isLength({ max: 50 }).withMessage('User Name Max Length Is 50 !'),

//     body('password')
//     .notEmpty().withMessage('Password Empty !')
//     .matches(/[\W_]/).withMessage('Password must contain at least one special character (e.g., !@#$%^&*)'),

//     body('confirm_password').notEmpty().withMessage('confirm_Password Empty !')
//         .custom((value, { req }) => {
//             if (value !== req.body.password) {
//                 throw new Error('Passwords do not match');
//             }
//             return true;
//         }),

//     body('email_id') 
//         .notEmpty().withMessage('Email ID Empty !')
//         .isEmail().withMessage('Enter A Valid Email !'),

// ], async (req, res) => {

//     const errors = validationResult(req)
//     if (!errors.isEmpty()) {
//         const errorsArray = errors.array();
//         return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
//     }
//     else {
//         try {

//             const {
//                 user_name,
//                 email_id
//             } = req.body;

//             // Check User Name exist or not
//             let UserNae = await Registration.findOne({ User_name: user_name });
//             if (UserNae) {
//             return res.status(200).json({ status: 'error', field: 'user_name', mssg: 'User Name Already Exist', });
//             }
            
//             // Check Email ID exist or not
//             let EmailID = await Registration.findOne({ email: email_id });
//             if (EmailID) {
//                 return res.status(200).json({ status: 'error', field: 'email_id', mssg: 'Email ID Already Exist', });
//             }
//             else {
//                 return res.status(200).json({ status: 'success', field: 'email_id', mssg: 'Email Id Not Exist', });
//             }


            
//         } 
//         catch (error) {
//             console.log(error);
//             res.status(500).json({ status: 'error', mssg: 'Server Error' });
//         }
//     }
// })



module.exports = router;