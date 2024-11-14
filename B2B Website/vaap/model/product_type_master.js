const mongoose = require('mongoose');

const productTypeSchema = new mongoose.Schema({
    product_type: {
        type: String,
        unique: true,
        required: true
    },
    show_home_page:{
        type: String,
        enum: ["Yes", "No"],
        default: "Yes"
    },
    active: {
        type: String,
        enum: ["Yes", "No"],
        default: "Yes"
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
}, { collection: 'product_type_master' });

module.exports = mongoose.model('ProductType', productTypeSchema);
