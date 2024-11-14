const express = require('express');
const router = express.Router();

const Employee = require('../models/EmployeeDetails');
const OtpDetails = require('../models/OtpDetails');
const CompanyDetails = require('../models/company_details');
const LocationDetails = require('../models/location_master');
const TechDetails = require('../models/technology_master');
const ExpDetails = require('../models/experience_master');

const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');


// ===================================================
// ROUTER : 1 Email Check ( POST method api : /api/jobseekerRegister/emailCheck )
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
// ROUTER : 2 Register Send Otp ( POST method api : /api/jobseekerRegister/registerSendOtp )
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
// ROUTER : 3 Register Otp Check ( POST method api : /api/jobseekerRegister/registerOtpCheck )
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
// ROUTER : 4 Username Check ( POST method api : /api/jobseekerRegister/usernameCheck )
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
// ROUTER : 5 Get Active Company List ( GET method api : /api/jobseekerRegister/getCompanyList )
// ===================================================
router.get('/getCompanyList', async (req, res) => {

    try {

        // Fetch Company List
        let companyList = await CompanyDetails.find({ active: "Yes" })
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
// ROUTER : 6 Get Active Location List ( GET method api : /api/jobseekerRegister/getLocationList )
// ===================================================
router.get('/getLocationList', async (req, res) => {

    // Fetch Location List
    let locationList = await LocationDetails.find({ active: "Yes" })
            .select('state').select('city').select('area');

    if (locationList) {
        return res.status(200).json({ status: 'success', mssg: 'Location List Fetched Successfully', locationList: locationList });
    }
    else {
        return res.status(200).json({ status: 'error', mssg: 'Not Found', });
    }
})


// ===================================================
// ROUTER : 7 Get Active Tech List ( GET method api : /api/jobseekerRegister/getTechList )
// ===================================================
router.get('/getTechList', async (req, res) => {

    // Fetch Tech List
    let techList = await TechDetails.find({ active: "Yes" })
            .select('tech_name');

    if (techList) {
        return res.status(200).json({ status: 'success', mssg: 'Tech List Fetched Successfully', techList: techList });
    }
    else {
        return res.status(200).json({ status: 'error', mssg: 'Not Found', });
    }
})


// ===================================================
// ROUTER : 8 Get Active Experince List ( GET method api : /api/jobseekerRegister/getExpList )
// ===================================================
router.get('/getExpList', async (req, res) => {

    // Fetch Tech List
    let expList = await ExpDetails.find({ active: "Yes" })
            .select('experience');

    if (expList) {
        return res.status(200).json({ status: 'success', mssg: 'Exp List Fetched Successfully', expList: expList });
    }
    else {
        return res.status(200).json({ status: 'error', mssg: 'Not Found', });
    }
})


// ===================================================
// ROUTER : 9 Register post method api : /api/jobseekerRegister/register
// ===================================================
router.post('/register', [
    body('employee_status').notEmpty().withMessage('Status Empty !'),
    body('status_icon').notEmpty().withMessage('Status Icon Empty !'),
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

    body('company_code').if(body('company_code').not().isEmpty())
        .isMongoId().withMessage('Filed Value Is Invalid !'),

    body('tech_code')
        .notEmpty().withMessage('Technology Empty !')
        .isMongoId().withMessage('Filed Value Is Invalid !'),

    body('exp_code').if(body('fresher').equals('No'))
        .notEmpty().withMessage('Experience Empty !')
        .isMongoId().withMessage('Filed Value Is Invalid !'),

    body('location_code')
        .notEmpty().withMessage('Location Empty !')
        .isMongoId().withMessage('Filed Value Is Invalid !'),

    body('looking_job')
        .notEmpty().withMessage('Location Empty !'),

    body('looking_job')
        .notEmpty().withMessage('Looking job Empty !')
        .isIn(['Yes', 'No']).withMessage('Looking job does contain invalid value'),

    body('notice_period')
        .notEmpty().withMessage('Notice Period Empty !')
        .isIn(['Yes', 'No']).withMessage('Notice Period does contain invalid value'),

    body('immediate_joinner')
        .notEmpty().withMessage('Immediate Joinner Empty !')
        .isIn(['Yes', 'No']).withMessage('Immediate Joinner does contain invalid value'),

    body('fresher')
        .notEmpty().withMessage('Fresher Empty !')
        .isIn(['Yes', 'No']).withMessage('Fresher does contain invalid value'),

], async (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const errorsArray = errors.array();
        return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    }
    else {
        try {

            const {
                employee_status,
                status_icon,
                first_name,
                last_name,
                user_name,
                password,
                ph_num,
                email_id,
                company_code,
                tech_code,
                exp_code,
                location_code,
                looking_job,
                notice_period,
                immediate_joinner,
                fresher
            } = req.body;

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

            const newData = {
                employee_type: "Job Seeker",
                employee_status: employee_status,
                status_icon: status_icon,
                first_name: first_name,
                last_name: last_name,
                full_name: full_name,
                user_name: user_name,
                password: encodedPassword,
                ph_num: ph_num,
                email_id: email_id,
                tech_code: tech_code,
                location_code: location_code,
                looking_job: looking_job,
                notice_period: notice_period,
                immediate_joinner: immediate_joinner,
                fresher: fresher
            }

            if(company_code){newData.company_code = company_code}
            if(exp_code){newData.exp_code = exp_code}

            Employee.create(newData)
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