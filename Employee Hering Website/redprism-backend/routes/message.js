const express = require('express');
const router = express.Router();
const fs = require('fs-extra');

const mongoose = require('mongoose');

const verifyUser = require('../middleware/verifyUser');
const fileUpload = require('../middleware/uploadFile');

const employee_details = require('../models/EmployeeDetails');

const { body, validationResult } = require('express-validator');

const message = require('../models/message');
const message_room = require('../models/message_room');


// ===================================================
// ROUTER : 1 Show Messages ( POST method api : /api/message/showMessages )
// ===================================================

router.post('/showMessages', verifyUser, [

    body('chat_employee_code')
        .notEmpty().withMessage('Employee Details Empty !')
        .isMongoId().withMessage('Employee Details Value Is Invalid !'),

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
                chat_employee_code,
                from_index
            } = req.body;

            let employee_code = userCode;

            const limit = 5000;

            let chatUserDetails = await employee_details.findById(chat_employee_code)
                .select('employee_type')
                .select('first_name')
                .select('last_name')
                .select('employee_image');

            let messageList = await message.find({
                $or: [
                    { from_employee_code: employee_code, to_employee_code: chat_employee_code },
                    { from_employee_code: chat_employee_code, to_employee_code: employee_code }
                ]
            },
                {
                    from_employee_code: 1,
                    to_employee_code: 1,
                    mssg: 1,
                    attachment: 1,
                    mssg_datetime: 1,
                    seen: 1,
                })
                .sort({ mssg_datetime: 1 })
                .skip(from_index)
                .limit(limit);

            // Here user seen all message
            await message.updateMany(
                {
                    from_employee_code: chat_employee_code, to_employee_code: employee_code
                },
                {
                    seen: "Yes",
                }
            )

            return res.status(200).json({ status: 'success', mssg: 'Message List Fetched Successfully', chatUserDetails, messageList });

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 'error', mssg: 'Server Error' });
        }
    }
})


// ===================================================
// ROUTER : 2 Sent Message ( POST method api : /api/message/sentMessage )
// ===================================================

