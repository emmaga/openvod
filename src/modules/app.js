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
        'app.qcode',
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
                .state('app.realTimeCommand', {
                    url: '/realTimeCommand',
                    templateUrl: 'pages/realTimeCommand.html'
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
                                type: "guangGaoWei"
                              }
                            },
                            {
                              label: '项目设置',
                              data: {
                                type: "projectConfig"
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
                .state('app.tvAdmin.version', {
                    url: '/version?label',
                    templateUrl: 'pages/tv/version.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){
                            
                        }]
                    }
                })
                .state('app.tvAdmin.guangGaoWei', {
                    url: '/guangGaoWei?label',
                    templateUrl: 'pages/tv/guangGaoWei.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){
                            
                        }]
                    }
                })
                .state('app.tvAdmin.projectConfig', {
                    url: '/projectConfig?label',
                    templateUrl: 'pages/tv/projectConfig.html',
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
                .state('app.tvAdmin.Samsung_MultPic_Flight', {
                    url: '/Samsung_MultPic_Flight?moduleId&label',
                    templateUrl: 'pages/tv/flight_Samsung.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){

                        }]
                    }
                })
                .state('app.tvAdmin.Samsung_Link_Bill', {
                    url: '/Samsung_Link_Bill?moduleId&label',
                    templateUrl: 'pages/tv/Billing_URL.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){

                        }]
                    }
                })
                .state('app.tvAdmin.Samsung_MultPic_OutOfTheHotel', {
                    url: '/Samsung_MultPic_OutOfTheHotel?moduleId&label',
                    templateUrl: 'pages/tv/checkOutPic.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){

                        }]
                    }
                })
                .state('app.tvAdmin.LiFeng_MultPic', {
                    url: '/LiFeng_MultPic?moduleId&label',
                    templateUrl: 'pages/tv/multPic_LiFeng.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){

                        }]
                    }
                })
                .state('app.tvAdmin.ZheFei_MultPic', {
                    url: '/ZheFei_MultPic?moduleId&label',
                    templateUrl: 'pages/tv/multPic_ZheFei.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){

                        }]
                    }
                })
                .state('app.tvAdmin.PicText_Classification', {
                    url: '/PicText_Classification?moduleId&label',
                    templateUrl: 'pages/tv/PicText_Classification.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){

                        }]
                    }
                })
                .state('app.tvAdmin.SimpleSmallPicText', {
                    url: '/SimpleSmallPicText?moduleId&label',
                    templateUrl: 'pages/tv/SimpleSmallPicText.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){

                        }]
                    }
                })
                 //雅思特 小图 Yeste_SimpleSmallPicText Lengxue
                .state('app.tvAdmin.Yeste_SimpleSmallPicText', {
                    url: '/Yeste_SimpleSmallPicText?moduleId&label',
                    templateUrl: 'pages/tv/Yeste_SimpleSmallPicText.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){

                        }]
                    }
                })
                // 司马台 小图 SiMaTai_SimpleSmallPicText
                .state('app.tvAdmin.SiMaTai_SimpleSmallPicText', {
                    url: '/SiMaTai_SimpleSmallPicText?moduleId&label',
                    templateUrl: 'pages/tv/SimpleSmallPicText_SiMaTai.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){

                        }]
                    }
                })

                //司马台 二级分类图文 SiMaTai_SimpleSmallPicText
                .state('app.tvAdmin.SiMaTai_PicText_Classification', {
                    url: '/SiMaTai_PicText_Classification?moduleId&label',
                    templateUrl: 'pages/tv/PicText_Classification_SiMaTai.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){

                        }]
                    }
                })

                //司马台 三级分类图文 SiMaTai_PicText_Classification_ThreeLevel
                .state('app.tvAdmin.SiMaTai_PicText_Classification_ThreeLevel', {
                    url: '/SiMaTai_PicText_Classification_ThreeLevel?moduleId&label',
                    templateUrl: 'pages/tv/PicText_Classification_SiMaTai_ThreeLevel.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){

                        }]
                    }
                })

                //雅思特 天气 Yeste_Weather
                .state('app.tvAdmin.Yeste_Weather', {
                    url: '/Yeste_Weather?moduleId&label',
                    templateUrl: 'pages/tv/Weather_Yeste.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){

                        }]
                    }
                })

                //三星 天气 Samsung_Weather
                .state('app.tvAdmin.Samsung_Weather', {
                    url: '/Samsung_Weather?moduleId&label',
                    templateUrl: 'pages/tv/Weather_Samsung.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){

                        }]
                    }
                })

                //通用天气（土豪金） WeatherCommon
                .state('app.tvAdmin.WeatherCommon', {
                    url: '/WeatherCommon?moduleId&label',
                    templateUrl: 'pages/tv/Weather_Common.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){
                        }]
                    }
                })

                //三星午餐 Samsung_PicText_Classification
                .state('app.tvAdmin.Samsung_PicText_Classification', {
                    url: '/Samsung_PicText_Classification?moduleId&label',
                    templateUrl: 'pages/tv/PicText_Classification_Samsung.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){
                        }]
                    }
                })

                //SkyworthDTMB
                .state('app.tvAdmin.SkyworthDTMB', {
                    url: '/SkyworthDTMB?moduleId&label',
                    templateUrl: 'pages/tv/live_SkyworthDTMB.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){

                        }]
                    }
                })

                 // 丽枫酒店 多语言标题 介绍 图片(不需要多语言) 序号
                .state('app.tvAdmin.SimpleSmallPicText_LiFeng', {
                    url: '/SimpleSmallPicText_LiFeng?moduleId&label',
                    templateUrl: 'pages/tv/SimpleSmallPicText_LiFeng.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){

                        }]
                    }
                })

                .state('app.tvAdmin.LiFeng_SimpleSmallPicText_Left', {
                    url: '/LiFeng_SimpleSmallPicText_Left?moduleId&label',
                    templateUrl: 'pages/tv/LiFeng_SimpleSmallPicText_Left.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){

                        }]
                    }
                })
                 // 喆啡酒店 
                .state('app.tvAdmin.ZheFei_PicText_Classification', {
                    url: '/ZheFei_PicText_Classification?moduleId&label',
                    templateUrl: 'pages/tv/ZheFei_PicText_Classification.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){

                        }]
                    }
                })
                 // 喆啡酒店 
                .state('app.tvAdmin.ZheFei_SimpleSmallPicText_Small', {
                    url: '/ZheFei_SimpleSmallPicText_Small?moduleId&label',
                    templateUrl: 'pages/tv/ZheFei_SimpleSmallPicText_Small.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){

                        }]
                    }
                })
                 // 喆啡酒店 
                .state('app.tvAdmin.ZheFei_SimpleSmallPicText_Carousel', {
                    url: '/ZheFei_SimpleSmallPicText_Carousel?moduleId&label',
                    templateUrl: 'pages/tv/ZheFei_SimpleSmallPicText_Carousel.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){

                        }]
                    }
                })
                //雅思特 Yeste_SimpleSmallPicText_Carousel
                .state('app.tvAdmin.Yeste_SimpleSmallPicText_Carousel', {
                    url: '/Yeste_SimpleSmallPicText_Carousel?moduleId&label',
                    templateUrl: 'pages/tv/Yeste_SimpleSmallPicText_Carousel.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){

                        }]
                    }
                })

                .state('app.tvAdmin.MultPic_SX_Small', {
                    url: '/MultPic_SX_Small?moduleId&label',
                    templateUrl: 'pages/tv/MultPic_SX_Small.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){

                        }]
                    }
                })
                .state('app.tvAdmin.MultPic_SX_Big', {
                    url: '/MultPic_SX_Big?moduleId&label',
                    templateUrl: 'pages/tv/MultPic_SX_Big.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){

                        }]
                    }
                })
                .state('app.tvAdmin.SimplePicText_Price', {
                    url: '/SimplePicText_Price?moduleId&label',
                    templateUrl: 'pages/tv/SimplePicText_Price.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){

                        }]
                    }
                })
                .state('app.tvAdmin.SimplePicText_SX', {
                    url: '/SimplePicText_SX?moduleId&label',
                    templateUrl: 'pages/tv/SimplePicText_SX.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){

                        }]
                    }
                })
                .state('app.tvAdmin.PicText_Classification_SX', {
                    url: '/PicText_Classification_SX?moduleId&label',
                    templateUrl: 'pages/tv/PicText_Classification_SX.html',
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
                .state('app.tvAdmin.worldClock', {
                    url: '/worldClock?moduleId&label',
                    templateUrl: 'pages/tv/worldClock.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){
                            
                        }]
                    }
                })
                //雅思特 世界时钟 Yeste_WorldClock
                .state('app.tvAdmin.Yeste_WorldClock', {
                    url: '/Yeste_WorldClock?moduleId&label',
                    templateUrl: 'pages/tv/WorldClock_Yeste.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){

                        }]
                    }
                })
                .state('app.tvAdmin.SkyworthATV', {
                    url: '/SkyworthATV?moduleId&label',
                    templateUrl: 'pages/tv/SkyworthATV.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){
                            
                        }]
                    }
                })
                .state('app.tvAdmin.SkyworthHDMI', {
                    url: '/SkyworthHDMI?moduleId&label',
                    templateUrl: 'pages/tv/SkyworthHDMI.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){
                            
                        }]
                    }
                })
                .state('app.tvAdmin.BaoFengHDMI', {
                    url: '/BaoFengHDMI?moduleId&label',
                    templateUrl: 'pages/tv/BaoFengHDMI.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){

                        }]
                    }
                })
                .state('app.tvAdmin.SkyworthDTV', {
                    url: '/SkyworthDTV?moduleId&label',
                    templateUrl: 'pages/tv/SkyworthDTV.html',
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
                // 书香音乐库
                .state('app.tvAdmin.MusicCommon_SX', {
                    url: '/MusicCommon_SX?moduleId&label',
                    templateUrl: 'pages/tv/MusicCommon_SX.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){

                        }]
                    }
                })

                // 书香直播
                .state('app.tvAdmin.Live_SX', {
                    url: '/Live_SX?moduleId&label',
                    templateUrl: 'pages/tv/Live_SX.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){

                        }]
                    }
                })

                // 书香天气
                .state('app.tvAdmin.Weather_SX', {
                    url: '/Weather_SX?moduleId&label',
                    templateUrl: 'pages/tv/Weather_SX.html',
                    resolve: {
                        resB: ['resA', 'resWelcome', function(resA, resWelcome){

                        }]
                    }
                })

                // 扫码统计
                .state('app.qcode', {
                    url: '/qcode?moduleId&label',
                    templateUrl: 'pages/qcodeIndex.html'
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

            serverUrl: 'http://192.168.30.100/backend_mgt/v1/',
            // 张舰 自己 起了一个测试服务器
            // serverUrl: 'http://192.168.17.132/backend_mgt/v1/',
            // serverUrl: 'http://openvod.cleartv.cn/backend_mgt/v1/',
            uploadUrl: 'http://mres.cleartv.cn/upload',
            testUrl: 'test/',
            test: false,
        })

})();