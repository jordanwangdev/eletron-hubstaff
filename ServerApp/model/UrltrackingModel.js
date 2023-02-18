const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const urlTrackingSchema = new mongoose.Schema({
    employee_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    urlName: {
        type: String,
        required: true
    },
    start_time: {
        type: Date,
    },
    end_time: {
        type: Date,
        default: Date.now
    },
    time_range: {
        type: Number
    }
});

const UrltrackingModel = mongoose.model('urltracking', urlTrackingSchema);
module.exports = UrltrackingModel;
