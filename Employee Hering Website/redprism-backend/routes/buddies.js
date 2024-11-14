const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const verifyUser = require('../middleware/verifyUser');
const Employee = require('../models/EmployeeDetails');

const { body, validationResult } = require('express-validator');
const employee_buddies = require('../models/employee_buddies');


// ===================================================
// ROUTER : 1 Show Buddy List ( POST method api : /api/buddies/showBuddysList )
// ===================================================

router.post('/showBuddysList', verifyUser, [

    body('type')
        .notEmpty().withMessage('Type Empty !')
        .isIn(['All Buddies', 'My Buddies', 'Friend Request', 'Sent Request']).withMessage('Type does contain invalid value'),

    body('from_index')
        .notEmpty().withMessage('From Index Empty !')
        .isNumeric().withMessage('From Index is not a Number !'),

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
                type,
                search_details,
                from_index
            } = req.body;

            let employee_code = userCode;

            const limit = 50000;

            let employeeList;

            if (type === "All Buddies") {

                // Manage Search Data 
                const SearchData = {
                    "_id": { $ne: new mongoose.Types.ObjectId(employee_code) }, "active": "Yes",
                };

                if (search_details) {
                    Object.assign(SearchData, {

                        // option is for all case sensetive

                        $or: [
                            { "first_name": { $regex:  search_details, '$options' : 'i'} },
                            { "last_name": { $regex: search_details, '$options' : 'i' } },
                            { "full_name": { $regex: search_details, '$options' : 'i' } },
                            { "user_name": { $regex: search_details, '$options' : 'i' } },
                            { "ph_num": { $regex: search_details, '$options' : 'i' } },
                            { "email_id": { $regex: search_details, '$options' : 'i' } },
                            { "company_details.company_name": { $regex: search_details, '$options' : 'i' } },
                            { "technology.tech_name": { $regex: search_details, '$options' : 'i' } },
                            { "location.state": { $regex: search_details, '$options' : 'i' } },
                            { "location.city": { $regex: search_details, '$options' : 'i' } },
                            { "location.area": { $regex: search_details, '$options' : 'i' } }
                        ]

                    });
                };

                // Fetch All Employee List
                employeeList = await Employee.aggregate([

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
                    // If Login user sent this user freind request 
                    {
                        $lookup:
                        {
                            from: "employee_buddies",
                            localField: "_id",
                            foreignField: "employee_code",
                            as: 'from_employee_buddies',
                            pipeline: [{ $match: { to_employee_code: new mongoose.Types.ObjectId(employee_code) } }],
                        }
                    },
                    // If login user receive request from this user 
                    {
                        $lookup:
                        {
                            from: "employee_buddies",
                            localField: "_id",
                            foreignField: "to_employee_code",
                            as: 'to_employee_buddies',
                            pipeline: [{ $match: { employee_code: new mongoose.Types.ObjectId(employee_code) } }],
                        }
                    },

                    {
                        $match: SearchData
                    },
                    { $skip: from_index },
                    { $limit: limit },
                    {
                        $project: {
                            "_id": 1,
                            "employee_type": 1,
                            "employee_status": 1,
                            "first_name": 1,
                            "last_name": 1,
                            "ph_num": 1,
                            "email_id": 1,
                            "employee_image": 1,
                            "technology._id": 1,
                            "technology.tech_name": 1,
                            "location._id": 1,
                            "location.state": 1,
                            "location.city": 1,
                            "location.area": 1,
                            "company_details._id": 1,
                            "company_details.company_name": 1,
                            "from_employee_buddies.mode": 1,
                            "from_employee_buddies.status": 1,
                            "to_employee_buddies.mode": 1,
                            "to_employee_buddies.status": 1,
                        }
                    },

                ]);
            }
            if (type === "My Buddies") {
                // Manage Search Data 
                const SearchData = {
                    $or: [
                        { "employee_code": new mongoose.Types.ObjectId(employee_code) },
                        { "to_employee_code": new mongoose.Types.ObjectId(employee_code) },
                    ],
                    "mode": "Friend", "status": "Accept",
                };

                if (search_details) {
                    Object.assign(SearchData, {

                        $or: [
                            { "first_name": { $regex:  search_details, '$options' : 'i'} },
                            { "last_name": { $regex: search_details, '$options' : 'i' } },
                            { "full_name": { $regex: search_details, '$options' : 'i' } },
                            { "user_name": { $regex: search_details, '$options' : 'i' } },
                            { "ph_num": { $regex: search_details, '$options' : 'i' } },
                            { "email_id": { $regex: search_details, '$options' : 'i' } },
                            { "company_details.company_name": { $regex: search_details, '$options' : 'i' } },
                            { "technology.tech_name": { $regex: search_details, '$options' : 'i' } },
                            { "location.state": { $regex: search_details, '$options' : 'i' } },
                            { "location.city": { $regex: search_details, '$options' : 'i' } },
                            { "location.area": { $regex: search_details, '$options' : 'i' } }
                        ]

                    });
                };

                // Fetch All Employee List
                employeeList = await employee_buddies.aggregate([

                    // If Login user sent this user freind request 
                    {
                        $lookup: {
                            from: "employee_details",
                            let: {
                                from_employee_code: "$employee_code",
                                to_employee_code: "$to_employee_code"
                            },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $or: [
                                                { $eq: ["$_id", "$$from_employee_code"] },
                                                { $eq: ["$_id", "$$to_employee_code"] }
                                            ]
                                        }

                                    }
                                },
                                { $match: { _id: { $ne: new mongoose.Types.ObjectId(employee_code) } } }
                            ],
                            as: "employee_details"
                        }
                    },

                    {
                        $lookup:
                        {
                            from: "technology",
                            localField: "employee_details.tech_code",
                            foreignField: "_id",
                            as: 'technology'
                        }
                    },

                    {
                        $lookup:
                        {
                            from: "location",
                            localField: "employee_details.location_code",
                            foreignField: "_id",
                            as: 'location'
                        }
                    },

                    {
                        $lookup:
                        {
                            from: "company_details",
                            localField: "employee_details.company_code",
                            foreignField: "_id",
                            as: 'company_details'
                        }
                    },

                    {
                        $match: SearchData
                    },
                    { $skip: from_index },
                    { $limit: limit },
                    {
                        $project: {
                            "_id": 1,
                            "mode": 1,
                            "status": 1,
                            "employee_code": 1,
                            "to_employee_code": 1,
                            "employee_details._id": 1,
                            "employee_details.employee_type": 1,
                            "employee_details.employee_status": 1,
                            "employee_details.first_name": 1,
                            "employee_details.last_name": 1,
                            "employee_details.ph_num": 1,
                            "employee_details.email_id": 1,
                            "employee_details.employee_image": 1,
                            "technology._id": 1,
                            "technology.tech_name": 1,
                            "location._id": 1,
                            "location.state": 1,
                            "location.city": 1,
                            "location.area": 1,
                            "company_details._id": 1,
                            "company_details.company_name": 1,
                        }
                    },

                ]);
            }
            if (type === "Friend Request") {
                // Manage Search Data 
                const SearchData = {
                    "to_employee_code": new mongoose.Types.ObjectId(employee_code),
                    "mode": "Request",
                    "status": "Pending",
                };

                if (search_details) {
                    Object.assign(SearchData, {

                        $or: [
                            { "first_name": { $regex:  search_details, '$options' : 'i'} },
                            { "last_name": { $regex: search_details, '$options' : 'i' } },
                            { "full_name": { $regex: search_details, '$options' : 'i' } },
                            { "user_name": { $regex: search_details, '$options' : 'i' } },
                            { "ph_num": { $regex: search_details, '$options' : 'i' } },
                            { "email_id": { $regex: search_details, '$options' : 'i' } },
                            { "company_details.company_name": { $regex: search_details, '$options' : 'i' } },
                            { "technology.tech_name": { $regex: search_details, '$options' : 'i' } },
                            { "location.state": { $regex: search_details, '$options' : 'i' } },
                            { "location.city": { $regex: search_details, '$options' : 'i' } },
                            { "location.area": { $regex: search_details, '$options' : 'i' } }
                        ]

                    });
                };

                // Fetch All Employee List
                employeeList = await employee_buddies.aggregate([

                    // If Login user sent this user freind request 
                    {
                        $lookup: {
                            from: "employee_details",
                            let: {
                                from_employee_code: "$employee_code",
                            },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: ["$_id", "$$from_employee_code"]
                                        }

                                    }
                                }
                            ],
                            as: "employee_details"
                        }
                    },

                    {
                        $lookup:
                        {
                            from: "technology",
                            localField: "employee_details.tech_code",
                            foreignField: "_id",
                            as: 'technology'
                        }
                    },

                    {
                        $lookup:
                        {
                            from: "location",
                            localField: "employee_details.location_code",
                            foreignField: "_id",
                            as: 'location'
                        }
                    },

                    {
                        $lookup:
                        {
                            from: "company_details",
                            localField: "employee_details.company_code",
                            foreignField: "_id",
                            as: 'company_details'
                        }
                    },

                    {
                        $match: SearchData
                    },
                    { $skip: from_index },
                    { $limit: limit },
                    {
                        $project: {
                            "_id": 1,
                            "mode": 1,
                            "status": 1,
                            "employee_code": 1,
                            "to_employee_code": 1,
                            "employee_details._id": 1,
                            "employee_details.employee_type": 1,
                            "employee_details.employee_status": 1,
                            "employee_details.first_name": 1,
                            "employee_details.last_name": 1,
                            "employee_details.ph_num": 1,
                            "employee_details.email_id": 1,
                            "employee_details.employee_image": 1,
                            "technology._id": 1,
                            "technology.tech_name": 1,
                            "location._id": 1,
                            "location.state": 1,
                            "location.city": 1,
                            "location.area": 1,
                            "company_details._id": 1,
                            "company_details.company_name": 1,
                        }
                    },

                ]);
            }
            if (type === "Sent Request") {
                // Manage Search Data 
                const SearchData = {
                    "employee_code": new mongoose.Types.ObjectId(employee_code),
                    "mode": "Request",
                    "status": "Pending",
                };

                if (search_details) {
                    Object.assign(SearchData, {

                        $or: [
                            { "first_name": { $regex:  search_details, '$options' : 'i'} },
                            { "last_name": { $regex: search_details, '$options' : 'i' } },
                            { "full_name": { $regex: search_details, '$options' : 'i' } },
                            { "user_name": { $regex: search_details, '$options' : 'i' } },
                            { "ph_num": { $regex: search_details, '$options' : 'i' } },
                            { "email_id": { $regex: search_details, '$options' : 'i' } },
                            { "company_details.company_name": { $regex: search_details, '$options' : 'i' } },
                            { "technology.tech_name": { $regex: search_details, '$options' : 'i' } },
                            { "location.state": { $regex: search_details, '$options' : 'i' } },
                            { "location.city": { $regex: search_details, '$options' : 'i' } },
                            { "location.area": { $regex: search_details, '$options' : 'i' } }
                        ]

                    });
                };

                // Fetch All Employee List
                employeeList = await employee_buddies.aggregate([

                    // If Login user sent this user freind request 
                    {
                        $lookup: {
                            from: "employee_details",
                            let: {
                                to_employee_code: "$to_employee_code",
                            },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: ["$_id", "$$to_employee_code"]
                                        }

                                    }
                                }
                            ],
                            as: "employee_details"
                        }
                    },

                    {
                        $lookup:
                        {
                            from: "technology",
                            localField: "employee_details.tech_code",
                            foreignField: "_id",
                            as: 'technology'
                        }
                    },

                    {
                        $lookup:
                        {
                            from: "location",
                            localField: "employee_details.location_code",
                            foreignField: "_id",
                            as: 'location'
                        }
                    },

                    {
                        $lookup:
                        {
                            from: "company_details",
                            localField: "employee_details.company_code",
                            foreignField: "_id",
                            as: 'company_details'
                        }
                    },

                    {
                        $match: SearchData
                    },
                    { $skip: from_index },
                    { $limit: limit },
                    {
                        $project: {
                            "_id": 1,
                            "mode": 1,
                            "status": 1,
                            "employee_code": 1,
                            "to_employee_code": 1,
                            "employee_details._id": 1,
                            "employee_details.employee_type": 1,
                            "employee_details.employee_status": 1,
                            "employee_details.first_name": 1,
                            "employee_details.last_name": 1,
                            "employee_details.ph_num": 1,
                            "employee_details.email_id": 1,
                            "employee_details.employee_image": 1,
                            "technology._id": 1,
                            "technology.tech_name": 1,
                            "location._id": 1,
                            "location.state": 1,
                            "location.city": 1,
                            "location.area": 1,
                            "company_details._id": 1,
                            "company_details.company_name": 1,
                        }
                    },

                ]);
            }

            if (employeeList.length > 0) {
                return res.status(200).json({ status: 'success', mssg: 'Employee Buddies List Fetched Successfully', employeeList });
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
// ROUTER : 2 Sent Request To Buddy ( POST method api : /api/buddies/sentBuddyRequest )
// ===================================================

router.post('/sentBuddyRequest', verifyUser, [

    body('to_employee_code')
        .notEmpty().withMessage('To Employee Details Empty !')
        .isMongoId().withMessage('To Employee Details Value Is Invalid !'),

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
                to_employee_code
            } = req.body;

            let employee_code = userCode;

            const employeeBuddiesDetails = await employee_buddies.findOne({
                $or: [
                    { employee_code: employee_code, to_employee_code: to_employee_code }, 
                    { employee_code: to_employee_code, to_employee_code: employee_code }
                ]
            })

            if (employeeBuddiesDetails) {
                return res.status(200).json({ status: 'error', mssg: 'Already Exist Relation To This User', });
            }
            else {
                employee_buddies.create({
                    employee_code: employee_code,
                    to_employee_code: to_employee_code,
                    mode: "Request",
                    status: "Pending",
                })
                    .then(data => {
                        return res.status(200).json({
                            status: 'success',
                            mssg: 'Request Send Successfully',
                            data_id: data.id
                        });
                    })
                    .catch(err => {
                        console.log(err)
                        return res.status(500).json({ status: 'error', mssg: err.message });
                    })
            }

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 'error', mssg: 'Server Error' });
        }
    }
})


