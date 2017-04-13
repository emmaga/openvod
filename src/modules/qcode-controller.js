'use strict';
(function () {
    var app = angular.module('app.qcode', [])
        .controller('qcodeIndexController', ['$scope', '$http','$state', 'util', '$filter', 'NgTableParams',function ($scope, $http ,$state,util, $filter,NgTableParams) {
            var self = this;
            self.init = function () {
                self.searchDate = new Date().getTime()- 2678400000;
                self.endDate = new Date();
                self.getInfo();
            };
            /**
             * datepiker
             */
            self.open = function ($event) {
                if($event.target.className.indexOf('start')!=-1){
                    self.startOpened = true;
                    self.endOpened = false;
                }else{
                    self.startOpened = false;
                    self.endOpened = true;
                }
            };
            // 获取二维码用户列表信息
            self.getInfo = function () {
                // self.searchDate = $filter('date')(self.searchDate, 'yyyy-MM-dd');
                // self.endDate = $filter('date')(self.endDate, 'yyyy-MM-dd');
                self.noData = false;
                self.loading = true;
                self.tableParams = new NgTableParams({
                    page: 1,
                    count: 15, //15
                    url: ''
                }, {
                    counts: [],
                    getData: function(params) {
                        var data = {
                            "action": "count",
                            "token": util.getParams("token"),
                            "StartDate": self.searchDate,
                            "EndDate": self.endDate
                        }
                        var paramsUrl = params.url();
                        data.count = paramsUrl.count - 0;
                        data.page = paramsUrl.page - 0;
                        data = JSON.stringify(data);
                        return $http({
                            method: $filter('ajaxMethod')(),
                            url: util.getApiUrl('qrcode_scanCode', '', 'server'),
                            data: data
                        }).then(function successCallback(data, status, headers, config) {
                            if (data.data.rescode == '200') {
                                if (data.data.length == 0) {
                                    self.noData = true;
                                }
                                params.total(data.data.count);
                                console.log(data.data.count);
                                self.tableData = data.data.data;
                                return data.data.data;
                            } else if (data.data.rescode == '401') {
                                alert('访问超时，请重新登录');
                                $location.path("index.html");
                            } else {
                                alert('读取信息出错，'+data.errInfo);
                            }

                        }, function errorCallback(data, status, headers, config) {
                            alert('连接服务器出错');
                        }).finally(function(value) {
                            self.loading = false;
                        })
                    }
                });
            }
            // $scope.startDateBeforeRender = startDateBeforeRender;
            // $scope.startDateOnSetTime = startDateOnSetTime;
            // $scope.endDateOnSetTime = endDateOnSetTime;
            // function startDateOnSetTime() {
            //     // https://github.com/dalelotts/angular-bootstrap-datetimepicker/issues/111
            //     // 在controller里操作dom会影响性能，但这样能解决问题
            //     // angular.element(document.querySelector('#dropdownStart')).click();
            //     $('#dropdownStart').click();
            //     $('#dropdownEnd').click();
            //     // console.log(123);
            //     $scope.$broadcast('start-date-changed');
            //     // self.getQcodeList(1);
            // }
            //
            // function endDateOnSetTime() {
            //     // https://github.com/dalelotts/angular-bootstrap-datetimepicker/issues/111
            //     // 在controller里操作dom会影响性能，但这样能解决问题
            //     angular.element(document.querySelector('#dropdownEnd')).click();
            //     $scope.$broadcast('end-date-changed');
            //     self.search();
            // }
            //
            // function startDateBeforeRender($dates) {
            //     if ($scope.dateRangeStart) {
            //         var activeDate = moment($scope.dateRangeStart);
            //
            //         $dates.filter(function (date) {
            //             return date.localDateValue() >= activeDate.valueOf()
            //         }).forEach(function (date) {
            //             date.selectable = false;
            //         })
            //     }
            // }

            //添加二维码
            self.add = function () {
                $scope.app.showHideMask(true,'pages/qcode/addQcode.html');
            };
            //下载
            self.load=function(url,sceneName){
                $scope.app.maskParams = {"qcodeImgURL":url,'sceneName':sceneName};
                console.log($scope.app.maskParams);
                $scope.app.showHideMask(true,"pages/qcode/downloadQcode.html");
            };
            //删除
            self.delete=function(id){
                var data = {
                    "action": "delete",
                    "token": util.getParams("token"),
                    "SceneId": id
                }
                data = JSON.stringify(data);
                $http({
                    method: 'POST',
                    url: util.getApiUrl('qrcode_scanCode', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        alert('删除成功');
                        $state.reload();
                    }else {
                        alert('删除失败，' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function (value) {
                });
            };
            //详情
            self.detail = function (id) {
                $scope.app.maskParams = {"startDate":self.searchDate,"endDate":self.endDate,"SceneId":id};
                $scope.app.showHideMask(true,"pages/qcode/qcodeDetail.html");
            }
        }
        ])
        .controller('addQcodeController', ['$scope', '$location', '$http', 'util', '$state','CONFIG',
            function ($scope, $location, $http, util, $state,CONFIG) {
                var self = this;
                self.init = function () {
                    self.imgs1 = new Imgs([], true);
                }
                //取消
                self.cancel = function () {
                    $scope.app.showHideMask(false);
                    $scope.app.maskParams={};
                    console.log($scope.app.maskParams);
                }
                //保存添加
                self.save = function () {
                    // var url = self.imgs1.data[0].src;   console.log(self.imgs1.data[0].src);
                    if( !self.imgs1.data[0] || !self.imgs1.data[0].src){
                        alert('请上传公众号LOGO！');
                        return;
                    }
                    var data = {
                        "action": "create",
                        "token": util.getParams("token"),
                        "QrcodeLogoPic": self.imgs1.data[0].src,
                        "SceneName":self .SceneName
                    }

                    data = JSON.stringify(data);
                    self.saving = true;
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('qrcode_scanCode', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var data = response.data;
                        if (data.rescode == '200') {
                            $scope.app.maskParams = {'qcodeImgURL':data.QrcodeWithLogo};
                            console.log($scope.app.maskParams);
                            $scope.app.showHideMask(true,'pages/qcode/downloadQcode.html');
                            $state.reload();
                            setTimeout(function () {

                            }, 10);
                        } else if (data.rescode == '303') {
                            alert('SceneName 已存在');
                        }else if (data.rescode == '201') {
                            alert('logo图片不存在/图片格式出错');
                        } else {
                            alert('添加失败，' + data.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert('连接服务器出错');
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
                                        if(o.data.length > 1) {
                                            for(var i=0; i<o.data.length-1;i++) {
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
        .controller('downloadQcodeController', ['$scope', '$location', '$http', 'util', '$state','CONFIG',
            function ($scope, $location, $http, util, $state,CONFIG) {
                var self = this;

                self.init = function () {
                    self.sceneName = $scope.app.maskParams.sceneName;
                    self.imgURL = $scope.app.maskParams.qcodeImgURL;
                    console.log($scope.app.maskParams);
                }

                //取消
                self.cancel = function () {
                    $scope.app.showHideMask(false);
                    $scope.app.maskParams={};
                    console.log($scope.app.maskParams);
                }

            }
        ])
        .controller('detailQcodeController', ['$scope', '$location', '$http', 'util','CONFIG','NgTableParams','$filter',
            function ($scope, $location, $http, util,CONFIG,NgTableParams,$filter) {
                var self = this;
                self.init = function () {
                    self.startDate = $scope.app.maskParams.startDate;
                    self.endDate = $scope.app.maskParams.endDate;
                    self.SceneId = $scope.app.maskParams.SceneId;
                    console.log($scope.app.maskParams);
                    self.getInfo();
                };
                //取消
                self.cancel = function () {
                    $scope.app.showHideMask(false);
                    $scope.app.maskParams={};
                    console.log($scope.app.maskParams);
                };

                // 获取二维码用户列表信息
                self.getInfo = function () {
                    self.noData = false;
                    self.loading = true;
                    self.tableParams = new NgTableParams({
                        page: 1,
                        count: 10, //10
                        url: ''
                    }, {
                        counts: [],
                        getData: function(params) {
                            var data = {
                                "action": "detail",
                                "token": util.getParams("token"),
                                "StartDate": self.startDate,
                                "EndDate": self.endDate,
                                "SceneId":self.SceneId,
                                "page":"1",
                                "count":"10"
                            };
                            var paramsUrl = params.url();
                            data.count = paramsUrl.count - 0;
                            data.page = paramsUrl.page - 0;
                            data = JSON.stringify(data);
                            return $http({
                                method: $filter('ajaxMethod')(),
                                url: util.getApiUrl('qrcode_scanCode', '', 'server'),
                                data: data
                            }).then(function successCallback(data, status, headers, config) {
                                if (data.data.rescode == '200') {
                                    if (data.data.length == 0) {
                                        self.noData = true;
                                    }
                                    params.total(data.data.count);
                                    console.log(data.data.data);
                                    self.tableData = data.data.data;
                                    return data.data.data;
                                } else if (data.data.rescode == '401') {
                                    alert('访问超时，请重新登录');
                                    $location.path("index.html");
                                } else {
                                    alert('读取信息出错，'+data.errInfo);
                                }

                            }, function errorCallback(data, status, headers, config) {
                                alert('连接服务器出错');
                            }).finally(function(value) {
                                self.loading = false;
                            })
                        }
                    });
                }
            }
        ])
})();