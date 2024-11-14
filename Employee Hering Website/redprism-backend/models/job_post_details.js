const mongoose = require('mongoose');
const { Schema } = mongoose;

const job_post_detailsSchema = new Schema
({
    // Technology
    tech_code: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'technology',
        required: true,
    },
    // Location
    locations:[{
        location_code:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'location',
            required: true,
        }
    }],
    // Company
    company_code:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'company_details',
        required: true,
    },
    // Salary Range
    salary_range_code:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'salary_range',
        required: true,
    },
    // Experience
    exp_code:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'experience_master',
        required: true,
    },
    // Service Area
    service_area_code:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'service_area_details',
        required: true,
    },
    // Targeted Employee
    targeted_employee:{
        type: String,
        required: true,
        enum: ["Fresher", "All"]
    },
    // Job Title
    job_title:{
        type: String,
        required: true,
    },
    // Designation 
    designation:{
        type: String,
        required: true,
    },
    // Description
    description:{
        type: String,
        required: true,
    },
    // Email
    email:{
        type: String,
        required: true,
    },
    // Phone Number 
    ph_num:{
        type: Number,
        required: true,
        maxLength: 10,
    },
    // Status 
    status:{
        type: String,
        required: true,
        enum: ["Pending" , "Approved" , "Reject" , "Closed"]
    },
    // Reject Reason 
    reject_reason:{
        type: String,
        default: '',
    },
    // Post Date Time
    post_datetime:{
        type:Date,
        required:true,
        default: Date.now,
    },
    // Post Employee Type 
    post_employee_type:{
        type: String,
        required: true,
        enum: ["Hr", "Job Seeker"]

    },
    // Post Employee Code
    post_employee_code:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employee_details',
        required: true,
    }
},
{ collection: 'job_post_details' });

module.exports = mongoose.model('job_post_details',job_post_detailsSchema);
