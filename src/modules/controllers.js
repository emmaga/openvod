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
                    method: 'POST',
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
                    url: util.getApiUrl('', 'editLangs.json', 'local')
                }).then(function successCallback(response) {
                    util.setParams('editLangs', response.data.editLangs);
                    $state.go('app');
                }, function errorCallback(response) {

                });
            }

        }
    ])

    .controller('appController', ['$http', '$scope', '$state', '$stateParams', 'util',
        function($http, $scope, $state, $stateParams, util) {
            var self = this;
            self.init = function() {
                // app 页面展开desktop
                if($state.current.name !== 'app') {
                   self.appPhase = 2; 
                }
                // 其他页面收起desktop
                else {
                    self.appPhase = 1;
                }
                self.appFramePhase = 1;

                // 弹窗层
                self.maskUrl = '';
                self.maskParams = {};

                // 读取applists
                self.loading = true;
                $http({
                    method: 'GET',
                    url: util.getApiUrl('', 'apps.json', 'local')
                }).then(function successCallback(data, status, headers, config) {
                    $scope.appList = data.data.apps;
                    // 如果有指定appid focus
                    if($stateParams.appId){
                        self.setFocusApp($stateParams.appId);
                    }
                }, function errorCallback(data, status, headers, config) {

                }).finally(function(value) {
                    self.loading = false;
                });

                console.log(util.getParams('editLangs'))

            }

            self.setFocusApp = function(id) {
                var l = $scope.appList;
                for (var i =0; i < l.length; i++) {
                    if(l[i].id == id) {
                        self.activeAppName = l[i].name;
                        self.activeAppBgColor = l[i].bgColor;
                        return;
                    }
                }
            }

            // 1:酒店客房，3:移动商城
            self.switchApp = function(n) {
              self.appPhase = 2;
              self.setFocusApp(n);
              switch(n) {
                case 1:
                  $state.go('app.hotelRoom', {'appId': n});
                  break;
                case 3:
                  $state.go('app.shop', {'appId': n});
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
                util.setParams('token', '');
                $state.go('login');
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
                    "shopId": 1
                };
                data = JSON.stringify(data);

                $http({
                    method: $filter('ajaxMethod')(),
                    url: util.getApiUrl('shopinfo', 'shopList'),
                    data: data
                }).then(function successCallback(data, status, headers, config) {
                    console.log(data)
                }, function errorCallback(data, status, headers, config) {

                });
            }






            self.shopAdd = function(){
                $scope.app.maskParams = {'test': '12'};
                $scope.app.maskUrl = 'pages/shopAdd.html';
            }
        }
    ])

    .controller('shopAddController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'util',
        function($scope,$state,$http,$stateParams,$filter,util) {
            console.log('shopAddController');

            var self = this;
            self.init = function() {
                 console.log($scope.app.maskParams.test);
            }

            self.cancel = function(){
                console.log('cancel')
                $scope.app.maskUrl = '';
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
            self.goodsAdd = function(){
                $scope.app.maskParams = {'test': '12'};
                $scope.app.maskUrl = 'pages/goodsAdd.html';
            }

            self.categoryAdd = function(){
               $scope.app.maskParams = {'test': '12'};
               $scope.app.maskUrl = 'pages/categoryAdd.html';
            }

            self.categotyEdit = function(){
               $scope.app.maskParams = {'test': '12'};
               $scope.app.maskUrl = 'pages/categoryEdit.html';
            }

            self.shopEdit = function(){
                console.log('shopEdit')
                $scope.app.maskParams = {'test': '12'};
                $scope.app.maskUrl = 'pages/shopEdit.html';
            }


        }
    ])

    .controller('goodsAddController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'util',
        function($scope,$state,$http,$stateParams,$filter,util) {
            console.log('goodsAddController');

            var self = this;
            self.init = function() {
                 console.log($scope.app.maskParams.test);
            }

            self.cancel = function(){
                console.log('cancel')
                $scope.app.maskUrl = '';
            }

        }
    ])

    .controller('goodsEditController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'util',
        function($scope,$state,$http,$stateParams,$filter,util) {
            console.log('goodsEditController');

            var self = this;
            self.init = function() {
                 console.log($scope.app.maskParams.test);
            }

            self.cancel = function(){
                console.log('goodsEditcancel')
                $scope.app.maskUrl = '';
            }

        }
    ])

    .controller('shopEditController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'util',
        function($scope,$state,$http,$stateParams,$filter,util) {
            console.log('shopEditController');

            var self = this;
            self.init = function() {
                 console.log($scope.app.maskParams.test);
            }

            self.cancel = function(){
                console.log('cancel')
                $scope.app.maskUrl = '';
            }

        }
    ])


    .controller('categoryAddController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'util',
        function($scope,$state,$http,$stateParams,$filter,util) {
            console.log('categoryAddController');
            console.log($stateParams);
            var self = this;
            self.init = function() {
                console.log($scope.app.maskParams.test);
            }

            self.cancel = function(){
                console.log('cancel')
                $scope.app.maskUrl = '';
            }

        }
    ])

    .controller('categoryEditController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'util',
        function($scope,$state,$http,$stateParams,$filter,util) {
            console.log('categoryEditController');
            var self = this;
            self.init = function() {
                 console.log($scope.app.maskParams.test);
            }

            self.cancel = function(){
                console.log('cancel')
                $scope.app.maskUrl = '';
            }

        }
    ])

    .controller('goodsListController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'util',
        function($scope,$state,$http,$stateParams,$filter,util) {
            console.log('goodsListController');
            console.log($stateParams);
            var self = this;
            self.init = function() {
                self.shopId = $stateParams.categoryId;
            }

            self.goodsEdit = function(){
                $scope.app.maskParams = {'test': '12'};
                $scope.app.maskUrl = 'pages/goodsEdit.html';
            }
        }
    ])

    .controller('hotelRoomController', ['$scope',
        function($scope) {
            var self = this;
            self.init = function() {
                self.queryHotelList()
            }
            self.queryHotelList = function () {
                var hotels = [];
                hotels = [{hotelId: 1, hotelName: 'testhotel1'},
                    {hotelId: 2, hotelName: 'testhotel2'},
                    {hotelId: 3, hotelName: 'testhotel3'}];
                self.hotels = hotels
            }
        }
    ])

        .controller('roomController', ['$scope', '$http', '$stateParams', '$translate', 'util',
            function($scope, $http, $stateParams, $translate, util) {
                var self = this;
                var lang = $translate.proposedLanguage() || $translate.use();
                console.log(lang)
                self.init = function() {
                    self.hotelId = $stateParams.hotelId;
                    self.getHotelInfo()
                    self.getRoomList()
                }
                /**
                 * 获取酒店信息
                 */
                self.getHotelInfo = function () {
                    var data = JSON.stringify({
                        action: "getHotel",
                        token: util.getParams('token'),
                        lang: lang,
                        HotelID: Number(self.hotelId)
                    })
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('hotelroom', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            self.hotelName = msg.data.Name;
                            self.hotelAddress = msg.data.Address;
                            self.hotelDescription = msg.data.Description;
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    });
                }

                /**
                 * 获取客房列表
                 */
                self.getRoomList = function () {
                    var rooms = [];
                    var data = JSON.stringify({
                        action: "getRoomList",
                        token: util.getParams('token'),
                        lang: lang,
                        HotelID: Number(self.hotelId)
                    })
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('hotelroom', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            msg.data.forEach(function (el) {
                                rooms.push({
                                    imgURL: el.LogoImgURL,
                                    roomTypeName: el.RoomTypeName
                                })
                            })
                            self.rooms = rooms;
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    });
                }

                self.roomAdd = function(){
                    $scope.app.maskParams = {'hotelId': self.hotelId};
                    $scope.app.maskUrl = 'pages/shopAdd.html';
                }
            }
        ])

        .controller('roomAddController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'util',
            function($scope,$state,$http,$stateParams,$filter,util) {
                var self = this;
                var hotelId;
                self.init = function() {
                    hotelId = $scope.app.maskParams.hotelId;
                }

                self.cancel = function(){
                    console.log('cancel')
                    $scope.app.maskUrl = '';
                }

            }
        ])

})();
