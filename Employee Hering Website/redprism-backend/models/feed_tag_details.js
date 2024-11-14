const mongoose = require('mongoose');

const FeedTagDetailsSchema = mongoose.Schema({

    // Feed Post Code
    feeds_post_code: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'feeds_post',
        required: true,
    },

    // Tag Employee Code
    tag_employee_code: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employee_details',
        required: true,
    },

    // Post Employee Code
    post_employee_code: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employee_details',
        required: true,
    },

    // Tag Datetime
    tag_datetime: {
        type: Date,
        default: Date.now,
    },

},
{ collection: 'feed_tag_details' });

module.exports = mongoose.model('feed_tag_details', FeedTagDetailsSchema);