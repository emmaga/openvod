'use strict';

(function () {
    var app = angular.module('app.member-card-controllers', [])
    //会员信息管理列表
        .controller('memberListController', ['$scope', '$filter', '$state', '$http', '$stateParams', 'NgTableParams', 'util',
            function ($scope, $filter, $state, $http, $stateParams, NgTableParams, util) {
                var self = this;

                self.init = function () {
                    self.langStyle = util.langStyle();
                    self.multiLang = util.getParams('editLangs');
                    self.getMemberInfo();
                }
                // 获取会员用户信息列表
                self.getMemberInfo = function () {
                    self.noData = false;
                    self.loading = true;
                    self.tableParams = new NgTableParams({
                        page: 1,
                        count: 15,
                        url: ''
                    }, {
                        counts: [],
                        getData: function (params) {
                            var data = {
                                "action": "memberUser",
                                "token": util.getParams("token"),
                                "lang": self.langStyle
                            }
                            var paramsUrl = params.url();
                            // data.per_page = paramsUrl.count - 0;
                            data.count = paramsUrl.count - 0;
                            data.page = paramsUrl.page - 0;
                            data = JSON.stringify(data);
                            return $http({
                                method: $filter('ajaxMethod')(),
                                url: util.getApiUrl('usercard', '', 'server'),
                                data: data
                            }).then(function successCallback(data, status, headers, config) {
                                // console && console.dir(data);
                                if (data.data.rescode == '200') {
                                    if (data.data.total == 0) {
                                        self.noData = true;
                                    }
                                    params.total(data.data.total);
                                    // 解析其他激活选填字段(ExtendInfo)
                                    for (var i = 0; i < data.data.data.length; i++) {
                                        // console && console.log(i,data.data.data[i].ExtendInfo);
                                        if (data.data.data[i].ExtendInfo) {
                                            data.data.data[i].extend = JSON.parse(data.data.data[i].ExtendInfo);
                                            // console && console.dir(data.data.data[i].extend);
                                        }
                                    }
                                    $scope.app.maskParams = {"data":data.data.data};

                                    // for (var i = 0; i < data.data.data.length; i++) {
                                    //     // console && console.log(i,data.data.data[i].ExtendInfo);
                                    //     if (data.data.data[i].ExtendInfo) {
                                    //         var extendInfo = JSON.parse(data.data.data[i].ExtendInfo);
                                    //         // console && console.dir(extendInfo);
                                    //         for (var j = 0, msg = ''; j < extendInfo.length; j++) {
                                    //             // console && console.dir(extendInfo[i]);
                                    //             var list = {
                                    //                 'USER_FORM_INFO_FLAG_MOBILE': '手机号',
                                    //                 'USER_FORM_INFO_FLAG_NAME': '姓名',
                                    //                 'USER_FORM_INFO_FLAG_BIRTHDAY': '生日',
                                    //                 'USER_FORM_INFO_FLAG_IDCARD': '身份证',
                                    //                 'USER_FORM_INFO_FLAG_EMAIL': '邮箱',
                                    //                 'USER_FORM_INFO_FLAG_DETAIL_LOCATION': '详细地址',
                                    //                 'USER_FORM_INFO_FLAG_EDUCATION_BACKGROUND': '教育背景',
                                    //                 'USER_FORM_INFO_FLAG_CAREER': '职业',
                                    //                 'USER_FORM_INFO_FLAG_INDUSTRY': '行业',
                                    //                 'USER_FORM_INFO_FLAG_INCOME': '收入',
                                    //                 'USER_FORM_INFO_FLAG_HABIT': '兴趣爱好'
                                    //             };
                                    //             // console && console.dir(list[extendInfo[i].name]);
                                    //             msg += list[extendInfo[j].name];
                                    //             msg += ':';
                                    //             if (extendInfo[j].value_list.length == 0) {
                                    //                 msg += extendInfo[j].value;
                                    //             } else {
                                    //                 for (var k = 0; k < extendInfo[j].value_list.length; k++) {
                                    //                     msg += extendInfo[j].value_list[k];
                                    //                     if (k < len - 1) {
                                    //                         msg += '、';
                                    //                     }
                                    //                 }
                                    //             }
                                    //             msg += ';';
                                    //             data.data.data[i].extend = msg;
                                    //         }
                                    //     }
                                    // }
                                    // $scope.app.maskParams = {"data":data.data.data};
                                    return data.data.data;
                                }
                                // else if (msg.rescode == '401') {
                                //     alert('访问超时，请重新登录');
                                //     $location.path("pages/login.html");
                                // }
                                else {
                                    alert(data.rescode + ' ' + data.errInfo);
                                }

                            }, function errorCallback(data, status, headers, config) {
                                alert(response.status + ' 服务器出错');
                            }).finally(function (value) {
                                self.loading = false;
                            })
                        }
                    });
                }

                self.editScores = function (row) {
                    // console && console.log($scope.app.maskParams.data);
                    $scope.app.maskParams = {"data": row};
                    $scope.app.showHideMask(true, 'pages/memberCard/editScores.html');
                }

                self.editLevels = function (row) {
                    // 获取会员卡信息列表
                    self.getMemberCardInfo = function () {
                        self.tableParams = new NgTableParams({
                            page: 1,
                            count: 15000,//会员等级信息页面后台未分页
                            url: ''
                        }, {
                            counts: [],
                            getData: function (params) {
                                var data = {
                                    "action": "memberInfo",
                                    "token": util.getParams("token"),
                                    "lang": self.langStyle
                                }
                                var paramsUrl = params.url();
                                // console &&console.dir(paramsUrl);
                                data.per_page = paramsUrl.count - 0;
                                data.page = paramsUrl.page - 0;
                                data = JSON.stringify(data);
                                return $http({
                                    method: $filter('ajaxMethod')(),
                                    url: util.getApiUrl('membercard', '', 'server'),
                                    data: data
                                }).then(function successCallback(data, status, headers, config) {
                                    // console && console.dir(data);
                                    if (data.data.rescode == '200') {
                                        // self.noCreated = false;
                                        if (data.data.data.total == 0) {
                                            // self.noData = true;
                                        }
                                        $scope.app.maskParams = {"data": data.data.data.level_list,"row": row};
                                        // params.total(data.data.data.total);
                                        $scope.app.showHideMask(true, 'pages/memberCard/editLevels.html');
                                    } else if (data.data.rescode == '301') {
                                        // self.noCreated = true;
                                    } else {
                                        alert(data.data.rescode + ' ' + data.data.errInfo);
                                    }

                                }, function errorCallback(data, status, headers, config) {
                                    alert(response.status + ' 服务器出错');
                                }).finally(function (value) {
                                })
                            }
                        });
                    }
                    self.getMemberCardInfo();
                }

                self.memberDetail = function (row) {
                    $scope.app.maskParams = {"data": row};
                    $scope.app.showHideMask(true, 'pages/memberCard/memberDetail.html');
                }
            }
        ])
        //会员卡
        .controller('memberCardListController', ['$scope', '$filter', '$state', '$http', '$stateParams', 'NgTableParams', 'util',
            function ($scope, $filter, $state, $http, $stateParams, NgTableParams, util) {
                var self = this;

                self.init = function () {
                    self.langStyle = util.langStyle();
                    self.multiLang = util.getParams('editLangs');
                    self.getMemberCardInfo();
                }
                // 获取会员卡信息列表
                self.getMemberCardInfo = function () {
                    self.noData = false;//默认有数据
                    self.noCard = true; //默认用户未创建会员卡
                    self.loading = true;//默认显示加载按钮
                    self.tableParams = new NgTableParams({
                        page: 1,
                        count: 15000,//会员等级信息页面后台未分页
                        url: ''
                    }, {
                        counts: [],
                        getData: function (params) {
                            var data = {
                                "action": "memberInfo",
                                "token": util.getParams("token"),
                                "lang": self.langStyle
                            }
                            var paramsUrl = params.url();
                            // console &&console.dir(paramsUrl);
                            data.per_page = paramsUrl.count - 0;
                            data.page = paramsUrl.page - 0;
                            data = JSON.stringify(data);
                            return $http({
                                method: $filter('ajaxMethod')(),
                                url: util.getApiUrl('membercard', '', 'server'),
                                data: data
                            }).then(function successCallback(data, status, headers, config) {
                                console && console.dir(data);
                                if (data.data.rescode == '200') {
                                    self.noCard = false;
                                    console && console.log(data.data.data.total);
                                    if (data.data.data.total == 0) {
                                        self.noData = true;
                                    }
                                    $scope.app.maskParams = {"data": data.data.data.level_list};
                                    params.total(data.data.data.total);
                                    return data.data.data.level_list;
                                } else if (data.data.rescode == '310') {

                                } else {
                                    alert(data.data.rescode + ' ' + data.data.errInfo);
                                }
                            }, function errorCallback(data, status, headers, config) {
                                alert(response.status + ' 服务器出错');
                            }).finally(function (value) {
                                self.loading = false;
                            })
                        }
                    });
                }

                self.addLevel = function () {
                    $scope.app.maskParams = {};
                    $scope.app.showHideMask(true, 'pages/memberCard/addLevel.html');
                }

                self.configUpgrade = function () {
                    $scope.app.maskParams = {};
                    $scope.app.showHideMask(true, 'pages/memberCard/configUpgrade.html');
                }

                self.editMemberCard = function (row) {
                    $scope.app.maskParams = {"row": row};
                    $scope.app.showHideMask(true, 'pages/memberCard/editMemberCard.html');
                }

                self.configMemberCard = function () {
                    // 配置
                    // 查看可绑定的升级策略
                    var data = JSON.stringify({
                        "action": "upgradeStrategy_list",
                        "token": util.getParams("token"),
                        "lang": self.langStyle
                    });
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('membercard', '', 'server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        if (data.data.rescode == "200") {
                            // 获取会员卡自定义菜单
                            self.get_custom_menu=function(custom){
                                $scope.app.maskParams = {"data":custom};
                                for(var i=0;i<custom.length;i++){
                                    if(custom[i].StrategyName=='JIFEN'){
                                        var data = JSON.stringify({
                                            "action": "get_custom_menu",
                                            "token": util.getParams("token"),
                                            "lang": self.langStyle,
                                            "ID": custom[i].ID
                                        });
                                        $http({
                                            method: 'POST',
                                            url: util.getApiUrl('membercard', '', 'server'),
                                            data: data
                                        }).then(function successCallback(data, status, headers, config) {
                                            if (data.data.rescode == "200") {
                                                console && console.dir(data.data.data);
                                                $scope.app.maskParams = {"data":custom,"value":data.data.data.Value};
                                                //该同步请求依赖AJAX的请求数据，故需放在AJAX请求成功的回调函数中
                                                $scope.app.showHideMask(true, 'pages/memberCard/configMemberCard.html');
                                            } else {
                                                // alert( data.data.rescode + '，' + data.data.errInfo);
                                            }
                                        }, function errorCallback(data, status, headers, config) {
                                            alert('连接服务器出错');
                                        }).finally(function (value) {
                                        });
                                    }
                                }
                            }
                            self.get_custom_menu(data.data.data);
                        } else {
                            alert( data.data.rescode + '，' + data.data.errInfo);
                        }
                    }, function errorCallback(data, status, headers, config) {
                        alert('连接服务器出错');
                    }).finally(function (value) {
                    });
                }
            }
        ])
        //会员管理
        .controller('memberCardController', ['$scope', '$filter',  '$state', '$http', '$stateParams', 'NgTableParams', 'util',
            function ($scope, $filter, $state, $http, $stateParams, NgTableParams, util) {
                var self = this;

                self.init = function () {

                }

            }
        ])
        //调分
        .controller('editScoresController', ['$scope', '$filter',  '$state', '$http', '$stateParams', 'util',
            function ($scope, $filter, $state, $http, $stateParams, util) {
                var self = this;

                self.init = function () {
                    self.OpenId =$scope.app.maskParams.data.OpenId;
                    self.Bouns =$scope.app.maskParams.data.Bouns;
                    self.loading=false;
                }
                self.submit = function () {
                    self.saving = true;
                    self.loading=true;
                    // 减少/增加积分
                    var data = JSON.stringify({
                        "action": "user_modify_bouns",
                        "token": util.getParams("token"),
                        "lang": self.langStyle,
                        "open_id": self.OpenId,
                        "bouns_add": self.added
                    });
                    $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('usercard', '', 'server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        self.loading=false;
                        if (data.data.rescode == "200") {
                            alert('积分调整成功');
                            $state.reload();
                        } else {
                            alert('积分调整失败，错误编码：' + data.data.rescode + '，' + data.data.errInfo);
                        }
                    }, function errorCallback(data, status, headers, config) {
                        alert('连接服务器出错');
                    }).finally(function (value) {
                        self.saving = false;
                    });
                }

                self.close = function () {
                    $scope.app.showHideMask(false);
                }

            }
        ])
        //调级
        .controller('editLevelsController', ['$scope', '$filter',  '$state', '$http', '$stateParams', 'util',
            function ($scope, $filter,  $state, $http, $stateParams, util) {
                var self = this;

                self.init = function () {
                    self.loading=false;
                    self.data=$scope.app.maskParams.data;
                    self.row=$scope.app.maskParams.row;

                    self.levelCode=self.row.LevelId;
                    // console && console.dir(self.data);
                    // console && console.dir(self.row);
                    // console && console.dir(self.levelCode);
                }

                self.submit = function () {
                    // 调级
                    self.saving = true;
                    self.loading=true;
                    var data = JSON.stringify({
                        "action": "user_modify_level",
                        "token": util.getParams("token"),
                        "lang": self.langStyle,
                        "open_id": self.row.OpenId,
                        "level_id": self.levelCode
                    });
                    // alert('等级调整中，请稍候...');
                    $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('usercard', '', 'server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        // console && console.dir(data);
                        self.loading=false;
                        if (data.data.rescode == "200") {
                            alert('等级调整成功');
                            $state.reload();
                        } else {
                            alert('等级调整失败，错误编码：' + data.data.rescode + '，' + data.data.errInfo);
                        }
                    }, function errorCallback(data, status, headers, config) {
                        alert('连接服务器出错');
                    }).finally(function (value) {
                        self.saving = false;
                    });
                }

                self.close = function () {
                    $scope.app.showHideMask(false);
                    $state.reload();
            }

            }
        ])
        // 详情
        .controller('memberDetailController', ['$scope', '$filter',  '$state', '$http', '$stateParams', 'util',
            function ($scope, $filter,  $state, $http, $stateParams, util) {
                var self = this;

                self.init = function () {
                    // console && console.log($scope.app.maskParams.data);
                    self.data=$scope.app.maskParams.data;
                    self.extend=JSON.parse(self.data.ExtendInfo);
                    //测试...
                    // self.extend=[
                    //     { name:"USER_FORM_INFO_FLAG_MOBILE",value:"18516272529",value_list:[]},
                    //     { name:"USER_FORM_INFO_FLAG_HABIT",value:"",value_list:["篮球","音乐","登山"]}
                    //     ];
                    //...数据
                    // console && console.log(self.extend);
                }

                self.submit = function () {

                }

                self.close = function () {
                    $scope.app.showHideMask(false);
                }

            }
        ])
        // 新建会员卡等级
        .controller('addLevelController', ['$scope', '$filter',  '$state', '$http', '$stateParams', 'util',
            function ($scope, $filter,  $state, $http, $stateParams, util) {
                var self = this;

                self.init = function () {
                    self.langStyle = util.langStyle();
                    // 表单提交 等级信息
                    self.form = {};
                }
                self.submit = function () {
                    self.saving = true;
                    // 新建等级
                    if(!self.form.RightsInfo){self.form.RightsInfo='';}
                    var data = JSON.stringify({
                        "action": "card_add_level",
                        "token": util.getParams("token"),
                        "lang": self.langStyle,
                        "level": self.form.level,
                        "level_name": self.form.level_name,
                        "RightsInfo": self.form.RightsInfo
                    });
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('membercard', '', 'server'),
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
                self.close = function () {
                    $scope.app.showHideMask(false);
                }
            }
        ])
        //会员卡配置详情
        .controller('editMemberCardController', ['$scope', '$filter', '$state', '$http', '$stateParams', 'util',
            function ($scope, $filter, $state, $http, $stateParams, util) {
                var self = this;

                self.init = function () {
                    self.langStyle = util.langStyle();
                    self.levelCard = $scope.app.maskParams.row;
                    self.roomDiscount = self.initDiscount(self.levelCard);
                    self.roomBounsRate = self.initBouns(self.levelCard);
                    self.accumulationUpgrade = self.initUpgrade(self.levelCard);
                    console && console.dir(self.levelCard);
                    console && console.dir(self.levelCard.ID);
                    console && console.dir(self.levelCard.Level);
                }
                //初始化预订折扣数据
                self.initDiscount = function (levelCard) {
                    for (var i = 0; i < levelCard.discount.length; i++) {
                        if (levelCard.discount[i].type == 'Room') {
                            self.roomDiscount = levelCard.discount[i].Discount;
                        }
                    }
                    // console && console.dir(self.roomDiscount);
                    return Number(self.roomDiscount);
                };
                //修改预订折扣数据
                self.editDiscount = function (levelCard) {
                    levelCard.discount = [{"name": "Room", "value": Number(self.roomDiscount)}];
                    // console && console.dir(self.isEditDiscount);
                    // if(levelCard.discount.length == 0){
                    //     // self.levelCard.discount=[{"type":"Room","Discount":(self.roomDiscount).toFixed(2)}];
                    //     self.levelCard.discount=[{"name":"Room","
                    // vaule":(self.roomDiscount).toFixed(2)}];
                    //     console && console.dir(self.roomDiscount);
                    //     self.isEditDiscount=true;
                    // }else{
                    //     for(var i=0;i<levelCard.discount.length;i++){
                    //         if(levelCard.discount[i].type=='Room'){
                    //             // levelCard.discount[i].Discount=parseInt(self.roomDiscount);
                    //             levelCard.discount=[{"name":"Room","vaule":(self.roomDiscount).toFixed(2)}];
                    //             console && console.dir(self.roomDiscount);
                    //             self.isEditDiscount=true;
                    //         }
                    //     }
                    // }
                    // self.levelCard.discount=levelCard.discount;
                }
                //初始化预订赚积分倍率
                self.initBouns = function (levelCard) {
                    for (var i = 0; i < levelCard.Bouns.length; i++) {
                        if (levelCard.Bouns[i].type == 'Room') {
                            self.roomBounsRate = levelCard.Bouns[i].BounsRate;
                        }
                    }
                    return Number(self.roomBounsRate);
                };
                //修改预订赚积分倍率
                self.editBouns = function (levelCard) {
                    self.levelCard.Bouns = [{"name": "Room", "value": Number(self.roomBounsRate)}];
                    // console && console.dir(self.isEditBouns);
                    // if(levelCard.Bouns.length == 0){
                    //     self.levelCard.Bouns=[{"type":"Room","Discount":parseInt(self.roomBounsRate)}];
                    //     console && console.dir(self.roomBounsRate);
                    //     self.isEditBouns=true;
                    // }else{
                    //     for(var i=0;i<levelCard.Bouns.length;i++){
                    //         if(levelCard.Bouns[i].type=='Room'){
                    //             levelCard.Bouns[i].BounsRate=parseInt(self.roomBounsRate);
                    //             console && console.dir(self.roomBounsRate);
                    //             self.isEditBouns=true;
                    //         }
                    //     }
                    // }
                    // self.levelCard.Bouns=levelCard.Bouns;
                    // console && console.dir(self.isEditBouns);
                }
                //初始化积分升级条件
                self.initUpgrade = function (levelCard) {
                    for (var i = 0; i < levelCard.UpgradeStrategy.length; i++) {
                        if (levelCard.UpgradeStrategy[i].StrategyName == 'JIFEN') {
                            self.accumulationUpgrade = levelCard.UpgradeStrategy[i].require;
                        }
                    }
                    return Number(self.accumulationUpgrade);
                };
                //修改积分升级条件
                self.editUpgrade = function (levelCard) {
                    self.levelCard.UpgradeStrategy = [{"StrategyName": 'JIFEN',"value": Number(self.accumulationUpgrade)}];
                }

                self.submit = function () {
                    self.saving = true;
                    var data = JSON.stringify({
                        "action": "level_detail_modify",
                        "token": util.getParams("token"),
                        "lang": self.langStyle,
                        "LevelID": self.levelCard.ID,
                        "Level": self.levelCard.Level,
                        "Name": self.levelCard.Name,
                        "RightsInfo": self.levelCard.RightsInfo,
                        "Discount": self.levelCard.discount,
                        "Bouns": self.levelCard.Bouns,
                        "UpgradeStrategy": self.levelCard.UpgradeStrategy
                    });

                    $http({
                        method: 'POST',
                        url: util.getApiUrl('membercard', '', 'server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        if (data.data.rescode == "200") {
                            alert('设置成功');
                            $state.reload();
                        } else {
                            alert('设置失败，错误编码：' + data.data.rescode + '，' + data.data.errInfo);
                        }
                    }, function errorCallback(data, status, headers, config) {
                        alert('连接服务器出错');
                    }).finally(function (value) {
                        self.saving = false;
                    });
                }

                self.close = function () {
                    $scope.app.showHideMask(false);
                    $state.reload();
                }
            }
        ])
        // 会员卡新增/移除升级策略/微信-会员卡-等级-地址配置
        .controller('configMemberCardController', ['$scope', '$filter', '$state', '$http', '$stateParams', 'util',
            function ($scope, $filter, $state, $http, $stateParams, util) {
                var self = this;

                self.init = function () {
                    self.loading=false;
                    self.langStyle = util.langStyle();
                    self.upgradeStrategy_list=$scope.app.maskParams.data;
                    self.isSelected=true;
                    self.value=$scope.app.maskParams.value;
                    console && console.log($scope.app.maskParams.value);
                }

                //当升级策略被修改时发起请求
                self.upgradeStrategyChange=function(row){
                    console && console.dir(row);
                    var data = JSON.stringify({
                        "action": "card_upgradeStrategy_modify",
                        "token": util.getParams("token"),
                        "lang": self.langStyle,
                        "UpgradeStrategyID": parseInt(row.ID),
                        "is_selected": self.isSelected
                    });
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('membercard', '', 'server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        if (data.data.rescode == "200") {
                            alert("策略修改成功！");

                            //该同步请求依赖AJAX的请求数据，故需放在AJAX请求成功的回调函数中
                            $scope.app.showHideMask(true, 'pages/memberCard/configMemberCard.html');
                        } else {
                            alert( data.data.rescode + '，' + data.data.errInfo);
                        }
                    }, function errorCallback(data, status, headers, config) {
                        alert('连接服务器出错');
                    }).finally(function (value) {
                    });
                }


                self.submit = function () {
                    var list={
                        'grade': 'FIELD_NAME_TYPE_LEVEL',           //'等级'
                        'preferential': 'FIELD_NAME_TYPE_COUPON',   //'优惠'
                        'stamp': 'FIELD_NAME_TYPE_STAMP',           //'印花'
                        'rebate':'FIELD_NAME_TYPE_DISCOUNT',        //'折扣'
                        'achievemen': 'FIELD_NAME_TYPE_ACHIEVEMEN',//'成就'
                        'mileage': 'FIELD_NAME_TYPE_MILEAGE'        //'里程'
                    }
                    self.saving = true;
                    self.loading= true;
                    var data = JSON.stringify({
                        "action": "binding_custom_menu",
                        "token": util.getParams("token"),
                        "lang": self.langStyle,
                        "ID": 1,
                        "Name": list.grade,
                        "Value": self.configurationLink
                    });
                    // alert('配置中，请稍候...');
                    $http({
                        method: $filter('ajaxMethod')(),
                        url: util.getApiUrl('membercard', '', 'server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        self.loading=false;
                        if (data.data.rescode == "200") {
                            alert('配置成功');
                            $state.reload();
                        } else {
                            alert('配置失败，错误编码：' + data.data.rescode + '，' + data.data.errInfo);
                        }
                    }, function errorCallback(data, status, headers, config) {
                        alert('连接服务器出错');
                    }).finally(function (value) {
                        self.saving = false;
                    });
                }

                self.close = function () {
                    $scope.app.showHideMask(false);
                    $state.reload();
                }

            }
        ])
})();
