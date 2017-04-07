'use strict';
(function () {
    var app = angular.module('app.qcode', [])
    .controller('qcodeIndexController',['$scope','$http',function ($scope,$http) {
            var self = this;
            self.init = function () {
                console.log("test");
            }
        }
    ])
})();