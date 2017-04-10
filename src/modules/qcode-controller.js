'use strict';
(function () {
    var app = angular.module('app.qcode', [])
    .controller('qcodeIndexController',['$scope','$http','util','$filter',function ($scope,$http,util,$filter) {
            var self = this;
            self.init = function () {
                self.getQcodeList(1);
                self.searchDate = $filter('date')((new Date().getTime()), 'yyyy-MM-dd');
            };
            self.getQcodeList = function (pages) {
                var data = {
                    "token": util.getParams('token'),
                    "action": "count",
                    "StartDate": $filter('date')((new Date().getTime()), 'yyyy-MM-dd'),
                    "EndDate": "1970-09-28",
                    "page":"1",
                    "count":"10"
                }
            };
            $scope.startDateBeforeRender = startDateBeforeRender;
            $scope.startDateOnSetTime = startDateOnSetTime;
            $scope.endDateOnSetTime = endDateOnSetTime;
            function startDateOnSetTime () {
                // https://github.com/dalelotts/angular-bootstrap-datetimepicker/issues/111
                // 在controller里操作dom会影响性能，但这样能解决问题
                angular.element(document.querySelector('#dropdownStart')).click();
                console.log(123);
                $scope.$broadcast('start-date-changed');
                self.search();
            }

            function endDateOnSetTime () {
                // https://github.com/dalelotts/angular-bootstrap-datetimepicker/issues/111
                // 在controller里操作dom会影响性能，但这样能解决问题
                angular.element(document.querySelector('#dropdownEnd')).click();
                $scope.$broadcast('end-date-changed');
                self.search();
            }

            function startDateBeforeRender ($dates) {
                if ($scope.dateRangeStart) {
                    var activeDate = moment($scope.dateRangeStart);

                    $dates.filter(function (date) {
                        return date.localDateValue() >= activeDate.valueOf()
                    }).forEach(function (date) {
                        date.selectable = false;
                    })
                }
            }
        }
    ])
})();