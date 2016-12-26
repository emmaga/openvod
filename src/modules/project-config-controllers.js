'use strict';

(function () {
    var app = angular.module('app.project-config-controllers', [])

    .controller('projectConfigController', ['$state',
        function ($state) {
            var self = this;
            
            self.init = function() {
                if($state.current.name == 'app.projectConfig') {
                    $state.go('app.projectConfig.hotelList');
                }
            }

            
        }
    ])

    .controller('pcHotelListController', ['$scope', '$filter', '$state', '$http', '$stateParams', 'util',
        function ($scope, $filter, $state, $http, $stateParams, util) {
            var self = this;
            
            self.init = function() {
                
            }

            
        }
    ])

    .controller('pcProjectInfoController', ['$scope', '$state', '$http', 'CONFIG', 'util',
        function ($scope, $state, $http, CONFIG, util) {
            var self = this;
            
            self.init = function() {
                self.editLangs = util.getParams('editLangs');
                self.loadInfo();
            }

            self.loadInfo = function() {
                var data = JSON.stringify({
                    action: "getTotalInfo",
                    token: util.getParams('token'),
                    lang: util.langStyle()
                })
                self.loading = true;

                $http({
                    method: 'POST',
                    url: util.getApiUrl('hotelroom', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        self.projectName = JSON.parse(data.data.projectName);
                        self.LogoImg = data.data.ProjectLogo;
                        self.imgs1 = new Imgs([{"ImageURL": self.LogoImg, "ImageSize": 0}], true);
                        self.imgs1.initImgs();
                    } else {
                        alert('读取信息失败' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('服务器出错');
                }).finally(function (e) {
                    self.loading = false;
                });
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
                    alert('请上传LOGO')
                    return;
                }

                self.saving = true;
                var data = JSON.stringify({
                    action: "setTotalInfo",
                    token: util.getParams('token'),
                    lang: util.langStyle(),
                    data: {
                        "projectName": self.projectName,
                        "ProjectLogo": self.imgs1.data[0].src
                    }
                })
                $http({
                    method: 'POST',
                    url: util.getApiUrl('hotelroom', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        alert('保存成功');
                        $state.reload();
                    } else {
                        alert('保存失败' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('服务器出错');
                }).finally(function (e) {
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

})();
