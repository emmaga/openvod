'use strict';

(function() {
    var app = angular.module('app.controllers', [])

    .controller('indexController', ['$scope',
        function($scope) {
            var self = this;
            self.init = function() {
                this.maskUrl = '';
            }
        }
    ])

    .controller('loginController', ['$scope', '$http', '$filter', '$state', 'md5', 'util',
        function($scope, $http, $filter, $state, md5, util) {
            var self = this;
            self.init = function() {

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
                }).finally(function(value) {
                    self.loading = false;
                });
            }
            self.getEditLangs = function() {
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
        function($http, $scope, $state, $stateParams, util) {
            var self = this;
            self.init = function() {
                // app 页面展开desktop
                if($state.current.name !== 'app') {
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
                    if($stateParams.appId){
                        self.setFocusApp($stateParams.appId);
                    }
                }, function errorCallback(data, status, headers, config) {

                }).finally(function(value) {
                    self.loading = false;
                });

                console.log(util.getParams('editLangs'))

            }

            self.setFocusApp = function(id) {
                var l = $scope.appList;
                for (var i =0; i < l.length; i++) {
                    if(l[i].id == id) {
                        self.activeAppName = l[i].name;
                        self.activeAppBgColor = l[i].bgColor;
                        break;
                    }
                }
            }

            // 1:酒店客房，3:移动商城
            self.switchApp = function(n) {
              self.appPhase = 2;
              self.setFocusApp(n);
              switch(n) {
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

            self.showDesktop = function() {
              self.appPhase = 1;
              setTimeout(function(){
                self.appFramePhase = 1;
              },530)
            }

            self.focusLauncher = function() {
              self.appFramePhase = 2;
            }

            self.focusApp = function() {
              self.appFramePhase = 1;
            }

            self.logout = function(event) {
                util.setParams('token', '');
                $state.go('login');
            }
        }
    ])


    .controller('shopController', ['$scope', '$state', '$translate', '$http', '$stateParams', '$filter', 'util',
        function($scope,$state,$translate,$http,$stateParams,$filter,util) {
            console.log('shopController')
            console.log($scope.app.maskParams);
            var self = this;
            self.init = function() {

                    self.langStyle = util.langStyle();
                    self.multiLang = util.getParams('editLangs');
                    console.log(self.langStyle)
                    console.log(self.multiLang)
                    self.searchShopList();

            }

            self.searchShopList = function() {
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
                    $state.go('app.shop.goods', { ShopID: self.shopFirst.ShopID, HotelID: self.shopFirst.HotelID, ShopName: self.shopFirst.ShopName[self.langStyle], HotelName: self.shopFirst.HotelName[self.langStyle]});
                }, function errorCallback(data, status, headers, config) {

                });

            }

            self.shopAdd = function(){
                $scope.app.maskParams = {'ShopName': self.shopFirst.ShopName};
                $scope.app.maskUrl = 'pages/shopAdd.html';
            }
        }
    ])

    .controller('shopAddController', ['$scope', '$state', '$http', '$stateParams', '$translate', '$filter', 'util',
        function($scope,$state,$http,$stateParams,$translate,$filter,util) {
            console.log('shopAddController');
            console.log($scope.app.maskParams);
            var self = this;
            self.init = function() {
                 self.langStyle = util.langStyle();
                 self.multiLang = util.getParams('editLangs');

                 console.log(self.langStyle)
                 self.searchHotelList();
                 // 表单提交 商城信息
                 self.form = {};
                 // 多语言
                 self.form.shopName = {};
            }

            self.cancel = function(){
                console.log('cancel')
                $scope.app.maskUrl = '';
            }

            self.searchHotelList = function() {
                var data = {
                      "action": "getHotelList",
                      "token": util.getParams("token"),
                      "lang": self.langStyle
                };
                data = JSON.stringify(data);
                    $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('hotelroom', 'shopList','server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        console.log(data)
                        self.hotelList = data.data.data;
                        console.log(self.hotelList)



                    }, function errorCallback(data, status, headers, config) {

                    });
            }

            self.saveForm = function() {
                console.log(self.form.HotelID)
                var shopList = {
                    "HotelID":self.form.HotelID - 0,
                    "ShopName":self.form.shopName,
                    "ShopType":"wx"
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
                        url: util.getApiUrl('shopinfo', 'shopList','server'),
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
        function($scope,$state,$http,$stateParams,$filter,util) {
            console.log('goodsController');
            console.log($stateParams);
            var self = this;
            self.init = function() {
                self.stateParams = $stateParams;
                self.langStyle = util.langStyle();
                self.multiLang = util.getParams('editLangs');

                self.getGoodsCategory();
            }

            self.categoryAdd = function(){
               console.log('categoryAdd')
               $scope.app.maskParams = {'ShopID': self.stateParams.ShopID-0};
               $scope.app.maskUrl = 'pages/categoryAdd.html';
            }



            self.shopEdit = function(){
                console.log('shopEdit')
                $scope.app.maskParams = {ShopID: $stateParams.ShopID, ShopName: $stateParams.ShopName,HotelID:$stateParams.HotelID};
                $scope.app.maskUrl = 'pages/shopEdit.html';
            }
            // 商品分类列表
            self.getGoodsCategory = function() {
                var data = {
                      "action": "getMgtProductCategory",
                      "token": util.getParams("token"),
                      "lang": self.langStyle,
                      "shopId": $stateParams.ShopID
                };
                data = JSON.stringify(data);
                    $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('shopinfo', 'shopList','server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        console.log(data)
                        self.categoryList = data.data.data.categoryList;
                        // 默认加载 全部分类

                        self.focusCategoryName = '22';


                        console.log(self.stateParams.ShopGoodsCategoryID)
                        //$state.go('app.shop.goods.goodsList',{ShopGoodsCategoryID:'all',ShopGoodsCategoryName:'全部商品'})
                    }, function errorCallback(data, status, headers, config) {

                    });
            }

            self.JSONstringfy = function(data){
                return JSON.stringify(data)
            }


        }
    ])

    .controller('goodsAddController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'util', 'CONFIG',
        function($scope,$state,$http,$stateParams,$filter,util, CONFIG) {
            console.log('goodsAddController');

            var self = this;
            self.init = function() {
                 self.shopId = $scope.app.maskParams.shopId;
                 self.shopGoodsCategoryId = $scope.app.maskParams.shopGoodsCategoryId;
                 self.imgs = new Imgs([]);
                 self.editLangs = util.getParams('editLangs');
                 self.name = {};
                 self.intro = {};
            }

            self.cancel = function(){
                console.log('cancel')
                $scope.app.maskUrl = '';
            }

            self.addGoods = function() {
                // 图片不能为空
                if(self.imgs.data.length == 0) {
                    alert('请上传图片');
                    return;
                }
                // 图片不能未传完
                else if(self.imgs.data.some(function(e,i,a){return e.progress < 100 && e.progress !== -1})) {
                    alert('请等待图片上传完成');
                    return;
                }
                var imgSrc = [];
                var l = self.imgs.data;
                for(var i = 0; i < l.length; i++){
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
                    if(data.data.rescode == "200"){
                        alert('添加成功');
                        $state.reload();
                    }else {
                        alert('添加失败，错误编码：' + data.data.rescode +'，' + data.data.errInfo);
                    }
                }, function errorCallback(data, status, headers, config) {
                    alert('连接服务器出错');
                }).finally(function(value) {
                    self.saving = false;
                });
            }

            self.clickUpload = function(e) {
              setTimeout(function() {
                  document.getElementById(e).click();
              }, 0);
            }

            function Imgs(imgList) {
                this.initImgList = imgList;
                this.data = [];
                this.maxId = 0;
            }

            Imgs.prototype = {
                initImgs: function() {
                    var l = this.initImgList;
                    for (var i =0; i < l.length; i++) {
                        this.data[i] = {"src": l[i].ImageURL, "fileSize":l[i].ImageSize, "id": this.maxId++, "progress": 100};
                    }
                },
                deleteById: function(id) {
                    var l = this.data;
                    for(var i = 0; i <l.length; i++) {
                        if (l[i].id == id) {
                            // 如果正在上传，取消上传
                            if(l[i].progress < 100 && l[i].progress != -1) {
                                l[i].xhr.abort();
                            }
                            l.splice(i, 1);
                            break;
                        }
                    }
                },

                add : function (xhr, fileName, fileSize) {
                  this.data.push({
                    "xhr": xhr,
                    "fileName": fileName,
                    "fileSize": fileSize,
                    "progress": 0,
                    "id": this.maxId
                  });
                  return this.maxId++;
                },

                update : function (id, progress, leftSize, fileSize) {
                  for(var i = 0; i < this.data.length; i++) {
                    var f = this.data[i];
                    if(f.id === id) {
                      f.progress = progress;
                      f.leftSize = leftSize;
                      f.fileSize = fileSize;
                      break;
                    }
                  }
                },

                setSrcSizeByXhr: function(xhr, src, size) {
                    for (var i =0; i< this.data.length; i++) {
                        if(this.data[i].xhr == xhr) {
                            this.data[i].src = src;
                            this.data[i].fileSize = size;
                            break;
                        }
                    }
                },

                uploadFile: function(e) {
                    var file = $scope[e];
                    var uploadUrl = CONFIG.uploadUrl;
                    var xhr = new XMLHttpRequest();
                    var fileId = this.add(xhr, file.name, file.size, xhr);
                    // self.search();

                    util.uploadFileToUrl(xhr, file, uploadUrl, 'normal',
                        function(evt) {
                          $scope.$apply(function(){
                            if (evt.lengthComputable) {
                              var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                              self.imgs.update(fileId, percentComplete, evt.total - evt.loaded, evt.total);
                              console.log(percentComplete);
                            }
                          });
                        },
                        function(xhr) {
                            var ret = JSON.parse(xhr.responseText);
                            console && console.log(ret);
                            $scope.$apply(function(){
                              self.imgs.setSrcSizeByXhr(xhr, ret.upload_path, ret.size);
                            });
                        },
                        function(xhr) {
                            $scope.$apply(function(){
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
        function($scope,$state,$http,$stateParams,$filter,util, CONFIG) {
            console.log('goodsEditController');

            var self = this;
            self.init = function() {
                 self.productId = $scope.app.maskParams.productId;
                 self.editLangs = util.getParams('editLangs');
                 self.name = {};
                 self.intro = {};

                 self.getGoodsInfo();
            }

            self.getGoodsInfo = function() {
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
                    if(data.data.rescode == "200"){
                        var data = data.data.data;
                        self.name = data.product.name;
                        self.invetory = data.product.invetory;
                        self.price = data.product.price;
                        self.intro = data.product.intro;
                        self.imgs = new Imgs(data.product.imgSrc);
                        self.imgs.initImgs();
                    }else {
                        alert('读取商品失败' + data.data.rescode +'，' + data.data.errInfo);
                    }
                }, function errorCallback(data, status, headers, config) {
                    alert('连接服务器出错');
                }).finally(function(value) {
                    self.loading = false;
                });
            }

            self.cancel = function(){
                console.log('cancel')
                $scope.app.maskUrl = '';
            }

            self.editGoods = function() {
                // 图片不能为空
                if(self.imgs.data.length == 0) {
                    alert('请上传图片');
                    return;
                }
                // 图片不能未传完
                else if(self.imgs.data.some(function(e,i,a){return e.progress < 100 && e.progress !== -1})) {
                    alert('请等待图片上传完成');
                    return;
                }
                var imgSrc = [];
                var l = self.imgs.data;
                for(var i = 0; i < l.length; i++){
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
                    if(data.data.rescode == "200"){
                        alert('修改成功');
                        $state.reload();
                    }else {
                        alert('修改失败，错误编码：' + data.data.rescode +'，' + data.data.errInfo);
                    }
                }, function errorCallback(data, status, headers, config) {
                    alert('连接服务器出错');
                }).finally(function(value) {
                    self.saving = false;
                });
            }

            self.clickUpload = function(e) {
              setTimeout(function() {
                  document.getElementById(e).click();
              }, 0);
            }

            function Imgs(imgList) {
                this.initImgList = imgList;
                this.data = [];
                this.maxId = 0;
            }

            Imgs.prototype = {
                initImgs: function() {
                    var l = this.initImgList;
                    for (var i =0; i < l.length; i++) {
                        this.data[i] = {"src": l[i].ImageURL, "fileSize":l[i].ImageSize, "id": this.maxId++, "progress": 100};
                    }
                },
                deleteById: function(id) {
                    var l = this.data;
                    for(var i = 0; i <l.length; i++) {
                        if (l[i].id == id) {
                            // 如果正在上传，取消上传
                            if(l[i].progress < 100 && l[i].progress != -1) {
                                l[i].xhr.abort();
                            }
                            l.splice(i, 1);
                            break;
                        }
                    }
                },

                add : function (xhr, fileName, fileSize) {
                  this.data.push({
                    "xhr": xhr,
                    "fileName": fileName,
                    "fileSize": fileSize,
                    "progress": 0,
                    "id": this.maxId
                  });
                  return this.maxId++;
                },

                update : function (id, progress, leftSize, fileSize) {
                  for(var i = 0; i < this.data.length; i++) {
                    var f = this.data[i];
                    if(f.id === id) {
                      f.progress = progress;
                      f.leftSize = leftSize;
                      f.fileSize = fileSize;
                      break;
                    }
                  }
                },

                setSrcSizeByXhr: function(xhr, src, size) {
                    for (var i =0; i< this.data.length; i++) {
                        if(this.data[i].xhr == xhr) {
                            this.data[i].src = src;
                            this.data[i].fileSize = size;
                            break;
                        }
                    }
                },

                uploadFile: function(e) {
                    var file = $scope[e];
                    var uploadUrl = CONFIG.uploadUrl;
                    var xhr = new XMLHttpRequest();
                    var fileId = this.add(xhr, file.name, file.size, xhr);
                    // self.search();

                    util.uploadFileToUrl(xhr, file, uploadUrl, 'normal',
                        function(evt) {
                          $scope.$apply(function(){
                            if (evt.lengthComputable) {
                              var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                              self.imgs.update(fileId, percentComplete, evt.total - evt.loaded, evt.total);
                              console.log(percentComplete);
                            }
                          });
                        },
                        function(xhr) {
                            var ret = JSON.parse(xhr.responseText);
                            console && console.log(ret);
                            $scope.$apply(function(){
                              self.imgs.setSrcSizeByXhr(xhr, ret.upload_path, ret.size);
                            });
                        },
                        function(xhr) {
                            $scope.$apply(function(){
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
        function($scope,$state,$http,$stateParams,$filter,util) {
            console.log('shopEditController');
            console.log('$stateParams: '+$stateParams);
            console.log($scope.app.maskParams);
            var self = this;
            self.init = function() {
                 self.maskParams = $scope.app.maskParams;
                 self.langStyle = util.langStyle();
                 self.multiLang = util.getParams('editLangs');

                 // 表单提交 商城信息
                 self.form = {};
                 // 多语言
                 self.form.shopName = {};

                 self.searchHotelList();
                 self.getShopInfo();
            }

            self.cancel = function(){
                console.log('cancel')
                $scope.app.maskUrl = '';
            };

            self.searchHotelList = function() {
                var data = {
                      "action": "getHotelList",
                      "token": util.getParams("token"),
                      "lang": self.langStyle
                };
                data = JSON.stringify(data);
                    $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('hotelroom', 'shopList','server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        console.log(data)
                        self.hotelList = data.data.data.hotelList;
                    }, function errorCallback(data, status, headers, config) {

                    });
            }

            self.getShopInfo = function() {
                var data = {
                      "action": "getMgtHotelShopDetail",
                      "token": util.getParams("token"),
                      "lang": self.langStyle,
                      // "ShopID":1
                      "ShopID":self.maskParams.ShopID - 0
                };
                data = JSON.stringify(data);
                    $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('shopinfo', 'shopList','server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        console.log(data)
                        self.shopInfo = data.data.shop;
                        console.log(self.shopInfo)
                    }, function errorCallback(data, status, headers, config) {

                    });
            }
            
            self.saveForm = function() {
                console.log(self.form.HotelID)
                var shopList = {
                    "HotelID":self.form.HotelID - 0,
                    "ShopName":self.shopInfo.ShopName,
                    "ShopType":"wx"
                }
                var data = {
                      "action": "editMgtHotelShop",
                      "token": util.getParams("token"),
                      "lang": self.langStyle,
                      "shop": {
                          "ShopID": self.maskParams.ShopID,
                          "ShopName": self.shopInfo.ShopName,
                          "ShopType": "wx"
                      }

                };

                data = JSON.stringify(data); 
                $http({
                    method: $filter('ajaxMethod')(),
                    url: util.getApiUrl('shopinfo', 'shopList','server'),
                    data: data
                }).then(function successCallback(data, status, headers, config) {
                    alert('修改成功')
                    $state.reload();
                }, function errorCallback(data, status, headers, config) {

                });
            };

            self.deleteShop = function(){
               var flag = confirm('确认删除？')
               if(!flag){
                 return;
               }
               var shopList = {
                   "HotelID":self.form.HotelID - 0,
                   "ShopName":self.form.shopName,
                   "ShopType":"wx"
               }
               var data = {
                     "action": "deleteMgtHotelShop",
                     "token": util.getParams("token"),
                     "lang": self.langStyle,
                     "shop":{
                          "ShopID":self.maskParams.ShopID -0
                     }
               };
               data = JSON.stringify(data);
               $http({
                   method: $filter('ajaxMethod')(),
                   url: util.getApiUrl('shopinfo', 'shopList','server'),
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
        function($scope,$state,$http,$stateParams,$filter,util) {
            console.log('categoryAddController');
            console.log($stateParams);
            console.log($scope.app.maskParams);
            var self = this;
            self.init = function() {
                self.langStyle = util.langStyle();
                self.maskParams = $scope.app.maskParams;
                self.ShopName = self.maskParams.ShopGoodsCategoryName;
                console.log(self.maskParams);
                self.multiLang = util.getParams('editLangs');

                // 表单提交 商城信息
                self.form = {};
                // 多语言
                self.form.shopName = {};
            }

            self.cancel = function(){
                console.log('cancel')
                $scope.app.maskUrl = '';
            }

            self.saveForm = function() {
                var data = {
                      "action": "addMgtProductCategory",
                      "token": util.getParams("token"),
                      "lang": self.langStyle,
                      "ShopGoodsCategory":{
                           "ShopGoodsCategoryName":self.form.shopName,
                           "ShopID":self.maskParams.ShopID - 0
                      }

                };
                data = JSON.stringify(data);
                    $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('shopinfo', 'shopList','server'),
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
        function($scope,$state,$http,$stateParams,$filter,util) {
            console.log('categoryEditController');
            console.log($stateParams);
            console.log($scope.app.maskParams);
            var self = this;
            self.init = function() {
                self.stateParams = $stateParams;
                self.maskParams = $scope.app.maskParams;
                self.langStyle = util.langStyle();
                self.multiLang = util.getParams('editLangs');

                // 表单提交 商城信息
                self.form = {};
                // 多语言
                self.form.shopName = {};
                self.getCategoryDetail();
            }

            self.cancel = function(){
                console.log('cancel')
                $scope.app.maskUrl = '';
            }

            self.saveForm = function() {
                console.log(self.form.HotelID)
                console.log(self.form.HotelID)
                var data = {
                      "action": "editMgtProductCategory",
                      "token": util.getParams("token"),
                      "lang": self.langStyle,
                      "ShopGoodsCategory":{
                           "ShopGoodsCategoryID":self.maskParams.ShopGoodsCategoryID,
                           "ShopGoodsCategoryName":self.categoryDetail
                      }
                };
                data = JSON.stringify(data);
                $http({
                    method: $filter('ajaxMethod')(),
                    url: util.getApiUrl('shopinfo', 'shopList','server'),
                    data: data
                }).then(function successCallback(data, status, headers, config) {
                    alert('分类修改成功')
                    $state.reload();
                }, function errorCallback(data, status, headers, config) {

                });
            };

            self.getCategoryDetail = function() {
                    console.log(self.form.HotelID)
                    console.log(self.form.HotelID)
                    var data = {
                        "action": "getMgtProductCategoryDetail",
                        "token": util.getParams("token"),
                        "lang": self.langStyle,
                        "ShopGoodsCategoryID": self.maskParams.ShopGoodsCategoryID - 0
                    };

                data = JSON.stringify(data);
                $http({
                    method: $filter('ajaxMethod')(),
                    url: util.getApiUrl('shopinfo', 'shopList','server'),
                    data: data
                }).then(function successCallback(data, status, headers, config) {
                   self.categoryDetail = data.data.ShopGoodsCategoryName
                }, function errorCallback(data, status, headers, config) {

                });
            };

        }
    ])
    
    .controller('goodsListController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'NgTableParams', 'util',
        function($scope,$state,$http,$stateParams,$filter,NgTableParams,util) {
            console.log('goodsListController');
            console.log($stateParams);
            console.log($scope.app.maskParams);
            var self = this;
            self.init = function() {
                self.stateParams = $stateParams;
                console.log($scope.goods.focusCategoryName)
                console.log(self.stateParams)
                // 控制台打印出来的 不一样？
                // self.stateParams.HotelID = "123123213213"
                // self.stateParams.HotelName = "郑州门店"
                console.log(self.stateParams)
                self.langStyle = util.langStyle();
                self.multiLang = util.getParams('editLangs');
                self.getGoodsCategory();
                self.getProductList(self.stateParams.ShopGoodsCategoryID);

            }
            // self.reload = function(){
            //     $state.go('app.shop.goods.goodsList',{ShopGoodsCategoryID:self.stateParams.ShopGoodsCategoryID});
            // }
            // 分类编辑
            self.categoryEdit = function(){
               $scope.app.maskParams = {'ShopGoodsCategoryID':self.stateParams.ShopGoodsCategoryID - 0 ,ShopID:self.stateParams.ShopID};
               $scope.app.maskUrl = 'pages/categoryEdit.html';
            }
 

            self.categoryDelete = function(){
                var flag = confirm('确认删除？')
                if(!flag){
                  return;
                }
                var data = {
                      "action": "deleteMgtProductCategory",
                      "token": util.getParams("token"),
                      "lang": self.langStyle,
                      "ShopGoodsCategoryID":self.stateParams.ShopGoodsCategoryID-0
                };
                data = JSON.stringify(data);
                $http({
                    method: $filter('ajaxMethod')(),
                    url: util.getApiUrl('shopinfo', 'shopList','server'),
                    data: data
                }).then(function successCallback(data, status, headers, config) {
                    alert('分类删除成功')
                    $state.reload();
                }, function errorCallback(data, status, headers, config) {

                });
            }

            self.goodsAdd = function(){
                $scope.app.maskParams = {'shopId': self.stateParams.ShopID, 'shopGoodsCategoryId': self.stateParams.ShopGoodsCategoryID}; //全部分类 ShopGoodsCategoryID －1
                $scope.app.maskUrl = 'pages/goodsAdd.html';
            }

            self.goodsEdit = function(goodsId){
                $scope.app.maskParams = {'productId': goodsId};
                $scope.app.maskUrl = 'pages/goodsEdit.html';
            }

            // 商品分类列表
            self.getGoodsCategory = function() {
                var data = {
                      "action": "getMgtProductCategory",
                      "token": util.getParams("token"),
                      "lang": self.langStyle,
                      "shopId": $stateParams.ShopID-0
                };
                data = JSON.stringify(data);
                    $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('shopinfo', 'shopList','server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        console.log(data)
                        self.categoryList = data.data.data.categoryList;
                    }, function errorCallback(data, status, headers, config) {

                    });
            }

            // 商品列表
            self.getProductList = function(ShopGoodsCategoryID){
                console.log(ShopGoodsCategoryID)
                var data = {
                    "action": "getMgtShopProductList",
                    "token": util.getParams("token"),
                    "lang": self.langStyle,
                    "ShopID": self.stateParams.ShopID - 0,
                }

                if (!(ShopGoodsCategoryID == "all")) {
                    data.ShopGoodsCategoryID = self.stateParams.ShopGoodsCategoryID - 0;
                    data.action="getMgtProductList";
                }
                // self.tableParams = new NgTableParams({
                //     page: 1,
                //     count: 4,
                //     url:''
                // }, {
                //     counts: [2,4],
                //     getData: function(params) {
                //         var paramsUrl = params.url();
                //         data.count =paramsUrl.count,
                //         data.page =paramsUrl.page,
                //         data = JSON.stringify(data);
                //         $http({
                //             method: $filter('ajaxMethod')(),
                //             url: util.getApiUrl('shopinfo', 'shopList', 'server'),
                //             data: data
                //         }).then(function successCallback(data, status, headers, config) {
                //             console.log(data)
                //             var data = data.data.data.productList;
                //             console.log(data)
                //             // params.total(self.productList.length)
                //             params.total(data.length)
                //             return  data;
                //         }, function errorCallback(data, status, headers, config) {

                //         });

                //     }
                // })
                

                self.tableParams = new NgTableParams({
                    page: 1,
                    count: 5,
                    url: ''
                }, { 
                    counts: [2,4],
                    getData: function(params) {
                        var paramsUrl = params.url();
                        data.count = paramsUrl.count,
                            data.page = paramsUrl.page,
                            data = JSON.stringify(data);
                        $http({
                            method: $filter('ajaxMethod')(),
                            url: util.getApiUrl('shopinfo', 'shopList', 'server'),
                            data: data
                        }).then(function successCallback(data, status, headers, config) {
                            // var data = data.data.data.productList;
                            // console.log(params)
                                
                            // params.total(data.length)
                            // return data;

                            var data = [{
                                "name": { "zh-CN": "大闸蟹" },
                                "invetory": 93,
                                "price": "1",
                                "intro": {
                                    "zh-CN": "阳澄湖大闸蟹现货实物788型 公蟹3.1-3.6两/只 母蟹2.0-2.5两/只 共10只螃蟹 礼盒装 自营海鲜水产"
                                },
                                "imgSrc": "2.jpg",
                                "categoryList": [{
                                    "ShopGoodsCategoryID": 1,
                                    "ShopGoodsCategoryName": { "zh-CN": "生鲜" }
                                }],
                                "productId": 1,
                                "status": "1"
                            },{
                                "name": { "zh-CN": "大闸蟹" },
                                "invetory": 93,
                                "price": "1",
                                "intro": {
                                    "zh-CN": "阳澄湖大闸蟹现货实物788型 公蟹3.1-3.6两/只 母蟹2.0-2.5两/只 共10只螃蟹 礼盒装 自营海鲜水产"
                                },
                                "imgSrc": "2.jpg",
                                "categoryList": [{
                                    "ShopGoodsCategoryID": 1,
                                    "ShopGoodsCategoryName": { "zh-CN": "生鲜" }
                                }],
                                "productId": 1,
                                "status": "1"
                            },{
                                "name": { "zh-CN": "大闸蟹" },
                                "invetory": 93,
                                "price": "1",
                                "intro": {
                                    "zh-CN": "阳澄湖大闸蟹现货实物788型 公蟹3.1-3.6两/只 母蟹2.0-2.5两/只 共10只螃蟹 礼盒装 自营海鲜水产"
                                },
                                "imgSrc": "2.jpg",
                                "categoryList": [{
                                    "ShopGoodsCategoryID": 1,
                                    "ShopGoodsCategoryName": { "zh-CN": "生鲜" }
                                }],
                                "productId": 1,
                                "status": "1"
                            }];
                            params.total(data.length);
                            return data;

                        }, function errorCallback(data, status, headers, config) {

                        });





                        
                    } 
                });

            }

            // 商品分类，属于某分类则返回true
            self.checkGoodsCategory = function(id,categoryList){
                for (var i = 0; i < categoryList.length; i++) {
                    if (id == categoryList[i]['ShopGoodsCategoryID'] ) {
                        return true;
                    }
                }
            }
            
            // 更改商品分类
            self.changeGoodsCategory = function(productId,categoryId ,value,categoryList) {
                console.log(' productId' + productId + ' categoryId' + categoryId + ' value' + value+' categoryList' + categoryList)
                // 商品 的分类，保存在此对象
                self.categoryObj = {};
                self.categoryObj[productId] = [];    
                for (var i = 0; i < categoryList.length; i++) {
                   self.categoryObj[productId].push(categoryList[i]['ShopGoodsCategoryID']);
                }
                var index = self.categoryObj[productId].indexOf(categoryId);
                // 没有，则添加此分类
                if (index < 0) {
                    self.categoryObj[productId].push(categoryId)
                } else {
                    self.categoryObj[productId].splice(index,1)
                }
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
                        url: util.getApiUrl('shopinfo', 'shopList','server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        console.log(data)
                        alert('修改分类成功')
                    }, function errorCallback(data, status, headers, config) {

                    });
            }

            // 商品 上下架
            self.changeGoodsStatus = function(productId,status) {
                console.log('productId:' + productId + ' status:' + status)
                if (status == true) {
                    status = 1;
                } else {
                    status = 0;
                }

                var data = {
                    "action": "editMgtProductStatus",
                    "token": util.getParams("token"),
                    "lang": self.langStyle,
                    "product": {
                        "productID": productId - 0,
                        "Status": status
                    }
                };


                data = JSON.stringify(data);
                $http({
                    method: $filter('ajaxMethod')(),
                    url: util.getApiUrl('shopinfo', 'shopList', 'server'),
                    data: data
                }).then(function successCallback(data, status, headers, config) {
                    alert('修改成功')
                }, function errorCallback(data, status, headers, config) {

                });

            }






        }
    ])

    
    .controller('hotelRoomController', ['$scope',
        function($scope) {
            var self = this;
            self.init = function() {
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

    .controller('roomController', ['$scope', '$http', '$stateParams', '$translate', 'util',
        function($scope, $http, $stateParams, $translate, util) {
            var self = this;
            var lang = util.langStyle();

            self.init = function() {
                self.defaultLangCode = util.getDefaultLangCode();
                self.hotelId = $stateParams.hotelId;
                self.getHotelInfo()
                self.getRoomList()
            }
            /**
             * 获取酒店信息
             */
            self.getHotelInfo = function () {
                self.loadingHotelInfo = true;
                var data = JSON.stringify({
                    action: "getHotel",
                    token: util.getParams('token'),
                    lang: util.langStyle(),
                    HotelID: Number(self.hotelId)
                })
                $http({
                    method: 'POST',
                    url: util.getApiUrl('hotelroom', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        self.hotel = {};
                        self.hotel.Imgs = data.data.Gallery;
                        self.hotel.Tags = data.data.Features;
                        self.hotel.Name = data.data.Name;
                        self.hotel.Address = data.data.Address;
                        self.hotel.Description = data.data.Description;
                        self.hotel.LocationX = data.data.LocationX;
                        self.hotel.LocationY = data.data.LocationY;
                        self.hotel.LogoImg = data.data.LogoURL;
                    } else {
                        alert(data.rescode + ' ' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert(response.status + ' 服务器出错');
                }).finally(function(e) {
                    self.loadingHotelInfo = false;
                });
            }

            /**
             * 获取客房列表
             */
            self.getRoomList = function () {
                var rooms = [];
                var data = JSON.stringify({
                    action: "getRoomList",
                    token: util.getParams('token'),
                    lang: lang,
                    HotelID: Number(self.hotelId)
                })
                $http({
                    method: 'POST',
                    url: util.getApiUrl('hotelroom', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var msg = response.data;
                    if (msg.rescode == '200') {
                        msg.data.forEach(function (el) {
                            rooms.push({
                                imgURL: el.LogoImgURL,
                                roomTypeName: el.RoomTypeName
                            })
                        })
                        self.rooms = rooms;
                    } else {
                        alert(msg.rescode + ' ' + msg.errInfo);
                    }
                }, function errorCallback(response) {
                    alert(response.status + ' 服务器出错');
                });
            }

            self.hotelEdit = function () {
                $scope.app.maskParams = {'hotelId': self.hotelId, 'hotelInfo': self.hotel};
                $scope.app.maskUrl = 'pages/hotelEdit.html';
            }

            self.roomAdd = function () {
                $scope.app.maskParams = {'hotelId': self.hotelId};
                $scope.app.maskUrl = 'pages/roomAdd.html';
            }

            self.roomEdit = function (roomId) {
                //$scope.app.maskParams = {'hotelId': self.hotelId, 'roomId': roomId};
                //emma test
                $scope.app.maskParams = {'hotelId': self.hotelId, 'roomId': 1};
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

    .controller('hotelEditController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'util', 'CONFIG', 
        function ($scope, $state, $http, $stateParams, $filter, util, CONFIG) {
            var self = this;
            self.init = function () {
                self.defaultLangCode = util.getDefaultLangCode();
                self.hotelId = $scope.app.maskParams.hotelId;
                self.hotel = $scope.app.maskParams.hotelInfo;
                self.ifCheckedHotelTags = [];
                self.editLangs = util.getParams('editLangs');
                self.initImgs1();
                self.initImgs2();
                self.getHotelTags();
            }

            self.initImgs1 = function() {
                // 初始化酒店图片多张
                self.imgs1 = new Imgs(self.hotel.Imgs);
                self.imgs1.initImgs();
            }

            self.initImgs2 = function() {
                // 初始化酒店LOGO
                self.imgs2 = new Imgs([{"ImageURL": self.hotel.LogoImg, "ImageSize": 0}], true);
                self.imgs2.initImgs();
            }

            self.cancel = function () {
                $scope.app.maskUrl = '';
            }

            self.save = function() {
                var imgs = [];
                for(var i=0; i<self.imgs1.data.length; i++) {
                    imgs[i] = {};
                    imgs[i].Seq = i;
                    imgs[i].ImageURL = self.imgs1.data[i].src;
                    imgs[i].ImageSize = self.imgs1.data[i].fileSize;
                }
                //检查图片未上传
                if(imgs.length == 0) {
                    alert('请上传酒店图片')
                    return;
                }
                //检查logo上传
                if(self.imgs2.data.length == 0) {
                    alert('请上传酒店LOGO')
                    return;
                }

                var tags = [];
                for(var i=0; i< self.ifCheckedHotelTags.length;i++){
                    if(self.ifCheckedHotelTags[i].checked) {
                        tags.push({"ID": self.ifCheckedHotelTags[i].ID});
                    }
                }
                self.saving = true;
                var data = JSON.stringify({
                    action: "editHotel",
                    token: util.getParams('token'),
                    lang: util.langStyle(),
                    "HotelID": Number(self.hotelId),
                    "data":{
                        "Name": self.hotel.Name,
                        "CityID":1, //fix me 
                        "LocationX": self.hotel.LocationX,
                        "LocationY": self.hotel.LocationY,
                        "LogoURL": self.imgs2.data[0].src,
                        "Features": tags,
                        "TelePhone": null,
                        "Address": self.hotel.Address,
                        "Description": self.hotel.Description,
                        "OfficePhone": null,
                        "Gallery":imgs
                    }
                })
                $http({
                    method: 'POST',
                    url: util.getApiUrl('hotelroom', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        alert('修改成功');
                        $state.reload();
                    } else {
                        alert('保存失败' + data.rescode + ' ' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert(response.status + ' 服务器出错');
                }).finally(function(e) {
                    self.saving = false;
                });
            }

            self.getHotelTags = function() {
                self.loading = true;
                var data = JSON.stringify({
                    action: "getHotelFeatureTag",
                    token: util.getParams('token'),
                    lang: util.langStyle()
                })
                $http({
                    method: 'POST',
                    url: util.getApiUrl('hotelroom', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        console&&console.log(data.data);
                        self.hotelTags = data.data;
                        self.initIfCheckedHotelTags();
                    } else {
                        alert('读取酒店标签出错' + data.rescode + ' ' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert(response.status + ' 服务器出错');
                }).finally(function(e) {
                    self.loading = false;
                });
            }

            self.initIfCheckedHotelTags = function() {
                for(var i =0; i < self.hotelTags.length; i++) {
                    self.ifCheckedHotelTags[i] = {};
                    self.ifCheckedHotelTags[i].checked = false;
                    self.ifCheckedHotelTags[i].ID = self.hotelTags[i].ID;
                    for (var j = 0; j<self.hotel.Tags.length; j++) {
                        if(self.hotel.Tags[j].ID == self.hotelTags[i].ID) {
                            self.ifCheckedHotelTags[i].checked = true;
                            break;
                        } 
                    }
                }            
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
                this.single = single?true:false;
            }

            Imgs.prototype = {
                initImgs: function() {
                    var l = this.initImgList;
                    for (var i =0; i < l.length; i++) {
                        this.data[i] = {"src": l[i].ImageURL, "fileSize":l[i].ImageSize, "id": this.maxId++, "progress": 100};
                    }
                },
                deleteById: function(id) {
                    var l = this.data;
                    for(var i = 0; i <l.length; i++) {
                        if (l[i].id == id) {
                            // 如果正在上传，取消上传
                            if(l[i].progress < 100 && l[i].progress != -1) {
                                l[i].xhr.abort();
                            }
                            l.splice(i, 1);
                            break;
                        }
                    }
                },

                add : function (xhr, fileName, fileSize) {
                  this.data.push({
                    "xhr": xhr,
                    "fileName": fileName,
                    "fileSize": fileSize,
                    "progress": 0,
                    "id": this.maxId
                  });
                  return this.maxId++;
                },

                update : function (id, progress, leftSize, fileSize) {
                  for(var i = 0; i < this.data.length; i++) {
                    var f = this.data[i];
                    if(f.id === id) {
                      f.progress = progress;
                      f.leftSize = leftSize;
                      f.fileSize = fileSize;
                      break;
                    }
                  }
                },

                setSrcSizeByXhr: function(xhr, src, size) {
                    for (var i =0; i< this.data.length; i++) {
                        if(this.data[i].xhr == xhr) {
                            this.data[i].src = src;
                            this.data[i].fileSize = size;
                            break;
                        }
                    }
                },

                uploadFile: function(e, o) {

                    // 如果这个对象只允许上传一张图片
                    if(this.single) {
                        // 删除第二张以后的图片
                        for(var i = 1; i < this.data.length; i++) {
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
                          $scope.$apply(function(){
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
                            $scope.$apply(function(){
                              o.setSrcSizeByXhr(xhr, ret.upload_path, ret.size);
                              // 如果这个对象只允许上传一张图片
                              if(o.single) {
                                // 删除第一站图片
                                o.deleteById(o.data[0].id);
                              }
                            });
                        },
                        function(xhr) {
                            $scope.$apply(function(){
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

    .controller('roomAddController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'util', 'CONFIG',
        function ($scope, $state, $http, $stateParams, $filter, util, CONFIG) {
            var self = this;
            
            self.init = function () {
                self.hotelId = $scope.app.maskParams.hotelId;
                self.room = {};
                self.editLangs = util.getParams('editLangs');
                self.defaultLangCode = util.getDefaultLangCode();
                self.getRoomTags();
                self.ifCheckedTags = [];
                self.imgs = new Imgs([]);
            }
            self.cancel = function () {
                $scope.app.maskUrl = '';
            }

            /**
             * 获取客房标签
             */
            self.getRoomTags = function () {
                self.loading = true;
                var data = JSON.stringify({
                    action: "getRoomTags",
                    token: util.getParams('token'),
                    lang: util.langStyle()
                })
                $http({
                    method: 'POST',
                    url: util.getApiUrl('room', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        self.tags = data.tags;
                        for(var i = 0; i < self.tags.length; i++){
                            self.ifCheckedTags[i] = {};
                            self.ifCheckedTags[i].ID = self.tags[i].ID;
                            self.ifCheckedTags[i].checked = false;
                        }
                    } else {
                        alert('读取标签失败' + data.rescode + ' ' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert(response.status + ' 服务器出错');
                }).finally(function(e) {
                    self.loading = false;
                });
            }
            /**
             * 保存
             */
            self.save = function () {
                var tags = [];
                for(var i =0; i < self.ifCheckedTags.length; i++){
                    if(self.ifCheckedTags[i].checked){
                        tags.push(self.ifCheckedTags[i].ID);
                    }
                }
                var imgs = [];
                for(var i =0; i<self.imgs.data.length; i++){
                    imgs.push(
                        {"Seq":i,
                        "ImageURL":self.imgs.data[i].src,
                        "ImageSize":self.imgs.data[i].fileSize}
                    );
                }

                if(imgs.length == 0) {
                    alert('请上传图片')
                    return;
                }

                self.saving = true;
                var data = JSON.stringify({
                    action: "addRoom",
                    token: util.getParams('token'),
                    lang: util.langStyle(),
                    "tags": tags,
                    "IntroImgs": imgs,
                    "roomDetail": {
                        "HotelID": self.hotelId,
                        "Description": self.room.Description,
                        "RoomTypeName": self.room.RoomTypeName
                    }
                })
                console&&console.log(data);
                $http({
                    method: 'POST',
                    url: util.getApiUrl('room', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        alert('添加成功')
                        $state.reload();
                    } else {
                        alert('添加失败' + data.rescode + ' ' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert(response.status + ' 服务器出错');
                }).finally(function(e) {
                    self.saving = false;
                });
            };

            self.clickUpload = function(e) {
              setTimeout(function() {
                  document.getElementById(e).click();
              }, 0);
            }

            function Imgs(imgList, single) {
                this.initImgList = imgList;
                this.data = [];
                this.maxId = 0;
                this.single = single?true:false;
            }

            Imgs.prototype = {
                initImgs: function() {
                    var l = this.initImgList;
                    for (var i =0; i < l.length; i++) {
                        this.data[i] = {"src": l[i].ImageURL, "fileSize":l[i].ImageSize, "id": this.maxId++, "progress": 100};
                    }
                },
                deleteById: function(id) {
                    var l = this.data;
                    for(var i = 0; i <l.length; i++) {
                        if (l[i].id == id) {
                            // 如果正在上传，取消上传
                            if(l[i].progress < 100 && l[i].progress != -1) {
                                l[i].xhr.abort();
                            }
                            l.splice(i, 1);
                            break;
                        }
                    }
                },

                add : function (xhr, fileName, fileSize) {
                  this.data.push({
                    "xhr": xhr,
                    "fileName": fileName,
                    "fileSize": fileSize,
                    "progress": 0,
                    "id": this.maxId
                  });
                  return this.maxId++;
                },

                update : function (id, progress, leftSize, fileSize) {
                  for(var i = 0; i < this.data.length; i++) {
                    var f = this.data[i];
                    if(f.id === id) {
                      f.progress = progress;
                      f.leftSize = leftSize;
                      f.fileSize = fileSize;
                      break;
                    }
                  }
                },

                setSrcSizeByXhr: function(xhr, src, size) {
                    for (var i =0; i< this.data.length; i++) {
                        if(this.data[i].xhr == xhr) {
                            this.data[i].src = src;
                            this.data[i].fileSize = size;
                            break;
                        }
                    }
                },

                uploadFile: function(e, o) {

                    // 如果这个对象只允许上传一张图片
                    if(this.single) {
                        // 删除第二张以后的图片
                        for(var i = 1; i < this.data.length; i++) {
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
                          $scope.$apply(function(){
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
                            $scope.$apply(function(){
                              o.setSrcSizeByXhr(xhr, ret.upload_path, ret.size);
                              // 如果这个对象只允许上传一张图片
                              if(o.single) {
                                // 删除第一站图片
                                o.deleteById(o.data[0].id);
                              }
                            });
                        },
                        function(xhr) {
                            $scope.$apply(function(){
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

    .controller('roomEditController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'util',
        function ($scope, $state, $http, $stateParams, $filter, util) {
            var self = this;
            
            self.init = function () {
                self.hotelId = $scope.app.maskParams.hotelId;
                self.roomId = $scope.app.maskParams.roomId;
                self.room = {};
                self.editLangs = util.getParams('editLangs');
                self.defaultLangCode = util.getDefaultLangCode();
                self.ifCheckedTags = [];
                self.getRoomTags();
            }
            self.cancel = function () {
                $scope.app.maskUrl = '';
            }

            /**
             * 获取客房标签
             */
            self.getRoomTags = function () {
                self.loading = true;
                var data = JSON.stringify({
                    action: "getRoomTags",
                    token: util.getParams('token'),
                    lang: util.langStyle()
                })
                $http({
                    method: 'POST',
                    url: util.getApiUrl('room', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        self.tags = data.tags;
                        for(var i = 0; i < self.tags.length; i++){
                            self.ifCheckedTags[i] = {};
                            self.ifCheckedTags[i].ID = self.tags[i].ID;
                            self.ifCheckedTags[i].checked = false;
                        }
                        // 读取客房信息
                        self.getRoomInfo();
                    } else {
                        alert('读取标签失败' + data.rescode + ' ' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert(response.status + ' 服务器出错');
                }).finally(function(e) {
                    self.loading = false;
                });
            }

            self.getRoomInfo = function() {
                self.loading = true;
                var data = JSON.stringify({
                    action: "getRoomInfoByID",
                    token: util.getParams('token'),
                    lang: util.langStyle(),
                    roomID: self.roomId
                })
                
                $http({
                    method: 'POST',
                    url: util.getApiUrl('room', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        self.room.RoomTypeName = data.RoomTypeName;
                        self.room.Roomsummary = data.Roomsummary;
                        self.room.Description = data.Description;
                        for(var i = 0; i < self.tags.length; i++){
                            for(var j =0; j < data.tags.length; j++) {
                                if(self.tags[i].ID == data.tags[j].ID) {
                                    self.tags[i].checked = true;
                                }
                            }
                        }
                        self.imgs = new Imgs(data.imgs);
                        self.imgs.initImgs();
                        
                    } else {
                        alert('读取客房信息失败' + data.rescode + ' ' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert(response.status + ' 服务器出错');
                }).finally(function(e) {
                    self.loading = false;
                });
            }

            /**
             * 保存
             */
            self.save = function () {
                var tags = [];
                for(var i =0; i < self.ifCheckedTags.length; i++){
                    if(self.ifCheckedTags[i].checked){
                        tags.push(self.ifCheckedTags[i].ID);
                    }
                }
                var imgs = [];
                for(var i =0; i<self.imgs.data.length; i++){
                    imgs.push(
                        {"Seq":i,
                        "ImageURL":self.imgs.data[i].src,
                        "ImageSize":self.imgs.data[i].fileSize}
                    );
                }

                if(imgs.length == 0) {
                    alert('请上传图片')
                    return;
                }

                self.saving = true;
                var data = JSON.stringify({
                    action: "addRoom",
                    token: util.getParams('token'),
                    lang: util.langStyle(),
                    "tags": tags,
                    "IntroImgs": imgs,
                    "roomDetail": {
                        "HotelID": self.hotelId,
                        "Description": self.room.Description,
                        "RoomTypeName": self.room.RoomTypeName
                    }
                })
                console&&console.log(data);
                $http({
                    method: 'POST',
                    url: util.getApiUrl('room', '', 'server'),
                    data: data
                }).then(function successCallback(response) {
                    var data = response.data;
                    if (data.rescode == '200') {
                        alert('添加成功')
                        $state.reload();
                    } else {
                        alert('添加失败' + data.rescode + ' ' + data.errInfo);
                    }
                }, function errorCallback(response) {
                    alert(response.status + ' 服务器出错');
                }).finally(function(e) {
                    self.saving = false;
                });
            };

            self.clickUpload = function(e) {
              setTimeout(function() {
                  document.getElementById(e).click();
              }, 0);
            }

            function Imgs(imgList, single) {
                this.initImgList = imgList;
                this.data = [];
                this.maxId = 0;
                this.single = single?true:false;
            }

            Imgs.prototype = {
                initImgs: function() {
                    var l = this.initImgList;
                    for (var i =0; i < l.length; i++) {
                        this.data[i] = {"src": l[i].ImageURL, "fileSize":l[i].ImageSize, "id": this.maxId++, "progress": 100};
                    }
                },
                deleteById: function(id) {
                    var l = this.data;
                    for(var i = 0; i <l.length; i++) {
                        if (l[i].id == id) {
                            // 如果正在上传，取消上传
                            if(l[i].progress < 100 && l[i].progress != -1) {
                                l[i].xhr.abort();
                            }
                            l.splice(i, 1);
                            break;
                        }
                    }
                },

                add : function (xhr, fileName, fileSize) {
                  this.data.push({
                    "xhr": xhr,
                    "fileName": fileName,
                    "fileSize": fileSize,
                    "progress": 0,
                    "id": this.maxId
                  });
                  return this.maxId++;
                },

                update : function (id, progress, leftSize, fileSize) {
                  for(var i = 0; i < this.data.length; i++) {
                    var f = this.data[i];
                    if(f.id === id) {
                      f.progress = progress;
                      f.leftSize = leftSize;
                      f.fileSize = fileSize;
                      break;
                    }
                  }
                },

                setSrcSizeByXhr: function(xhr, src, size) {
                    for (var i =0; i< this.data.length; i++) {
                        if(this.data[i].xhr == xhr) {
                            this.data[i].src = src;
                            this.data[i].fileSize = size;
                            break;
                        }
                    }
                },

                uploadFile: function(e, o) {

                    // 如果这个对象只允许上传一张图片
                    if(this.single) {
                        // 删除第二张以后的图片
                        for(var i = 1; i < this.data.length; i++) {
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
                          $scope.$apply(function(){
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
                            $scope.$apply(function(){
                              o.setSrcSizeByXhr(xhr, ret.upload_path, ret.size);
                              // 如果这个对象只允许上传一张图片
                              if(o.single) {
                                // 删除第一站图片
                                o.deleteById(o.data[0].id);
                              }
                            });
                        },
                        function(xhr) {
                            $scope.$apply(function(){
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

    .controller('roomEditPriceController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'util',
        function ($scope, $state, $http, $stateParams, $filter, util) {
            var self = this;
            self.init = function () {
                self.hotelId = $scope.app.maskParams.hotelId;
                self.roomId = $scope.app.maskParams.roomId;
            }

            self.cancel = function () {
                $scope.app.maskUrl = '';
            }
        }
    ])

    .controller('roomEditNumController', ['$scope', '$state', '$http', '$stateParams', '$filter', 'util',
        function ($scope, $state, $http, $stateParams, $filter, util) {
            var self = this;
            self.init = function () {
                self.hotelId = $scope.app.maskParams.hotelId;
                self.roomId = $scope.app.maskParams.roomId;
            }

            self.cancel = function () {
                $scope.app.maskUrl = '';
            }
        }
    ])
})();
