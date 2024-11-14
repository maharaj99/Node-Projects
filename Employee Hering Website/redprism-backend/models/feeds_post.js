const mongoose = require('mongoose');

const FeedsPostSchema = mongoose.Schema({

    tech_code: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'technology',
        required: true,
    },
    employee_code: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employee_details',
        required: true,
    },
    post_details: {
        type: String,
        required: true,
    },
    post_datetime: {
        type: Date,
        default: Date.now,
    },

},
{ collection: 'feeds_post' });

module.exports = mongoose.model('feeds_post', FeedsPostSchema);