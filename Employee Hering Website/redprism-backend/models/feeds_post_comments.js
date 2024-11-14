const mongoose = require('mongoose');

const FeedsPostCommentsSchema = mongoose.Schema({

    feeds_post_code: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'feeds_post',
        required: true,
    },
    employee_code: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employee_details',
        required: true,
    },
    comment: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ["Comment", "Reply"],
    },
    datetime: {
        type: Date,
        default: Date.now,
    },

},
{ collection: 'feeds_post_comments' });

module.exports = mongoose.model('feeds_post_comments', FeedsPostCommentsSchema);