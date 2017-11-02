'use strict';
(function () {
    var app = angular.module('app.ticket', [])
        .controller('ticketController', ['$scope', '$http', '$state', 'util', '$filter', 'NgTableParams', '$location',
            function ($scope, $http, $state, util, $filter, NgTableParams, $location) {
                var self = this, token = util.getParams('token')
                self.init = function () {
                    self.loading = true;
                    self.noData = true;
                    self.selectedCate = 'all'
                    self.loadList();
                    self.loadCateList();
                    $scope.app.maskParams.loadList = self.loadList
                    $scope.app.maskParams.loadCateList = self.loadCateList
                };

                // 加载列表
                self.loadList = function () {
                    var data = JSON.stringify({
                        "action": "getList",
                        "token": token,
                        "data": {
                            'CategoryIDS': self.selectedCate == 'all' ? null : self.selectedCate
                        }
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

                self.loadCateList = function () {
                    var data = JSON.stringify({
                        "action": "getList",
                        "token": token
                    })

                    $http({
                        method: 'POST',
                        url: util.getApiUrl('ticketcategory', '', 'server'),
                        data: data
                    }).then(function successCallback (response) {
                        var data = response.data;
                        console.log(self)
                        if (data.rescode == '200') {
                            self.cateList = data.data
                            $scope.app.maskParams.cateCount = data.data.length
                        } else {
                            alert('读取失败' + data.rescode + ' ' + data.errInfo);
                        }
                    }, function errorCallback (response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (e) {

                    });
                }

                // 添加分类
                self.addCate = function () {
                    $scope.app.showHideMask(true, 'pages/tickets/ticketCateAdd.html');
                }

                // 编辑分类
                self.editCate = function () {
                    $scope.app.showHideMask(true, 'pages/tickets/ticketCateEdit.html');
                }

                // 删除分类
                self.deleteCate = function () {
                    var flag = confirm('确认删除？')
                    if (!flag) {
                        return;
                    }
                    var data = JSON.stringify({
                        "action": "delete",
                        "token": token,
                        "data": {
                            "ID": self.selectedCate
                        }
                    })

                    $http({
                        method: 'POST',
                        url: util.getApiUrl('ticketcategory', '', 'server'),
                        data: data
                    }).then(function successCallback (response) {
                        var data = response.data;
                        if (data.rescode == '200') {
                            alert('删除成功');
                            self.loadCateList();
                        } else {
                            if (data.errInfo == 'Ticket Category is in use.') {
                                data.errInfo = '当前分类仍在使用，不能删除'
                            }
                            alert('操作失败' + data.rescode + ' ' + data.errInfo);
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
                    $scope.app.maskParams.cateList = self.cateList
                    $scope.app.maskParams.selectedCate = self.selectedCate
                    $scope.app.showHideMask(true, 'pages/tickets/ticketAdd.html');
                }

                // 编辑
                self.edit = function (id) {
                    $scope.app.maskParams.ticketId = id
                    $scope.app.maskParams.cateList = self.cateList
                    $scope.app.showHideMask(true, 'pages/tickets/ticketEdit.html');
                }

                //点击分类
                self.goTo = function (id, name, pic, seq) {
                    self.selectedCate = id
                    $scope.app.maskParams.cateId = id

                    self.loadList();
                }
            }
        ])
        .controller('ticketCateAddController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'util', 'CONFIG',
            function ($scope, $state, $http, $stateParams, $filter, util, CONFIG) {
                console.log('categoryAddController');
                console.log($stateParams);
                console.log($scope.app);
                var self = this;
                self.init = function () {
                    self.imgs1 = new Imgs([], true)
                    self.saving = false;
                    self.seq = $scope.app.maskParams.cateCount + 1
                    // self.seq = self.maskParams.categoryAmount + 1;
                }

                self.cancel = function () {
                    console.log('cancel')
                    $scope.app.showHideMask(false);
                }

                self.saveForm = function () {
                    if (!self.imgs1.data[0]) {
                        alert('请上传分类图片');
                        return
                    }
                    self.saving = true;
                    var data = {
                        "action": "add",
                        "token": util.getParams("token"),
                        "data": {
                            "Name": self.cateName,
                            // "Description": self.imgs1.data[0].src
                            "Description": self.cateDes,
                            "Seq": self.seq,
                            "PicURL": self.imgs1.data[0] ? self.imgs1.data[0].src : '',
                            "PicSize": self.imgs1.data[0] ? self.imgs1.data[0].fileSize : 0
                        }
                    };
                    data = JSON.stringify(data);
                    $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('ticketcategory', '', 'server'),
                        data: data
                    }).then(function successCallback (data, status, headers, config) {
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
                    }, function errorCallback (data, status, headers, config) {
                        alert('连接服务器出错')
                    }).finally(function (value) {
                        self.saving = false;
                    });
                }

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
        .controller('ticketCateEditController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'util', 'CONFIG',
            function ($scope, $state, $http, $stateParams, $filter, util, CONFIG) {
                var self = this;
                self.init = function () {
                    self.id = $scope.app.maskParams.cateId;
                    self.load();
                    self.saving = false;
                }

                self.cancel = function () {
                    $scope.app.showHideMask(false);
                }

                self.load = function () {
                    var data = JSON.stringify({
                        "action": "get",
                        "token": util.getParams("token"),
                        "data": {
                            "ID": self.id
                        }
                    })
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('ticketcategory', '', 'server'),
                        data: data
                    }).then(function successCallback (response) {
                        var data = response.data;
                        if (data.rescode == '200') {
                            self.cateName = data.data.Name
                            self.cateDes = data.data.Description
                            self.seq = data.data.Seq
                            if (data.data.PicURL) {
                                self.imgs1 = new Imgs([{"ImageURL": data.data.PicURL, "ImageSize": 0}], true);
                                self.imgs1.initImgs();
                            }
                            else {
                                self.imgs1 = new Imgs([], true);
                            }
                        } else {
                            alert('读取失败' + data.rescode + ' ' + data.errInfo);
                        }
                    }, function errorCallback (response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (e) {

                    });
                }
                self.saveForm = function () {
                    if (!self.imgs1.data[0]) {
                        alert('请上传分类图片');
                        return
                    }
                    self.saving = true;
                    var data = {
                        "action": "edit",
                        "token": util.getParams("token"),
                        "data": {
                            "ID": self.id,
                            "Name": self.cateName,
                            // "Description": self.imgs1.data[0].src
                            "Description": self.cateDes,
                            "Seq": self.seq,
                            "PicURL": self.imgs1.data[0] ? self.imgs1.data[0].src : '',
                            "PicSize": self.imgs1.data[0] ? self.imgs1.data[0].fileSize : 0
                        }
                    };
                    data = JSON.stringify(data);
                    $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('ticketcategory', '', 'server'),
                        data: data
                    }).then(function successCallback (data, status, headers, config) {
                        if (data.data.rescode == "200") {
                            alert('分类修改成功');
                            $scope.app.maskParams.loadCateList()
                            self.cancel();
                        } else if (data.data.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login')
                        } else {
                            alert('修改失败， ' + data.data.errInfo);
                        }
                    }, function errorCallback (data, status, headers, config) {
                        alert('连接服务器出错')
                    }).finally(function (value) {
                        self.saving = false;
                    });
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
        .controller('ticketAddController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
            function ($scope, $state, $http, $stateParams, $location, util) {
                var self = this;
                var lang,
                    token;
                self.init = function () {
                    self.cateList = $scope.app.maskParams.cateList.slice(0);
                    self.cateList.unshift({ID: '', Name: '请选择'})

                    if ($scope.app.maskParams.selectedCate == 'all') {
                        self.selectedCate = ''
                    } else {
                        self.selectedCate = $scope.app.maskParams.selectedCate
                    }
                    lang = util.langStyle();
                    token = util.getParams('token');
                    self.SpecialPrice = [];
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
                    if (self.selectedCate == '') {
                        alert('请选择门票分类');
                        return
                    }
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
                            "CategoryID": self.selectedCate,
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
                            $scope.app.showHideMask(false);
                            $scope.app.maskParams.loadList();
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
                    self.cateList = $scope.app.maskParams.cateList.slice(0);
                    self.cateList.unshift({ID: '', Name: '请选择'})
                    ticketId = $scope.app.maskParams.ticketId
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
                            self.selectedCate = msg.CategoryID
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
                            "CategoryID": self.selectedCate,
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
                            $scope.app.showHideMask(false);
                            $scope.app.maskParams.loadList();
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