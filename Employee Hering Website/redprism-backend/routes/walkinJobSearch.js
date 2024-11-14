const mongoose = require('mongoose');
const express = require('express');
const { body, validationResult } = require('express-validator');

const router = express.Router();

const verifyUser = require('../middleware/verifyUser');

const service_area_details = require('../models/service_area_details');
const LocationDetails = require('../models/location_master');
const Employee = require('../models/EmployeeDetails');
const walking_job_details = require('../models/walking_job_details');


// ===================================================
// ROUTER : 1 Get Active Location List ( GET method api : /api/walkinJobSearch/getLocationList )
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
// ROUTER : 2 Get Active Service Area List ( GET method api : /api/walkinJobSearch/getServiceAreaList )
// ===================================================
router.get('/getServiceAreaList', verifyUser, async (req, res) => {

    try {
        // Fetch Service Area List
        let searviceAreaList = await service_area_details.find({ active: "Yes" })
            .select('service_area').select('details').lean();

        if (searviceAreaList) {
            return res.status(200).json({ status: 'success', mssg: 'Service Area List Fetched Successfully', searviceAreaList });
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
// ROUTER : 3 Get Walkin Job List ( POST method api : /api/walkinJobSearch/getWalkinJobList )
// ===================================================
router.post('/getWalkinJobList', verifyUser, [

    body('service_area_code').if(body('service_area_code').not().isEmpty())
        .isMongoId().withMessage('Service Area Value Is Invalid !'),

    body('location_code').if(body('location_code').not().isEmpty())
        .isMongoId().withMessage('Location Value Is Invalid !'),

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
                service_area_code,
                location_code,
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


            const limit = 5000;

            // Manage Search Data 
            const jobListSearchData = [{ "_id": { $ne: '' } },];


            if (service_area_code) {
                jobListSearchData.push({ "service_area_code": new mongoose.Types.ObjectId(service_area_code) });
            }
            if (location_code) {
                jobListSearchData.push({ "locations.location_code": new mongoose.Types.ObjectId(location_code) });
            }

            // Fetch Jobs List
            let jobsList = await walking_job_details.aggregate([

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
                        from: "service_area_details",
                        localField: "service_area_code",
                        foreignField: "_id",
                        as: 'service_area_details'
                    }
                },
                {
                    $lookup:
                    {
                        from: "employee_details",
                        localField: "post_employee_code",
                        foreignField: "_id",
                        as: 'employee_details'
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

module.exports = router;