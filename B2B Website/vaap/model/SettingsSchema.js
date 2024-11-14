const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
    minimum_order_amount: {
        type: Number,
        default: 0,
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
}, { collection: 'Setting' });

module.exports = mongoose.model('Setting', SettingSchema);
