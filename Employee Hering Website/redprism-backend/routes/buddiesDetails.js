const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const verifyUser = require('../middleware/verifyUser');
const Employee = require('../models/EmployeeDetails');
const FeedsPost = require('../models/feeds_post');
const FeedsPostLikeDislike = require('../models/feeds_post_like_dislike');
const FeedsPostComment = require('../models/feeds_post_comments');

const comments_tag_details = require('../models/comments_tag_details');

const { body, validationResult } = require('express-validator');


// ===================================================
// ROUTER : 1 Get Buddies Profile Details ( GET method api : /api/buddiesDetails/getBuddiesProfileDetails )
// ===================================================

router.post('/getBuddiesProfileDetails', verifyUser,
    [
        body('employee_code')
            .notEmpty().withMessage('Employee Details Empty !')
            .isMongoId().withMessage('Employee Details Value Is Invalid !'),

    ],
    async (req, res) => {

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            const errorsArray = errors.array();
            return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
        }
        else {
            try {

                const {
                    userCode,
                    employee_code,
                } = req.body;

                // let employee_code = userCode;

                // Fetch Profile Details
                let profileDetails = await Employee.aggregate([

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
                            from: "technology",
                            localField: "tech_code",
                            foreignField: "_id",
                            as: 'technology'
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
                            from: "location",
                            localField: "location_code",
                            foreignField: "_id",
                            as: 'location'
                        }
                    },

                    {
                        $match: { "_id": new mongoose.Types.ObjectId(employee_code) }
                    },
                    {
                        $project: {
                            "_id": 1,
                            "employee_type": 1,
                            "employee_status": 1,
                            "status_icon": 1,
                            "first_name": 1,
                            "last_name": 1,
                            "user_name": 1,
                            "ph_num": 1,
                            "email_id": 1,
                            "employee_image": 1,
                            "resume": 1,
                            "achievement": 1,
                            "company_details._id": 1,
                            "company_details.company_name": 1,
                            "technology._id": 1,
                            "technology.tech_name": 1,
                            "experience_master._id": 1,
                            "experience_master.experience": 1,
                            "location._id": 1,
                            "location.state": 1,
                            "location.city": 1,
                            "location.area": 1,
                            "looking_job": 1,
                            "notice_period": 1,
                            "immediate_joinner": 1,
                            "fresher": 1,
                        }
                    },

                ]);

                if (profileDetails.length > 0) {
                    return res.status(200).json({ status: 'success', mssg: 'Profile Details Fetched Successfully', profileDetails });
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
// ROUTER : 2 Get Buddies Feeds Post ( POST method api : /api/buddiesDetails/getBuddiesFeedsPost )
// ===================================================

router.post('/getBuddiesFeedsPost', verifyUser, [

    body('employee_code')
        .notEmpty().withMessage('Employee Details Empty !')
        .isMongoId().withMessage('Employee Details Value Is Invalid !'),

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
                employee_code
            } = req.body;

            const limit = 5000;

            // Fetch Feeds Post List
            let feedsList = await FeedsPost.aggregate([

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
                    $lookup:
                    {
                        from: "feeds_post_like_dislike",
                        localField: "_id",
                        foreignField: "feeds_post_code",
                        as: 'feeds_post_like_dislike',
                        pipeline: [
                            {
                                $match: {
                                    type: "Like",
                                }
                            }
                        ],
                    }
                },
                {
                    $lookup:
                    {
                        from: "feeds_post_like_dislike",
                        localField: "_id",
                        foreignField: "feeds_post_code",
                        as: 'user_like',
                        pipeline: [
                            {
                                $match: {
                                    type: "Like",
                                    employee_code: new mongoose.Types.ObjectId(employee_code),
                                }
                            }
                        ],
                    }
                },

                {
                    $lookup:
                    {
                        from: "feeds_post_comments",
                        localField: "_id",
                        foreignField: "feeds_post_code",
                        as: 'feeds_post_comments',
                        pipeline: [
                            {
                                $match: {
                                    type: "Comment",
                                }
                            }
                        ],
                    }
                },

                {
                    $lookup:
                    {
                        from: "feed_tag_details",
                        localField: "_id",
                        foreignField: "feeds_post_code",
                        as: 'feed_tag_details'
                    }
                },

                {
                    $match: { "employee_code": new mongoose.Types.ObjectId(employee_code) }
                },

                { $sort: { post_datetime: -1 } },
                { $limit: limit },

                {
                    $project: {
                        "_id": 1,
                        "post_details": 1,
                        "post_datetime": 1,
                        "employee_details._id": 1,
                        "employee_details.employee_type": 1,
                        "employee_details.employee_status": 1,
                        "employee_details.status_icon": 1,
                        "employee_details.first_name": 1,
                        "employee_details.last_name": 1,
                        "employee_details.employee_image": 1,
                        "totalLike": {
                            $size: '$feeds_post_like_dislike',
                        },
                        "user_like": '$user_like',
                        "totalComments": {
                            $size: '$feeds_post_comments',
                        },
                        "totalTag": {
                            $size: '$feed_tag_details',
                        },
                    }
                },

            ]);

            if (feedsList) {
                return res.status(200).json({ status: 'success', mssg: 'Feeds List Fetched Successfully', limit, feedsList });
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
// ROUTER : 3 Save Feeds Post Like Dislike ( POST method api : /api/buddiesDetails/saveFeedsPostLikeDislike )
// ===================================================

router.post('/saveFeedsPostLikeDislike', verifyUser, [

    body('feeds_post_code')
        .notEmpty().withMessage('Feed Post Empty !')
        .isMongoId().withMessage('Filed Value Is Invalid !'),

    body('type')
        .notEmpty().withMessage('Type Empty !')
        .isIn(['Like', 'Dislike']).withMessage('Type does contain invalid value'),

], async (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const errorsArray = errors.array();
        return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    }
    else {
        try {

            const {
                feeds_post_code,
                userCode,
                type
            } = req.body;

            let employee_code = userCode;

            if (type == "Dislike") {

                // If Type Dislike Then Delete User Like Data
                await FeedsPostLikeDislike.deleteOne({ feeds_post_code: feeds_post_code, employee_code: employee_code });
                res.status(200).json({
                    status: 'success',
                    mssg: 'Post ' + type + ' Successfully'
                });
            }
            else {

                let checkData = await FeedsPostLikeDislike.findOne({ feeds_post_code: feeds_post_code, employee_code: employee_code, type: type, });

                if (!checkData) {

                    // If Type Like Then Insert User Like Data
                    FeedsPostLikeDislike.create({
                        feeds_post_code: feeds_post_code,
                        employee_code: employee_code,
                        type: type,
                    })
                        .then(feeds_post_like_dislike => {
                            return res.status(200).json({
                                status: 'success',
                                mssg: 'Post ' + type + ' Successfully',
                                feeds_post_like_dislike_id: feeds_post_like_dislike.id
                            });
                        })
                        .catch(err => {
                            console.log(err)
                            return res.status(500).json({ status: 'error', mssg: err.message });
                        })

                }
                else {
                    res.status(200).json({
                        status: 'success',
                        mssg: 'You Already Liked This Post'
                    });
                }

            }

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 'error', mssg: 'Server Error' });
        }
    }
})


