const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const verifyUser = require('../middleware/verifyUser');
const internship_details = require('../models/internship_details');
const LocationDetails = require('../models/location_master');
const ServiceArea = require('../models/service_area_details');

const { body, validationResult } = require('express-validator');

// ===================================================
// ROUTER : 1 Get Active Location List ( GET method api : /api/internshipPost/getLocationList )
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
// ROUTER : 2 Get Active Service Area List ( GET method api : /api/internshipPost/getServiceAreaList )
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


// ===================================================
// ROUTER : 3 Save Internship Post ( POST method api : /api/internshipPost/saveInternshipPost )
// ===================================================
router.post('/saveInternshipPost', verifyUser, [

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
                description
            } = req.body;

            let employee_code = userCode;

            internship_details.create({
                locations: locations,
                service_area_code: service_area_code,
                description: description,
                post_employee_code: employee_code,
            })
                .then(data => {
                    return res.status(200).json({
                        status: 'success',
                        mssg: 'Internship Post Save Successfully',
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
// ROUTER : 4 Get My Internship Post List ( POST method api : /api/internshipPost/getMyInternshipPostList )
// ===================================================
router.get('/getMyInternshipPostList', verifyUser, async (req, res) => {

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

            // Fetch Internship Post List
            let internshipList = await internship_details.aggregate([

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
                        "post_datetime": 1,
                    }
                },

            ]);

            if (internshipList.length > 0) {
                return res.status(200).json({ status: 'success', mssg: 'Internship List Fetched Successfully', internshipList });
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
// ROUTER : 5 Get Internship Post Details ( POST method api : /api/internshipPost/getInternshipPostDetails )
// ===================================================
router.post('/getInternshipPostDetails', verifyUser, [

    body('internship_code')
        .notEmpty().withMessage('Internship Code Empty !')
        .isMongoId().withMessage('Internship Code Value Is Invalid !'),

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
                internship_code
            } = req.body;

            let employee_code = userCode;

            // Fetch Internship Post Details
            let internshipDetails = await internship_details.aggregate([

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
                    $match: { "_id": new mongoose.Types.ObjectId(internship_code), "post_employee_code": new mongoose.Types.ObjectId(employee_code) }
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
                    }
                },

            ]);

            if (internshipDetails.length > 0) {
                return res.status(200).json({ status: 'success', mssg: 'Internships Details Fetched Successfully', internshipDetails });
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
// ROUTER : 6 Update Internship post details ( POST method api : /api/internshipPost/updateInternshipPostDetails )
// ===================================================

router.post('/updateInternshipPostDetails', verifyUser, [

    body('internship_code')
        .notEmpty().withMessage('Internship Code Empty !')
        .isMongoId().withMessage('Internship Code Value Is Invalid !'),

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
                internship_code,
                locations,
                service_area_code,
                description
            } = req.body;

            let employee_code = userCode;

            const updateProcess = await internship_details.findOneAndUpdate({ _id: internship_code, post_employee_code: employee_code }, {
                locations: locations,
                service_area_code: service_area_code,
                description: description,
            })

            if (updateProcess) {
                res.status(200).json({ status: 'success', mssg: 'Internship Post Details Updated Successfully' });
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
// ROUTER : 7 Delete My Internship Post ( POST method api : /api/internshipPost/deleteInternshipJobPost )
// ===================================================

router.post('/deleteInternshipJobPost', verifyUser, [

    body('internship_code')
        .notEmpty().withMessage('Internship Code Empty !')
        .isMongoId().withMessage('Internship Code Value Is Invalid !'),

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
                internship_code
            } = req.body;

            let employee_code = userCode;

            let deleteProcess = await internship_details.findOneAndDelete({ _id: internship_code, post_employee_code: employee_code });

            if (deleteProcess) {
                res.status(200).json({ status: 'success', mssg: 'Internship Post Details Deleted Successfully' });
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

module.exports = router;