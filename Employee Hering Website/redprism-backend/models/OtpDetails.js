const mongoose = require('mongoose');

const OtpSchema = mongoose.Schema({
    ph_num: {
        type: Number,
        required: true,
        maxLength: 10,
    },
    otp: {
        type: Number,
        required: true,
        maxLength: 6,
    },
},
{ collection: 'otp_details' });

module.exports = mongoose.model('otp_details',OtpSchema);