router.post('/sentMessage', verifyUser, fileUpload.messageAttachment, [
    body('chat_employee_code')
        .notEmpty().withMessage('Employee Details Empty !')
        .isMongoId().withMessage('Employee Details Value Is Invalid !'),

], async (req, res) => {

    let filename = '';
    let path = '';

    if (req.file) {
        filename = req.file.filename;
        path = req.file.path;
    }

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        if (req.file) {
            fs.remove(path, err => {
                if (err) return console.error(err)
            })
        }
        const errorsArray = errors.array();
        return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    }
    else {
        try {

            const {
                userCode,
                chat_employee_code,
                mssg
            } = req.body;

            let employee_code = userCode;

            const messageRoomDetails = await message_room.findOne({
                $or: [
                    { from_employee_code: employee_code, to_employee_code: chat_employee_code },
                    { from_employee_code: chat_employee_code, to_employee_code: employee_code }
                ]
            })

            let message_room_id;

            if (!messageRoomDetails) {
                await message_room.create({
                    from_employee_code: employee_code,
                    to_employee_code: chat_employee_code,
                })
                    .then(data => {
                        message_room_id = data.id;
                    })
                    .catch(err => {
                        console.log(err)
                        return res.status(500).json({ status: 'error', mssg: err.message });
                    })
            }
            else {
                message_room_id = messageRoomDetails._id;
            }

            let attachment = '';
            if (filename != "") {
                attachment = 'message_attachment/' + filename;
            }

            await message.create({
                message_room_id: message_room_id,
                from_employee_code: employee_code,
                to_employee_code: chat_employee_code,
                mssg: mssg,
                attachment: attachment,
                seen: "No",
            })
                .then(data => {
                    return res.status(200).json({
                        status: 'success',
                        mssg: 'Message Send Successfully',
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
// ROUTER : 3 Get Chat List ( POST method api : /api/message/getChatList )
// ===================================================
router.get('/getChatList', verifyUser, async (req, res) => {
    try {

        const {
            userCode
        } = req.body;

        let employee_code = userCode;

        // Fetch Mssg Room List
        let messageRoomList = await message_room.aggregate([

            // Get User Details
            {
                $lookup: {
                    from: "employee_details",
                    let: {
                        from_employee_code: "$from_employee_code",
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
                        { $match: { _id: { $ne: new mongoose.Types.ObjectId(employee_code) } } },

                    ],
                    as: "employee_details"
                }
            },


            // // Get User Last Mssg
            {
                $lookup: {
                    from: "message",
                    localField: "_id",
                    foreignField: "message_room_id",
                    pipeline: [
                        { $sort: { mssg_datetime: -1 } },
                        { $limit: 1 },
                    ],
                    as: "message"
                }
            },


            {
                $match: {
                    $or: [
                        { from_employee_code: new mongoose.Types.ObjectId(employee_code) },
                        { to_employee_code: new mongoose.Types.ObjectId(employee_code) }
                    ]
                }
            },

            { $sort: { create_date: -1 } },

            {
                $project: {
                    "_id": 1,
                    "from_employee_code": 1,
                    "to_employee_code": 1,
                    "create_date": 1,
                    "employee_details._id": 1,
                    "employee_details.employee_type": 1,
                    "employee_details.first_name": 1,
                    "employee_details.last_name": 1,
                    "employee_details.employee_image": 1,
                    "message.from_employee_code": 1,
                    "message.to_employee_code": 1,
                    "message.mssg": 1,
                    "message.attachment": 1,
                    "message.seen": 1,
                }
            },

        ]);


        // const messageRoomList = await message_room.find({
        //     $or: [
        //         { from_employee_code: employee_code },
        //         { to_employee_code: employee_code }
        //     ]
        // })
        //     .sort({ create_date: -1 });

        res.status(200).json({ status: 'success', mssg: 'Message Room List Fetch Successfully', messageRoomList });

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'error', mssg: 'Server Error' });
    }

})


// ===================================================
// ROUTER : 4 Get Chat Details ( POST method api : /api/message/getChatDetails )
// ===================================================

router.post('/getChatDetails', verifyUser, [

    body('chat_employee_code')
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
                chat_employee_code
            } = req.body;

            let employee_code = userCode;

            let chatUserDetails = await employee_details.findById(chat_employee_code)
                .select('employee_type')
                .select('first_name')
                .select('last_name')
                .select('employee_image');

            let getLastMessage = await message.findOne({
                $or: [
                    { from_employee_code: employee_code, to_employee_code: chat_employee_code },
                    { from_employee_code: chat_employee_code, to_employee_code: employee_code }
                ]
            })
                .select('from_employee_code').select('to_employee_code').select('mssg')
                .select('attachment')
                .select('seen')
                .sort({ mssg_datetime: -1 })
                .limit(1);

            return res.status(200).json({
                status: 'success',
                mssg: 'Data Fetched Successfully',
                chatUserDetails,
                getLastMessage,
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({ status: 'error', mssg: 'Server Error' });
        }
    }
})


// ===================================================
// ROUTER : 5 Send Us Resume ( POST method api : /api/message/sendUsResume )
// ===================================================

router.post('/sendUsResume', verifyUser, [

    body('chat_employee_code')
        .notEmpty().withMessage('Employee Details Empty !')
        .isMongoId().withMessage('Employee Details Value Is Invalid !'),

    body('email_id')
        .notEmpty().withMessage('Email ID Empty !')
        .isEmail().withMessage('Enter A Valid Email !'),

], async (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        if (req.file) {
            fs.remove(path, err => {
                if (err) return console.error(err)
            })
        }
        const errorsArray = errors.array();
        return res.status(200).json({ status: 'error', field: errorsArray[0]['path'], mssg: errorsArray[0]['msg'], });
    }
    else {
        try {

            const {
                userCode,
                chat_employee_code,
                email_id
            } = req.body;

            if (email_id.includes("gmail")) {
                return res.status(200).json({ status: 'error', field: 'email_id', mssg: 'Not Accept Gmail. Only Use Official Mail', });
            }
            if (email_id.includes("outlook")) {
                return res.status(200).json({ status: 'error', field: 'email_id', mssg: 'Not Accept Outlook. Only Use Official Mail', });
            }
            if (email_id.includes("yahoo")) {
                return res.status(200).json({ status: 'error', field: 'email_id', mssg: 'Not Accept Yahoo. Only Use Official Mail', });
            }
            if (email_id.includes("reddiffmail")) {
                return res.status(200).json({ status: 'error', field: 'email_id', mssg: 'Not Accept Reddiffmail. Only Use Official Mail', });
            }

            let employee_code = userCode;

            const messageRoomDetails = await message_room.findOne({
                $or: [
                    { from_employee_code: employee_code, to_employee_code: chat_employee_code },
                    { from_employee_code: chat_employee_code, to_employee_code: employee_code }
                ]
            })

            let message_room_id;

            if (!messageRoomDetails) {
                await message_room.create({
                    from_employee_code: employee_code,
                    to_employee_code: chat_employee_code,
                })
                    .then(data => {
                        message_room_id = data.id;
                    })
                    .catch(err => {
                        console.log(err)
                        return res.status(500).json({ status: 'error', mssg: err.message });
                    })
            }
            else {
                message_room_id = messageRoomDetails._id;
            }

            let mssg = "HR has shown interest in your profile and asking you to share the resume in this email : " + email_id;

            await message.create({
                message_room_id: message_room_id,
                from_employee_code: employee_code,
                to_employee_code: chat_employee_code,
                mssg: mssg,
                seen: "No",
            })
                .then(data => {
                    return res.status(200).json({
                        status: 'success',
                        mssg: 'Message Send Successfully',
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


module.exports = router;