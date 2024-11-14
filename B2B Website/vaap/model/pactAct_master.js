const mongoose = require('mongoose');
const { Schema } = mongoose;

const registrationSchema = new Schema({
email: {
    type: String,
    required: true,
    },
customer_code:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'customer_master',
    default: null
},
owner_legal_firstname:{
        type:String,
        required:true
    },
owner_legal_lastname:{
        type:String,
        required:true
    },
legal_company_name:{
    type:String,
    required:true
},
street_adress:{
    type:String,
    required:true
},
adress_line_2:{
    type:String,
    required:true
},
city:{
    type:String,
    required:true
},
select_state:{
    type:String,
    required:true
},
zipcode:{
    type:Number,
    required:true
},
phone_number:{
    type:Number,
    required:true
    },
FEIN:{
    type:String,
    required:true
},
business_license_number:{
    type:Number,
    required:true
},
tabacco_license_number:{
    type:Number,
    required:true
},
upload_file_1: {
  type: String,
 
},
upload_file_2:{
  type: String,
},
upload_file_3:{
    type: String,
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
} ,
{ collection: 'pactAct_muster' });

module.exports = mongoose.model('pactAct_muster', registrationSchema);