// ===================================================
// ROUTER : 4 Save Feeds Comments ( POST method api : /api/buddiesDetails/saveFeedsComment )
// ===================================================

router.post('/saveFeedsComment', verifyUser, [

    body('feeds_post_code')
        .notEmpty().withMessage('Feed Post Empty !')
        .isMongoId().withMessage('Filed Value Is Invalid !'),

    body('comment')
        .notEmpty().withMessage('Comment Empty !'),

], async (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const errorsArray = errors.array();
        return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    }
    else {
        try {

            const {
                feeds_post_code,
                userCode,
                comment,
                tag_buddies
            } = req.body;

            let employee_code = userCode;
            let feeds_comment_id = '';
            let mssg = '';

            // Insert New Data
            await FeedsPostComment.create({
                feeds_post_code: feeds_post_code,
                employee_code: employee_code,
                comment: comment,
                type: "Comment",
            })
                .then(feeds_comment => {
                    feeds_comment_id = feeds_comment.id,
                    mssg = 'Comment Saved Successfully';
                })
                .catch(err => {
                    console.log(err)
                    return res.status(500).json({ status: 'error', mssg: err.message });
                })

            // Insert Tag Employee List
            if (tag_buddies) {
                let insertData = [];

                for (let index = 0; index < tag_buddies.length; index++) {
                    insertData.push({
                        comments_code: feeds_comment_id,
                        tag_employee_code: tag_buddies[index].employee_code,
                        post_employee_code: employee_code,
                    });
                }

                if (tag_buddies.length > 0) {

                    await comments_tag_details
                        .insertMany(insertData)
                        .then((data) => {
                            mssg = 'Comments & Tag Buddies Details Saved Successfully';
                        })
                        .catch((err) => {
                            console.log(err);
                            return res.status(200).json({ status: "error", mssg: err.message });
                        });
                }

            }

            return res.status(200).json({
                status: 'success',
                mssg: mssg,
                feeds_comment_id: feeds_comment_id
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 'error', mssg: 'Server Error' });
        }
    }
})


