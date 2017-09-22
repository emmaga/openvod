'use strict';
(function () {
    var app = angular.module('app.advanceGoods', [])
        .controller('advanceGoodsController', ['$scope', '$http', '$state', 'util', '$filter', 'NgTableParams', '$location',
            function ($scope, $http, $state, util, $filter, NgTableParams, $location) {
                var self = this, token = util.getParams('token')

                function upload () {
                    $scope.app.showHideMask(true, 'pages/advanceGoods/imgUpload.html');
                }

                self.init = function () {


                };

                // 加载列表
                self.loadList = function () {

                }

                // 删除
                self.delete = function (id) {

                }

                self.insertSome = function () {
                    window.um.setContent('<img src="http://images2015.cnblogs.com/blog/322415/201509/322415-20150911222123747-1452606746.jpg"/>', true);
                }

                // 新增
                self.add = function () {
                    $scope.app.maskParams = {'Id': self.Id};
                    $scope.app.showHideMask(true, 'pages/advanceGoods/advanceGoodsAdd.html');
                }

                // 编辑
                self.edit = function (id) {
                    $scope.app.maskParams = {'Id': id};
                    $scope.app.showHideMask(true, 'pages/advanceGoods/advanceGoodsEdit.html');
                }
            }
        ])
        // 添加商品
        .controller('advanceGoodsAddController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'util', 'CONFIG',
            function ($scope, $state, $http, $stateParams, $filter, util, CONFIG) {
                console.log('goodsAddController');

                var self = this;
                self.init = function () {
                    self.shopId = $scope.app.maskParams.shopId;
                    self.shopGoodsCategoryId = $scope.app.maskParams.shopGoodsCategoryId;
                    self.imgs = new util.initUploadImgs([], self, $scope, 'imgs');
                    self.imgs1 = new util.initUploadImgs([], self, $scope, 'imgs1');
                    self.imgs2 = new util.initUploadImgs([], self, $scope, 'imgs2', true);
                    self.editLangs = util.getParams('editLangs');
                    self.name = {};
                    self.intro = {};
                    self.paytype = 'price';
                    self.tvShow = true;
                    self.seq = $scope.app.maskParams.currentAmount + 1;

                    window.um = UM.getEditor('container', {
                        toolbar: ['undo redo | bold italic underline | test']
                    });
                }

                self.insertImg = function (src) {
                    var str='';
                    window.um.setContent('<img src="'+src+'" />', true);
                }

                self.cancel = function () {
                    console.log('cancel')
                    $scope.app.showHideMask(false);
                }

                self.addGoods = function () {
                    console.log(self.imgs)
                    return
                    // 价格设置检查
                    if (self.paytype == 'price') {
                        if (self.price == null) {
                            alert('请输入价格');
                            return;
                        }
                    } else if (self.paytype == 'score') {
                        if (self.score == null) {
                            alert('请输入积分');
                            return;
                        }
                    }

                    // 配送方式检查
                    if (!self.byDelivery && !self.bySelf && !self.byHomeDelivery) {
                        alert('请选择配送方式');
                        return;
                    }


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
                    var _price = {
                        money: {
                            Enable: false,
                            price: 0,
                            Decline: 0
                        },
                        point: {
                            Enable: false,
                            point: 0
                        }
                    }
                    var _deliveryType = [];
                    self.byDelivery && _deliveryType.push('express');
                    self.bySelf && _deliveryType.push('bySelf');
                    self.byHomeDelivery && _deliveryType.push('homeDelivery');

                    if (self.paytype == 'price') {
                        _price.money.Enable = true;
                        _price.money.price = self.price * 100;
                        _price.money.Decline = self.decline * 100;
                    } else if (self.paytype == 'score') {
                        _price.point.Enable = true;
                        _price.point.point = self.score;
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
                            "seq": self.seq,
                            "price": _price,
                            "deliveryType": _deliveryType,
                            "intro": self.intro,
                            "imgSrc": imgSrc,
                            "TVGoodsShow": self.tvShow ? 1 : 0
                        }
                    });
                    console.dir(data);

                    self.saving = true;
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('shopinfo', '', 'server'),
                        data: data
                    }).then(function successCallback (data, status, headers, config) {
                        if (data.data.rescode == "200") {
                            alert('添加成功');
                            $state.reload();
                        } else {
                            alert('添加失败，错误编码：' + data.data.rescode + '，' + data.data.errInfo);
                        }
                    }, function errorCallback (data, status, headers, config) {
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
            }
        ])
        .controller('advanceGoodsEditController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
            function ($scope, $state, $http, $stateParams, $location, util) {

            }
        ])
        // 商城订单列表页
        .controller('advanceGoodsOrderController', ['$scope', '$filter', '$q', '$state', '$http', '$stateParams', '$location', 'NgTableParams', 'util', 'CONFIG',
            function ($scope, $filter, $q, $state, $http, $stateParams, $location, NgTableParams, util, CONFIG) {
                var self = this;

                self.init = function () {
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

                    self.loadShopList().then(function () {
                        self.search();
                    });

                    $scope.billStatus = ''

                    $scope.$watch('billStatus', function () {
                        self.search()
                    }, true);
                }

                self.getSelectedShop = function () {
                    var ret = {};
                    if ($scope.shopList) {
                        for (var i = 0; i < $scope.shopList.length; i++) {
                            if ($scope.shopList[i].active) {
                                ret = $scope.shopList[i];
                                break;
                            }
                        }
                    }
                    return ret;
                };

                self.deliver = function (id) {
                    $scope.app.maskParams = {'orderId': id, 'search': self.search};
                    $scope.app.showHideMask(true, 'pages/orders/shopOrderDeliver.html');
                }

                self.editDeliverInfo = function (info) {
                    $scope.app.maskParams = {'orderInfo': info, 'search': self.search};
                    $scope.app.showHideMask(true, 'pages/orders/editShopOrderDeliver.html');
                }

                self.accept = function (id) {
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
                    }).then(function successCallback (response) {
                        var data = response.data;
                        if (data.rescode == '200') {
                            alert('审核成功');
                            self.search();
                        } else if (data.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert('审核失败' + data.errInfo);
                        }
                        $scope.app.showHideMask(false);
                    }, function errorCallback (response) {
                        alert('连接服务器出错');
                        $scope.app.showHideMask(false);
                    }).finally(function (value) {
                        $scope.app.showHideMask(false);
                    });

                    alert('命令已发送，请稍后');
                }

                self.reject = function (id) {
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
                    }).then(function successCallback (response) {
                        var data = response.data;
                        if (data.rescode == '200') {
                            alert('操作成功');
                            self.search();
                        } else if (data.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert('操作失败' + data.errInfo);
                        }
                        $scope.app.showHideMask(false);
                    }, function errorCallback (response) {
                        alert('连接服务器出错');
                        $scope.app.showHideMask(false);
                    }).finally(function (value) {
                        $scope.app.showHideMask(false);
                    });

                    alert('命令已发送，请稍后');
                }

                self.finish = function (id) {
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
                    }).then(function successCallback (response) {
                        var data = response.data;
                        if (data.rescode == '200') {
                            alert('操作已成功');
                            self.search();
                        } else if (data.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert('操作失败' + data.errInfo);
                        }
                        $scope.app.showHideMask(false);
                    }, function errorCallback (response) {
                        alert('连接服务器出错');
                        $scope.app.showHideMask(false);
                    }).finally(function (value) {
                        $scope.app.showHideMask(false);
                    });
                }

                self.cancel = function (id) {
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
                    }).then(function successCallback (response) {
                        var data = response.data;
                        if (data.rescode == '200') {
                            alert('操作已成功');
                            self.search();
                        } else if (data.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert('操作失败' + data.errInfo);
                        }
                        $scope.app.showHideMask(false);
                    }, function errorCallback (response) {
                        alert('连接服务器出错');
                        $scope.app.showHideMask(false);
                    }).finally(function (value) {
                        $scope.app.showHideMask(false);
                    });
                }

                self.setInvoice = function (id) {
                    var data = JSON.stringify({
                        "token": util.getParams('token'),
                        "action": "setInvoiceStatus",
                        "lang": util.langStyle(),
                        "OrderID": id,
                        "Status": 2
                    })

                    $http({
                        method: 'POST',
                        url: util.getApiUrl('shoporder', '', 'server'),
                        data: data
                    }).then(function successCallback (response) {
                        var data = response.data;
                        if (data.rescode == '200') {
                            alert('操作已成功');
                            self.search();
                        } else if (data.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert('操作失败' + data.errInfo);
                        }
                        $scope.app.showHideMask(false);
                    }, function errorCallback (response) {
                        alert('连接服务器出错');
                        $scope.app.showHideMask(false);
                    }).finally(function (value) {
                        $scope.app.showHideMask(false);
                    });
                }

                self.searchByStatus = function (statusCode) {
                    for (var i = 0; i < $scope.status.length; i++) {
                        if ($scope.status[i].code == statusCode) {
                            $scope.status[i].active = true;
                            self.searchStr.status = statusCode;
                        }
                        else {
                            $scope.status[i].active = false;
                        }
                    }
                    self.search();
                }

                self.searchByShop = function (shopId) {
                    for (var i = 0; i < $scope.shopList.length; i++) {
                        if ($scope.shopList[i].ShopID == shopId) {
                            $scope.shopList[i].active = true;
                            self.searchStr.shopId = shopId;
                        }
                        else {
                            $scope.shopList[i].active = false;
                        }
                    }
                    self.search();
                }

                self.loadShopList = function () {
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
                    }).then(function successCallback (response) {
                        var data = response.data;
                        if (data.rescode == '200') {
                            $scope.shopList = data.data.shopList;
                            for (var i = 0; i < $scope.shopList.length; i++) {
                                $scope.shopList[i].active = false;
                            }
                            $scope.shopList.unshift({
                                "ShopID": 0,
                                "HotelID": 0,
                                "ShopName": {"zh-CN": "全部"},
                                "HotelName": {"zh-CN": ""},
                                "ShopType": "wx",
                                "active": true
                            });
                            self.searchStr.shopId = 0;
                            deferred.resolve();
                        } else if (data.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert('获取商城列表信息失败，' + data.errInfo);
                            deferred.reject();
                        }
                    }, function errorCallback (response) {
                        alert('连接服务器出错');
                        deferred.reject();
                    }).finally(function (value) {
                        self.loadingShopList = false;
                    });
                    return deferred.promise;
                }

                self.search = function () {
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
                                    "token": util.getParams('token'),
                                    "action": "getOrderByStatus",
                                    "lang": util.langStyle(),
                                    "ShopID": self.searchStr.shopId,
                                    "ContactorPhone": self.searchStr.userPhone,
                                    "Status": self.searchStr.status,
                                    "ContactorName": self.searchStr.userName,
                                    "OrderNum": self.searchStr.orderNumber,
                                    "page": paramsUrl.page - 0,
                                    "per_page": paramsUrl.count - 0,
                                    "InvoiceStatus": $scope.billStatus
                                });
                                self.loading = true;
                                self.noData = false;

                                return $http({
                                    method: 'POST',
                                    url: util.getApiUrl('shoporder', '', 'server'),
                                    data: data
                                }).then(function successCallback (response) {
                                    var data = response.data;
                                    if (data.rescode == '200') {
                                        if (data.total == 0) {
                                            self.noData = true;
                                        }
                                        params.total(data.total);
                                        return data.resault;
                                    } else if (data.rescode == '401') {
                                        alert('访问超时，请重新登录');
                                        $state.go('login');
                                    } else {
                                        alert('获取商城订单列表失败，' + data.errInfo);
                                    }
                                }, function errorCallback (response) {
                                    alert('连接服务器出错');
                                }).finally(function (value) {
                                    self.loading = false;
                                });
                            }
                        }
                    );
                }

                self.gotoDetail = function (info) {
                    $scope.app.maskParams = {
                        'orderId': info.ID,
                        'orderInfo': info,
                        'accept': self.accept,
                        'reject': self.reject,
                        'deliver': self.deliver,
                        'search': self.search,
                        'finish': self.finish,
                        'cancel': self.cancel,
                        'setInvoice': self.setInvoice,
                        'editDeliverInfo': self.editDeliverInfo
                    };
                    $scope.app.showHideMask(true, 'pages/orders/shopOrderDetail.html');
                }
            }
        ])

        // image up load mask
        .controller('imgUploadController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'util', 'CONFIG',
            function ($scope, $state, $http, $stateParams, $filter, util, CONFIG) {
                var self = this;
                self.init = function () {
                    self.imgs = new Imgs([]);
                    self.editLangs = util.getParams('editLangs');
                }

                self.cancel = function () {
                    console.log('cancel')
                    $scope.app.showHideMask(false);
                }

                self.addPics = function () {
                    var imgSrc = [];
                    var l = self.imgs.data;
                    for (var i = 0; i < l.length; i++) {
                        imgSrc[i] = {};
                        imgSrc[i].ImageURL = l[i].src;
                        imgSrc[i].Seq = i;
                        imgSrc[i].ImageSize = Number(l[i].fileSize);
                    }
                    console.log(imgSrc)
                }

                self.clickUpload = function (e) {
                    setTimeout(function () {
                        document.getElementById(e).click();
                    }, 0);
                }

                function Imgs (imgList) {
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
})();