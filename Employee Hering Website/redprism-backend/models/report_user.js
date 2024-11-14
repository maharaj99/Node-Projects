const mongoose = require('mongoose');

const reportUserSchema = mongoose.Schema({

    // Report To Employee Details
    report_to_employee_code: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employee_details',
        required: true,
    },

    // Message 
    message: {
        type: String,
        required: true,
    },

    // Report Employee Details
    report_employee_code: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employee_details',
        required: true,
    },

    // Report Datetime 
    report_datetime: {
        type: Date,
        default: Date.now
    },
},
    { collection: 'report_user' });

module.exports = mongoose.model('report_user', reportUserSchema);