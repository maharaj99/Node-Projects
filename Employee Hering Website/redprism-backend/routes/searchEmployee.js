const mongoose = require('mongoose');
const fs = require('fs-extra');
const express = require('express');
const { body, validationResult } = require('express-validator');

const router = express.Router();

const verifyUser = require('../middleware/verifyUser');

const TechDetails = require('../models/technology_master');
const ExpDetails = require('../models/experience_master');
const LocationDetails = require('../models/location_master');
const EmployeeDetails = require('../models/EmployeeDetails');


// ===================================================
// ROUTER : 1 Get Active Tech List ( GET method api : /api/searchEmployee/getTechList )
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
// ROUTER : 2 Get Experince List ( GET method api : /api/searchEmployee/getExpList )
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
// ROUTER : 3 Get Active Location List ( GET method api : /api/searchEmployee/getLocationList )
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
// ROUTER : 4 Get Employee List ( POST method api : /api/searchEmployee/getEmployeeList )
// ===================================================
router.post('/getEmployeeList', verifyUser, [

    body('tech_code').if(body('tech_code').not().isEmpty())
        .isMongoId().withMessage('Technology Value Is Invalid !'),

    body('location_code').if(body('location_code').not().isEmpty())
        .isMongoId().withMessage('Location Value Is Invalid !'),

    body('exp_code').if(body('exp_code').not().isEmpty())
        .isMongoId().withMessage('Experience Value Is Invalid !'),

    body('employee_type')
        .notEmpty().withMessage('Employee Type Empty !')
        .isIn(['All', 'Hr', 'Job Seeker']).withMessage('Employee Type does contain invalid value'),

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
                employee_type
            } = req.body;

            let employee_code = userCode;

            const limit = 5000;

            // Manage Search Data 
            const employeeSearchData = [{ "active": "Yes" }, { "_id": { $ne: new mongoose.Types.ObjectId(employee_code) } }];

            if (employee_type!="All") {
                employeeSearchData.push({ "employee_type": employee_type });
            }
            if (tech_code) {
                employeeSearchData.push({ "tech_code": new mongoose.Types.ObjectId(tech_code) });
            }
            if (location_code) {
                employeeSearchData.push({ "location_code": new mongoose.Types.ObjectId(location_code) });
            }
            if (exp_code) {
                employeeSearchData.push({ "exp_code": new mongoose.Types.ObjectId(exp_code) });
            }
           

            // Fetch Employee List
            let employeeList = await EmployeeDetails.aggregate([

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
                        localField: "location_code",
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
                        from: "experience_master",
                        localField: "exp_code",
                        foreignField: "_id",
                        as: 'experience_master'
                    }
                },
                
                {
                    $match: {
                        $and: employeeSearchData
                    }
                },

                { $sort: { full_name: 1 } },
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
                        "experience_master.experience": 1,
                        "employee_type": 1,
                        "employee_status": 1,
                        "full_name": 1,
                        "first_name": 1,
                        "last_name": 1,
                        "user_name": 1,
                        "ph_num": 1,
                        "email_id": 1,
                        "employee_image": 1,
                        "looking_job": 1,
                        "notice_period": 1,
                        "immediate_joinner": 1,
                        "fresher": 1,
                    }
                },

            ]);

            if (employeeList) {
                return res.status(200).json({ status: 'success', mssg: 'Employee List Fetched Successfully', limit, employeeList });
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