// ===================================================
// ROUTER : 3 Accept Buddy Request ( POST method api : /api/buddies/acceptBuddyRequest )
// ===================================================

router.post('/acceptBuddyRequest', verifyUser, [

    body('from_employee_code')
        .notEmpty().withMessage('From Employee Details Empty !')
        .isMongoId().withMessage('From Employee Details Value Is Invalid !'),

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
                from_employee_code
            } = req.body;

            let employee_code = userCode;

            const employeeBuddiesDetails = await employee_buddies.findOne({
                employee_code: from_employee_code,
                to_employee_code: employee_code,
                mode: "Request",
                status: "Pending"
            })

            if (!employeeBuddiesDetails) {
                return res.status(200).json({ status: 'error', mssg: 'Not Found Any Request From This User', });
            }
            else {

                const updateProcess = await employee_buddies.findByIdAndUpdate({ _id: employeeBuddiesDetails._id }, {
                    mode: "Friend",
                    status: "Accept",
                    accept_datetime: Date.now(),
                })

                if (updateProcess) {
                    res.status(200).json({ status: 'success', mssg: 'Request Accepted Successfully' });
                }
                else {
                    res.status(200).json({ status: 'error', mssg: 'Details Not Found' });
                }
            }

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 'error', mssg: 'Server Error' });
        }
    }
})


