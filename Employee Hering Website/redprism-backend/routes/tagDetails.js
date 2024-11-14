const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const verifyUser = require('../middleware/verifyUser');
const employee_buddies = require('../models/employee_buddies');
const feed_tag_details = require('../models/feed_tag_details');
const comments_tag_details = require('../models/comments_tag_details');

const { body, validationResult } = require('express-validator');



// ===================================================
// ROUTER : 1 Show My Buddy List ( POST method api : /api/tagDetails/showMyBuddysList )
// ===================================================

router.post('/showMyBuddysList', verifyUser, async (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const errorsArray = errors.array();
        return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    }
    else {
        try {

            const {
                userCode,
                search_details
            } = req.body;

            let employee_code = userCode;

            const limit = 50000;
            const from_index = 0;

            let SearchData = null;

            if (search_details) {
                SearchData = {

                    $and: [
                        {
                            $or: [
                                { "employee_code": new mongoose.Types.ObjectId(employee_code) },
                                { "to_employee_code": new mongoose.Types.ObjectId(employee_code) },
                            ],
                        },
                        {
                            $or: [
                                { "employee_details.first_name": { $regex: search_details } },
                                { "employee_details.last_name": { $regex: search_details } },
                                { "employee_details.full_name": { $regex: search_details } },
                                { "employee_details.user_name": { $regex: search_details } },
                                { "employee_details.ph_num": { $regex: search_details } },
                                { "employee_details.email_id": { $regex: search_details } },
                            ]
                        },
                        {
                            "mode": "Friend"
                        },
                        {
                            "status": "Accept",
                        }
                    ]
                };
            }
            else {
                SearchData = {
                    $or: [
                        { "employee_code": new mongoose.Types.ObjectId(employee_code) },
                        { "to_employee_code": new mongoose.Types.ObjectId(employee_code) },
                    ],
                    "mode": "Friend", "status": "Accept",
                }
            };

            console.log(SearchData);

            // Fetch All Employee List
            let employeeList = await employee_buddies.aggregate([

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
                    $match: SearchData
                },
                { $skip: from_index },
                { $limit: limit },
                {
                    $project: {
                        "_id": 1,
                        "employee_details._id": 1,
                        "employee_details.employee_type": 1,
                        "employee_details.first_name": 1,
                        "employee_details.last_name": 1,
                        "employee_details.ph_num": 1,
                        "employee_details.email_id": 1,
                        "employee_details.employee_image": 1,
                    }
                },

            ]);

            return res.status(200).json({ status: 'success', mssg: 'Employee Buddies List Fetched Successfully', employeeList });

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 'error', mssg: 'Server Error' });
        }
    }
})


// ===================================================
// ROUTER : 2 Feed Tag Counting ( POST method api : /api/tagDetails/showFeedTagCounting )
// ===================================================

router.post('/showFeedTagCounting', verifyUser, [

    body('feeds_post_code')
        .notEmpty().withMessage('Feed Post Details Empty !')
        .isMongoId().withMessage('Feed Post Details Value Is Invalid !'),

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
                feeds_post_code
            } = req.body;

            let employee_code = userCode;

            let totalTagEmployee = await feed_tag_details.find({ feeds_post_code: feeds_post_code }).count();

            return res.status(200).json({ status: 'success', mssg: 'Feed Tag Counting Fetched Successfully', totalTagEmployee, });

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 'error', mssg: 'Server Error' });
        }
    }
})


// ===================================================
// ROUTER : 3 Show Feed Tag Details ( POST method api : /api/tagDetails/showFeedTagDetails )
// ===================================================

router.post('/showFeedTagDetails', verifyUser, [

    body('feeds_post_code')
        .notEmpty().withMessage('Feed Post Details Empty !')
        .isMongoId().withMessage('Feed Post Details Value Is Invalid !'),

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
                feeds_post_code
            } = req.body;

            let employee_code = userCode;

            let totalTagEmployee = await feed_tag_details.find({ feeds_post_code: feeds_post_code }).count();

            // Fetch All Tag Employee List
            let tagEmployeeList = await feed_tag_details.aggregate([

                // If Login user sent this user freind request 
                {
                    $lookup: {
                        from: "employee_details",
                        localField: "tag_employee_code",
                        foreignField: "_id",
                        as: "employee_details"
                    }
                },

                {
                    $match: {
                        "feeds_post_code": new mongoose.Types.ObjectId(feeds_post_code),
                    }
                },

                {
                    $project: {
                        "_id": 1,
                        "employee_details._id": 1,
                        "employee_details.employee_type": 1,
                        "employee_details.first_name": 1,
                        "employee_details.last_name": 1,
                        "employee_details.ph_num": 1,
                        "employee_details.email_id": 1,
                        "employee_details.employee_image": 1,
                    }
                },

            ]);

            if (tagEmployeeList.length > 0) {
                return res.status(200).json({ status: 'success', mssg: 'Tag Employee Buddies List Fetched Successfully', totalTagEmployee, tagEmployeeList });
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
// ROUTER : 4 Comments Tag Counting ( POST method api : /api/tagDetails/showCommentsTagCounting )
// ===================================================

router.post('/showCommentsTagCounting', verifyUser, [

    body('comments_code')
        .notEmpty().withMessage('Comments Details Empty !')
        .isMongoId().withMessage('Comments Details Value Is Invalid !'),

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
                comments_code
            } = req.body;

            let employee_code = userCode;

            let totalTagEmployee = await comments_tag_details.find({ comments_code: comments_code }).count();

            return res.status(200).json({ status: 'success', mssg: 'Comments Tag Counting Fetched Successfully', totalTagEmployee, });

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 'error', mssg: 'Server Error' });
        }
    }
})


// ===================================================
// ROUTER : 5 Comments Tag Details ( POST method api : /api/tagDetails/showCommentsTagDetails )
// ===================================================

router.post('/showCommentsTagDetails', verifyUser, [

    body('comments_code')
        .notEmpty().withMessage('Comments Details Empty !')
        .isMongoId().withMessage('Comments Details Value Is Invalid !'),

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
                comments_code
            } = req.body;

            let employee_code = userCode;

            let totalTagEmployee = await comments_tag_details.find({ comments_code: comments_code }).count();

            // Fetch All Comment Tag Employee List
            let tagEmployeeList = await comments_tag_details.aggregate([

                // If Login user sent this user freind request 
                {
                    $lookup: {
                        from: "employee_details",
                        localField: "tag_employee_code",
                        foreignField: "_id",
                        as: "employee_details"
                    }
                },

                {
                    $match: {
                        "comments_code": new mongoose.Types.ObjectId(comments_code),
                    }
                },

                {
                    $project: {
                        "_id": 1,
                        "employee_details._id": 1,
                        "employee_details.employee_type": 1,
                        "employee_details.first_name": 1,
                        "employee_details.last_name": 1,
                        "employee_details.ph_num": 1,
                        "employee_details.email_id": 1,
                        "employee_details.employee_image": 1,
                    }
                },

            ]);

            if (tagEmployeeList.length > 0) {
                return res.status(200).json({ status: 'success', mssg: 'Tag Employee Buddies List Fetched Successfully', totalTagEmployee, tagEmployeeList });
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