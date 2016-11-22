'use strict';

(function() {
  var app = angular.module('openvod', [
    'ui.router',
    'pascalprecht.translate',
    'app.controllers',
    'app.filters',
    'app.directives',
    'app.services'
  ])

  .config(['$translateProvider',function($translateProvider){
    var lang = navigator.language.indexOf('zh') > -1 ? 'zh-CN' : 'en-US';
    $translateProvider.preferredLanguage(lang);
    $translateProvider.useStaticFilesLoader({
        prefix: 'i18n/',
        suffix: '.json'
    });
  }])

  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/login');
    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'pages/login.html'
      })
      .state('app', {
        url: '/app',
        templateUrl: 'pages/app.html'
      })
      .state('app.shop', {
        url: '/shopCart',
        templateUrl: 'pages/shop.html'
      })
      .state('app.hotelRoom', {
        url: '/hotelRoom',
        templateUrl: 'pages/hotelRoom.html'
      })
  }])

  .constant('CONFIG', {
    serverUrl     : 'http://openvod.cleartv.cn/backend_wx/v1/',
    testUrl       : 'test/',
    testExtesion  : '.json',
    test          : true
  })
})();