// ===================================================
// ROUTER : 4 Cancel Sent Request ( POST method api : /api/buddies/cancelSentRequest )
// ===================================================

router.post('/cancelSentRequest', verifyUser, [

    body('to_employee_code')
        .notEmpty().withMessage('To Employee Details Empty !')
        .isMongoId().withMessage('To Employee Details Value Is Invalid !'),

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
                to_employee_code
            } = req.body;

            let employee_code = userCode;

            const employeeBuddiesDetails = await employee_buddies.findOne({
                employee_code: employee_code,
                to_employee_code: to_employee_code,
                mode: "Request",
                status: "Pending"
            })

            if (!employeeBuddiesDetails) {
                return res.status(200).json({ status: 'error', mssg: 'Not Found Any Request To This User', });
            }
            else {

                const deleteProcess = await employee_buddies.findByIdAndDelete({ _id: employeeBuddiesDetails._id })

                if (deleteProcess) {
                    res.status(200).json({ status: 'success', mssg: 'Request Deleted Successfully' });
                }
                else {
                    res.status(200).json({ status: 'error', mssg: 'Details Not Found' });
                }
            }

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 'error', mssg: 'Server Error' });
        }
    }
})

// ===================================================
// ROUTER : 5 Cancel Friend Request ( POST method api : /api/buddies/cancelFriendRequest )
// ===================================================

