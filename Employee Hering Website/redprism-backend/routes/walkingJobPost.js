const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const verifyUser = require('../middleware/verifyUser');
const WalkingJobDetails = require('../models/walking_job_details');
const LocationDetails = require('../models/location_master');
const ServiceArea = require('../models/service_area_details');

const { body, validationResult } = require('express-validator');


// ===================================================
// ROUTER : 1 Save Walking Job Post ( POST method api : /api/walkingJobPost/saveWalkingJobPost )
// ===================================================
router.post('/saveWalkingJobPost', verifyUser, [

    body('locations.*.location_code')
        .notEmpty().withMessage('Location Empty !')
        .isMongoId().withMessage('Location Value Is Invalid !'),

    body('service_area_code')
        .trim()
        .notEmpty().withMessage('Service Area Empty !')
        .isMongoId().withMessage('Service Area Value Is Invalid !'),

    body('description')
        .trim()
        .notEmpty().withMessage('Description Empty !'),

    body('walking_date')
        .trim()
        .notEmpty().withMessage('Walking Date Empty !')
        .isDate().withMessage('Walking Date Empty !'),

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
                locations,
                service_area_code,
                description,
                walking_date
            } = req.body;

            let employee_code = userCode;

            WalkingJobDetails.create({
                locations: locations,
                service_area_code: service_area_code,
                description: description,
                walking_date: walking_date,
                post_employee_code: employee_code,
            })
                .then(data => {
                    return res.status(200).json({
                        status: 'success',
                        mssg: 'Job Post Save Successfully',
                        data_id: data.id
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
// ROUTER : 2 Get My Walking Job Post ( POST method api : /api/walkingJobPost/getMyWalkingJobPost )
// ===================================================

router.get('/getMyWalkingJobPost', verifyUser, async (req, res) => {

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

            // Fetch Walking Job Post List
            let walkingJobsList = await WalkingJobDetails.aggregate([

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
                    $match: { "post_employee_code": new mongoose.Types.ObjectId(employee_code) }
                },
                { $sort: { post_datetime: -1 } },
                {
                    $project: {
                        "_id": 1,
                        "location._id": 1,
                        "location.state": 1,
                        "location.city": 1,
                        "location.area": 1,
                        "service_area_details._id": 1,
                        "service_area_details.service_area": 1,
                        "description": 1,
                        "walking_date": 1,
                        "post_datetime": 1,
                    }
                },

            ]);

            if (walkingJobsList.length > 0) {
                return res.status(200).json({ status: 'success', mssg: 'Walking Jobs List Fetched Successfully', walkingJobsList });
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
// ROUTER : 3 Get Walking Job Post Details ( POST method api : /api/walkingJobPost/getWalkingJobPostDetails )
// ===================================================
router.post('/getWalkingJobPostDetails', verifyUser, [

    body('walking_job_code')
        .notEmpty().withMessage('Walking Job Post Empty !')
        .isMongoId().withMessage('Walking Job Post Value Is Invalid !'),

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
                walking_job_code
            } = req.body;

            let employee_code = userCode;

            // Fetch Walking Job Post Details
            let walkingJobsDetails = await WalkingJobDetails.aggregate([

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
                    $match: { "_id": new mongoose.Types.ObjectId(walking_job_code), "post_employee_code": new mongoose.Types.ObjectId(employee_code) }
                },
                {
                    $project: {
                        "_id": 1,
                        "location._id": 1,
                        "location.state": 1,
                        "location.city": 1,
                        "location.area": 1,
                        "service_area_details._id": 1,
                        "service_area_details.service_area": 1,
                        "description": 1,
                        "walking_date": 1,
                    }
                },

            ]);

            if (walkingJobsDetails.length > 0) {
                return res.status(200).json({ status: 'success', mssg: 'Walking Jobs Details Fetched Successfully', walkingJobsDetails });
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
// ROUTER : 4 Update walking job post details ( POST method api : /api/walkingJobPost/updateWalkingJobPostDetails )
// ===================================================

router.post('/updateWalkingJobPostDetails', verifyUser, [

    body('walking_job_code')
        .notEmpty().withMessage('Walking Job Post Empty !')
        .isMongoId().withMessage('Walking Job Post Value Is Invalid !'),

    body('locations.*.location_code')
        .trim()
        .notEmpty().withMessage('Location Empty !')
        .isMongoId().withMessage('Location Value Is Invalid !'),

    body('description')
        .trim()
        .notEmpty().withMessage('Description Empty !'),

    body('service_area_code')
        .trim()
        .notEmpty().withMessage('Service Area Empty !')
        .isMongoId().withMessage('Service Area Value Is Invalid !'),

    body('walking_date')
        .trim()
        .notEmpty().withMessage('Walking Date Empty !')
        .isDate().withMessage('Walking Date Empty !'),

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
                walking_job_code,
                locations,
                service_area_code,
                description,
                walking_date
            } = req.body;

            let employee_code = userCode;

            const updateProcess = await WalkingJobDetails.findOneAndUpdate({ _id: walking_job_code, post_employee_code: employee_code }, {
                locations: locations,
                service_area_code: service_area_code,
                description: description,
                walking_date: walking_date,
            })

            if (updateProcess) {
                res.status(200).json({ status: 'success', mssg: 'Walking Job Post Details Updated Successfully' });
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
// ROUTER : 5 Delete My Walking Job Post ( POST method api : /api/walkingJobPost/deleteWalkingJobPost )
// ===================================================

router.post('/deleteWalkingJobPost', verifyUser, [

    body('walking_job_code')
        .notEmpty().withMessage('Walking Job Post Empty !')
        .isMongoId().withMessage('Walking Job Post Value Is Invalid !'),

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
                walking_job_code
            } = req.body;

            let employee_code = userCode;

            let deleteProcess = await WalkingJobDetails.findOneAndDelete({ _id: walking_job_code, post_employee_code: employee_code });

            if (deleteProcess) {
                res.status(200).json({ status: 'success', mssg: 'Walking Job Post Details Deleted Successfully' });
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
// ROUTER : 6 Get Active Location List ( GET method api : /api/walkingJobPost/getLocationList )
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
// ROUTER : 7 Get Active Service Area List ( GET method api : /api/walkingJobPost/getServiceAreaList )
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