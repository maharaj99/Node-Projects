const connectToMongo = require('./db');
connectToMongo();

const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const express = require('express');
const app = express();
const port = 5000;

const cors = require('cors');

app.use(cors({
    origin: "*"
}))

app.use(express.json({limit: '50mb'}));   
app.use(express.static('uploads'));

// ===================================================
//  Demo data insert
// ===================================================

app.use('/api/demoDataInsert', require('./routes/demo_data_insert'));


// ===================================================
//  All Front Routes
// ===================================================
app.use('/api/getUserDetails', require('./routes/getUserDetails'));

app.use('/api/hrRegister', require('./routes/hrRegister'));
app.use('/api/hrLogin', require('./routes/hrLogin'));
app.use('/api/hrForgotPassword', require('./routes/hrForgotPassword'));

app.use('/api/jobseekerRegister', require('./routes/jobseekerRegister'));
app.use('/api/jobseekerLogin', require('./routes/jobseekerLogin'));
app.use('/api/jobseekerForgotPassword', require('./routes/jobseekerForgotPassword'));

app.use('/api/getMasterData', require('./routes/getMasterData'));
app.use('/api/home', require('./routes/home'));
app.use('/api/jobPost', require('./routes/jobPost'));
app.use('/api/walkingJobPost', require('./routes/walkingJobPost'));
app.use('/api/profileDetails', require('./routes/profileDetails'));
app.use('/api/jobSearch', require('./routes/jobSearch'));
app.use('/api/buddies', require('./routes/buddies'));
app.use('/api/message', require('./routes/message'));
app.use('/api/trainings', require('./routes/trainings'));
app.use('/api/sampleResume', require('./routes/sampleResume'));
app.use('/api/reportToAdmin', require('./routes/reportToAdmin'));
app.use('/api/jobDetails', require('./routes/jobDetails'));
app.use('/api/buddiesDetails', require('./routes/buddiesDetails'));
app.use('/api/walkinJobSearch', require('./routes/walkinJobSearch'));
app.use('/api/hrDashboard', require('./routes/hrDashboard'));
app.use('/api/searchEmployee', require('./routes/searchEmployee'));
app.use('/api/internshipPost', require('./routes/internshipPost'));
app.use('/api/internshipSearch', require('./routes/internshipSearch'));
app.use('/api/tagDetails', require('./routes/tagDetails'));



// ===================================================
//  All Admin Routes
// ===================================================

// Common Apis
app.use('/api/admin/common', require('./routes/admin/common'));

// Login
app.use('/api/admin/login', require('./routes/admin/login'));

// sysyemconfig router
app.use('/api/admin/systemInfo', require('./routes/admin/systemInfo'));

// manage menu
app.use('/api/admin/manageMenuMaster',require('./routes/admin/manageMenuMaster'));

// manage sub menu
app.use('/api/admin/manageSubMenuMaster',require('./routes/admin/manageSubMenuMaster'));

// manage user mode
app.use('/api/admin/manageUserMode',require('./routes/admin/manageUserMode'));

//manage user
app.use('/api/admin/manageUser', require('./routes/admin/manageUser'));

// User Mode Permission
app.use('/api/admin/userModePermission',require('./routes/admin/userModePermission'));

// Manage profile
app.use('/api/admin/manageProfile',require('./routes/admin/manageProfile'));

//manage_technology
app.use('/api/admin/manageTechnology',require('./routes/admin/manageTechnology'));

//experience
app.use('/api/admin/experience',require('./routes/admin/experience'));

//location
app.use('/api/admin/location',require('./routes/admin/location'));

//service
app.use('/api/admin/serviceAreaDetails',require('./routes/admin/serviceAreaDetails'));

//salary
app.use('/api/admin/salaryRange',require('./routes/admin/salaryRange'));

//company details
app.use('/api/admin/companyDetails',require('./routes/admin/companyDetails'));

//employee details
app.use('/api/admin/employeeDetails',require('./routes/admin/employeeDetails'));

//training
app.use('/api/admin/training',require('./routes/admin/training'));

//sample resume
app.use('/api/admin/sampleResume',require('./routes/admin/sampleResume'));

//job post details
app.use('/api/admin/jobPostDetails',require('./routes/admin/jobPostDetails'));







// Settings
app.use('/api/admin/settings',require('./routes/admin/settings'));

// Report User
app.use('/api/admin/reportUser',require('./routes/admin/reportUser'));







app.listen(port, () => {
    console.log(`Backend Start in ${port}`);
})