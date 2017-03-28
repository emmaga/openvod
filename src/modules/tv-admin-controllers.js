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
                self.MainMenu_LiFeng_SecondMenu = false;
                self.MainMenu_SX_SecondMenu = false;
                self.MainMenu_Yeste_SecondMenu = false;
                self.MainMenu_SiMaTai_SecondMenu = false;

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
                console && console.log('select ' + branch.label, 'type: '+branch.data.type);

                // welcome
                if(branch.data.type == "welcome") {
                    $state.go('app.tvAdmin.welcome', {label: branch.label});
                }

                // version
                if(branch.data.type == 'version') {
                    $state.go('app.tvAdmin.version', {label: branch.label});
                }

                // guangGaoWei
                if(branch.data.type == 'guangGaoWei') {
                    $state.go('app.tvAdmin.guangGaoWei', {label: branch.label});
                }

                // projectConfig
                if(branch.data.type == 'projectConfig') {
                    $state.go('app.tvAdmin.projectConfig', {label: branch.label});
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

                // liveSX
                if(branch.data.type == 'Live_SX') {
                    $state.go('app.tvAdmin.Live_SX', {moduleId: branch.data.moduleId, label: branch.label});
                    self.changeMenuInfo();
                }

                // simplePicText
                if(branch.data.type == 'SimplePicText') {
                    $state.go('app.tvAdmin.simplePicText', {moduleId: branch.data.moduleId, label: branch.label});
                    self.changeMenuInfo();        
                }

                // simpleSmallPicText
                if(branch.data.type == 'SimpleSmallPicText') {
                    $state.go('app.tvAdmin.SimpleSmallPicText', {moduleId: branch.data.moduleId, label: branch.label});
                    self.changeMenuInfo();        
                }

                //雅思特 小图 Yeste_SimpleSmallPicText
                if(branch.data.type == 'Yeste_SimpleSmallPicText') {
                    $state.go('app.tvAdmin.Yeste_SimpleSmallPicText', {moduleId: branch.data.moduleId, label: branch.label});
                    self.changeMenuInfo();
                }
                //雅思特 轮播图 Yeste_SimpleSmallPicText_Carousel
                if(branch.data.type == 'Yeste_SimpleSmallPicText_Carousel') {
                    $state.go('app.tvAdmin.Yeste_SimpleSmallPicText_Carousel', {moduleId: branch.data.moduleId, label: branch.label});
                    self.changeMenuInfo();
                }

                //司马台 小图 SiMaTai_SimpleSmallPicText
                if(branch.data.type == 'SiMaTai_SimpleSmallPicText') {
                    $state.go('app.tvAdmin.SiMaTai_SimpleSmallPicText', {moduleId: branch.data.moduleId, label: branch.label});
                    self.changeMenuInfo();
                }

                //司马台 二级分类图文 SiMaTai_PicText_Classification
                if(branch.data.type == 'SiMaTai_PicText_Classification' ) {
                    $state.go('app.tvAdmin.SiMaTai_PicText_Classification', {moduleId: branch.data.moduleId, label: branch.label});
                    self.changeMenuInfo();
                }

                //司马台 三级分类图文
                if(branch.data.type == 'SiMaTai_PicText_Classification_ThreeLevel') {
                    $state.go('app.tvAdmin.SiMaTai_PicText_Classification_ThreeLevel', {moduleId: branch.data.moduleId, label: branch.label});
                    self.changeMenuInfo();
                }

                //三星天气 Samsung_Weather
                if(branch.data.type == 'Samsung_Weather') {
                    $state.go('app.tvAdmin.Samsung_Weather', {moduleId: branch.data.moduleId, label: branch.label});
                    self.changeMenuInfo();
                }

                //通用天气 WeatherCommon
                if(branch.data.type == 'WeatherCommon') {
                    $state.go('app.tvAdmin.WeatherCommon', {moduleId: branch.data.moduleId, label: branch.label});
                    self.changeMenuInfo();
                }

                //三星午餐 Samsung_PicText_Classification
                if(branch.data.type == 'Samsung_PicText_Classification') {
                    $state.go('app.tvAdmin.Samsung_PicText_Classification', {moduleId: branch.data.moduleId, label: branch.label});
                    self.changeMenuInfo();
                }

                //SkyworthDTMB
                if(branch.data.type == 'SkyworthDTMB') {
                    $state.go('app.tvAdmin.SkyworthDTMB', {moduleId: branch.data.moduleId, label: branch.label});
                    self.changeMenuInfo();
                }


                // LiFeng_SimpleSmallPicText
                if(branch.data.type == 'LiFeng_SimpleSmallPicText') {
                    //  type的名字 和 state 的名字 不一样，下次要起好
                    $state.go('app.tvAdmin.SimpleSmallPicText_LiFeng', {moduleId: branch.data.moduleId, label: branch.label});
                    self.changeMenuInfo();        
                }
                // LiFeng_SimpleSmallPicText_Left
                if(branch.data.type == 'LiFeng_SimpleSmallPicText_Left') {
                    $state.go('app.tvAdmin.LiFeng_SimpleSmallPicText_Left', {moduleId: branch.data.moduleId, label: branch.label});
                    self.changeMenuInfo();        
                }
                // LiFeng_SimpleSmallPicText_Left
                if(branch.data.type == 'ZheFei_SimpleSmallPicText_Carousel') {
                    $state.go('app.tvAdmin.ZheFei_SimpleSmallPicText_Carousel', {moduleId: branch.data.moduleId, label: branch.label});
                    self.changeMenuInfo();        
                }
                // ZheFei_SimpleSmallPicText_Small
                if(branch.data.type == 'ZheFei_SimpleSmallPicText_Small') {
                    //  type的名字 和 state 的名字 不一样，下次要起好
                    $state.go('app.tvAdmin.ZheFei_SimpleSmallPicText_Small', {moduleId: branch.data.moduleId, label: branch.label});
                    self.changeMenuInfo();        
                }

                //multPic
                if(branch.data.type == 'MultPic') {
                    $state.go('app.tvAdmin.multPic', {moduleId: branch.data.moduleId, label: branch.label});
                    self.changeMenuInfo();
                }

                //LiFeng_MultPic
                if(branch.data.type == 'LiFeng_MultPic') {
                    $state.go('app.tvAdmin.LiFeng_MultPic', {moduleId: branch.data.moduleId, label: branch.label});
                    self.changeMenuInfo();
                }

                //LiFeng_MultPic
                if(branch.data.type == 'ZheFei_MultPic') {
                    $state.go('app.tvAdmin.ZheFei_MultPic', {moduleId: branch.data.moduleId, label: branch.label});
                    self.changeMenuInfo();
                }

                //pictext_classification 带分类的图文
                if(branch.data.type == 'PicText_Classification') {
                    $state.go('app.tvAdmin.PicText_Classification', {moduleId: branch.data.moduleId, label: branch.label});
                    self.changeMenuInfo();
                }

                //MultPic_SX_Small 书香多图（小）
                if(branch.data.type == 'MultPic_SX_Small') {
                    $state.go('app.tvAdmin.MultPic_SX_Small', {moduleId: branch.data.moduleId, label: branch.label});
                    self.changeMenuInfo();
                }

                //MultPic_SX_Small 书香多图（大）
                if(branch.data.type == 'MultPic_SX_Big') {
                    $state.go('app.tvAdmin.MultPic_SX_Big', {moduleId: branch.data.moduleId, label: branch.label});
                    self.changeMenuInfo();
                }

                //SimplePicText_Price 书香图文（价格）
                if(branch.data.type == 'SimplePicText_Price') {
                    $state.go('app.tvAdmin.SimplePicText_Price', {moduleId: branch.data.moduleId, label: branch.label});
                    self.changeMenuInfo();
                }
                //SimplePicText_SX 书香图文
                if(branch.data.type == 'SimplePicText_SX') {
                    $state.go('app.tvAdmin.SimplePicText_SX', {moduleId: branch.data.moduleId, label: branch.label});
                    self.changeMenuInfo();
                }
                //PicText_Classification_SX 书香图文分类
                if(branch.data.type == 'PicText_Classification_SX') {
                    $state.go('app.tvAdmin.PicText_Classification_SX', {moduleId: branch.data.moduleId, label: branch.label});
                    self.changeMenuInfo();
                }
                //ZheFei_PicText_Classification 喆啡图文分类
                if(branch.data.type == 'ZheFei_PicText_Classification') {
                    // type 和 state 的名字不一样
                    $state.go('app.tvAdmin.ZheFei_PicText_Classification', {moduleId: branch.data.moduleId, label: branch.label});
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

                // worldClock
                if(branch.data.type == 'WorldClock') {
                    $state.go('app.tvAdmin.worldClock', {moduleId: branch.data.moduleId, label: branch.label});
                    self.changeMenuInfo();        
                }
                //雅思特 世界时钟 Yeste_WorldClock
                if(branch.data.type == 'Yeste_WorldClock') {
                    $state.go('app.tvAdmin.Yeste_WorldClock', {moduleId: branch.data.moduleId, label: branch.label});
                    self.changeMenuInfo();
                }
                // SkyworthATV
                if(branch.data.type == 'SkyworthATV') {
                    $state.go('app.tvAdmin.SkyworthATV', {moduleId: branch.data.moduleId, label: branch.label});
                    self.changeMenuInfo();        
                }
                // SkyworthHDMI
                if(branch.data.type == 'SkyworthHDMI') {
                    $state.go('app.tvAdmin.SkyworthHDMI', {moduleId: branch.data.moduleId, label: branch.label});
                    self.changeMenuInfo();        
                }
                //BaoFengHDMI
                if(branch.data.type == 'BaoFengHDMI') {
                    $state.go('app.tvAdmin.BaoFengHDMI', {moduleId: branch.data.moduleId, label: branch.label});
                    self.changeMenuInfo();
                }

                // SkyworthDTV
                if(branch.data.type == 'SkyworthDTV') {
                    $state.go('app.tvAdmin.SkyworthDTV', {moduleId: branch.data.moduleId, label: branch.label});
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

                // MusicCommonSX
                if(branch.data.type == 'MusicCommon_SX') {

                    $state.go('app.tvAdmin.MusicCommon_SX', {moduleId: branch.data.moduleId, label: branch.label});
                    self.changeMenuInfo();
                }

                // WeatherSX
                if(branch.data.type == 'Weather_SX') {

                    $state.go('app.tvAdmin.Weather_SX', {moduleId: branch.data.moduleId, label: branch.label});
                    self.changeMenuInfo();
                }
                //Yeste_Weather
                if(branch.data.type == 'Yeste_Weather') {

                    $state.go('app.tvAdmin.Yeste_Weather', {moduleId: branch.data.moduleId, label: branch.label});
                    self.changeMenuInfo();
                }

                //WeatherCommon
                if(branch.data.type == 'WeatherCommon') {

                    $state.go('app.tvAdmin.WeatherCommon', {moduleId: branch.data.moduleId, label: branch.label});
                    self.changeMenuInfo();
                }

                // MainMenu_THJ_SecondMenu
                if(branch.data.type == 'MainMenu_THJ_SecondMenu'
                    || branch.data.type == 'MainMenu_SX_SecondMenu'
                    || branch.data.type == 'MainMenu_LiFeng_SecondMenu'
                    || branch.data.type == 'MainMenu_Yeste_SecondMenu'
                    || branch.data.type == 'MainMenu_SiMaTai_SecondMenu') {
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
                console.log(self.imgs1);
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

    // 添加图文模块内的图文
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
                        self.pics = data.data.res;
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

    .controller('tvSimpleSmallPicTextEditController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
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
                console.log(self.imgs1);
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


    // (丽枫酒店 多语言标题 介绍 图片(不需要多语言) 序号)    编辑
    .controller('tvSimpleSmallPicTextLFEditController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
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
                console.log(self.imgs1);
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

    .controller('tvSimpleSmallPicTextLFEditLeftController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            console.log('tvSimpleSmallPicTextLFEditLeftController')
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
                console.log(self.imgs1);
            }

            self.save = function() {

                //图片必填验证
                if(self.imgs1.data.length == 0) {
                    alert('请上传图片');
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


    .controller('tvSimpleSmallPicTextZFEditController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            var self = this;
            console.log('tvSimpleSmallPicTextZFEditController')
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
                console.log(self.imgs1);
            }

            self.save = function() {

                //图片必填验证
                if(self.imgs1.data.length == 0) {
                    alert('请上传图片');
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

    .controller('tvSimpleSmallPicTextZFCarouselEditController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
       function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
           var self = this;
           console.log('tvSimpleSmallPicTextZFCarouselEditController')
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
               // self.Title = self.picInfo.Title;
               self.Text = self.picInfo.Text;
               self.imgs1 = new Imgs([{"ImageURL": self.picInfo.PicURL, "ImageSize": self.picInfo.PicSize}], true);
               self.imgs1.initImgs();
               console.log(self.imgs1);
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
                       // "Title": self.Title,
                       "Title": {},
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



    .controller('tvSimpleSmallPicTextAddController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
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
    // (丽枫酒店 多语言标题 介绍 图片(不需要多语言) 序号)    添加
    .controller('tvSimpleSmallPicTextLFAddController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            var self = this;
            console.log('tvSimpleSmallPicTextLFAddController')
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
                if (self.imgs1.data.length == 0 || self.imgs1.data[0].progress < 100) {
                    alert('请上传图片');
                    return;
                }

                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "add",
                    "viewID": Number(self.viewId),
                    "data": {
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
                    } else if (data.rescode == '401') {
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else {
                        alert('添加失败，' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function(value) {
                    self.saving = false;
                });

            }


            // 图片上传相关
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
                                    console && console.log(percentComplete);
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
                                    // 如果长度大于1张图片，删除前几张图片
                                    if (o.data.length > 1) {
                                        for (var i = 0; i < o.data.length - 1; i++) {
                                            o.deleteById(o.data[i].id);
                                        }
                                    }
                                }
                            });
                        },
                        function(xhr) {
                            $scope.$apply(function() {
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

    .controller('tvSimpleSmallPicTextZFAddController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            var self = this;
            console.log('tvSimpleSmallPicTextZFAddController')
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
                if (self.imgs1.data.length == 0 || self.imgs1.data[0].progress < 100) {
                    alert('请上传图片');
                    return;
                }

                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "add",
                    "viewID": Number(self.viewId),
                    "data": {
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
                    } else if (data.rescode == '401') {
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else {
                        alert('添加失败，' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function(value) {
                    self.saving = false;
                });

            }


            // 图片上传相关
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
                                    console && console.log(percentComplete);
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
                                    // 如果长度大于1张图片，删除前几张图片
                                    if (o.data.length > 1) {
                                        for (var i = 0; i < o.data.length - 1; i++) {
                                            o.deleteById(o.data[i].id);
                                        }
                                    }
                                }
                            });
                        },
                        function(xhr) {
                            $scope.$apply(function() {
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

    .controller('tvSimpleSmallPicTextZFCarouselAddController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            var self = this;
            console.log('tvSimpleSmallPicTextZFCarouselAddController')
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
                if (self.imgs1.data.length == 0 || self.imgs1.data[0].progress < 100) {
                    alert('请上传图片');
                    return;
                }

                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "add",
                    "viewID": Number(self.viewId),
                    "data": {
                        "PicURL": self.imgs1.data[0].src,
                        "Seq": self.Seq,
                        "Text": self.Text,
                        // "Title": self.Title,
                        "Title": {},
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
                    } else if (data.rescode == '401') {
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else {
                        alert('添加失败，' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function(value) {
                    self.saving = false;
                });

            }


            // 图片上传相关
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
                                    console && console.log(percentComplete);
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
                                    // 如果长度大于1张图片，删除前几张图片
                                    if (o.data.length > 1) {
                                        for (var i = 0; i < o.data.length - 1; i++) {
                                            o.deleteById(o.data[i].id);
                                        }
                                    }
                                }
                            });
                        },
                        function(xhr) {
                            $scope.$apply(function() {
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


    .controller('tvSimpleSmallPicTextLFLeftAddController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            var self = this;
            console.log('tvSimpleSmallPicTextLFLeftAddController')
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
                if (self.imgs1.data.length == 0 || self.imgs1.data[0].progress < 100) {
                    alert('请上传图片');
                    return;
                }

                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "add",
                    "viewID": Number(self.viewId),
                    "data": {
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
                    } else if (data.rescode == '401') {
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else {
                        alert('添加失败，' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function(value) {
                    self.saving = false;
                });

            }


            // 图片上传相关
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
                                    console && console.log(percentComplete);
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
                                    // 如果长度大于1张图片，删除前几张图片
                                    if (o.data.length > 1) {
                                        for (var i = 0; i < o.data.length - 1; i++) {
                                            o.deleteById(o.data[i].id);
                                        }
                                    }
                                }
                            });
                        },
                        function(xhr) {
                            $scope.$apply(function() {
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


    .controller('tvSimpleSmallPicTextController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
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
                $scope.app.showHideMask(true,'pages/tv/SimpleSmallPicTextEdit.html');
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
                $scope.app.showHideMask(true,'pages/tv/SimpleSmallPicTextAdd.html');
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
                        self.pics = data.data.res;
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

    // 丽枫酒店 多语言标题 介绍 图片(不需要多语言) 序号
    .controller('tvLFSimpleSmallPicTextController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
        function ($scope, $state, $http, $stateParams, $location, util) {
            var self = this;
            console.log('tvLFSimpleSmallPicTextController')
            self.init = function() {
                self.viewId = $stateParams.moduleId;
                self.defaultLangCode = util.getDefaultLangCode();
                self.loadList();
            }

            self.edit = function(index) {
                $scope.app.maskParams.viewId = self.viewId;
                $scope.app.maskParams.picInfo = self.pics[index];
                $scope.app.showHideMask(true,'pages/tv/SimpleSmallPicTextEdit_LiFeng.html');
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
                $scope.app.showHideMask(true,'pages/tv/SimpleSmallPicTextAdd_LiFeng.html');
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

    //  tvLFSimpleSmallPicTextLeftController
    .controller('tvLFSimpleSmallPicTextLeftController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
        function ($scope, $state, $http, $stateParams, $location, util) {
            var self = this;
            console.log('tvLFSimpleSmallPicTextLeftController')
            self.init = function() {
                self.viewId = $stateParams.moduleId;
                self.defaultLangCode = util.getDefaultLangCode();
                self.loadList();
            }

            self.edit = function(index) {
                $scope.app.maskParams.viewId = self.viewId;
                $scope.app.maskParams.picInfo = self.pics[index];
                $scope.app.showHideMask(true,'pages/tv/SimpleSmallPicTextEdit_LiFeng_Left.html');
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
                $scope.app.showHideMask(true,'pages/tv/SimpleSmallPicTextAdd_LiFeng_Left.html');
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

    .controller('tvSimpleSmallPicTextZFController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
        function ($scope, $state, $http, $stateParams, $location, util) {
            var self = this;
            console.log('tvSimpleSmallPicTextZFController')
            self.init = function() {
                self.viewId = $stateParams.moduleId;
                self.defaultLangCode = util.getDefaultLangCode();
                self.loadList();
            }

            self.edit = function(index) {
                $scope.app.maskParams.viewId = self.viewId;
                $scope.app.maskParams.picInfo = self.pics[index];
                $scope.app.showHideMask(true,'pages/tv/SimpleSmallPicTextEdit_ZheFei.html');
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
                $scope.app.showHideMask(true,'pages/tv/SimpleSmallPicTextAdd_ZheFei.html');
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

    // 雅思特 小图 Yeste_SimpleSmallPicText Controler
    .controller('Yeste_SimpleSmallPicText', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
            function ($scope, $state, $http, $stateParams, $location, util) {
                var self = this;
                self.init = function() {
                    self.viewId = $stateParams.moduleId;
                    self.defaultLangCode = util.getDefaultLangCode();
                    self.loadList();
                }

                self.edit = function(index) {
                    console.log('edit');
                    $scope.app.maskParams.viewId = self.viewId;
                    $scope.app.maskParams.picInfo = self.pics[index];
                    $scope.app.showHideMask(true,'pages/tv/SimpleSmallPicTextEdit_Yeste.html');
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
                    console.log('add');
                    $scope.app.maskParams.viewId = self.viewId;
                    $scope.app.showHideMask(true,'pages/tv/SimpleSmallPicTextAdd_Yeste.html');
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
    // 雅思特 小图 Add controler
    .controller('tvSimpleSmallPicTextYesteAddController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function($scope, $state, $http, $stateParams, $location, util, CONFIG) {
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
                if (self.imgs1.data.length == 0 || self.imgs1.data[0].progress < 100) {
                    alert('请上传图片');
                    return;
                }

                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "add",
                    "viewID": Number(self.viewId),
                    "data": {
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
                    } else if (data.rescode == '401') {
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else {
                        alert('添加失败，' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function(value) {
                    self.saving = false;
                });

            }

            // 图片上传相关
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
                                    console && console.log(percentComplete);
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
                                    // 如果长度大于1张图片，删除前几张图片
                                    if (o.data.length > 1) {
                                        for (var i = 0; i < o.data.length - 1; i++) {
                                            o.deleteById(o.data[i].id);
                                        }
                                    }
                                }
                            });
                        },
                        function(xhr) {
                            $scope.$apply(function() {
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
    //雅思特 小图 Edit Yeste_SimpleSmallPicText
    .controller('tvSimpleSmallPicTextYesteEditController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
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
                console.log(self.imgs1);
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
    //雅思特 轮播图 Yeste_SimpleSmallPicText_Carousel
    .controller('Yeste_SimpleSmallPicText_Carousel', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
        function ($scope, $state, $http, $stateParams, $location, util) {
            var self = this;
            self.init = function() {
                self.viewId = $stateParams.moduleId;
                self.defaultLangCode = util.getDefaultLangCode();
                self.loadList();
            }

            self.edit = function(index) {
                console.log('edit');
                $scope.app.maskParams.viewId = self.viewId;
                $scope.app.maskParams.picInfo = self.pics[index];
                $scope.app.showHideMask(true,'pages/tv/SimpleSmallPicTextEdit_Yeste_Carousel.html');
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
                console.log('add');
                $scope.app.maskParams.viewId = self.viewId;
                $scope.app.showHideMask(true,'pages/tv/SimpleSmallPicTextAdd_Yeste_Carousel.html');
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
    //雅思特 轮播图 Add Yeste_SimpleSmallPicText_Carousel_Add
    .controller('Yeste_SimpleSmallPicText_Carousel_Add', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function($scope, $state, $http, $stateParams, $location, util, CONFIG) {
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
                if (self.imgs1.data.length == 0 || self.imgs1.data[0].progress < 100) {
                    alert('请上传图片');
                    return;
                }

                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "add",
                    "viewID": Number(self.viewId),
                    "data": {
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
                    } else if (data.rescode == '401') {
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else {
                        alert('添加失败，' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function(value) {
                    self.saving = false;
                });

            }

            // 图片上传相关
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
                                    console && console.log(percentComplete);
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
                                    // 如果长度大于1张图片，删除前几张图片
                                    if (o.data.length > 1) {
                                        for (var i = 0; i < o.data.length - 1; i++) {
                                            o.deleteById(o.data[i].id);
                                        }
                                    }
                                }
                            });
                        },
                        function(xhr) {
                            $scope.$apply(function() {
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
    //雅思特 轮播图 Edit Yeste_SimpleSmallPicText_Carousel_Edit
    .controller('Yeste_SimpleSmallPicText_Carousel_Edit', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
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
                console.log(self.imgs1);
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
    //雅思特 世界时钟 Yeste_WorldClock
    .controller('Yeste_WorldClock', ['$q', '$scope', '$state', '$http', '$stateParams', '$filter', 'util', 'CONFIG',
            function($q, $scope, $state, $http, $stateParams, $filter, util, CONFIG) {
                var self = this;
                self.init = function() {

                }
            }
        ])

    //雅思特天气 Yeste_Weather
    .controller('Yeste_Weather_Controler', ['$q', '$scope', '$state', '$http', '$stateParams', '$filter', 'util', 'CONFIG',
        function($q, $scope, $state, $http, $stateParams, $filter, util, CONFIG) {
            var self = this;
            self.init = function() {
                self.info = {};
                self.viewId = $stateParams.moduleId;
                self.defaultLangCode = util.getDefaultLangCode();
                self.editLangs = util.getParams('editLangs');
                self.ENlang = self.getENlang();
                self.getInfo();
                if($scope.app.maskParams.num) {
                    self.tab = $scope.app.maskParams.num
                }else {
                    self.tab = $scope.app.tabNum ? $scope.app.tabNum:1;
                }
                // 使用一次后，赋值为空
                $scope.app.tabNum  = null;
                $scope.app.maskParams.num = null;
            }

            //获取英文城市名
            self.getENlang = function() {
                var ENlang;
                for(var i=0; i<self.editLangs.length; i++) {
                    ENlang = self.editLangs[i];
                    if(ENlang.name=="en") {
                        return ENlang.code;
                    }
                }
            }

            //获取
            self.getInfo = function () {
                var deferred = $q.defer();
                self.loading = true;
                var data = JSON.stringify({
                    viewID: Number(self.viewId),
                    token: util.getParams('token'),
                    action: "get",
                    lang: util.langStyle()
                })
                $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        self.info = data.data.data;
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

            };
            //新增
            self.add = function(num) {
                $scope.app.maskParams.viewId = self.viewId;
                $scope.app.maskParams.num = num;
                $scope.app.showHideMask(true,'pages/tv/WeatherAdd_Yeste.html');
            }

            self.Country = function () {
                if(self.tab==1) {
                    return "China";
                }else {
                    return "Oversea";
                }
            }
            //修改
            self.edit = function(Item, num) {
                console.log('edit');
                $scope.app.maskParams.viewId = self.viewId;
                $scope.app.maskParams.cityInfo = Item;
                $scope.app.maskParams.ENlang = self.ENlang;
                $scope.app.maskParams.num = num;
                $scope.app.showHideMask(true,'pages/tv/WeatherEdit_Yeste.html');
            }
            //删除
            self.del = function(id, index, num) {
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
                        $scope.app.maskParams.num = num;
                        $state.reload('app.tvAdmin.Yeste_Weather');
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
            $scope.$on("tabNum",function(){
                alert('success')
            })

        }
    ])
    //雅思特天气 Add Yeste_Weather
    .controller('Yeste_Weather_Add_Controler',['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            var self = this;
            self.init = function() {
                self.viewId = $scope.app.maskParams.viewId;
                self.editLangs = util.getParams('editLangs');
                self.tabNum  = $scope.app.maskParams.num;
                self.getCountry(self.tabNum)
            };

            self.cancel = function() {
                $scope.app.showHideMask(false);
            };
            self.getCountry = function (para) {
                if(para==1) {
                    self.whichCountry = "China";
                }else {
                    self.whichCountry = "Overseas";
                }
            }

            self.save = function() {
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "add",
                    "viewID": Number(self.viewId),
                    "data":{
                        "Seq": self.Seq,
                        "Country": self.whichCountry,
                        "City": self.City
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
                        $state.reload('app.tvAdmin.Yeste_Weather');
                        // 在app控制器上面加了一个天气的参数
                        $scope.app.tabNum = self.tabNum;
                        self.cancel();
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

            };
        }
    ])
    //雅思特天气 Edit Yeste_Weather
    .controller('Yeste_Weather_Edit_Controler', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            var self = this;
            self.init = function() {
                self.viewId = $scope.app.maskParams.viewId;
                self.cityInfo = $scope.app.maskParams.cityInfo;
                self.ENlang = $scope.app.maskParams.ENlang;
                // 获取编辑多语言信息
                self.editLangs = util.getParams('editLangs');
                self.tabNum  = $scope.app.maskParams.num;
            }

            self.cancel = function() {
                $scope.app.showHideMask(false);
            }
            self.save = function() {
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "edit",
                    "viewID": Number(self.viewId),
                    "data":{
                        "ID": Number(self.cityInfo.ID),
                        "Seq": self.cityInfo.Seq,
                        "Country": self.cityInfo.Country,
                        "City": self.cityInfo.City
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
                        // 在app控制器上面加了一个天气的参数
                        $scope.app.tabNum = self.tabNum;
                        self.cancel();
                        $state.reload('app.tvAdmin.Yeste_Weather');
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


    //司马台 小图 SiMaTai_SimpleSmallPicTextControler
    .controller('SiMaTai_SimpleSmallPicTextControler', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
        function ($scope, $state, $http, $stateParams, $location, util) {
            var self = this;
            self.init = function() {
                self.viewId = $stateParams.moduleId;
                self.defaultLangCode = util.getDefaultLangCode();
                self.loadList();
            }

            self.edit = function(index) {
                console.log('edit');
                $scope.app.maskParams.viewId = self.viewId;
                $scope.app.maskParams.picInfo = self.pics[index];
                $scope.app.showHideMask(true,'pages/tv/SimpleSmallPicTextEdit_SiMaTai.html');
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
                console.log('add');
                $scope.app.maskParams.viewId = self.viewId;
                $scope.app.showHideMask(true,'pages/tv/SimpleSmallPicTextAdd_SiMaTai.html');
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
    //司马台 小图 Add SiMaTai_SimpleSmallPicTextControler_Add
    .controller('SiMaTai_SimpleSmallPicTextControler_Add', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function($scope, $state, $http, $stateParams, $location, util, CONFIG) {
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
                if (self.imgs1.data.length == 0 || self.imgs1.data[0].progress < 100) {
                    alert('请上传图片');
                    return;
                }

                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "add",
                    "viewID": Number(self.viewId),
                    "data": {
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
                        $state.reload("app.tvAdmin.SiMaTai_SimpleSmallPicText");
                        self.cancel();
                    } else if (data.rescode == '401') {
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else {
                        alert('添加失败，' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function(value) {
                    self.saving = false;
                });

            }

            // 图片上传相关
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
                                    console && console.log(percentComplete);
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
                                    // 如果长度大于1张图片，删除前几张图片
                                    if (o.data.length > 1) {
                                        for (var i = 0; i < o.data.length - 1; i++) {
                                            o.deleteById(o.data[i].id);
                                        }
                                    }
                                }
                            });
                        },
                        function(xhr) {
                            $scope.$apply(function() {
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
    //司马台 小图 Edit SiMaTai_SimpleSmallPicTextControler_Edit
    .controller('SiMaTai_SimpleSmallPicTextControler_Edit', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
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
                console.log(self.imgs1);
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
                        $state.reload("app.tvAdmin.SiMaTai_SimpleSmallPicText");
                        self.cancel();
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
    //司马台 二级分类图文 SiMaTai_PicText_Classification
    .controller('SiMaTai_PicText_ClassificationController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
        function ($scope, $state, $http, $stateParams, $location, util) {
            console.log('SiMaTai_PicText_ClassificationController')
            var self = this;
            self.info = []; // 分类＋分类下的图文信息
            self.cateIndex; // 当前选中分类index

            self.init = function() {
                self.viewId = $stateParams.moduleId;
                self.defaultLangCode = util.getDefaultLangCode();
                self.loadInfo();
            }

            /**
             * 添加该模版的图文分类
             *
             * @method addCategory
             */
            self.addCategory = function() {
                $scope.app.maskParams.viewId = self.viewId;
                $scope.app.maskParams.loadInfo = self.loadInfo;
                $scope.app.showHideMask(true,'pages/tv/PicTextClassCateAdd_SiMaTai.html');
            }

            /**
             * 删除图文分类
             *
             * @method delCate
             */
            self.delCate = function() {
                if(!confirm('确认删除此分类？（分类下内容将全部删除）')){
                    return;
                }
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "delete",
                    "viewID": self.viewId,
                    "lang": util.langStyle(),
                    "data": {
                        "ID": self.info[self.cateIndex].ID
                    }
                });
                self.cateDeleting = true;
                $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        self.loadInfo();
                    }
                    else {
                        alert('连接服务器出错' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function(value) {
                    self.cateDeleting = false;
                });
            }

            /**
             * 编辑该模版的图文分类
             *
             * @method editCate
             */
            self.editCate = function() {
                $scope.app.maskParams.viewId = self.viewId;
                $scope.app.maskParams.info = self.info[self.cateIndex];
                $scope.app.maskParams.loadInfo = self.loadInfo;
                $scope.app.showHideMask(true,'pages/tv/PicTextClassCateEdit_SiMaTai.html');
            }

            /**
             * 编辑图文
             *
             * @method editPic
             * @param index 图片在该分类下列表中的序号
             */
            self.editPic = function (index) {
                $scope.app.maskParams.viewId = self.viewId;
                $scope.app.maskParams.cateId = self.info[self.cateIndex].ID;
                $scope.app.maskParams.info = self.info[self.cateIndex].sub[index];
                $scope.app.maskParams.loadInfo = self.loadInfo;
                $scope.app.showHideMask(true,'pages/tv/classPicTextEdit_SiMaTai.html');
            }

            /**
             * 添加该模版的图文
             *
             * @method addPic
             */
            self.addPic = function() {
                $scope.app.maskParams.viewId = self.viewId;
                $scope.app.maskParams.cateId = self.info[self.cateIndex].ID;
                $scope.app.maskParams.loadInfo = self.loadInfo;
                $scope.app.showHideMask(true,'pages/tv/classPicTextAdd_SiMaTai.html');
            }

            /**
             * 删除图文
             *
             * @method delPic
             * @param index 图文在列表中的序号
             */
            self.delPic = function(index) {
                if(!confirm('确认删除此图片？')){
                    return;
                }
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "delete",
                    "viewID": self.viewId,
                    "lang": util.langStyle(),
                    "data": {
                        "PID": self.info[self.cateIndex].sub[index].ID
                    }
                });
                self.picDeleting = true;
                $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        self.loadInfo();
                    }
                    else {
                        alert('连接服务器出错' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function(value) {
                    self.picDeleting = false;
                });
            }

            /**
             * 加载分类及分类下的信息
             *
             * @method loadInfo
             */
            self.loadInfo = function() {
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "get",
                    "viewID": self.viewId,
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
                        self.info = data.data.res;
                        if(!self.cateIndex || (self.cateIndex + 1) > self.info.length) {
                            self.cateIndex = 0;
                        }
                        //判断分类下内容为空时，sub属性为空数组，不然模板的ng-repeat会报错
                        if(self.info.length ==0 ){
                            self.info[0].sub = [];
                        }
                    }
                    else {
                        alert('连接服务器出错' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function(value) {
                    self.loading = false;
                });
            }

            /**
             * 加载分类及分类下的信息
             *
             * @method loadInfo
             * @param index 跳转分类在self.info中的index
             */
            self.loadPics = function (index) {
                self.cateIndex = index;
            }

        }
    ])
    //司马台 二级分类图文Add SiMaTai_PicText_ClassificationController_Add
    .controller('SiMaTai_PicText_ClassificationController_Add', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            var self = this;
            self.viewId = 0;
            self.imgs1 = null;
            self.editLangs = util.getParams('editLangs');

            self.init = function() {
                self.viewId = $scope.app.maskParams.viewId;
                self.imgs1 = new Imgs([], true);
                self.imgs2 = new Imgs([], true);
            }

            /**
             * 关闭弹窗
             *
             * @method cancel
             */
            self.cancel = function() {
                $scope.app.showHideMask(false);
            }

            /**
             * 新建分类提交
             *
             * @method save
             */
            self.save = function() {

                if(!(self.imgs1.data[0] && self.imgs1.data[0].src)) {
                    alert('请上传图片');
                    return;
                }

                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "add",
                    "viewID": self.viewId-0,
                    "lang": util.langStyle(),
                    "data": {
                        "PicURL": self.imgs1.data[0].src,
                        "Text": self.cateName,
                        "Title": self.cateName,
                        "Seq": self.Seq,
                        "PicSize": self.imgs1.data[0].fileSize-0,
                        "IconURL":self.imgs2.data[0].src,
                        "IconSize":self.imgs2.data[0].fileSize-0
                    }
                });

                self.saving = true;

                return $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    $scope.app.showHideMask(false);
                    $scope.app.maskParams.loadInfo();
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function(value) {
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
    //司马台 二级分类图文Edit SiMaTai_PicText_ClassificationController_Edit
    .controller('SiMaTai_PicText_ClassificationController_Edit', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
            function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
                var self = this;
                self.viewId = 0;
                self.imgs1 = null;
                self.imgs2 = null;
                self.editLangs = util.getParams('editLangs');

                self.init = function() {
                    self.viewId = $scope.app.maskParams.viewId;
                    self.info = $scope.app.maskParams.info;
                    self.Seq = self.info.Seq;
                    self.cateName = self.info.Title;
                    self.imgs1 = new Imgs([{ "ImageURL": self.info.PicURL, "ImageSize": self.info.PicSize }], true);
                    self.imgs1.initImgs();
                    self.imgs2 = new Imgs([{ "ImageURL": self.info.IconURL, "ImageSize": self.info.IconSize }], true);
                    self.imgs2.initImgs();
                }

                /**
                 * 关闭弹窗
                 *
                 * @method cancel
                 */
                self.cancel = function() {
                    $scope.app.showHideMask(false);
                }

                /**
                 * 保存分类提交
                 *
                 * @method save
                 */
                self.save = function() {

                    if(!(self.imgs1.data[0] && self.imgs1.data[0].src)) {
                        alert('请上传图片');
                        return;
                    }

                    var data = JSON.stringify({
                        "token": util.getParams('token'),
                        "action": "edit",
                        "viewID": self.viewId-0,
                        "lang": util.langStyle(),
                        "data": {
                            "ID": self.info.ID,
                            "PicURL": self.imgs1.data[0].src,
                            "Text": self.cateName,
                            "Title": self.cateName,
                            "Seq": self.Seq,
                            "PicSize": self.imgs1.data[0].fileSize-0,
                            "IconURL": self.imgs2.data[0].src,
                            "IconSize": self.imgs2.data[0].fileSize-0
                        }
                    });

                    self.saving = true;

                    return $http({
                        method: 'POST',
                        url: util.getApiUrl('commonview', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        $scope.app.showHideMask(false);
                        $scope.app.maskParams.loadInfo();
                    }, function errorCallback(response) {
                        alert('连接服务器出错');
                    }).finally(function(value) {
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
    //司马台 二级分类图文 分类下的Edit ClassPicTextEdit_SiMaTai_Controller
    .controller('ClassPicTextEdit_SiMaTai_Controller', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
            function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
                var self = this;

                self.init = function() {
                    self.viewId = $scope.app.maskParams.viewId;
                    self.cateId = $scope.app.maskParams.cateId;
                    self.info = $scope.app.maskParams.info;
                    self.Seq = self.info.Seq;
                    self.Text = self.info.Text;
                    self.Title = self.info.Title;

                    // 获取编辑多语言信息
                    self.editLangs = util.getParams('editLangs');

                    // 初始化频道图片
                    self.imgs1 = new Imgs([{"ImageURL": self.info.PicURL, "ImageSize": self.info.PicSize}], true);
                    self.imgs1.initImgs();

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
                        "action": "edit",
                        "viewID": Number(self.viewId),
                        "data":{
                            "PID": self.info.ID,
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
                            $scope.app.showHideMask(false);
                            $scope.app.maskParams.loadInfo();
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
    //司马台 二级分类图文 分类下的Add ClassPicTextAdd_SiMaTai_Controller
    .controller('ClassPicTextAdd_SiMaTai_Controller', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
            function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
                var self = this;

                self.init = function() {
                    self.viewId = $scope.app.maskParams.viewId;
                    self.cateId = $scope.app.maskParams.cateId;

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
                            "PID": self.cateId,
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
                            $scope.app.showHideMask(false);
                            $scope.app.maskParams.loadInfo();
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
    //司马台 三级分类图文 SiMaTai_PicText_Classification_ThreeLevel
    .controller('SiMaTai_PicText_Classification_ThreeLevel_Controller', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
            function ($scope, $state, $http, $stateParams, $location, util) {
                console.log('SiMaTai_PicText_Classification_ThreeLevel_Controller')
                var self = this;
                self.info = []; // 分类＋分类下的图文信息
                self.cateIndex; // 当前选中分类index
                self.secondIndex;// 当前选中二级分类index
                self.init = function() {
                    self.viewId = $stateParams.moduleId;
                    self.defaultLangCode = util.getDefaultLangCode();
                    self.loadInfo();
                }

                /**
                 * 添加该模版的图文分类
                 *
                 * @method addCategory
                 */
                self.addCategory = function(isLeaf,PID) {
                    console.log(isLeaf,PID)
                    $scope.app.maskParams.viewId = self.viewId;
                    $scope.app.maskParams.addParam = {isLeaf:isLeaf,PID:PID};
                    $scope.app.maskParams.loadInfo = self.loadInfo;
                    $scope.app.showHideMask(true,'pages/tv/PicTextClassCateAdd_SiMaTai_ThreeLevel.html');
                }

                /**
                 * 删除图文分类
                 *
                 * @method delCate
                 */
                self.delCate = function(isLeaf, id) {
                    if(!confirm('确认删除?')){
                        return;
                    }

                    var data = JSON.stringify({
                        "token": util.getParams('token'),
                        "action": "delete",
                        "viewID": self.viewId,
                        "lang": util.langStyle(),
                        "data": {
                            "ID": id,
                            "isLeaf": isLeaf
                        }
                    });
                    self.cateDeleting = true;
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('commonview', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var data = response.data;
                        if (data.rescode == '200') {
                            self.loadInfo();
                        }
                        else {
                            alert('连接服务器出错' + data.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert('连接服务器出错');
                    }).finally(function(value) {
                        self.cateDeleting = false;
                    });
                }

                /**
                 * 编辑该模版的图文分类
                 *
                 * @method editCate
                 */
                self.editCate = function(isLeaf, PID, index) {
                    $scope.app.maskParams.viewId = self.viewId;
                    $scope.app.maskParams.addParam = {isLeaf : isLeaf, PID : PID};
                    if(index !== undefined) {
                        $scope.app.maskParams.info = self.info[self.cateIndex].sub[self.secondIndex].sub[index];

                    }else {
                        (PID === -1) ? $scope.app.maskParams.info = self.info[self.cateIndex] :  $scope.app.maskParams.info = self.info[self.cateIndex].sub[self.secondIndex];
                    }
                    $scope.app.maskParams.loadInfo = self.loadInfo;
                    $scope.app.showHideMask(true,'pages/tv/PicTextClassCateEdit_SiMaTai_ThreeLevel.html');
                }

                /**
                 * 加载分类及分类下的信息
                 *
                 * @method loadInfo
                 */
                self.loadInfo = function() {
                    var data = JSON.stringify({
                        "token": util.getParams('token'),
                        "action": "get",
                        "viewID": self.viewId,
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
                            self.info = data.data.res;
                            // 判断分类下内容为空时，sub属性为空数组，不然模板的ng-repeat会报错
                            // if(self.info[0].sub === undefined ){
                            //     self.info[0].sub = [];
                            // }
                            if(!self.cateIndex || (self.cateIndex + 1) > self.info.length) {
                                self.cateIndex = 0;
                            }
                            if(!self.secondIndex || (self.secondIndex + 1) > self.info.length) {
                                self.secondIndex = 0;
                            }
                            if( self.info.length == 0){
                                return;
                            }
                            // 默认去第一个 一级分类 下 第一个子分类
                            self.firstCategoryId = self.info[0]['ID'];
                            if( !self.info[0].sub){
                                return;
                            }
                            self.secondCategoryId = self.info[0].sub[0]['ID'];


                        }
                        else {
                            alert('连接服务器出错' + data.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert('连接服务器出错');
                    }).finally(function(value) {
                        self.loading = false;
                    });
                }

                /**
                 * 加载分类及分类下的信息
                 *
                 * @method loadInfo
                 * @param index 跳转分类在self.info中的index
                 */
                self.loadPics = function (index, ID) {
                    self.cateIndex = index;
                    // 一级分类的id
                    self.firstCategoryId = ID;
                    //默认先进入第一个二级分类
                    self.secondCategoryId = self.info[index].sub[0].ID;
                }
                self.loadSecondPics = function (index, ID) {
                    self.secondIndex = index;
                    //二级分类的id
                    self.secondCategoryId = ID;
                }

            }
        ])
    //司马台 三级分类图文Add SiMaTai_PicText_Classification_ThreeLevel_Controller_Add
    .controller('SiMaTai_PicText_Classification_ThreeLevel_Controller_Add', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
            function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
                var self = this;
                self.viewId = 0;
                self.imgs1 = null;
                self.editLangs = util.getParams('editLangs');

                self.init = function() {
                    self.viewId = $scope.app.maskParams.viewId;
                    self.addParam = $scope.app.maskParams.addParam;
                    self.imgs1 = new Imgs([], true);
                    self.imgs2 = new Imgs([], true);
                }

                /**
                 * 关闭弹窗
                 *
                 * @method cancel
                 */
                self.cancel = function() {
                    $scope.app.showHideMask(false);
                }

                /**
                 * 新建分类提交
                 *
                 * @method save
                 */
                self.save = function() {

                    if(!(self.imgs1.data[0] && self.imgs1.data[0].src)) {
                        alert('请上传图片');
                        return;
                    }

                    var data = JSON.stringify({
                        "token": util.getParams('token'),
                        "action": "add",
                        "viewID": self.viewId-0,
                        "lang": util.langStyle(),
                        "data": {
                            "isLeaf": self.addParam.isLeaf,
                            "PID":self.addParam.PID,
                            "PicURL": self.imgs1.data[0].src,
                            "Text": self.cateName,
                            "Title": self.cateName,
                            "Seq": self.Seq,
                            "PicSize": self.imgs1.data[0].fileSize-0
                            // "IconURL":self.imgs2.data[0].src,
                            // "IconSize":self.imgs2.data[0].fileSize-0
                        }
                    });

                    self.saving = true;

                    $http({
                        method: 'POST',
                        url: util.getApiUrl('commonview', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var data = response.data;
                        if (data.rescode == '200') {
                            alert('添加成功');
                            $state.reload("app.tvAdmin.SiMaTai_PicText_Classification_ThreeLevel");
                            self.cancel();
                        } else if (data.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert('添加失败，' + data.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert('连接服务器出错');
                    }).finally(function(value) {
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
    //司马台 三级分类图文Edit SiMaTai_PicText_Classification_ThreeLevel_Controller_Edit
    .controller('SiMaTai_PicText_Classification_ThreeLevel_Controller_Edit', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
            function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
                var self = this;
                self.viewId = 0;
                self.imgs1 = null;
                self.imgs2 = null;
                self.editLangs = util.getParams('editLangs');

                self.init = function() {
                    self.viewId = $scope.app.maskParams.viewId;
                    self.info = $scope.app.maskParams.info;
                    self.addParam = $scope.app.maskParams.addParam;
                    console.log($scope.app.maskParams.addParam);
                    self.Seq = self.info.Seq;
                    self.cateName = self.info.Title;
                    self.Text = self.info.Text;
                    self.imgs1 = new Imgs([{ "ImageURL": self.info.PicURL, "ImageSize": self.info.PicSize }], true);
                    self.imgs1.initImgs();
                    self.imgs2 = new Imgs([{ "ImageURL": self.info.IconURL, "ImageSize": self.info.IconSize }], true);
                    self.imgs2.initImgs();
                }

                /**
                 * 关闭弹窗
                 *
                 * @method cancel
                 */
                self.cancel = function() {
                    $scope.app.showHideMask(false);
                }

                /**
                 * 保存分类提交
                 *
                 * @method save
                 */
                self.save = function() {

                    if(!(self.imgs1.data[0] && self.imgs1.data[0].src)) {
                        alert('请上传图片');
                        return;
                    }

                    var data = JSON.stringify({
                        "token": util.getParams('token'),
                        "action": "edit",
                        "viewID": self.viewId-0,
                        "lang": util.langStyle(),
                        "data": {
                            "isLeaf" : self.addParam.isLeaf,
                            "ID": self.info.ID,
                            "PicURL": self.imgs1.data[0].src,
                            "Text": self.cateName,
                            "Title": self.cateName,
                            "Seq": self.Seq,
                            "PicSize": self.imgs1.data[0].fileSize-0,
                            // "IconURL": self.imgs2.data[0].src,
                            // "IconSize": self.imgs2.data[0].fileSize-0
                        }
                    });

                    self.saving = true;

                    return $http({
                        method: 'POST',
                        url: util.getApiUrl('commonview', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        $scope.app.showHideMask(false);
                        $scope.app.maskParams.loadInfo();
                    }, function errorCallback(response) {
                        alert('连接服务器出错');
                    }).finally(function(value) {
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

    //三星天气 Samsung_Weather
    .controller('Samsung_Weather_Controler', ['$q', '$scope', '$state', '$http', '$stateParams', '$filter', 'util', 'CONFIG',
            function($q, $scope, $state, $http, $stateParams, $filter, util, CONFIG) {
                console.log('WeatherCommon');
                var self = this;
                self.init = function() {
                    self.info = {};
                    self.viewId = $stateParams.moduleId;
                    self.defaultLangCode = util.getDefaultLangCode();
                    self.editLangs = util.getParams('editLangs');
                    self.ENlang = self.getENlang();
                    self.getInfo();
                    if($scope.app.maskParams.num) {
                        self.tab = $scope.app.maskParams.num
                    }else {
                        self.tab = $scope.app.tabNum ? $scope.app.tabNum:1;
                    }
                    // 使用一次后，赋值为空
                    $scope.app.tabNum  = null;
                    $scope.app.maskParams.num = null;
                }

                //获取英文城市名
                self.getENlang = function() {
                    var ENlang;
                    for(var i=0; i<self.editLangs.length; i++) {
                        ENlang = self.editLangs[i];
                        if(ENlang.name=="en") {
                            return ENlang.code;
                        }
                    }
                }

                //获取
                self.getInfo = function () {
                    var deferred = $q.defer();
                    self.loading = true;
                    var data = JSON.stringify({
                        viewID: Number(self.viewId),
                        token: util.getParams('token'),
                        action: "get",
                        lang: util.langStyle()
                    })
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('commonview', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var data = response.data;
                        if (data.rescode == '200') {
                            self.info = data.data.data;
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

                };
                //新增
                self.add = function(num) {
                    $scope.app.maskParams.viewId = self.viewId;
                    $scope.app.maskParams.num = num;
                    $scope.app.showHideMask(true,'pages/tv/WeatherAdd_Samsung.html');
                }

                self.Country = function () {
                    if(self.tab==1) {
                        return "China";
                    }else {
                        return "Oversea";
                    }
                }
                //修改
                self.edit = function(Item, num) {
                    console.log('edit');
                    $scope.app.maskParams.viewId = self.viewId;
                    $scope.app.maskParams.cityInfo = Item;
                    $scope.app.maskParams.ENlang = self.ENlang;
                    $scope.app.maskParams.num = num;
                    $scope.app.showHideMask(true,'pages/tv/WeatherEdit_Samsung.html');
                }
                //删除
                self.del = function(id, index, num) {
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
                            $scope.app.maskParams.num = num;
                            $state.reload('app.tvAdmin.Samsung_Weather');
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
                $scope.$on("tabNum",function(){
                    alert('success')
                })

            }
        ])
    //三星天气 Add Samsung_Weather
    .controller('Samsung_Weather_Add_Controler',['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
            function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
                var self = this;
                self.init = function() {
                    self.viewId = $scope.app.maskParams.viewId;
                    self.editLangs = util.getParams('editLangs');
                    self.tabNum  = $scope.app.maskParams.num;
                    self.getCountry(self.tabNum)
                };

                self.cancel = function() {
                    $scope.app.showHideMask(false);
                };
                self.getCountry = function (para) {
                    if(para==1) {
                        self.whichCountry = "China";
                    }else {
                        self.whichCountry = "Overseas";
                    }
                }

                self.save = function() {
                    var data = JSON.stringify({
                        "token": util.getParams('token'),
                        "action": "add",
                        "viewID": Number(self.viewId),
                        "data":{
                            "Seq": self.Seq,
                            "Country": self.whichCountry,
                            "City": self.City
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
                            $state.reload('app.tvAdmin.Samsung_Weather');
                            // 在app控制器上面加了一个天气的参数
                            $scope.app.tabNum = self.tabNum;
                            self.cancel();
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

                };
            }
        ])
    //三星天气 Edit Samsung_Weather
    .controller('Samsung_Weather_Edit_Controler', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
            function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
                var self = this;
                self.init = function() {
                    self.viewId = $scope.app.maskParams.viewId;
                    self.cityInfo = $scope.app.maskParams.cityInfo;
                    self.ENlang = $scope.app.maskParams.ENlang;
                    // 获取编辑多语言信息
                    self.editLangs = util.getParams('editLangs');
                    self.tabNum  = $scope.app.maskParams.num;
                }

                self.cancel = function() {
                    $scope.app.showHideMask(false);
                }
                self.save = function() {
                    var data = JSON.stringify({
                        "token": util.getParams('token'),
                        "action": "edit",
                        "viewID": Number(self.viewId),
                        "data":{
                            "ID": Number(self.cityInfo.ID),
                            "Seq": self.cityInfo.Seq,
                            "Country": self.cityInfo.Country,
                            "City": self.cityInfo.City
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
                            // 在app控制器上面加了一个天气的参数
                            $scope.app.tabNum = self.tabNum;
                            self.cancel();
                            $state.reload('app.tvAdmin.Samsung_Weather');
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

    //通用天气（土豪金） WeatherCommon
    .controller('WeatherCommon_Controler', ['$q', '$scope', '$state', '$http', '$stateParams', '$filter', 'util', 'CONFIG',
        function($q, $scope, $state, $http, $stateParams, $filter, util, CONFIG) {
        console.log('WeatherCommon');
            var self = this;
            self.init = function() {
                self.info = {};
                self.viewId = $stateParams.moduleId;
                self.defaultLangCode = util.getDefaultLangCode();
                self.editLangs = util.getParams('editLangs');
                self.ENlang = self.getENlang();
                self.getInfo();
                if($scope.app.maskParams.num) {
                    self.tab = $scope.app.maskParams.num
                }else {
                    self.tab = $scope.app.tabNum ? $scope.app.tabNum:1;
                }
                // 使用一次后，赋值为空
                $scope.app.tabNum  = null;
                $scope.app.maskParams.num = null;
            }

            //获取英文城市名
            self.getENlang = function() {
                var ENlang;
                for(var i=0; i<self.editLangs.length; i++) {
                    ENlang = self.editLangs[i];
                    if(ENlang.name=="en") {
                        return ENlang.code;
                    }
                }
            }

            //获取
            self.getInfo = function () {
                var deferred = $q.defer();
                self.loading = true;
                var data = JSON.stringify({
                    viewID: Number(self.viewId),
                    token: util.getParams('token'),
                    action: "get",
                    lang: util.langStyle()
                })
                $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        self.info = data.data.data;
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

            };
            //新增
            self.add = function(num) {
                $scope.app.maskParams.viewId = self.viewId;
                $scope.app.maskParams.num = num;
                $scope.app.showHideMask(true,'pages/tv/WeatherAdd_Common.html');
            }

            self.Country = function () {
                if(self.tab==1) {
                    return "China";
                }else {
                    return "Oversea";
                }
            }
            //修改
            self.edit = function(Item, num) {
                console.log('edit');
                $scope.app.maskParams.viewId = self.viewId;
                $scope.app.maskParams.cityInfo = Item;
                $scope.app.maskParams.ENlang = self.ENlang;
                $scope.app.maskParams.num = num;
                $scope.app.showHideMask(true,'pages/tv/WeatherEdit_Common.html');
            }
            //删除
            self.del = function(id, index, num) {
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
                        $scope.app.maskParams.num = num;
                        $state.reload('app.tvAdmin.WeatherCommon');
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
            $scope.$on("tabNum",function(){
                alert('success')
            })

        }
    ])
    //通用天气（土豪金 Add WeatherCommon
    .controller('WeatherCommon_Add_Controler',['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            var self = this;
            self.init = function() {
                self.viewId = $scope.app.maskParams.viewId;
                self.editLangs = util.getParams('editLangs');
                self.tabNum  = $scope.app.maskParams.num;
                self.getCountry(self.tabNum)
            };

            self.cancel = function() {
                $scope.app.showHideMask(false);
            };
            self.getCountry = function (para) {
                if(para==1) {
                    self.whichCountry = "China";
                }else {
                    self.whichCountry = "Overseas";
                }
            }

            self.save = function() {
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "add",
                    "viewID": Number(self.viewId),
                    "data":{
                        "Seq": self.Seq,
                        "Country": self.whichCountry,
                        "City": self.City
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
                        $state.reload('app.tvAdmin.WeatherCommon');
                        // 在app控制器上面加了一个天气的参数
                        $scope.app.tabNum = self.tabNum;
                        self.cancel();
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

            };
        }
    ])
    //通用天气（土豪金 Edit WeatherCommon
    .controller('WeatherCommon_Edit_Controler', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            var self = this;
            self.init = function() {
                self.viewId = $scope.app.maskParams.viewId;
                self.cityInfo = $scope.app.maskParams.cityInfo;
                self.ENlang = $scope.app.maskParams.ENlang;
                // 获取编辑多语言信息
                self.editLangs = util.getParams('editLangs');
                self.tabNum  = $scope.app.maskParams.num;
            }

            self.cancel = function() {
                $scope.app.showHideMask(false);
            }
            self.save = function() {
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "edit",
                    "viewID": Number(self.viewId),
                    "data":{
                        "ID": Number(self.cityInfo.ID),
                        "Seq": self.cityInfo.Seq,
                        "Country": self.cityInfo.Country,
                        "City": self.cityInfo.City
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
                        // 在app控制器上面加了一个天气的参数
                        $scope.app.tabNum = self.tabNum;
                        self.cancel();
                        $state.reload('app.tvAdmin.WeatherCommon');
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

    //分类图文
    .controller('tvPicTextClassListController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
            function ($scope, $state, $http, $stateParams, $location, util) {
                var self = this;
                self.info = []; // 分类＋分类下的图文信息
                self.cateIndex; // 当前选中分类index

                self.init = function() {
                    self.viewId = $stateParams.moduleId;
                    self.defaultLangCode = util.getDefaultLangCode();
                    self.loadInfo();
                }

                /**
                 * 添加该模版的图文分类
                 *
                 * @method addCategory
                 */
                self.addCategory = function() {
                    $scope.app.maskParams.viewId = self.viewId;
                    $scope.app.maskParams.loadInfo = self.loadInfo;
                    $scope.app.showHideMask(true,'pages/tv/PicTextClassCateAdd.html');
                }

                /**
                 * 删除图文分类
                 *
                 * @method delCate
                 */
                self.delCate = function() {
                    if(!confirm('确认删除？')){
                        return;
                    }
                    var data = JSON.stringify({
                        "token": util.getParams('token'),
                        "action": "delete",
                        "viewID": self.viewId,
                        "lang": util.langStyle(),
                        "data": {
                            "ID": self.info[self.cateIndex].ID
                        }
                    });
                    self.cateDeleting = true;
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('commonview', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var data = response.data;
                        if (data.rescode == '200') {
                            self.loadInfo();
                        }
                        else {
                            alert('连接服务器出错' + data.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert('连接服务器出错');
                    }).finally(function(value) {
                        self.cateDeleting = false;
                    });
                }

                /**
                 * 编辑该模版的图文分类
                 *
                 * @method editCate
                 */
                self.editCate = function() {
                    $scope.app.maskParams.viewId = self.viewId;
                    $scope.app.maskParams.info = self.info[self.cateIndex];
                    $scope.app.maskParams.loadInfo = self.loadInfo;
                    $scope.app.showHideMask(true,'pages/tv/PicTextClassCateEdit.html');
                }

                /**
                 * 编辑图文
                 *
                 * @method editPic
                 * @param index 图片在该分类下列表中的序号
                 */
                self.editPic = function (index) {
                    $scope.app.maskParams.viewId = self.viewId;
                    $scope.app.maskParams.cateId = self.info[self.cateIndex].ID;
                    $scope.app.maskParams.info = self.info[self.cateIndex].sub[index];
                    $scope.app.maskParams.loadInfo = self.loadInfo;
                    $scope.app.showHideMask(true,'pages/tv/classPicTextEdit.html');
                }

                /**
                 * 添加该模版的图文
                 *
                 * @method addPic
                 */
                self.addPic = function() {
                    $scope.app.maskParams.viewId = self.viewId;
                    $scope.app.maskParams.cateId = self.info[self.cateIndex].ID;
                    $scope.app.maskParams.loadInfo = self.loadInfo;
                    $scope.app.showHideMask(true,'pages/tv/classPicTextAdd.html');
                }

                /**
                 * 删除图文
                 *
                 * @method delPic
                 * @param index 图文在列表中的序号
                 */
                self.delPic = function(index) {
                    if(!confirm('确认删除？')){
                        return;
                    }
                    var data = JSON.stringify({
                        "token": util.getParams('token'),
                        "action": "delete",
                        "viewID": self.viewId,
                        "lang": util.langStyle(),
                        "data": {
                            "PID": self.info[self.cateIndex].sub[index].ID
                        }
                    });
                    self.picDeleting = true;
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('commonview', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var data = response.data;
                        if (data.rescode == '200') {
                            self.loadInfo();
                        }
                        else {
                            alert('连接服务器出错' + data.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert('连接服务器出错');
                    }).finally(function(value) {
                        self.picDeleting = false;
                    });
                }

                /**
                 * 加载分类及分类下的信息
                 *
                 * @method loadInfo
                 */
                self.loadInfo = function() {
                    var data = JSON.stringify({
                        "token": util.getParams('token'),
                        "action": "get",
                        "viewID": self.viewId,
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
                            self.info = data.data.res;
                            if(!self.cateIndex || (self.cateIndex + 1) > self.info.length) {
                                self.cateIndex = 0;
                            }
                            //判断分类下内容为空时，sub属性为空数组，不然模板的ng-repeat会报错
                            if(self.info.length ==0 ){
                                self.info[0].sub = [];
                            }
                        }
                        else {
                            alert('连接服务器出错' + data.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert('连接服务器出错');
                    }).finally(function(value) {
                        self.loading = false;
                    });
                }

                /**
                 * 加载分类及分类下的信息
                 *
                 * @method loadInfo
                 * @param index 跳转分类在self.info中的index
                 */
                self.loadPics = function (index) {
                    self.cateIndex = index;
                }

            }
        ])
    //分类图文 Add
    .controller('tvPicTextClassCateAddController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
            function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
                var self = this;
                self.viewId = 0;
                self.imgs1 = null;
                self.editLangs = util.getParams('editLangs');

                self.init = function() {
                    self.viewId = $scope.app.maskParams.viewId;
                    self.imgs1 = new Imgs([], true);
                }

                /**
                 * 关闭弹窗
                 *
                 * @method cancel
                 */
                self.cancel = function() {
                    $scope.app.showHideMask(false);
                }

                /**
                 * 新建分类提交
                 *
                 * @method save
                 */
                self.save = function() {

                    if(!(self.imgs1.data[0] && self.imgs1.data[0].src)) {
                        alert('请上传图片');
                        return;
                    }

                    var data = JSON.stringify({
                        "token": util.getParams('token'),
                        "action": "add",
                        "viewID": self.viewId-0,
                        "lang": util.langStyle(),
                        "data": {
                            "PicURL": self.imgs1.data[0].src,
                            "Text": self.cateName,
                            "Title": self.cateName,
                            "Seq": self.Seq,
                            "PicSize": self.imgs1.data[0].fileSize-0
                        }
                    });

                    self.saving = true;

                    return $http({
                        method: 'POST',
                        url: util.getApiUrl('commonview', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        $scope.app.showHideMask(false);
                        $scope.app.maskParams.loadInfo();
                    }, function errorCallback(response) {
                        alert('连接服务器出错');
                    }).finally(function(value) {
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
    //分类图文Edit
    .controller('tvPicTextClassCateEditController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
            function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
                var self = this;
                self.viewId = 0;
                self.imgs1 = null;
                self.editLangs = util.getParams('editLangs');

                self.init = function() {
                    self.viewId = $scope.app.maskParams.viewId;
                    self.info = $scope.app.maskParams.info;
                    self.Seq = self.info.Seq;
                    self.cateName = self.info.Title;
                    self.imgs1 = new Imgs([{ "ImageURL": self.info.PicURL, "ImageSize": self.info.PicSize }], true);
                    self.imgs1.initImgs();
                }

                /**
                 * 关闭弹窗
                 *
                 * @method cancel
                 */
                self.cancel = function() {
                    $scope.app.showHideMask(false);
                }

                /**
                 * 保存分类提交
                 *
                 * @method save
                 */
                self.save = function() {

                    if(!(self.imgs1.data[0] && self.imgs1.data[0].src)) {
                        alert('请上传图片');
                        return;
                    }

                    var data = JSON.stringify({
                        "token": util.getParams('token'),
                        "action": "edit",
                        "viewID": self.viewId-0,
                        "lang": util.langStyle(),
                        "data": {
                            "ID": self.info.ID,
                            "PicURL": self.imgs1.data[0].src,
                            "Text": self.cateName,
                            "Title": self.cateName,
                            "Seq": self.Seq,
                            "PicSize": self.imgs1.data[0].fileSize-0
                        }
                    });

                    self.saving = true;

                    return $http({
                        method: 'POST',
                        url: util.getApiUrl('commonview', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        $scope.app.showHideMask(false);
                        $scope.app.maskParams.loadInfo();
                    }, function errorCallback(response) {
                        alert('连接服务器出错');
                    }).finally(function(value) {
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
    //分类图文 分类下的Add
    .controller('tvClassPicTextAddController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
            function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
                var self = this;

                self.init = function() {
                    self.viewId = $scope.app.maskParams.viewId;
                    self.cateId = $scope.app.maskParams.cateId;

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
                            "PID": self.cateId,
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
                            $scope.app.showHideMask(false);
                            $scope.app.maskParams.loadInfo();
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
    //分类图文 分类下的Edit
    .controller('tvClassPicTextEditController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
            function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
                var self = this;

                self.init = function() {
                    self.viewId = $scope.app.maskParams.viewId;
                    self.cateId = $scope.app.maskParams.cateId;
                    self.info = $scope.app.maskParams.info;
                    self.Seq = self.info.Seq;
                    self.Text = self.info.Text;
                    self.Title = self.info.Title;

                    // 获取编辑多语言信息
                    self.editLangs = util.getParams('editLangs');

                    // 初始化频道图片
                    self.imgs1 = new Imgs([{"ImageURL": self.info.PicURL, "ImageSize": self.info.PicSize}], true);
                    self.imgs1.initImgs();

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
                        "action": "edit",
                        "viewID": Number(self.viewId),
                        "data":{
                            "PID": self.info.ID,
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
                            $scope.app.showHideMask(false);
                            $scope.app.maskParams.loadInfo();
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

    //三星午餐分类图文
    .controller('tvPicTextClassListController_Samsung', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
            function ($scope, $state, $http, $stateParams, $location, util) {

                var self = this;
                self.info = []; // 分类＋分类下的图文信息
                self.cateIndex; // 当前选中分类index

                self.init = function() {
                    self.viewId = $stateParams.moduleId;
                    self.defaultLangCode = util.getDefaultLangCode();
                    self.loadInfo();
                }

                /**
                 * 添加该模版的图文分类
                 *
                 * @method addCategory
                 */
                self.addCategory = function() {
                    $scope.app.maskParams.viewId = self.viewId;
                    $scope.app.maskParams.loadInfo = self.loadInfo;
                    $scope.app.showHideMask(true,'pages/tv/PicTextClassCateAdd_Samsung.html');
                }

                /**
                 * 删除图文分类
                 *
                 * @method delCate
                 */
                self.delCate = function() {
                    if(!confirm('确认删除？')){
                        return;
                    }
                    var data = JSON.stringify({
                        "token": util.getParams('token'),
                        "action": "delete",
                        "viewID": self.viewId,
                        "lang": util.langStyle(),
                        "data": {
                            "ID": self.info[self.cateIndex].ID
                        }
                    });
                    self.cateDeleting = true;
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('commonview', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var data = response.data;
                        if (data.rescode == '200') {
                            self.loadInfo();
                        }
                        else {
                            alert('连接服务器出错' + data.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert('连接服务器出错');
                    }).finally(function(value) {
                        self.cateDeleting = false;
                    });
                }

                /**
                 * 编辑该模版的图文分类
                 *
                 * @method editCate
                 */
                self.editCate = function() {
                    $scope.app.maskParams.viewId = self.viewId;
                    $scope.app.maskParams.info = self.info[self.cateIndex];
                    $scope.app.maskParams.loadInfo = self.loadInfo;
                    $scope.app.showHideMask(true,'pages/tv/PicTextClassCateEdit_Samsung.html');
                }

                /**
                 * 编辑图文
                 *
                 * @method editPic
                 * @param index 图片在该分类下列表中的序号
                 */
                self.editPic = function (index) {
                    $scope.app.maskParams.viewId = self.viewId;
                    $scope.app.maskParams.cateId = self.info[self.cateIndex].ID;
                    $scope.app.maskParams.info = self.info[self.cateIndex].sub[index];
                    $scope.app.maskParams.loadInfo = self.loadInfo;
                    $scope.app.showHideMask(true,'pages/tv/classPicTextEdit_Samsung.html');
                }

                /**
                 * 添加该模版的图文
                 *
                 * @method addPic
                 */
                self.addPic = function() {
                    $scope.app.maskParams.viewId = self.viewId;
                    $scope.app.maskParams.cateId = self.info[self.cateIndex].ID;
                    $scope.app.maskParams.loadInfo = self.loadInfo;
                    $scope.app.showHideMask(true,'pages/tv/classPicTextAdd_Samsung.html');
                }

                /**
                 * 删除图文
                 *
                 * @method delPic
                 * @param index 图文在列表中的序号
                 */
                self.delPic = function(index) {
                    if(!confirm('确认删除？')){
                        return;
                    }
                    var data = JSON.stringify({
                        "token": util.getParams('token'),
                        "action": "delete",
                        "viewID": self.viewId,
                        "lang": util.langStyle(),
                        "data": {
                            "PID": self.info[self.cateIndex].sub[index].ID
                        }
                    });
                    self.picDeleting = true;
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('commonview', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var data = response.data;
                        if (data.rescode == '200') {
                            self.loadInfo();
                        }
                        else {
                            alert('连接服务器出错' + data.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert('连接服务器出错');
                    }).finally(function(value) {
                        self.picDeleting = false;
                    });
                }

                /**
                 * 加载分类及分类下的信息
                 *
                 * @method loadInfo
                 */
                self.loadInfo = function() {
                    var data = JSON.stringify({
                        "token": util.getParams('token'),
                        "action": "get",
                        "viewID": self.viewId,
                        "lang": util.langStyle(),
                        "Price": self.Price
                    });
                    self.loading = true;
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('commonview', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var data = response.data;
                        if (data.rescode == '200') {
                            self.info = data.data.res;
                            if(!self.cateIndex || (self.cateIndex + 1) > self.info.length) {
                                self.cateIndex = 0;
                            }
                            //判断分类下内容为空时，sub属性为空数组，不然模板的ng-repeat会报错
                            if(self.info.length ==0 ){
                                self.info[0].sub = [];
                            }
                        }
                        else {
                            alert('连接服务器出错' + data.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert('连接服务器出错');
                    }).finally(function(value) {
                        self.loading = false;
                    });
                }

                /**
                 * 加载分类及分类下的信息
                 *
                 * @method loadInfo
                 * @param index 跳转分类在self.info中的index
                 */
                self.loadPics = function (index) {
                    self.cateIndex = index;
                }

            }
        ])
    //三星午餐分类图文 Add分类
    .controller('tvPicTextClassCateAddController_Samsung', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            var self = this;
            self.viewId = 0;
            self.imgs1 = null;
            self.editLangs = util.getParams('editLangs');

            self.init = function() {
                self.viewId = $scope.app.maskParams.viewId;
                self.imgs1 = new Imgs([], true);
            }

            /**
             * 关闭弹窗
             *
             * @method cancel
             */
            self.cancel = function() {
                $scope.app.showHideMask(false);
            }

            /**
             * 新建分类提交
             *
             * @method save
             */
            self.save = function() {

                if(!(self.imgs1.data[0] && self.imgs1.data[0].src)) {
                    alert('请上传图片');
                    return;
                }

                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "add",
                    "viewID": self.viewId-0,
                    "lang": util.langStyle(),
                    "data": {
                        "PicURL": self.imgs1.data[0].src,
                        "Text": self.cateName,
                        "Title": self.cateName,
                        "Seq": self.Seq,
                        "PicSize": self.imgs1.data[0].fileSize-0
                    }
                });

                self.saving = true;

                return $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    $scope.app.showHideMask(false);
                    $scope.app.maskParams.loadInfo();
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function(value) {
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
    //三星午餐分类图文 Edit分类
    .controller('tvPicTextClassCateEditController_Samsung', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            var self = this;
            self.viewId = 0;
            self.imgs1 = null;
            self.editLangs = util.getParams('editLangs');

            self.init = function() {
                self.viewId = $scope.app.maskParams.viewId;
                self.info = $scope.app.maskParams.info;
                self.Seq = self.info.Seq;
                self.cateName = self.info.Title;
                self.imgs1 = new Imgs([{ "ImageURL": self.info.PicURL, "ImageSize": self.info.PicSize }], true);
                self.imgs1.initImgs();
            }

            /**
             * 关闭弹窗
             *
             * @method cancel
             */
            self.cancel = function() {
                $scope.app.showHideMask(false);
            }

            /**
             * 保存分类提交
             *
             * @method save
             */
            self.save = function() {

                if(!(self.imgs1.data[0] && self.imgs1.data[0].src)) {
                    alert('请上传图片');
                    return;
                }

                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "edit",
                    "viewID": self.viewId-0,
                    "lang": util.langStyle(),
                    "data": {
                        "ID": self.info.ID,
                        "PicURL": self.imgs1.data[0].src,
                        "Text": self.cateName,
                        "Title": self.cateName,
                        "Seq": self.Seq,
                        "PicSize": self.imgs1.data[0].fileSize-0,
                    }
                });

                self.saving = true;

                return $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    $scope.app.showHideMask(false);
                    $scope.app.maskParams.loadInfo();
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function(value) {
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
    //三星午餐分类图文 Add图文
    .controller('tvClassPicTextAddController_Samsung', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {

            var self = this;
            self.init = function() {
                self.viewId = $scope.app.maskParams.viewId;
                self.cateId = $scope.app.maskParams.cateId;

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
                        "PID": self.cateId,
                        "PicURL": self.imgs1.data[0].src,
                        "Seq": self.Seq,
                        "Text": self.Text,
                        "Title": self.Title,
                        "PicSize": self.imgs1.data[0].fileSize,
                        "Price": self.Price
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
                        $scope.app.showHideMask(false);
                        $scope.app.maskParams.loadInfo();
                        $scope.app.maskParams.Price = self.Price;
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
    //三星午餐分类图文 Edit图文
    .controller('tvClassPicTextEditController_Samsung', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
            function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {

                var self = this;
                self.init = function() {
                    self.viewId = $scope.app.maskParams.viewId;
                    self.cateId = $scope.app.maskParams.cateId;
                    self.info = $scope.app.maskParams.info;
                    self.Price = self.info.Price;
                    self.Seq = self.info.Seq;
                    self.Text = self.info.Text;
                    self.Title = self.info.Title;

                    // 获取编辑多语言信息
                    self.editLangs = util.getParams('editLangs');

                    // 初始化频道图片
                    self.imgs1 = new Imgs([{"ImageURL": self.info.PicURL, "ImageSize": self.info.PicSize}], true);
                    self.imgs1.initImgs();

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
                        "action": "edit",
                        "viewID": Number(self.viewId),
                        "data":{
                            "PID": self.info.ID,
                            "PicURL": self.imgs1.data[0].src,
                            "Seq": self.Seq,
                            "Text": self.Text,
                            "Title": self.Title,
                            "PicSize": self.imgs1.data[0].fileSize,
                            "Price": self.Price
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
                            $scope.app.showHideMask(false);
                            $scope.app.maskParams.loadInfo();
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

    //创维DTMB
    .controller('SkyworthDTMBController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
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

    .controller('tvSimpleSmallPicTextZFCarouselController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
        function ($scope, $state, $http, $stateParams, $location, util) {
            var self = this;
            console.log('tvSimpleSmallPicTextZFCarouselController')
            self.init = function() {
                self.viewId = $stateParams.moduleId;
                self.defaultLangCode = util.getDefaultLangCode();
                self.loadList();
            }

            self.edit = function(index) {
                $scope.app.maskParams.viewId = self.viewId;
                $scope.app.maskParams.picInfo = self.pics[index];
                $scope.app.showHideMask(true,'pages/tv/SimpleSmallPicTextEdit_ZheFei_Carousel.html');
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
                $scope.app.showHideMask(true,'pages/tv/SimpleSmallPicTextAdd_ZheFei_Carousel.html');
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

    .controller('tvSimpleSmallPicTextCarouselController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
        function ($scope, $state, $http, $stateParams, $location, util) {
            var self = this;
            console.log('tvSimpleSmallPicTextCarouselController')
            self.init = function() {
                self.viewId = $stateParams.moduleId;
                self.defaultLangCode = util.getDefaultLangCode();
                self.loadList();
            }

            self.edit = function(index) {
                $scope.app.maskParams.viewId = self.viewId;
                $scope.app.maskParams.picInfo = self.pics[index];
                $scope.app.showHideMask(true,'pages/tv/SimpleSmallPicTextEdit_ZheFei_Carousel.html');
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
                $scope.app.showHideMask(true,'pages/tv/SimpleSmallPicTextAdd_LiFeng.html');
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
                console.log(self.defaultLangCode);
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
                        // var DFL = util.getDefaultLangCode();
                        // self.defaultLangPic = [];
                        // for(var i=0;i<self.pics.length;i++){
                        //     self.defaultLangPic[i] = self.pics[i].SourceData[DFL]
                        // }
                        console.log(self.pics);
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

    // 丽枫 全屏图片模板 多语言图+序号 LiFeng_MultPic
    .controller('tvMultPicLFController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
        function ($scope, $state, $http, $stateParams, $location, util) {
            var self = this;
            self.init = function() {
                self.viewId = $stateParams.moduleId;
                console.log(self.viewId);
                self.defaultLangCode = util.getDefaultLangCode();
                console.log(self.defaultLangCode);
                self.loadList();
            }

            self.edit = function(index) {
                $scope.app.maskParams.viewId = self.viewId;
                $scope.app.maskParams.picInfo = self.pics[index];
                $scope.app.showHideMask(true,'pages/tv/multPicEdit_LiFeng.html');
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
                $scope.app.showHideMask(true,'pages/tv/multPicAdd_LiFeng.html');
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
                        // var DFL = util.getDefaultLangCode();
                        // self.defaultLangPic = [];
                        // for(var i=0;i<self.pics.length;i++){
                        //     self.defaultLangPic[i] = self.pics[i].SourceData[DFL]
                        // }
                        console.log(self.pics);
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

    .controller('tvMultPicZFController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
        function ($scope, $state, $http, $stateParams, $location, util) {
            console.log('tvMultPicZFController')
            var self = this;
            self.init = function() {
                self.viewId = $stateParams.moduleId;
                console.log(self.viewId);
                self.defaultLangCode = util.getDefaultLangCode();
                console.log(self.defaultLangCode);
                self.loadList();
            }

            self.edit = function(index) {
                $scope.app.maskParams.viewId = self.viewId;
                $scope.app.maskParams.picInfo = self.pics[index];
                $scope.app.showHideMask(true,'pages/tv/multPicEdit_ZheFei.html');
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
                $scope.app.showHideMask(true,'pages/tv/multPicAdd_ZheFei.html');
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
                        // var DFL = util.getDefaultLangCode();
                        // self.defaultLangPic = [];
                        // for(var i=0;i<self.pics.length;i++){
                        //     self.defaultLangPic[i] = self.pics[i].SourceData[DFL]
                        // }
                        console.log(self.pics);
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
                self.langArr = [];
                self.langNameArr = [];
                self.upImgs = [];
                self.setInfo();

            }


            self.cancel = function() {
                $scope.app.showHideMask(false);
            }

            self.setInfo = function () {
                self.Seq = self.picInfo.Seq;
                self.images = self.picInfo.SourceData;
                //多语言信息数组
                for(var key in self.images){
                    for(var i=0;i<self.editLangs.length;i++){
                        if(key == self.editLangs[i].code){
                            self.langNameArr.push(self.editLangs[i].name);
                            self.langArr.push(key);
                        }
                    }
                }
                //创建图片实例
                for(var i =0;i<self.langArr.length;i++){
                    var lang = self.langArr[i];
                    self.upImgs[i] = new Imgs([{"ImageURL": self.images[lang].PicURL, "ImageSize": self.images[lang].PicSize}], true);
                    self.upImgs[i].initImgs();
                    console.log(self.upImgs[i]);
                }
            }

            self.save = function() {

                //频道图片必填验证(新建的时候验证，编辑的时候不可能为空，所以不用验证)
                // if(self.imgs1.data.length == 0) {
                //     alert('请上传频道图片');
                //     return;
                // }

                var data = {
                    "token": util.getParams('token'),
                    "action": "edit",
                    "viewID": Number(self.viewId),
                    "data":{
                        "ID": Number(self.picInfo.ID),
                        "Seq": self.Seq
                    },
                    "lang": util.langStyle()
                }
                for(var i =0;i<self.langArr.length;i++) {
                    var lang = self.langArr[i];
                    var url = self.upImgs[i].data[0].src;
                    var size = self.upImgs[i].data[0].fileSize;
                    data.data[lang] = {"PicURL":url,"PicSize":size}
                }
                console.log(data);
                data = JSON.stringify(data);
                self.saving = true;
                // var URL = util.getApiUrl('commonview', '', 'server');
                // console.log(URL);
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

     // 丽枫 全屏图片模板 多语言图+序号 LiFeng_MultPic    编辑功能
    .controller('tvMultPicEditLFController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            var self = this;

            self.init = function() {
                self.viewId = $scope.app.maskParams.viewId;
                self.picInfo = $scope.app.maskParams.picInfo;

                // 获取编辑多语言信息
                self.editLangs = util.getParams('editLangs');
                self.langArr = [];
                self.langNameArr = [];
                self.upImgs = [];
                self.setInfo();

            }


            self.cancel = function() {
                $scope.app.showHideMask(false);
            }

            self.setInfo = function () {
                self.Seq = self.picInfo.Seq;
                self.images = self.picInfo.SourceData;
                //多语言信息数组
                for(var key in self.images){
                    for(var i=0;i<self.editLangs.length;i++){
                        if(key == self.editLangs[i].code){
                            self.langNameArr.push(self.editLangs[i].name);
                            self.langArr.push(key);
                        }
                    }
                }
                //创建图片实例
                for(var i =0;i<self.langArr.length;i++){
                    var lang = self.langArr[i];
                    self.upImgs[i] = new Imgs([{"ImageURL": self.images[lang].PicURL, "ImageSize": self.images[lang].PicSize}], true);
                    self.upImgs[i].initImgs();
                    console.log(self.upImgs[i]);
                }
            }

            self.save = function() {

                //频道图片必填验证(新建的时候验证，编辑的时候不可能为空，所以不用验证)
                // if(self.imgs1.data.length == 0) {
                //     alert('请上传频道图片');
                //     return;
                // }

                var data = {
                    "token": util.getParams('token'),
                    "action": "edit",
                    "viewID": Number(self.viewId),
                    "data":{
                        "ID": Number(self.picInfo.ID),
                        "Seq": self.Seq
                    },
                    "lang": util.langStyle()
                }
                for(var i =0;i<self.langArr.length;i++) {
                    var lang = self.langArr[i];
                    var url = self.upImgs[i].data[0].src;
                    var size = self.upImgs[i].data[0].fileSize;
                    data.data[lang] = {"PicURL":url,"PicSize":size}
                }
                console.log(data);
                data = JSON.stringify(data);
                self.saving = true;
                // var URL = util.getApiUrl('commonview', '', 'server');
                // console.log(URL);
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

    .controller('tvMultPicEditZFController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            var self = this;

            self.init = function() {
                self.viewId = $scope.app.maskParams.viewId;
                self.picInfo = $scope.app.maskParams.picInfo;

                // 获取编辑多语言信息
                self.editLangs = util.getParams('editLangs');
                self.langArr = [];
                self.langNameArr = [];
                self.upImgs = [];
                self.setInfo();

            }


            self.cancel = function() {
                $scope.app.showHideMask(false);
            }

            self.setInfo = function () {
                self.Seq = self.picInfo.Seq;
                self.images = self.picInfo.SourceData;
                //多语言信息数组
                for(var key in self.images){
                    for(var i=0;i<self.editLangs.length;i++){
                        if(key == self.editLangs[i].code){
                            self.langNameArr.push(self.editLangs[i].name);
                            self.langArr.push(key);
                        }
                    }
                }
                //创建图片实例
                for(var i =0;i<self.langArr.length;i++){
                    var lang = self.langArr[i];
                    self.upImgs[i] = new Imgs([{"ImageURL": self.images[lang].PicURL, "ImageSize": self.images[lang].PicSize}], true);
                    self.upImgs[i].initImgs();
                    console.log(self.upImgs[i]);
                }
            }

            self.save = function() {

                //频道图片必填验证(新建的时候验证，编辑的时候不可能为空，所以不用验证)
                // if(self.imgs1.data.length == 0) {
                //     alert('请上传频道图片');
                //     return;
                // }

                var data = {
                    "token": util.getParams('token'),
                    "action": "edit",
                    "viewID": Number(self.viewId),
                    "data":{
                        "ID": Number(self.picInfo.ID),
                        "Seq": self.Seq
                    },
                    "lang": util.langStyle()
                }
                for(var i =0;i<self.langArr.length;i++) {
                    var lang = self.langArr[i];
                    var url = self.upImgs[i].data[0].src;
                    var size = self.upImgs[i].data[0].fileSize;
                    data.data[lang] = {"PicURL":url,"PicSize":size}
                }
                console.log(data);
                data = JSON.stringify(data);
                self.saving = true;
                // var URL = util.getApiUrl('commonview', '', 'server');
                // console.log(URL);
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

    .controller('tvMultPicAddController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            var self = this;
            self.uplImgs = [];

            self.init = function() {
                self.viewId = $scope.app.maskParams.viewId;

                // 获取编辑多语言信息
                self.editLangs = util.getParams('editLangs');
                self.defaultLangCode = util.getDefaultLangCode();
                
                // 初始化频道图片
                for(var i=0; i<self.editLangs.length; i++) {
                    self.uplImgs[i] = new Imgs([], true);
                }
            }


            self.cancel = function() {
                $scope.app.showHideMask(false);
            }

            self.save = function() {
                var defaultLang;
                //频道图片必填验证
                for(var i=0; i<self.editLangs.length; i++) {
                    if(self.editLangs[i].code == self.defaultLangCode){
                        defaultLang = i;
                    }
                }
                if(self.uplImgs[defaultLang].data.length == 0 || self.uplImgs[defaultLang].data[0].progress < 100) {
                    alert('请上传默认语言图片');
                    return;
                }

                var data = {
                    "token": util.getParams('token'),
                    "action": "add",
                    "viewID": Number(self.viewId),
                    "data":[{
                        "Seq":self.Seq,
                        "SourceData":{}
                    }],
                    "lang": util.langStyle()
                };
                for(var i=0;i<self.editLangs.length; i++) {
                    var lang = self.editLangs[i].code;
                    data.data[0].SourceData[lang] = {
                        "PicURL":self.uplImgs[i].data[0].src,
                        "PicSize":self.uplImgs[i].data[0].fileSize
                    }
                }
                console.log(data);
                data = JSON.stringify(data);
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

    // 丽枫 全屏图片模板 多语言图+序号 LiFeng_MultPic    添加功能
    .controller('tvMultPicAddLFController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            var self = this;
            self.uplImgs = [];

            self.init = function() {
                self.viewId = $scope.app.maskParams.viewId;

                // 获取编辑多语言信息
                self.editLangs = util.getParams('editLangs');
                self.defaultLangCode = util.getDefaultLangCode();
                
                // 初始化频道图片
                for(var i=0; i<self.editLangs.length; i++) {
                    self.uplImgs[i] = new Imgs([], true);
                }
            }


            self.cancel = function() {
                $scope.app.showHideMask(false);
            }

            self.save = function() {
                var defaultLang;
                //频道图片必填验证
                for(var i=0; i<self.editLangs.length; i++) {
                    if(self.editLangs[i].code == self.defaultLangCode){
                        defaultLang = i;
                    }
                }
                if(self.uplImgs[defaultLang].data.length == 0 || self.uplImgs[defaultLang].data[0].progress < 100) {
                    alert('请上传默认语言图片');
                    return;
                }

                var data = {
                    "token": util.getParams('token'),
                    "action": "add",
                    "viewID": Number(self.viewId),
                    "data":[{
                        "Seq":self.Seq,
                        "SourceData":{}
                    }],
                    "lang": util.langStyle()
                };
                for(var i=0;i<self.editLangs.length; i++) {
                    var lang = self.editLangs[i].code;
                    data.data[0].SourceData[lang] = {
                        "PicURL":self.uplImgs[i].data[0].src,
                        "PicSize":self.uplImgs[i].data[0].fileSize
                    }
                }
                console.log(data);
                data = JSON.stringify(data);
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

    .controller('tvMultPicAddZFController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            var self = this;
            self.uplImgs = [];

            self.init = function() {
                self.viewId = $scope.app.maskParams.viewId;

                // 获取编辑多语言信息
                self.editLangs = util.getParams('editLangs');
                self.defaultLangCode = util.getDefaultLangCode();
                
                // 初始化频道图片
                for(var i=0; i<self.editLangs.length; i++) {
                    self.uplImgs[i] = new Imgs([], true);
                }
            }


            self.cancel = function() {
                $scope.app.showHideMask(false);
            }

            self.save = function() {
                var defaultLang;
                //频道图片必填验证
                for(var i=0; i<self.editLangs.length; i++) {
                    if(self.editLangs[i].code == self.defaultLangCode){
                        defaultLang = i;
                    }
                }
                if(self.uplImgs[defaultLang].data.length == 0 || self.uplImgs[defaultLang].data[0].progress < 100) {
                    alert('请上传默认语言图片');
                    return;
                }

                var data = {
                    "token": util.getParams('token'),
                    "action": "add",
                    "viewID": Number(self.viewId),
                    "data":[{
                        "Seq":self.Seq,
                        "SourceData":{}
                    }],
                    "lang": util.langStyle()
                };
                for(var i=0;i<self.editLangs.length; i++) {
                    var lang = self.editLangs[i].code;
                    data.data[0].SourceData[lang] = {
                        "PicURL":self.uplImgs[i].data[0].src,
                        "PicSize":self.uplImgs[i].data[0].fileSize
                    }
                }
                console.log(data);
                data = JSON.stringify(data);
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

    .controller('tvMultPicSxSmallController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
            function ($scope, $state, $http, $stateParams, $location, util) {
                var self = this;
                self.init = function() {
                    self.viewId = $stateParams.moduleId;
                    console.log(self.viewId);
                    self.defaultLangCode = util.getDefaultLangCode();
                    // console.log(self.defaultLangCode);
                    self.loadList();
                }

                self.edit = function(index) {
                    $scope.app.maskParams.viewId = self.viewId;
                    $scope.app.maskParams.picInfo = self.pics[index];
                    $scope.app.showHideMask(true,'pages/tv/MultPic_SX_Small_Edit.html');
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
                    $scope.app.showHideMask(true,'pages/tv/MultPic_SX_Small_Add.html');
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
                            // var DFL = util.getDefaultLangCode();
                            // self.defaultLangPic = [];
                            // for(var i=0;i<self.pics.length;i++){
                            //     self.defaultLangPic[i] = self.pics[i].SourceData[DFL]
                            // }
                            console.log(self.pics);
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

    .controller('tvMultPicSxSmallEditController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            var self = this;

            self.init = function() {
                self.viewId = $scope.app.maskParams.viewId;
                self.picInfo = $scope.app.maskParams.picInfo;

                // 获取编辑多语言信息
                self.editLangs = util.getParams('editLangs');
                self.langArr = [];
                self.langNameArr = [];
                self.upImgs = [];
                self.setInfo();

            }


            self.cancel = function() {
                $scope.app.showHideMask(false);
            }

            self.setInfo = function () {
                self.Seq = self.picInfo.Seq;
                self.images = self.picInfo.SourceData;
                //多语言信息数组
                for(var key in self.images){
                    for(var i=0;i<self.editLangs.length;i++){
                        if(key == self.editLangs[i].code){
                            self.langNameArr.push(self.editLangs[i].name);
                            self.langArr.push(key);
                        }
                    }
                }
                //创建图片实例
                for(var i =0;i<self.langArr.length;i++){
                    var lang = self.langArr[i];
                    self.upImgs[i] = new Imgs([{"ImageURL": self.images[lang].PicURL, "ImageSize": self.images[lang].PicSize}], true);
                    self.upImgs[i].initImgs();
                    console.log(self.upImgs[i]);
                }
            }

            self.save = function() {

                //频道图片必填验证(新建的时候验证，编辑的时候不可能为空，所以不用验证)
                // if(self.imgs1.data.length == 0) {
                //     alert('请上传频道图片');
                //     return;
                // }

                var data = {
                    "token": util.getParams('token'),
                    "action": "edit",
                    "viewID": Number(self.viewId),
                    "data":{
                        "ID": Number(self.picInfo.ID),
                        "Seq": self.Seq
                    },
                    "lang": util.langStyle()
                }
                for(var i =0;i<self.langArr.length;i++) {
                    var lang = self.langArr[i];
                    var url = self.upImgs[i].data[0].src;
                    var size = self.upImgs[i].data[0].fileSize;
                    data.data[lang] = {"PicURL":url,"PicSize":size}
                }
                console.log(data);
                data = JSON.stringify(data);
                self.saving = true;
                // var URL = util.getApiUrl('commonview', '', 'server');
                // console.log(URL);
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

    .controller('tvMultPicSxSmallAddController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            var self = this;
            self.uplImgs = [];

            self.init = function() {
                self.viewId = $scope.app.maskParams.viewId;

                // 获取编辑多语言信息
                self.editLangs = util.getParams('editLangs');
                self.defaultLangCode = util.getDefaultLangCode();

                // 初始化频道图片
                for(var i=0; i<self.editLangs.length; i++) {
                    self.uplImgs[i] = new Imgs([], true);
                }
            }


            self.cancel = function() {
                $scope.app.showHideMask(false);
            }

            self.save = function() {
                var defaultLang;
                //频道图片必填验证
                for(var i=0; i<self.editLangs.length; i++) {
                    if(self.editLangs[i].code == self.defaultLangCode){
                        defaultLang = i;
                    }
                }
                if(self.uplImgs[defaultLang].data.length == 0 || self.uplImgs[defaultLang].data[0].progress < 100) {
                    alert('请上传默认语言图片');
                    return;
                }

                var data = {
                    "token": util.getParams('token'),
                    "action": "add",
                    "viewID": Number(self.viewId),
                    "data":[{
                        "Seq":self.Seq,
                        "SourceData":{}
                    }],
                    "lang": util.langStyle()
                };
                for(var i=0;i<self.editLangs.length; i++) {
                    var lang = self.editLangs[i].code;
                    data.data[0].SourceData[lang] = {
                        "PicURL":self.uplImgs[i].data[0].src,
                        "PicSize":self.uplImgs[i].data[0].fileSize
                    }
                }
                console.log(data);
                data = JSON.stringify(data);
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

    .controller('tvMultPicSxBigController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
        function ($scope, $state, $http, $stateParams, $location, util) {
            var self = this;
            self.init = function() {
                self.viewId = $stateParams.moduleId;
                console.log(self.viewId);
                self.defaultLangCode = util.getDefaultLangCode();
                // console.log(self.defaultLangCode);
                self.loadList();
            }

            self.edit = function(index) {
                $scope.app.maskParams.viewId = self.viewId;
                $scope.app.maskParams.picInfo = self.pics[index];
                $scope.app.showHideMask(true,'pages/tv/MultPic_SX_Big_Edit.html');
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
                $scope.app.showHideMask(true,'pages/tv/MultPic_SX_Big_Add.html');
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
                        // var DFL = util.getDefaultLangCode();
                        // self.defaultLangPic = [];
                        // for(var i=0;i<self.pics.length;i++){
                        //     self.defaultLangPic[i] = self.pics[i].SourceData[DFL]
                        // }
                        console.log(self.pics);
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

    .controller('tvMultPicSxBigEditController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            var self = this;

            self.init = function() {
                self.viewId = $scope.app.maskParams.viewId;
                self.picInfo = $scope.app.maskParams.picInfo;

                // 获取编辑多语言信息
                self.editLangs = util.getParams('editLangs');
                self.langArr = [];
                self.langNameArr = [];
                self.upImgs = [];
                self.setInfo();

            }


            self.cancel = function() {
                $scope.app.showHideMask(false);
            }

            self.setInfo = function () {
                self.Seq = self.picInfo.Seq;
                self.images = self.picInfo.SourceData;
                //多语言信息数组
                for(var key in self.images){
                    for(var i=0;i<self.editLangs.length;i++){
                        if(key == self.editLangs[i].code){
                            self.langNameArr.push(self.editLangs[i].name);
                            self.langArr.push(key);
                        }
                    }
                }
                //创建图片实例
                for(var i =0;i<self.langArr.length;i++){
                    var lang = self.langArr[i];
                    self.upImgs[i] = new Imgs([{"ImageURL": self.images[lang].PicURL, "ImageSize": self.images[lang].PicSize}], true);
                    self.upImgs[i].initImgs();
                    console.log(self.upImgs[i]);
                }
            }

            self.save = function() {

                //频道图片必填验证(新建的时候验证，编辑的时候不可能为空，所以不用验证)
                // if(self.imgs1.data.length == 0) {
                //     alert('请上传频道图片');
                //     return;
                // }

                var data = {
                    "token": util.getParams('token'),
                    "action": "edit",
                    "viewID": Number(self.viewId),
                    "data":{
                        "ID": Number(self.picInfo.ID),
                        "Seq": self.Seq
                    },
                    "lang": util.langStyle()
                }
                for(var i =0;i<self.langArr.length;i++) {
                    var lang = self.langArr[i];
                    var url = self.upImgs[i].data[0].src;
                    var size = self.upImgs[i].data[0].fileSize;
                    data.data[lang] = {"PicURL":url,"PicSize":size}
                }
                console.log(data);
                data = JSON.stringify(data);
                self.saving = true;
                // var URL = util.getApiUrl('commonview', '', 'server');
                // console.log(URL);
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

    .controller('tvMultPicSxBigAddController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            var self = this;
            self.uplImgs = [];

            self.init = function() {
                self.viewId = $scope.app.maskParams.viewId;

                // 获取编辑多语言信息
                self.editLangs = util.getParams('editLangs');
                self.defaultLangCode = util.getDefaultLangCode();

                // 初始化频道图片
                for(var i=0; i<self.editLangs.length; i++) {
                    self.uplImgs[i] = new Imgs([], true);
                }
            }


            self.cancel = function() {
                $scope.app.showHideMask(false);
            }

            self.save = function() {
                var defaultLang;
                //频道图片必填验证
                for(var i=0; i<self.editLangs.length; i++) {
                    if(self.editLangs[i].code == self.defaultLangCode){
                        defaultLang = i;
                    }
                }
                if(self.uplImgs[defaultLang].data.length == 0 || self.uplImgs[defaultLang].data[0].progress < 100) {
                    alert('请上传默认语言图片');
                    return;
                }

                var data = {
                    "token": util.getParams('token'),
                    "action": "add",
                    "viewID": Number(self.viewId),
                    "data":[{
                        "Seq":self.Seq,
                        "SourceData":{}
                    }],
                    "lang": util.langStyle()
                };
                for(var i=0;i<self.editLangs.length; i++) {
                    var lang = self.editLangs[i].code;
                    data.data[0].SourceData[lang] = {
                        "PicURL":self.uplImgs[i].data[0].src,
                        "PicSize":self.uplImgs[i].data[0].fileSize
                    }
                }
                console.log(data);
                data = JSON.stringify(data);
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

    //书香图文——价格
    .controller('tvSimplePicTextPriceController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
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
                $scope.app.showHideMask(true,'pages/tv/SimplePicText_PriceEdit.html');
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
                $scope.app.showHideMask(true,'pages/tv/SimplePicText_PriceAdd.html');
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
                        console.log(data);
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

    .controller('tvSimplePicTextPriceEditController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
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
                self.Price = self.picInfo.Price;
                self.imgs1 = new Imgs([{"ImageURL": self.picInfo.PicURL, "ImageSize": self.picInfo.PicSize}], true);
                self.imgs1.initImgs();
                console.log(self.imgs1);
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
                        "Price": self.Price,
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

    .controller('tvSimplePicTextPriceAddController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
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
                        "Price": self.Price,
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

    //书香图文
    .controller('tvSimplePicTextSXController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
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
                $scope.app.showHideMask(true,'pages/tv/SimplePicText_SX_Edit.html');
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
                $scope.app.showHideMask(true,'pages/tv/SimplePicText_SX_Add.html');
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

    .controller('tvSimplePicTextSXAddController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
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

    .controller('tvSimplePicTextSXEditController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
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
                console.log(self.imgs1);
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
    //书香分类图文
    .controller('tvPicTextClassListSXController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
        function ($scope, $state, $http, $stateParams, $location, util) {
            console.log('tvPicTextClassListSXController')
            var self = this;
            self.info = []; // 分类＋分类下的图文信息
            self.cateIndex; // 当前选中分类index

            self.init = function() {
                self.viewId = $stateParams.moduleId;
                self.defaultLangCode = util.getDefaultLangCode();
                self.loadInfo();
            }

            /**
             * 添加该模版的图文分类
             *
             * @method addCategory
             */
            self.addCategory = function() {
                $scope.app.maskParams.viewId = self.viewId;
                $scope.app.maskParams.loadInfo = self.loadInfo;
                $scope.app.showHideMask(true,'pages/tv/PicTextClassCateAdd_SX.html');
            }

            /**
             * 删除图文分类
             *
             * @method delCate
             */
            self.delCate = function() {
                if(!confirm('确认删除？')){
                    return;
                }
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "delete",
                    "viewID": self.viewId,
                    "lang": util.langStyle(),
                    "data": {
                        "ID": self.info[self.cateIndex].ID
                    }
                });
                self.cateDeleting = true;
                $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        self.loadInfo();
                    }
                    else {
                        alert('连接服务器出错' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function(value) {
                    self.cateDeleting = false;
                });
            }

            /**
             * 编辑该模版的图文分类
             *
             * @method editCate
             */
            self.editCate = function() {
                $scope.app.maskParams.viewId = self.viewId;
                $scope.app.maskParams.info = self.info[self.cateIndex];
                $scope.app.maskParams.loadInfo = self.loadInfo;
                $scope.app.showHideMask(true,'pages/tv/PicTextClassCateEdit_SX.html');
            }

            /**
             * 编辑图文
             *
             * @method editPic
             * @param index 图片在该分类下列表中的序号
             */
            self.editPic = function (index) {
                $scope.app.maskParams.viewId = self.viewId;
                $scope.app.maskParams.cateId = self.info[self.cateIndex].ID;
                $scope.app.maskParams.info = self.info[self.cateIndex].sub[index];
                $scope.app.maskParams.loadInfo = self.loadInfo;
                $scope.app.showHideMask(true,'pages/tv/classPicTextEdit_SX.html');
            }

            /**
             * 添加该模版的图文
             *
             * @method addPic
             */
            self.addPic = function() {
                $scope.app.maskParams.viewId = self.viewId;
                $scope.app.maskParams.cateId = self.info[self.cateIndex].ID;
                $scope.app.maskParams.loadInfo = self.loadInfo;
                $scope.app.showHideMask(true,'pages/tv/classPicTextAdd_SX.html');
            }

            /**
             * 删除图文
             *
             * @method delPic
             * @param index 图文在列表中的序号
             */
            self.delPic = function(index) {
                if(!confirm('确认删除？')){
                    return;
                }
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "delete",
                    "viewID": self.viewId,
                    "lang": util.langStyle(),
                    "data": {
                        "PID": self.info[self.cateIndex].sub[index].ID
                    }
                });
                self.picDeleting = true;
                $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        self.loadInfo();
                    }
                    else {
                        alert('连接服务器出错' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function(value) {
                    self.picDeleting = false;
                });
            }

            /**
             * 加载分类及分类下的信息
             *
             * @method loadInfo
             */
            self.loadInfo = function() {
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "get",
                    "viewID": self.viewId,
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
                        self.info = data.data.res;
                        if(!self.cateIndex || (self.cateIndex + 1) > self.info.length) {
                            self.cateIndex = 0;
                        }
                        //判断分类下内容为空时，sub属性为空数组，不然模板的ng-repeat会报错
                        if(self.info.length ==0 ){
                            self.info[0].sub = [];
                        }
                    }
                    else {
                        alert('连接服务器出错' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function(value) {
                    self.loading = false;
                });
            }

            /**
             * 加载分类及分类下的信息
             *
             * @method loadInfo
             * @param index 跳转分类在self.info中的index
             */
            self.loadPics = function (index) {
                self.cateIndex = index;
            }

        }
    ])
    
    //喆啡分类图文
    .controller('tvPicTextClassListZFController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
        function ($scope, $state, $http, $stateParams, $location, util) {
            console.log('tvPicTextClassListZFController')
            var self = this;
            self.info = []; // 分类＋分类下的图文信息
            self.cateIndex; // 当前选中分类index

            self.init = function() {
                self.viewId = $stateParams.moduleId;
                self.defaultLangCode = util.getDefaultLangCode();
                self.loadInfo();
            }

            /**
             * 添加该模版的图文分类
             *
             * @method addCategory
             */
            self.addCategory = function() {
                $scope.app.maskParams.viewId = self.viewId;
                $scope.app.maskParams.loadInfo = self.loadInfo;
                $scope.app.showHideMask(true,'pages/tv/PicTextClassCateAdd_ZF.html');
            }

            /**
             * 删除图文分类
             *
             * @method delCate
             */
            self.delCate = function() {
                if(!confirm('确认删除？')){
                    return;
                }
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "delete",
                    "viewID": self.viewId,
                    "lang": util.langStyle(),
                    "data": {
                        "ID": self.info[self.cateIndex].ID
                    }
                });
                self.cateDeleting = true;
                $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        self.loadInfo();
                    }
                    else {
                        alert('连接服务器出错' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function(value) {
                    self.cateDeleting = false;
                });
            }

            /**
             * 编辑该模版的图文分类
             *
             * @method editCate
             */
            self.editCate = function() {
                $scope.app.maskParams.viewId = self.viewId;
                $scope.app.maskParams.info = self.info[self.cateIndex];
                $scope.app.maskParams.loadInfo = self.loadInfo;
                $scope.app.showHideMask(true,'pages/tv/PicTextClassCateEdit_ZF.html');
            }

            /**
             * 编辑图文
             *
             * @method editPic
             * @param index 图片在该分类下列表中的序号
             */
            self.editPic = function (index) {
                $scope.app.maskParams.viewId = self.viewId;
                $scope.app.maskParams.cateId = self.info[self.cateIndex].ID;
                $scope.app.maskParams.info = self.info[self.cateIndex].sub[index];
                $scope.app.maskParams.loadInfo = self.loadInfo;
                $scope.app.showHideMask(true,'pages/tv/classPicTextEdit_ZF.html');
            }

            /**
             * 添加该模版的图文
             *
             * @method addPic
             */
            self.addPic = function() {
                $scope.app.maskParams.viewId = self.viewId;
                $scope.app.maskParams.cateId = self.info[self.cateIndex].ID;
                $scope.app.maskParams.loadInfo = self.loadInfo;
                $scope.app.showHideMask(true,'pages/tv/classPicTextAdd_ZF.html');
            }

            /**
             * 删除图文
             *
             * @method delPic
             * @param index 图文在列表中的序号
             */
            self.delPic = function(index) {
                if(!confirm('确认删除？')){
                    return;
                }
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "delete",
                    "viewID": self.viewId,
                    "lang": util.langStyle(),
                    "data": {
                        "PID": self.info[self.cateIndex].sub[index].ID
                    }
                });
                self.picDeleting = true;
                $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        self.loadInfo();
                    }
                    else {
                        alert('连接服务器出错' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function(value) {
                    self.picDeleting = false;
                });
            }

            /**
             * 加载分类及分类下的信息
             *
             * @method loadInfo
             */
            self.loadInfo = function() {
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "get",
                    "viewID": self.viewId,
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
                        self.info = data.data.res;
                        if(!self.cateIndex || (self.cateIndex + 1) > self.info.length) {
                            self.cateIndex = 0;
                        }
                        //判断分类下内容为空时，sub属性为空数组，不然模板的ng-repeat会报错
                        if(self.info.length ==0 ){
                            self.info[0].sub = [];
                        }
                    }
                    else {
                        alert('连接服务器出错' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function(value) {
                    self.loading = false;
                });
            }

            /**
             * 加载分类及分类下的信息
             *
             * @method loadInfo
             * @param index 跳转分类在self.info中的index
             */
            self.loadPics = function (index) {
                self.cateIndex = index;
            }

        }
    ])



    .controller('tvPicTextClassCateAddSXController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            var self = this;
            self.viewId = 0;
            self.imgs1 = null;
            self.editLangs = util.getParams('editLangs');

            self.init = function() {
                self.viewId = $scope.app.maskParams.viewId;
                self.imgs1 = new Imgs([], true);
                self.imgs2 = new Imgs([], true);
            }

            /**
             * 关闭弹窗
             *
             * @method cancel
             */
            self.cancel = function() {
                $scope.app.showHideMask(false);
            }

            /**
             * 新建分类提交
             *
             * @method save
             */
            self.save = function() {

                if(!(self.imgs1.data[0] && self.imgs1.data[0].src)) {
                    alert('请上传图片');
                    return;
                }

                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "add",
                    "viewID": self.viewId-0,
                    "lang": util.langStyle(),
                    "data": {
                        "PicURL": self.imgs1.data[0].src,
                        "Text": self.cateName,
                        "Title": self.cateName,
                        "Seq": self.Seq,
                        "PicSize": self.imgs1.data[0].fileSize-0,
                        "IconURL":self.imgs2.data[0].src,
                        "IconSize":self.imgs2.data[0].fileSize-0
                    }
                });

                self.saving = true;

                return $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    $scope.app.showHideMask(false);
                    $scope.app.maskParams.loadInfo();
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function(value) {
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

    .controller('tvPicTextClassCateEditSXController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            var self = this;
            self.viewId = 0;
            self.imgs1 = null;
            self.imgs2 = null;
            self.editLangs = util.getParams('editLangs');

            self.init = function() {
                self.viewId = $scope.app.maskParams.viewId;
                self.info = $scope.app.maskParams.info;
                self.Seq = self.info.Seq;
                self.cateName = self.info.Title;
                self.imgs1 = new Imgs([{ "ImageURL": self.info.PicURL, "ImageSize": self.info.PicSize }], true);
                self.imgs1.initImgs();
                self.imgs2 = new Imgs([{ "ImageURL": self.info.IconURL, "ImageSize": self.info.IconSize }], true);
                self.imgs2.initImgs();
            }

            /**
             * 关闭弹窗
             *
             * @method cancel
             */
            self.cancel = function() {
                $scope.app.showHideMask(false);
            }

            /**
             * 保存分类提交
             *
             * @method save
             */
            self.save = function() {

                if(!(self.imgs1.data[0] && self.imgs1.data[0].src)) {
                    alert('请上传图片');
                    return;
                }

                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "edit",
                    "viewID": self.viewId-0,
                    "lang": util.langStyle(),
                    "data": {
                        "ID": self.info.ID,
                        "PicURL": self.imgs1.data[0].src,
                        "Text": self.cateName,
                        "Title": self.cateName,
                        "Seq": self.Seq,
                        "PicSize": self.imgs1.data[0].fileSize-0,
                        "IconURL": self.imgs2.data[0].src,
                        "IconSize": self.imgs2.data[0].fileSize-0
                    }
                });

                self.saving = true;

                return $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    $scope.app.showHideMask(false);
                    $scope.app.maskParams.loadInfo();
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function(value) {
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

    .controller('tvPicTextClassCateAddZFController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            console.log('tvPicTextClassCateAddZFController')
            var self = this;
            self.viewId = 0;
            self.imgs1 = null;
            self.editLangs = util.getParams('editLangs');

            self.init = function() {
                self.viewId = $scope.app.maskParams.viewId;
            }

            /**
             * 关闭弹窗
             *
             * @method cancel
             */
            self.cancel = function() {
                $scope.app.showHideMask(false);
            }

            /**
             * 新建分类提交
             *
             * @method save
             */
            self.save = function() {

                // if(!(self.imgs1.data[0] && self.imgs1.data[0].src)) {
                //     alert('请上传图片');
                //     return;
                // }

                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "add",
                    "viewID": self.viewId-0,
                    "lang": util.langStyle(),
                    "data": {
                        // "PicURL": self.imgs1.data[0].src,
                        "PicURL": '',
                        "Text": '',
                        // "Title": self.cateName,
                        "Title": self.cateName,
                        "Seq": self.Seq,
                        // "PicSize": self.imgs1.data[0].fileSize-0,
                        // "IconURL":self.imgs2.data[0].src,
                        // "IconSize":self.imgs2.data[0].fileSize-0
                        "PicSize": '',
                        "IconURL":'',
                        "IconSize":''
                    }
                });

                self.saving = true;

                return $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    $scope.app.showHideMask(false);
                    $scope.app.maskParams.loadInfo();
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function(value) {
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

    .controller('tvPicTextClassCateEditZFController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            var self = this;
            self.viewId = 0;
            self.imgs1 = null;
            self.imgs2 = null;
            self.editLangs = util.getParams('editLangs');

            self.init = function() {
                self.viewId = $scope.app.maskParams.viewId;
                self.info = $scope.app.maskParams.info;
                self.Seq = self.info.Seq;
                self.cateName = self.info.Title;
            }

            /**
             * 关闭弹窗
             *
             * @method cancel
             */
            self.cancel = function() {
                $scope.app.showHideMask(false);
            }

            /**
             * 保存分类提交
             *
             * @method save
             */
            self.save = function() {



                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "edit",
                    "viewID": self.viewId-0,
                    "lang": util.langStyle(),
                    "data": {
                        "ID": self.info.ID,
                        // "PicURL": self.imgs1.data[0].src,
                        "PicURL": '',
                        "Text": self.cateName,
                        "Title": self.cateName,
                        "Seq": self.Seq,
                        // "PicSize": self.imgs1.data[0].fileSize-0,
                        "PicSize": 0,
                        // "IconURL": self.imgs2.data[0].src,
                        "IconURL": '',
                        // "IconSize": self.imgs2.data[0].fileSize-0
                        "IconSize": 0
                    }
                });

                self.saving = true;

                return $http({
                    method: 'POST',
                    url: util.getApiUrl('commonview', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    $scope.app.showHideMask(false);
                    $scope.app.maskParams.loadInfo();
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function(value) {
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

    .controller('tvClassPicTextAddSXController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            var self = this;

            self.init = function() {
                self.viewId = $scope.app.maskParams.viewId;
                self.cateId = $scope.app.maskParams.cateId;

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
                        "PID": self.cateId,
                        "PicURL": self.imgs1.data[0].src,
                        "Seq": self.Seq,
                        "Text": self.Text,
                        "Title": self.Title,
                        "Addr": self.Addr,
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
                        $scope.app.showHideMask(false);
                        $scope.app.maskParams.loadInfo();
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

    .controller('tvClassPicTextAddZFController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            console.log('tvClassPicTextAddZFController')
            var self = this;

            self.init = function() {
                self.viewId = $scope.app.maskParams.viewId;
                self.cateId = $scope.app.maskParams.cateId;

                // 获取编辑多语言信息
                self.editLangs = util.getParams('editLangs');
                // 初始化频道图片
                self.imgs1 = new Imgs([], true);


            }


            self.cancel = function() {
                $scope.app.showHideMask(false);
            }

            self.save = function() {
                //图片必填验证
                if(self.imgs1.data.length == 0 || self.imgs1.data[0].progress < 100) {
                    alert('请上传图片');
                    return;
                }
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "add",
                    "viewID": Number(self.viewId),
                    "data":{
                        "PID": self.cateId,
                        "PicURL": self.imgs1.data[0].src,
                        // "PicURL": '',
                        "Seq": self.Seq,
                        "Text": self.Text,
                        // "Title": self.Title,
                        "Title": {},
                        // "Addr": self.Addr,
                        "PicSize": self.imgs1.data[0].fileSize
                        // "PicSize": 0
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
                        $scope.app.showHideMask(false);
                        $scope.app.maskParams.loadInfo();
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

    .controller('tvClassPicTextEditSXController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            var self = this;

            self.init = function() {
                self.viewId = $scope.app.maskParams.viewId;
                self.cateId = $scope.app.maskParams.cateId;
                self.info = $scope.app.maskParams.info;
                self.Seq = self.info.Seq;
                self.Text = self.info.Text;
                self.Title = self.info.Title;
                self.Addr = self.info.Addr;

                // 获取编辑多语言信息
                self.editLangs = util.getParams('editLangs');

                // 初始化频道图片
                self.imgs1 = new Imgs([{"ImageURL": self.info.PicURL, "ImageSize": self.info.PicSize}], true);
                self.imgs1.initImgs();

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
                    "action": "edit",
                    "viewID": Number(self.viewId),
                    "data":{
                        "PID": self.info.ID,
                        "PicURL": self.imgs1.data[0].src,
                        "Seq": self.Seq,
                        "Text": self.Text,
                        "Title": self.Title,
                        "Addr": self.Addr,
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
                        $scope.app.showHideMask(false);
                        $scope.app.maskParams.loadInfo();
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

    .controller('tvClassPicTextEditZFController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $location, util, CONFIG) {
            console.log('tvClassPicTextEditZFController')
            var self = this;

            self.init = function() {
                self.viewId = $scope.app.maskParams.viewId;
                self.cateId = $scope.app.maskParams.cateId;
                self.info = $scope.app.maskParams.info;
                self.Seq = self.info.Seq;
                self.Text = self.info.Text;
                self.Title = self.info.Title;

                // 获取编辑多语言信息
                self.editLangs = util.getParams('editLangs');

                // 初始化频道图片
                self.imgs1 = new Imgs([{"ImageURL": self.info.PicURL, "ImageSize": self.info.PicSize}], true);
                self.imgs1.initImgs();

            }


            self.cancel = function() {
                $scope.app.showHideMask(false);
            }

            self.save = function() {

                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "edit",
                    "viewID": Number(self.viewId),
                    "data":{
                        "PID": self.info.ID,
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
                        $scope.app.showHideMask(false);
                        $scope.app.maskParams.loadInfo();
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
                        self.PackageFee = data.data.PackageFee;
                        self.FeeDiscount = data.data.FeeDiscount;
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
                      "MovieContentAPIURL": self.MovieContentAPIURL,
                      "PackageFee": self.PackageFee,
                      "FeeDiscount": self.FeeDiscount
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

    .controller('tvGuangGaoWeiController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
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

    .controller('tvprojectConfigController', ['$scope', '$filter', '$state', '$http', '$stateParams', '$location', 'util', 'CONFIG',
        function ($scope, $filter, $state, $http, $stateParams, $location, util, CONFIG) {
            console.log('tvprojectConfigController')
            var self = this;

            self.init = function() {
                self.getProjectConfig();
                // 初始化
                self.imgs1 = new Imgs([], true);
                self.imgs2 = new Imgs([], true);
                // // angular.element 不支持选择器？
                // self.restartTime = angular.element(document.querySelector("#restartTime"));
            }
            self.getProjectConfig = function() {
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "getTermConfig",
                    "lang": util.langStyle()
                });
                self.loading = true;
                $http({
                    method: 'POST',
                    url: util.getApiUrl('termconfig', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        var projectData = data.data;
                            self.projectData = {};
                        for (var i = 0; i < projectData.length; i++) {
                            self.projectData[projectData[i]["Type"]] = projectData[i]
                        }
                        self.restartTime = new Date("2000 "+self.projectData.RestartTime.Data);
                        self.imgs1.data[0] = {src:self.projectData.Font.Data,progress:100};
                        self.imgs2.data[0] = {src:self.projectData.Font.Data,progress:100};
                    } else if (data.rescode == '401') {
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else {
                        alert('加载信息失败，' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function(value) {
                    self.loading = false;
                });
            }

            self.saveProjectConfig = function() {
                if (self.imgs1.data.length == 0) {
                    alert("请上传字体");
                    return;
                }
                if (self.imgs2.data.length == 0) {
                    alert("请上传总经理签名");
                    return;
                }
                var date= angular.element(document.querySelector("#restartTime")).val(),
                re = /\d*:\d*:*\d*/;
                var dateString = re.exec(date)[0];
                if (dateString.length == 5 ) {
                   dateString += ":00"
                }
                self.formDisabled =true;
                var data = JSON.stringify({
                    "token": util.getParams('token'),
                    "action": "setTermConfig",
                    "data":{
                        "Font": {
                            "Data":{
                                "URL":self.imgs1.data[0].src,
                                "Size":Number(self.imgs1.data[0].fileSize)
                            },
                            "Enable": Number(self.projectData.Font.Enable)
                        },
                        "RestartTime": {
                            "Data": dateString,
                            "Enable": Number(self.projectData.RestartTime.Enable)
                        },
                        "Signature": {
                            "Data":
                                "URL":self.imgs2.data[0].src,
                                "Size":Number(self.imgs2.data[0].fileSize)
                        },
                            "Enable": Number(self.projectData.Signature.Enable)
                        }
                    }
                });
                $http({
                    method: 'POST',
                    url: util.getApiUrl('termconfig', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        $state.reload("app.tvAdmin.projectConfig")
                        alert('保存成功')
                    } else if (data.rescode == '401') {
                        alert('访问超时，请重新登录');
                        $state.go('login');
                    } else {
                        alert('加载信息失败，' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert('连接服务器出错');
                }).finally(function(value) {
                    self.formDisabled =false;
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
                    if(!file){
                        alert("请先选择字体")
                        return;
                    }
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
                                    console.log("percentComplete");
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

    .controller('tvWorldClockController', ['$q', '$scope', '$state', '$http', '$stateParams', '$filter', 'util', 'CONFIG',
        function($q, $scope, $state, $http, $stateParams, $filter, util, CONFIG) {
            console.log('tvWorldClockController')
            var self = this;
            self.init = function() {

            }
        }
    ])


    .controller('tvSkyworthATVController', ['$q', '$scope', '$state', '$http', '$stateParams', '$filter', 'util', 'CONFIG',
        function($q, $scope, $state, $http, $stateParams, $filter, util, CONFIG) {
            console.log('tvSkyworthATVController')
            var self = this;
            self.init = function() {

            }
        }
    ])

    .controller('tvSkyworthHDMIController', ['$q', '$scope', '$state', '$http', '$stateParams', '$filter', 'util', 'CONFIG',
        function($q, $scope, $state, $http, $stateParams, $filter, util, CONFIG) {
            console.log('tvSkyworthHDMIController')
            var self = this;
            self.init = function() {

            }
        }
    ])
    //BaoFengHDMI
    .controller('tvBaoFengHDMIController', ['$q', '$scope', '$state', '$http', '$stateParams', '$filter', 'util', 'CONFIG',
        function($q, $scope, $state, $http, $stateParams, $filter, util, CONFIG) {
            console.log('tvBaoFengHDMIController')
            var self = this;
            self.init = function() {

            }
        }
    ])

    .controller('tvSkyworthDTVController', ['$q', '$scope', '$state', '$http', '$stateParams', '$filter', 'util', 'CONFIG',
        function($q, $scope, $state, $http, $stateParams, $filter, util, CONFIG) {
            console.log('tvSkyworthDTVController')
            var self = this;
            self.init = function() {

            }
        }
    ])

        //书香天气
    .controller('tvWeatherSXController', ['$q', '$scope', '$state', '$http', '$stateParams', '$filter', 'util', 'CONFIG',
        function($q, $scope, $state, $http, $stateParams, $filter, util, CONFIG) {
            console.log('tvWeatherSXController')
            var self = this;
            self.init = function() {

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

    //书香音乐库
    .controller('tvMusicCommonSXController', ['$q', '$scope', '$state', '$http', '$stateParams', '$filter', 'util', 'CONFIG',
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

    //书香直播
    .controller('tvLiveSXController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
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
})();
