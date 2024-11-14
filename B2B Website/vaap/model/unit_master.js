const mongoose = require('mongoose');

const unitmaster_Scema= new mongoose.Schema
({

    unit:{
        type:String,
        required:true,
        unique: true
    },
    active: {
        type: String,
        required: true,
        enum: ["Yes", "No"]
    }, 
    entry_user_code:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user_master',
        default :null
    }, 
    entry_date: {
        type: Date,
        default: Date.now
    }
},{ collection: 'unit' })

module.exports=mongoose.model('unit',unitmaster_Scema);
