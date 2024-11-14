const mongoose = require('mongoose');

const EmailMasterSchema = new mongoose.Schema({
    email_type: {
        type:String,  
        require:true,
        unique:true,
        enum:["Email Verification","Registration Confirmation","Order Confirmation"],
    },
    email_text:{
        type:String,
        require:true,
    },
    entry_user_code: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user_master',
        default: null
    },
    entry_timestamp: {
        type: Date,
        default: Date.now
    }
}, { collection: 'email_master' });

module.exports = mongoose.model('email_master', EmailMasterSchema);
