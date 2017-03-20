'use strict';

(function () {
    var app = angular.module('app.controllers', [])

        .controller('indexController', ['$scope',
            function ($scope) {
                var self = this;
                self.init = function () {
                    this.maskUrl = '';
                }
            }
        ])

        .controller('loginController', ['$scope', '$http', '$filter', '$state', 'md5', 'util',
            function ($scope, $http, $filter, $state, md5, util) {
                var self = this;
                self.init = function () {
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
                            util.setParams('projectDes',msg.ProjectNameCN)
                            self.getEditLangs();
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.loading = false;
                    });
                }
                self.getEditLangs = function () {
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
            function ($http, $scope, $state, $stateParams, util) {
                var self = this;
                self.init = function () {
                    if(util.getParams("projectDes")){
                        this.projectDes = util.getParams("projectDes")
                    }else {
                        alert("访问超时，请重新登录")
                        $state.go('login')
                    }
                    // app 页面展开desktop
                    if ($state.current.name !== 'app') {
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
                        if ($stateParams.appId) {
                            self.setFocusApp($stateParams.appId);
                        }
                    }, function errorCallback(data, status, headers, config) {

                    }).finally(function (value) {
                        self.loading = false;
                    });
                    // console.log(util.getParams('editLangs'))
                }

                self.feedback = function() {
                    $scope.app.showHideMask(true,'pages/feedback.html');
                }

                self.setFocusApp = function (id) {
                    var l = $scope.appList;
                    for (var i = 0; i < l.length; i++) {
                        if (l[i].id == id) {
                            self.activeAppName = l[i].name;
                            self.activeAppIcon = l[i].icon;
                            self.activeAppBgColor = l[i].bgColor;
                            self.activeAppThemeColor = l[i].themeColor;

                            break;
                        }
                    }
                }

                // 1:酒店客房，2:酒店客房订单 3:移动商城，4:商城订单，5:tv界面, 6:终端管理，7:微信用户，9：字幕
                self.switchApp = function (n) {
                    // 收起桌面
                    self.appPhase = 2;

                    // 缩小导航栏
                    self.appFramePhase = 1;
                    self.setFocusApp(n);
                    switch (n) {
                        case 1:
                            if($state.current.name !== 'app.hotelRoom.room') {
                                $state.go('app.hotelRoom', {'appId': n});
                            }
                            break;
                        case 2:
                            $state.go('app.hotelOrderList', {'appId': n});
                            break;
                        case 3:
                            if($state.current.name !== 'app.shop.goods.goodsList') {
                                $state.go('app.shop', {'appId': n});
                            }
                            break;
                        case 4:
                            $state.go('app.shopOrderList', { 'appId': n });
                            break;
                        case 5:
                            if (!$state.includes("app.tvAdmin")) {
                                $state.go('app.tvAdmin', { 'appId': n });
                            }
                            break;
                        case 6:
                            $state.go('app.terminal', { 'appId': n });
                            break;
                        case 7:
                            $state.go('app.wxUser', { 'appId': n });
                            break;
                        case 8:
                            if(!$state.includes('app.projectConfig')) {
                                $state.go('app.projectConfig', { 'appId': n });
                            }
                            break;
                        case 9:
                                $state.go('app.realTimeCommand', { 'appId': n });
                            break;
                        default:
                            break;

                    }
                }

                self.showDesktop = function () {
                    self.appPhase = 1;
                    setTimeout(function () {
                        self.appFramePhase = 1;
                    }, 530)
                }

                self.focusLauncher = function () {
                    self.appFramePhase = 2;
                }

                self.focusApp = function () {
                    self.appFramePhase = 1;
                }

                self.logout = function (event) {
                    util.setParams('token', '');
                    $state.go('login');
                }

                // 添加 删除 弹窗，增加一个样式的class
                self.showHideMask = function(bool,url){
                    // bool 为true时，弹窗出现
                    if (bool) {
                        $scope.app.maskUrl = url;
                        $scope.app.showMaskClass = true;
                    } else {
                        $scope.app.maskUrl = '';
                        $scope.app.showMaskClass = false;
                    }
                    
                }
            }
        ])
        
        .controller('feedbackController', ['$scope', function($scope) {
            var self = this;
            self.init = function() {

            }
            self.exit = function() {
                $scope.app.showHideMask(false);
            }
        }])

        // 终端管理
        .controller('terminalController', ['$scope', '$state', '$translate', '$http', '$stateParams', '$filter', 'NgTableParams', 'util',
            function($scope, $state, $translate, $http, $stateParams, $filter, NgTableParams, util) {
                console.log('terminalController');
                var self = this;
                self.init = function() {
                        self.form = {};
                        self.defaultLangCode = util.getDefaultLangCode();
                        self.langStyle = util.langStyle();
                        self.multiLang = util.getParams('editLangs');
                        self.searchHotelList();
                    }
                    //获取门店
                self.searchHotelList = function() {
                    var data = {
                        "action": "getHotelList",
                        "token": util.getParams("token"),
                        "lang": self.langStyle
                    };
                    data = JSON.stringify(data);
                    $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('hotelroom', 'shopList', 'server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        if (data.data.rescode == "200") {

                            self.hotelList = data.data.data;
                        } else if (data.data.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login')
                        } else {
                            alert('列表获取失败， ' + data.data.errInfo);
                        }

                    }, function errorCallback(data, status, headers, config) {
                        alert('获取失败， ' + data.data.errInfo);
                    }).finally(function(value) {
                        self.loading = false;
                    });

                }

                // 获取终端列表 带搜索和分页
                self.getDevList = function() {
                    self.noData = false;
                    self.loading = true;
                    self.tableParams = new NgTableParams({
                        page: 1,
                        count: 15,
                        url: ''
                    }, {
                        counts: [],
                        getData: function(params) {
                            var data = {
                                "action": "getDevList",
                                "token": util.getParams("token"),
                                "lang": self.langStyle,
                                "Online": self.form.Online,
                                "HotelID": self.form.HotelID,
                                "RoomID": self.form.RoomID
                            }
                            var paramsUrl = params.url();
                            data.per_page = paramsUrl.count - 0;
                            data.page = paramsUrl.page - 0;
                            data = JSON.stringify(data);
                            return $http({
                                method: $filter('ajaxMethod')(),
                                url: util.getApiUrl('devinfo', 'shopList', 'server'),
                                data: data
                            }).then(function successCallback(data, status, headers, config) {
                                if (data.data.rescode == '200') {
                                    if (data.data.total == 0) {
                                        self.noData = true;
                                    }
                                    params.total(data.data.total);
                                    return data.data.devlist;
                                } else if (msg.rescode == '401') {
                                    alert('访问超时，请重新登录');
                                    $location.path("pages/login.html");
                                } else {
                                    alert(data.rescode + ' ' + data.errInfo);
                                }

                            }, function errorCallback(data, status, headers, config) {
                                alert(response.status + ' 服务器出错');
                            }).finally(function(value) {
                                self.loading = false;
                            })
                        }
                    });
                }

                // 获取终端状态 总数目
                self.getDevNum = function(ID, index) {
                    self.form.HotelName = self.hotelList[index].Name[self.defaultLangCode];
                    self.form.HotelID = ID;
                    self.hotelListIndex = index;
                    self.getDevList()
                    var data = {
                        "action": "getDevNum",
                        "token": util.getParams("token"),
                        "lang": self.langStyle,
                        "HotelID": self.form.HotelID
                    }

                    data = JSON.stringify(data);
                    $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('devinfo', '', 'server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        if (data.data.rescode == '200') {
                            self.form.total = data.data.total;
                            self.form.online = data.data.online;
                        } else if (msg.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $location.path("pages/login.html");
                        } else {
                            alert(data.rescode + ' ' + data.errInfo);
                        }
                    }, function errorCallback(data, status, headers, config) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function(value) {
                        self.loading = false;
                    })


                }

                self.delTerm = function(id) {
                    var conf = confirm('确认删除？');
                    if(!conf) {
                        return;
                    }
                    var data = {
                        "action": "delDev",
                        "token": util.getParams("token"),
                        "lang": self.langStyle,
                        "ID": id
                    }

                    data = JSON.stringify(data);
                    $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('devinfo', '', 'server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        if (data.data.rescode == '200') {
                            self.getDevList();
                            self.getDevNum(self.form.HotelID, self.hotelListIndex);
                        } else if (msg.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $location.path("pages/login.html");
                        } else {
                            alert(data.data.errInfo);
                        }
                    }, function errorCallback(data, status, headers, config) {
                        alert('连接服务器出错');
                    })
                }

                // 授权操作
                // todo 未做批量操作
                self.validDev = function(ID,Registered){
                    // return;
                    var data = {
                        "action": "validDev",
                        "token": util.getParams("token"),
                        "lang": self.langStyle,
                        "ID":[ID]
                    };
                    if(Registered) {
                        data.status =0;
                    } else {
                        data.status =1;
                    }
                    data = JSON.stringify(data);
                    $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('devinfo', '', 'server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        if (data.data.rescode == "200") {
                            alert('操作成功');
                            $state.reload($state.current.name,$stateParams,true)
                        } else if (data.data.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login')
                        } else {
                            alert('操作失败， ' + data.data.errInfo);
                        }

                    }, function errorCallback(data, status, headers, config) {
                        alert('操作失败， ' + data.data.errInfo);
                    }).finally(function(value) {
                    });
                }

                self.addDev = function() {
                    $scope.app.maskParams = { 'HotelID': self.form.HotelID };
                    $scope.app.showHideMask(true, 'pages/addDev.html');
                }
            }
        ])
        // 添加终端
        .controller('addDevController', ['$scope', '$state', '$http', '$stateParams', '$translate', '$filter', 'util',
            function($scope, $state, $http, $stateParams, $translate, $filter, util) {
                console.log('addDevController');
                var self = this;
                self.init = function() {
                    self.langStyle = util.langStyle();
                    self.multiLang = util.getParams('editLangs');
                    self.maskParams = $scope.app.maskParams;
                    // 表单提交 商城信息
                    self.form = {};
                   
                }

                self.cancel = function() {
                    $scope.app.showHideMask(false);
                }

                self.addDev = function() {
                    self.saving = true;
                    var data = {
                        "action": "addDev",
                        "token": util.getParams("token"),
                        "lang": self.langStyle,
                        "detail": {
                            "HotelID": self.maskParams.HotelID,
                            "RoomID": self.form.RoomID,
                            "TermMac": self.form.TermMac
                        }
                    };
                    data = JSON.stringify(data);
                    $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('devinfo', 'shopList', 'server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        if (data.data.rescode == "200") {
                            alert("终端添加成功");
                            self.cancel();
                            $state.go($state.current, $stateParams, { reload: true });
                        } else if (data.data.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login')
                        } else {
                            alert('列表获取失败， ' + data.data.errInfo);
                        }

                    }, function errorCallback(data, status, headers, config) {
                        alert('获取失败， ' + data.data.errInfo);
                    }).finally(function(value) {
                        self.saving = false;
                    });

                }

            }
        ])


        
        // 微信用户管理
        .controller('wxUserController', ['$scope', '$state', '$translate', '$http', '$stateParams', '$filter', 'NgTableParams', 'util',
            function($scope, $state, $translate, $http, $stateParams, $filter, NgTableParams, util) {
                console.log('wxUserController');
                var self = this;
                self.init = function() {
                    self.langStyle = util.langStyle();
                    self.multiLang = util.getParams('editLangs');
                    self.getWxUserInfo();
                }


                // 获取微信用户信息
                self.getWxUserInfo = function() {
                    self.noData = false;
                    self.loading = true;
                    self.tableParams = new NgTableParams({
                        page: 1,
                        count: 15,
                        url: ''
                    }, {
                        counts: [],
                        getData: function(params) {
                            var data = {
                                "action": "getWxUserInfo",
                                "token": util.getParams("token"),
                                "lang": self.langStyle
                            }
                            var paramsUrl = params.url();
                            data.per_page = paramsUrl.count - 0;
                            data.page = paramsUrl.page - 0;
                            data = JSON.stringify(data);
                            return $http({
                                method: $filter('ajaxMethod')(),
                                url: util.getApiUrl('devinfo', 'shopList', 'server'),
                                data: data
                            }).then(function successCallback(data, status, headers, config) {
                                if (data.data.rescode == '200') {
                                    if (data.data.total == 0) {
                                        self.noData = true;
                                    }
                                    params.total(data.data.total);
                                    return data.data.userinfo;
                                } else if (msg.rescode == '401') {
                                    alert('访问超时，请重新登录');
                                    $location.path("pages/login.html");
                                } else {
                                    alert(data.rescode + ' ' + data.errInfo);
                                }

                            }, function errorCallback(data, status, headers, config) {
                                alert(response.status + ' 服务器出错');
                            }).finally(function(value) {
                                self.loading = false;
                            })
                        }
                    });
                }

            }
        ])

        // 字幕
        .controller('realTimeCommandController', ['$scope', '$state', '$translate', '$http', '$stateParams', '$filter', 'NgTableParams', 'util',
            function($scope, $state, $translate, $http, $stateParams, $filter, NgTableParams, util) {
                console.log('realTimeCommandController');
                var self = this;
                self.init = function() {
                    self.langStyle = util.langStyle();
                    self.multiLang = util.getParams('editLangs');
                    self.realTimeCmdInfo = {
                        Content:"test",
                        startDate:123213213,
                        endDate:13123213213,
                        Duration:2,
                        switch:0
                    }
                }

                self.edit = function(info){
                    $scope.app.maskParams = info;
                    $scope.app.showHideMask(true, 'pages/realTimeCommandEdit.html');
                }
                // 添加字幕
                self.addRealTimeCmd = function() {
                    var data = {
                        "action": "addRealTimeCmd",
                        "token": util.getParams("token"),
                        // -1 为全部
                        "terms":[-1],
                        "data":{
                        }
                    }
                    var paramsUrl = params.url();
                    data.per_page = paramsUrl.count - 0;
                    data.page = paramsUrl.page - 0;
                    data = JSON.stringify(data);
                    return $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('devinfo', 'shopList', 'server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        if (data.data.rescode == '200') {
                            if (data.data.total == 0) {
                                self.noData = true;
                            }
                            params.total(data.data.total);
                            return data.data.userinfo;
                        } else if (msg.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $location.path("pages/login.html");
                        } else {
                            alert(data.rescode + ' ' + data.errInfo);
                        }

                    }, function errorCallback(data, status, headers, config) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function(value) {
                        self.loading = false;
                    })
                }
            }
        ])

        // 字幕编辑
        .controller('realTimeCommandController', ['$scope', '$state', '$translate', '$http', '$stateParams', '$filter', 'NgTableParams', 'util',
            function($scope, $state, $translate, $http, $stateParams, $filter, NgTableParams, util) {
                console.log('realTimeCommandController');
                var self = this;
                self.init = function() {
                    self.langStyle = util.langStyle();
                    self.multiLang = util.getParams('editLangs');
                    self.realTimeCmdInfo = $scope.app.maskParams;
                }

                self.edit = function(info){
                    $scope.app.maskParams = info;
                    $scope.app.showHideMask(true, 'pages/realTimeCommandEdit.html');
                }
                // 添加字幕
                self.addRealTimeCmd = function() {
                    var data = {
                        "action": "addRealTimeCmd",
                        "token": util.getParams("token"),
                        // -1 为全部
                        "terms":[-1],
                        "data":{
                        }
                    }
                    var paramsUrl = params.url();
                    data.per_page = paramsUrl.count - 0;
                    data.page = paramsUrl.page - 0;
                    data = JSON.stringify(data);
                    return $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('devinfo', 'shopList', 'server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        if (data.data.rescode == '200') {
                            if (data.data.total == 0) {
                                self.noData = true;
                            }
                            params.total(data.data.total);
                            return data.data.userinfo;
                        } else if (msg.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $location.path("pages/login.html");
                        } else {
                            alert(data.rescode + ' ' + data.errInfo);
                        }

                    }, function errorCallback(data, status, headers, config) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function(value) {
                        self.loading = false;
                    })
                }
                self.cancel = function(){
                    $scope.app.showHideMask(false)
                }
            }
        ])

        .controller('shopController', ['$scope', '$state', '$translate', '$http', '$stateParams', '$filter', 'util',
            function($scope,$state,$translate,$http,$stateParams,$filter,util) {
                console.log('shopController');
                var self = this;
                self.init = function() {
                    self.langStyle = util.langStyle();
                    self.multiLang = util.getParams('editLangs');
                    self.loading = false;
                    self.noData = false;
                    self.searchShopList();
                    // for page active
                    $scope.ShopID = $stateParams.ShopID;
                        
                }


                self.searchShopList = function() {
                    self.loading = true;
                    var data = {
                          "action": "getMgtHotelShopInfo",
                          "token": util.getParams("token"),
                          "lang": self.langStyle
                    };
                    data = JSON.stringify(data);
                    $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('shopinfo', 'shopList', 'server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        if (data.data.rescode == "200") {
                            if (data.data.data.shopList.length == 0) {
                                self.noData = true;
                                return;
                            }
                            self.shopList = data.data.data.shopList;
                            // 默认加载 指定 商城 or 第一个 商城
                            self.shopFirst = self.shopList[0];
                            if($stateParams.ShopID) {
                                for(var i = 0; i < self.shopList.length; i++) {
                                    if ($stateParams.ShopID == self.shopList[i].ShopID) {
                                        self.shopFirst = self.shopList[i];
                                        break;
                                    }
                                }
                            }
                            self.goTo(self.shopFirst.ShopID, self.shopFirst.HotelID, self.shopFirst.ShopName, self.shopFirst.HotelName, self.shopFirst.ShopType);
                        } else if (data.data.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login')
                        } else {
                            alert('添加失败， ' + data.data.errInfo);
                        }
                    }, function errorCallback(data, status, headers, config) {
                        alert('连接服务器出错');
                    }).finally(function(value) {
                        self.loading = false;
                    });

                }
                
                self.shopAdd = function(){
                    $scope.app.showHideMask(true,'pages/shopAdd.html');
                }

                 


                self.goTo = function(ShopID, HotelID, ShopName, HotelName, ShopType) {
                    $scope.app.maskParams.ShopName = ShopName;
                    $scope.app.maskParams.HotelName = HotelName;
                    $scope.app.maskParams.ShopType = ShopType;

                    if (ShopID != $stateParams.ShopID) {
                        // for page active
                        $scope.ShopID = ShopID;

                        $state.go('app.shop.goods', {
                            ShopID: ShopID, 
                            HotelID: HotelID
                        });
                    }

                }

            }
        ])

        .controller('shopAddController', ['$scope', '$state', '$http', '$stateParams', '$translate', '$filter', 'util',
            function($scope,$state,$http,$stateParams,$translate,$filter,util) {
                console.log('shopAddController');
                var self = this;
                self.init = function() {
                     self.langStyle = util.langStyle();
                     self.multiLang = util.getParams('editLangs');
                     self.saving = false;
                     self.searchHotelList();
                     // 表单提交 商城信息
                     self.form = {};
                     // 多语言
                     self.form.shopName = {};

                     self.saving = false;
                     self.loading = false;
                }

                self.cancel = function(){
                    $scope.app.showHideMask(false);
                }

                self.searchHotelList = function() {
                    self.loading = true;
                    var data = {
                          "action": "getHotelList",
                          "token": util.getParams("token"),
                          "lang": self.langStyle
                    };
                    data = JSON.stringify(data);
                        $http({
                            method: $filter('ajaxMethod')(),
                            url: util.getApiUrl('hotelroom', 'shopList','server'),
                            data: data
                        }).then(function successCallback(data, status, headers, config) {
                            if (data.data.rescode == "200") {
                                if (data.data.data.length == 0) {
                                    self.noData = true;
                                    return;
                                }
                                self.hotelList = data.data.data;
                            } else if (data.data.rescode == "401") {
                                alert('访问超时，请重新登录');
                                $state.go('login')
                            } else {
                                alert('列表获取失败， ' + data.data.errInfo);
                            }

                        }, function errorCallback(data, status, headers, config) {
                            alert('获取失败， ' + data.data.errInfo);
                        }).finally(function(value) {
                            self.loading = false;
                        });

                }

                self.saveForm = function() {
                    if(!self.form.HotelID) {
                        alert('请选择门店');
                        return;
                    }
                    var shopList = {
                        "HotelID": self.form.HotelID - 0,
                        "ShopName": self.form.shopName,
                        "ShopType": self.ShopType
                    }
                    var data = {
                        "action": "addMgtHotelShop",
                        "token": util.getParams("token"),
                        "lang": self.langStyle,
                        "shopList": [shopList]
                    };
                    data = JSON.stringify(data);
                    self.saving = true;
                    
                    $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('shopinfo', 'shopList', 'server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        if (data.data.rescode == "200") {
                            alert('添加成功')
                            $state.reload();
                        } else if (data.data.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login')
                        } else {
                            alert('添加失败， ' + data.data.errInfo);
                        }
                    }, function errorCallback(data, status, headers, config) {
                        alert('添加失败， ' + data.data.errInfo);
                    }).finally(function(value) {
                        self.saving = false;
                    });
                }


            }
        ])

        .controller('goodsController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'util',
            function ($scope, $state, $http, $stateParams, $filter, util) {
                console.log('goodsController');
                
                var self = this;
                self.init = function () {
                    self.maskParams = $scope.app.maskParams;
                    
                    self.stateParams = $stateParams;
                    self.langStyle = util.langStyle();
                    self.multiLang = util.getParams('editLangs');

                    // active
                    self.ShopGoodsCategoryID = $stateParams.ShopGoodsCategoryID;

                    self.noData = false;
                    self.loading = false;

                    self.getGoodsCategory();
                    
                }

                self.categoryAdd = function () {
                    $scope.app.maskParams = {'ShopID': self.stateParams.ShopID - 0};
                    $scope.app.showHideMask(true,'pages/categoryAdd.html');
                }

                self.shopEdit = function () {
                    $scope.app.maskParams = {
                        ShopID: $stateParams.ShopID,
                        ShopName: self.maskParams.ShopName,
                        HotelName: self.maskParams.HotelName,
                        HotelID: $stateParams.HotelID,
                        ShopType: self.maskParams.ShopType
                    };
                    $scope.app.showHideMask(true,'pages/shopEdit.html');
                }
                // 商品分类列表
                self.getGoodsCategory = function () {
                    self.loading = true;
                    var data = {
                        "action": "getMgtProductCategory",
                        "token": util.getParams("token"),
                        "lang": self.langStyle,
                        "shopId": $stateParams.ShopID
                    };
                    data = JSON.stringify(data);
                    $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('shopinfo', 'shopList', 'server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        if (data.data.rescode == "200") {
                            if (data.data.data.categoryList.length == 0) {
                                self.noData = true;
                            }
                            self.categoryList = data.data.data.categoryList;
                            
                            self.gotoShopCate = {'id': 'all', name: {'en-US': 'All', 'zh-CN': '全部商城'}};
                            if($stateParams.ShopGoodsCategoryID) {
                                for(var i = 0; i < self.categoryList.length; i++) {
                                    if ($stateParams.ShopGoodsCategoryID == self.categoryList[i].id) {
                                        self.gotoShopCate = self.categoryList[i];
                                        break;
                                    }
                                }
                            }
                            self.goTo(self.gotoShopCate.id, self.gotoShopCate.name);
                        } else if (data.data.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login')
                        } else {
                            alert('添加失败， ' + data.data.errInfo);
                        }
                    }, function errorCallback(data, status, headers, config) {
                        alert('连接服务器出错')
                    }).finally(function (value) {
                        self.loading = false;
                    });
                }

                self.JSONstringfy = function (data) {
                    return JSON.stringify(data)
                }
                // 前往goodsList
                self.goTo = function (categoryId, categoryName) {
                    // active
                    self.ShopGoodsCategoryID = categoryId;
                    $scope.app.maskParams.name = categoryName;
                    $state.go('app.shop.goods.goodsList', {ShopGoodsCategoryID: categoryId});
                }
            }
        ])

        .controller('goodsAddController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'util', 'CONFIG',
            function ($scope, $state, $http, $stateParams, $filter, util, CONFIG) {
                console.log('goodsAddController');

                var self = this;
                self.init = function () {
                    self.shopId = $scope.app.maskParams.shopId;
                    self.shopGoodsCategoryId = $scope.app.maskParams.shopGoodsCategoryId;
                    self.imgs = new Imgs([]);
                    self.editLangs = util.getParams('editLangs');
                    self.name = {};
                    self.intro = {};
                }

                self.cancel = function () {
                    console.log('cancel')
                    $scope.app.showHideMask(false);
                }

                self.addGoods = function () {
                    // 图片不能为空
                    if (self.imgs.data.length == 0) {
                        alert('请上传图片');
                        return;
                    }
                    // 图片不能未传完
                    else if (self.imgs.data.some(function (e, i, a) {
                            return e.progress < 100 && e.progress !== -1
                        })) {
                        alert('请等待图片上传完成');
                        return;
                    }
                    var imgSrc = [];
                    var l = self.imgs.data;
                    for (var i = 0; i < l.length; i++) {
                        imgSrc[i] = {};
                        imgSrc[i].ImageURL = l[i].src;
                        imgSrc[i].Seq = i;
                        imgSrc[i].ImageSize = Number(l[i].fileSize);
                    }
                    var data = JSON.stringify({
                        "action": "addMgtProductDetail",
                        "token": util.getParams('token'),
                        "lang": util.langStyle(),
                        "product": {
                            "ShopID": self.shopId,
                            "categoryId": self.shopGoodsCategoryId,
                            "name": self.name,
                            "invetory": self.invetory,
                            "price": self.price*100,
                            "intro": self.intro,
                            "imgSrc": imgSrc
                        }
                    });

                    self.saving = true;
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('shopinfo', '', 'server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        if (data.data.rescode == "200") {
                            alert('添加成功');
                            $state.reload();
                        } else {
                            alert('添加失败，错误编码：' + data.data.rescode + '，' + data.data.errInfo);
                        }
                    }, function errorCallback(data, status, headers, config) {
                        alert('连接服务器出错');
                    }).finally(function (value) {
                        self.saving = false;
                    });
                }

                self.clickUpload = function (e) {
                    setTimeout(function () {
                        document.getElementById(e).click();
                    }, 0);
                }

                function Imgs(imgList) {
                    this.initImgList = imgList;
                    this.data = [];
                    this.maxId = 0;
                }

                Imgs.prototype = {
                    initImgs: function () {
                        var l = this.initImgList;
                        for (var i = 0; i < l.length; i++) {
                            this.data[i] = {
                                "src": l[i].ImageURL,
                                "fileSize": l[i].ImageSize,
                                "id": this.maxId++,
                                "progress": 100
                            };
                        }
                    },
                    deleteById: function (id) {
                        var l = this.data;
                        for (var i = 0; i < l.length; i++) {
                            if (l[i].id == id) {
                                // 如果正在上传，取消上传
                                if (l[i].progress < 100 && l[i].progress != -1) {
                                    l[i].xhr.abort();
                                }
                                l.splice(i, 1);
                                break;
                            }
                        }
                    },

                    add: function (xhr, fileName, fileSize) {
                        this.data.push({
                            "xhr": xhr,
                            "fileName": fileName,
                            "fileSize": fileSize,
                            "progress": 0,
                            "id": this.maxId
                        });
                        return this.maxId++;
                    },

                    update: function (id, progress, leftSize, fileSize) {
                        for (var i = 0; i < this.data.length; i++) {
                            var f = this.data[i];
                            if (f.id === id) {
                                f.progress = progress;
                                f.leftSize = leftSize;
                                f.fileSize = fileSize;
                                break;
                            }
                        }
                    },

                    setSrcSizeByXhr: function (xhr, src, size) {
                        for (var i = 0; i < this.data.length; i++) {
                            if (this.data[i].xhr == xhr) {
                                this.data[i].src = src;
                                this.data[i].fileSize = size;
                                break;
                            }
                        }
                    },

                    uploadFile: function (e) {
                        var file = $scope[e];
                        var uploadUrl = CONFIG.uploadUrl;
                        var xhr = new XMLHttpRequest();
                        var fileId = this.add(xhr, file.name, file.size, xhr);
                        // self.search();

                        util.uploadFileToUrl(xhr, file, uploadUrl, 'normal',
                            function (evt) {
                                $scope.$apply(function () {
                                    if (evt.lengthComputable) {
                                        var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                                        self.imgs.update(fileId, percentComplete, evt.total - evt.loaded, evt.total);
                                        console.log(percentComplete);
                                    }
                                });
                            },
                            function (xhr) {
                                var ret = JSON.parse(xhr.responseText);
                                console && console.log(ret);
                                $scope.$apply(function () {
                                    self.imgs.setSrcSizeByXhr(xhr, ret.upload_path, ret.size);
                                });
                            },
                            function (xhr) {
                                $scope.$apply(function () {
                                    self.imgs.update(fileId, -1, '', '');
                                });
                                console.log('failure');
                                xhr.abort();
                            }
                        );
                    }

                }

            }
        ])

        .controller('goodsEditController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'util', 'CONFIG',
            function ($scope, $state, $http, $stateParams, $filter, util, CONFIG) {
                console.log('goodsEditController');

                var self = this;
                self.init = function () {
                    self.productId = $scope.app.maskParams.productId;
                    self.editLangs = util.getParams('editLangs');
                    self.name = {};
                    self.intro = {};

                    self.getGoodsInfo();
                }

                self.getGoodsInfo = function () {
                    self.loading = true;

                    var data = JSON.stringify({
                        "action": "getMgtProductDetail",
                        "token": util.getParams('token'),
                        "lang": util.langStyle(),
                        "productId": self.productId
                    })

                    $http({
                        method: 'POST',
                        url: util.getApiUrl('shopinfo', '', 'server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        if (data.data.rescode == "200") {
                            var data = data.data.data;
                            self.name = data.product.name;
                            self.invetory = data.product.invetory - 0;
                            self.price = (data.product.price - 0) / 100;
                            self.intro = data.product.intro;
                            self.imgs = new Imgs(data.product.imgSrc);
                            self.imgs.initImgs();
                        } else {
                            alert('读取商品失败' + data.data.rescode + '，' + data.data.errInfo);
                        }
                    }, function errorCallback(data, status, headers, config) {
                        alert('连接服务器出错');
                    }).finally(function (value) {
                        self.loading = false;
                    });
                }

                self.cancel = function () {
                    console.log('cancel')
                    $scope.app.showHideMask(false);
                }

                self.editGoods = function () {
                    // 图片不能为空
                    if (self.imgs.data.length == 0) {
                        alert('请上传图片');
                        return;
                    }
                    // 图片不能未传完
                    else if (self.imgs.data.some(function (e, i, a) {
                            return e.progress < 100 && e.progress !== -1
                        })) {
                        alert('请等待图片上传完成');
                        return;
                    }
                    var imgSrc = [];
                    var l = self.imgs.data;
                    for (var i = 0; i < l.length; i++) {
                        imgSrc[i] = {};
                        imgSrc[i].ImageURL = l[i].src;
                        imgSrc[i].Seq = i;
                        imgSrc[i].ImageSize = Number(l[i].fileSize);
                    }
                    var data = JSON.stringify({
                        "action": "editMgtProductDetail",
                        "token": util.getParams('token'),
                        "lang": util.langStyle(),
                        "product": {
                            "productID": self.productId,
                            "name": self.name,
                            "invetory": self.invetory,
                            "price": self.price*100,
                            "intro": self.intro,
                            "imgSrc": imgSrc
                        }
                    });
                    console.log(data);
                    self.saving = true;
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('shopinfo', '', 'server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        if (data.data.rescode == "200") {
                            alert('修改成功');
                            $state.reload('app.shop.goods.goodsList');
                            self.cancel();
                        } else {
                            alert('修改失败，错误编码：' + data.data.rescode + '，' + data.data.errInfo);
                        }
                    }, function errorCallback(data, status, headers, config) {
                        alert('连接服务器出错');
                    }).finally(function (value) {
                        self.saving = false;
                    });
                }

                self.clickUpload = function (e) {
                    setTimeout(function () {
                        document.getElementById(e).click();
                    }, 0);
                }

                function Imgs(imgList) {
                    this.initImgList = imgList;
                    this.data = [];
                    this.maxId = 0;
                }

                Imgs.prototype = {
                    initImgs: function () {
                        var l = this.initImgList;
                        for (var i = 0; i < l.length; i++) {
                            this.data[i] = {
                                "src": l[i].ImageURL,
                                "fileSize": l[i].ImageSize,
                                "id": this.maxId++,
                                "progress": 100
                            };
                        }
                    },
                    deleteById: function (id) {
                        var l = this.data;
                        for (var i = 0; i < l.length; i++) {
                            if (l[i].id == id) {
                                // 如果正在上传，取消上传
                                if (l[i].progress < 100 && l[i].progress != -1) {
                                    l[i].xhr.abort();
                                }
                                l.splice(i, 1);
                                break;
                            }
                        }
                    },

                    add: function (xhr, fileName, fileSize) {
                        this.data.push({
                            "xhr": xhr,
                            "fileName": fileName,
                            "fileSize": fileSize,
                            "progress": 0,
                            "id": this.maxId
                        });
                        return this.maxId++;
                    },

                    update: function (id, progress, leftSize, fileSize) {
                        for (var i = 0; i < this.data.length; i++) {
                            var f = this.data[i];
                            if (f.id === id) {
                                f.progress = progress;
                                f.leftSize = leftSize;
                                f.fileSize = fileSize;
                                break;
                            }
                        }
                    },

                    setSrcSizeByXhr: function (xhr, src, size) {
                        for (var i = 0; i < this.data.length; i++) {
                            if (this.data[i].xhr == xhr) {
                                this.data[i].src = src;
                                this.data[i].fileSize = size;
                                break;
                            }
                        }
                    },

                    uploadFile: function (e) {
                        var file = $scope[e];
                        var uploadUrl = CONFIG.uploadUrl;
                        var xhr = new XMLHttpRequest();
                        var fileId = this.add(xhr, file.name, file.size, xhr);
                        // self.search();

                        util.uploadFileToUrl(xhr, file, uploadUrl, 'normal',
                            function (evt) {
                                $scope.$apply(function () {
                                    if (evt.lengthComputable) {
                                        var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                                        self.imgs.update(fileId, percentComplete, evt.total - evt.loaded, evt.total);
                                        console.log(percentComplete);
                                    }
                                });
                            },
                            function (xhr) {
                                var ret = JSON.parse(xhr.responseText);
                                console && console.log(ret);
                                $scope.$apply(function () {
                                    self.imgs.setSrcSizeByXhr(xhr, ret.upload_path, ret.size);
                                });
                            },
                            function (xhr) {
                                $scope.$apply(function () {
                                    self.imgs.update(fileId, -1, '', '');
                                });
                                console.log('failure');
                                xhr.abort();
                            }
                        );
                    }

                }

            }
        ])

        .controller('shopEditController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'util',
            function ($scope, $state, $http, $stateParams, $filter, util) {
                console.log('shopEditController');

                var self = this;
                self.init = function () {
                    self.maskParams = $scope.app.maskParams;
                    self.langStyle = util.langStyle();
                    self.multiLang = util.getParams('editLangs');
                    self.noData = false;
                    self.loading = false;
                    self.saving = false;
                    // 表单提交 商城信息
                    self.form = {};
                    // 多语言
                    self.form.shopName = {};

                    // self.searchHotelList();
                    self.shopInfo = self.maskParams.ShopName;
                    self.ShopType = self.maskParams.ShopType;
                }

                self.cancel = function () {
                    console.log('cancel')
                    $scope.app.showHideMask(false);
                };

                // self.searchHotelList = function () {
                //     self.loading = true;
                //     var data = {
                //         "action": "getHotelList",
                //         "token": util.getParams("token"),
                //         "lang": self.langStyle
                //     };
                //     data = JSON.stringify(data);
                //     $http({
                //         method: $filter('ajaxMethod')(),
                //         url: util.getApiUrl('hotelroom', 'shopList', 'server'),
                //         data: data
                //     }).then(function successCallback(data, status, headers, config) {
                //             if (data.data.rescode == "200") {
                //                 if (data.data.data.length == 0) {
                //                     self.noData = true;
                //                     return;
                //                 }
                //                 self.hotelList = data.data.data.hotelList;
                //             } else if (data.data.rescode == "401") {
                //                 alert('访问超时，请重新登录');
                //                 $state.go('login')
                //             } else {
                //                 alert('失败， ' + data.data.errInfo);
                //             }
                //         },
                //         function errorCallback(data, status, headers, config) {
                //             alert('连接服务器出错')
                //         }).finally(function (value) {
                //         self.loading = false;
                //     });
                // }


                self.saveForm = function () {
                    self.saving = true;
                    
                    var data = {
                        "action": "editMgtHotelShop",
                        "token": util.getParams("token"),
                        "lang": self.langStyle,
                        "shop": {
                            "ShopID": self.maskParams.ShopID,
                            "ShopName": self.shopInfo,
                            "ShopType": self.ShopType
                        }
                    };

                    data = JSON.stringify(data);
                    $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('shopinfo', 'shopList', 'server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        if (data.data.rescode == "200") {
                            alert('保存成功');
                            $state.reload();
                        } else if (data.data.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login')
                        } else {
                            alert('保存失败， ' + data.data.errInfo);
                        }
                    }, function errorCallback(data, status, headers, config) {
                        alert('连接服务器出错')
                    }).finally(function (value) {
                        self.saving = false;
                    });
                };

                self.deleteShop = function () {
                    var flag = confirm('确认删除？')
                    if (!flag) {
                        return;
                    }
                    self.saving = true;
                    var shopList = {
                        "HotelID": self.form.HotelID - 0,
                        "ShopName": self.form.shopName,
                        "ShopType": self.ShopType
                    }
                    var data = {
                        "action": "deleteMgtHotelShop",
                        "token": util.getParams("token"),
                        "lang": self.langStyle,
                        "shop": {
                            "ShopID": self.maskParams.ShopID - 0
                        }
                    };
                    data = JSON.stringify(data);
                    $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('shopinfo', 'shopList', 'server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        if (data.data.rescode == "200") {
                            alert('删除成功')
                            $state.reload();
                        } else if (data.data.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login')
                        } else {
                            alert('删除失败， ' + data.data.errInfo);
                        }

                    }, function errorCallback(data, status, headers, config) {
                        alert('连接服务器出错')
                    }).finally(function (value) {
                        self.saving = false;
                    });
                }

            }
        ])

        .controller('categoryAddController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'util',
            function ($scope, $state, $http, $stateParams, $filter, util) {
                console.log('categoryAddController');
                console.log($stateParams);
                console.log($scope.app.maskParams);
                var self = this;
                self.init = function () {
                    self.langStyle = util.langStyle();
                    self.maskParams = $scope.app.maskParams;
                    self.ShopName = self.maskParams.ShopGoodsCategoryName;
                    self.multiLang = util.getParams('editLangs');

                    self.saving = false;

                    // 表单提交 商城信息
                    self.form = {};
                    // 多语言
                    self.form.shopName = {};
                }

                self.cancel = function () {
                    console.log('cancel')
                    $scope.app.showHideMask(false);
                }

                self.saveForm = function () {
                    self.saving = true;
                    var data = {
                        "action": "addMgtProductCategory",
                        "token": util.getParams("token"),
                        "lang": self.langStyle,
                        "ShopGoodsCategory": {
                            "ShopGoodsCategoryName": self.form.shopName,
                            "ShopID": self.maskParams.ShopID - 0
                        }

                    };
                    data = JSON.stringify(data);
                    $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('shopinfo', 'shopList', 'server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        if (data.data.rescode == "200") {
                            alert('分类添加成功');
                            $state.reload();
                            self.cancel();
                        } else if (data.data.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login')
                        } else {
                            alert('添加失败， ' + data.data.errInfo);
                        }
                    }, function errorCallback(data, status, headers, config) {
                        alert('连接服务器出错')
                    }).finally(function (value) {
                        self.saving = false;
                    });
                }


            }
        ])

        .controller('categoryEditController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'util',
            function ($scope, $state, $http, $stateParams, $filter, util) {
                console.log('categoryEditController');
    
                var self = this;
                self.init = function () {
                    self.stateParams = $stateParams;
                    self.maskParams = $scope.app.maskParams;
                    self.langStyle = util.langStyle();
                    self.multiLang = util.getParams('editLangs');

                    // 表单提交 商城信息
                    self.form = {};
                    // 多语言
                    self.form.shopName = {};
                    // self.getCategoryDetail();
                    self.categoryDetail = $scope.app.maskParams.name;

                    self.saving = false;
                }

                self.cancel = function () {
                    console.log('cancel')
                    $scope.app.showHideMask(false);
                }

                self.saveForm = function () {
                    self.saving = true;
                    var data = {
                        "action": "editMgtProductCategory",
                        "token": util.getParams("token"),
                        "lang": self.langStyle,
                        "ShopGoodsCategory": {
                            "ShopGoodsCategoryID": self.maskParams.id,
                            "ShopGoodsCategoryName": self.categoryDetail
                        }
                    };
                    data = JSON.stringify(data);
                    $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('shopinfo', 'shopList', 'server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        alert('分类修改成功')
                        $state.reload();
                    }, function errorCallback(data, status, headers, config) {

                    }).finally(function(value) {
                        self.saving = false;
                    })

                };
            }
        ])

        .controller('goodsListController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'NgTableParams', 'util',
            function ($scope, $state, $http, $stateParams, $filter, NgTableParams, util) {
                console.log('goodsListController');
                var self = this;
                self.init = function () {
                    self.stateParams = $stateParams;
                    self.langStyle = util.langStyle();
                    self.multiLang = util.getParams('editLangs');
                    self.getGoodsCategory();
                    self.getProductList(self.stateParams.ShopGoodsCategoryID);

                    self.saving = false;
                }

                // 分类编辑
                self.categoryEdit = function () {
                    $scope.app.maskParams.id = self.stateParams.ShopGoodsCategoryID;
                    $scope.app.showHideMask(true,'pages/categoryEdit.html');
                }


                self.categoryDelete = function () {
                    var flag = confirm('确认删除？')
                    if (!flag) {
                        return;
                    }
                    self.saving = true;
                    var data = {
                        "action": "deleteMgtProductCategory",
                        "token": util.getParams("token"),
                        "lang": self.langStyle,
                        "ShopGoodsCategoryID": self.stateParams.ShopGoodsCategoryID - 0
                    };
                    data = JSON.stringify(data);
                    $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('shopinfo', 'shopList', 'server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        if (data.data.rescode == "200") {
                            alert('分类删除成功')
                            $state.reload();
                        } else if (data.data.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login')
                        } else {
                            alert('删除失败， ' + data.data.errInfo);
                        }
                        
                    }, function errorCallback(data, status, headers, config) {
                        alert('添加失败， ' + data.data.errInfo);
                    });
                }

                self.goodsAdd = function () {
                    $scope.app.maskParams = {
                        'shopId': self.stateParams.ShopID,
                        'shopGoodsCategoryId': self.stateParams.ShopGoodsCategoryID
                    }; //全部分类 ShopGoodsCategoryID －1
                    $scope.app.showHideMask(true,'pages/goodsAdd.html');
                }

                self.goodsEdit = function (goodsId) {
                    $scope.app.maskParams = {'productId': goodsId};
                    $scope.app.showHideMask(true,'pages/goodsEdit.html');
                }

                // 商品分类列表
                self.getGoodsCategory = function () {
                    var data = {
                        "action": "getMgtProductCategory",
                        "token": util.getParams("token"),
                        "lang": self.langStyle,
                        "shopId": $stateParams.ShopID - 0
                    };
                    data = JSON.stringify(data);
                    $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('shopinfo', 'shopList', 'server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        self.categoryList = data.data.data.categoryList;
                    }, function errorCallback(data, status, headers, config) {

                    });
                }

                // 商品列表
                self.getProductList = function (ShopGoodsCategoryID) {

              
                            var data = {
                                "action": "getMgtShopProductList",
                                "token": util.getParams("token"),
                                "lang": self.langStyle,
                                "ShopID": self.stateParams.ShopID - 0,
                                "count": 1000,
                                "page":1
                            }

                            if (!(ShopGoodsCategoryID == "all")) {
                                data.ShopGoodsCategoryID = self.stateParams.ShopGoodsCategoryID - 0;
                                data.action = "getMgtProductList";
                            }
                            
                            data = JSON.stringify(data);


                            $http({
                                method: $filter('ajaxMethod')(),
                                url: util.getApiUrl('shopinfo', 'shopList', 'server'),
                                data: data
                            }).then(function successCallback(data, status, headers, config) {
                                // params.total(data.data.data.productTotal);
                                var data = data.data.data.productList;
                                self.goodsList  = data;
                                // return data;

                            }, function errorCallback(data, status, headers, config) {

                            })

         

                }

                // 商品分类，属于某分类则返回true
                self.checkGoodsCategory = function (id, categoryList) {
                    for (var i = 0; i < categoryList.length; i++) {
                        if (id == categoryList[i]['ShopGoodsCategoryID']) {
                            return true;
                        }
                    }
                }

                // 更改商品分类
                self.changeGoodsCategory = function (productId, categoryId, value, categoryList) {
                    // 商品 的分类，保存在此对象
                    self.categoryObj = {};
                    self.categoryObj[productId] = [];
                    console.log('categoryList '+categoryList)
                    for (var i = 0; i < categoryList.length; i++) {
                        self.categoryObj[productId].push(categoryList[i]['ShopGoodsCategoryID']);
                    }
                    var index = self.categoryObj[productId].indexOf(categoryId);
                    console.log(index)
                    // 没有，则添加此分类
                    // if (value == false) {
                    //     self.categoryObj[productId].splice(index, 1)
                    // } else {
                    //     self.categoryObj[productId].push(categoryId)
                    // }
                    if (index < 0) {
                        self.categoryObj[productId].push(categoryId)
                    } else {
                        self.categoryObj[productId].splice(index, 1)
                    }
                    console.log(self.categoryObj[productId])
                    var data = {
                        "action": "editMgtProductPCategory",
                        "token": util.getParams("token"),
                        "lang": self.langStyle,
                        "product": {
                            "productID": productId - 0,
                            "categoryList": self.categoryObj[productId]
                            // "categoryList": []
                        }
                    };
                    data = JSON.stringify(data);
                    $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('shopinfo', 'shopList', 'server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        console.log(data)
                        alert('修改分类成功');
                        $state.reload('app.shop.goods.goodsList')
                    }, function errorCallback(data, status, headers, config) {

                    });
                }

                // 商品 上下架
                self.changeGoodsStatus = function (productId, status, value) {
                    console.log('productId:' + productId + ' status:' + status + ' value:' + value)
                    if (status == true) {
                        status = 1;
                    } else {
                        status =0;
                    }

                    var data = {
                        "action": "editMgtProductStatus",
                        "token": util.getParams("token"),
                        "lang": self.langStyle,
                        "product": {
                            "productID": productId - 0,
                            "Status": status
                        }
                    };


                    data = JSON.stringify(data);
                    $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('shopinfo', 'shopList', 'server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        alert('修改成功')
                        $state.reload('app.shop.goods.goodsList')
                    }, function errorCallback(data, status, headers, config) {

                    });
                }
            }
        ])

        .controller('hotelRoomController', ['$scope', '$http', '$stateParams', '$state', 'util',
            function ($scope, $http, $stateParams, $state, util) {
                var self = this;
                var lang;
                self.init = function () {
                    lang = util.langStyle();
                    self.defaultLangCode = util.getDefaultLangCode();
                    self.queryHotelList();
                }
                self.queryHotelList = function () {
                    var data = JSON.stringify({
                        action: "getHotelList",
                        token: util.getParams('token'),
                        lang: lang,
                    })
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('hotelroom', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var data = response.data;
                        if (data.rescode == '200') {
                            self.hotels = data.data;
                            if(self.hotels.length == 0) {
                              self.noData = true;
                            }
                            else {
                              if($stateParams.hotelId) {
                                $state.go('app.hotelRoom.room', {hotelId: $stateParams.hotelId}) 
                              }  
                              else {
                                $state.go('app.hotelRoom.room', {hotelId: self.hotels[0].ID}) 
                              }
                               
                            }
                        } else if (data.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $location.path("pages/login.html");
                        } else {
                            alert(data.rescode + ' ' + data.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (e) {
                        self.loadingHotelInfo = false;
                    });
                }
            }
        ])

        .controller('roomController', ['$scope', '$http', '$stateParams', '$translate', '$location', 'util', 'NgTableParams',
            function ($scope, $http, $stateParams, $translate, $location, util, NgTableParams) {
                var self = this;
                var lang;

                self.init = function () {
                    lang = util.langStyle();
                    self.defaultLangCode = util.getDefaultLangCode();
                    self.hotelId = $stateParams.hotelId;
                    self.getHotelInfo();
                }
                /**
                 * 获取酒店信息
                 */
                self.getHotelInfo = function () {
                    self.loadingHotelInfo = true;
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
                        var data = response.data;
                        if (data.rescode == '200') {
                            self.hotel = {};
                            self.hotel.Imgs = data.data.Gallery;
                            self.hotel.Tags = data.data.Features;
                            self.hotel.Name = data.data.Name;
                            self.hotel.Address = data.data.Address;
                            self.hotel.Description = data.data.Description;
                            self.hotel.LocationX = data.data.LocationX;
                            self.hotel.LocationY = data.data.LocationY;
                            self.hotel.LogoImg = data.data.LogoURL;
                            self.hotel.CityName = data.data.CityName;
                            self.hotel.AdminPhoneNum = data.data.AdminPhoneNum;
                        } else if (data.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $location.path("pages/login.html");
                        } else {
                            alert('读取信息失败，' + data.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (e) {
                        self.loadingHotelInfo = false;
                    });
                }

                /**
                 * 获取客房列表
                 */
                self.search = function () {

                    var searchName = "";
                    if (self.searchName) {
                        searchName = self.searchName;
                    }
                    var data = JSON.stringify({
                        action: "getAllRoomInfo",
                        token: util.getParams('token'),
                        lang: lang,
                        HotelID: Number(self.hotelId),
                        page: 1,
                        per_page: 10000,
                        bookStartDate: util.getToday(),
                        bookEndDate: util.getTomorrow()
                    })
                    self.loading = true;
                    self.noData = false;

                    return $http({
                        method: 'POST',
                        url: util.getApiUrl('room', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            self.rooms = msg.roomsInfo;
                            // return msg.roomsInfo;
                        } else if (msg.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $location.path("pages/login.html");
                        } else {
                            alert('读取数据出错，' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function () {
                        self.loading = false;
                    });
                }

                self.RAChanged = function (index) {
                    var roomObj = self.rooms[index];
                    if (roomObj.PriceMonday == null || roomObj.PriceTuesday == null || roomObj.PriceWednesday == null
                        || roomObj.PriceThursday == null || roomObj.PriceFriday == null || roomObj.PriceSaturday == null
                        || roomObj.PriceSunday == null || roomObj.AvailableNum == null) {
                        roomObj.RoomAvailable = 0;
                        alert("未设置房间价格或数量，请设好后重试");
                        return false;
                    } else {
                        var roomId = roomObj.ID,
                            roomAvailable = roomObj.RoomAvailable
                        var data = JSON.stringify({
                            action: "setRoomAvailable",
                            token: util.getParams('token'),
                            lang: lang,
                            roomID: roomId,
                            RoomAvailable: roomAvailable == true ? 1 : 0
                        })
                        self.loading = true;

                        $http({
                            method: 'POST',
                            url: util.getApiUrl('room', '', 'server'),
                            data: data
                        }).then(function successCallback(response) {
                            var msg = response.data;
                            if (msg.rescode == '200') {
                            } else if (msg.rescode == '401') {
                                alert('访问超时，请重新登录');
                                $location.path("pages/login.html");
                            } else {
                                alert('操作失败，' + msg.errInfo);
                            }
                        }, function errorCallback(response) {
                            alert(response.status + ' 服务器出错');
                        }).finally(function () {
                            self.loading = false;
                        });
                    }
                }

                self.hotelEdit = function () {
                    $scope.app.maskParams = {'hotelId': self.hotelId, 'hotelInfo': self.hotel};
                    $scope.app.showHideMask(true,'pages/hotelEdit.html');
                }

                self.roomAdd = function () {
                    $scope.app.maskParams = {'hotelId': self.hotelId};
                    $scope.app.showHideMask(true,'pages/roomAdd.html');
                }

                self.roomEdit = function (roomId) {
                    $scope.app.maskParams = {'hotelId': self.hotelId, 'roomId': roomId};
                    $scope.app.showHideMask(true,'pages/roomEdit.html');
                }

                self.roomEditPrice = function (roomId) {
                    $scope.app.maskParams = {'hotelId': self.hotelId, 'roomId': roomId};
                    $scope.app.showHideMask(true,'pages/roomEditPrice.html');
                }

                self.roomEditNum = function (roomId) {
                    $scope.app.maskParams = {'hotelId': self.hotelId, 'roomId': roomId};
                    $scope.app.showHideMask(true,'pages/roomEditNum.html');
                }
            }
        ])

        .controller('hotelEditController', ['$q', '$scope', '$state', '$http', '$stateParams', '$filter', 'util', 'CONFIG',
            function ($q, $scope, $state, $http, $stateParams, $filter, util, CONFIG) {
                console.log('hotelEditController')
                var self = this;
                self.init = function () {
                    self.defaultLangCode = util.getDefaultLangCode();
                    self.hotelId = $scope.app.maskParams.hotelId;
                    if(!$scope.app.maskParams.hotelInfo) {
                        self.getHotelInfo().then(function() {
                            self.init2();
                        })
                    } else{
                        self.hotel = $scope.app.maskParams.hotelInfo;
                        self.init2();
                    }
                    
                }
                self.init2 = function() {
                    self.ifCheckedHotelTags = [];
                    self.editLangs = util.getParams('editLangs');

                    self.initImgs1();
                    self.initImgs2();
                    self.getHotelTags();
                }

                self.getHotelInfo = function () {
                    var deferred = $q.defer();
                    self.loading = true;
                    var data = JSON.stringify({
                        action: "getHotel",
                        token: util.getParams('token'),
                        lang: util.langStyle(),
                        HotelID: Number(self.hotelId)
                    })
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('hotelroom', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var data = response.data;
                        if (data.rescode == '200') {
                            self.hotel = {};
                            self.hotel.Imgs = data.data.Gallery;
                            self.hotel.Tags = data.data.Features;
                            self.hotel.Name = data.data.Name;
                            self.hotel.Address = data.data.Address;
                            self.hotel.Description = data.data.Description;
                            self.hotel.LocationX = data.data.LocationX;
                            self.hotel.LocationY = data.data.LocationY;
                            self.hotel.LogoImg = data.data.LogoURL;
                            self.hotel.CityName = data.data.CityName;
                            self.hotel.AdminPhoneNum = data.data.AdminPhoneNum;
                            self.hotel.TermMainPage = data.data.TermMainPage;
                            deferred.resolve();
                        } else if (data.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $location.path("pages/login.html");
                        } else {
                            alert('读取信息失败，' + data.errInfo);
                            deferred.reject();
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                        deferred.reject();
                    }).finally(function (e) {
                        self.loading = false;
                    });
                    return deferred.promise;
                }

                self.initImgs1 = function () {
                    // 初始化酒店图片多张
                    self.imgs1 = new Imgs(self.hotel.Imgs);
                    self.imgs1.initImgs();
                }

                self.initImgs2 = function () {
                    // 初始化酒店LOGO
                    self.imgs2 = new Imgs([{"ImageURL": self.hotel.LogoImg, "ImageSize": 0}], true);
                    self.imgs2.initImgs();
                }

                self.cancel = function () {
                    $scope.app.showHideMask(false);
                }

                self.save = function () {
                    var imgs = [];
                    for (var i = 0; i < self.imgs1.data.length; i++) {
                        imgs[i] = {};
                        imgs[i].Seq = i;
                        imgs[i].ImageURL = self.imgs1.data[i].src;
                        imgs[i].ImageSize = self.imgs1.data[i].fileSize;
                    }
                    //检查图片未上传
                    if (imgs.length == 0) {
                        alert('请上传酒店图片')
                        return;
                    }
                    //检查logo上传
                    if (self.imgs2.data.length == 0) {
                        alert('请上传酒店LOGO')
                        return;
                    }

                    var tags = [];
                    for (var i = 0; i < self.ifCheckedHotelTags.length; i++) {
                        if (self.ifCheckedHotelTags[i].checked) {
                            tags.push({"ID": self.ifCheckedHotelTags[i].ID});
                        }
                    }
                    self.saving = true;
                    var data = JSON.stringify({
                        action: "editHotel",
                        token: util.getParams('token'),
                        lang: util.langStyle(),
                        HotelID: Number(self.hotelId),
                        data: {
                            "TermMainPage": self.hotel.TermMainPage,
                            "Name": self.hotel.Name,
                            "CityName": self.hotel.CityName,
                            "LocationX": self.hotel.LocationX,
                            "LocationY": self.hotel.LocationY,
                            "LogoURL": self.imgs2.data[0].src,
                            "Features": tags,
                            "TelePhone": null,
                            "Address": self.hotel.Address,
                            "Description": self.hotel.Description,
                            "OfficePhone": null,
                            "AdminPhoneNum": self.hotel.AdminPhoneNum,
                            "Gallery": imgs
                        }
                    })
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('hotelroom', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var data = response.data;
                        if (data.rescode == '200') {
                            alert('修改成功');
                            $state.reload();
                        } else {
                            alert('保存失败' + data.err);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (e) {
                        self.saving = false;
                    });
                }

                self.getHotelTags = function () {
                    self.loading = true;
                    var data = JSON.stringify({
                        action: "getHotelFeatureTag",
                        token: util.getParams('token'),
                        lang: util.langStyle()
                    })
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('hotelroom', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var data = response.data;
                        if (data.rescode == '200') {
                            console && console.log(data.data);
                            self.hotelTags = data.data;
                            self.initIfCheckedHotelTags();
                        } else {
                            alert('读取酒店标签出错' + data.rescode + ' ' + data.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (e) {
                        self.loading = false;
                    });
                }

                self.initIfCheckedHotelTags = function () {
                    for (var i = 0; i < self.hotelTags.length; i++) {
                        self.ifCheckedHotelTags[i] = {};
                        self.ifCheckedHotelTags[i].checked = false;
                        self.ifCheckedHotelTags[i].ID = self.hotelTags[i].ID;
                        for (var j = 0; j < self.hotel.Tags.length; j++) {
                            if (self.hotel.Tags[j].ID == self.hotelTags[i].ID) {
                                self.ifCheckedHotelTags[i].checked = true;
                                break;
                            }
                        }
                    }
                }

                self.clickUpload = function (e) {
                    setTimeout(function () {
                        document.getElementById(e).click();
                    }, 0);
                }

                function Imgs(imgList, single) {
                    this.initImgList = imgList;
                    this.data = [];
                    this.maxId = 0;
                    this.single = single ? true : false;
                }

                Imgs.prototype = {
                    initImgs: function () {
                        var l = this.initImgList;
                        for (var i = 0; i < l.length; i++) {
                            this.data[i] = {
                                "src": l[i].ImageURL,
                                "fileSize": l[i].ImageSize,
                                "id": this.maxId++,
                                "progress": 100
                            };
                        }
                    },
                    deleteById: function (id) {
                        var l = this.data;
                        for (var i = 0; i < l.length; i++) {
                            if (l[i].id == id) {
                                // 如果正在上传，取消上传
                                if (l[i].progress < 100 && l[i].progress != -1) {
                                    l[i].xhr.abort();
                                }
                                l.splice(i, 1);
                                break;
                            }
                        }
                    },

                    add: function (xhr, fileName, fileSize) {
                        this.data.push({
                            "xhr": xhr,
                            "fileName": fileName,
                            "fileSize": fileSize,
                            "progress": 0,
                            "id": this.maxId
                        });
                        return this.maxId++;
                    },

                    update: function (id, progress, leftSize, fileSize) {
                        for (var i = 0; i < this.data.length; i++) {
                            var f = this.data[i];
                            if (f.id === id) {
                                f.progress = progress;
                                f.leftSize = leftSize;
                                f.fileSize = fileSize;
                                break;
                            }
                        }
                    },

                    setSrcSizeByXhr: function (xhr, src, size) {
                        for (var i = 0; i < this.data.length; i++) {
                            if (this.data[i].xhr == xhr) {
                                this.data[i].src = src;
                                this.data[i].fileSize = size;
                                break;
                            }
                        }
                    },

                    uploadFile: function (e, o) {

                        // 如果这个对象只允许上传一张图片
                        if (this.single) {
                            // 删除第二张以后的图片
                            for (var i = 1; i < this.data.length; i++) {
                                this.deleteById(this.data[i].id);
                            }
                        }

                        var file = $scope[e];
                        var uploadUrl = CONFIG.uploadUrl;
                        var xhr = new XMLHttpRequest();
                        var fileId = this.add(xhr, file.name, file.size, xhr);
                        // self.search();

                        util.uploadFileToUrl(xhr, file, uploadUrl, 'normal',
                            function (evt) {
                                $scope.$apply(function () {
                                    if (evt.lengthComputable) {
                                        var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                                        o.update(fileId, percentComplete, evt.total - evt.loaded, evt.total);
                                        console.log(percentComplete);
                                    }
                                });
                            },
                            function (xhr) {
                                var ret = JSON.parse(xhr.responseText);
                                console && console.log(ret);
                                $scope.$apply(function () {
                                    o.setSrcSizeByXhr(xhr, ret.upload_path, ret.size);
                                    // 如果这个对象只允许上传一张图片
                                    if (o.single) {
                                        // 删除第一站图片
                                        o.deleteById(o.data[0].id);
                                    }
                                });
                            },
                            function (xhr) {
                                $scope.$apply(function () {
                                    o.update(fileId, -1, '', '');
                                });
                                console.log('failure');
                                xhr.abort();
                            }
                        );
                    }
                }
            }
        ])

        .controller('roomAddController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'util', 'CONFIG',
            function ($scope, $state, $http, $stateParams, $filter, util, CONFIG) {
                var self = this;

                self.init = function () {
                    self.hotelId = $scope.app.maskParams.hotelId;
                    self.room = {};
                    self.editLangs = util.getParams('editLangs');
                    self.defaultLangCode = util.getDefaultLangCode();
                    self.getRoomTags();
                    self.ifCheckedTags = [];
                    self.imgs = new Imgs([]);
                }
                self.cancel = function () {
                    $scope.app.showHideMask(false);
                }

                /**
                 * 获取客房标签
                 */
                self.getRoomTags = function () {
                    self.loading = true;
                    var data = JSON.stringify({
                        action: "getRoomTags",
                        token: util.getParams('token'),
                        lang: util.langStyle()
                    })
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('room', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var data = response.data;
                        if (data.rescode == '200') {
                            self.tags = data.tags;
                            for (var i = 0; i < self.tags.length; i++) {
                                self.ifCheckedTags[i] = {};
                                self.ifCheckedTags[i].ID = self.tags[i].ID;
                                self.ifCheckedTags[i].checked = false;
                            }
                        } else {
                            alert('读取标签失败' + data.rescode + ' ' + data.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (e) {
                        self.loading = false;
                    });
                }
                /**
                 * 保存
                 */
                self.save = function () {
                    var tags = [];
                    for (var i = 0; i < self.ifCheckedTags.length; i++) {
                        if (self.ifCheckedTags[i].checked) {
                            tags.push(self.ifCheckedTags[i].ID);
                        }
                    }
                    var imgs = [];
                    for (var i = 0; i < self.imgs.data.length; i++) {
                        imgs.push(
                            {
                                "Seq": i,
                                "ImageURL": self.imgs.data[i].src,
                                "ImageSize": self.imgs.data[i].fileSize
                            }
                        );
                    }

                    if (imgs.length == 0) {
                        alert('请上传图片')
                        return;
                    }

                    self.saving = true;
                    var data = JSON.stringify({
                        action: "addRoom",
                        token: util.getParams('token'),
                        lang: util.langStyle(),
                        tags: tags,
                        IntroImgs: imgs,
                        roomDetail: {
                            HotelID: self.hotelId,
                            Description: self.room.Description,
                            RoomTypeName: self.room.RoomTypeName,
                            // Roomsummary: self.room.Roomsummary
                            Roomsummary: ""
                        }
                    })

                    $http({
                        method: 'POST',
                        url: util.getApiUrl('room', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var data = response.data;
                        if (data.rescode == '200') {
                            alert('添加成功')
                            $state.reload('app.hotelRoom.room');
                            self.cancel();
                        } else {
                            alert('添加失败' + data.rescode + ' ' + data.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (e) {
                        self.saving = false;
                    });
                };

                self.clickUpload = function (e) {
                    setTimeout(function () {
                        document.getElementById(e).click();
                    }, 0);
                }

                function Imgs(imgList, single) {
                    this.initImgList = imgList;
                    this.data = [];
                    this.maxId = 0;
                    this.single = single ? true : false;
                }

                Imgs.prototype = {
                    initImgs: function () {
                        var l = this.initImgList;
                        for (var i = 0; i < l.length; i++) {
                            this.data[i] = {
                                "src": l[i].ImageURL,
                                "fileSize": l[i].ImageSize,
                                "id": this.maxId++,
                                "progress": 100
                            };
                        }
                    },
                    deleteById: function (id) {
                        var l = this.data;
                        for (var i = 0; i < l.length; i++) {
                            if (l[i].id == id) {
                                // 如果正在上传，取消上传
                                if (l[i].progress < 100 && l[i].progress != -1) {
                                    l[i].xhr.abort();
                                }
                                l.splice(i, 1);
                                break;
                            }
                        }
                    },

                    add: function (xhr, fileName, fileSize) {
                        this.data.push({
                            "xhr": xhr,
                            "fileName": fileName,
                            "fileSize": fileSize,
                            "progress": 0,
                            "id": this.maxId
                        });
                        return this.maxId++;
                    },

                    update: function (id, progress, leftSize, fileSize) {
                        for (var i = 0; i < this.data.length; i++) {
                            var f = this.data[i];
                            if (f.id === id) {
                                f.progress = progress;
                                f.leftSize = leftSize;
                                f.fileSize = fileSize;
                                break;
                            }
                        }
                    },

                    setSrcSizeByXhr: function (xhr, src, size) {
                        for (var i = 0; i < this.data.length; i++) {
                            if (this.data[i].xhr == xhr) {
                                this.data[i].src = src;
                                this.data[i].fileSize = size;
                                break;
                            }
                        }
                    },

                    uploadFile: function (e, o) {

                        // 如果这个对象只允许上传一张图片
                        if (this.single) {
                            // 删除第二张以后的图片
                            for (var i = 1; i < this.data.length; i++) {
                                this.deleteById(this.data[i].id);
                            }
                        }

                        var file = $scope[e];
                        var uploadUrl = CONFIG.uploadUrl;
                        var xhr = new XMLHttpRequest();
                        var fileId = this.add(xhr, file.name, file.size, xhr);
                        // self.search();

                        util.uploadFileToUrl(xhr, file, uploadUrl, 'normal',
                            function (evt) {
                                $scope.$apply(function () {
                                    if (evt.lengthComputable) {
                                        var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                                        o.update(fileId, percentComplete, evt.total - evt.loaded, evt.total);
                                        console.log(percentComplete);
                                    }
                                });
                            },
                            function (xhr) {
                                var ret = JSON.parse(xhr.responseText);
                                console && console.log(ret);
                                $scope.$apply(function () {
                                    o.setSrcSizeByXhr(xhr, ret.upload_path, ret.size);
                                    // 如果这个对象只允许上传一张图片
                                    if (o.single) {
                                        // 删除第一站图片
                                        o.deleteById(o.data[0].id);
                                    }
                                });
                            },
                            function (xhr) {
                                $scope.$apply(function () {
                                    o.update(fileId, -1, '', '');
                                });
                                console.log('failure');
                                xhr.abort();
                            }
                        );
                    }
                }
            }
        ])

        .controller('roomEditController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'util', 'CONFIG',
            function ($scope, $state, $http, $stateParams, $filter, util, CONFIG) {
                var self = this;
                self.alerts = [];
                self.init = function () {
                    self.hotelId = $scope.app.maskParams.hotelId;
                    self.roomId = $scope.app.maskParams.roomId;
                    self.room = {};
                    self.editLangs = util.getParams('editLangs');
                    self.defaultLangCode = util.getDefaultLangCode();
                    self.ifCheckedTags = [];
                    self.getRoomTags();
                }
                self.cancel = function () {
                    $scope.app.showHideMask(false);
                }

                /**
                 * 添加alert
                 * @param msg {String} 提示信息
                 * @param reload {Boolean} 是否重载
                 * @param type {String} alert类型
                 */
                self.addAlert = function(msg, reload, type) {
                    self.alerts.push({type: type, msg: msg, reload: reload});
                };
                /**
                 * 移除alert
                 * @param index 位置
                 * @param reload {Boolean} 是否重载
                 */
                self.closeAlert = function(index, reload) {
                    self.alerts.splice(index, 1);
                    if (reload) {
                        $state.reload();
                    }
                };

                /**
                 * 获取客房标签
                 */
                self.getRoomTags = function () {
                    self.loading = true;
                    var data = JSON.stringify({
                        action: "getRoomTags",
                        token: util.getParams('token'),
                        lang: util.langStyle()
                    })
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('room', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var data = response.data;
                        if (data.rescode == '200') {
                            self.tags = data.tags;
                            for (var i = 0; i < self.tags.length; i++) {
                                self.ifCheckedTags[i] = {};
                                self.ifCheckedTags[i].ID = self.tags[i].ID;
                                self.ifCheckedTags[i].checked = false;
                            }
                            // 读取客房信息
                            self.getRoomInfo();
                        } else {
                            // alert('读取标签失败' + data.rescode + ' ' + data.errInfo);
                            self.addAlert('读取标签失败' + data.rescode + ' ' + data.errInfo, false, 'warning');
                        }
                    }, function errorCallback(response) {
                        // alert(response.status + ' 服务器出错');
                        self.addAlert(response.status + ' 服务器出错', false, 'warning');
                    }).finally(function (e) {
                        self.loading = false;
                    });
                }

                self.getRoomInfo = function () {
                    self.loading = true;
                    var data = JSON.stringify({
                        action: "getRoomInfoByID",
                        token: util.getParams('token'),
                        lang: util.langStyle(),
                        roomID: self.roomId,
                        bookStartDate: util.getToday(),
                        bookEndDate: util.getTomorrow()
                    })

                    $http({
                        method: 'POST',
                        url: util.getApiUrl('room', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var data = response.data;
                        // console.log(data);
                        if (data.rescode == '200') {
                            self.room.RoomTypeName = data.RoomTypeName;
                            self.room.Roomsummary = data.Roomsummary;
                            self.room.Description = data.Description;
                            for (var i = 0; i < self.ifCheckedTags.length; i++) {
                                for (var j = 0; j < data.tags.length; j++) {
                                    if (self.ifCheckedTags[i].ID == data.tags[j].ID) {
                                        self.ifCheckedTags[i].checked = true;
                                    }
                                }
                            }
                            self.imgs = new Imgs(data.imgs);
                            self.imgs.initImgs();

                        } else {
                            // alert('读取客房信息失败' + data.rescode + ' ' + data.errInfo);
                            self.addAlert('读取客房信息失败' + data.rescode + ' ' + data.errInfo, false, 'warning');
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (e) {
                        self.loading = false;
                    });
                }
                
                self.deleteRoom = function () {
                    if (confirm("确定要此客房吗？")) {
                        var data = JSON.stringify({
                            action: "delRooms",
                            token: util.getParams('token'),
                            lang: util.langStyle(),
                            roomList: [self.roomId],

                        })
                        $http({
                            method: 'POST',
                            url: util.getApiUrl('room', '', 'server'),
                            data: data
                        }).then(function successCallback(response) {
                            var data = response.data;
                            if (data.rescode == '200') {
                                self.addAlert('删除成功', true, 'success');
                                // alert('删除成功')
                                // $state.reload();
                            } else {
                                // alert('删除失败' + data.rescode + ' ' + data.errInfo);
                                self.addAlert('删除失败' + data.rescode + ' ' + data.errInfo, false, 'warning');
                            }
                        }, function errorCallback(response) {
                            // alert(response.status + ' 服务器出错');
                            self.addAlert(response.status + ' 服务器出错', false, 'warning');
                        }).finally(function (e) {
                            self.saving = false;
                        });
                    }
                }

                /**
                 * 保存
                 */
                self.save = function () {
                    var tags = [];
                    for (var i = 0; i < self.ifCheckedTags.length; i++) {
                        if (self.ifCheckedTags[i].checked) {
                            tags.push(self.ifCheckedTags[i].ID);
                        }
                    }
                    var imgs = [];
                    for (var i = 0; i < self.imgs.data.length; i++) {
                        imgs.push(
                            {
                                "Seq": i,
                                "ImageURL": self.imgs.data[i].src,
                                "ImageSize": self.imgs.data[i].fileSize
                            }
                        );
                    }

                    if (imgs.length == 0) {
                        // alert('请上传图片')
                        self.addAlert(' 请上传图片', false, 'warning');
                        return;
                    }

                    self.saving = true;
                    var data = JSON.stringify({
                        action: "updateRoom",
                        token: util.getParams('token'),
                        lang: util.langStyle(),
                        roomID: self.roomId,
                        tags: tags,
                        IntroImgs: imgs,
                        roomDetail: {
                            "HotelID": self.hotelId,
                            "Description": self.room.Description,
                            "RoomTypeName": self.room.RoomTypeName
                        }
                    })
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('room', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var data = response.data;
                        if (data.rescode == '200') {
                            // self.addAlert('保存成功', true, 'success');
                            alert('保存成功')
                            $state.reload();
                        } else {
                            alert('保存失败，' + data.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                        // self.addAlert(response.status + ' 服务器出错', false, 'danger');
                    }).finally(function (e) {
                        self.saving = false;
                    });
                };

                self.clickUpload = function (e) {
                    setTimeout(function () {
                        document.getElementById(e).click();
                    }, 0);
                }

                function Imgs(imgList, single) {
                    this.initImgList = imgList;
                    this.data = [];
                    this.maxId = 0;
                    this.single = single ? true : false;
                }

                Imgs.prototype = {
                    initImgs: function () {
                        var l = this.initImgList;
                        for (var i = 0; i < l.length; i++) {
                            this.data[i] = {
                                "src": l[i].ImageURL,
                                "fileSize": l[i].ImageSize,
                                "id": this.maxId++,
                                "progress": 100
                            };
                        }
                    },
                    deleteById: function (id) {
                        var l = this.data;
                        for (var i = 0; i < l.length; i++) {
                            if (l[i].id == id) {
                                // 如果正在上传，取消上传
                                if (l[i].progress < 100 && l[i].progress != -1) {
                                    l[i].xhr.abort();
                                }
                                l.splice(i, 1);
                                break;
                            }
                        }
                    },

                    add: function (xhr, fileName, fileSize) {
                        this.data.push({
                            "xhr": xhr,
                            "fileName": fileName,
                            "fileSize": fileSize,
                            "progress": 0,
                            "id": this.maxId
                        });
                        return this.maxId++;
                    },

                    update: function (id, progress, leftSize, fileSize) {
                        for (var i = 0; i < this.data.length; i++) {
                            var f = this.data[i];
                            if (f.id === id) {
                                f.progress = progress;
                                f.leftSize = leftSize;
                                f.fileSize = fileSize;
                                break;
                            }
                        }
                    },

                    setSrcSizeByXhr: function (xhr, src, size) {
                        for (var i = 0; i < this.data.length; i++) {
                            if (this.data[i].xhr == xhr) {
                                this.data[i].src = src;
                                this.data[i].fileSize = size;
                                break;
                            }
                        }
                    },

                    uploadFile: function (e, o) {

                        // 如果这个对象只允许上传一张图片
                        if (this.single) {
                            // 删除第二张以后的图片
                            for (var i = 1; i < this.data.length; i++) {
                                this.deleteById(this.data[i].id);
                            }
                        }

                        var file = $scope[e];
                        var uploadUrl = CONFIG.uploadUrl;
                        var xhr = new XMLHttpRequest();
                        var fileId = this.add(xhr, file.name, file.size, xhr);
                        // self.search();

                        util.uploadFileToUrl(xhr, file, uploadUrl, 'normal',
                            function (evt) {
                                $scope.$apply(function () {
                                    if (evt.lengthComputable) {
                                        var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                                        o.update(fileId, percentComplete, evt.total - evt.loaded, evt.total);
                                        console.log(percentComplete);
                                    }
                                });
                            },
                            function (xhr) {
                                var ret = JSON.parse(xhr.responseText);
                                console && console.log(ret);
                                $scope.$apply(function () {
                                    o.setSrcSizeByXhr(xhr, ret.upload_path, ret.size);
                                    // 如果这个对象只允许上传一张图片
                                    if (o.single) {
                                        // 删除第一站图片
                                        o.deleteById(o.data[0].id);
                                    }
                                });
                            },
                            function (xhr) {
                                $scope.$apply(function () {
                                    o.update(fileId, -1, '', '');
                                });
                                console.log('failure');
                                xhr.abort();
                            }
                        );
                    }
                }
            }
        ])

        .controller('roomEditPriceController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
            function ($scope, $state, $http, $stateParams, $location, util) {
                var self = this;
                var lang,
                    token;
                self.init = function () {
                    self.hotelId = $scope.app.maskParams.hotelId;
                    self.roomId = $scope.app.maskParams.roomId;
                    lang = util.langStyle();
                    token = util.getParams('token');
                    self.SpecialPrice = [];
                    self.roomDetail = [];
                    self.load();
                }

                self.cancel = function () {
                    $scope.app.showHideMask(false);
                }

                /**
                 * datepiker
                 */
                self.today = function ($index) {
                    self.SpecialPrice[$index].PriceDate = new Date();
                };
                self.open = function ($index) {
                    self.SpecialPrice[$index].Opened = true;
                };

                /**
                 * 添加临时设置
                 */
                self.addTemporary = function ($index) {
                    self.SpecialPrice.splice($index, 0, {
                        RoomID: self.roomId,
                        PriceDate: new Date(),
                        Price: 0,
                        PriceType: "basic",
                        Opened: false
                    });
                }

                /**
                 * 删除临时设置
                 */
                self.deleteTemporary = function ($index) {
                    self.SpecialPrice.splice($index, 1);
                }

                /**
                 * 载入价格信息
                 */
                self.load = function () {
                    var data = JSON.stringify({
                        action: "getRoomInfoByID",
                        lang: lang,
                        token: token,
                        roomID: self.roomId,
                        bookStartDate: util.getToday(),
                        bookEndDate: util.getTomorrow()
                    })
                    self.loading = true;
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('room', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            self.roomDetail.PriceMonday = msg.PriceMonday / 100;
                            self.roomDetail.PriceTuesday = msg.PriceTuesday / 100;
                            self.roomDetail.PriceWednesday = msg.PriceWednesday / 100;
                            self.roomDetail.PriceThursday = msg.PriceThursday / 100;
                            self.roomDetail.PriceFriday = msg.PriceFriday / 100;
                            self.roomDetail.PriceSaturday = msg.PriceSaturday / 100;
                            self.roomDetail.PriceSunday = msg.PriceSunday / 100;
                            for (var i = 0; i < msg.SpecialPrice.length; i++) {
                                msg.SpecialPrice[i].PriceDate = new Date(msg.SpecialPrice[i].PriceDate);
                                msg.SpecialPrice[i].Price = msg.SpecialPrice[i].Price / 100;
                            }
                            self.SpecialPrice = msg.SpecialPrice;
                        } else if (msg.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $location.path("pages/login.html");
                        } else {
                            alert('读取价格信息失败，' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (e) {
                            self.loading = false;
                        }
                    );
                }

                /**
                 * 保存价格信息
                 */
                self.save = function () {
                    self.saving = true;
                    var specialPrice = [];
                    for (var i = 0; i < self.SpecialPrice.length; i++) {
                        specialPrice.push({
                            RoomID: self.roomId.toString(),
                            PriceDate: util.format_yyyyMMdd(self.SpecialPrice[i].PriceDate),
                            Price: Number(self.SpecialPrice[i].Price) * 100,
                            PriceType: "basic"
                        })
                    }
                    if(!countJson(specialPrice, 'PriceDate')) {
                        alert('同一天不能重复设置');
                        self.saving = false;
                        return false;
                    }
                    var data = JSON.stringify({
                        action: "setRoomPrice",
                        lang: lang,
                        token: token,
                        roomID: self.roomId,
                        SpecialPrice: specialPrice,
                        roomDetail: {
                            PriceMonday: Number(self.roomDetail.PriceMonday) * 100,
                            PriceTuesday: Number(self.roomDetail.PriceTuesday) * 100,
                            PriceWednesday: Number(self.roomDetail.PriceWednesday) * 100,
                            PriceThursday: Number(self.roomDetail.PriceThursday) * 100,
                            PriceFriday: Number(self.roomDetail.PriceFriday) * 100,
                            PriceSaturday: Number(self.roomDetail.PriceSaturday) * 100,
                            PriceSunday: Number(self.roomDetail.PriceSunday) * 100
                        }
                    })
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('room', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            alert('保存成功');
                            $state.reload();
                        } else if (msg.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $location.path("pages/login.html");
                        } else {
                            alert('保存失败，' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (e) {
                        self.saving = false;
                    });
                }

                /**
                 * 判断json是否的值是否重复
                 * @param json
                 * @param key
                 * @returns {boolean}
                 */
                function countJson(json, key) {
                    if (json.length == 0) {
                        return true;
                    }
                    var len = json.length, result = new Array();
                    for (var i = 0; i < len; i++) {
                        var k = json[i][key];
                        if (result[k]) {
                            result[k] = result[k] + 1;
                            if (result[k] > 1) {
                                return false;
                            }
                        } else {
                            result[k] = 1;
                        }
                    }
                    return true;
                }
            }
        ])

        .controller('roomEditNumController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
            function ($scope, $state, $http, $stateParams, $location, util) {
                var self = this;
                var lang,
                    token;
                self.init = function () {
                    self.delAvailableDate = [];
                    self.hotelId = $scope.app.maskParams.hotelId;
                    self.roomId = $scope.app.maskParams.roomId;
                    lang = util.langStyle();
                    token = util.getParams('token');
                    self.SpecialNum = [];
                    self.roomDetail = [];
                    self.load();
                }

                self.cancel = function () {
                    $scope.app.showHideMask(false);
                }

                /**
                 * datepiker
                 */
                self.today = function ($index) {
                    self.SpecialNum[$index].PriceDate = new Date();
                };
                self.open = function ($index) {
                    self.SpecialNum[$index].Opened = true;
                };

                /**
                 * 添加临时设置
                 */
                self.addTemporary = function ($index) {
                    self.SpecialNum.splice($index, 0, {
                        RoomID: self.roomId,
                        AvailableDate: new Date(),
                        AvailableNumCurrent: 0,
                        AvailableNumSet: 999,
                        Opened: false
                    });
                }

                /**
                 * 删除临时设置
                 */
                self.deleteTemporary = function ($index, AvailableDate) {
                    self.SpecialNum.splice($index, 1);
                    self.delAvailableDate.push(AvailableDate);
                }

                /**
                 * 载入客房数量信息
                 */
                self.load = function () {
                    var data = JSON.stringify({
                        action: "getRoomInfoByID",
                        lang: lang,
                        token: token,
                        roomID: self.roomId,
                        bookStartDate: util.getToday(),
                        bookEndDate: util.getTomorrow()
                    })
                    self.loading = true;
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('room', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            self.roomDetail.AvailableNum = msg.AvailableNum;
                            for (var i = 0; i < msg.SpecialNum.length; i++) {
                                msg.SpecialNum[i].AvailableDate = new Date(msg.SpecialNum[i].AvailableDate);
                                msg.SpecialNum[i].disable = true;
                            }
                            self.SpecialNum = msg.SpecialNum;
                        } else if (msg.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $location.path("pages/login.html");
                        } else {
                            alert('读取数量信息失败，' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (e) {
                            self.loading = false;
                        }
                    );
                }

                /**
                 * 保存客房数量信息
                 */
                self.save = function () {
                    self.saving = true;
                    var availableInfo = [];
                    for (var i = 0; i < self.SpecialNum.length; i++) {
                        availableInfo.push({
                            RoomID: self.roomId.toString(),
                            AvailableDate: util.format_yyyyMMdd(self.SpecialNum[i].AvailableDate),
                            AvailableNumCurrent: Number(self.SpecialNum[i].AvailableNumCurrent),
                            AvailableNumSet: Number(self.SpecialNum[i].AvailableNumCurrent)
                        })
                    }
                    if(!countJson(availableInfo, 'AvailableDate')) {
                        alert('同一天不能重复设置');
                        self.saving = false;
                        return false;
                    }
                    var data = JSON.stringify({
                        action: "setRoomNum",
                        lang: lang,
                        token: token,
                        roomID: self.roomId,
                        AvailableInfo: availableInfo,
                        roomDetail: {
                            AvailableNum: Number(self.roomDetail.AvailableNum),
                        }
                    })
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('room', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                              alert('保存成功');
                              $state.reload(); 
                        } else if (msg.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $location.path("pages/login.html");
                        } else {
                            alert('保存失败，' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (e) {
                        self.saving = false;
                    })
                    ;
                }

                /**
                 * 删除客房数量信息
                 */
                self.deleteDate = function () {
                    if(self.delAvailableDate.length == 0) {
                        self.save();
                        return;
                    }
                    self.saving = true;
                    var dellist = [];
                    for(var i = 0; i < self.delAvailableDate.length; i++) {
                        dellist[i] = {};
                        dellist[i].RoomID = self.roomId + "";
                        dellist[i].AvailableDate = self.delAvailableDate[i];
                    }
                    
                    
                    var data = JSON.stringify({
                        action: "delRoomNum",
                        lang: lang,
                        token: token,
                        roomID: self.roomId,
                        dellist: dellist
                    })
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('room', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                              self.save();
                        } else if (msg.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $location.path("pages/login.html");
                        } else {
                            alert('保存失败，' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (e) {
                        self.saving = false;
                    })
                    ;
                }

                /**
                 * 判断json是否的值是否重复
                 * @param json
                 * @param key
                 * @returns {boolean}
                 */
                function countJson(json, key) {
                    if (json.length == 0) {
                        return true;
                    }
                    var len = json.length, result = new Array();
                    for (var i = 0; i < len; i++) {
                        var k = json[i][key];
                        if (result[k]) {
                            result[k] = result[k] + 1;
                            if (result[k] > 1) {
                                return false;
                            }
                        } else {
                            result[k] = 1;
                        }
                    }
                    return true;
                }
            }
        ])


})();
