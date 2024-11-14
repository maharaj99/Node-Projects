const mongoose = require('mongoose');
const fs = require('fs-extra');
const express = require('express');
const { body, validationResult } = require('express-validator');

const router = express.Router();

const verifyUser = require('../middleware/verifyUser');
const sendMail = require('../middleware/sendMail');
const fileUpload = require('../middleware/uploadFile');

const TechDetails = require('../models/technology_master');
const ExpDetails = require('../models/experience_master');
const LocationDetails = require('../models/location_master');
const Employee = require('../models/EmployeeDetails');
const JobDetails = require('../models/job_post_details');
const EmployeeSearchDetails = require('../models/employee_search_details');
const employee_job_apply = require('../models/employee_job_apply');


// ===================================================
// ROUTER : 1 Get Active Tech List ( GET method api : /api/jobSearch/getTechList )
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
// ROUTER : 2 Get Experince List ( GET method api : /api/jobSearch/getExpList )
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
// ROUTER : 3 Get Active Location List ( GET method api : /api/jobSearch/getLocationList )
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
// ROUTER : 4 Get Last Search Details ( POST method api : /api/jobSearch/getLastSearchDetails )
// ===================================================
router.get('/getLastSearchDetails', verifyUser, async (req, res) => {

    try {

        const {
            userCode
        } = req.body;

        let employee_code = userCode;

        let employeeSearchDetails = await EmployeeSearchDetails.findOne(
            { employee_code: employee_code },
            {
                'tech_code': 1,
                'location_code': 1,
                'exp_code': 1
            },
            { sort: { search_datetime: -1 } }
        );

        if (employeeSearchDetails) {
            return res.status(200).json({ status: 'success', mssg: 'Employee Search Details Fetched Successfully', employeeSearchDetails });
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
// ROUTER : 5 Get Job List ( POST method api : /api/jobSearch/getJobList )
// ===================================================
router.post('/getJobList', verifyUser, [

    body('tech_code').if(body('tech_code').not().isEmpty())
        .isMongoId().withMessage('Technology Value Is Invalid !'),

    body('location_code').if(body('location_code').not().isEmpty())
        .isMongoId().withMessage('Location Value Is Invalid !'),

    body('exp_code').if(body('exp_code').not().isEmpty())
        .isMongoId().withMessage('Experience Value Is Invalid !'),

    body('type')
        .notEmpty().withMessage('Type Empty !')
        .isIn(['Fresher', 'All']).withMessage('Type does contain invalid value'),

    body('from_index')
        .notEmpty().withMessage('From Index Empty !')
        .isNumeric().withMessage('From Index is not a Number !'),

    body('sort_date')
        .notEmpty().withMessage('Sort Date Empty !')
        .isIn(["ASC", "DESC"]).withMessage('Sort Date does contain invalid value'),

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
                tech_code,
                location_code,
                exp_code,
                type,
                from_index,
                sort_date
            } = req.body;

            let employee_code = userCode;

            let postDateSort = 1;
            if (sort_date === "ASC") {
                postDateSort = 1;
            }
            else {
                postDateSort = -1;
            }

            // Store Employee Search Details 
            var employeeSearchDetailsData = { employee_code: employee_code };


            if (tech_code) { employeeSearchDetailsData.tech_code = new mongoose.Types.ObjectId(tech_code) };
            if (exp_code) { employeeSearchDetailsData.exp_code = new mongoose.Types.ObjectId(exp_code) };
            if (location_code) { employeeSearchDetailsData.location_code = new mongoose.Types.ObjectId(location_code) };

            if (employeeSearchDetailsData.tech_code !== undefined || employeeSearchDetailsData.location_code !== undefined || employeeSearchDetailsData.exp_code !== undefined) {

                // delete previous search
                await EmployeeSearchDetails.deleteMany({ employee_code: employee_code });

                await EmployeeSearchDetails.create(employeeSearchDetailsData);
            }

            const limit = 5000;

            // Manage Search Data 
            const jobListSearchData = [{ "status": "Approved" }, { "targeted_employee": type }];



            if (tech_code) {
                jobListSearchData.push({ "tech_code": new mongoose.Types.ObjectId(tech_code) });
            }
            if (location_code) {
                jobListSearchData.push({ "locations.location_code": new mongoose.Types.ObjectId(location_code) });
            }
            if (exp_code) {
                jobListSearchData.push({ "exp_code": new mongoose.Types.ObjectId(exp_code) });
            }


            // Fetch Jobs List
            let jobsList = await JobDetails.aggregate([

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
                    $match: {
                        $and: jobListSearchData
                    }
                },

                { $sort: { post_datetime: postDateSort } },
                { $skip: from_index },
                { $limit: limit },

                {
                    $project: {
                        "_id": 1,
                        "technology.tech_name": 1,
                        "location.state": 1,
                        "location.city": 1,
                        "location.area": 1,
                        "company_details.company_name": 1,
                        "salary_range.salary_range": 1,
                        "experience_master.experience": 1,
                        "service_area_details.service_area": 1,
                        "job_title": 1,
                        "designation": 1,
                        "description": 1,
                        "email": 1,
                        "ph_num": 1,
                        "post_datetime": 1,
                        "post_employee_type": 1,
                    }
                },

            ]);

            if (jobsList) {
                return res.status(200).json({ status: 'success', mssg: 'Jobs List Fetched Successfully', limit, jobsList });
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
// ROUTER : 6 Employee Job Apply (Resume Upload) ( POST method api : /api/jobSearch/jobApply )
// ===================================================
router.post('/jobApply',
    verifyUser,
    // Upload Resume For Job
    fileUpload.jobResume,
    [
        body('job_post_code')
            .notEmpty().withMessage('Job Post Empty !')
            .isMongoId().withMessage('Job Post Value Is Invalid !'),
    ],

    async (req, res, next) => {

        try {


            // check file exist or not and get the flie name 
            if (!req.file) {
                return res.status(200).json({ status: 'error', mssg: 'Please Upload A Valid Resume File' });
            }

            const {
                destination,
                filename,
                path
            } = req.file;

            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                if (req.file) {
                    fs.remove(path, err => {
                        if (err) return console.error(err)
                        // console.log('success!')
                    })
                }
                const errorsArray = errors.array();
                return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
            }

            const {
                userCode,
                job_post_code,
                message
            } = req.body;

            let employee_code = userCode;

            // Check Employee Type
            let EmployeeDetails = await Employee.findById(employee_code).select('employee_type');

            if (EmployeeDetails.employee_type === "Hr") {
                if (req.file) {
                    fs.remove(path, err => {
                        if (err) return console.error(err)
                        // console.log('success!')
                    })
                }
                return res.status(200).json({ status: 'error', mssg: 'Your User Type is Hr. You Can not Apply Any Job' });
            }

            // Check Employee Already Apply or not for this job 
            let employeeJobApply = await employee_job_apply.findOne({ job_post_code: job_post_code, employee_code: employee_code });

            if (employeeJobApply) {
                if (req.file) {
                    fs.remove(path, err => {
                        if (err) return console.error(err)
                        // console.log('success!')
                    })
                }
                return res.status(200).json({ status: 'error', mssg: 'You Already Applied For This Job' });
            }

            // If All Good then insert the employee job apply details 
            employee_job_apply.create({
                job_post_code: job_post_code,
                employee_code: employee_code,
                resume: 'job_apply_resume/' + filename,
                message: message,
            })
                .then(data => {
                    next();
                    return res.status(200).json({ status: 'success', mssg: 'Job Applied Successfully', id: data.id });
                })
                .catch(err => {
                    console.log(err)
                    if (req.file) {
                        fs.remove(path, err => {
                            if (err) return console.error(err)
                            // console.log('success!')
                        })
                    }
                    return res.status(500).json({ status: 'error', mssg: err.message });
                })


        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 'error', mssg: 'Server Error' });
        }

    },
    sendMail.jobApplySendMail)


// ===================================================
// ROUTER : 7 Get Experince List For Fresher Page ( GET method api : /api/jobSearch/getFresherExpList )
// ===================================================
router.get('/getFresherExpList', verifyUser, async (req, res) => {
    try {
        // Fetch Tech List
        let expList = await ExpDetails.find({ active: "Yes" }).limit(2).sort({ experience: 1 })
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

module.exports = router;