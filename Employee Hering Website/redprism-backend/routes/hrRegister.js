const express = require('express');
const router = express.Router();

const Employee = require('../models/EmployeeDetails');
const OtpDetails = require('../models/OtpDetails');
const CompanyDetails = require('../models/company_details');

const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');


// ===================================================
// ROUTER : 1 Email Check ( POST method api : /api/hrRegister/emailCheck )
// ===================================================
router.post('/emailCheck', [

    body('email_id')
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
                email_id
            } = req.body;

            if (email_id.includes("gmail")) {
                return res.status(200).json({ status: 'error', field: 'email_id', mssg: 'Not Accept Gmail. Only Use Official Mail', });
            }
            if (email_id.includes("outlook")) {
                return res.status(200).json({ status: 'error', field: 'email_id', mssg: 'Not Accept Outlook. Only Use Official Mail', });
            }
            if (email_id.includes("yahoo")) {
                return res.status(200).json({ status: 'error', field: 'email_id', mssg: 'Not Accept Yahoo. Only Use Official Mail', });
            }
            if (email_id.includes("reddiffmail")) {
                return res.status(200).json({ status: 'error', field: 'email_id', mssg: 'Not Accept Reddiffmail. Only Use Official Mail', });
            }

            // Check Email ID exist or not
            let EmployeeDetails = await Employee.findOne({ email_id: email_id });
            if (EmployeeDetails) {
                return res.status(200).json({ status: 'error', field: 'email_id', mssg: 'Email Id Already Exist', });
            }
            else {
                return res.status(200).json({ status: 'success', field: 'email_id', mssg: 'Email Id Not Exist', });
            }

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 'error', mssg: 'Server Error' });
        }
    }
})

// ===================================================
// ROUTER : 2 Register Send Otp ( POST method api : /api/hrRegister/registerSendOtp )
// ===================================================
router.post('/registerSendOtp', [

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
            let EmployeeDetails = await Employee.findOne({ ph_num: ph_num });
            if (EmployeeDetails) {
                return res.status(200).json({ status: 'error', mssg: 'Phone Number Already Exist', });
            }

            // If phone number not found
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
                .then(reg_otp => {
                    return res.status(200).json({
                        status: 'success',
                        mssg: 'Otp Send Successfully',
                        otp,
                        otp_id: reg_otp.id
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
// ROUTER : 3 Register Otp Check ( POST method api : /api/hrRegister/registerOtpCheck )
// ===================================================
router.post('/registerOtpCheck', [

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

            // Check ph num and otp valid or not
            let RegisterOtpDetails = await OtpDetails.findOne({ ph_num: ph_num, otp: otp, _id: otp_id });
            if (!RegisterOtpDetails) {
                return res.status(200).json({ status: 'error', mssg: 'OTP is invalid' });
            }

            await OtpDetails.deleteOne({ ph_num: ph_num, otp: otp, _id: otp_id });

            res.status(200).json({ status: 'success', mssg: 'Otp Match Successfully', });

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 'error', mssg: 'Server Error' });
        }
    }
})

// ===================================================
// ROUTER : 4 Username Check ( POST method api : /api/hrRegister/usernameCheck
// ===================================================
router.post('/usernameCheck', [

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
            let EmployeeDetails = await Employee.findOne({ user_name: user_name });
            if (EmployeeDetails) {
                return res.status(200).json({ status: 'error', field: 'user_name', mssg: 'Username Already Exist', });
            }
            else {
                return res.status(200).json({ status: 'success', field: 'user_name', mssg: 'Username Not Exist', });
            }

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 'error', mssg: 'Server Error' });
        }
    }
})


// ===================================================
// ROUTER : 5 Get Active Company List ( GET method api : /api/hrRegister/getCompanyList )
// ===================================================
router.get('/getCompanyList', async (req, res) => {

    try {

        // Fetch Company Details
        let companyList = await CompanyDetails.find ({ active: "Yes" })
        .select('company_name');

        if (companyList) {
            return res.status(200).json({ status: 'success', mssg: 'Company List Fetched Successfully', companyList: companyList });
        }
        else {
            return res.status(200).json({ status: 'error', mssg: 'Not Found', });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }
})


// ===================================================
// ROUTER : 6 Register post method api : /api/hrRegister/register
// ===================================================
router.post('/register', [
    body('first_name').notEmpty().withMessage('First Name Empty !'),
    body('last_name').notEmpty().withMessage('Last Name Empty !'),
    body('user_name').notEmpty().withMessage('User Name Empty !')
        .isLength({ max: 50 }).withMessage('User Name Max Length Is 50 !'),

    body('password').notEmpty().withMessage('Password Empty !'),

    body('ph_num')
        .notEmpty().withMessage('Phone Number Empty !')
        .isMobilePhone().withMessage('Enter A Valid Phone Number !')
        .isLength({ min: 10, max: 10 }).withMessage('Enter A Valid Phone Number !'),

    body('email_id')
        .notEmpty().withMessage('Email ID Empty !')
        .isEmail().withMessage('Enter A Valid Email !'),

    body('company_code')
        .notEmpty().withMessage('Company Empty !')
        .isMongoId().withMessage('Filed Value Is Invalid !'),

], async (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const errorsArray = errors.array();
        return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    }
    else {
        try {

            const {
                first_name,
                last_name,
                user_name,
                password,
                ph_num,
                email_id,
                company_code
            } = req.body;

            if (email_id.includes("gmail")) {
                return res.status(200).json({ status: 'error', field: 'email_id', mssg: 'Not Accept Gmail. Only Use Official Mail', });
            }
            if (email_id.includes("outlook")) {
                return res.status(200).json({ status: 'error', field: 'email_id', mssg: 'Not Accept Outlook. Only Use Official Mail', });
            }
            if (email_id.includes("yahoo")) {
                return res.status(200).json({ status: 'error', field: 'email_id', mssg: 'Not Accept Yahoo. Only Use Official Mail', });
            }
            if (email_id.includes("reddiffmail")) {
                return res.status(200).json({ status: 'error', field: 'email_id', mssg: 'Not Accept Reddiffmail. Only Use Official Mail', });
            }

            let full_name = first_name+" "+last_name;

            // Check User Name exist or not
            let EmployeeUserName = await Employee.findOne({ user_name: user_name });
            if (EmployeeUserName) {
                return res.status(200).json({ status: 'error', field: 'user_name', mssg: 'User Name Already Exist', });
            }

            // Check Phone Number exist or not
            let EmployeePhNum = await Employee.findOne({ ph_num: ph_num });
            if (EmployeePhNum) {
                return res.status(200).json({ status: 'error', field: 'ph_num', mssg: 'Phone Number Already Exist', });
            }

            // Check Email ID exist or not
            let EmployeeEmailID = await Employee.findOne({ email_id: email_id });
            if (EmployeeEmailID) {
                return res.status(200).json({ status: 'error', field: 'email_id', mssg: 'Email ID Already Exist', });
            }

            const salt = await bcrypt.genSalt(10);
            const encodedPassword = await bcrypt.hash(password, salt);

            Employee.create({
                employee_type: "Hr",
                first_name: first_name,
                last_name: last_name,
                full_name: full_name,
                user_name: user_name,
                password: encodedPassword,
                ph_num: ph_num,
                email_id: email_id,
                company_code: company_code,
            })
                .then(employee => {
                    return res.status(200).json({ status: 'success', mssg: 'Employee Details Saved Successfully', id: employee.id });
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

module.exports = router;