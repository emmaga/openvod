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

    .controller('loginController', ['$scope',
        function($scope) {
            var self = this;
            self.init = function() {
                
            }
        }
    ])    

    .controller('appController', ['$state',
        function($state) {
            var self = this;
            self.init = function() {
                self.appPhase = 1;
                self.appFramePhase = 1;
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
                  $state.go('app.shop');
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

    .controller('shopController', ['$scope',
        function($scope) {
            var self = this;
            self.init = function() {
                
            }
        }
    ]) 

    .controller('goodsListController', ['$stateParams',
        function($stateParams) {
            var self = this;
            self.init = function() {
                self.shopId = $stateParams.shopId;
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
