//imports
const express = require('express');
const router = express.Router();
const Registration = require('../model/customerMasterSchema');
const otpdetails = require('../model/otp_details');
const { body, validationResult } = require('express-validator');
// const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const sendMail = require('../middleware/email_sender');




//............................
//ROUTER : 1: Send Otp for password change :/customer/forgetPassword/sendOtp
//............................
router.post('/sendOtp',[

    body('email')
    .notEmpty().withMessage('Email ID Empty !')
    .isEmail().withMessage('Enter A Valid Email !'),

], async (req, res,next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            const errorsArray = errors.array();
            return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
        }

    try {
                const {
                    email
                } = req.body;

                // Check Email ID exist or not
                let EmailID = await Registration.findOne({ email: email });
                if (!EmailID) {
                    return res.status(200).json({ status: 'error', field: 'email', mssg: 'Email ID Is Not Found', });
                }
            // Generate the OTP
            const digits = '0123456789';
            let otp = (1 + Math.floor(Math.random() * 9)).toString(); 

            for (let i = 1; i < 6; i++) {
                otp += digits[Math.floor(Math.random() * 10)];
            }

            // Log the generated OTP to the console

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
                    }).catch (err => {
                        console.log(err);
                        return res.status(200).json({ status: 'error', mssg: err.message });
                    })

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }
},sendMail.forgetPasswordSendMail);



// ===================================================
// ROUTER : 2 After Send OTP Check Otp, otp id, email for Forgot Password ( POST method api : /customer/forgetPassword/savePassword
// ===================================================

router.post('/savePassword', [

        body('email')
        .notEmpty().withMessage('Email ID Empty !')
        .isEmail().withMessage('Enter A Valid Email !'),

    body('otp')
        .notEmpty().withMessage('Otp Empty !')
        .isNumeric().withMessage('Only Number Accepted !')
        .isLength({ min: 6, max: 6 }).withMessage('Enter A Valid OTP !'),

    body('password')
    .notEmpty().withMessage('Password Empty !')
    .matches(/[\W_]/).withMessage('Password must contain at least one special character (e.g., !@#$%^&*)'),
    
    body('confirm_password').notEmpty().withMessage('Confirm Password Empty!')
    .custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match');
        }
        return true;
    }),

],  async (req, res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorsArray = errors.array();
        return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'] });
    } else {
        try {
            const {
                email,
                // otp_id,
                otp,
                password
            } = req.body;


            // Check Email valid or not
            let Details = await Registration.findOne({ email: email });
            if (!Details) {
                return res.status(200).json({ status: 'error', mssg: 'Email Not Valid' });
            }

            // Check OTP validity
            let CheckOtpDetails = await otpdetails.findOne({otp: otp });
            if (!CheckOtpDetails) {
                return res.status(200).json({ status: 'error', mssg: 'OTP is invalid' });
            }

            // Delete the used OTP document from the database
            await otpdetails.deleteMany({ email: email,otp: otp});
            // await otpdetails.deleteOne({  email_id: email_id,otp: otp, _id: otp_id });

            // Hash the new password
            const salt = await bcrypt.genSalt(10);
            const encodedPassword = await bcrypt.hash(password, salt);

            const updateProcess = await Registration.findOneAndUpdate(
                { email: email },
                { password: encodedPassword }, 
                { new: true }
            );
            next();

            if (updateProcess) {
                res.status(200).json({ status: 'success', mssg: 'Password Updated Successfully' });
            } else {
                res.status(200).json({ status: 'error', mssg: 'Customer Not Found' });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 'error', mssg: 'Server Error' });
        }
    }
},sendMail.passwordSaveSendMail);

module.exports = router;