router.post('/cancelFriendRequest', verifyUser, [

    body('from_employee_code')
        .notEmpty().withMessage('From Employee Details Empty !')
        .isMongoId().withMessage('From Employee Details Value Is Invalid !'),

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
                from_employee_code
            } = req.body;

            let employee_code = userCode;

            const employeeBuddiesDetails = await employee_buddies.findOne({
                employee_code: from_employee_code,
                to_employee_code: employee_code,
                mode: "Request",
                status: "Pending"
            })

            if (!employeeBuddiesDetails) {
                return res.status(200).json({ status: 'error', mssg: 'Not Found Any Request From This User', });
            }
            else {

                const deleteProcess = await employee_buddies.findByIdAndDelete({ _id: employeeBuddiesDetails._id })

                if (deleteProcess) {
                    res.status(200).json({ status: 'success', mssg: 'Request Deleted Successfully' });
                }
                else {
                    res.status(200).json({ status: 'error', mssg: 'Details Not Found' });
                }
            }

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 'error', mssg: 'Server Error' });
        }
    }
})

// ===================================================
// ROUTER : 6 Remove Friend ( POST method api : /api/buddies/removeFriend )
// ===================================================

router.post('/removeFriend', verifyUser, [

    body('buddie_employee_code')
        .notEmpty().withMessage('Buddie Employee Details Empty !')
        .isMongoId().withMessage('Buddie Employee Details Value Is Invalid !'),

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
                buddie_employee_code
            } = req.body;

            let employee_code = userCode;

            const employeeBuddiesDetails = await employee_buddies.findOne({
                $or: [
                    { employee_code: employee_code, to_employee_code: buddie_employee_code },
                    { employee_code: buddie_employee_code, to_employee_code: employee_code }
                ],
                mode: "Friend",
                status: "Accept"
            })

            if (!employeeBuddiesDetails) {
                return res.status(200).json({ status: 'error', mssg: 'Not Found', });
            }
            else {

                const deleteProcess = await employee_buddies.findByIdAndDelete({ _id: employeeBuddiesDetails._id })

                if (deleteProcess) {
                    res.status(200).json({ status: 'success', mssg: 'Friend Deleted Successfully' });
                }
                else {
                    res.status(200).json({ status: 'error', mssg: 'Details Not Found' });
                }
            }

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 'error', mssg: 'Server Error' });
        }
    }
})

module.exports = router;