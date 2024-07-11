let searchParameters = require('../config/requestParams/SearchParameters');

module.exports = class SearchFilter {

    getSearchFilters (search_filters) {

        let filters = {};
        for (let key in searchParameters) {
            if( searchParameters[key] in search_filters && search_filters[searchParameters[key]] != "") {
                filters[key] = search_filters[searchParameters[key]];
            }
        }
        return filters;
    }
}