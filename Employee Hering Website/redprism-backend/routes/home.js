const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const verifyUser = require('../middleware/verifyUser');
const TechDetails = require('../models/technology_master');
const FeedsPost = require('../models/feeds_post');
const FeedsPostLikeDislike = require('../models/feeds_post_like_dislike');
const FeedsPostComment = require('../models/feeds_post_comments');

const feed_tag_details = require('../models/feed_tag_details');
const comments_tag_details = require('../models/comments_tag_details');

const { body, validationResult } = require('express-validator');
const swearjar = require('swearjar');


// ===================================================
// ROUTER : 1 Get Active Tech List ( GET method api : /api/home/getTechList )
// ===================================================
router.get('/getTechList', verifyUser, async (req, res) => {
    try {
        // Fetch Tech List
        let techList = await TechDetails.find({ active: "Yes" })
            .select('tech_name').lean();

        if (techList) {
            return res.status(200).json({ status: 'success', mssg: 'Tech List Fetched Successfully', techList: techList });
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
// ROUTER : 2 Save Feeds Post ( POST method api : /api/home/saveFeedsPost )
// ===================================================

router.post('/saveFeedsPost', verifyUser, [

    body('tech_code')
        .notEmpty().withMessage('Technology Empty !')
        .isMongoId().withMessage('Technology Is Invalid !'),

    body('post_details')
        .notEmpty().withMessage('Post Details Empty !'),

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
                post_details,
                tag_buddies
            } = req.body;

            const commentArray = {
                "words": ["sex", "sexy", "sextalk", "fuck"]
            };

            const postDetailsArr = post_details.split(' ');
            let matchBadWords = 'No';
            commentArray.words.find(words => {
                if (postDetailsArr.includes(words.toLowerCase())) {
                    matchBadWords = "Yes";
                }
            });

            if (matchBadWords === "Yes") {
                return res.status(200).json({
                    status: 'error',
                    mssg: "Please Don't Use Any Kind of Slang & Vulgarity "
                });
            }

            // if (swearjar.profane(post_details)===true) {
            //     return res.status(200).json({
            //         status: 'error',
            //         mssg: "Please Don't Use Any Kind of Slang & Vulgarity "
            //     });
            // }

            let employee_code = userCode;
            let feeds_post_id = '';
            let mssg = '';

            await FeedsPost.create({
                tech_code: tech_code,
                employee_code: employee_code,
                post_details: post_details,
            })
                .then(feeds_post => {
                    feeds_post_id = feeds_post.id;
                    mssg = 'Post Save Successfully';
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
                        feeds_post_code: feeds_post_id,
                        tag_employee_code: tag_buddies[index].employee_code,
                        post_employee_code: employee_code,
                    });
                }

                if (tag_buddies.length > 0) {
                    await feed_tag_details
                        .insertMany(insertData)
                        .then((data) => {
                            mssg = 'Feed Post & Tag Buddies Details Saved Successfully';
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
                feeds_post_id: feeds_post_id
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 'error', mssg: 'Server Error' });
        }
    }
})


// ===================================================
// ROUTER : 3 Get Feeds Post ( POST method api : /api/home/getFeedsPost )
// ===================================================

router.post('/getFeedsPost', verifyUser, [

    body('tech_code')
        .notEmpty().withMessage('Technology Empty !')
        .isMongoId().withMessage('Technology Is Invalid !'),

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
                tech_code,
                from_index
            } = req.body;

            let employee_code = userCode;

            const limit = 5;

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
                    $match: { "tech_code": new mongoose.Types.ObjectId(tech_code), "employee_details.active": "Yes", }
                },

                { $sort: { post_datetime: -1 } },
                { $skip: from_index },
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
// ROUTER : 4 Save Feeds Post Like Dislike ( POST method api : /api/home/saveFeedsPostLikeDislike )
// ===================================================

router.post('/saveFeedsPostLikeDislike', verifyUser, [

    body('feeds_post_code')
        .notEmpty().withMessage('Feed Post Empty !')
        .isMongoId().withMessage('Feed Post Value Is Invalid !'),

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
// ROUTER : 5 Save Feeds Comments ( POST method api : /api/home/saveFeedsComment )
// ===================================================

router.post('/saveFeedsComment', verifyUser, [

    body('feeds_post_code')
        .notEmpty().withMessage('Feed Post Empty !')
        .isMongoId().withMessage('Feed Post Value Is Invalid !'),

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
// ROUTER : 6 Get Feeds Comments List ( POST method api : /api/home/getFeedsPostCommentsList )
// ===================================================

router.post('/getFeedsPostCommentsList', verifyUser, [

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
// ROUTER : 7 Delete Feeds Comments ( POST method api : /api/home/deleteFeedsComment )
// ===================================================

router.post('/deleteFeedsComment', verifyUser, [

    body('feeds_comment_code')
        .notEmpty().withMessage('Feed Comment Empty !')
        .isMongoId().withMessage('Feed Comment Value Is Invalid !'),

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

            await comments_tag_details.deleteMany({ comments_code: feeds_comment_code });

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
// ROUTER : 8 Get Total Like & Comments ( POST method api : /api/home/getTotalLikeComments )
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



// ===================================================
// ROUTER : 9 Get Feeds Post Details ( POST method api : /api/home/getFeedsPostDetails )
// ===================================================

router.post('/getFeedsPostDetails', verifyUser, [

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

            let employee_code = userCode;

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
                    $match: { "_id": new mongoose.Types.ObjectId(feeds_post_code) }
                },
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
                return res.status(200).json({ status: 'success', mssg: 'Feeds Details Fetched Successfully', feedsList });
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