// ===================================================
// ROUTER : 5 Get Feeds Comments List ( POST method api : /api/buddiesDetails/getFeedsPostCommentsList )
// ===================================================

router.post('/getFeedsPostCommentsList', verifyUser, [

    body('feeds_post_code')
        .notEmpty().withMessage('Feed Post Empty !')
        .isMongoId().withMessage('Filed Value Is Invalid !'),

], async (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const errorsArray = errors.array();
        return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    }
    else {
        try {

            const {
                feeds_post_code
            } = req.body;

            // Fetch Feeds Post List
            let feedsCommentsList = await FeedsPostComment.aggregate([

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
                    $lookup:
                    {
                        from: "comments_tag_details",
                        localField: "_id",
                        foreignField: "comments_code",
                        as: 'comments_tag_details'
                    }
                },

                { $sort: { datetime: -1 } },
                {
                    $match: { "feeds_post_code": new mongoose.Types.ObjectId(feeds_post_code), }
                },
                {
                    $project: {
                        "_id": 1,
                        "comment": 1,
                        "datetime": 1,
                        "employee_details._id": 1,
                        "employee_details.employee_type": 1,
                        "employee_details.employee_status": 1,
                        "employee_details.status_icon": 1,
                        "employee_details.first_name": 1,
                        "employee_details.last_name": 1,
                        "employee_details.employee_image": 1,
                        "totalTag": {
                            $size: '$comments_tag_details',
                        },
                    }
                },

            ]);

            if (feedsCommentsList) {
                return res.status(200).json({ status: 'success', mssg: 'Feeds Comments List Fetched Successfully', feedsCommentsList });
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
// ROUTER : 6 Delete Feeds Comments ( POST method api : /api/buddiesDetails/deleteFeedsComment )
// ===================================================

router.post('/deleteFeedsComment', verifyUser, [

    body('feeds_comment_code')
        .notEmpty().withMessage('Feed Comment Empty !')
        .isMongoId().withMessage('Filed Value Is Invalid !'),

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
                feeds_comment_code
            } = req.body;

            let employee_code = userCode;

            let deleteProcess = await FeedsPostComment.findOneAndDelete({ employee_code: employee_code, _id: feeds_comment_code });

            await comments_tag_details.deleteMany({comments_code : feeds_comment_code});

            if (deleteProcess) {
                return res.status(200).json({ status: 'success', mssg: 'Comment Deleted Successfully' });
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
// ROUTER : 7 Get Total Like & Comments ( POST method api : /api/buddiesDetails/getTotalLikeComments )
// ===================================================

router.post('/getTotalLikeComments', verifyUser, [

    body('feeds_post_code')
        .notEmpty().withMessage('Feed Post Empty !')
        .isMongoId().withMessage('Feed Post Value Is Invalid !'),

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

            let totalLikes = await FeedsPostLikeDislike.count({ feeds_post_code: feeds_post_code, type: "Like" });

            let totalComments = await FeedsPostComment.count({ feeds_post_code: feeds_post_code, type: "Comment" });

            return res.status(200).json({ status: 'success', mssg: 'Details Fetched Successfully', totalLikes, totalComments });

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 'error', mssg: 'Server Error' });
        }
    }
})


module.exports = router;