'use strict';

(function() {
    var app = angular.module('app.controllers', [])

    .controller('indexController', ['$scope',
        function($scope) {
            var self = this;
            self.init = function() {
                this.maskUrl = '';
            }
        }
    ])

    .controller('loginController', ['$scope', '$http', '$filter', '$state', 'util',
        function($scope, $http, $filter, $state, util) {
            var self = this;
            self.init = function() {

            }
            self.login = function () {
                util.setParams('a', '1')
                $state.go('app')
                console.log($filter('ajaxMethod')())
                $http({
                    method: $filter('ajaxMethod')(),
                    url: util.getApiUrl('logon')
                }).then(function successCallback(response) {
                    // this callback will be called asynchronously
                    // when the response is available
                }, function errorCallback(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });
            }

        }
    ])

    .controller('appController', ['$state', 'util',
        function($state, util) {
            var self = this;
            self.init = function() {
                self.appPhase = 1;
                self.appFramePhase = 1;
                console.log(util.getParams('a'))
            }

            // n: 以后换成后台读取，先随便写一个
            // 0:酒店客房，1:移动商城
            self.switchApp = function(n) {
              self.appPhase = 2;
              switch(n) {
                case 0:
                  $state.go('app.hotelRoom');
                  break;
                case 1:
                  $state.go('app.shopCart');
                  break;
                default:
                  break;
              }
            }

            self.showDesktop = function() {
              self.appPhase = 1;
              setTimeout(function(){
                self.appFramePhase = 1;
              },530)
            }

            self.focusLauncher = function() {
              self.appFramePhase = 2;
            }

            self.focusApp = function() {
              self.appFramePhase = 1;
            }

            self.logout = function(event) {

            }
        }
    ])

    .controller('shopCartController', ['$scope',
        function($scope) {
            var self = this;
            self.init = function() {
                
            }
        }
    ]) 

    .controller('hotelRoomController', ['$scope',
        function($scope) {
            var self = this;
            self.init = function() {
                
            }
        }
    ]) 

})();
