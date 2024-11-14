const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const fs = require('fs-extra');
const bcrypt = require('bcryptjs');

const verifyUser = require('../middleware/verifyUser');
const fileUpload = require('../middleware/uploadFile');
const Employee = require('../models/EmployeeDetails');
const FeedsPost = require('../models/feeds_post');
const FeedsPostLikeDislike = require('../models/feeds_post_like_dislike');
const FeedsPostComment = require('../models/feeds_post_comments');

const feed_tag_details = require('../models/feed_tag_details');
const comments_tag_details = require('../models/comments_tag_details');

const { body, validationResult } = require('express-validator');

const Jimp = require("jimp");


// ===================================================
// ROUTER : 1 Get My Profile Details ( GET method api : /api/profileDetails/getMyProfileDetails )
// ===================================================

router.get('/getMyProfileDetails', verifyUser, async (req, res) => {

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
// ROUTER : 2 Update HR Profile Details ( POST method api : /api/profileDetails/updateHrProfileDetails )
// ===================================================
router.post('/updateHrProfileDetails', verifyUser, [

    body('first_name').notEmpty().withMessage('First Name Empty !'),
    body('last_name').notEmpty().withMessage('Last Name Empty !'),
    body('user_name').notEmpty().withMessage('User Name Empty !')
        .isLength({ max: 50 }).withMessage('User Name Max Length Is 50 !'),

    body('ph_num')
        .notEmpty().withMessage('Phone Number Empty !')
        .isMobilePhone().withMessage('Enter A Valid Phone Number !')
        .isLength({ min: 10, max: 10 }).withMessage('Enter A Valid Phone Number !'),

    body('email_id')
        .notEmpty().withMessage('Email ID Empty !')
        .isEmail().withMessage('Enter A Valid Email !'),

    body('company_code')
        .notEmpty().withMessage('Company Empty !')
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
                first_name,
                last_name,
                user_name,
                ph_num,
                email_id,
                company_code
            } = req.body;

            let employee_code = userCode;

            // Check User Name exist or not
            let EmployeeUserName = await Employee.findOne({ _id: { $ne: employee_code }, user_name: user_name });
            if (EmployeeUserName) {
                return res.status(200).json({ status: 'error', field: 'user_name', mssg: 'User Name Already Exist', });
            }

            // Check Phone Number exist or not
            let EmployeePhNum = await Employee.findOne({ _id: { $ne: employee_code }, ph_num: ph_num });
            if (EmployeePhNum) {
                return res.status(200).json({ status: 'error', field: 'ph_num', mssg: 'Phone Number Already Exist', });
            }

            // Check Email ID exist or not
            let EmployeeEmailID = await Employee.findOne({ _id: { $ne: employee_code }, email_id: email_id });
            if (EmployeeEmailID) {
                return res.status(200).json({ status: 'error', field: 'email_id', mssg: 'Email ID Already Exist', });
            }

            const updateProcess = await Employee.findOneAndUpdate({ _id: employee_code, employee_type: "Hr" }, {
                first_name: first_name,
                last_name: last_name,
                user_name: user_name,
                ph_num: ph_num,
                email_id: email_id,
                company_code: company_code,
            })

            if (updateProcess) {
                res.status(200).json({ status: 'success', mssg: 'Profile Updated Successfully' });
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
// ROUTER : 3 Update Job Seeker Profile Details ( POST method api : /api/profileDetails/updateJobSeekerProfileDetails )
// ===================================================
router.post('/updateJobSeekerProfileDetails', verifyUser, [

    body('employee_status').notEmpty().withMessage('Status Empty !'),
    body('status_icon').notEmpty().withMessage('Status Icon Empty !'),
    body('first_name').notEmpty().withMessage('First Name Empty !'),
    body('last_name').notEmpty().withMessage('Last Name Empty !'),
    body('user_name').notEmpty().withMessage('User Name Empty !')
        .isLength({ max: 50 }).withMessage('User Name Max Length Is 50 !'),

    body('ph_num')
        .notEmpty().withMessage('Phone Number Empty !')
        .isMobilePhone().withMessage('Enter A Valid Phone Number !')
        .isLength({ min: 10, max: 10 }).withMessage('Enter A Valid Phone Number !'),

    body('email_id')
        .notEmpty().withMessage('Email ID Empty !')
        .isEmail().withMessage('Enter A Valid Email !'),

    body('company_code').if(body('company_code').not().isEmpty())
        .isMongoId().withMessage('Filed Value Is Invalid !'),

    body('tech_code')
        .notEmpty().withMessage('Technology Empty !')
        .isMongoId().withMessage('Filed Value Is Invalid !'),

    body('exp_code').if(body('fresher').equals('No'))
        .notEmpty().withMessage('Experience Empty !')
        .isMongoId().withMessage('Filed Value Is Invalid !'),

    body('location_code')
        .notEmpty().withMessage('Location Empty !')
        .isMongoId().withMessage('Filed Value Is Invalid !'),

    body('looking_job')
        .notEmpty().withMessage('Location Empty !'),

    body('looking_job')
        .notEmpty().withMessage('Looking job Empty !')
        .isIn(['Yes', 'No']).withMessage('Looking job does contain invalid value'),

    body('notice_period')
        .notEmpty().withMessage('Notice Period Empty !')
        .isIn(['Yes', 'No']).withMessage('Notice Period does contain invalid value'),

    body('immediate_joinner')
        .notEmpty().withMessage('Immediate Joinner Empty !')
        .isIn(['Yes', 'No']).withMessage('Immediate Joinner does contain invalid value'),

    body('fresher')
        .notEmpty().withMessage('Fresher Empty !')
        .isIn(['Yes', 'No']).withMessage('Fresher does contain invalid value'),

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
                employee_status,
                status_icon,
                first_name,
                last_name,
                user_name,
                ph_num,
                email_id,
                company_code,
                tech_code,
                exp_code,
                location_code,
                looking_job,
                notice_period,
                immediate_joinner,
                fresher
            } = req.body;

            let employee_code = userCode;

            // Check User Name exist or not
            let EmployeeUserName = await Employee.findOne({ _id: { $ne: employee_code }, user_name: user_name });
            if (EmployeeUserName) {
                return res.status(200).json({ status: 'error', field: 'user_name', mssg: 'User Name Already Exist', });
            }

            // Check Phone Number exist or not
            let EmployeePhNum = await Employee.findOne({ _id: { $ne: employee_code }, ph_num: ph_num });
            if (EmployeePhNum) {
                return res.status(200).json({ status: 'error', field: 'ph_num', mssg: 'Phone Number Already Exist', });
            }

            // Check Email ID exist or not
            let EmployeeEmailID = await Employee.findOne({ _id: { $ne: employee_code }, email_id: email_id });
            if (EmployeeEmailID) {
                return res.status(200).json({ status: 'error', field: 'email_id', mssg: 'Email ID Already Exist', });
            }

            const data = {
                employee_status: employee_status,
                status_icon: status_icon,
                first_name: first_name,
                last_name: last_name,
                user_name: user_name,
                ph_num: ph_num,
                email_id: email_id,
                tech_code: tech_code,
                location_code: location_code,
                looking_job: looking_job,
                notice_period: notice_period,
                immediate_joinner: immediate_joinner,
                fresher: fresher
            };

            if (company_code) { data.company_code = company_code }
            if (exp_code) { data.exp_code = exp_code }

            const updateProcess = await Employee.findOneAndUpdate({ _id: employee_code, employee_type: "Job Seeker" }, data)

            if (updateProcess) {
                res.status(200).json({ status: 'success', mssg: 'Profile Updated Successfully' });
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
// ROUTER : 3 Change Password ( POST method api : /api/profileDetails/changePassword )
// ===================================================
router.post('/changePassword', verifyUser, [

    body('old_password').notEmpty().withMessage('Old Password Empty !'),
    body('new_password').notEmpty().withMessage('New Password Empty !'),

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
                old_password,
                new_password
            } = req.body;

            let employee_code = userCode;

            let employee_details = await Employee.findById(employee_code).select('password');

            // Paswword check
            const passwordCompare = await bcrypt.compare(old_password, employee_details.password);
            if (!passwordCompare) {
                return res.status(200).json({ status: 'error', mssg: 'Wrong Password', });
            }

            // If Old Password Match 
            const salt = await bcrypt.genSalt(10);
            const encodedPassword = await bcrypt.hash(new_password, salt);

            const data = {
                password: encodedPassword,
            };

            const updateProcess = await Employee.findByIdAndUpdate(employee_code, data)

            if (updateProcess) {
                res.status(200).json({ status: 'success', mssg: 'Password Updated Successfully' });
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
// ROUTER : 5 Save Profile Photo ( POST method api : /api/profileDetails/updateProfilePhoto )
// ===================================================

router.post('/updateProfilePhoto', verifyUser, fileUpload.employeeImage, async (req, res) => {

    try {

        // check file exist or not and get the flie name 
        if (!req.file) {
            return res.status(200).json({ status: 'error', mssg: 'Please Upload A Valid File' });
        }
        const {
            filename
        } = req.file;

        const {
            userCode
        } = req.body;

        let employee_code = userCode;

        let employee_details = await Employee.findById(employee_code).select('employee_image');

        if (employee_details.employee_image != "employee_image/no_image.png" && employee_details.employee_image != "") {
            fs.remove('./uploads/' + employee_details.employee_image, err => {
                if (err) return console.error(err)
                // console.log('success!')
            })
        }

        const updateProcess = await Employee.findByIdAndUpdate(employee_code, {
            employee_image: 'employee_image/' + filename,
        })

        if (updateProcess) {
            res.status(200).json({ status: 'success', mssg: 'Profile Image Updated Successfully' });
        }
        else {
            res.status(200).json({ status: 'error', mssg: 'Details Not Found' });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }

})


// ===================================================
// ROUTER : 6 Upload Resume ( POST method api : /api/profileDetails/uploadResume )
// ===================================================
router.post('/uploadResume', verifyUser, fileUpload.resume, async (req, res) => {

    try {

        // check file exist or not and get the flie name 
        if (!req.file) {
            return res.status(200).json({ status: 'error', mssg: 'Please Upload A Valid File' });
        }
        const {
            filename
        } = req.file;

        const {
            userCode
        } = req.body;

        let employee_code = userCode;

        let employee_details = await Employee.findById(employee_code).select('resume');

        if (employee_details.resume != "resume/no_image.png" && employee_details.resume != "") {
            fs.remove('./uploads/' + employee_details.resume, err => {
                if (err) return console.error(err)
                // console.log('success!')
            })
        }

        const updateProcess = await Employee.findByIdAndUpdate(employee_code, {
            resume: 'resume/' + filename,
        })

        if (updateProcess) {
            res.status(200).json({ status: 'success', mssg: 'Resume Uploaded Successfully' });
        }
        else {
            res.status(200).json({ status: 'error', mssg: 'Details Not Found' });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }

})


// ===================================================
// ROUTER : 7 Upload Achievement ( POST method api : /api/profileDetails/uploadAchievement )
// ===================================================
router.post('/uploadAchievement', verifyUser, fileUpload.achievement, async (req, res) => {

    try {

        // check file exist or not and get the flie name 
        if (!req.file) {
            return res.status(200).json({ status: 'error', mssg: 'Please Upload A Valid File' });
        }
        const {
            filename
        } = req.file;

        const {
            userCode
        } = req.body;

        let employee_code = userCode;

        let employee_details = await Employee.findById(employee_code).select('achievement');

        if (employee_details.achievement != "achievement/no_image.png" && employee_details.achievement != "") {
            fs.remove('./uploads/' + employee_details.achievement, err => {
                if (err) return console.error(err)
                // console.log('success!')
            })
        }

        const updateProcess = await Employee.findByIdAndUpdate(employee_code, {
            achievement: 'achievement/' + filename,
        })

        if (updateProcess) {
            res.status(200).json({ status: 'success', mssg: 'Achievement Uploaded Successfully' });
        }
        else {
            res.status(200).json({ status: 'error', mssg: 'Details Not Found' });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }

})

// ===================================================
// ROUTER : 8 Get My Feeds Post ( POST method api : /api/profileDetails/getMyFeedsPost )
// ===================================================

router.post('/getMyFeedsPost', verifyUser, [

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
                from_index
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
                    $match: { "employee_code": new mongoose.Types.ObjectId(employee_code) }
                },
                { $skip: from_index },
                { $limit: limit },
                { $sort: { post_datetime: -1 } },
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
// ROUTER : 9 Delete My Feed Post ( POST method api : /api/profileDetails/deleteMyFeedPost )
// ===================================================

router.post('/deleteMyFeedPost', verifyUser, [

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

            let deleteProcess = await FeedsPost.findOneAndDelete({ _id: feeds_post_code, employee_code: employee_code });

            await feed_tag_details.deleteMany({ feeds_post_code: feeds_post_code });

            if (deleteProcess) {

                await FeedsPostComment.deleteMany({ feeds_post_code: feeds_post_code });
                await FeedsPostLikeDislike.deleteMany({ feeds_post_code: feeds_post_code });

                res.status(200).json({ status: 'success', mssg: 'Feed Post Details Deleted Successfully' });
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
// ROUTER : 10 Save Feeds Post Like Dislike ( POST method api : /api/profileDetails/saveFeedsPostLikeDislike )
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
// ROUTER : 11 Save Feeds Comments ( POST method api : /api/profileDetails/saveFeedsComment )
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
                    feeds_comment_id = feeds_comment.id;
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
// ROUTER : 12 Get Feeds Comments List ( POST method api : /api/profileDetails/getFeedsPostCommentsList )
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
// ROUTER : 13 Delete Feeds Comments ( POST method api : /api/profileDetails/deleteFeedsComment )
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
// ROUTER : 14 Get Total Like & Comments ( POST method api : /api/profileDetails/getTotalLikeComments )
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
// ROUTER : 15 Remove Profile Photo ( POST method api : /api/profileDetails/removeProfilePhoto )
// ===================================================

router.get('/removeProfilePhoto', verifyUser, async (req, res) => {

    try {

        const {
            userCode
        } = req.body;

        let employee_code = userCode;

        let employeeDataget = await Employee.findById(employee_code).select("employee_image");

        if (employeeDataget.employee_image != "employee_image/no_image.png" && employeeDataget.employee_image != "") {
            fs.remove('./uploads/' + employeeDataget.employee_image, err => {
                if (err) return console.error(err)
                // console.log('success!')
            })
        }

        const updateProcess = await Employee.findByIdAndUpdate(employee_code, {
            employee_image: 'employee_image/no_image.png',
            employee_avatar: '',
        })

        if (updateProcess) {
            res.status(200).json({ status: 'success', mssg: 'Profile Image Removed Successfully' });
        }
        else {
            res.status(200).json({ status: 'error', mssg: 'Details Not Found' });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }

})


// ===================================================
// ROUTER : 16 Remove Resume ( POST method api : /api/profileDetails/removeResume )
// ===================================================

router.get('/removeResume', verifyUser, async (req, res) => {

    try {

        const {
            userCode
        } = req.body;

        let employee_code = userCode;

        let employee_details = await Employee.findById(employee_code).select('resume');

        if (employee_details.resume != "resume/no_image.png" && employee_details.resume != "") {
            fs.remove('./uploads/' + employee_details.resume, err => {
                if (err) return console.error(err)
                // console.log('success!')
            })
        }

        const updateProcess = await Employee.findByIdAndUpdate(employee_code, {
            resume: 'resume/no_image.png',
        })

        if (updateProcess) {
            res.status(200).json({ status: 'success', mssg: 'Resume Removed Successfully' });
        }
        else {
            res.status(200).json({ status: 'error', mssg: 'Details Not Found' });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }

})


// ===================================================
// ROUTER : 17 Remove Achievement ( POST method api : /api/profileDetails/removeAchievement )
// ===================================================

router.get('/removeAchievement', verifyUser, async (req, res) => {

    try {

        const {
            userCode
        } = req.body;

        let employee_code = userCode;

        let employee_details = await Employee.findById(employee_code).select('achievement');

        if (employee_details.achievement != "achievement/no_image.png" && employee_details.achievement != "") {
            fs.remove('./uploads/' + employee_details.achievement, err => {
                if (err) return console.error(err)
                // console.log('success!')
            })
        }

        const updateProcess = await Employee.findByIdAndUpdate(employee_code, {
            achievement: 'achievement/no_image.png',
        })

        if (updateProcess) {
            res.status(200).json({ status: 'success', mssg: 'Achievement Removed Successfully' });
        }
        else {
            res.status(200).json({ status: 'error', mssg: 'Details Not Found' });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }

})


// ===================================================
// ROUTER : 18 Insert Avatar ( POST method api : /api/profileDetails/insertAvatar )
// ===================================================

router.post('/insertAvatar', verifyUser, [

    body('avatar')
        .notEmpty().withMessage('Avatar Empty !'),

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
                avatar
            } = req.body;

            const employee_image = "employee_image/employee_image"+ "-" + Date.now() +".png";

            // Base64 string
            const data = avatar.split(',')[1];

            // Convert base64 to buffer => <Buffer ff d8 ff db 00 43 00 ...
            const buffer = Buffer.from(data, "base64");

            Jimp.read(buffer, (err, res) => {
                if (err) throw new Error(err);
                res.quality(5).write("./uploads/"+employee_image);
            });

            const updateProcess = await Employee.findByIdAndUpdate(userCode, {
                employee_image: employee_image,
            })

            if (updateProcess) {
                res.status(200).json({ status: 'success', mssg: 'Profile Image Avatar Updated Successfully' });
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