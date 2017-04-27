'use strict';

(function () {
    var app = angular.module('app.directives', [])

        .directive('fileModel', ['$parse', 'CONFIG', function ($parse, CONFIG) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    var model = $parse(attrs.fileModel);
                    var modelSetter = model.assign;

                    element.bind('change', function () {
                        scope.$apply(function () {
                            modelSetter(scope.$parent, element[0].files[0]);
                        });
                        document.getElementById(attrs.e).click();
                    });
                }
            };
        }])

        // .directive('alertBar', [function () {
        //     return {
        //         restrict: 'EA',
        //         templateUrl: 'pages/alertBar.html',
        //         scope: {
        //             message: "=",
        //             type: "="
        //         },
        //         link: function (scope, element, attrs) {
        //             scope.hideAlert = function () {
        //                 scope.message = null;
        //                 scope.type = null;
        //             };
        //         }
        //     };
        // }]);
})();