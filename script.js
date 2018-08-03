// create the module and name it virginApp
// ngRoute for route
// 720kb.datepicker for date picker.
var virginApp = angular.module('virginApp', ['ngRoute', '720kb.datepicker']);

// configure my app routes
virginApp.config(function ($routeProvider) {

    // route for the home page
    $routeProvider
        .when('/', {
            templateUrl: 'pages/home.html',
            controller: 'mainController'
        });
});

// create the controller and inject Angular's $scope
virginApp.controller('mainController', function ($scope, $http) {

    $scope.sortType = 'Departure_Time'; // set the default sort type
    $scope.sortReverse = false;  // set the default sort order
    $scope.search = '';     // set the default search/filter term

    // settings calendar view to show dates from today.
    // no back dates as it flights can't be booked for back date.
    var now = new Date();
    $scope.toDate = now.format("yyyy/mm/dd");
    $scope.yesterDate = now.format("yyyy/mm/dd");

    // show button event action
    $scope.showSchedule = function () {
        // local file which has the flight data.
        var filePath = 'flights.csv';

        // http request to load the file.
        // this can be use for local or file can be hosted to different server.
        $http.get(filePath).success($scope.processData);
    };

    /**
     *
     * @param fileContent
     */
    $scope.processData = function (fileContent) {

        // get the date is selected on the calendar.
        var dateText = angular.element(document.querySelector('#calendarDate'))[0].value;

        //this is the date of the calendar
        var date = new Date(Date.parse(dateText));

        // getting the day of the date.
        var day = date.format("dddd");

        // what is the current time.
        var calendarDate = date.format("yyyy/mm/dd");
        var toDate = (new Date()).format("yyyy/mm/dd");

        // this time column to filter
        var timeColumn = 'Departure_Time';

        try {
            // get each lines from file contents.
            var csvLines = fileContent.split(/\r\n|\n/);
            // get columns from first line
            var columns = csvLines[0].split(',');

            // local variable
            var rows = [];
            var headers = [];

            for (var i = 0; i < csvLines.length; i++) {
                // split content based on comma
                var csvColumns = csvLines[i].split(',');

                // Get the Day which is selected on the calendar
                var filterDay = false;
                var filterTime = false;

                // Filter the CSV data
                if (csvColumns.length == columns.length) {
                    // each row data
                    var rowData = [];

                    for (var j = 0; j < columns.length; j++) {

                        // each Column Values
                        var value = csvColumns[j];

                        // header row data
                        if (i == 0) {
                            rowData.push(value);
                        } else {
                            // name of the header row data
                            // and replace space with the '_'
                            var name = headers[j].replace(/ /g, '_');

                            // name of the header and assign value into array
                            rowData[name] = value;

                            // now check the name of the header for weekdays have 'x' in the value
                            // only then to show in the result
                            if (day == name && value == 'x') {
                                filterDay = true;
                            }

                            // now checking the timing of flights from column name 'Departure_Time'
                            if (timeColumn == name) {
                                // only when date is today only then check the time.
                                if (calendarDate == toDate && currentTimeCompare(value)) {
                                    filterTime = true;
                                }
                                // when the date is not today then we don't need to check the timing.
                                else if (calendarDate != toDate) {
                                    filterTime = true;
                                }
                            }
                        }
                    }

                    // csv header row value
                    if (i == 0) {
                        $scope.header = rowData;
                        headers = rowData;
                    } else {
                        // csv row data value
                        if (filterDay && filterTime) {
                            rows.push(rowData);
                        }
                    }
                }
            }
            $scope.rowData = rows;
        } catch (ex) {
            console.log("ex: ", ex);
        }
    };

    /**
     * This methods is to compare timing with current time.
     * @param compareTime
     * @returns {*}
     */
    function currentTimeCompare (compareTime) {
        // get the current time
        var date = new Date();
        var time = date.format("HH:MM");
        // compare with the flights time
        if (time === compareTime) {
            return 0;
        }
        // break the time into tow parts
        var flightTime = compareTime.split(':');
        var currentTime = time.split(':');
        
        // check the hours of the flight time with current time
        if (eval(flightTime[0]) > eval(currentTime[0])) {
            return true; 
        }
        // check the hours is equal so now checking the minutes with current time minutes
        else if (eval(flightTime[0]) == eval(currentTime[0]) && eval(flightTime[1]) > eval(currentTime[1])) {
            return true;
        } else {
            return false;
        }
    }
});
