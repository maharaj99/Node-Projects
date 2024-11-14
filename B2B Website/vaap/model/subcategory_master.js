const mongoose=require('mongoose');
const Subcategorymaster_Schema=new mongoose.Schema
({
    
    sub_category_name:{
        type: String,
        unique: true,      
        required:true
    },
    active:{
        type: String,
        required: true,
        enum: ["Yes", "No"]
    },
    category_code:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'category_master',
        required:true
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
},{ collection: 'sub_category' })
module.exports=mongoose.model('Sub_category',Subcategorymaster_Schema);