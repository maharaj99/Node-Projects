const mongoose = require('mongoose');

const EmployeeSchema = mongoose.Schema({
    employee_type: {
        type: String,
        required: true,
        enum: ["Hr", "Job Seeker"]
    },
    employee_status: {
        type: String,
        default: '',
    },
    status_icon: {
        type: String,
        default: '',
    },
    first_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
    },
    full_name: {
        type: String,
    },
    user_name: {
        type: String,
        required: true,
        maxLength: 50,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    ph_num: {
        type: Number,
        required: true,
        unique: true,
        maxLength: 10,
    },
    email_id: {
        type: String,
        required: true,
        unique: true,
    },
    employee_image: {
        type: String,
        default: 'employee_image/no_image.png',
    },
    employee_avatar: {
        type: String,
        default: '',
    },
    resume: {
        type: String,
        default: 'resume/no_image.png',
    },
    achievement: {
        type: String,
        default: 'achievement/no_image.png',
    },
    company_code: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'company_details',
        default: null,
    },
    tech_code: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'technology',
        default: null,
    },
    exp_code: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'experience_master',
        default: null,
    },
    location_code: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'location',
        default: null,
    },
    looking_job: {
        type: String,
        default: 'No',
        enum: ["Yes", "No"],
    },
    notice_period: {
        type: String,
        default: 'No',
        enum: ["Yes", "No"],
    },
    immediate_joinner: {
        type: String,
        default: 'No',
        enum: ["Yes", "No"],
    },
    fresher: {
        type: String,
        default: 'No',
        enum: ["Yes", "No"],
    },
    active: {
        type: String,
        default: 'Yes',
        enum: ["Yes", "No"],
    },
},
{ collection: 'employee_details' });

module.exports = mongoose.model('employee_details', EmployeeSchema);