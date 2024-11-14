const mongoose = require('mongoose');
const fs = require('fs-extra');
const express = require('express');
const { body, validationResult } = require('express-validator');

const router = express.Router();

const verifyUser = require('../middleware/verifyUser');
const sendMail = require('../middleware/sendMail');
const fileUpload = require('../middleware/uploadFile');


const Employee = require('../models/EmployeeDetails');
const JobDetails = require('../models/job_post_details');
const employee_job_apply = require('../models/employee_job_apply');


// ===================================================
// ROUTER : 1 Get Job Details ( POST method api : /api/jobDetails/getJobDetails )
// ===================================================
router.post('/getJobDetails', verifyUser, [

    body('job_post_code')
        .notEmpty().withMessage('Job Post ID Empty !')
        .isMongoId().withMessage('Job Post ID Value Is Invalid !'),

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


            // Fetch Jobs Details
            let job_details = await JobDetails.aggregate([

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
                    $match: { "_id": new mongoose.Types.ObjectId(job_post_code) }
                },

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

            if (job_details) {
                return res.status(200).json({ status: 'success', mssg: 'Jobs Details Fetched Successfully', job_details });
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
// ROUTER : 2 Employee Job Apply (Resume Upload) ( POST method api : /api/jobDetails/jobApply )
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
// ROUTER : 3 Get Job Applied Employee List ( POST method api : /api/jobDetails/getJobAplliedEmployeeList )
// ===================================================
router.post('/getJobAplliedEmployeeList', verifyUser, [

    body('job_post_code')
        .notEmpty().withMessage('Job Post ID Empty !')
        .isMongoId().withMessage('Job Post ID Value Is Invalid !'),

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

            // At first check job post employee code and login user code match or not
            let getJobDetails = await JobDetails.findOne({"_id": job_post_code, "post_employee_code": employee_code});
            
            if (getJobDetails) {

                // Get employee job apply list
                let jobApplyList = await employee_job_apply.aggregate([

                    {
                        $lookup:
                        {
                            from: "employee_details",
                            localField: "employee_code",
                            foreignField: "_id",
                            as: 'employee_details'
                        }
                    },
                    
                    {
                        $match: { "job_post_code": new mongoose.Types.ObjectId(job_post_code) }
                    },

                    { $sort: { apply_datetime: -1 } },

                ]);

                if (jobApplyList) {
                    return res.status(200).json({ status: 'success', mssg: 'List Fetched Successfully', jobApplyList });
                }
                else {
                    return res.status(200).json({ status: 'error', mssg: 'Not Found', });
                }

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

module.exports = router;