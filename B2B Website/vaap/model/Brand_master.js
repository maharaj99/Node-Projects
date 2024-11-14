const mongoose = require("mongoose");
const Brandmaster_Schema=new mongoose.Schema
({
    brand_name:{
        type:String,
        unique: true,
        required:true
    },
    active:{
        type: String,
        required: true,
        enum: ["Yes", "No"]
    },
    entry_user_code: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user_master',
        default: null
    },
    entry_date: {
        type: Date,
        default: Date.now
    }
}, { collection: 'brand' })
module.exports = mongoose.model('brand',  Brandmaster_Schema);
