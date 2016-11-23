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
                self.loading = true;
                var data = JSON.stringify({
                    action: "GetToken",
                    projectName: self.projectName,
                    username: self.userName,
                    password: md5.createHash(self.password)
                })

                $http({
                    method: $filter('ajaxMethod')(),
                    url: util.getApiUrl('logon', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                    if (msg.rescode == '200') {
                        util.setParams('userName', self.userName);
                        util.setParams('projectName', self.projectName);
                        util.setParams('token', msg.token);
                        self.getEditLangs();
                    } else {
                        alert(msg.rescode + ' ' + msg.errInfo);
                    }
                }, function errorCallback(response) {
                    alert(response.status + ' 服务器出错');
                });

            }
            self.getEditLangs = function() {
                $http({
                    method: 'GET',
                    url: util.getApiUrl('', 'editLangs', 'local')
                }).then(function successCallback(response) {
                    util.setParams('editLangs', response.data.editLangs);
                    $state.go('app');
                }, function errorCallback(response) {
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
                console.log(util.getParams('editLangs').length)
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


    .controller('shopController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'util',
        function($scope,$state,$http,$stateParams,$filter,util) {
            console.log('shopController')

            var self = this;
            self.init = function() {
               self.searchShopList();
            }

            self.searchShopList = function() {
                var data = {
                    // 假数据
                    // "hotelId": self.hotelId -0
                    "hotelId": 1
                };
                data = JSON.stringify(data);

                    $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('hotelinfo', 'shopList'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        console.log(data)
                    }, function errorCallback(data, status, headers, config) {

                    });
            }




            self.shopAdd = function(){
                self.maskUrl = 'pages/shopAdd.html';
            }
            self.shopAddCancel = function(){
                console.log('shopAddCancel')
                self.maskUrl = '';
                console.log('cancel');
            }
        }
    ])

    .controller('goodsController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'util',
        function($scope,$state,$http,$stateParams,$filter,util) {
            console.log('goodsController');
            console.log($stateParams);
            var self = this;
            self.init = function() {
                self.shopId = $stateParams.shopId;
            }
            self.goodsEdit = function(){
                $scope.shop.maskUrl = 'pages/goodsEdit.html';
            }

            self.categotyEdit = function(){
                $scope.shop.maskUrl = 'pages/categoryEdit.html';
            }

        }
    ])

    .controller('goodsListController', ['$stateParams',
        function($stateParams) {
            console.log('goodsListController');
            console.log($stateParams);
            var self = this;
            self.init = function() {
                self.shopId = $stateParams.categoryId;
            }
        }
    ])

    .controller('hotelRoomController', ['$scope',
        function($scope) {
            var self = this;
            self.init = function() {
                self.queryHotelList
            }
            self.queryHotelList = function () {
                self.hotels = [{hotelId: 1, hotelName: 'testhotel1'},
                    {hotelId: 2, hotelName: 'testhotel2'},
                    {hotelId: 3, hotelName: 'testhotel3'}]
            }
        }
    ]) 

})();
