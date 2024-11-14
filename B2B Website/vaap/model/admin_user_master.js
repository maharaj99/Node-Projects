const mongoose = require('mongoose');
const { Schema } = mongoose;

const adminSchema = new Schema({
    user_name:{
        type:String,
        required:true
        },
    user_id:{
        type: String,
        required: true,
        unique:true
    },
    password: {
        type: String,
     },
    email:{
        type:String,
        required:true
      },
    profile_images:{
        type:String,
        default:'profile_images/default.png'
        },
    user_mode_code: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user_mode',
        default:null
    },
    active:{
        type: String,
        required: true,
        enum: ["Yes", "No"],
        default:"Yes"

     },
    entry_permission:{
        type: String,
        required: true,
        enum: ["Yes", "No"]
      },
    view_permission:{
        type: String,
        required: true,
        enum: ["Yes", "No"]
        },
    edit_permission: {
        type: String,
        required: true,
        enum: ["Yes", "No"]
     },
    delete_permissioin:{
        type: String,
        required: true,
        enum: ["Yes", "No"]
     },
    entry_timestamp: {
        type: Date,
        default:Date.now
    },
    type:{
        type: String,
        enum: ["Projectadmin", "User"],
        default:"User"

    },
    entry_user_code:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user_master',
        default:null
    }
    } ,
    { collection: 'user_master' });

    module.exports = mongoose.model('user_master', adminSchema);