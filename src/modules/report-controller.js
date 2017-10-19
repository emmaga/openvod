'use strict';
(function () {
    var app = angular.module('app.report', [])
        .controller('reportFormController', ['$scope', '$http', '$state', 'util', '$filter', 'NgTableParams', '$location',
            function ($scope, $http, $state, util, $filter, NgTableParams, $location) {
                var self = this;
                self.init = function () {

                }
            }
        ])
        .controller('placeOrderFormController', ['$scope', '$http', '$state', 'util', '$filter', 'NgTableParams', '$location',
            function ($scope, $http, $state, util, $filter, NgTableParams, $location) {
                var self = this;
                self.init = function () {
                    self.downloading = false;
                    self.complete = false;
                    self.ticketDownloading = false;
                    self.ticketComplete = false;
                    /*
                    *  初始化日历插件
                    *  设置$scope.endTime,$scope.startTime
                    */
                    util.initRangeDatePicker($scope)
                    self.getInfo();
                    console && console.log(self.searchDate, self.endDate);
                };
                /**
                 * datepiker
                 */
                self.open = function ($event) {
                    if ($event.target.className.indexOf('start') != -1) {
                        self.startOpened = true;
                        self.endOpened = false;
                    } else {
                        self.startOpened = false;
                        self.endOpened = true;
                    }
                };
                // 获取报表数据
                self.getInfo = function () {
                    if (!util.resetTime($scope)) return; // 处理时间数据，31天限制
                    self.noData = false;
                    self.loading = true;
                    var qrcodeData = [], roomData = {}
                    var data = {
                        "action": "getOrderStatisXlsShow",
                        "token": util.getParams("token"),
                        "projectList": [util.getParams("projectName")],
                        "startDate": $scope.startTime ? $scope.startTime + ' 00:00:00' : null,
                        "endDate": $scope.endTime ? $scope.endTime + ' 00:00:00' : null
                    }
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('luan/statistics', '', 'server'),
                        data: data
                    }).then(function successCallback (response) {
                        var data = response.data;
                        console.log(data)
                        if (data.rescode == '200') {
                            // 拼接扫码统计数据
                            for (var key1 in data.qrcode) {
                                var total1 = 0
                                for (var i = 0; i < data.qrcode[key1].length; i++) {
                                    total1 += data.qrcode[key1][i]
                                }
                                // array1.push(key1)
                                // array2.push(total1)
                                var item = {};
                                item[key1] = total1
                                qrcodeData.push(item)
                            }
                            // 扫码统计中的“总计”移动到最后
                            for (var k = 0; k < qrcodeData.length; k++) {
                                for (var key in qrcodeData[k]) {
                                    if (key == '总计') {
                                        qrcodeData.push(qrcodeData[k])
                                        qrcodeData.splice(k, 1);
                                    }
                                }
                            }
                            // 拼接订房统计数据
                            for (var key2 in data.room) {
                                var total2 = 0
                                for (var j = 0; j < data.room[key2].length; j++) {
                                    total2 += data.room[key2][j]
                                }
                                var item = {};
                                roomData[key2] = total2
                            }
                            self.qrcodeTable = qrcodeData
                            self.roomTable = roomData
                            self.loading = false
                        } else if (data.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert('获取失败' + data.errInfo);
                        }
                    }, function errorCallback (response) {
                        alert('连接服务器出错');
                    }).finally(function (value) {
                        self.saving = false;
                    });
                }

                // 获取下载链接
                self.export = function () {
                    if (!util.resetTime($scope)) return; // 处理时间数据，31天限制
                    self.sTime = $scope.startTime
                    self.eTime = $scope.endTime
                    self.downloading = true
                    self.complete = false
                    var data = {
                        "action": "getOrderStatisXlsLoad",
                        "token": util.getParams("token"),
                        "projectList": [util.getParams("projectName")],
                        "startDate": $scope.startTime ? $scope.startTime + ' 00:00:00' : null,
                        "endDate": $scope.endTime ? $scope.endTime + ' 00:00:00' : null
                    }
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('luan/statistics', '', 'server'),
                        data: data
                    }).then(function successCallback (response) {
                        var data = response.data;
                        console.log(data)
                        if (data.rescode == '200') {
                            console.log(data)
                            self.downloadLink = data.file_url[0]
                            self.downloading = false
                            self.complete = true
                        } else if (data.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert('导出失败' + data.errInfo);
                        }
                    }, function errorCallback (response) {
                        alert('连接服务器出错，请重新导出');
                    }).finally(function (value) {
                        self.saving = false;
                    });
                }
            }
        ])
        .controller('orderCompleteController', ['$scope', '$http', '$state', 'util', '$filter', 'NgTableParams', '$location',
            function ($scope, $http, $state, util, $filter, NgTableParams, $location) {
                var self = this;
                self.init = function () {
                    self.downloading = false;
                    self.complete = false;
                    self.ticketDownloading = false;
                    self.ticketComplete = false;
                    /*
                    *  初始化日历插件
                    *  设置$scope.endTime,$scope.startTime
                    */
                    util.initRangeDatePicker($scope)

                    self.getInfo();
                };
                /**
                 * datepiker
                 */
                self.open = function ($event) {
                    if ($event.target.className.indexOf('start') != -1) {
                        self.startOpened = true;
                        self.endOpened = false;
                    } else {
                        self.startOpened = false;
                        self.endOpened = true;
                    }
                };
                // 获取报表数据
                self.getInfo = function () {
                    if (!util.resetTime($scope)) return; // 处理时间数据，31天限制
                    self.noData = false;
                    self.loading = true;
                    var qrcodeData = {}, roomData = {}

                    var data = {
                        "action": "getCompleteStatisXlsShow",
                        "token": util.getParams("token"),
                        "projectList": [util.getParams("projectName")],
                        "startDate": $scope.startTime ? $scope.startTime + ' 00:00:00' : null,
                        "endDate": $scope.endTime ? $scope.endTime + ' 00:00:00' : null
                    }
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('luan/statistics', '', 'server'),
                        data: data
                    }).then(function successCallback (response) {
                        var data = response.data;
                        console.log(data)
                        if (data.rescode == '200') {
                            // 拼接订房统计数据
                            for (var key2 in data.room) {
                                var total2 = 0
                                for (var j = 0; j < data.room[key2].length; j++) {
                                    total2 += data.room[key2][j]
                                }
                                roomData[key2] = total2
                            }
                            self.roomTable = roomData
                            self.loading = false
                        } else if (data.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert('获取失败' + data.errInfo);
                        }
                    }, function errorCallback (response) {
                        alert('连接服务器出错');
                    }).finally(function (value) {
                        self.saving = false;
                    });
                }

                // 获取下载链接
                self.export = function () {
                    if (!util.resetTime($scope)) return; // 处理时间数据，31天限制
                    self.sTime = $scope.startTime
                    self.eTime = $scope.endTime
                    self.downloading = true
                    self.complete = false
                    var data = {
                        "action": "getCompleteStatisXlsLoad",
                        "token": util.getParams("token"),
                        "projectList": [util.getParams("projectName")],
                        "startDate": $scope.startTime ? $scope.startTime + ' 00:00:00' : null,
                        "endDate": $scope.endTime ? $scope.endTime + ' 00:00:00' : null
                    }
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('luan/statistics', '', 'server'),
                        data: data
                    }).then(function successCallback (response) {
                        var data = response.data;
                        console.log(data)
                        if (data.rescode == '200') {
                            console.log(data)
                            self.downloadLink = data.file_url[0]
                            self.downloading = false
                            self.complete = true
                        } else if (data.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert('导出失败' + data.errInfo);
                        }
                    }, function errorCallback (response) {
                        alert('连接服务器出错，请重新导出');
                    }).finally(function (value) {
                        self.saving = false;
                    });
                }

                // 获取下载链接
                self.exportTicketReport = function () {
                    if (!util.resetTime($scope)) return; // 处理时间数据，31天限制
                    self.sTime2 = $scope.startTime
                    self.eTime2 = $scope.endTime
                    self.ticketDownloading = true
                    self.ticketComplete = false
                    var data = {
                        "action": "getTicketStatisXlsLoad",
                        "token": util.getParams("token"),
                        "projectList": [util.getParams("projectName")],
                        "startDate": $scope.startTime ? $scope.startTime + ' 00:00:00' : null,
                        "endDate": $scope.endTime ? $scope.endTime + ' 00:00:00' : null
                    }
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('luan/statistics', '', 'server'),
                        data: data
                    }).then(function successCallback (response) {
                        var data = response.data;
                        console.log(data)
                        if (data.rescode == '200') {
                            console.log(data)
                            self.ticketDownloadLink = data.file_url[0]
                            self.ticketDownloading = false
                            self.ticketComplete = true
                        } else if (data.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert('修改失败' + data.errInfo);
                        }
                    }, function errorCallback (response) {
                        alert('连接服务器出错，请重新导出');
                    }).finally(function (value) {
                        self.saving = false;
                    });
                }
            }
        ])
        .controller('movieIncomeController', ['$scope', '$http', '$state', 'util', '$filter', 'NgTableParams', '$location',
            function ($scope, $http, $state, util, $filter, NgTableParams, $location) {
                var self = this;
                self.init = function () {
                    self.downloading = false;
                    self.complete = false;
                    self.ticketDownloading = false;
                    self.ticketComplete = false;
                    /*
                    *  初始化日历插件
                    *  设置$scope.endTime,$scope.startTime
                    */
                    util.initRangeDatePicker($scope)
                    self.getInfo();
                    console && console.log(self.searchDate, self.endDate);
                };

                // 获取报表数据
                self.getInfo = function () {
                    if (!util.resetTime($scope)) return; // 处理时间数据，31天限制
                    self.noData = false;
                    self.loading = true;
                    var qrcodeData = [], roomData = []
                    var data = {
                        "action": "getMovieOrderStatisXlsShow",
                        "token": util.getParams("token"),
                        "projectList": [util.getParams("projectName")],
                        "startDate": $scope.startTime ? $scope.startTime + ' 00:00:00' : null,
                        "endDate": $scope.endTime ? $scope.endTime + ' 00:00:00' : null
                    }
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('luan/statistics', '', 'server'),
                        data: data
                    }).then(function successCallback (response) {
                        var data = response.data;
                        if (data.rescode == '200') {
                            self.movieData = data.movie['总计']
                            console.log(self.movieData)
                            self.loading = false
                        } else if (data.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert('获取失败' + data.errInfo);
                        }
                    }, function errorCallback (response) {
                        alert('连接服务器出错');
                    }).finally(function (value) {
                        self.saving = false;
                    });
                }

                // 获取下载链接
                self.export = function () {
                    if (!util.resetTime($scope)) return; // 处理时间数据，31天限制
                    self.sTime = $scope.startTime
                    self.eTime = $scope.endTime
                    self.downloading = true
                    self.complete = false
                    var data = {
                        "action": "getMovieOrderStatisXlsLoad",
                        "token": util.getParams("token"),
                        "projectList": [util.getParams("projectName")],
                        "startDate": $scope.startTime ? $scope.startTime + ' 00:00:00' : null,
                        "endDate": $scope.endTime ? $scope.endTime + ' 00:00:00' : null
                    }
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('luan/statistics', '', 'server'),
                        data: data
                    }).then(function successCallback (response) {
                        var data = response.data;
                        if (data.rescode == '200') {
                            console.log(data)
                            self.downloadLink = data.file_url[0]
                            self.downloading = false
                            self.complete = true
                        } else if (data.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert('导出失败' + data.errInfo);
                        }
                    }, function errorCallback (response) {
                        alert('连接服务器出错，请重新导出');
                    }).finally(function (value) {
                        self.saving = false;
                    });
                }
            }
        ])
        .controller('prepayOrderFormController', ['$scope', '$http', '$state', 'util', '$filter', 'NgTableParams', '$location',
            function ($scope, $http, $state, util, $filter, NgTableParams, $location) {
                var self = this;
                self.init = function () {
                    self.downloading = false;
                    self.complete = false;
                    self.ticketDownloading = false;
                    self.ticketComplete = false;
                    /*
                    *  初始化日历插件
                    *  设置$scope.endTime,$scope.startTime
                    */
                    util.initRangeDatePicker($scope)
                    self.getInfo();
                    console && console.log(self.searchDate, self.endDate);
                };

                // 获取报表数据
                self.getInfo = function () {
                    if (!util.resetTime($scope)) return; // 处理时间数据，31天限制
                    self.tableParams = new NgTableParams(
                        {
                            page: 1,
                            count: 15,
                            url: ''
                        },
                        {
                            counts: false,
                            getData: function (params) {
                                var paramsUrl = params.url();
                                var data = JSON.stringify({
                                    "action": "getFXShopOrderStatisXlsShow",
                                    "token": util.getParams("token"),
                                    "projectList": [util.getParams("projectName")],
                                    "startDate": $scope.startTime ? $scope.startTime + ' 00:00:00' : null,
                                    "endDate": $scope.endTime ? $scope.endTime + ' 00:00:00' : null,
                                    "page": paramsUrl.page - 0,
                                    "per_page": paramsUrl.count - 0
                                });
                                self.loading = true;
                                self.noData = false;

                                return $http({
                                    method: 'POST',
                                    url: util.getApiUrl('luan/statistics', '', 'server'),
                                    data: data
                                }).then(function successCallback (response) {
                                    var data = response.data;
                                    if (data.rescode == '200') {
                                        if (data.dateList.length == 0) {
                                            self.noData = true;
                                        } else {
                                            params.total(data.fxshop['总计']['总记录数']);
                                            var deatailData = data.fxshop['明细']
                                            deatailData.datelist = data.dateList
                                            var tableData = []
                                            for (var i = 0; i < data.dateList.length; i++) {
                                                var item = {}
                                                item.date = deatailData.datelist[i]
                                                item.orderNum = deatailData['订单数'][i]
                                                item.orderTotalIncome = deatailData['订单总收入（元）'][i]
                                                item.Commission = deatailData['推广佣金（元）'][i]
                                                item.serviceCharge = deatailData['服务费（元）'][i]
                                                item.realIncome = deatailData['订单实收入（元）'][i]
                                                tableData.push(item)
                                                console.log(item.serviceCharge)
                                            }
                                        }
                                        // tableData = R.sortBy(R.prop('date'))(tableData)
                                        self.totalData = data.fxshop['总计']
                                        return tableData;
                                    } else if (data.rescode == '401') {
                                        alert('访问超时，请重新登录');
                                        $state.go('login');
                                    } else {
                                        alert('获取列表失败，' + data.errInfo);
                                    }
                                }, function errorCallback (response) {
                                    alert('连接服务器出错');
                                }).finally(function (value) {
                                    self.loading = false;
                                });
                            }
                        }
                    );
                    // var qrcodeData = [], roomData = []
                    // var data = {
                    //     "action": "getMovieOrderStatisXlsShow",
                    //     "token": util.getParams("token"),
                    //     "projectList": [util.getParams("projectName")],
                    //     "startDate": $scope.startTime ? $scope.startTime + ' 00:00:00' : null,
                    //     "endDate": $scope.endTime ? $scope.endTime + ' 00:00:00' : null
                    // }
                    // $http({
                    //     method: 'POST',
                    //     url: util.getApiUrl('luan/statistics', '', 'server'),
                    //     data: data
                    // }).then(function successCallback (response) {
                    //     var data = response.data;
                    //     if (data.rescode == '200') {
                    //         self.movieData = data.movie['总计']
                    //         console.log(self.movieData)
                    //         self.loading = false
                    //     } else if (data.rescode == '401') {
                    //         alert('访问超时，请重新登录');
                    //         $state.go('login');
                    //     } else {
                    //         alert('获取失败' + data.errInfo);
                    //     }
                    // }, function errorCallback (response) {
                    //     alert('连接服务器出错');
                    // }).finally(function (value) {
                    //     self.saving = false;
                    // });
                }

                // 获取下载链接
                self.export = function () {
                    if (!util.resetTime($scope)) return; // 处理时间数据，31天限制
                    self.sTime = $scope.startTime
                    self.eTime = $scope.endTime
                    self.downloading = true
                    self.complete = false
                    var data = {
                        "action": "getFXShopOrderStatisXlsLoad",
                        "token": util.getParams("token"),
                        "projectList": [util.getParams("projectName")],
                        "startDate": $scope.startTime ? $scope.startTime + ' 00:00:00' : null,
                        "endDate": $scope.endTime ? $scope.endTime + ' 00:00:00' : null
                    }
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('luan/statistics', '', 'server'),
                        data: data
                    }).then(function successCallback (response) {
                        var data = response.data;
                        if (data.rescode == '200') {
                            console.log(data)
                            self.downloadLink = data.file_url[0]
                            self.downloading = false
                            self.complete = true
                        } else if (data.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert('导出失败' + data.errInfo);
                        }
                    }, function errorCallback (response) {
                        alert('连接服务器出错，请重新导出');
                    }).finally(function (value) {
                        self.saving = false;
                    });
                }
            }
        ])
})();