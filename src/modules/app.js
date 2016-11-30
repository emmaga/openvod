'use strict';

(function () {
    var app = angular.module('openvod', [
        'ui.router',
        'pascalprecht.translate',
        'app.controllers',
        'app.filters',
        'app.directives',
        'app.services',
        'angular-md5',
        'ngCookies',
        'ngTable',
        'ngAnimate',
        'ui.bootstrap'
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
                    url: '/goodsList?ShopGoodsCategoryID&ShopGoodsCategoryName',
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
                    url: '/tvAdmin',
                    templateUrl: 'pages/tvAdmin.html'
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