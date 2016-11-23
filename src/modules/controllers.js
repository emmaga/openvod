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

    .controller('loginController', ['$scope', '$http', '$filter', '$state', 'md5', 'util',
        function($scope, $http, $filter, $state, md5, util) {
            var self = this;
            self.init = function() {
            }
            self.login = function () {
                var uName = $("#login-userName").val(),
                    pwd = md5.createHash($("#login-password").val())
                var data = JSON.stringify({
                    action: "GetToken",
                    projectName: $("#login-projectName").val(),
                    username: uName,
                    password: pwd
                })
                $http({
                    method: $filter('ajaxMethod')(),
                    url: util.getApiUrl('logon'),
                    data: data
                }).then(function successCallback(response) {
                    util.setParams('userName', uName);
                    util.setParams('psaaword', pwd);
                    $state.go('app');
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
                console.log(util.getParams('userName'))
                console.log(util.getParams('psaaword'))
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
