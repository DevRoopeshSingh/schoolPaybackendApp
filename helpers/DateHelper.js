var moment = require('moment');

module.exports = class DateHelper {

    getCurrentTimeStamp() {
        return moment().format('YYYY-MM-DD H:m:s');
    }
}