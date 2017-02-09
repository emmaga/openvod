'use strict';

(function () {
    var app = angular.module('openvod', [
        'ui.router',
        'pascalprecht.translate',
        'app.controllers',
        'app.tv-admin-controllers',
        'app.project-config-controllers',
        'app.orders-controllers',
        'app.filters',
        'app.directives',
        'app.services',
        'angular-md5',
        'ngCookies',
        'ngTable',
        'ngAnimate',
        'ui.bootstrap',
        'ui.toggle',
        'angularBootstrapNavTree'
    ])
        .config(['$translateProvider', function ($translateProvider) {
            var lang = navigator.language.indexOf('zh') > -1 ? 'zh-CN' : 'en-US';
            $translateProvider.preferredLanguage(lang);
            $translateProvider.useStaticFilesLoader({
                prefix: 'i18n/',
                suffix: '.json'
            });
        }])

        .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/login');
            $stateProvider
                .state('login', {
                    url: '/login',
                    templateUrl: 'pages/login.html'
                })
                .state('app', {
                    url: '/app?appId',
                    templateUrl: 'pages/app.html'
                })
                .state('app.shop', {
                    url: '/shop',
                    templateUrl: 'pages/shop.html'
                })
                .state('app.terminal', {
                    url: '/terminal',
                    templateUrl: 'pages/terminal.html'
                })
                .state('app.wxUser', {
                    url: '/wxUser',
                    templateUrl: 'pages/wxUser.html'
                })
                .state('app.shop.goods', {
                    url: '/goods?HotelID&ShopID',
                    templateUrl: 'pages/goods.html'
                })
                .state('app.shop.goods.goodsList', {
                    url: '/goodsList?ShopGoodsCategoryID',
                    templateUrl: 'pages/goodsList.html'
                })
                .state('app.hotelRoom', {
                    url: '/hotelRoom',
                    templateUrl: 'pages/hotelRoom.html'
                })
                .state('app.hotelRoom.room', {
                    url: '/room?hotelId',
                    templateUrl: 'pages/room.html'
                })
                .state('app.hotelOrderList', {
                    url: '/hotelOrderList',
                    templateUrl: 'pages/orders/hotelOrderList.html'
                })
                .state('app.shopOrderList', {
                    url: '/shopOrderList',
                    templateUrl: 'pages/orders/shopOrderList.html'
                })
                .state('app.hotelOrderDetail', {
                    url: '/hotelOrderDetail?id',
                    templateUrl: 'pages/orders/hotelOrderDetail.html'
                })
                .state('app.shopOrderDetail', {
                    url: '/shopOrderDetail?id',
                    templateUrl: 'pages/orders/shopOrderDetail.html'
                })
                .state('app.shopOrderDeliver', {
                    url: '/shopOrderDeliver',
                    templateUrl: 'pages/orders/shopOrderDeliver.html'
                })
                .state('app.projectConfig', {
                    url: '/projectConfig',
                    templateUrl: 'pages/projectConfig/projectConfig.html'
                })
                .state('app.projectConfig.hotelList', {
                    url: '/projectConfig/hotelList',
                    templateUrl: 'pages/projectConfig/hotelList.html'
                })
                .state('app.projectConfig.projectInfo', {
                    url: '/projectConfig/projectInfo',
                    templateUrl: 'pages/projectConfig/projectInfo.html'
                })
                .state('app.tvAdmin', {
                    url: '/tvAdmin',
                    templateUrl: 'pages/tvAdmin.html',
                    resolve: {
                        resA:['$http', '$state', 'util', function($http, $state, util) {
                            var data = JSON.stringify({
                                "token": util.getParams('token'),
                                "action": "getMainMenu",
                                "viewID": 1,
                                "lang": util.langStyle()
                            });

                            // 加载服务器树的数据
                            return $http({
                                method: 'POST',
                                url: util.getApiUrl('commonview', '', 'server'),
                                data: data
                            }).then(function successCallback(response) {
                                var data = response.data;
                                if (data.rescode == '200') {
                                    var defaultLang = util.getDefaultLangCode();
                                    var preData = data.data.Content;

                                    var menu = [];
                                    var mainMenu = 
                                    {
                                      label: '首页',
                                      data: {
                                        type: "menuRoot",
                                        styleImg: data.data.ViewTemplateImage,
                                        viewName: data.data.ViewType
                                      },
                                      children: menu
                                    };

                                    // 添加菜单data
                                    for(var i = 0; i < preData.length; i++) {
                                        // 添加一级菜单
                                        menu.push({
                                            "label": preData[i].Name[defaultLang],
                                            "data": {
                                                "type": preData[i].NextViewType,
                                                "moduleId": preData[i].NextViewID,
                                                "menuId": preData[i].FirstMenuID,
                                                "menuLevel": 1,
                                                "styleImg": preData[i].ViewTemplateImage,
                                                "name": preData[i].Name,
                                                "img": preData[i].IconURL,
                                                "imgSize": preData[i].IconSize,
                                                "focusImg": preData[i].IconFocusURL,
                                                "focusImgSize": preData[i].IconFocusSize,
                                                "seq": preData[i].Seq
                                              }
                                        });
                                        // 添加二级菜单
                                        if(preData[i].NextViewID == -1) {
                                            menu[i].children = [];
                                            var secondMenu = preData[i].Second.Content;
                                            for(var j = 0; j < secondMenu.length; j++) {
                                                menu[i].children.push({
                                                    "label": secondMenu[j].Name[defaultLang],
                                                    "data": {
                                                        "type": secondMenu[j].NextViewType,
                                                        "moduleId": secondMenu[j].NextViewID,
                                                        "menuId": secondMenu[j].SecondMenuID,
                                                        "menuLevel": 2,
                                                        "styleImg": secondMenu[j].ViewTemplateImage,
                                                        "name": secondMenu[j].Name,
                                                        "img": secondMenu[j].IconURL,
                                                        "imgSize": secondMenu[j].IconSize,
                                                        "focusImg":secondMenu[j].IconFocusURL,
                                                        "focusImgSize": secondMenu[j].IconFocusSize,
                                                        "seq": secondMenu[j].Seq
                                                    }
                                                })
                                            }
                                        }
                                    }
                                    // type: MainMenu_THJ_SecondMenu, Live, MovieCommon, ...
                                    return{value: mainMenu};
                                    
                                    
                                    
                                } else if(data.rescode == '401'){
                                    alert('访问超时，请重新登录');
                                    $state.go('login');
                                } else{
                                    alert('加载菜单信息失败，' + data.errInfo);
                                }
                            }, function errorCallback(response) {
                                alert('连接服务器出错');
                            }).finally(function (value) {
                                
                            });
                        }],
                        resWelcome: ['$http', '$state', 'util', function($http, $state, util) {
                            var data = JSON.stringify({
                                "token": util.getParams('token'),
                                "action": "getWelcomePageTemplate",
                                "lang": util.langStyle()
                            });

                            // 加载服务器树的数据
                            return $http({
                                method: 'POST',
                                url: util.getApiUrl('welcomepage', '', 'server'),
                                data: data
                            }).then(function successCallback(response) {
                                var data = response.data;
                                if (data.rescode == '200') {
                                    var defaultLang = util.getDefaultLangCode();

                                    var welMenu = 
                                    {
                                      label: '欢迎页面',
                                      data: {
                                        type: "welcome",
                                        styleImg: data.data.SamplePic,
                                        viewName: data.data.Name
                                      }
                                    };
                                    return{value: welMenu};
                                    
                                    
                                    
                                } else if(data.rescode == '401'){
                                    alert('访问超时，请重新登录');
                                    $state.go('login');
                                } else{
                                    alert('加载菜单信息失败，' + data.errInfo);
                                }
                            }, function errorCallback(response) {
                                alert('连接服务器出错');
                            }).finally(function (value) {
                                
                            });
                        }]
                    },
                    controller:['$scope', 'resA', 'resWelcome' ,function($scope, resA, resWelcome){
                        var treedata = [
                            resWelcome.value, 
                            resA.value,
                            {
                              label: '广告位设置',
                              data: {
                                type: "adv"
                              }
                            },
                            {
                              label: '提交版本',
                              data: {
                                type: "version"
                              }
                            }
                        ];
                        $scope.my_data = treedata;
                    }]
                })
                .state('app.tvAdmin.welcome', {
                    url: '/welcome?label',
                    templateUrl: 'pages/tv/welcome.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){
                            
                        }]
                    }
                })
                .state('app.tvAdmin.adv', {
                    url: '/adv?label',
                    templateUrl: 'pages/tv/adv.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){
                            
                        }]
                    }
                })
                .state('app.tvAdmin.version', {
                    url: '/version?label',
                    templateUrl: 'pages/tv/version.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){
                            
                        }]
                    }
                })
                .state('app.tvAdmin.live', {
                    url: '/live?moduleId&label',
                    templateUrl: 'pages/tv/live.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){
                            
                        }]
                    }
                })
                .state('app.tvAdmin.simplePicText', {
                    url: '/simplePicText?moduleId&label',
                    templateUrl: 'pages/tv/simplePicText.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){
                            
                        }]
                    }
                })
                .state('app.tvAdmin.multPic', {
                    url: '/multPic?moduleId&label',
                    templateUrl: 'pages/tv/multPic.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){

                        }]
                    }
                })
                .state('app.tvAdmin.3rdApp', {
                    url: '/3rdApp?moduleId&label',
                    templateUrl: 'pages/tv/3rdApp.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){
                            
                        }]
                    }
                })
                .state('app.tvAdmin.apkEntry', {
                    url: '/apkEntry?moduleId&label',
                    templateUrl: 'pages/tv/apkEntry.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){
                            
                        }]
                    }
                })
                .state('app.tvAdmin.shop', {
                    url: '/shop?moduleId&label',
                    templateUrl: 'pages/tv/shop.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){
                            
                        }]
                    }
                })
                .state('app.tvAdmin.movieCommon', {
                    url: '/movieCommon?moduleId&label',
                    templateUrl: 'pages/tv/movieCommon.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){
                            
                        }]
                    }
                })
                .state('app.tvAdmin.movieCommonFree', {
                    url: '/movieCommonFree?moduleId&label',
                    templateUrl: 'pages/tv/movieCommonFree.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){
                            
                        }]
                    }
                })
                .state('app.tvAdmin.movieCommonAdv', {
                    url: '/movieCommonAdv?moduleId&label',
                    templateUrl: 'pages/tv/movieCommonAdv.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){
                            
                        }]
                    }
                })
                // 音乐库
                .state('app.tvAdmin.MusicCommon', {
                    url: '/musicCommon?moduleId&label',
                    templateUrl: 'pages/tv/MusicCommon.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){
                            
                        }]
                    }
                })
                .state('app.tvAdmin.blank', {
                    url: '/blank?label',
                    templateUrl: 'pages/tv/blank.html'
                })
        }])

        // 每次页面开始跳转时触发
        .run(['$rootScope', 'util', function ($rootScope, util) {
            $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams, options) {
                // 判断用户是否登录
                if (!util.getParams('token') && toState.name != "login") {
                    alert('访问超时，请重新登录');
                    window.location.href = window.location.origin + window.location.pathname
                }
            })
        }])

        .constant('CONFIG', {
            serverUrl: 'http://openvod.cleartv.cn/backend_mgt/v1/',
            uploadUrl: 'http://mres.cleartv.cn/upload',
            testUrl: 'test/',
            test: false,
        })

})();