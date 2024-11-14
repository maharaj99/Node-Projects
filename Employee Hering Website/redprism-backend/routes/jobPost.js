const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const verifyUser = require('../middleware/verifyUser');
const sendMail = require('../middleware/sendMail');

const JobPostDetails = require('../models/job_post_details');
const Employee = require('../models/EmployeeDetails');
const Setting = require('../models/settings');
const TechDetails = require('../models/technology_master');
const LocationDetails = require('../models/location_master');
const CompanyDetails = require('../models/company_details');
const SalaryRange = require('../models/salary_range');
const ExpDetails = require('../models/experience_master');
const ServiceArea = require('../models/service_area_details');


const { body, validationResult } = require('express-validator');


// ===================================================
// ROUTER : 1 Save Job Post ( POST method api : /api/jobPost/saveJobPost )
// ===================================================

router.post('/saveJobPost', verifyUser, [

    body('tech_code')
        .notEmpty().withMessage('Technology Empty !')
        .isMongoId().withMessage('Technology Value Is Invalid !'),

    body('locations.*.location_code')
        .notEmpty().withMessage('Location Empty !')
        .isMongoId().withMessage('Location Value Is Invalid !'),

    body('company_code')
        .notEmpty().withMessage('Company Empty !')
        .isMongoId().withMessage('Company Value Is Invalid !'),

    body('salary_range_code')
        .notEmpty().withMessage('Salary Range Empty !')
        .isMongoId().withMessage('Salary Range Value Is Invalid !'),

    body('exp_code')
        .notEmpty().withMessage('Experience Empty !')
        .isMongoId().withMessage('Experience Value Is Invalid !'),

    body('service_area_code')
        .notEmpty().withMessage('Service Area Empty !')
        .isMongoId().withMessage('Service Area Value Is Invalid !'),

    body('targeted_employee')
        .notEmpty().withMessage('Targeted Employee Empty !')
        .isIn(['Fresher', 'All']).withMessage('Targeted Employee does contain invalid value'),

    body('job_title')
        .notEmpty().withMessage('Job Title Empty !'),

    body('designation')
        .notEmpty().withMessage('Designation Empty !'),

    body('description')
        .notEmpty().withMessage('Description Empty !'),

    body('email')
        .notEmpty().withMessage('Email Empty !')
        .isEmail().withMessage('Enter A Valid Email !'),

    body('ph_num')
        .notEmpty().withMessage('Phone Number Empty !')
        .isMobilePhone().withMessage('Enter A Valid Phone Number !')
        .isLength({ min: 10, max: 10 }).withMessage('Enter A Valid Phone Number !'),

], async (req, res, next) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const errorsArray = errors.array();
        return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    }
    else {
        try {

            const {
                userCode,
                tech_code,
                locations,
                company_code,
                salary_range_code,
                exp_code,
                service_area_code,
                targeted_employee,
                job_title,
                designation,
                description,
                email,
                ph_num
            } = req.body;

            let employee_code = userCode;

            let getUserDetails = await Employee.findById(employee_code).select('employee_type');
            let post_employee_type = getUserDetails.employee_type;

            let getSetting = await Setting.findOne().select('job_post_auto_approve');
            let status = '';
            if (!getSetting) {
                return res.status(200).json({
                    status: 'error',
                    mssg: 'Please Config Setting For Job Post Auto Approve',
                });
            }
            else {
                if (getSetting.job_post_auto_approve == "Yes") {
                    status = "Approved";
                }
                else {
                    status = "Pending";
                }
            }

            JobPostDetails.create({
                tech_code: tech_code,
                locations: locations,
                company_code: company_code,
                salary_range_code: salary_range_code,
                exp_code: exp_code,
                service_area_code: service_area_code,
                targeted_employee: targeted_employee,
                job_title: job_title,
                designation: designation,
                description: description,
                email: email,
                ph_num: ph_num,
                status: status,
                post_employee_type: post_employee_type,
                post_employee_code: employee_code,
            })
                .then(job_post => {

                    if (status === "Approved") {
                        req.body.job_post_code = job_post.id;
                        next();
                    }

                    return res.status(200).json({
                        status: 'success',
                        mssg: 'Job Post Save Successfully',
                        Job_post_id: job_post.id
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
}, sendMail.jobPostSendEmployeeMail)


// ===================================================
// ROUTER : 2 Get My Job Post ( GET method api : /api/jobPost/getMyJobPost )
// ===================================================

router.get('/getMyJobPost', verifyUser, async (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const errorsArray = errors.array();
        return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    }
    else {
        try {

            const {
                userCode
            } = req.body;

            let employee_code = userCode;

            // Fetch Job Post List
            let jobsList = await JobPostDetails.aggregate([

                {
                    $lookup:
                    {
                        from: "technology",
                        localField: "tech_code",
                        foreignField: "_id",
                        as: 'technology'
                    }
                },
                {
                    $lookup:
                    {
                        from: "location",
                        localField: "locations.location_code",
                        foreignField: "_id",
                        as: 'location'
                    }
                },
                {
                    $lookup:
                    {
                        from: "company_details",
                        localField: "company_code",
                        foreignField: "_id",
                        as: 'company_details'
                    }
                },
                {
                    $lookup:
                    {
                        from: "salary_range",
                        localField: "salary_range_code",
                        foreignField: "_id",
                        as: 'salary_range'
                    }
                },
                {
                    $lookup:
                    {
                        from: "experience_master",
                        localField: "exp_code",
                        foreignField: "_id",
                        as: 'experience_master'
                    }
                },
                {
                    $lookup:
                    {
                        from: "service_area_details",
                        localField: "service_area_code",
                        foreignField: "_id",
                        as: 'service_area_details'
                    }
                },

                {
                    $match: { "post_employee_code": new mongoose.Types.ObjectId(employee_code) }
                },
                { $sort: { post_datetime: -1 } },
                {
                    $project: {
                        "_id": 1,
                        "technology._id": 1,
                        "technology.tech_name": 1,
                        "location._id": 1,
                        "location.state": 1,
                        "location.city": 1,
                        "location.area": 1,
                        "company_details._id": 1,
                        "company_details.company_name": 1,
                        "salary_range._id": 1,
                        "salary_range.salary_range": 1,
                        "experience_master._id": 1,
                        "experience_master.experience": 1,
                        "service_area_details._id": 1,
                        "service_area_details.service_area": 1,
                        "targeted_employee": 1,
                        "job_title": 1,
                        "designation": 1,
                        "description": 1,
                        "email": 1,
                        "ph_num": 1,
                        "status": 1,
                        "post_datetime": 1,
                    }
                },

            ]);

            if (jobsList.length > 0) {
                return res.status(200).json({ status: 'success', mssg: 'Jobs List Fetched Successfully', jobsList });
            }
            else {
                return res.status(200).json({ status: 'error', mssg: 'Not Found', });
            }


        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 'error', mssg: 'Server Error' });
        }
    }
})


// ===================================================
// ROUTER : 3 Get Job Post Details ( POST method api : /api/jobPost/getJobPostDetails )
// ===================================================

router.post('/getJobPostDetails', verifyUser, [

    body('job_post_code')
        .notEmpty().withMessage('Job Post Empty !')
        .isMongoId().withMessage('Job Post Value Is Invalid !'),

], async (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const errorsArray = errors.array();
        return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    }
    else {
        try {

            const {
                userCode,
                job_post_code
            } = req.body;

            let employee_code = userCode;

            // Fetch Job Post Details
            let jobsDetails = await JobPostDetails.aggregate([

                {
                    $lookup:
                    {
                        from: "technology",
                        localField: "tech_code",
                        foreignField: "_id",
                        as: 'technology'
                    }
                },
                {
                    $lookup:
                    {
                        from: "location",
                        localField: "locations.location_code",
                        foreignField: "_id",
                        as: 'location'
                    }
                },
                {
                    $lookup:
                    {
                        from: "company_details",
                        localField: "company_code",
                        foreignField: "_id",
                        as: 'company_details'
                    }
                },
                {
                    $lookup:
                    {
                        from: "salary_range",
                        localField: "salary_range_code",
                        foreignField: "_id",
                        as: 'salary_range'
                    }
                },
                {
                    $lookup:
                    {
                        from: "experience_master",
                        localField: "exp_code",
                        foreignField: "_id",
                        as: 'experience_master'
                    }
                },
                {
                    $lookup:
                    {
                        from: "service_area_details",
                        localField: "service_area_code",
                        foreignField: "_id",
                        as: 'service_area_details'
                    }
                },

                {
                    $match: { "_id": new mongoose.Types.ObjectId(job_post_code), "post_employee_code": new mongoose.Types.ObjectId(employee_code) }
                },
                {
                    $project: {
                        "_id": 1,
                        "technology._id": 1,
                        "technology.tech_name": 1,
                        "location._id": 1,
                        "location.state": 1,
                        "location.city": 1,
                        "location.area": 1,
                        "company_details._id": 1,
                        "company_details.company_name": 1,
                        "salary_range._id": 1,
                        "salary_range.salary_range": 1,
                        "experience_master._id": 1,
                        "experience_master.experience": 1,
                        "service_area_details._id": 1,
                        "service_area_details.service_area": 1,
                        "targeted_employee": 1,
                        "job_title": 1,
                        "designation": 1,
                        "description": 1,
                        "email": 1,
                        "ph_num": 1,
                    }
                },

            ]);

            if (jobsDetails.length > 0) {
                return res.status(200).json({ status: 'success', mssg: 'Jobs Details Fetched Successfully', jobsDetails });
            }
            else {
                return res.status(200).json({ status: 'error', mssg: 'Not Found', });
            }


        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 'error', mssg: 'Server Error' });
        }
    }
})


