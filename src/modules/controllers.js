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

                    console.log(util.getParams('editLangs'))

                }

                self.setFocusApp = function (id) {
                    var l = $scope.appList;
                    for (var i = 0; i < l.length; i++) {
                        if (l[i].id == id) {
                            self.activeAppName = l[i].name;
                            self.activeAppBgColor = l[i].bgColor;
                            break;
                        }
                    }
                }

                // 1:酒店客房，3:移动商城
                self.switchApp = function (n) {
                    self.appPhase = 2;
                    self.setFocusApp(n);
                    switch (n) {
                        case 1:
                            $state.go('app.hotelRoom', {'appId': n});
                            break;
                        case 3:
                            $state.go('app.shop', {'appId': n});
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
            }
        ])


        .controller('shopController', ['$scope', '$state', '$translate', '$http', '$stateParams', '$filter', 'util',
            function ($scope, $state, $translate, $http, $stateParams, $filter, util) {
                console.log('shopController')
                var self = this;
                self.init = function () {
                    self.langStyle = util.langStyle();
                    self.multiLang = [{
                        "name": "中文",
                        "code": "zh-CN"
                    }, {
                        "name": "en",
                        "code": "en-US"
                    }]
                    console.log(self.langStyle)
                    console.log(self.multiLang)
                    self.searchShopList();


                }

                self.searchShopList = function () {
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
                        console.log(data)
                        self.shopList = data.data.data.shopList;
                        // 默认加载 第一个 商城
                        self.shopFirst = self.shopList[0];
                        $state.go('app.shop.goods', {
                            ShopID: self.shopFirst.ShopID,
                            HotelID: self.shopFirst.HotelID,
                            ShopName: self.shopFirst.ShopName[self.langStyle],
                            HotelName: self.shopFirst.HotelName[self.langStyle]
                        });
                    }, function errorCallback(data, status, headers, config) {

                    });
                }

                self.shopAdd = function () {
                    $scope.app.maskParams = {'test': '12'};
                    $scope.app.maskUrl = 'pages/shopAdd.html';
                }
            }
        ])

        .controller('shopAddController', ['$scope', '$state', '$http', '$stateParams', '$translate', '$filter', 'util',
            function ($scope, $state, $http, $stateParams, $translate, $filter, util) {
                console.log('shopAddController');

                var self = this;
                self.init = function () {
                    self.langStyle = util.langStyle();
                    // self.multiLang = util.getParams('editLangs');
                    // 假数据
                    self.multiLang = [{
                        "name": "中文",
                        "code": "zh-CN"
                    }, {
                        "name": "en",
                        "code": "en-US"
                    }]
                    console.log(self.langStyle)
                    self.searchHotelList();
                    // 表单提交 商城信息
                    self.form = {};
                    // 多语言
                    self.form.shopName = {};
                }

                self.cancel = function () {
                    console.log('cancel')
                    $scope.app.maskUrl = '';
                }

                self.searchHotelList = function () {
                    var data = {
                        "action": "getMgtHotelInfo",
                        "token": util.getParams("token"),
                        "lang": self.langStyle
                    };
                    data = JSON.stringify(data);
                    $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('shopinfo', 'shopList', 'server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        console.log(data)
                        self.hotelList = data.data.data.hotelList;
                        // self.hotelList = [{
                        //     "HotelID": 1,
                        //     "HotelName": { "zh-CN": "上海门店" }
                        // },{
                        //     "HotelID": 2,
                        //     "HotelName": { "zh-CN": "北京门店" }
                        // }]


                    }, function errorCallback(data, status, headers, config) {

                    });
                }

                self.saveForm = function () {
                    console.log(self.form.HotelID)
                    var shopList = {
                        "HotelID": self.form.HotelID - 0,
                        "ShopName": self.form.shopName,
                        "ShopType": "wx"
                    }
                    var data = {
                        "action": "addMgtHotelShop",
                        "token": util.getParams("token"),
                        "lang": self.langStyle,
                        "shopList": [shopList]
                    };
                    data = JSON.stringify(data);
                    $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('shopinfo', 'shopList', 'server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        alert('添加成功')
                        $state.reload();
                    }, function errorCallback(data, status, headers, config) {

                    });
                }

            }
        ])

        .controller('goodsController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'util',
            function ($scope, $state, $http, $stateParams, $filter, util) {
                console.log('goodsController');
                console.log($stateParams);
                var self = this;
                self.init = function () {
                    self.stateParams = $stateParams;
                    self.langStyle = util.langStyle();
                    // self.multiLang = util.getParams('editLangs');
                    // 假数据
                    self.multiLang = [{
                        "name": "中文",
                        "code": "zh-CN"
                    }, {
                        "name": "en",
                        "code": "en-US"
                    }];
                    self.getGoodsCategory();
                }

                self.categoryAdd = function () {
                    console.log('categoryAdd')
                    $scope.app.maskParams = {'ShopID': self.stateParams.ShopID - 0};
                    $scope.app.maskUrl = 'pages/categoryAdd.html';
                }


                self.shopEdit = function () {
                    console.log('shopEdit')
                    $scope.app.maskParams = {
                        ShopID: $stateParams.ShopID,
                        ShopName: $stateParams.ShopName,
                        HotelID: $stateParams.HotelID
                    };
                    $scope.app.maskUrl = 'pages/shopEdit.html';
                }
                // 商品分类列表
                self.getGoodsCategory = function () {
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
                        console.log(data)
                        self.categoryList = data.data.data.categoryList;
                        // 默认加载 全部分类
                        $state.go('app.shop.goods.goodsList', {
                            ShopGoodsCategoryID: 'all',
                            ShopGoodsCategoryName: '全部商品'
                        })
                    }, function errorCallback(data, status, headers, config) {

                    });
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
                    $scope.app.maskUrl = '';
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
                            "price": self.price,
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
                            self.invetory = data.product.invetory;
                            self.price = data.product.price;
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
                    $scope.app.maskUrl = '';
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
                            "price": self.price,
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
                            $state.reload();
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
                console.log('$stateParams: ' + $stateParams);
                var self = this;
                self.init = function () {
                    self.maskParams = $scope.app.maskParams;
                    console.log(self.maskParams);

                    self.langStyle = util.langStyle();
                    // self.multiLang = util.getParams('editLangs');
                    // 假数据
                    self.multiLang = [{
                        "name": "中文",
                        "code": "zh-CN"
                    }, {
                        "name": "en",
                        "code": "en-US"
                    }];
                    // 表单提交 商城信息
                    self.form = {};
                    // 多语言
                    self.form.shopName = {};

                    self.searchHotelList();
                }

                self.cancel = function () {
                    console.log('cancel')
                    $scope.app.maskUrl = '';
                };

                self.searchHotelList = function () {
                    var data = {
                        "action": "getMgtHotelInfo",
                        "token": util.getParams("token"),
                        "lang": self.langStyle
                    };
                    data = JSON.stringify(data);
                    $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('shopinfo', 'shopList', 'server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        console.log(data)
                        // self.hotelList = data.data.data.hotelList;
                        self.hotelList = [{
                            "HotelID": 1,
                            "HotelName": {"zh-CN": "上海门店"}
                        }, {
                            "HotelID": 2,
                            "HotelName": {"zh-CN": "北京门店"}
                        }]


                    }, function errorCallback(data, status, headers, config) {

                    });
                }
                self.saveForm = function () {
                    console.log(self.form.HotelID)
                    var shopList = {
                        "HotelID": self.form.HotelID - 0,
                        "ShopName": self.form.shopName,
                        "ShopType": "wx"
                    }
                    var data = {
                        "action": "addMgtHotelShop",
                        "token": util.getParams("token"),
                        "lang": self.langStyle,
                        "shopList": [shopList]
                    };
                    data = JSON.stringify(data);
                    $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('shopinfo', 'shopList', 'server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        alert('修改成功')
                        $state.reload();
                    }, function errorCallback(data, status, headers, config) {

                    });
                };

                self.deleteShop = function () {
                    var flag = confirm('确认删除？')
                    if (!flag) {
                        return;
                    }
                    var shopList = {
                        "HotelID": self.form.HotelID - 0,
                        "ShopName": self.form.shopName,
                        "ShopType": "wx"
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
                        alert('删除成功')
                        $state.reload();
                    }, function errorCallback(data, status, headers, config) {

                    });
                }

            }
        ])


        .controller('categoryAddController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'util',
            function ($scope, $state, $http, $stateParams, $filter, util) {
                console.log('categoryAddController');
                console.log($stateParams);
                var self = this;
                self.init = function () {
                    self.langStyle = util.langStyle();
                    self.maskParams = $scope.app.maskParams;
                    console.log(self.maskParams);
                    // self.multiLang = util.getParams('editLangs');
                    // 假数据
                    self.multiLang = [{
                        "name": "中文",
                        "code": "zh-CN"
                    }, {
                        "name": "en",
                        "code": "en-US"
                    }];
                    // 表单提交 商城信息
                    self.form = {};
                    // 多语言
                    self.form.shopName = {};
                }

                self.cancel = function () {
                    console.log('cancel')
                    $scope.app.maskUrl = '';
                }

                self.saveForm = function () {
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
                        alert('分类添加成功');
                        $state.reload();
                    }, function errorCallback(data, status, headers, config) {

                    });
                }

            }
        ])

        .controller('categoryEditController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'util',
            function ($scope, $state, $http, $stateParams, $filter, util) {
                console.log('categoryEditController');
                console.log($stateParams);
                console.log($scope.app.maskParams);
                var self = this;
                self.init = function () {
                    self.stateParams = $stateParams;
                    self.maskParams = $scope.app.maskParams;
                    self.langStyle = util.langStyle();
                    // self.multiLang = util.getParams('editLangs');
                    // 假数据
                    self.multiLang = [{
                        "name": "中文",
                        "code": "zh-CN"
                    }, {
                        "name": "en",
                        "code": "en-US"
                    }];
                    // 表单提交 商城信息
                    self.form = {};
                    // 多语言
                    self.form.shopName = {};
                }

                self.cancel = function () {
                    console.log('cancel')
                    $scope.app.maskUrl = '';
                }

                self.saveForm = function () {
                    console.log(self.form.HotelID)
                    console.log(self.form.HotelID)
                    var data = {
                        "action": "editMgtProductCategory",
                        "token": util.getParams("token"),
                        "lang": self.langStyle,
                        "ShopGoodsCategory": {
                            "ShopGoodsCategoryID": self.maskParams.ShopGoodsCategoryID,
                            "ShopGoodsCategoryName": self.form.shopName
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

                    });
                };

            }
        ])

        .controller('goodsListController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'NgTableParams', 'util',
            function ($scope, $state, $http, $stateParams, $filter, NgTableParams, util) {
                console.log('goodsListController');
                console.log($stateParams);
                console.log($scope.app.maskParams);
                var self = this;
                self.init = function () {
                    self.stateParams = $stateParams;
                    self.langStyle = util.langStyle();
                    // self.multiLang = util.getParams('editLangs');
                    // 假数据
                    self.multiLang = [{
                        "name": "中文",
                        "code": "zh-CN"
                    }, {
                        "name": "en",
                        "code": "en-US"
                    }];

                    // 表单提交 商城信息
                    self.form = {};
                    // 多语言
                    self.form.shopName = {};
                    self.getProductList(self.stateParams.ShopGoodsCategoryID);

                }

                self.categoryEdit = function () {
                    $scope.app.maskParams = {'ShopGoodsCategoryID': self.stateParams.ShopGoodsCategoryID - 0};
                    $scope.app.maskUrl = 'pages/categoryEdit.html';
                }

                self.categoryDelete = function () {
                    var flag = confirm('确认删除？')
                    if (!flag) {
                        return;
                    }
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
                        alert('分类删除成功')
                        $state.reload();
                    }, function errorCallback(data, status, headers, config) {

                    });
                }

                self.goodsAdd = function () {
                    $scope.app.maskParams = {
                        'shopId': self.stateParams.ShopID,
                        'shopGoodsCategoryId': self.stateParams.ShopGoodsCategoryID
                    }; //全部分类 ShopGoodsCategoryID －1
                    $scope.app.maskUrl = 'pages/goodsAdd.html';
                }

                self.goodsEdit = function (goodsId) {
                    $scope.app.maskParams = {'productId': goodsId};
                    $scope.app.maskUrl = 'pages/goodsEdit.html';
                }

                self.getProductList = function (ShopGoodsCategoryID) {
                    var data = {
                        "action": "getMgtShopProductList",
                        "token": util.getParams("token"),
                        "lang": self.langStyle,
                        "ShopID": self.stateParams.ShopID - 0,
                    }

                    if (!(ShopGoodsCategoryID == "all")) {
                        data.ShopGoodsCategoryID = self.stateParams.ShopGoodsCategoryID - 0
                    }
                    self.tableParams = new NgTableParams({
                        page: 1,
                        count: 3
                    }, {
                        counts: [3, 6],
                        getData: function (params) {
                            var paramsUrl = params.url();
                            data.count = paramsUrl.count,
                                data.page = paramsUrl.page,
                                data = JSON.stringify(data);
                            $http({
                                method: $filter('ajaxMethod')(),
                                url: util.getApiUrl('shopinfo', 'shopList', 'server'),
                                data: data
                            }).then(function successCallback(data, status, headers, config) {
                                console.log(data)
                                self.productList = data.data.data.productList;
                            }, function errorCallback(data, status, headers, config) {

                            });

                        }
                    })

                }


            }
        ])

        .controller('hotelRoomController', ['$scope',
            function ($scope) {
                var self = this;
                self.init = function () {
                    self.queryHotelList()
                }
                self.queryHotelList = function () {
                    var hotels = [];
                    hotels = [{hotelId: 1, hotelName: 'testhotel1'},
                        {hotelId: 2, hotelName: 'testhotel2'},
                        {hotelId: 3, hotelName: 'testhotel3'}];
                    self.hotels = hotels
                }
            }
        ])

        .controller('roomController', ['$scope', '$http', '$stateParams', '$translate', '$location', 'util', 'NgTableParams',
            function ($scope, $http, $stateParams, $translate, $location, util, NgTableParams) {
                var self = this;
                self.lang = util.langStyle();
                self.init = function () {
                    self.hotelId = $stateParams.hotelId;
                    self.getHotelInfo()
                }
                /**
                 * 获取酒店信息
                 */
                self.getHotelInfo = function () {
                    var data = JSON.stringify({
                        action: "getHotel",
                        token: util.getParams('token'),
                        lang: self.lang,
                        HotelID: Number(self.hotelId)
                    })
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('hotelroom', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            self.hotelName = msg.data.Name;
                            self.hotelAddress = msg.data.Address;
                            self.hotelDescription = msg.data.Description;
                        } else if (msg.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $location.path("pages/login.html");
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    });
                }

                /**
                 * 获取客房列表
                 */
                // ngtable
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
                                var searchName = "";
                                if (self.searchName) {
                                    searchName = self.searchName;
                                }
                                var data = JSON.stringify({
                                    action: "getRoomList",
                                    token: util.getParams('token'),
                                    lang: self.lang,
                                    HotelID: Number(self.hotelId),
                                    page: Number(paramsUrl.page),
                                    per_page: Number(paramsUrl.count)
                                })
                                self.loading = true;
                                self.noData = false;

                                return $http({
                                    method: 'POST',
                                    url: util.getApiUrl('hotelroom', '', 'server'),
                                    data: data
                                }).then(function successCallback(response) {
                                    var msg = response.data;
                                    if (msg.rescode == '200') {
                                        params.total(msg.data.total);
                                        self.rooms = msg.data.roomList;
                                        return msg.data.roomList;
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
                        }
                    );
                }

                self.hotelRoomEdit = function () {
                    $scope.app.maskParams = {'hotelId': self.hotelId};
                    $scope.app.maskUrl = 'pages/hotelRoomEdit.html';
                }

                self.roomAdd = function () {
                    $scope.app.maskParams = {'hotelId': self.hotelId};
                    $scope.app.maskUrl = 'pages/roomAdd.html';
                }

                self.roomEdit = function (roomId) {
                    $scope.app.maskParams = {'hotelId': self.hotelId, 'roomId': roomId};
                    $scope.app.maskUrl = 'pages/roomEdit.html';
                }

                self.roomEditPrice = function (roomId) {
                    $scope.app.maskParams = {'hotelId': self.hotelId, 'roomId': roomId};
                    $scope.app.maskUrl = 'pages/roomEditPrice.html';
                }

                self.roomEditNum = function (roomId) {
                    $scope.app.maskParams = {'hotelId': self.hotelId, 'roomId': roomId};
                    $scope.app.maskUrl = 'pages/roomEditNum.html';
                }
            }
        ])

        .controller('hotelRoomEditController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'util',
            function ($scope, $state, $http, $stateParams, $filter, util) {
                var self = this;
                self.init = function () {
                    self.hotelId = $scope.app.maskParams.hotelId;
                    self.roomId = $scope.app.maskParams.roomId;
                    self.editLangs = util.getParams('editLangs');
                }

                self.cancel = function () {
                    $scope.app.maskUrl = '';
                }
            }
        ])

        .controller('roomAddController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
            function ($scope, $state, $http, $stateParams, $location, util) {
                var self = this;
                var hotelId,
                    lang,
                    token;
                self.uploadId = 1;
                self.init = function () {
                    hotelId = $scope.app.maskParams.hotelId;
                    lang = util.langStyle();
                    token = util.getParams('token');
                    self.getRoomTags();
                    self.editLangs = util.getParams('editLangs');
                }
                self.cancel = function () {
                    $scope.app.maskUrl = '';
                }

                /**
                 * 获取客房标签
                 */
                self.getRoomTags = function () {
                    var roomTags = [];
                    var data = JSON.stringify({
                        action: "getRoomTags",
                        lang: lang,
                        token: token,
                    })
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('room', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            msg.tags.forEach(function (el) {
                                roomTags.push({
                                    tagId: el.ID,
                                    tagName: el.TagName
                                })
                            })
                            self.roomTags = roomTags;
                        } else if (msg.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $location.path("pages/login.html");
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    });
                }
                /**
                 * 保存
                 */
                self.save = function () {
                    var data = JSON.stringify({
                        action: "addRoom",
                        lang: lang,
                        token: token,
                        tags: [],
                        IntroImgs: [],
                        roomDetail: {
                            HotelID: hotelId,
                            RoomTypeName: {}
                        }
                    })
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('room', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            msg.tags.forEach(function (el) {
                                roomTags.push({
                                    tagId: el.ID,
                                    tagName: el.TagName
                                })
                            })
                            self.roomTags = roomTags;
                        } else if (msg.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $location.path("pages/login.html");
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    });
                }
            }
        ])

        .controller('roomEditController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
            function ($scope, $state, $http, $stateParams, $location, util) {
                var self = this;
                var hotelId,
                    lang,
                    token;
                self.uploadId = 1;
                self.init = function () {
                    hotelId = $scope.app.maskParams.hotelId;
                    self.roomId = $scope.app.maskParams.roomId;
                    lang = util.langStyle();
                    token = util.getParams('token');
                    self.getRoomTags();
                    self.editLangs = util.getParams('editLangs');
                }
                self.cancel = function () {
                    $scope.app.maskUrl = '';
                }

                /**
                 * 获取客房标签
                 */
                self.getRoomTags = function () {
                    var roomTags = [];
                    var data = JSON.stringify({
                        action: "getRoomTags",
                        lang: lang,
                        token: token,
                    })
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('room', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            msg.tags.forEach(function (el) {
                                roomTags.push({
                                    tagId: el.ID,
                                    tagName: el.TagName
                                })
                            })
                            self.roomTags = roomTags;
                        } else if (msg.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $location.path("pages/login.html");
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    });
                }
                /**
                 * 保存
                 */
                self.save = function () {
                    var data = JSON.stringify({
                        action: "updateRoom",
                        lang: lang,
                        token: token,
                        roomID: self.roomId,
                        tags: [],
                        IntroImgs: [],
                        roomDetail: {
                            HotelID: hotelId,
                            RoomTypeName: {}
                        }
                    })
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('room', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            msg.tags.forEach(function (el) {
                                roomTags.push({
                                    tagId: el.ID,
                                    tagName: el.TagName
                                })
                            })
                            self.roomTags = roomTags;
                        } else if (msg.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $location.path("pages/login.html");
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(

                    );
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
                    $scope.app.maskUrl = '';
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
                        roomID: self.roomId
                    })
                    self.loading = true;
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('room', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            self.roomDetail.PriceMonday = msg.PriceMonday;
                            self.roomDetail.PriceTuesday = msg.PriceTuesday;
                            self.roomDetail.PriceWednesday = msg.PriceWednesday;
                            self.roomDetail.PriceThursday = msg.PriceThursday;
                            self.roomDetail.PriceFriday = msg.PriceFriday;
                            self.roomDetail.PriceSaturday = msg.PriceSaturday;
                            self.roomDetail.PriceSunday = msg.PriceSunday;
                            for(var i = 0; i < msg.SpecialPrice.length; i++) {
                                msg.SpecialPrice[i].PriceDate = new Date(msg.SpecialPrice[i].PriceDate);
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
                            PriceDate: formatDate(self.SpecialPrice[i].PriceDate),
                            Price: Number(self.SpecialPrice[i].Price),
                            PriceType: "basic"
                        })
                    }
                    var data = JSON.stringify({
                        action: "setRoomPrice",
                        lang: lang,
                        token: token,
                        roomID: self.roomId,
                        SpecialPrice: specialPrice,
                        roomDetail: {
                            PriceMonday: Number(self.roomDetail.PriceMonday),
                            PriceTuesday: Number(self.roomDetail.PriceTuesday),
                            PriceWednesday: Number(self.roomDetail.PriceWednesday),
                            PriceThursday: Number(self.roomDetail.PriceThursday),
                            PriceFriday: Number(self.roomDetail.PriceFriday),
                            PriceSaturday: Number(self.roomDetail.PriceSaturday),
                            PriceSunday: Number(self.roomDetail.PriceSunday)
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
                 * 转换格式为‘yyyy-MM-dd’
                 * @param date
                 * @returns {string}
                 */
                function formatDate(date) {
                    var seperator1 = "-";
                    var month = date.getMonth() + 1;
                    var strDate = date.getDate();
                    if (month >= 1 && month <= 9) {
                        month = "0" + month;
                    }
                    if (strDate >= 0 && strDate <= 9) {
                        strDate = "0" + strDate;
                    }
                    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate;
                    return currentdate;
                }
            }
        ])

        .controller('roomEditNumController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
            function ($scope, $state, $http, $stateParams, $location, util) {
                var self = this;
                var lang,
                    token;
                self.init = function () {
                    self.hotelId = $scope.app.maskParams.hotelId;
                    self.roomId = $scope.app.maskParams.roomId;
                    lang = util.langStyle();
                    token = util.getParams('token');
                    self.SpecialNum = [];
                    self.roomDetail = [];
                    self.load();
                }

                self.cancel = function () {
                    $scope.app.maskUrl = '';
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
                self.deleteTemporary = function ($index) {
                    self.SpecialNum.splice($index, 1);
                }

                /**
                 * 载入客房数量信息
                 */
                self.load = function () {
                    var data = JSON.stringify({
                        action: "getRoomInfoByID",
                        lang: lang,
                        token: token,
                        roomID: self.roomId
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
                            for(var i = 0; i < msg.SpecialNum.length; i++) {
                                msg.SpecialNum[i].AvailableDate = new Date(msg.SpecialNum[i].AvailableDate);
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
                            AvailableDate: formatDate(self.SpecialNum[i].AvailableDate),
                            AvailableNumCurrent: Number(self.SpecialNum[i].AvailableNumCurrent),
                            AvailableNumSet: 999
                        })
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
                 * 转换格式为‘yyyy-MM-dd’
                 * @param date
                 * @returns {string}
                 */
                function formatDate(date) {
                    if (date.length != 10 ) {
                        var seperator1 = "-";
                        var month = date.getMonth() + 1;
                        var strDate = date.getDate();
                        if (month >= 1 && month <= 9) {
                            month = "0" + month;
                        }
                        if (strDate >= 0 && strDate <= 9) {
                            strDate = "0" + strDate;
                        }
                        var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate;
                        return currentdate;
                    }
                    return date;
                }
            }
        ])
})();
