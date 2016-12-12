'use strict';

(function () {
    var app = angular.module('app.orders-controllers', [])

    // 酒店订单列表页
    .controller('hotelOrderListController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            var self = this;
            
            self.init = function() {

            }

            self.gotoDetail = function(id) {
                $scope.app.maskParams = {'orderId': id};
                $scope.app.showHideMask(true,'pages/orders/hotelOrderDetail.html');
            }
        }
    ])

    .controller('hotelOrderDetailController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            var self = this;
            
            self.init = function() {

            }

            self.close = function() {
                $scope.app.showHideMask(false);
            }
        }
    ])

    .controller('shopOrderListController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            var self = this;
            
            self.init = function() {

            }

            self.gotoDetail = function(id) {
                $scope.app.maskParams = {'orderId': id};
                $scope.app.showHideMask(true,'pages/orders/shopOrderDetail.html');
            }
        }
    ])

    .controller('shopOrderDetailController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            var self = this;
            
            self.init = function() {

            }

            self.close = function() {
                $scope.app.showHideMask(false);
            }
        }
    ])

})();