// ===================================================
// ROUTER : 4 Update job post details ( POST method api : /api/jobPost/updateJobPostDetails )
// ===================================================

router.post('/updateJobPostDetails', verifyUser, [

    body('job_post_code')
        .notEmpty().withMessage('Job Post Empty !')
        .isMongoId().withMessage('Job Post Value Is Invalid !'),

    body('tech_code')
        .notEmpty().withMessage('Technology Empty !')
        .isMongoId().withMessage('Technology Value Is Invalid !'),

    body('locations.*.location_code')
        .notEmpty().withMessage('Location Empty !')
        .isMongoId().withMessage('Location Value Is Invalid !'),

    body('company_code')
        .notEmpty().withMessage('Company Empty !')
        .isMongoId().withMessage('Company Value Is Invalid !'),

    body('salary_range_code')
        .notEmpty().withMessage('Salary Range Empty !')
        .isMongoId().withMessage('Salary Range Value Is Invalid !'),

    body('exp_code')
        .notEmpty().withMessage('Experience Empty !')
        .isMongoId().withMessage('Experience Value Is Invalid !'),

    body('service_area_code')
        .notEmpty().withMessage('Service Area Empty !')
        .isMongoId().withMessage('Service Area Value Is Invalid !'),

    body('targeted_employee')
        .notEmpty().withMessage('Targeted Employee Empty !')
        .isIn(['Fresher', 'All']).withMessage('Targeted Employee does contain invalid value'),

    body('job_title')
        .notEmpty().withMessage('Job Title Empty !'),

    body('designation')
        .notEmpty().withMessage('Designation Empty !'),

    body('description')
        .notEmpty().withMessage('Description Empty !'),

    body('email')
        .notEmpty().withMessage('Email Empty !')
        .isEmail().withMessage('Enter A Valid Email !'),

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
                userCode,
                job_post_code,
                tech_code,
                locations,
                company_code,
                salary_range_code,
                exp_code,
                service_area_code,
                targeted_employee,
                job_title,
                designation,
                description,
                email,
                ph_num

            } = req.body;

            let employee_code = userCode;

            const updateProcess = await JobPostDetails.findOneAndUpdate({ _id: job_post_code, post_employee_code: employee_code }, {
                tech_code: tech_code,
                locations: locations,
                company_code: company_code,
                salary_range_code: salary_range_code,
                exp_code: exp_code,
                service_area_code: service_area_code,
                targeted_employee: targeted_employee,
                job_title: job_title,
                designation: designation,
                description: description,
                email: email,
                ph_num: ph_num,
            })

            if (updateProcess) {
                res.status(200).json({ status: 'success', mssg: 'Job Post Details Updated Successfully' });
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


// ===================================================
// ROUTER : 12 Close Job Status ( POST method api : /api/jobPost/closeJob )
// ===================================================

router.post('/closeJob', verifyUser, [

    body('job_post_code')
        .notEmpty().withMessage('Job Post Empty !')
        .isMongoId().withMessage('Job Post Value Is Invalid !'),

], async (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const errorsArray = errors.array();
        return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    }
    else {
        try {

            const {
                userCode,
                job_post_code

            } = req.body;

            let employee_code = userCode;

            const updateProcess = await JobPostDetails.findOneAndUpdate({ _id: job_post_code, post_employee_code: employee_code }, {
                status: 'Closed',
            })

            if (updateProcess) {
                res.status(200).json({ status: 'success', mssg: 'Job Post Details Closed Successfully' });
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


// ===================================================
// ROUTER : 5 Delete My Job Post ( POST method api : /api/jobPost/deleteJobPost )
// ===================================================

router.post('/deleteJobsPost', verifyUser, [

    body('job_post_code')
        .notEmpty().withMessage('Job Post Empty !')
        .isMongoId().withMessage('Job Post Value Is Invalid !'),

], async (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const errorsArray = errors.array();
        return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    }
    else {
        try {

            const {
                userCode,
                job_post_code
            } = req.body;

            let employee_code = userCode;

            let deleteProcess = await JobPostDetails.findOneAndDelete({ _id: job_post_code, post_employee_code: employee_code });

            if (deleteProcess) {
                res.status(200).json({ status: 'success', mssg: 'Job Post Details Deleted Successfully' });
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


// ===================================================
// ROUTER : 6 Get Active Tech List ( GET method api : /api/jobPost/getTechList )
// ===================================================
router.get('/getTechList', verifyUser, async (req, res) => {

    try {
        // Fetch Tech List
        let techList = await TechDetails.find({ active: "Yes" })
            .select('tech_name').lean();

        if (techList) {
            return res.status(200).json({ status: 'success', mssg: 'Tech List Fetched Successfully', techList });
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
// ROUTER : 7 Get Active Company List ( GET method api : /api/jobPost/getCompanyList )
// ===================================================
router.get('/getCompanyList', verifyUser, async (req, res) => {

    try {
        // Fetch Company List
        let companyList = await CompanyDetails.find({ active: "Yes" })
            .select('company_name').lean();

        if (companyList) {
            return res.status(200).json({ status: 'success', mssg: 'Company List Fetched Successfully', companyList });
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
// ROUTER : 8 Get Active Location List ( GET method api : /api/jobPost/getLocationList )
// ===================================================
router.get('/getLocationList', verifyUser, async (req, res) => {

    try {
        // Fetch Location List
        let locationList = await LocationDetails.find({ active: "Yes" })
            .select('state').select('city').select('area').lean();

        if (locationList) {
            return res.status(200).json({ status: 'success', mssg: 'Location List Fetched Successfully', locationList });
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
// ROUTER : 9 Get Active Salary Range List ( GET method api : /api/jobPost/getSalaryRange )
// ===================================================
router.get('/getSalaryRange', verifyUser, async (req, res) => {

    try {
        // Fetch Location List
        let salaryRangeList = await SalaryRange.find({ active: "Yes" })
            .select('salary_range').lean();

        if (salaryRangeList) {
            return res.status(200).json({ status: 'success', mssg: 'Salary Range List Fetched Successfully', salaryRangeList });
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
// ROUTER : 10 Get Experince List ( GET method api : /api/jobPost/getExpList )
// ===================================================
router.get('/getExpList', verifyUser, async (req, res) => {
    try {
        // Fetch Tech List
        let expList = await ExpDetails.find({ active: "Yes" })
            .select('experience').lean();

        if (expList) {
            return res.status(200).json({ status: 'success', mssg: 'Exp List Fetched Successfully', expList });
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
// ROUTER : 11 Get Service Area List ( GET method api : /api/jobPost/getServiceAreaList )
// ===================================================
router.get('/getServiceAreaList', verifyUser, async (req, res) => {
    try {
        // Fetch Tech List
        let serviceAreaList = await ServiceArea.find({ active: "Yes" })
            .select('service_area').lean();

        if (serviceAreaList) {
            return res.status(200).json({ status: 'success', mssg: 'Service Area List Fetched Successfully', serviceAreaList });
        }
        else {
            return res.status(200).json({ status: 'error', mssg: 'Not Found', });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }
})

module.exports = router;