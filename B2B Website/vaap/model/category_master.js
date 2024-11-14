const mongoose=require('mongoose');
const categorymaster_Schema=new mongoose.Schema
({
    
    category_name:{
        type: String,
        required:true,
        unique: true    
    }, 
    tax_type:{
        type: String,
        required: true,
        enum: ["Percentage","Flat","null"],
    },
    active:{
        type: String,
        required: true,
        enum: ["Yes", "No"],
        default:"Yes"

    },
    entry_user_code:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user_master',
        default:null
    },
    entry_date: {
        type: Date,
        default: Date.now
    }

}, { collection: 'category_master' })
module.exports=mongoose.model('category_master',categorymaster_Schema);