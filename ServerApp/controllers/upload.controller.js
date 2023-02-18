const { UrltrackingModel } = require('../model');
const { errorResponse, successResponse, requiredResponse } = require('../helpers/urlUpload');

async function urltrack(req, res) {
    try {

        let reqBody = req.body;
        if(reqBody.trackType == 'apptrack') {
            reqBody.end_time = new Date(Date.now());
            reqBody.start_time = reqBody.end_time - reqBody.time_range;
        }

        console.log("============================= req.body ========================")
        // console.log(reqBody);

        console.log("==================== url track data ===============")
        if (!reqBody.employee_id) { return requiredResponse(res, "employee_id") }
        if (!reqBody.urlName) { return requiredResponse(res, "urlName") }
        if (!reqBody.start_time) { return requiredResponse(res, "start_time") }
        if (!reqBody.end_time) { return requiredResponse(res, "end_time") }
        if (!reqBody.time_range) { return requiredResponse(res, "time_range") }

        const urlTrack = new UrltrackingModel({
            employee_id: reqBody.employee_id,
            urlName: reqBody.urlName,
            start_time: reqBody.start_time,
            end_time: reqBody.end_time,
            time_range: reqBody.time_range,
        });

        console.log("============================= insert data ========================")
        // console.log(urlTrack);

        let created = await urlTrack.save();
        return successResponse(res, created._id, 200, "Inserted successfully");

    } catch (error) {
        return errorResponse(res, 500, error.message);
    }
}

module.exports = {
    urltrack,
}
