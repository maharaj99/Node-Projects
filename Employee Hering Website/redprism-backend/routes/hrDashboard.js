const mongoose = require('mongoose');
const fs = require('fs-extra');
const express = require('express');
const { body, validationResult } = require('express-validator');

const router = express.Router();

const verifyUser = require('../middleware/verifyUser');

const JobDetails = require('../models/job_post_details');


// ===================================================
// ROUTER : 1 Get User Approved Job List ( POST method api : /api/hrDashboard/getApprovedJobList )
// ===================================================
router.get('/getApprovedJobList', verifyUser, async (req, res) => {

    try {

        const {
            userCode
        } = req.body;

        let employee_code = userCode;

        const limit = 5000;

        // Manage Search Data 
        const jobListSearchData = [{ "status": "Approved" }, { "post_employee_code": new mongoose.Types.ObjectId(employee_code) }];

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
                $lookup:
                {
                    from: "employee_job_apply",
                    localField: "_id",
                    foreignField: "job_post_code",
                    as: 'employee_job_apply',
                }
            },

            {
                $match: {
                    $and: jobListSearchData
                }
            },

            { $sort: { post_datetime: -1 } },
            { $skip: 0 },
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
                    "totalJobApplied": {
                        $size: '$employee_job_apply',
                    },
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

})

module.exports = router;