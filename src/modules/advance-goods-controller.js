'use strict';
(function () {
    var app = angular.module('app.advanceGoods', [])
    // 商城管理
        .controller('advanceShopController', ['$scope', '$state', '$translate', '$http', '$stateParams', '$filter', 'util',
            function ($scope, $state, $translate, $http, $stateParams, $filter, util) {
                console.log('shopController');
                var self = this;
                self.init = function () {
                    self.langStyle = util.langStyle();
                    self.multiLang = util.getParams('editLangs');
                    self.loading = false;
                    self.noData = false;
                    self.searchShopList();
                    // for page active
                    $scope.ShopID = $stateParams.ShopID;
                }


                self.searchShopList = function () {
                    self.loading = true;
                    var data = {
                        "action": "getMgtShopList",
                        "token": util.getParams("token"),
                        "lang": self.langStyle
                    };
                    data = JSON.stringify(data);
                    $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('fxshopinfo', '', 'server'),
                        data: data
                    }).then(function successCallback (data, status, headers, config) {
                        if (data.data.rescode == "200") {
                            if (data.data.data.shopList.length == 0) {
                                self.noData = true;
                                return;
                            }
                            self.shopList = data.data.data.shopList;
                            // 默认加载 指定 商城 or 第一个 商城
                            self.shopFirst = self.shopList[0];
                            if ($stateParams.ShopID) {
                                for (var i = 0; i < self.shopList.length; i++) {
                                    if ($stateParams.ShopID == self.shopList[i].ShopID) {
                                        self.shopFirst = self.shopList[i];
                                        break;
                                    }
                                }
                            }
                            self.goTo(self.shopFirst.ShopID, self.shopFirst.ShopName, self.shopFirst.AdminSMSPhone, self.shopFirst.ShopType, self.shopFirst.ContactDimension, self.shopFirst.ContactLongitude, self.shopFirst.ContactName, self.shopFirst.ContactAdress, self.shopFirst.ContactTelephone, self.shopFirst.QrCodeURL);
                        } else if (data.data.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login')
                        } else {
                            alert('添加失败， ' + data.data.errInfo);
                        }
                    }, function errorCallback (data, status, headers, config) {
                        alert('连接服务器出错');
                    }).finally(function (value) {
                        self.loading = false;
                    });

                }

                self.shopAdd = function () {
                    $scope.app.showHideMask(true, 'pages/advanceGoods/advanceShopAdd.html');
                }

                self.goTo = function (ShopID, ShopName, AdminSMSPhone, ShopType, ContactDimension, ContactLongitude, ContactName, ContactAdress, ContactTelephone, QrCodeURL) {
                    $scope.app.maskParams.ShopType = ShopType;
                    $scope.app.maskParams.ShopName = ShopName;
                    $scope.app.maskParams.AdminSMSPhone = AdminSMSPhone;
                    $scope.app.maskParams.ContactDimension = ContactDimension;
                    $scope.app.maskParams.ContactLongitude = ContactLongitude;
                    $scope.app.maskParams.ContactName = ContactName;
                    $scope.app.maskParams.ContactAdress = ContactAdress;
                    $scope.app.maskParams.ContactTelephone = ContactTelephone;
                    $scope.app.maskParams.QrCodeURL = QrCodeURL;

                    if (ShopID != $stateParams.ShopID) {
                        // for page active
                        $scope.ShopID = ShopID;

                        $state.go('app.advanceGoods.goods', {
                            ShopID: ShopID
                        });
                    }
                }
            }
        ])
        .controller('advanceShopAddController', ['$scope', '$state', '$http', '$stateParams', '$translate', '$filter', 'util',
            function ($scope, $state, $http, $stateParams, $translate, $filter, util) {
                console.log('shopAddController');
                var self = this;
                self.init = function () {
                    self.langStyle = util.langStyle();
                    self.multiLang = util.getParams('editLangs');
                    self.saving = false;
                    // 表单提交 商城信息
                    self.form = {};
                    // 多语言
                    self.form.shopName = {};

                    self.saving = false;
                    self.loading = false;
                    self.imgs = new util.initUploadImgs([], self, $scope, 'imgs', true);
                }

                self.cancel = function () {
                    $scope.app.showHideMask(false);
                }

                self.saveForm = function () {
                    var shopList = {
                        "ContactAdress": self.form.ContactAdress,
                        "ShopType": self.ShopType,
                        "ShopName": self.form.shopName,
                        "ContactDimension": 0,
                        "ContactLongitude": 0,
                        "ContactName": self.form.ContactName,
                        "ContactTelephone": self.form.ContactTelephone,
                        "AdminSMSPhone": self.form.AdminSMSPhone,
                        'QrCodeURL': self.imgs.data[0].src ? self.imgs.data[0].src : null
                    }
                    var data = {
                        "action": "addMgtShop",
                        "token": util.getParams("token"),
                        "lang": self.langStyle,
                        "shopList": [shopList]
                    };
                    data = JSON.stringify(data);
                    self.saving = true;

                    $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('fxshopinfo', '', 'server'),
                        data: data
                    }).then(function successCallback (data, status, headers, config) {
                        if (data.data.rescode == "200") {
                            alert('添加成功')
                            $state.reload();
                        } else if (data.data.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login')
                        } else {
                            alert('添加失败， ' + data.data.errInfo);
                        }
                    }, function errorCallback (data, status, headers, config) {
                        alert('添加失败， ' + data.data.errInfo);
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
        .controller('advanceShopEditController', ['$scope', '$state', '$http', '$stateParams', '$translate', '$filter', 'util',
            function ($scope, $state, $http, $stateParams, $translate, $filter, util) {
                var self = this;
                self.init = function () {
                    self.langStyle = util.langStyle();
                    self.multiLang = util.getParams('editLangs');
                    self.saving = false;
                    // 表单提交 商城信息
                    self.form = {};
                    // 多语言
                    self.form.shopName = {};

                    self.saving = false;
                    self.loading = false;

                    self.ShopID = $scope.app.maskParams.ShopID
                    self.ShopType = $scope.app.maskParams.ShopType
                    self.form.shopName = $scope.app.maskParams.ShopName
                    self.form.AdminSMSPhone = $scope.app.maskParams.AdminSMSPhone
                    self.form.ContactDimension = $scope.app.maskParams.ContactDimension
                    self.form.ContactLongitude = $scope.app.maskParams.ContactLongitude
                    self.form.ContactName = $scope.app.maskParams.ContactName
                    self.form.ContactAdress = $scope.app.maskParams.ContactAdress
                    self.form.ContactTelephone = $scope.app.maskParams.ContactTelephone
                    if ($scope.app.maskParams.QrCodeURL) {
                        self.imgs = new util.initUploadImgs([{
                            "ImageURL": $scope.app.maskParams.QrCodeURL,
                            "ImageSize": 0
                        }], self, $scope, 'imgs', true);
                        self.imgs.initImgs()
                    } else {
                        self.imgs = new util.initUploadImgs([], self, $scope, 'imgs', true);
                    }
                }

                self.cancel = function () {
                    $scope.app.showHideMask(false);
                }

                self.saveForm = function () {
                    var shopList = {
                        "ShopID": self.ShopID,
                        "ContactAdress": self.form.ContactAdress,
                        "ShopType": self.ShopType,
                        "ShopName": self.form.shopName,
                        "ContactDimension": 0,
                        "ContactLongitude": 0,
                        "ContactName": self.form.ContactName,
                        "ContactTelephone": self.form.ContactTelephone,
                        "AdminSMSPhone": self.form.AdminSMSPhone,
                        'QrCodeURL': self.imgs.data[0].src ? self.imgs.data[0].src : null
                    }
                    var data = {
                        "action": "editMgtShop",
                        "token": util.getParams("token"),
                        "lang": self.langStyle,
                        "shop": shopList
                    };
                    data = JSON.stringify(data);
                    self.saving = true;

                    $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('fxshopinfo', '', 'server'),
                        data: data
                    }).then(function successCallback (data, status, headers, config) {
                        if (data.data.rescode == "200") {
                            alert('编辑成功')
                            $state.reload();
                        } else if (data.data.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login')
                        } else {
                            alert('编辑失败， ' + data.data.errInfo);
                        }
                    }, function errorCallback (data, status, headers, config) {
                        alert('编辑失败， ' + data.data.errInfo);
                    }).finally(function (value) {
                        self.saving = false;
                    });
                }

                self.delete = function () {
                    if (confirm("确定要删除此分类吗？")) {
                        var data = {
                            "lang": self.langStyle,
                            "action": "delMgtShop",
                            "token": util.getParams("token"),
                            "shop": {
                                "ShopID": self.ShopID
                            }
                        };
                        data = JSON.stringify(data);
                        $http({
                            method: $filter('ajaxMethod')(),
                            url: util.getApiUrl('fxshopinfo', '', 'server'),
                            data: data
                        }).then(function successCallback (data, status, headers, config) {
                            if (data.data.rescode == "200") {
                                alert('删除成功')
                                $state.reload();
                            } else if (data.data.rescode == "401") {
                                alert('访问超时，请重新登录');
                                $state.go('login');
                            } else {
                                alert('删除失败， ' + data.data.errInfo);
                            }
                        }, function errorCallback (data, status, headers, config) {
                            alert('连接服务器出错')
                        }).finally(function (value) {
                            self.loading = false;
                        });
                    }
                }

                self.clickUpload = function (e) {
                    setTimeout(function () {
                        document.getElementById(e).click();
                    }, 0);
                }
            }
        ])

        // 商品列表
        .controller('advanceGoodsController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'NgTableParams', 'util',
            function ($scope, $state, $http, $stateParams, $filter, NgTableParams, util) {
                var self = this;
                self.init = function () {
                    self.maskParams = $scope.app.maskParams;
                    $scope.app.maskParams.getGoodsCategory = self.getGoodsCategory
                    self.selectedCate = 'all'
                    self.stateParams = $stateParams;
                    self.langStyle = util.langStyle();
                    self.multiLang = util.getParams('editLangs');

                    self.noData = false;
                    self.loading = false;

                    self.getGoodsCategory();
                }

                self.shopEdit = function () {
                    $scope.app.maskParams.ShopID = $stateParams.ShopID;
                    $scope.app.maskParams.ShopName = self.maskParams.ShopName;
                    $scope.app.maskParams.AdminSMSPhone = self.maskParams.AdminSMSPhone;
                    $scope.app.maskParams.ContactDimension = self.maskParams.ContactDimension;
                    $scope.app.maskParams.ContactLongitude = self.maskParams.ContactLongitude;
                    $scope.app.maskParams.ContactName = self.maskParams.ContactName;
                    $scope.app.maskParams.ContactTelephone = self.maskParams.ContactTelephone;
                    $scope.app.showHideMask(true, 'pages/advanceGoods/advanceShopEdit.html');
                }

                self.addCate = function () {
                    $scope.app.maskParams.ShopID = self.stateParams.ShopID - 0
                    $scope.app.maskParams.categoryAmount = self.categoryList.length
                    $scope.app.showHideMask(true, 'pages/advanceGoods/categoryAdd.html');
                }

                self.editCate = function () {
                    $scope.app.maskParams.ShopID = self.stateParams.ShopID - 0
                    $scope.app.maskParams.categoryAmount = self.categoryList.length
                    $scope.app.showHideMask(true, 'pages/advanceGoods/categoryEdit.html');
                }

                self.deleteCate = function () {
                    if (confirm("确定要删除此分类吗？")) {
                        var data = {
                            "lang": self.langStyle,
                            "action": "delMgtProductCategory",
                            "token": util.getParams("token"),
                            "ShopGoodsCategoryID": self.selectedCate
                        };
                        data = JSON.stringify(data);
                        $http({
                            method: $filter('ajaxMethod')(),
                            url: util.getApiUrl('fxshopinfo', '', 'server'),
                            data: data
                        }).then(function successCallback (data, status, headers, config) {
                            if (data.data.rescode == "200") {
                                alert('删除成功')
                                // $state.reload();
                                self.getGoodsCategory();
                            } else if (data.data.rescode == "401") {
                                alert('访问超时，请重新登录');
                                $state.go('login');
                            } else {
                                alert('删除失败， ' + data.data.errInfo);
                            }
                        }, function errorCallback (data, status, headers, config) {
                            alert('连接服务器出错')
                        }).finally(function (value) {
                            self.loading = false;
                        });
                    }
                }

                self.addGoods = function () {
                    $scope.app.maskParams.cadeId = self.selectedCate
                    $scope.app.maskParams.search = self.search
                    $scope.app.showHideMask(true, 'pages/advanceGoods/advanceGoodsAdd.html');
                }

                self.editGoods = function (productId) {
                    $scope.app.maskParams.cadeId = self.selectedCate
                    $scope.app.maskParams.productId = productId
                    $scope.app.maskParams.search = self.search
                    $scope.app.showHideMask(true, 'pages/advanceGoods/advanceGoodsEdit.html');
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
                                var data
                                if (self.selectedCate == 'all') {
                                    data = JSON.stringify({
                                        "token": util.getParams('token'),
                                        "action": "getProductListByAllCategory",
                                        "lang": util.langStyle(),
                                        "ShopID": $stateParams.ShopID,
                                        "page": paramsUrl.page - 0,
                                        "count": paramsUrl.count - 0
                                    })
                                } else {
                                    data = JSON.stringify({
                                        "token": util.getParams('token'),
                                        "action": "getProductListByCategory",
                                        "lang": util.langStyle(),
                                        "ShopID": $stateParams.ShopID,
                                        "ShopGoodsCategoryID": self.selectedCate,
                                        "page": paramsUrl.page - 0,
                                        "count": paramsUrl.count - 0
                                    })
                                }
                                self.loading = true;
                                self.noData = false;

                                return $http({
                                    method: 'POST',
                                    url: util.getApiUrl('fxshopinfo', '', 'server'),
                                    data: data
                                }).then(function successCallback (response) {
                                    var data = response.data;
                                    if (data.rescode == '200') {
                                        if (data.total == 0) {
                                            self.noData = true;
                                        }
                                        params.total(data.data.productTotal);
                                        return data.data.productList;
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
                        url: util.getApiUrl('fxshopinfo', '', 'server'),
                        data: data
                    }).then(function successCallback (data, status, headers, config) {
                        if (data.data.rescode == "200") {
                            if (data.data.data.categoryList.length == 0) {
                                self.noData = true;
                            }
                            self.categoryList = data.data.data.categoryList;

                            self.gotoShopCate = {'id': 'all', name: {'en-US': 'All', 'zh-CN': '全部商城'}};
                            if ($stateParams.ShopGoodsCategoryID) {
                                for (var i = 0; i < self.categoryList.length; i++) {
                                    if ($stateParams.ShopGoodsCategoryID == self.categoryList[i].id) {
                                        self.gotoShopCate = self.categoryList[i];
                                        break;
                                    }
                                }
                            }
                            self.goTo(self.gotoShopCate.id, self.gotoShopCate.name, self.gotoShopCate.pic, self.gotoShopCate.seq);
                        } else if (data.data.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login')
                        } else {
                            alert('添加失败， ' + data.data.errInfo);
                        }
                    }, function errorCallback (data, status, headers, config) {
                        alert('连接服务器出错')
                    }).finally(function (value) {
                        self.loading = false;
                    });
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
                    for (var i = 0; i < categoryList.length; i++) {
                        self.categoryObj[productId].push(categoryList[i]['ShopGoodsCategoryID']);
                    }
                    var index = self.categoryObj[productId].indexOf(categoryId);
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
                        }
                    };
                    data = JSON.stringify(data);
                    $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('fxshopinfo', '', 'server'),
                        data: data
                    }).then(function successCallback (data, status, headers, config) {
                        console.log(data)
                        alert('修改分类成功');
                    }, function errorCallback (data, status, headers, config) {
                        alert("修改失败" + data.errInfo);
                        $state.reload('app.shop.goods.goodsList')
                    });
                }

                self.JSONstringfy = function (data) {
                    return JSON.stringify(data)
                }
                //点击分类
                self.goTo = function (id, name, seq) {
                    self.selectedCate = id
                    $scope.app.maskParams.cateId = id
                    $scope.app.maskParams.cateName = name
                    $scope.app.maskParams.cateSeq = seq
                    self.search();
                }
            }
        ])
        .controller('advanceGoodsAddController', ['$scope', '$rootScope', '$state', '$http', '$stateParams', '$filter', 'util', 'CONFIG',
            function ($scope, $rootScope, $state, $http, $stateParams, $filter, util, CONFIG) {
                console.log('goodsAddController');

                var self = this;
                self.init = function () {
                    self.shopId = $stateParams.ShopID;
                    self.shopGoodsCategoryId = $scope.app.maskParams.cadeId;
                    self.imgs = new util.initUploadImgs([], self, $scope, 'imgs', true);
                    self.imgs1 = new util.initUploadImgs([], self, $scope, 'imgs1');
                    self.imgEditing = false;

                    self.seq = $scope.app.maskParams.currentAmount + 1;

                    // 时间控件设置
                    setTime('useStartTime', 'useEndTime');

                    // 时间控件设置
                    setTime('saleStartTime', 'saleEndTime');

                    self.ueConfig = {
                        toolbar: ['source | undo redo | bold italic underline | justifyleft justifyright justifycenter | fontsize | formatmatch | forecolor backcolor | removeformat '],
                        autoHeightEnabled: false,
                        // initialContent:'<p>编辑器</p>',
                        fontsize: [10, 11, 12, 14, 16, 18, 20, 24, 36]
                    }
                    // UM.delEditor('container');  // 解决关闭弹窗后，第二次无法加载
                    // self.productInfo = UM.getEditor('container', {
                    //     toolbar: ['source | undo redo | bold italic underline | justifyleft justifyright justifycenter | fontsize | formatmatch | forecolor backcolor | removeformat '],
                    //     autoHeightEnabled:false,
                    //     // initialContent:'<p>编辑器</p>',
                    //     fontsize:[10, 11, 12, 14, 16, 18, 20, 24, 36]
                    // })
                    // self.productInfo.addListener('contentChange', function () {
                    //     $scope.$apply(function () {
                    //         self.htmlIntro = self.productInfo.getContent()
                    //     })
                    // });
                }

                self.insertImg = function (src) {
                    $rootScope.$broadcast('addImg', '<img src="' + src + '" />');
                }

                self.imgEdit = function () {
                    self.imgEditing = true;
                }
                self.imgFinish = function () {
                    self.imgEditing = false;
                }

                self.cancel = function () {
                    $scope.app.showHideMask(false);
                }

                self.addGoods = function () {

                    // 配送方式检查
                    if (!self.byDelivery && !self.bySelf) {
                        alert('请选择配送方式');
                        return;
                    }

                    // 图片不能为空
                    if (self.imgs.data.length == 0) {
                        alert('请上传封面图片');
                        return;
                    }
                    // 图片不能未传完
                    else if (self.imgs.data.some(function (e, i, a) {
                            return e.progress < 100 && e.progress !== -1
                        })) {
                        alert('请等待图片上传完成');
                        return;
                    }

                    var imgSrc1 = [];
                    var l1 = self.imgs1.data;
                    for (var j = 0; j < l1.length; j++) {
                        imgSrc1[j] = {};
                        imgSrc1[j].ImageURL = l1[j].src;
                        imgSrc1[j].Seq = j;
                        imgSrc1[j].ImageSize = Number(l1[j].fileSize);
                    }

                    var data = JSON.stringify({
                        "action": "addMgtProductDetail",
                        "token": util.getParams('token'),
                        "lang": util.langStyle(),
                        "product": {
                            "ShopID": self.shopId,
                            "categoryId": self.shopGoodsCategoryId == 'all' ? -1 : self.shopGoodsCategoryId,
                            "useStartDate": self.useStartTime,
                            "htmlIntro": self.htmlIntro,
                            "useEndDate": self.useEndTime,
                            "name": {
                                "zh-CN": self.name
                            },
                            "img": self.imgs.data[0].src,
                            "title": {
                                "zh-CN": self.title
                            },
                            "saleNumByOne": self.saleNumByOne,
                            "bySelfSupport": self.bySelf ? 1 : 0,
                            "price": self.price * 100,
                            "buyNotes": {
                                "zh-CN": self.buyNotes
                            },
                            "pricePub": self.pricePub * 100,
                            "expressSupport": self.byDelivery ? 1 : 0,
                            "commission": self.commission * 100,
                            "intro": {
                                "zh-CN": self.intro
                            },
                            "imgSrc": imgSrc1,
                            "invetory": self.invetory,
                            "saleStartDate": self.saleStartTime,
                            "saleEndDate": self.saleEndTime,
                            "seq": self.seq
                        }
                    });
                    self.saving = true;
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('fxshopinfo', '', 'server'),
                        data: data
                    }).then(function successCallback (data, status, headers, config) {
                        if (data.data.rescode == "200") {
                            alert('添加成功');
                            $scope.app.maskParams.search();
                            $scope.app.showHideMask(false);
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

                function setTime (start, end) {
                    self[start] = $filter('date')(new Date(), 'yyyy-MM-dd') + ' 00:00:00'
                    self[end] = $filter('date')(new Date(), 'yyyy-MM-dd') + ' 00:00:00'
                    var option = {
                        startEl: '#' + start,
                        endEl: '#' + end,
                        type: 'datetime'
                    }

                    // 日期选择-开始时间
                    laydate.render({
                        elem: option.startEl,
                        btns: ['now', 'confirm'],
                        type: option.type,
                        done: function (value, date, endDate) {
                            $scope.$apply(function () {
                                self[start] = value
                            })
                        }
                    });
                    // 日期选择-结束时间
                    laydate.render({
                        elem: option.endEl,
                        btns: ['now', 'confirm'],
                        type: option.type,
                        done: function (value, date, endDate) {
                            $scope.$apply(function () {
                                self[end] = value
                            })
                        }
                    });
                }
            }
        ])
        .controller('advanceGoodsEditController', ['$scope', '$rootScope', '$state', '$http', '$stateParams', '$filter', 'util', 'CONFIG',
            function ($scope, $rootScope, $state, $http, $stateParams, $filter, util, CONFIG) {
                console.log('goodsAddController');

                var self = this;
                self.init = function () {
                    self.shopId = $stateParams.ShopID;
                    self.productId = $scope.app.maskParams.productId;
                    self.imgEditing = false;
                    self.loadGoods();

                    self.ueConfig = {
                        toolbar: ['source | undo redo | bold italic underline | justifyleft justifyright justifycenter | fontsize | formatmatch | forecolor backcolor | removeformat '],
                        autoHeightEnabled: false,
                        fontsize: [10, 11, 12, 14, 16, 18, 20, 24, 36]
                    }
                }

                self.insertImg = function (src) {
                    $rootScope.$broadcast('addImg', '<img src="' + src + '" />');
                }

                self.imgEdit = function () {
                    self.imgEditing = true;
                }
                self.imgFinish = function () {
                    self.imgEditing = false;
                }

                self.cancel = function () {
                    $scope.app.showHideMask(false);
                }

                self.loadGoods = function () {
                    var data = JSON.stringify({
                        "action": "getMgtProductDetail",
                        "token": util.getParams('token'),
                        "lang": "zh-CN",
                        "ShopID": self.shopId,
                        "productId": self.productId
                    });
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('fxshopinfo', '', 'server'),
                        data: data
                    }).then(function successCallback (data, status, headers, config) {
                        if (data.data.rescode == "200") {
                            self.product = data.data.data.product
                            setData(self.product);  // 赋值
                        } else {
                            alert('添加失败，错误编码：' + data.data.rescode + '，' + data.data.errInfo);
                        }
                    }, function errorCallback (data, status, headers, config) {
                        alert('连接服务器出错');
                    }).finally(function (value) {
                        self.saving = false;
                    });
                }


                self.save = function () {
                    // 配送方式检查
                    if (!self.byDelivery && !self.bySelf) {
                        alert('请选择配送方式');
                        return;
                    }

                    // 图片不能为空
                    if (self.imgs.data.length == 0) {
                        alert('请上传封面图片');
                        return;
                    }
                    // 图片不能未传完
                    else if (self.imgs.data.some(function (e, i, a) {
                            return e.progress < 100 && e.progress !== -1
                        })) {
                        alert('请等待图片上传完成');
                        return;
                    }

                    var imgSrc1 = [];
                    var l1 = self.imgs1.data;
                    for (var j = 0; j < l1.length; j++) {
                        imgSrc1[j] = {};
                        imgSrc1[j].ImageURL = l1[j].src;
                        imgSrc1[j].Seq = j;
                        imgSrc1[j].ImageSize = Number(l1[j].fileSize);
                    }

                    var data = JSON.stringify({
                        "action": "editMgtProductDetail",
                        "token": util.getParams('token'),
                        "lang": util.langStyle(),
                        "product": {
                            "ShopID": self.shopId,
                            "productID": self.productId,
                            "categoryId": self.shopGoodsCategoryId == 'all' ? -1 : self.shopGoodsCategoryId,
                            "useStartDate": self.useStartTime,
                            "htmlIntro": self.htmlIntro,
                            "useEndDate": self.useEndTime,
                            "name": {
                                "zh-CN": self.name
                            },
                            "img": self.imgs.data[0].src,
                            "title": {
                                "zh-CN": self.title
                            },
                            "saleNumByOne": self.saleNumByOne,
                            "bySelfSupport": self.bySelf ? 1 : 0,
                            "price": self.price * 100,
                            "buyNotes": {
                                "zh-CN": self.buyNotes
                            },
                            "pricePub": self.pricePub * 100,
                            "expressSupport": self.byDelivery ? 1 : 0,
                            "commission": self.commission * 100,
                            "intro": {
                                "zh-CN": self.intro
                            },
                            "imgSrc": imgSrc1,
                            "invetory": self.invetory,
                            "saleStartDate": self.saleStartTime,
                            "saleEndDate": self.saleEndTime,
                            "seq": self.seq
                        }
                    });
                    self.saving = true;
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('fxshopinfo', '', 'server'),
                        data: data
                    }).then(function successCallback (data, status, headers, config) {
                        if (data.data.rescode == "200") {
                            alert('保存成功');
                            $scope.app.maskParams.search();
                            $scope.app.showHideMask(false);
                        } else {
                            alert('保存失败，错误编码：' + data.data.rescode + '，' + data.data.errInfo);
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

                function setTime (start, end, timeObj) {
                    if (timeObj) {
                        self[start] = timeObj.startTime
                        self[end] = timeObj.endTime
                    } else {
                        self[start] = $filter('date')(new Date(), 'yyyy-MM-dd') + ' 00:00:00'
                        self[end] = $filter('date')(new Date(), 'yyyy-MM-dd') + ' 00:00:00'
                    }

                    var option = {
                        startEl: '#' + start,
                        endEl: '#' + end,
                        type: 'datetime'
                    }

                    // 日期选择-开始时间
                    laydate.render({
                        elem: option.startEl,
                        btns: ['now', 'confirm'],
                        type: option.type,
                        done: function (value, date, endDate) {
                            $scope.$apply(function () {
                                self[start] = value
                            })
                        }
                    });
                    // 日期选择-结束时间
                    laydate.render({
                        elem: option.endEl,
                        btns: ['now', 'confirm'],
                        type: option.type,
                        done: function (value, date, endDate) {
                            $scope.$apply(function () {
                                self[end] = value
                            })
                        }
                    });
                }

                function setData (obj) {
                    self.title = obj.title['zh-CN']
                    self.name = obj.name['zh-CN']
                    self.intro = obj.intro['zh-CN']
                    self.invetory = obj.invetory
                    self.saleNumByOne = obj.saleNumByOne
                    self.pricePub = Number(obj.pricePub) / 100
                    self.price = Number(obj.price) / 100
                    self.byDelivery = obj.expressSupport == 1
                    self.bySelf = obj.bySelfSupport == 1
                    self.commission = Number(obj.commission) / 100
                    self.buyNotes = obj.buyNotes['zh-CN']
                    self.seq = obj.seq

                    self.imgs = new util.initUploadImgs([{
                        "ImageURL": obj.img,
                        "ImageSize": 0
                    }], self, $scope, 'imgs', true);
                    self.imgs.initImgs();

                    if (obj.imgSrc.length > 0) {
                        self.imgs1 = new util.initUploadImgs(obj.imgSrc, self, $scope, 'imgs1');
                        self.imgs1.initImgs();
                    } else {
                        self.imgs1 = new util.initUploadImgs([], self, $scope, 'imgs1');
                    }

                    // 时间控件设置
                    setTime('useStartTime', 'useEndTime', {
                        startTime: obj.useStartDate,
                        endTime: obj.useEndDate
                    });

                    // 时间控件设置
                    setTime('saleStartTime', 'saleEndTime', {
                        startTime: obj.saleStartDate,
                        endTime: obj.saleEndDate
                    });

                    // 编辑器处理在 /plugin/meta.umeditor.js
                    $rootScope.$broadcast('intContent', obj.htmlIntro);
                }
            }
        ])

        // 分类管理
        .controller('advanceCateAddController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'util', 'CONFIG',
            function ($scope, $state, $http, $stateParams, $filter, util, CONFIG) {
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
                    self.seq = self.maskParams.categoryAmount + 1;
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
                            "ShopID": self.maskParams.ShopID - 0,
                            "seq": self.seq
                        }
                    };
                    data = JSON.stringify(data);
                    $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('fxshopinfo', '', 'server'),
                        data: data
                    }).then(function successCallback (data, status, headers, config) {
                        if (data.data.rescode == "200") {
                            alert('分类添加成功');
                            $scope.app.maskParams.getGoodsCategory();
                            self.cancel();
                        } else if (data.data.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login')
                        } else {
                            alert('添加失败， ' + data.data.errInfo);
                        }
                    }, function errorCallback (data, status, headers, config) {
                        alert('连接服务器出错')
                    }).finally(function (value) {
                        self.saving = false;
                    });
                }
            }
        ])
        .controller('advanceCateEditController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'util', 'CONFIG',
            function ($scope, $state, $http, $stateParams, $filter, util, CONFIG) {
                console.log('categoryEditController');

                var self = this;
                self.init = function () {
                    self.stateParams = $stateParams;
                    self.maskParams = $scope.app.maskParams;
                    self.langStyle = util.langStyle();
                    self.multiLang = util.getParams('editLangs');
                    self.id = self.maskParams.cateId;
                    self.name = self.maskParams.cateName;
                    self.seq = self.maskParams.cateSeq;

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
                            "ShopGoodsCategoryID": self.id,
                            "ShopGoodsCategoryName": self.name,
                            "seq": self.seq
                        }
                    };
                    data = JSON.stringify(data);
                    $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('fxshopinfo', 'shopList', 'server'),
                        data: data
                    }).then(function successCallback (data, status, headers, config) {
                        alert('分类修改成功')
                        $state.reload();
                    }, function errorCallback (data, status, headers, config) {

                    }).finally(function (value) {
                        self.saving = false;
                    })

                };

                // 图片上传相关
                self.clickUpload = function (e) {
                    setTimeout(function () {
                        document.getElementById(e).click();
                    }, 0);
                }

                function Imgs (imgList, single) {
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

                        var file = e;
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
                                        console && console.log(percentComplete);
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
                                        // 如果长度大于1张图片，删除前几张图片
                                        if (o.data.length > 1) {
                                            for (var i = 0; i < o.data.length - 1; i++) {
                                                o.deleteById(o.data[i].id);
                                            }
                                        }
                                    }
                                });
                            },
                            function (xhr) {
                                $scope.$apply(function () {
                                    o.update(fileId, -1, '', '');
                                });
                                console && console.log('failure');
                                xhr.abort();
                            }
                        );
                    }
                }
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
                        // {'code': 'ACCEPT', active: false, 'name': {'zh-CN': '待发货'}},
                        // {'code': 'DELIVERING', active: false, 'name': {'zh-CN': '待收货'}},
                        {'code': 'COMPLETED', active: false, 'name': {'zh-CN': '订单完成'}},
                        {'code': 'REFUNDING', active: false, 'name': {'zh-CN': '退款中'}},
                        {'code': 'CANCELED', active: false, 'name': {'zh-CN': '已取消'}}
                    ];
                    self.searchStr.status = '';

                    self.loadShopList().then(function () {
                        self.search();
                    });
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
                        url: util.getApiUrl('fxshoporder', '', 'server'),
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
                        url: util.getApiUrl('fxshoporder', '', 'server'),
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
                        url: util.getApiUrl('fxshoporder', '', 'server'),
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
                        url: util.getApiUrl('fxshoporder', '', 'server'),
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
                        "action": "getMgtShopList",
                        "lang": util.langStyle()
                    })
                    self.loadingShopList = true;
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('fxshopinfo', '', 'server'),
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
                                    "per_page": paramsUrl.count - 0
                                });
                                self.loading = true;
                                self.noData = false;

                                return $http({
                                    method: 'POST',
                                    url: util.getApiUrl('fxshoporder', '', 'server'),
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
                    $scope.app.showHideMask(true, 'pages/advanceGoods/advanceOrderDetail.html');
                }
            }
        ])
        .controller('advanceOrderDetailController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
            function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
                var self = this;

                self.init = function () {
                    self.id = $scope.app.maskParams.orderId;
                    self.deliverInfo = $scope.app.maskParams.orderInfo;
                    self.accept = $scope.app.maskParams.accept;
                    self.reject = $scope.app.maskParams.reject;
                    self.deliver = $scope.app.maskParams.deliver;
                    self.search = $scope.app.maskParams.search;
                    self.finish = $scope.app.maskParams.finish;
                    self.cancel = $scope.app.maskParams.cancel;
                    self.setInvoice = $scope.app.maskParams.setInvoice;
                    self.editDeliverInfo = $scope.app.maskParams.editDeliverInfo;
                    self.getInfo();
                }

                self.getInfo = function () {
                    var data = JSON.stringify({
                        "token": util.getParams('token'),
                        "action": "getOrderDetailByID",
                        "lang": util.langStyle(),
                        "OrderID": self.id
                    })

                    self.loading = true;

                    $http({
                        method: 'POST',
                        url: util.getApiUrl('fxshoporder', '', 'server'),
                        data: data
                    }).then(function successCallback (response) {
                        var data = response.data;
                        if (data.rescode == '200') {
                            self.info = data.data;
                        } else if (data.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert('获取信息失败' + data.errInfo);
                        }
                    }, function errorCallback (response) {
                        alert('连接服务器出错');
                    }).finally(function (value) {
                        self.loading = false;
                    });
                }

                self.close = function () {
                    $scope.app.showHideMask(false);
                }
            }
        ])
})();