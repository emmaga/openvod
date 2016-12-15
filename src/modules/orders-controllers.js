'use strict';

(function () {
    var app = angular.module('app.orders-controllers', [])

    // 酒店订单列表页
    .controller('hotelOrderListController', ['$scope', '$filter', '$q', '$state', '$http', '$stateParams', 'NgTableParams', 'util',
        function ($scope, $filter, $q, $state, $http, $stateParams, NgTableParams, util) {
            var self = this;
            
            self.init = function() {
                self.defaultLangCode = util.getDefaultLangCode();
                self.searchStr = {};

                // 初始化订单状态
                $scope.status = [
                    {'code': '', active: true, 'name': {'zh-CN': '全部'}},
                    {'code': 'WAITPAY', active: false, 'name': {'zh-CN': '待付款'}},
                    {'code': 'WAITAPPROVAL', active: false, 'name': {'zh-CN': '待审核'}},
                    {'code': 'ACCEPT', active: false, 'name': {'zh-CN': '待入住'}},
                    {'code': 'COMPLETED', active: false, 'name': {'zh-CN': '订单完成'}},
                    {'code': 'REFUNDING', active: false, 'name': {'zh-CN': '退款中'}},
                    {'code': 'CANCELED', active: false, 'name': {'zh-CN': '已取消'}}
                ];
                self.searchStr.status = '';

                self.loadShopList().then(function() {
                    self.search();
                });
            }

            self.getSelectedHotel = function() {
                var ret = {};
                if($scope.shopList) {
                    for(var i =0; i< $scope.shopList.length;i++){
                        if($scope.shopList[i].active) {
                            ret = $scope.shopList[i]; 
                            break;
                        }
                    }
                }
                return ret;
            };

            self.accept = function(id) {
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "OrderApproval",
                    "lang": util.langStyle(),
                    "OrderID": id,
                    "status": "ACCEPT"
                })
                
                $http({
                    method: 'POST',
                    url: util.getApiUrl('order', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        alert('审核成功');
                        self.search();
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('审核失败' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function (value) {
                    
                });

                alert('命令已发送，请稍后');
            }

            self.reject = function(id) {
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "OrderApproval",
                    "lang": util.langStyle(),
                    "OrderID": id,
                    "status": "DECLINE"
                })
                
                $http({
                    method: 'POST',
                    url: util.getApiUrl('order', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        alert('审核成功');
                        self.search();
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('审核失败' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function (value) {
                    
                });

                alert('命令已发送，请稍后');
            }

            self.finish = function(id) {
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "orderCompleted",
                    "lang": util.langStyle(),
                    "OrderID": id
                })
                
                $http({
                    method: 'POST',
                    url: util.getApiUrl('order', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        alert('操作已成功');
                        self.search();
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('操作失败' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function (value) {
                    
                });
            }

            self.cancel = function(id) {
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "adminCancelOrder",
                    "lang": util.langStyle(),
                    "OrderID": id
                })
                
                $http({
                    method: 'POST',
                    url: util.getApiUrl('order', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        alert('操作已成功');
                        self.search();
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('操作失败' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function (value) {
                    
                });
            }

            self.searchByStatus = function(statusCode) {
                for(var i =0; i< $scope.status.length;i++){
                    if($scope.status[i].code==statusCode) {
                        $scope.status[i].active=true;
                        self.searchStr.status = statusCode;
                    }
                    else {
                        $scope.status[i].active=false;
                    }
                }
                self.search();
            }

            self.searchByShop = function(shopId) {
                for(var i =0; i< $scope.shopList.length;i++){
                    if($scope.shopList[i].ID==shopId) {
                        $scope.shopList[i].active=true;
                        self.searchStr.shopId = shopId;
                    }
                    else {
                        $scope.shopList[i].active=false;
                    }
                }
                self.search();
            }

            self.loadShopList = function() {
                var deferred = $q.defer();
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "getHotelList",
                    "lang": util.langStyle()
                })
                self.loadingShopList = true;
                $http({
                    method: 'POST',
                    url: util.getApiUrl('hotelroom', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        $scope.shopList = data.data;
                        var shopListNameAll = {'zh-CN':'全部','en-US':'All'};
                        for(var i =0; i < $scope.shopList.length;i++){
                            $scope.shopList[i].active = false;
                        }
                        $scope.shopList.unshift({
                            "ID": 0,
                            "Name": shopListNameAll,
                            "active": true
                        });
                        self.searchStr.shopId = 0;
                        deferred.resolve();
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('获取门店列表信息失败，' + data.errInfo);
                        deferred.reject();
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                    deferred.reject();
                }).finally(function (value) {
                    self.loadingShopList = false;
                });
                return deferred.promise;
            }

            self.search = function() {
                self.tableParams = new NgTableParams(
                    {
                      page: 1, 
                      count: 15,
                      url: ''
                    }, 
                    {
                      counts: false,
                      getData: function(params) {
                        var paramsUrl = params.url();
                        
                        var data = JSON.stringify({
                            "token": util.getParams('token'),
                            "action": "getRoomOrderByStatus",
                            "lang": util.langStyle(),
                            "HotelID": self.searchStr.shopId,
                            "ContactorPhone": self.searchStr.userPhone,
                            "Status": self.searchStr.status,
                            "ContactorName": self.searchStr.userName,
                            "OrderNum": self.searchStr.orderNumber,
                            "page": paramsUrl.page - 0,
                            "per_page": paramsUrl.count - 0
                        });
                        self.loading = true;
                        self.noData = false;
                        
                        return $http({
                            method: 'POST',
                            url: util.getApiUrl('order', '', 'server'),
                            data: data
                        }).then(function successCallback(response) {
                            var data = response.data;
                            if (data.rescode == '200') {
                                if(data.total == 0) {
                                    self.noData = true;
                                }
                                params.total(data.total);
                                return data.resault;
                            } else if(data.rescode == '401'){
                                alert('访问超时，请重新登录');
                                $state.go('login');
                            } else{
                                alert('获取客房预订订单列表失败，' + data.errInfo);
                            }
                        }, function errorCallback(response) {
                            alert('连接服务器出错');
                        }).finally(function (value) {
                            self.loading = false;
                        });
                      }
                    }
                );
            }

            self.gotoDetail = function(orderInfo) {
                $scope.app.maskParams = {'orderInfo': orderInfo};
                $scope.app.showHideMask(true,'pages/orders/hotelOrderDetail.html');
            }
        }
    ])

    .controller('hotelOrderDetailController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            var self = this;
            
            self.init = function() {
                self.orderInfo = $scope.app.maskParams.orderInfo;
                self.id = self.orderInfo.OrderID;
                self.getInfo();
            }

            self.close = function() {
                $scope.app.showHideMask(false);
            }

            self.getInfo = function() {
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "getOperateLog",
                    "lang": util.langStyle(),
                    "OrderID": self.id
                })

                self.loading = true;

                $http({
                    method: 'POST',
                    url: util.getApiUrl('order', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        self.list = data.operatelogs;
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('获取信息失败' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function (value) {
                    self.loading = false;
                });
            }
        }
    ])

    .controller('shopOrderListController', ['$scope', '$filter', '$q', '$state', '$http', '$stateParams', '$location', 'NgTableParams', 'util', 'CONFIG',
        function ($scope, $filter, $q, $state, $http, $stateParams, $location, NgTableParams, util, CONFIG) {
            var self = this;
            
            var self = this;
                        
            self.init = function() {
                self.defaultLangCode = util.getDefaultLangCode();
                self.searchStr = {};

                // 初始化订单状态
                $scope.status = [
                    {'code': '', active: true, 'name': {'zh-CN': '全部'}},
                    {'code': 'WAITPAY', active: false, 'name': {'zh-CN': '待付款'}},
                    {'code': 'WAITAPPROVAL', active: false, 'name': {'zh-CN': '待审核'}},
                    {'code': 'ACCEPT', active: false, 'name': {'zh-CN': '待发货'}},
                    {'code': 'DELIVERING', active: false, 'name': {'zh-CN': '待收货'}},
                    {'code': 'COMPLETED', active: false, 'name': {'zh-CN': '订单完成'}},
                    {'code': 'REFUNDING', active: false, 'name': {'zh-CN': '退款中'}},
                    {'code': 'CANCELED', active: false, 'name': {'zh-CN': '已取消'}}
                ];
                self.searchStr.status = '';

                self.loadShopList().then(function() {
                    self.search();
                });
            }

            self.getSelectedShop = function() {
                var ret = {};
                if($scope.shopList) {
                    for(var i =0; i< $scope.shopList.length;i++){
                        if($scope.shopList[i].active) {
                            ret = $scope.shopList[i]; 
                            break;
                        }
                    }
                }
                return ret;
            };

            self.deliver = function(id) {
                $scope.app.maskParams = {'orderId': id, 'search': self.search};
                $scope.app.showHideMask(true,'pages/orders/shopOrderDeliver.html');
            }

            self.editDeliverInfo = function(info) {
                $scope.app.maskParams = {'orderInfo': info, 'search': self.search};
                $scope.app.showHideMask(true,'pages/orders/editShopOrderDeliver.html');
            }

            self.accept = function(id) {
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "OrderApproval",
                    "lang": util.langStyle(),
                    "OrderID": id,
                    "status": "ACCEPT"
                })
                
                $http({
                    method: 'POST',
                    url: util.getApiUrl('shoporder', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        alert('审核成功');
                        self.search();
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('审核失败' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function (value) {
                    
                });

                alert('命令已发送，请稍后');
            }

            self.reject = function(id) {
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "OrderApproval",
                    "lang": util.langStyle(),
                    "OrderID": id,
                    "status": "DECLINE"
                })
                
                $http({
                    method: 'POST',
                    url: util.getApiUrl('shoporder', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        alert('审核成功');
                        self.search();
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('审核失败' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function (value) {
                    
                });

                alert('命令已发送，请稍后');
            }

            self.finish = function(id) {
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "orderCompleted",
                    "lang": util.langStyle(),
                    "OrderID": id
                })
                
                $http({
                    method: 'POST',
                    url: util.getApiUrl('shoporder', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        alert('操作已成功');
                        self.search();
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('操作失败' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function (value) {
                    
                });
            }

            self.cancel = function(id) {
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "adminCancelOrder",
                    "lang": util.langStyle(),
                    "OrderID": id
                })
                
                $http({
                    method: 'POST',
                    url: util.getApiUrl('shoporder', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        alert('操作已成功');
                        self.search();
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('操作失败' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function (value) {
                    
                });
            }

            self.searchByStatus = function(statusCode) {
                for(var i =0; i< $scope.status.length;i++){
                    if($scope.status[i].code==statusCode) {
                        $scope.status[i].active=true;
                        self.searchStr.status = statusCode;
                    }
                    else {
                        $scope.status[i].active=false;
                    }
                }
                self.search();
            }

            self.searchByShop = function(shopId) {
                for(var i =0; i< $scope.shopList.length;i++){
                    if($scope.shopList[i].ShopID==shopId) {
                        $scope.shopList[i].active=true;
                        self.searchStr.shopId = shopId;
                    }
                    else {
                        $scope.shopList[i].active=false;
                    }
                }
                self.search();
            }

            self.loadShopList = function() {
                var deferred = $q.defer();
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "getMgtHotelShopInfo",
                    "lang": util.langStyle()
                })
                self.loadingShopList = true;
                $http({
                    method: 'POST',
                    url: util.getApiUrl('shopinfo', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        $scope.shopList = data.data.shopList;
                        for(var i =0; i < $scope.shopList.length;i++){
                            $scope.shopList[i].active = false;
                        }
                        $scope.shopList.unshift({
                            "ShopID":0,
                            "HotelID":0,
                            "ShopName":{"zh-CN":"全部"},
                            "HotelName":{"zh-CN":""},
                            "ShopType":"wx",
                            "active": true
                        });
                        self.searchStr.shopId = 0;
                        deferred.resolve();
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('获取商城列表信息失败，' + data.errInfo);
                        deferred.reject();
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                    deferred.reject();
                }).finally(function (value) {
                    self.loadingShopList = false;
                });
                return deferred.promise;
            }

            self.search = function() {
                self.tableParams = new NgTableParams(
                    {
                      page: 1, 
                      count: 15,
                      url: ''
                    }, 
                    {
                      counts: false,
                      getData: function(params) {
                        var paramsUrl = params.url();
                        
                        var data = JSON.stringify({
                            "token": util.getParams('token'),
                            "action": "getOrderByStatus",
                            "lang": util.langStyle(),
                            "ShopID": self.searchStr.shopId,
                            "ContactorPhone": self.searchStr.userPhone,
                            "Status": self.searchStr.status,
                            "ContactorName": self.searchStr.userName,
                            "OrderNum": self.searchStr.orderNumber,
                            "page": paramsUrl.page - 0,
                            "per_page": paramsUrl.count - 0
                        });
                        self.loading = true;
                        self.noData = false;
                        
                        return $http({
                            method: 'POST',
                            url: util.getApiUrl('shoporder', '', 'server'),
                            data: data
                        }).then(function successCallback(response) {
                            var data = response.data;
                            if (data.rescode == '200') {
                                if(data.total == 0) {
                                    self.noData = true;
                                }
                                params.total(data.total);
                                return data.resault;
                            } else if(data.rescode == '401'){
                                alert('访问超时，请重新登录');
                                $state.go('login');
                            } else{
                                alert('获取商城订单列表失败，' + data.errInfo);
                            }
                        }, function errorCallback(response) {
                            alert('连接服务器出错');
                        }).finally(function (value) {
                            self.loading = false;
                        });
                      }
                    }
                );
            }

            self.gotoDetail = function(id) {
                $scope.app.maskParams = {'orderId': id};
                $scope.app.showHideMask(true,'pages/orders/shopOrderDetail.html');
            }
        }
    ])

    .controller('shopOrderDetailController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            var self = this;
            
            self.init = function() {
                self.id = $scope.app.maskParams.orderId;
                self.getInfo();
            }

            self.getInfo = function() {
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "getOrderDetailByID",
                    "lang": util.langStyle(),
                    "OrderID": self.id
                })

                self.loading = true;

                $http({
                    method: 'POST',
                    url: util.getApiUrl('shoporder', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        self.info = data.data;
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('获取信息失败' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function (value) {
                    self.loading = false;
                });
            }

            self.close = function() {
                $scope.app.showHideMask(false);
            }
        }
    ])

    .controller('shopOrderDeliverController', ['$scope', '$state', '$http', 'util',
        function ($scope, $state, $http, util) {
            var self = this;
            
            self.init = function() {
                self.id = $scope.app.maskParams.orderId;
            }

            self.close = function() {
                $scope.app.showHideMask(false);
            }

            self.submit = function() {
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "setExpressInfo",
                    "lang": util.langStyle(),
                    "OrderID": self.id,
                    "ExpressNum": self.ExpressNum,
                    "ExpressCompany": self.ExpressCompany
                })

                self.saving = true;

                $http({
                    method: 'POST',
                    url: util.getApiUrl('shoporder', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        alert('发货成功');
                        $scope.app.maskParams.search();
                        self.close();
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('发货失败' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function (value) {
                    self.saving = false;
                });
            }

            self.close = function() {
                $scope.app.showHideMask(false);
            }
        }
    ])

    .controller('editShopOrderDeliverController', ['$scope', '$state', '$http', 'util',
        function ($scope, $state, $http, util) {
            var self = this;
            
            self.init = function() {
                self.info = $scope.app.maskParams.orderInfo;
                self.id = self.info.ID;
                self.ExpressNum = self.info.ExpressNum;
                self.ExpressCompany = self.info.ExpressCompany;
            }

            self.close = function() {
                $scope.app.showHideMask(false);
            }

            self.submit = function() {
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "updateExpressInfo",
                    "lang": util.langStyle(),
                    "OrderID": self.id,
                    "ExpressNum": self.ExpressNum,
                    "ExpressCompany": self.ExpressCompany
                })

                self.saving = true;

                $http({
                    method: 'POST',
                    url: util.getApiUrl('shoporder', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        alert('修改成功');
                        $scope.app.maskParams.search();
                        self.close();
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('发货失败' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function (value) {
                    self.saving = false;
                });
            }

            self.close = function() {
                $scope.app.showHideMask(false);
            }
        }
    ])

})();
