
const express = require('express');
const { body, validationResult } = require('express-validator');

const router = express.Router();

const verifyUser = require('../middleware/verifyUser');

const report_user = require('../models/report_user');;


// ===================================================
// ROUTER : 1 Save Report User ( POST method api : /api/reportToAdmin/saveReport )
// ===================================================
router.post('/saveReport', verifyUser, [

    body('report_to_employee_code')
        .notEmpty().withMessage('Report To Employee Details Empty !')
        .isMongoId().withMessage('Report To Employee Details Value Is Invalid !'),

    body('message')
        .notEmpty().withMessage('Message Empty !'),
        
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
                report_to_employee_code,
                message
            } = req.body;

            let employee_code = userCode;

            // If All Good then insert the employee job apply details 
            await report_user.create({
                report_to_employee_code: report_to_employee_code,
                message: message,
                report_employee_code: employee_code,
            })
                .then(data => {
                    return res.status(200).json({ status: 'success', mssg: 'Report Submitted Successfully', id: data.id });
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