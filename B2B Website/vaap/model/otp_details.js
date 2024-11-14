const mongoose = require('mongoose');
const {Schema} = mongoose;

const otpdetails_Scema= new mongoose.Schema
({
    email:{
        type:String,
        required:true
    },
    otp:{
        type:Number,
        required:true
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
},
{ collection: "otp_details" }
)

module.exports=mongoose.model('otp',otpdetails_Scema);