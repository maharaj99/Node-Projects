const express = require('express');
const router = express.Router();

const Employee = require('../models/EmployeeDetails');
const OtpDetails = require('../models/OtpDetails');

const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtSign = '!@#$%^123456789!#$$';


// ===================================================
// ROUTER : 1 Send OTP For Login ( POST method api : /api/hrLogin/loginSendOtp )
// ===================================================

router.post('/loginSendOtp', [

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
            let EmployeeDetails = await Employee.findOne({ ph_num: ph_num, employee_type: "Hr" });
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
// ROUTER : 2 After Send OTP Check Otp, otp id, ph num for login ( POST method api : /api/hrLogin/loginCheckOtp )
// ===================================================

router.post('/loginCheckOtp', [

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
                otp
            } = req.body;

            // Check User Name valid or not
            let EmployeeDetails = await Employee.findOne({ ph_num: ph_num, employee_type: "Hr" });
            if (!EmployeeDetails) {
                return res.status(200).json({ status: 'error', mssg: 'Phone Number Not Valid', });
            }

            // Check ph num and otp valid or not
            let LoginOtpDetails = await OtpDetails.findOne({ ph_num: ph_num, otp: otp, _id: otp_id });
            if (!LoginOtpDetails) {
                return res.status(200).json({ status: 'error', mssg: 'OTP is invalid' });
            }

            await OtpDetails.deleteOne({ ph_num: ph_num, otp: otp, _id: otp_id });

            // If phnum and otp is perfect 
            const data = {
                id: EmployeeDetails.id
            }
            const authToken = jwt.sign(data, jwtSign);
            res.status(200).json({ status: 'success', mssg: 'Login Successfully', authToken });

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 'error', mssg: 'Server Error' });
        }
    }
})


// ===================================================
// ROUTER : 3 Login via username password ( POST method api : /api/hrLogin/loginUsername )
// ===================================================

router.post('/loginUsername', [

    body('user_name')
        .notEmpty().withMessage('User Name Empty !')
        .isLength({ max: 50 }).withMessage('User Name Max Length Is 50 !'),

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
                user_name,
                password
            } = req.body;

            // Check User Name valid or not
            let EmployeeDetails = await Employee.findOne({ user_name: user_name, employee_type: "Hr" });
            if (!EmployeeDetails) {
                return res.status(200).json({ status: 'error', mssg: 'Wrong Credential', });
            }

            // Paswword check
            const passwordCompare = await bcrypt.compare(password, EmployeeDetails.password);
            if (!passwordCompare) {
                return res.status(200).json({ status: 'error', mssg: 'Wrong Credential', });
            }


            // If username and password match
            const data = {
                id: EmployeeDetails.id
            }
            const authToken = jwt.sign(data, jwtSign);
            res.status(200).json({ status: 'success', mssg: 'Login Successfully', authToken });

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 'error', mssg: 'Server Error' });
        }
    }
})


module.exports = router;