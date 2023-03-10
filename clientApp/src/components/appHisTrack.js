const activeWindow = require('active-win');
const req = require('request');
const { IPC_URL } = require('./../enums');
var path = require('path');
const { dialog } = require('electron');
const BrowserHistory = require('node-browser-history');

var oldtab = "";
var oldName = "";
var oldtype = "";
var trackvalue = '';

var time_range = 0;
var flag = false;
var changeProcessFlag = false;

async function appHisTrack(employee_id) {
	setInterval(async () => {
		if (!changeProcessFlag) {
			console.log("setInterval=> timerange:" + time_range);
			await isChangedProcess();
			changeProcessFlag = false;
		}
		if (flag) {
			console.log('++++++++++' + trackvalue);
			var uploadData = {
				track_value: trackvalue,
				time_range: time_range
			}
			// upload filename in db
			uploadFileName(employee_id, uploadData);
			trackvalue = "";
			time_range = 0;
			flag = false;
		}
	}, 1000);
}

async function isChangedProcess() {
	changeProcessFlag = true;
	var options = await activeWindow(false);
	if (!options) {
		time_range++;
		flag = false;
		return;
	}
	var apptype = options.owner.name;
	var appname = path.basename(options.owner.path);
	var tabtitle = options.title;

	if (oldtab == "") {
		console.log("1");
		oldtab = tabtitle;
		oldName = appname;
		oldtype = apptype;
		flag = false;
	}
	else {
		if (oldtab == tabtitle) {
			console.log("2");
			time_range++;
			flag = false;
			return;
		}
		else {
			if (time_range < 30) {
				console.log("3");
				oldtab = tabtitle;
				oldName = appname;
				oldtype = apptype;
				time_range = 0;
				// time_range++;
				flag = false;
				return;
			}
			if (oldtype == 'Google Chrome' ||
				oldtype == 'Maxthon' ||
				oldtype == 'Microsoft Edge' ||
				oldtype == 'Mozilla Firefox' ||
				oldtype == 'Opera' ||
				oldtype == 'Seamonkey' ||
				oldtype == 'Torch' ||
				oldtype == 'Vivaldi' ||
				oldtype == 'Brave' ||
				oldtype == 'Avast Browser') {
				await getLastUrlForBrowser(time_range);
				if (trackvalue == "") {
					console.log("4");
					trackvalue = oldtab;
				}
				else {
					console.log("5");
				}
			}
			else {
				console.log("6");
				trackvalue = oldName;
			}
			console.log("7");
			oldtab = tabtitle;
			oldName = appname;
			oldtype = apptype;
			flag = true;
		}
	}
}


async function getLastUrlForBrowser(timeRange) {
	trackvalue = "";
	var lastUtcTIme = 0;
	var browserhisTime = (timeRange) / 60 + 0.1;
	console.log("browserHis:" + browserhisTime);
	await BrowserHistory.getAllHistory(browserhisTime).then(function (history) {
		for (var i = 0; i < history.length; i++) {
			var oneBrowserHisArr = history[i];
			if (oneBrowserHisArr.length > 0) {
				var lastOneHisUrl = oneBrowserHisArr[oneBrowserHisArr.length - 1];
				if (lastUtcTIme == 0) {
					lastUtcTIme = lastOneHisUrl.utc_time;
					var url = new URL(lastOneHisUrl.url);
					trackvalue = url.hostname;
				}
				else {
					if (lastUtcTIme < lastOneHisUrl.utc_time) {
						lastUtcTIme = lastOneHisUrl.utc_time;
						var url = new URL(lastOneHisUrl.url);
						trackvalue = url.hostname;
					}
				}
			}
		}
	});
}

function uploadFileName(employee_id, data) {

	var urlTrackingData = {
		employee_id: employee_id,
		urlName: data.track_value,
		time_range: data.time_range,
		trackType: "apptrack"
	}

	console.log(urlTrackingData);
	var options = {
		url: IPC_URL.WEBSERVER_URL + IPC_URL.UPLOADIP_URL,
		body: JSON.stringify(urlTrackingData),
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		}
	}

	req(options, function (err, res) {
		if (err) {
			const options = {
				type: 'info',
				message: 'Connection Error!'
			};
			dialog.showMessageBox(null, options);
		}
		else {
			var values = JSON.parse(res.body);
			if (values.statusType == "error") {
				const options = {
					type: 'info',
					message: values.message
				};
				dialog.showMessageBox(null, options);
			}
			else {
				console.log("app track data saved succcessufully.")
			}
		}
	});
}

module.exports = {
	appHisTrack
};