const express = require('express');
const router = express.Router();

const Employee = require('../models/EmployeeDetails');
const OtpDetails = require('../models/OtpDetails');

const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');


// ===================================================
// ROUTER : 1 Send OTP For Forgot Password ( POST method api : /api/jobseekerForgotPassword/sendOtp )
// ===================================================

router.post('/sendOtp', [

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

            // Check Phone Number Exist Or Not
            let EmployeeDetails = await Employee.findOne({ ph_num: ph_num, employee_type: "Job Seeker" });
            if (!EmployeeDetails) {
                return res.status(200).json({ status: 'error', mssg: 'Phone Number is Invalid', });
            }

            // If phone number valid
            const digits = '0123456789';
            let otp = '';
            for (let i = 0; i < 6; i++) {
                otp += digits[Math.floor(Math.random() * 10)];
            }

            await OtpDetails.deleteOne({ ph_num: ph_num, otp: otp });

            OtpDetails.create({
                ph_num: ph_num,
                otp: otp,
            })
                .then(saveOtp => {
                    return res.status(200).json({
                        status: 'success',
                        mssg: 'Otp Send Successfully',
                        otp,
                        otp_id: saveOtp.id
                    });
                })
                .catch(err => {
                    console.log(err)
                    return res.status(500).json({ status: 'error', mssg: err.message });
                })

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 'error', mssg: 'Server Error' });
        }
    }
})


// ===================================================
// ROUTER : 2 After Send OTP Check Otp, otp id, ph num for Forgot Password ( POST method api : /api/jobseekerForgotPassword/savePassword )
// ===================================================

router.post('/savePassword', [

    body('otp_id')
        .notEmpty().withMessage('OTP Id Empty !'),

    body('ph_num')
        .notEmpty().withMessage('Phone Number Empty !')
        .isMobilePhone().withMessage('Enter A Valid Phone Number !')
        .isLength({ min: 10, max: 10 }).withMessage('Enter A Valid Phone Number !'),

    body('otp')
        .notEmpty().withMessage('Otp Empty !')
        .isNumeric().withMessage('Only Number Accepted !')
        .isLength({ min: 6, max: 6 }).withMessage('Enter A Valid OTP !'),

    body('password').notEmpty().withMessage('Password Empty !'),

], async (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const errorsArray = errors.array();
        return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    }
    else {
        try {

            const {
                otp_id,
                ph_num,
                otp,
                password
            } = req.body;

            // Check Phone Number valid or not
            let EmployeeDetails = await Employee.findOne({ ph_num: ph_num, employee_type: "Job Seeker" });
            if (!EmployeeDetails) {
                return res.status(200).json({ status: 'error', mssg: 'Phone Number Not Valid', });
            }

            // Check ph num and otp valid or not
            let CheckOtpDetails = await OtpDetails.findOne({ ph_num: ph_num, otp: otp, _id: otp_id });
            if (!CheckOtpDetails) {
                return res.status(200).json({ status: 'error', mssg: 'OTP is invalid' });
            }

            await OtpDetails.deleteOne({ ph_num: ph_num, otp: otp, _id: otp_id });

            const salt = await bcrypt.genSalt(10);
            const encodedPassword = await bcrypt.hash(password, salt);

            const updateProcess = await Employee.findOneAndUpdate({ _id: EmployeeDetails.id }, {
                password: encodedPassword,
            }, { new: true });

            if (updateProcess) {
                res.status(200).json({ status: 'success', mssg: 'Password Updated Successfully' });
            }
            else {
                res.status(200).json({ status: 'error', mssg: 'Details Not Found' });
            }


        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 'error', mssg: 'Server Error' });
        }
    }
})


module.exports = router;