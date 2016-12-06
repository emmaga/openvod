'use strict';

(function () {
    var app = angular.module('openvod', [
        'ui.router',
        'pascalprecht.translate',
        'app.controllers',
        'app.tv-admin-controllers',
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
                .state('app.tvAdmin', {
                    url: '/tvAdmin?initS',
                    templateUrl: 'pages/tvAdmin.html',
                    resolve: {
                        resA: function($http, $state, util) {
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
                                    var treedata = [
                                        {
                                          label: '欢迎页面',
                                          data: {
                                            type: "welcome"
                                          }
                                        }, 
                                        {
                                          label: '首页',
                                          data: {
                                            type: "menuRoot",
                                            styleImg: data.data.ViewTemplateImage,
                                            viewName: data.data.ViewType
                                          },
                                          children: menu
                                        }, 
                                        {
                                          label: '提交版本',
                                          data: {
                                            type: "version"
                                          }
                                        }
                                    ];

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
                                                "focusImg": preData[i].IconFocusURL,
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
                                                        "focusImg":secondMenu[j].IconFocusURL,
                                                        "seq": secondMenu[j].Seq
                                                    }
                                                })
                                            }
                                        }
                                    }
                                    // type: MainMenu_THJ_SecondMenu, Live, MovieCommon
                                    return{value: treedata};
                                    
                                    
                                    
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
                        }
                    },
                    controller: function($scope, resA){
                      $scope.my_data = resA.value;
                    }
                })
                .state('app.tvAdmin.welcome', {
                    url: '/welcome',
                    templateUrl: 'pages/tv/welcome.html',
                    resolve: {
                        resB: function(resA){
                            return {'value': resA.value};
                         }
                    }/*,
                    controller: function($scope, resA, resB){
                      $scope.resA2 = resB.value;
                    }*/
                })
                .state('app.tvAdmin.version', {
                    url: '/version',
                    templateUrl: 'pages/tv/version.html'
                })
                .state('app.tvAdmin.live', {
                    url: '/live?moduleId',
                    templateUrl: 'pages/tv/live.html'
                })
                .state('app.tvAdmin.movieCommon', {
                    url: '/movieCommon?moduleId',
                    templateUrl: 'pages/tv/movieCommon.html'
                })
                .state('app.tvAdmin.blank', {
                    url: '/blank',
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