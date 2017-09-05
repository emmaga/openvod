'use strict';
(function () {
    var app = angular.module('app.ticket', [])
        .controller('ticketController', ['$scope', '$http', '$state', 'util', '$filter', 'NgTableParams', '$location',
            function ($scope, $http, $state, util, $filter, NgTableParams, $location) {
                var self = this, token = util.getParams('token')
                self.init = function () {
                    self.loading = true;
                    self.noData = true;
                    self.loadList()
                };

                // 加载列表
                self.loadList = function () {
                    var data = JSON.stringify({
                        "action": "getList",
                        "token": token
                    })

                    $http({
                        method: 'POST',
                        url: util.getApiUrl('ticket', '', 'server'),
                        data: data
                    }).then(function successCallback (response) {
                        var data = response.data;
                        if (data.rescode == '200') {
                            self.ticketList = data.data
                            if (data.data.length > 0) {
                                self.noData = false;
                            }
                        } else {
                            alert('读取失败' + data.rescode + ' ' + data.errInfo);
                        }
                    }, function errorCallback (response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (e) {
                        self.loading = false;
                    });
                }

                // 删除
                self.delete = function (id) {
                    var flag = confirm('确认删除？');
                    if (!flag) {
                        return;
                    }
                    var data = JSON.stringify({
                        "action": "delete",
                        "token": token,
                        "data": {
                            "ID": id
                        }
                    })

                    $http({
                        method: 'POST',
                        url: util.getApiUrl('ticket', '', 'server'),
                        data: data
                    }).then(function successCallback (response) {
                        var data = response.data;
                        console.log(data)
                        if (data.rescode == '200') {
                            alert('删除成功')
                            self.loadList()
                        } else if (data.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            var error
                            if (data.errInfo === 'Ticket is in use.') {
                                error = '门票已被绑定，请取消绑定再删除'
                            } else {
                                error = data.errInfo
                            }
                            alert('删除失败， ' + error);
                        }
                    }, function errorCallback (response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (e) {
                        self.loading = false;
                    });
                }

                // 新增
                self.add = function () {
                    $scope.app.maskParams = {'Id': self.Id};
                    $scope.app.showHideMask(true, 'pages/ticketAdd.html');
                }

                // 编辑
                self.edit = function (id) {
                    $scope.app.maskParams = {'Id': id};
                    $scope.app.showHideMask(true, 'pages/ticketEdit.html');
                }
            }
        ])
        .controller('ticketAddController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
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
                    self.load();
                    self.multiLang = util.getParams('editLangs');
                }

                self.cancel = function () {
                    $scope.app.showHideMask(false);
                }

                /**
                 * datepiker
                 */
                self.today = function ($index) {
                    self.SpecialPrice[$index].PlayDate = new Date();
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
                        PlayDate: new Date(),
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
                 * 保存价格信息
                 */
                self.save = function () {
                    self.saving = true;
                    var specialPrice = [];
                    for (var i = 0; i < self.SpecialPrice.length; i++) {
                        specialPrice.push({
                            PlayDate: util.format_yyyyMMdd(self.SpecialPrice[i].PlayDate),
                            Price: Number(self.SpecialPrice[i].Price) * 100
                        })
                    }
                    if (!countJson(specialPrice, 'PlayDate')) {
                        alert('同一天不能重复设置');
                        self.saving = false;
                        return false;
                    }
                    var data = JSON.stringify({
                        "action": "add",
                        "token": token,
                        "data": {
                            "Name": self.name,
                            "Description": self.description,
                            "PriceMonday": Number(self.ticketDetail.PriceMonday) * 100,
                            "PriceTuesday": Number(self.ticketDetail.PriceTuesday) * 100,
                            "PriceWednesday": Number(self.ticketDetail.PriceWednesday) * 100,
                            "PriceThursday": Number(self.ticketDetail.PriceThursday) * 100,
                            "PriceFriday": Number(self.ticketDetail.PriceFriday) * 100,
                            "PriceSaturday": Number(self.ticketDetail.PriceSaturday) * 100,
                            "PriceSunday": Number(self.ticketDetail.PriceSunday) * 100,
                            "PriceSpecial": specialPrice
                        }
                    })

                    $http({
                        method: 'POST',
                        url: util.getApiUrl('ticket', '', 'server'),
                        data: data
                    }).then(function successCallback (response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            alert('保存成功');
                            $state.reload();
                        } else if (msg.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert('保存失败，' + msg.errInfo);
                        }
                    }, function errorCallback (response) {
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
                function countJson (json, key) {
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
        .controller('ticketEditController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
            function ($scope, $state, $http, $stateParams, $location, util) {
                var self = this;
                var lang, ticketId, token;
                self.init = function () {
                    lang = util.langStyle();
                    token = util.getParams('token');
                    ticketId = $scope.app.maskParams.Id
                    self.ticketDetail = {}
                    self.SpecialPrice = [];
                    self.load();
                    self.multiLang = util.getParams('editLangs');
                }

                self.cancel = function () {
                    $scope.app.showHideMask(false);
                }

                /**
                 * datepiker
                 */
                self.today = function ($index) {
                    self.SpecialPrice[$index].PlayDate = new Date();
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
                        PlayDate: new Date(),
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
                        "action": "get",
                        "token": token,
                        "data": {
                            "ID": ticketId
                        }
                    })
                    console.log(data)
                    self.loading = true;
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('ticket', '', 'server'),
                        data: data
                    }).then(function successCallback (response) {
                        var msg = response.data.data;

                        if (response.data.rescode == '200') {
                            self.name = msg.Name
                            self.description = msg.Description
                            self.ticketDetail.PriceMonday = msg.PriceMonday / 100;
                            self.ticketDetail.PriceTuesday = msg.PriceTuesday / 100;
                            self.ticketDetail.PriceWednesday = msg.PriceWednesday / 100;
                            self.ticketDetail.PriceThursday = msg.PriceThursday / 100;
                            self.ticketDetail.PriceFriday = msg.PriceFriday / 100;
                            self.ticketDetail.PriceSaturday = msg.PriceSaturday / 100;
                            self.ticketDetail.PriceSunday = msg.PriceSunday / 100;
                            for (var i = 0; i < msg.PriceSpecial.length; i++) {
                                msg.PriceSpecial[i].PlayDate = new Date(msg.PriceSpecial[i].PlayDate);
                                msg.PriceSpecial[i].Price = msg.PriceSpecial[i].Price / 100;
                            }
                            self.SpecialPrice = msg.PriceSpecial;
                        } else if (msg.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert('读取价格信息失败，' + msg.errInfo);
                        }
                    }, function errorCallback (response) {
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
                            PlayDate: util.format_yyyyMMdd(self.SpecialPrice[i].PlayDate),
                            Price: Number(self.SpecialPrice[i].Price) * 100
                        })
                    }
                    if (!countJson(specialPrice, 'PlayDate')) {
                        alert('同一天不能重复设置');
                        self.saving = false;
                        return false;
                    }
                    var data = JSON.stringify({
                        "action": "edit",
                        "token": token,
                        "data": {
                            "ID": ticketId,
                            "Name": self.name,
                            "Description": self.description,
                            "PriceNormal": 1,
                            "PriceMonday": Number(self.ticketDetail.PriceMonday) * 100,
                            "PriceTuesday": Number(self.ticketDetail.PriceTuesday) * 100,
                            "PriceWednesday": Number(self.ticketDetail.PriceWednesday) * 100,
                            "PriceThursday": Number(self.ticketDetail.PriceThursday) * 100,
                            "PriceFriday": Number(self.ticketDetail.PriceFriday) * 100,
                            "PriceSaturday": Number(self.ticketDetail.PriceSaturday) * 100,
                            "PriceSunday": Number(self.ticketDetail.PriceSunday) * 100,
                            "PriceSpecial": specialPrice
                        }
                    })

                    $http({
                        method: 'POST',
                        url: util.getApiUrl('ticket', '', 'server'),
                        data: data
                    }).then(function successCallback (response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            alert('保存成功');
                            $state.reload();
                        } else if (msg.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert('保存失败，' + msg.errInfo);
                        }
                    }, function errorCallback (response) {
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
                function countJson (json, key) {
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