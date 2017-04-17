'use strict';

(function () {
    var app = angular.module('app.member-card-controllers', [])
        //会员信息管理列表
        .controller('memberListController', ['$scope', '$filter', '$q', '$state', '$http', '$stateParams', 'NgTableParams', 'util',
            function ($scope, $filter, $q, $state, $http, $stateParams, NgTableParams, util) {
                var self = this;

                self.init = function () {
                    self.langStyle = util.langStyle();
                    self.multiLang = util.getParams('editLangs');
                    self.getMemberInfo();
                }
                // 获取会员用户信息列表--借用微信借口
                self.getMemberInfo = function() {
                    self.noData = false;
                    self.loading = true;
                    self.tableParams = new NgTableParams({
                        page: 1,
                        count: 15,
                        url: ''
                    }, {
                        counts: [],
                        getData: function(params) {
                            var data = {
                                "action": "getWxUserInfo",//测试用微信借口替代
                                "token": util.getParams("token"),
                                "lang": self.langStyle
                            }
                            var paramsUrl = params.url();
                            data.per_page = paramsUrl.count - 0;
                            data.page = paramsUrl.page - 0;
                            data = JSON.stringify(data);
                            return $http({
                                method: $filter('ajaxMethod')(),
                                url: util.getApiUrl('devinfo', 'shopList', 'server'),
                                data: data
                            }).then(function successCallback(data, status, headers, config) {
                                if (data.data.rescode == '200') {
                                    if (data.data.total == 0) {
                                        self.noData = true;
                                    }
                                    params.total(data.data.total);
                                    return data.data.userinfo;
                                } else if (msg.rescode == '401') {
                                    alert('访问超时，请重新登录');
                                    $location.path("pages/login.html");
                                } else {
                                    alert(data.rescode + ' ' + data.errInfo);
                                }

                            }, function errorCallback(data, status, headers, config) {
                                alert(response.status + ' 服务器出错');
                            }).finally(function(value) {
                                self.loading = false;
                            })
                        }
                    });
                }
                self.editScores = function () {
                    $scope.app.maskParams = {};
                    $scope.app.showHideMask(true, 'pages/memberCard/editScores.html');
                }

                self.editLevels = function () {
                    $scope.app.maskParams = {};
                    $scope.app.showHideMask(true, 'pages/memberCard/editLevels.html');
                }

                self.memberDetail = function () {
                    $scope.app.maskParams = {};
                    $scope.app.showHideMask(true, 'pages/memberCard/memberDetail.html');
                }
            }
        ])
        //会员卡
        .controller('memberCardListController', ['$scope', '$filter', '$q', '$state', '$http', '$stateParams', 'NgTableParams', 'util',
            function ($scope, $filter, $q, $state, $http, $stateParams, NgTableParams, util) {
                var self = this;

                self.init = function () {
                    self.langStyle = util.langStyle();
                    self.multiLang = util.getParams('editLangs');
                    self.getMemberCardInfo();
                }
                // 获取会员卡信息列表--借用微信借口
                self.getMemberCardInfo = function() {
                    self.noData = false;
                    self.noCreated = false;
                    self.loading = true;
                    self.tableParams = new NgTableParams({
                        page: 1,
                        count: 15000,//会员等级信息页面后台未分页
                        url: ''
                    }, {
                        counts: [],
                        getData: function(params) {
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
                                    self.noCreated = false;
                                    if (data.data.data.total == 0) {
                                        self.noData = true;
                                    }
                                    params.total(data.data.data.total);
                                    return data.data.data.level_list;
                                } else if (data.data.rescode == '301') {
                                    self.noCreated = true;
                                } else {
                                    alert(data.data.rescode + ' ' + data.data.errInfo);
                                }

                            }, function errorCallback(data, status, headers, config) {
                                alert(response.status + ' 服务器出错');
                            }).finally(function(value) {
                                self.loading = false;
                            })
                        }
                    });
                }

                self.addLevel = function () {
                    // 新建等级
                    $scope.app.maskParams = {};
                    $scope.app.showHideMask(true, 'pages/memberCard/addLevel.html');
                }

                self.configUpgrade = function () {
                    $scope.app.maskParams = {};
                    $scope.app.showHideMask(true, 'pages/memberCard/configUpgrade.html');
                }

                self.editMemberCard = function () {
                    $scope.app.maskParams = {};
                    $scope.app.showHideMask(true, 'pages/memberCard/editMemberCard.html');
                }

                self.configMemberCard = function () {
                    // 配置
                    $scope.app.maskParams = {};
                    $scope.app.showHideMask(true, 'pages/memberCard/configMemberCard.html');
                }

            }
        ])
        //会员管理
        .controller('memberCardController', ['$scope', '$filter', '$q', '$state', '$http', '$stateParams', 'NgTableParams', 'util',
            function ($scope, $filter, $q, $state, $http, $stateParams, NgTableParams, util) {
                var self = this;

                self.init = function () {

                }

            }
        ])

        //调分
        .controller('editScoresController', ['$scope', '$filter', '$q', '$state', '$http', '$stateParams', 'util',
            function ($scope, $filter, $q, $state, $http, $stateParams, util) {
                var self = this;

                self.init = function () {

                }

                self.submit = function () {

                }

                self.close = function () {
                    $scope.app.showHideMask(false);
                }

            }
        ])
        //调级
        .controller('editLevelsController', ['$scope', '$filter', '$q', '$state', '$http', '$stateParams', 'util',
            function ($scope, $filter, $q, $state, $http, $stateParams, util) {
                var self = this;
                // self.form=document.forms['levelsEditForm'];
                // console && console.log(self.form);
                // self.form.selection=document.forms['levelsEditForm'].elements['selectionLevel'];
                // console && console.log(self.form.selection);
                // self.form.selectedIndex=document.getElementById('selectionLevel').selectedIndex;
                // console && console.log(self.form.selectedIndex);
                self.init = function () {
                    self.form = {};
                    console && console.log(self.form.selectedIndex);
                }

                self.submit = function () {

                }

                self.close = function () {
                    $scope.app.showHideMask(false);
                }

            }
        ])
        //新建会员卡等级
        .controller('addLevelController', ['$scope', '$filter', '$q', '$state', '$http', '$stateParams', 'util',
            function ($scope, $filter, $q, $state, $http, $stateParams, util) {
                var self = this;

                self.init = function () {
                    self.t=true;//测试数据
                }

                self.submit = function () {

                }

                self.close = function () {
                    $scope.app.showHideMask(false);
                }

            }
        ])
        //会员卡配置详情
        .controller('editMemberCardController', ['$scope', '$filter', '$q', '$state', '$http', '$stateParams', 'util',
            function ($scope, $filter, $q, $state, $http, $stateParams, util) {
                var self = this;

                self.init = function () {

                }

                self.submit = function () {

                }

                self.close = function () {
                    $scope.app.showHideMask(false);
                }

            }
        ])
        //微信-会员卡-等级-地址配置
        .controller('configMemberCardController', ['$scope', '$filter', '$q', '$state', '$http', '$stateParams', 'util',
            function ($scope, $filter, $q, $state, $http, $stateParams, util) {
                var self = this;

                self.init = function () {

                }

                self.submit = function () {

                }

                self.close = function () {
                    $scope.app.showHideMask(false);
                }

            }
        ])
})();
