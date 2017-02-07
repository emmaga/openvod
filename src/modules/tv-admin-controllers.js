'use strict';

(function () {
    var app = angular.module('app.tv-admin-controllers', [])

    .controller('tvAdminController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            var self = this;
            var my_tree;
            $scope.my_tree = my_tree = {};
            
            self.init = function() {
                // 默认加载欢迎页面
                self.initS = $stateParams.label ? $stateParams.label : '欢迎页面';
                self.menuRoot = false;
                self.MainMenu_THJ_SecondMenu = false;

                // 获取编辑多语言信息
                self.editLangs = util.getParams('editLangs');

                // 语言菜单编辑信息
                self.menu = {};

            }

            // 删除当前菜单
            self.deleteMenu = function() {

                if(!confirm('确认删除？')) {
                    return;
                }

                // 区分一二级菜单
                var menuLv = my_tree.get_selected_branch().data.menuLevel;

                // menuId
                var menuId = my_tree.get_selected_branch().data.menuId;

                var action = menuLv == 1 ? "deleteMainMenuFirstMenu" : "deleteMainMenuSecondMenu";
                var delMenu = {};

                if (menuLv == 1) {
                    delMenu.firstMenuID = menuId;
                }
                else {
                    delMenu.SecondMenuID = menuId;
                }

                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": action,
                    "viewID": 1,     //主菜单模板ViewID都为1
                    "data":delMenu,
                    "lang": util.langStyle()
                })
                
                // 开始删除
                self.menuDeleting = true;

                $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        // 删除树元素
                        var b, p, l, state;
                        b = my_tree.get_selected_branch();
                        p = my_tree.get_parent_branch(b);
                        p.children.splice(p.children.indexOf(b) , 1);

                        alert('已删除');
                        $state.go('app.tvAdmin.blank', {label: p.label}, {reload:true});

                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('删除失败，' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function (value) {
                    self.menuDeleting = false;
                });
            }

            // 修改欢迎页风格按钮
            self.changeWelStyle = function() {
                $scope.app.maskParams = {'viewName': my_tree.get_selected_branch().data.viewName};
                $scope.app.showHideMask(true,'pages/tv/welStyleChange.html');
            }

            // 修改首页风格
            self.changeMainStyle = function() {
                $scope.app.maskParams = {'viewName': my_tree.get_selected_branch().data.viewName};
                $scope.app.showHideMask(true,'pages/tv/styleChange.html');
            }

            // 添加菜单
            self.addMenu = function(menuLv, parentMenuId) {
                $scope.app.maskParams = {'menuLv': menuLv};
                $scope.app.showHideMask(true,'pages/tv/menuAdd.html');
            }

            // 主菜单模块
            self.addModule = function(menuLv) {
                var parentMenu = {};
                if(menuLv != 1) {
                    parentMenu = {
                        id: my_tree.get_selected_branch().data.menuId, 
                        name: my_tree.get_selected_branch().label
                    }
                }
                $scope.app.maskParams = {'menuLv': menuLv, 'parentMenu': parentMenu};
                $scope.app.showHideMask(true,'pages/tv/moduleAdd.html');
            }

            // 菜单点击
            $scope.my_tree_handler = function(branch) {
                console && console.log('select ' + branch.label);

                // welcome
                if(branch.data.type == "welcome") {
                    $state.go('app.tvAdmin.welcome', {label: branch.label});
                }

                // version
                if(branch.data.type == 'version') {
                    $state.go('app.tvAdmin.version', {label: branch.label});
                }

                // adv
                if(branch.data.type == 'adv') {
                    $state.go('app.tvAdmin.adv', {label: branch.label});
                }

                // menuRoot
                if(branch.data.type == 'menuRoot') {
                    $state.go('app.tvAdmin.blank', {label: branch.label});
                }

                // live
                if(branch.data.type == 'Live') {
                    $state.go('app.tvAdmin.live', {moduleId: branch.data.moduleId, label: branch.label});
                    self.changeMenuInfo();        
                }

                // simplePicText
                if(branch.data.type == 'SimplePicText') {
                    $state.go('app.tvAdmin.simplePicText', {moduleId: branch.data.moduleId, label: branch.label});
                    self.changeMenuInfo();        
                }

                //multPic
                if(branch.data.type == 'MultPic') {
                    $state.go('app.tvAdmin.multPic', {moduleId: branch.data.moduleId, label: branch.label});
                    self.changeMenuInfo();
                }

                // 3rdApp
                if(branch.data.type == '3rdApp') {
                    $state.go('app.tvAdmin.3rdApp', {moduleId: branch.data.moduleId, label: branch.label});
                    self.changeMenuInfo();        
                }

                // apkEntry
                if(branch.data.type == 'ApkEntry') {
                    $state.go('app.tvAdmin.apkEntry', {moduleId: branch.data.moduleId, label: branch.label});
                    self.changeMenuInfo();        
                }

                // shop
                if(branch.data.type == 'Shop') {
                    $state.go('app.tvAdmin.shop', {moduleId: branch.data.moduleId, label: branch.label});
                    self.changeMenuInfo();        
                }

                // movieCommon
                if(branch.data.type == 'MovieCommon') {
                    
                    $state.go('app.tvAdmin.movieCommon', {moduleId: branch.data.moduleId, label: branch.label});
                    self.changeMenuInfo();
                }

                // movieCommonAdv
                if(branch.data.type == 'MovieCommonAdv') {
                    
                    $state.go('app.tvAdmin.movieCommonAdv', {moduleId: branch.data.moduleId, label: branch.label});
                    self.changeMenuInfo();
                }

                // movieCommonFree
                if(branch.data.type == 'MovieCommonFree') {
                    
                    $state.go('app.tvAdmin.movieCommonFree', {moduleId: branch.data.moduleId, label: branch.label});
                    self.changeMenuInfo();
                }

                // MusicCommon
                if(branch.data.type == 'MusicCommon') {
                    
                    $state.go('app.tvAdmin.MusicCommon', {moduleId: branch.data.moduleId, label: branch.label});
                    self.changeMenuInfo();
                }

                // MainMenu_THJ_SecondMenu
                if(branch.data.type == 'MainMenu_THJ_SecondMenu') {
                    
                    $state.go('app.tvAdmin.blank', {label: branch.label});
                    self.changeMenuInfo();
                }

                
            }

            self.changeMenuInfo = function() {
                // 诡异的问题，如果直接赋值，会变成双向绑定，改成以下
                var name = JSON.stringify(my_tree.get_selected_branch().data.name);
                self.menu.name = JSON.parse(name);
                // 以上
                self.imgs3 = new Imgs([{"ImageURL": my_tree.get_selected_branch().data.img, "ImageSize": my_tree.get_selected_branch().data.imgSize}], true);
                self.imgs3.initImgs();
                self.imgs4 = new Imgs([{"ImageURL": my_tree.get_selected_branch().data.focusImg, "ImageSize": my_tree.get_selected_branch().data.focusImgSize}], true);
                self.imgs4.initImgs();
                self.menu.seq = my_tree.get_selected_branch().data.seq;
                self.menuSaving = false;
            }

            // 修改菜单信息
            self.saveTvMenu = function() {
                
                var menuLv = my_tree.get_selected_branch().data.menuLevel;
                var action = menuLv == 1 ? 'editMainMenuFirstMenu' : 'editMainMenuSecondMenu';
                var menuId = my_tree.get_selected_branch().data.menuId;

                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": action,
                    "viewID": 1,     //主菜单模板ViewID都为1
                    "data":{
                        "firstMenuID":menuId,
                        "SecondMenuID":menuId,
                        "Name":self.menu.name,
                        "IconURL":self.imgs3.data[0].src,
                        "IconSize":self.imgs3.data[0].fileSize,
                        "IconFocusURL":self.imgs4.data[0].src,
                        "IconFocusSize":self.imgs4.data[0].fileSize,
                        "Seq":Number(self.menu.seq)
                    },
                    "lang": util.langStyle()
                })
                
                // 开始保存
                self.menuSaving = true;

                $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        alert('保存成功');
                        $state.go($state.current, {label: self.menu.name[util.getDefaultLangCode()]}, {reload:true});
                        
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('保存失败，' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function (value) {
                    self.menuSaving = false;
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

    .controller('tvWelcomeController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            var self = this;
            
            self.init = function() {
                self.editLangs = util.getParams('editLangs');
                self.getWelInfo();
            }

            self.getWelInfo = function() {
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "getWelcomePage",
                    "lang": util.langStyle()
                });
                
                self.loading = true;
                // 获取欢迎页信息
                $http({
                    method: 'POST',
                    url: util.getApiUrl('welcomepage', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    
                    if (data.rescode == '200') {
                        // 酒店logo图
                        if(data.data.LogoURL) {
                            self.imgs1 = new Imgs([{"ImageURL": data.data.LogoURL, "ImageSize": data.data.LogoSize}], true);
                            self.imgs1.initImgs();
                        }
                        else {
                            self.imgs1 = new Imgs([],true);
                        }
                        

                        // 酒店欢迎辞
                        self.welcomeText = data.data.WelcomeText;

                        // 酒店客人称呼
                        self.guestName = data.data.GuestName;

                        // 酒店经理
                        self.hotelManagerName = data.data.HotelManagerName;

                        // 酒店经理签名图
                        /*if(data.data.HotelManageSignURL){
                            self.imgs2 = new Imgs([{"ImageURL": data.data.HotelManageSignURL, "ImageSize": data.data.HotelManageSignSize}], true);
                            self.imgs2.initImgs();
                        }
                        else {
                            self.imgs2 = new Imgs([], true);
                        }*/
                        

                        // 背景视频
                        if(data.data.BackgroundVideoURL) {
                            self.imgs3 = new Imgs([{"ImageURL": data.data.BackgroundVideoURL, "ImageSize": data.data.BackgroundVideoSize}], true);
                            self.imgs3.initImgs();
                        }
                        else {
                            self.imgs3 = new Imgs([], true);
                        }
                        

                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('加载欢迎页信息失败，' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function (value) {
                    self.loading = false;
                });
            }

            self.save = function() {

                // 酒店logo图
                if(self.imgs1.data.length == 0) {
                    alert('请上传酒店logo图');
                    return;
                }

                // 酒店经理签名图
                /*if(self.imgs2.data.length == 0) {
                    alert('请上传酒店经理签名图');
                    return;
                }*/

                // 背景视频
                // 视频未上传
                if(self.imgs3.data.length == 0) {
                    alert('请上传背景视频');
                    return;
                }
                // 视频未上传完成
                else if (self.imgs3.data[0].progress < 100) {
                    alert('视频正在上传中，请稍后...');
                    return;
                }
                // 视频上传失败时
                else if (self.imgs3.data[0].progress == -1) {
                    alert('视频上传失败，请重新上传');
                    return;
                }
                // 编辑的视频未上传完成
                /*(self.imgs3.data.length > 1 && (self.imgs3.data[1].progress < 100 || self.imgs3.data[1].progress == -1))*/

                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "editWelcomePage",
                    "viewID": 0,
                    "data":{
                      "LogoURL":self.imgs1.data[0].src,
                      "LogoSize":self.imgs1.data[0].fileSize,
                      "WelcomeText": self.welcomeText,
                      "GuestName":self.guestName,
                      "HotelManagerName":self.hotelManagerName,
                      /*"HotelManageSignURL":self.imgs2.data[0].src,
                      "HotelManageSignSize":self.imgs2.data[0].fileSize,*/
                      "HotelManageSignURL":"",
                      "HotelManageSignSize":0,
                      "BackgroundVideoURL":self.imgs3.data[0].src,
                      "BackgroundVideoSize":self.imgs3.data[0].fileSize
                    },
                    "lang": util.langStyle()
                })
                
                self.saving = true;
                $http({
                    method: 'POST',
                    url: util.getApiUrl('welcomepage', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        alert('修改成功');
                        $state.reload();
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('加载菜单示意信息失败，' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function (value) {
                    self.loading = false;
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
    
    // 编辑“Live“模块内的直播
    .controller('tvLiveEditController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            var self = this;

            self.init = function() {
                self.viewId = $scope.app.maskParams.viewId;
                self.liveInfo = $scope.app.maskParams.liveInfo;

                // 获取编辑多语言信息
                self.editLangs = util.getParams('editLangs');

                self.setInfo();
                
            }


            self.cancel = function() {
                $scope.app.showHideMask(false);
            }

            self.setInfo = function () {

                self.channelNum = self.liveInfo.ChannelNum;
                self.channelName = self.liveInfo.ChannelName;
                self.src = self.liveInfo.Src;
                self.imgs1 = new Imgs([{"ImageURL": self.liveInfo.ChannelPicURL, "ImageSize": self.liveInfo.ChannelPicSize}], true);
                self.imgs1.initImgs();
            }

            self.save = function() {

                //频道图片必填验证
                if(self.imgs1.data.length == 0) {
                    alert('请上传频道图片');
                    return;
                }

                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "editChannel",
                    "viewID": Number(self.viewId),
                    "data":{
                        "ID": Number(self.liveInfo.ID),
                        "Src": self.src,
                        "ChannelNum": self.channelNum,
                        "ChannelPicURL": self.imgs1.data[0].src,
                        "ChannelName": self.channelName,
                        "ChannelPicSize": self.imgs1.data[0].fileSize
                    },
                    "lang": util.langStyle()
                })
                
                self.saving = true;
                $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        alert('修改成功');
                        $state.reload();
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('修改失败，' + data.errInfo);
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

    // 添加“Live“模块内的直播
    .controller('tvLiveAddController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            var self = this;

            self.init = function() {
                self.viewId = $scope.app.maskParams.viewId;

                // 获取编辑多语言信息
                self.editLangs = util.getParams('editLangs');

                // 初始化频道图片
                self.imgs1 = new Imgs([], true);
                
            }


            self.cancel = function() {
                $scope.app.showHideMask(false);
            }

            self.save = function() {

                //频道图片必填验证
                if(self.imgs1.data.length == 0 || self.imgs1.data[0].progress < 100) {
                    alert('请上传频道图片');
                    return;
                }

                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "addChannel",
                    "viewID": Number(self.viewId),
                    "data":{
                        "Src": self.src,
                        "ChannelNum": self.channelNum,
                        "ChannelPicURL": self.imgs1.data[0].src,
                        "ChannelName": self.channelName,
                        "ChannelPicSize": self.imgs1.data[0].fileSize
                    },
                    "lang": util.langStyle()
                })
                self.saving = true;
                $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        alert('添加成功');
                        $state.reload();
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
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

    .controller('tvLiveController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
        function ($scope, $state, $http, $stateParams, $location, util) {
            var self = this;

            self.init = function() {
                self.viewId = $stateParams.moduleId;
                self.defaultLangCode = util.getDefaultLangCode();
                self.loadLiveList();
            }

            self.edit = function(index) {
                $scope.app.maskParams.viewId = self.viewId;
                $scope.app.maskParams.liveInfo = self.lives[index];
                $scope.app.showHideMask(true,'pages/tv/liveEdit.html');
            }

            self.del = function(id, index) {
                var index = index;
                if(!confirm('确认删除？')) {
                    return;
                }
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "delChannel",
                    "viewID": self.viewId,
                    "data": {
                      "ChannelList":[
                          {"ID":id-0}
                      ]
                    },
                    "lang": util.langStyle()
                })
                $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        alert('删除成功');
                        self.lives.splice(index,1);
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('删除失败，' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                });
            }

            self.add = function() {
                $scope.app.maskParams.viewId = self.viewId;
                $scope.app.showHideMask(true,'pages/tv/liveAdd.html');
            }

            self.loadLiveList = function() {
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "get",
                    "viewID": self.viewId-0,
                    "lang": util.langStyle()
                })
                self.loading = true;
                $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        self.lives = data.data.ChannelList;
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('加载直播列表信息失败，' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function (value) {
                    self.loading = false;
                });
            }

        }
    ])

    .controller('tvSimplePicTextEditController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            var self = this;

            self.init = function() {
                self.viewId = $scope.app.maskParams.viewId;
                self.picInfo = $scope.app.maskParams.picInfo;

                // 获取编辑多语言信息
                self.editLangs = util.getParams('editLangs');

                self.setInfo();
                
            }


            self.cancel = function() {
                $scope.app.showHideMask(false);
            }

            self.setInfo = function () {

                self.Seq = self.picInfo.Seq;
                self.Title = self.picInfo.Title;
                self.Text = self.picInfo.Text;
                self.imgs1 = new Imgs([{"ImageURL": self.picInfo.PicURL, "ImageSize": self.picInfo.PicSize}], true);
                self.imgs1.initImgs();
            }

            self.save = function() {

                //频道图片必填验证
                if(self.imgs1.data.length == 0) {
                    alert('请上传频道图片');
                    return;
                }

                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "edit",
                    "viewID": Number(self.viewId),
                    "data":{
                        "ID": Number(self.picInfo.ID),
                        "Seq": self.Seq,
                        "Title": self.Title,
                        "PicURL": self.imgs1.data[0].src,
                        "Text": self.Text,
                        "PicSize": self.imgs1.data[0].fileSize
                    },
                    "lang": util.langStyle()
                })
                
                self.saving = true;
                $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        alert('修改成功');
                        $state.reload();
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('修改失败，' + data.errInfo);
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

    // 添加“Live“模块内的直播
    .controller('tvSimplePicTextAddController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            var self = this;

            self.init = function() {
                self.viewId = $scope.app.maskParams.viewId;

                // 获取编辑多语言信息
                self.editLangs = util.getParams('editLangs');

                // 初始化频道图片
                self.imgs1 = new Imgs([], true);
                
            }


            self.cancel = function() {
                $scope.app.showHideMask(false);
            }

            self.save = function() {

                //频道图片必填验证
                if(self.imgs1.data.length == 0 || self.imgs1.data[0].progress < 100) {
                    alert('请上传图片');
                    return;
                }

                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "add",
                    "viewID": Number(self.viewId),
                    "data":{
                        "PicURL": self.imgs1.data[0].src,
                        "Seq": self.Seq,
                        "Text": self.Text,
                        "Title": self.Title,
                        "PicSize": self.imgs1.data[0].fileSize
                    },
                    "lang": util.langStyle()
                })
                self.saving = true;
                $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        alert('添加成功');
                        $state.reload();
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
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

    .controller('tvSimplePicTextController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
        function ($scope, $state, $http, $stateParams, $location, util) {
            var self = this;

            self.init = function() {
                self.viewId = $stateParams.moduleId;
                self.defaultLangCode = util.getDefaultLangCode();
                self.loadList();
            }

            self.edit = function(index) {
                $scope.app.maskParams.viewId = self.viewId;
                $scope.app.maskParams.picInfo = self.pics[index];
                $scope.app.showHideMask(true,'pages/tv/simplePicTextEdit.html');
            }

            self.del = function(id, index) {
                var index = index;
                if(!confirm('确认删除？')) {
                    return;
                }
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "delete",
                    "viewID": self.viewId,
                    "data": {
                      "ID":id-0
                    },
                    "lang": util.langStyle()
                })
                $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        alert('删除成功');
                        self.pics.splice(index,1);
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('删除失败，' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                });
            }

            self.add = function() {
                $scope.app.maskParams.viewId = self.viewId;
                $scope.app.showHideMask(true,'pages/tv/simplePicTextAdd.html');
            }

            self.loadList = function() {
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "get",
                    "viewID": self.viewId-0,
                    "lang": util.langStyle()
                })
                self.loading = true;
                $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        self.pics = data.data.apk;
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('加载信息失败，' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function (value) {
                    self.loading = false;
                });
            }

        }
    ])

    .controller('tvMultPicController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
        function ($scope, $state, $http, $stateParams, $location, util) {
            var self = this;

            self.init = function() {
                self.viewId = $stateParams.moduleId;
                console.log(self.viewId);
                self.defaultLangCode = util.getDefaultLangCode();
                self.loadList();
            }

            self.edit = function(index) {
                $scope.app.maskParams.viewId = self.viewId;
                $scope.app.maskParams.picInfo = self.pics[index];
                $scope.app.showHideMask(true,'pages/tv/multPicEdit.html');
            }

            self.del = function(id, index) {
                var index = index;
                if(!confirm('确认删除？')) {
                    return;
                }
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "delete",
                    "viewID": self.viewId,
                    "data": {
                        "ID":id-0
                    },
                    "lang": util.langStyle()
                })
                $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        alert('删除成功');
                        self.pics.splice(index,1);
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('删除失败，' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                });
            }

            self.add = function() {
                $scope.app.maskParams.viewId = self.viewId;
                $scope.app.showHideMask(true,'pages/tv/multPicAdd.html');
            }

            self.loadList = function() {
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "get",
                    "viewID": self.viewId-0,
                    "lang": util.langStyle()
                })
                self.loading = true;
                $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        self.pics = data.data.pic;
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('加载信息失败，' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function (value) {
                    self.loading = false;
                });
            }

        }
    ])
    .controller('tvMultPicEditController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            var self = this;

            self.init = function() {
                self.viewId = $scope.app.maskParams.viewId;
                self.picInfo = $scope.app.maskParams.picInfo;

                // 获取编辑多语言信息
                self.editLangs = util.getParams('editLangs');

                self.setInfo();

            }


            self.cancel = function() {
                $scope.app.showHideMask(false);
            }

            self.setInfo = function () {

                self.Seq = self.picInfo.Seq;
                self.imgs1 = new Imgs([{"ImageURL": self.picInfo.PicChsURL, "ImageSize": self.picInfo.PicChsSize}], true);
                self.imgs1.initImgs();
                self.imgs2 = new Imgs([{"ImageURL": self.picInfo.PicEngURL, "ImageSize": self.picInfo.PicEngSize}], true);
                self.imgs2.initImgs();
            }

            self.save = function() {

                //频道图片必填验证
                if(self.imgs1.data.length == 0) {
                    alert('请上传频道图片');
                    return;
                }

                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "edit",
                    "viewID": Number(self.viewId),
                    "data":{
                        "ID": Number(self.picInfo.ID),
                        "Seq": self.Seq,
                        "PicChsURL": self.imgs1.data[0].src,
                        "PicChsSize": self.imgs1.data[0].fileSize,
                        "PicEngURL": self.imgs2.data[0].src,
                        "PicEngSize": self.imgs2.data[0].fileSize
                    },
                    "lang": util.langStyle()
                })

                self.saving = true;
                $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        alert('修改成功');
                        $state.reload();
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('修改失败，' + data.errInfo);
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

    // 添加“Live“模块内的直播
    .controller('tvMultPicAddController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            var self = this;

            self.init = function() {
                self.viewId = $scope.app.maskParams.viewId;

                // 获取编辑多语言信息
                self.editLangs = util.getParams('editLangs');

                // 初始化频道图片
                self.imgs1 = new Imgs([], true);
                self.imgs2 = new Imgs([], true);
                console.log("testttt")

            }


            self.cancel = function() {
                $scope.app.showHideMask(false);
            }

            self.save = function() {

                //频道图片必填验证
                if(self.imgs1.data.length == 0 || self.imgs1.data[0].progress < 100 || self.imgs2.data.length == 0 || self.imgs2.data[0].progress < 100) {
                    alert('请上传图片');
                    return;
                }

                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "add",
                    "viewID": Number(self.viewId),
                    "data":{
                        "Seq": self.Seq,
                        "PicChsURL": self.imgs1.data[0].src,
                        "PicChsSize": self.imgs1.data[0].fileSize,
                        "PicEngURL": self.imgs2.data[0].src,
                        "PicEngSize": self.imgs2.data[0].fileSize
                    },
                    "lang": util.langStyle()
                })
                self.saving = true;
                $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        alert('添加成功');
                        $state.reload();
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
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

    .controller('tvShopController', ['$scope', '$state', '$http', '$stateParams', 'util',
        function ($scope, $state, $http, $stateParams, util) {
            var self = this;

            self.init = function() {
                self.viewId = $stateParams.moduleId;
                self.loadInfo();
            }

            self.save = function() {
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "update",
                    "viewID": self.viewId-0,
                    "lang": util.langStyle(),
                    "data": {
                        "ShopType": self.shopSign
                    }
                })
                self.saving = true;
                $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        alert('保存成功');
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('保存失败，' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('保存失败');
                }).finally(function (value) {
                    self.saving = false;
                });
            }

            self.loadInfo = function() {
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "get",
                    "viewID": self.viewId-0,
                    "lang": util.langStyle()
                })
                self.loading = true;
                $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        self.shopSign = data.data.ShopType;
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('加载信息失败，' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function (value) {
                    self.loading = false;
                });
            }

        }
    ])

    .controller('tv3rdAppController', ['$scope', '$state', '$http', '$stateParams', 'util',
        function ($scope, $state, $http, $stateParams, util) {
            var self = this;

            self.init = function() {
                self.viewId = $stateParams.moduleId;
                self.loadInfo();
            }

            self.edit = function() {
                $scope.app.maskParams.viewId = self.viewId;
                $scope.app.maskParams.appGroupID = self.info.AppGroupID;
                $scope.app.maskParams.callback = self.loadInfo;
                $scope.app.showHideMask(true,'pages/tv/3rdAppEdit.html');
            }

            self.add = function() {
                $scope.app.maskParams.viewId = self.viewId;
                $scope.app.maskParams.callback = self.loadInfo;
                $scope.app.showHideMask(true,'pages/tv/3rdAppAdd.html');
            }

            self.loadInfo = function() {
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "getAppGroup",
                    "viewID": self.viewId-0,
                    "lang": util.langStyle()
                })
                self.loading = true;
                $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        self.info = data.data;
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('加载信息失败，' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function (value) {
                    self.loading = false;
                });
            }

        }
    ])

    .controller('tv3rdAppAddController', ['$scope', '$http', 'util',
        function ($scope, $http, util) {
            var self = this;

            self.init = function() {
                self.viewId = $scope.app.maskParams.viewId;
                self.callback = $scope.app.maskParams.callback;
                self.loadList();
            }

            self.loadList = function() {
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "getAppGroupList",
                    "viewID": self.viewId-0,
                    "lang": util.langStyle()
                })
                self.loading = true;
                $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        self.appList = data.data;
                        self.selApp = 0;
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('加载信息失败，' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function (value) {
                    self.loading = false;
                });
            }

            self.cancel = function() {
                $scope.app.showHideMask(false);
            }

            self.save = function() {

                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "updateAppGroup",
                    "viewID": Number(self.viewId),
                    "data":{
                        "AppGroupID": self.appList[self.selApp].ID,
                        "AppGroupName": self.appList[self.selApp].Name,
                        "AppGroupDesc": self.appList[self.selApp].Description,
                    },
                    "lang": util.langStyle()
                })
                self.saving = true;
                $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        alert('保存成功');
                        self.cancel();
                        self.callback();
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('保存失败，' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function (value) {
                    self.saving = false;
                });

            }

        }
    ])

    .controller('tv3rdAppEditController', ['$scope', '$http', 'util',
        function ($scope, $http, util) {
            var self = this;

            self.init = function() {
                self.viewId = $scope.app.maskParams.viewId;
                self.callback = $scope.app.maskParams.callback;
                self.appGroupID = $scope.app.maskParams.appGroupID;
                self.loadList();
            }

            self.loadList = function() {
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "getAppGroupList",
                    "viewID": self.viewId-0,
                    "lang": util.langStyle()
                })
                self.loading = true;
                $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        self.appList = data.data;
                        self.selApp = 0;
                        for(var i = 0; i < self.appList.length; i++) {
                            if(self.appList[i].ID == self.appGroupID) {
                                self.selApp = i;
                                break;
                            }
                        }
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('加载信息失败，' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function (value) {
                    self.loading = false;
                });
            }

            self.cancel = function() {
                $scope.app.showHideMask(false);
            }

            self.save = function() {

                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "updateAppGroup",
                    "viewID": Number(self.viewId),
                    "data":{
                        "AppGroupID": self.appList[self.selApp].ID,
                        "AppGroupName": self.appList[self.selApp].Name,
                        "AppGroupDesc": self.appList[self.selApp].Description,
                    },
                    "lang": util.langStyle()
                })
                self.saving = true;
                $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        alert('保存成功');
                        self.cancel();
                        self.callback();
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('保存失败，' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function (value) {
                    self.saving = false;
                });

            }

        }
    ])

    .controller('tvMovieCommonController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
        function ($scope, $state, $http, $stateParams, $location, util) {
            var self = this;

            self.init = function() {
                self.viewId = $stateParams.moduleId;
                self.getInfo();
            }

            self.getInfo = function() {
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "getAPIInfo",
                    "viewID": self.viewId-0,
                    "lang": util.langStyle()
                });
                self.loading = true;
                $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        self.MovieContentAPIParam = data.data.MovieContentAPIParam;
                        self.MovieContentAPIURL = data.data.MovieContentAPIURL;
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('加载电影信息失败，' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function (value) {
                    self.loading = false;
                });
            }

            self.save = function() {
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "updateAPIInfo",
                    "viewID": self.viewId-0,
                    "data": {
                      "MovieContentAPIParam": self.MovieContentAPIParam,
                      "MovieContentAPIURL": self.MovieContentAPIURL
                    },
                    "lang": util.langStyle()
                })
                self.saving = true;
                $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        alert('修改成功');
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('修改失败' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function (value) {
                    self.saving = false;
                });
            }

        }
    ]) 

    .controller('tvMovieCommonFreeController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
        function ($scope, $state, $http, $stateParams, $location, util) {
            var self = this;

            self.init = function() {
                self.viewId = $stateParams.moduleId;
                self.getInfo();
            }

            self.getInfo = function() {
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "getAPIInfo",
                    "viewID": self.viewId-0,
                    "lang": util.langStyle()
                });
                self.loading = true;
                $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        self.MovieContentAPIParam = data.data.MovieContentAPIParam;
                        self.MovieContentAPIURL = data.data.MovieContentAPIURL;
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('加载电影信息失败，' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function (value) {
                    self.loading = false;
                });
            }

            self.save = function() {
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "updateAPIInfo",
                    "viewID": self.viewId-0,
                    "data": {
                      "MovieContentAPIParam": self.MovieContentAPIParam,
                      "MovieContentAPIURL": self.MovieContentAPIURL
                    },
                    "lang": util.langStyle()
                })
                self.saving = true;
                $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        alert('修改成功');
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('修改失败' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function (value) {
                    self.saving = false;
                });
            }

        }
    ]) 

    .controller('tvMovieCommonAdvController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
        function ($scope, $state, $http, $stateParams, $location, util) {
            var self = this;

            self.init = function() {
                self.viewId = $stateParams.moduleId;
                self.getInfo();
            }

            self.getInfo = function() {
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "getAPIInfo",
                    "viewID": self.viewId-0,
                    "lang": util.langStyle()
                });
                self.loading = true;
                $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        self.MovieContentAPIParam = data.data.MovieContentAPIParam;
                        self.MovieContentAPIURL = data.data.MovieContentAPIURL;
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('加载电影信息失败，' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function (value) {
                    self.loading = false;
                });
            }

            self.save = function() {
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "updateAPIInfo",
                    "viewID": self.viewId-0,
                    "data": {
                      "MovieContentAPIParam": self.MovieContentAPIParam,
                      "MovieContentAPIURL": self.MovieContentAPIURL
                    },
                    "lang": util.langStyle()
                })
                self.saving = true;
                $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        alert('修改成功');
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('修改失败' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function (value) {
                    self.saving = false;
                });
            }

        }
    ]) 

    .controller('tvMenuAddController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            var self = this;

            self.init = function() {
                // 目前只有首页上添加一级菜单，menuLv：1
                self.menuLv = $scope.app.maskParams.menuLv;

                // 获取编辑多语言信息
                self.editLangs = util.getParams('editLangs');

                // 获取菜单类型名称、风格图
                self.getMenuInfo();

                // 初始化菜单图片和高亮图片
                self.imgs1 = new Imgs([], true);
                self.imgs2 = new Imgs([], true);
                
            }

            self.getMenuInfo = function() {
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "getMainMenuTemplate",
                    "lang": util.langStyle()
                });
                self.loading = true;
                // 获取菜单类型名称、风格图
                $http({
                    method: 'POST',
                    url: util.getApiUrl('mainmenu', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        self.styleImg = data.data.SamplePic;
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('加载菜单示意信息失败，' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function (value) {
                    self.loading = false;
                });
            }


            self.cancel = function() {
                $scope.app.showHideMask(false);
            }

            self.save = function() {

                //菜单图片必填验证
                if(self.imgs1.data.length == 0 || self.imgs1.data[0].progress < 100) {
                    alert('请上传菜单图片');
                    return;
                }

                //菜单高亮图片必填验证
                if(self.imgs2.data.length == 0 || self.imgs2.data[0].progress < 100) {
                    alert('请上传菜单高亮图片');
                    return;
                }

                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "addMainMenuFirstMenu",
                    "viewID": 1,     //主菜单模板ViewID都为1
                    "data":{
                      "isMenu":1,     //0不是主菜单，1是主菜单
                      "viewType": "",
                      "Name":self.menuName,
                      "IconURL":self.imgs1.data[0].src,
                      "IconSize":self.imgs1.data[0].fileSize,
                      "IconFocusURL":self.imgs2.data[0].src,
                      "IconFocusSize":self.imgs2.data[0].fileSize,
                      "Seq":self.seq  //在一级菜单中的排序号，从1开始
                    },
                    "lang": util.langStyle()
                })

                self.saving = true;
                $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        alert('添加成功');
                        $state.reload();
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('加载菜单示意信息失败，' + data.errInfo);
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
                            console&&console.log('failure');
                            xhr.abort();
                        }
                    );
                }
            }

        }
    ])

    .controller('tvModuleAddController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            var self = this;

            self.init = function() {
                // 目前只有首页上添加一级菜单，menuLv：1
                self.menuLv = $scope.app.maskParams.menuLv;

                // 非一级菜单时，parentMenu
                if(self.menuLv != 1) {
                    self.parentMenu = $scope.app.maskParams.parentMenu;
                    // self.parentMenu.id
                    // self.parentMenu.name
                }

                // 获取编辑多语言信息
                self.editLangs = util.getParams('editLangs');

                // 获取菜单类型名称、风格图
                self.getModuleInfo();

                // 初始化菜单图片和高亮图片
                self.imgs1 = new Imgs([], true);
                self.imgs2 = new Imgs([], true);
                
            }

            self.getModuleInfo = function() {
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "getCommonTemplate",
                    "lang": util.langStyle()
                });
                self.loading = true;
                // 获取模块类型名称、风格图
                $http({
                    method: 'POST',
                    url: util.getApiUrl('mainmenu', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        self.modules = data.data;
                        self.module = self.modules[0].Name;
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('加载模版信息失败，' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function (value) {
                    self.loading = false;
                });
            }


            self.cancel = function() {
                $scope.app.showHideMask(false);
            }

            self.save = function() {

                //菜单图片必填验证
                // if(self.imgs1.data.length == 0 || self.imgs1.data[0].progress < 100) {
                //     alert('请上传菜单图片');
                //     return;
                // }

                //菜单高亮图片必填验证
                // if(self.imgs2.data.length == 0 || self.imgs2.data[0].progress < 100) {
                //     alert('请上传菜单高亮图片');
                //     return;
                // }

                var action = self.menuLv == 1 ? 'addMainMenuFirstMenu' : 'addMainMenuSecondMenu';
                var firstMenuID = self.menuLv == 1 ? '' : self.parentMenu.id;

                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": action,
                    "viewID": 1,     //主菜单模板ViewID都为1
                    "data":{
                      "isMenu":0,     //0不是主菜单，1是主菜单
                      "firstMenuID" : firstMenuID,
                      "viewType": self.module,
                      "Name":self.menuName,
                      "IconURL":self.imgs1.data[0] ? self.imgs1.data[0].src : '',
                      "IconSize":self.imgs1.data[0] ? self.imgs1.data[0].fileSize : 0,
                      "IconFocusURL":self.imgs2.data[0] ? self.imgs2.data[0].src : '',
                      "IconFocusSize":self.imgs2.data[0] ? self.imgs2.data[0].fileSize : 0,
                      "Seq":self.seq  //在一级菜单中的排序号，从1开始
                    },
                    "lang": util.langStyle()
                })

                self.saving = true;
                $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        alert('添加成功');
                        $state.reload();
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('加载菜单示意信息失败，' + data.errInfo);
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
    
    .controller('tvStyleChangeController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            var self = this;

            self.init = function() {
                
                // 目前菜单已选风格
                self.viewName = $scope.app.maskParams.viewName;

                // 获取首页风格图片列表
                self.getViewList();
            }

            self.getViewList = function() {
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "getMainMenuTemplateList",
                    "lang": util.langStyle()
                });
                self.loading = true;
                
                $http({
                    method: 'POST',
                    url: util.getApiUrl('mainmenu', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        self.styles = data.data;
                        self.style = self.viewName;
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('加载首页模版失败，' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function (value) {
                    self.loading = false;
                });
            }


            self.cancel = function() {
                $scope.app.showHideMask(false);
            }

            self.save = function() {

                // 确认修改提示
                if(confirm('修改会导致所有主菜单全部清空，确认修改？')) {
                    if(confirm('再次确认：修改会导致所有主菜单全部清空，确认修改？')) {
                    }
                    else {
                        return;
                    }
                } else {
                    return;
                }

                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "createMainMenu",
                    "viewID": 1,     //主菜单模板ViewID都为1
                    "viewType": self.style,
                    "lang": util.langStyle()
                })
                self.saving = true;
                $http({
                    method: 'POST',
                    url: util.getApiUrl('mainmenu', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        alert('修改成功');
                        $state.reload();
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('修改失败，' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function (value) {
                    self.saving = false;
                });

            }

        }
    ])  

    .controller('tvWelStyleChangeController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            var self = this;

            self.init = function() {
                
                // 目前欢迎页已选风格
                self.viewName = $scope.app.maskParams.viewName;

                // 获取欢迎页风格图片列表
                self.getViewList();
            }

            self.getViewList = function() {
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "getWelcomePageTemplateList",
                    "lang": util.langStyle()
                });
                self.loading = true;
                
                $http({
                    method: 'POST',
                    url: util.getApiUrl('welcomepage', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        self.styles = data.data;
                        self.style = self.viewName;
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('加载欢迎页模版失败，' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function (value) {
                    self.loading = false;
                });
            }


            self.cancel = function() {
                $scope.app.showHideMask(false);
            }

            self.save = function() {

                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "createWelcomePage",
                    "viewType": self.style,
                    "lang": util.langStyle()
                })

                self.saving = true;
                $http({
                    method: 'POST',
                    url: util.getApiUrl('welcomepage', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        alert('修改成功');
                        $state.reload();
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('修改失败，' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function (value) {
                    self.saving = false;
                });

            }

        }
    ]) 

    .controller('tvAdvController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
        function ($scope, $state, $http, $stateParams, $location, util) {
            var self = this;

            self.init = function() {
                self.loadList();
            }

            self.loadList = function() {
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "getPosOpenList",
                    "lang": util.langStyle()
                });
                self.loading = true;
                $http({
                    method: 'POST',
                    url: util.getApiUrl('advpos', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        self.adList = data.data;
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('加载广告位信息失败，' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function (value) {
                    self.loading = false;
                });
            }

            self.close = function(id) {
                if(!confirm('确认删除？')) {
                    return;
                }
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "delPos",
                    "lang": util.langStyle(),
                    "data": [
                      {
                        "PositionID": id
                      }
                    ]
                })
                
                $http({
                    method: 'POST',
                    url: util.getApiUrl('advpos', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        alert('删除成功');
                        self.loadList();
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('删除失败' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function (value) {
                    
                });
            }

            self.add = function() {
                $scope.app.maskParams = {'list': self.adList};
                $scope.app.maskParams.callback = self.loadList;
                $scope.app.showHideMask(true,'pages/tv/advAdd.html');
            }

        }
    ])

    .controller('tvAdvAddController', ['$scope', '$http', 'util',
    function ($scope, $http, util) {
        var self = this;

        self.init = function() {
        self.disabledList = $scope.app.maskParams.list;
        self.callback = $scope.app.maskParams.callback;
        self.loadList();
        }

        self.loadList = function() {
         var data = JSON.stringify({
             "token": util.getParams('token'),
             "action": "getPosList",
             "lang": util.langStyle()
         });
         self.loading = true;
         $http({
             method: 'POST',
             url: util.getApiUrl('advpos', '', 'server'),
             data: data
         }).then(function successCallback(response) {
             var data = response.data;
             if (data.rescode == '200') {
                var a = data.data;
                var list = data.data;
                // 将已添加的广告禁用,设为已选；其他默认都设置为未选
                for(var i = 0; i < list.length; i++) {
                    list[i].disabled = false;
                    list[i].checked = false;
                    // 判断是否已选
                    for(var j=0; j< self.disabledList.length; j++) {
                        if(list[i].ID == self.disabledList[j].PositionID) {
                            list[i].disabled = true;
                            list[i].checked = true;
                            break;
                        }
                    }
                }
                self.adList = list;
             } else if(data.rescode == '401'){
                 alert('访问超时，请重新登录');
                 $state.go('login');
             } else{
                 alert('加载广告位信息失败，' + data.errInfo);
             }
         }, function errorCallback(response) {
             alert('连接服务器出错');
         }).finally(function (value) {
             self.loading = false;
         });
        }

        self.save = function(id) {
            
            var selAdList = [];
            for(var i=0; i<self.adList.length;i++) {
                if(!self.adList[i].disabled && self.adList[i].checked) {
                    selAdList.push({
                        "AdvPositionTemplateName": self.adList[i].AdvPositionTemplateName,
                        "ID": self.adList[i].ID,
                        "Name": self.adList[i].Name
                    })
                }
            }
            if(selAdList.length == 0) {
                alert('请选择要添加的广告');
                return;
            }

            var data = JSON.stringify({
                "token": util.getParams('token'),
                "action": "addPos",
                "lang": util.langStyle(),
                "data": selAdList
            })
            self.saving = true;
            $http({
                method: 'POST',
                url: util.getApiUrl('advpos', '', 'server'),
                data: data
            }).then(function successCallback(response) {
                var data = response.data;
                if (data.rescode == '200') {
                    alert('添加成功');
                    self.cancel();
                    self.callback();
                } else if(data.rescode == '401'){
                    alert('访问超时，请重新登录');
                    $state.go('login');
                } else{
                    alert('添加失败' + data.errInfo);
                }
            }, function errorCallback(response) {
             alert('连接服务器出错');
            }).finally(function (value) {
                self.saving = false;
            });
        }

        self.cancel = function() {
            $scope.app.showHideMask(false);
        }

    }])

    .controller('tvVersionController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
        function ($scope, $state, $http, $stateParams, $location, util) {
            var self = this;

            self.init = function() {
                self.getSV();
                self.getCV();
            }

            // 获取服务端版本
            self.getSV = function() {
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "get",
                    "type": "All",
                    "lang": util.langStyle()
                });
                self.loadingS = true;
                $http({
                    method: 'POST',
                    url: util.getApiUrl('tvuiversion', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        
                        self.serviceVersion = data.data;
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('加载服务器版本信息失败，' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function (value) {
                    self.loadingS = false;
                });
            }

            // 获取小前端端版本
            self.getCV = function() {
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "getProxyVersion",
                    "lang": util.langStyle()
                });
                self.loadingC = true;
                $http({
                    method: 'POST',
                    url: util.getApiUrl('tvuiversion', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        self.clientVersion = data.data;
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('加载小前端版本信息失败，' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function (value) {
                    self.loadingC = false;
                });
            }

            self.submit = function() {
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "submit",
                    "type": "All",
                    "lang": util.langStyle()
                })
                self.saving = true;
                alert('提交版本命令已发送，这需要大约一分钟的时间');
                $http({
                    method: 'POST',
                    url: util.getApiUrl('tvuiversion', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        alert('版本提交成功');
                        $state.reload();
                    } else if(data.rescode == '401'){
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else{
                        alert('提交版本失败' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function (value) {
                    self.saving = false;
                });
            }

        }
    ]) 

    .controller('tvApkEntryController', ['$q', '$scope', '$state', '$http', '$stateParams', '$filter', 'util', 'CONFIG',
        function($q, $scope, $state, $http, $stateParams, $filter, util, CONFIG) {
            console.log('tvApkEntryController')
            var self = this;
            self.init = function() {
                self.info = {};
                self.viewId = $stateParams.moduleId;
                self.defaultLangCode = util.getDefaultLangCode();
                self.editLangs = util.getParams('editLangs');
                self.getInfo().then(function() {
                    self.initImgs1();
                })

            }

            self.getInfo = function() {
                var deferred = $q.defer();
                self.loading = true;
                var data = JSON.stringify({
                    action: "get",
                    token: util.getParams('token'),
                    lang: util.langStyle(),
                    viewID: self.viewId
                })
                $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        self.info = data.data.apk;
                        deferred.resolve();
                    } else if (data.rescode == '401') {
                        alert('访问超时，请重新登录');
                        $location.path("pages/login.html");
                    } else {
                        alert('读取信息失败，' + data.errInfo);
                        deferred.reject();
                    }
                }, function errorCallback(response) {
                    alert('服务器出错');
                    deferred.reject();
                }).finally(function(e) {
                    self.loading = false;
                });
                return deferred.promise;
            }

            self.initImgs1 = function() {
                // 初始化apk url
                self.imgs1 = new Imgs([{ "ImageURL": self.info.ApkURL, "ImageSize": self.info.ApkSize }], true);
                self.imgs1.initImgs();
            }

            self.save = function() {

                //检查logo上传
                if (self.imgs1.data.length == 0) {
                    alert('请上传酒店Apk');
                    return;
                }

                self.info.ApkURL = self.imgs1.data[0].src;
                self.info.ApkSize = self.imgs1.data[0].fileSize - 0;
                self.saving = true;

                var data = JSON.stringify({
                    action: "updateApk",
                    token: util.getParams('token'),
                    lang: util.langStyle(),
                    viewID: self.viewId - 0,
                    data: self.info
                })
                $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        alert('保存成功');
                        $state.reload();
                    } else {
                        alert('保存失败，' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('服务器出错');
                }).finally(function(e) {
                    self.saving = false;
                });
            }

            self.clickUpload = function(e) {
                setTimeout(function() {
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
                initImgs: function() {
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
                deleteById: function(id) {
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

                add: function(xhr, fileName, fileSize) {
                    this.data.push({
                        "xhr": xhr,
                        "fileName": fileName,
                        "fileSize": fileSize,
                        "progress": 0,
                        "id": this.maxId
                    });
                    return this.maxId++;
                },

                update: function(id, progress, leftSize, fileSize) {
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

                setSrcSizeByXhr: function(xhr, src, size) {
                    for (var i = 0; i < this.data.length; i++) {
                        if (this.data[i].xhr == xhr) {
                            this.data[i].src = src;
                            this.data[i].fileSize = size;
                            break;
                        }
                    }
                },

                uploadFile: function(e, o) {

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
                        function(evt) {
                            $scope.$apply(function() {
                                if (evt.lengthComputable) {
                                    var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                                    o.update(fileId, percentComplete, evt.total - evt.loaded, evt.total);
                                    console.log(percentComplete);
                                }
                            });
                        },
                        function(xhr) {
                            var ret = JSON.parse(xhr.responseText);
                            console && console.log(ret);
                            $scope.$apply(function() {
                                o.setSrcSizeByXhr(xhr, ret.upload_path, ret.size);
                                // 如果这个对象只允许上传一张图片
                                if (o.single) {
                                    // 删除第一站图片
                                    o.deleteById(o.data[0].id);
                                }
                            });
                        },
                        function(xhr) {
                            $scope.$apply(function() {
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


    // 音乐库
    .controller('tvMusicCommonController', ['$q', '$scope', '$state', '$http', '$stateParams', '$filter', 'util', 'CONFIG',
        function($q, $scope, $state, $http, $stateParams, $filter, util, CONFIG) {
            console.log('tvMusicCommonController')
            var self = this;
            self.init = function() {
                self.info = {};
                self.viewId = $stateParams.moduleId;
                self.defaultLangCode = util.getDefaultLangCode();
                self.editLangs = util.getParams('editLangs');
                self.getInfo().then(function() {
                    self.initImgs1();
                })

            }

            self.getInfo = function() {
                var deferred = $q.defer();
                self.loading = true;
                var data = JSON.stringify({
                    action: "getAPIInfo",
                    token: util.getParams('token'),
                    lang: util.langStyle(),
                    viewID: Number(self.viewId)
                })
                $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        self.info = data.data;
                        deferred.resolve();
                    } else if (data.rescode == '401') {
                        alert('访问超时，请重新登录');
                        $location.path("pages/login.html");
                    } else {
                        alert('读取信息失败，' + data.errInfo);
                        deferred.reject();
                    }
                }, function errorCallback(response) {
                    alert('服务器出错');
                    deferred.reject();
                }).finally(function(e) {
                    self.loading = false;
                });
                return deferred.promise;
            }

            self.initImgs1 = function() {
                // 初始化apk url
                self.imgs1 = new Imgs([{ "ImageURL": self.info.ApkURL, "ImageSize": self.info.ApkSize }], true);
                self.imgs1.initImgs();
            }

            self.save = function() {

                //检查logo上传
                if (self.imgs1.data.length == 0) {
                    alert('请上传酒店Apk');
                    return;
                }

                self.info.ApkURL = self.imgs1.data[0].src;
                self.info.ApkSize = self.imgs1.data[0].fileSize - 0;
                self.saving = true;

                var data = JSON.stringify({
                    action: "updateAPIInfo",
                    token: util.getParams('token'),
                    lang: util.langStyle(),
                    viewID: self.viewId - 0,
                    data: {
                        "MusicContentAPIParam": self.info.MusicContentAPIParam,
                        "MusicContentAPIURL": self.info.MusicContentAPIURL
                    }
                })
                $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        alert('保存成功');
                        $state.reload();
                    } else {
                        alert('保存失败，' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('服务器出错');
                }).finally(function(e) {
                    self.saving = false;
                });
            }

            self.clickUpload = function(e) {
                setTimeout(function() {
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
                initImgs: function() {
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
                deleteById: function(id) {
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

                add: function(xhr, fileName, fileSize) {
                    this.data.push({
                        "xhr": xhr,
                        "fileName": fileName,
                        "fileSize": fileSize,
                        "progress": 0,
                        "id": this.maxId
                    });
                    return this.maxId++;
                },

                update: function(id, progress, leftSize, fileSize) {
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

                setSrcSizeByXhr: function(xhr, src, size) {
                    for (var i = 0; i < this.data.length; i++) {
                        if (this.data[i].xhr == xhr) {
                            this.data[i].src = src;
                            this.data[i].fileSize = size;
                            break;
                        }
                    }
                },

                uploadFile: function(e, o) {

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
                        function(evt) {
                            $scope.$apply(function() {
                                if (evt.lengthComputable) {
                                    var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                                    o.update(fileId, percentComplete, evt.total - evt.loaded, evt.total);
                                    console.log(percentComplete);
                                }
                            });
                        },
                        function(xhr) {
                            var ret = JSON.parse(xhr.responseText);
                            console && console.log(ret);
                            $scope.$apply(function() {
                                o.setSrcSizeByXhr(xhr, ret.upload_path, ret.size);
                                // 如果这个对象只允许上传一张图片
                                if (o.single) {
                                    // 删除第一站图片
                                    o.deleteById(o.data[0].id);
                                }
                            });
                        },
                        function(xhr) {
                            $scope.$apply(function() {
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


})();
