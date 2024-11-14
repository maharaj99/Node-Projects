const express = require('express');
const router = express.Router();

const Employee = require('../models/EmployeeDetails');
const verifyUser = require('../middleware/verifyUser');

// Get user details with valid token api : /api/getUserDetails
router.get('/', verifyUser, async(req,res)=>{
    try {
        
        let userId = req.body.userCode;
        const user = await Employee.findById(userId)
        .select('employee_type')
        .select('employee_status')
        .select('status_icon')
        .select('first_name')
        .select('last_name')
        .select('user_name')
        .select('ph_num')
        .select('email_id')
        .select('employee_image')
        .select('company_code')
        .select('tech_code')
        .select('exp_code')
        .select('location_code')
        .select('looking_job')
        .select('notice_period')
        .select('immediate_joinner');

        res.status(200).json({ status: 'success', mssg: 'User Details Fetched Successfully', userDetails: user });

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'server error', mssg: 'Server Error' });
    }
})

module.exports = router;