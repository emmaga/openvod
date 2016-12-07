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
                self.initS = $stateParams.initS ? $stateParams.initS : '欢迎页面';
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
                    "lang": ""
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
                        var b, p;
                        b = my_tree.get_selected_branch();
                        p = my_tree.get_parent_branch(b);
                        p.children.splice(p.children.indexOf(b) , 1);

                        alert('已删除');
                        $state.go('app.tvAdmin', 
                            {initS: my_tree.select_parent_branch().label}, 
                            {reload: true, inherit: false, notify: true }
                        );
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
                $scope.app.maskUrl = 'pages/tv/welStyleChange.html';
            }

            // 修改首页风格
            self.changeMainStyle = function() {
                $scope.app.maskParams = {'viewName': my_tree.get_selected_branch().data.viewName};
                $scope.app.maskUrl = 'pages/tv/styleChange.html';
            }

            // 添加菜单
            self.addMenu = function(menuLv, parentMenuId) {
                $scope.app.maskParams = {'menuLv': menuLv};
                $scope.app.maskUrl = 'pages/tv/menuAdd.html';
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
                $scope.app.maskUrl = 'pages/tv/moduleAdd.html';
            }

            // 菜单点击
            $scope.my_tree_handler = function(branch) {
                console.log('select ' + branch.label);

                // welcome
                if(branch.data.type == "welcome") {
                    $state.go('app.tvAdmin.welcome');
                }

                // version
                if(branch.data.type == 'version') {
                    $state.go('app.tvAdmin.version');
                }

                // menuRoot
                if(branch.data.type == 'menuRoot') {
                    $state.go('app.tvAdmin.blank');
                }

                // live
                if(branch.data.type == 'Live') {
                    $state.go('app.tvAdmin.live', {moduleId: branch.data.moduleId});
                    self.changeMenuInfo();        
                }

                // movieCommon
                if(branch.data.type == 'MovieCommon') {
                    
                    $state.go('app.tvAdmin.movieCommon', {moduleId: branch.data.moduleId});
                    self.changeMenuInfo();
                }

                // MainMenu_THJ_SecondMenu
                if(branch.data.type == 'MainMenu_THJ_SecondMenu') {
                    
                    $state.go('app.tvAdmin.blank');
                    self.changeMenuInfo();
                }

                
            }

            self.changeMenuInfo = function() {
                // 诡异的问题，如果直接赋值，会变成双向绑定，改成以下
                var name = JSON.stringify(my_tree.get_selected_branch().data.name);
                self.menu.name = JSON.parse(name);
                // 以上
                self.imgs3 = new Imgs([{"ImageURL": my_tree.get_selected_branch().data.img, "ImageSize": my_tree.get_selected_branch().data.focusImg}], true);
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
                    "lang": ""
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
                        $state.go('app.tvAdmin', 
                            {initS: self.menu.name[util.getDefaultLangCode()]}, 
                            {reload: true, inherit: false, notify: true }
                        );
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
                                    console.log(percentComplete);
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
                            console.log('failure');
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
                        self.imgs1 = new Imgs([{"ImageURL": data.data.LogoURL, "ImageSize": data.data.LogoSize}], true);
                        self.imgs1.initImgs();

                        // 酒店欢迎辞
                        self.welcomeText = data.data.WelcomeText;

                        // 酒店客人称呼
                        self.guestName = data.data.GuestName;

                        // 酒店经理
                        self.hotelManagerName = data.data.HotelManagerName;

                        // 酒店经理签名图
                        self.imgs2 = new Imgs([{"ImageURL": data.data.HotelManageSignURL, "ImageSize": data.data.HotelManageSignSize}], true);
                        self.imgs2.initImgs();

                        // 背景视频
                        self.imgs3 = new Imgs([{"ImageURL": data.data.BackgroundVideoURL, "ImageSize": data.data.BackgroundVideoSize}], true);
                        self.imgs3.initImgs();

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


            self.cancel = function() {
                $scope.app.maskUrl = '';
            }

            self.save = function() {

                // 酒店logo图
                if(self.imgs1.data.length == 0) {
                    alert('请上传酒店logo图');
                    return;
                }

                // 酒店经理签名图
                if(self.imgs2.data.length == 0) {
                    alert('请上传酒店经理签名图');
                    return;
                }

                // 背景视频
                if(
                    (self.imgs3.data.length == 0 )/*|| 
                    (self.imgs3.data.length > 1 && (self.imgs3.data[1].progress < 100 || self.imgs3.data[1].progress == -1))*/
                ) {
                    alert('请上传背景视频');
                    return;
                }

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
                      "HotelManageSignURL":self.imgs2.data[0].src,
                      "HotelManageSignSize":self.imgs2.data[0].fileSize,
                      "BackgroundVideoURL":self.imgs3.data[0].src,
                      "BackgroundVideoSize":self.imgs3.data[0].fileSize
                    },
                    "lang": ""
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
                        $state.go('app.tvAdmin', {initS: '欢迎页面'}, { 
                          reload: true, inherit: false, notify: true 
                        });
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
                                    console.log(percentComplete);
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
                            console.log('failure');
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
            var id = $stateParams.moduleId;

            self.init = function() {
                console.log(id);
            }

        }
    ])

    .controller('tvMovieCommonController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
        function ($scope, $state, $http, $stateParams, $location, util) {
            var self = this;
            var id = $stateParams.moduleId;

            self.init = function() {
                console.log(id);
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
                $scope.app.maskUrl = '';
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
                    "lang": ""
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
                        $state.go('app.tvAdmin', {initS: '首页'}, { 
                          reload: true, inherit: false, notify: true 
                        });
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
                                    console.log(percentComplete);
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
                            console.log('failure');
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
                        console.log(self.modules[0].Name)
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
                $scope.app.maskUrl = '';
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
                      "IconURL":self.imgs1.data[0].src,
                      "IconSize":self.imgs1.data[0].fileSize,
                      "IconFocusURL":self.imgs2.data[0].src,
                      "IconFocusSize":self.imgs2.data[0].fileSize,
                      "Seq":self.seq  //在一级菜单中的排序号，从1开始
                    },
                    "lang": ""
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
                        $state.go('app.tvAdmin', {initS: self.menuLv == 1 ? '首页' : self.parentMenu.name}, { 
                          reload: true, inherit: false, notify: true 
                        });
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
                                    console.log(percentComplete);
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
                            console.log('failure');
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
                $scope.app.maskUrl = '';
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
                    "lang": ""
                })
                console.log(data)
                self.saving = true;
                $http({
                    method: 'POST',
                    url: util.getApiUrl('mainmenu', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        alert('修改成功');
                        $state.go('app.tvAdmin', {initS: '首页'}, { 
                          reload: true, inherit: false, notify: true 
                        });
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
                $scope.app.maskUrl = '';
            }

            self.save = function() {

                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "createWelcomePage",
                    "viewType": self.style,
                    "lang": ""
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
                        $state.go('app.tvAdmin', {initS: '欢迎页面'}, { 
                          reload: true, inherit: false, notify: true 
                        });
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

})();
