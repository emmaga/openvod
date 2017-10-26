'use strict';
(function () {
    var app = angular.module('app.auth', [])
        .controller('authController', ['$scope', '$http', '$state', 'util', '$filter', 'NgTableParams', '$location',
            function ($scope, $http, $state, util, $filter, NgTableParams, $location) {
                var self = this;
                self.init = function () {

                }
            }
        ])
        /**
         * ------权限设置------
         */
        .controller('authSetController', ['$scope', '$http', '$state', 'util', '$filter', 'NgTableParams', '$location', 'userRoleUtil',
            function ($scope, $http, $state, util, $filter, NgTableParams, $location, userRoleUtil) {
                var self = this;
                self.init = function () {
                    self.stepIndex = 0
                    self.selectType = 'User'
                    self.target = []
                    self.targetID = []
                    self.checkboxes = { items: {} }
                    self.tableParams = userRoleUtil.loadUserList(0, self)
                    self.loadAuthList()
                    // 全选
                    $scope.$watch('vm.checkboxes.checked', function (value) {
                        console.log(value)
                        if (self.tableData) {
                            R.forEach(function (t) {
                                self.checkboxes.items[t[self.selectType + 'Name']] = value
                            })(self.tableData)
                        }
                    }, true);

                    // 设置类型
                    $scope.$watch('vm.selectType', function (value) {
                        self.checkboxes = { items: {} }
                        if (value == 'User') {
                            self.tableParams = userRoleUtil.loadUserList(0, self)
                        } else {
                            self.tableParams = userRoleUtil.loadRoleList(0, self)
                        }
                    })

                    // 监测勾选对象
                    $scope.$watch('vm.checkboxes.items', function (value) {
                        self.target = []
                        self.targetID = []
                        for (var i in self.checkboxes.items) {
                            if (self.checkboxes.items[i]) {
                                self.target.push(i)
                            }
                        }
                        R.forEach(function (t) {
                            var targetObj = R.find(R.propEq(self.selectType + 'Name', t))(self.tableData)
                            self.targetID.push(targetObj.ID)
                        })(self.target)
                    }, true)
                };
                self.checkTarget = function () {
                    if (self.target.length == 0) {
                        alert("请选择设置对象")
                        return false
                    }
                    return true
                }

                self.nextStep = function () {
                    if (self.checkTarget()) {
                        self.stepIndex++
                    }
                }

                self.prevStep = function () {
                    self.stepIndex--
                }

                self.loadAuthList = function (type) {
                    var data = {
                        "action": "getPrivilegeObjectList",
                        "token": util.getParams("token")
                    }
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('privilege', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var data = response.data;
                        if (data.rescode == '200') {
                            self.authList = Object.keys(data.data)
                            self.authList.sort()
                        } else if (data.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert('加载失败' + data.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert('连接服务器出错，请重新导出');
                    }).finally(function (value) {
                        self.saving = false;
                    });
                }

                self.save = function () {
                    var authObjArray = []
                    for (var m in self.checkedModules) {
                        var obj;
                        if (self.checkedModules[m]) {
                            obj = {
                                "ObjectType": m,
                                "ObjectValues": [-1],
                                "OperationTypes": ["All"]
                            }
                            authObjArray.push(obj)
                        }
                    }
                    var data = {
                        "action": "grants",
                        "token": util.getParams("token"),
                        "data": [{
                            "MasterType": self.selectType.toUpperCase(),
                            "MasterValues": self.targetID,
                            "Object": authObjArray
                        }]
                    }
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('privilege', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var data = response.data;
                        if (data.rescode == '200') {
                            alert('设置成功！')
                            $state.reload();
                        } else if (data.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert('加载失败' + data.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert('连接服务器出错，请重新导出');
                    }).finally(function (value) {
                        self.saving = false;
                    });
                }
            }
        ])
        /**
         * ------权限查看------
         */
        .controller('authViewController', ['$scope', '$http', '$state', 'util', '$filter', 'NgTableParams', '$location', 'userRoleUtil',
            function ($scope, $http, $state, util, $filter, NgTableParams, $location, userRoleUtil) {
                var self = this;
                self.init = function () {
                    self.stepIndex = 0
                    self.selectType = 'User'
                    self.target = []
                    self.targetID = []
                    self.authListHead = []
                    self.selectedAuth = []
                    self.checkboxes = { items: {} }
                    self.selectedIdx = 0
                    self.tableParams = userRoleUtil.loadUserList(0, self, self.loadAuthList)
                    self.checkedAuth = { checked: false, items: {} }
                    // 设置类型
                    $scope.$watch('vm.selectType', function (value) {
                        self.checkboxes = { items: {} }
                        if (value == 'User') {
                            self.tableParams = userRoleUtil.loadUserList(0, self)
                        } else {
                            self.tableParams = userRoleUtil.loadRoleList(0, self)
                        }
                    })

                    // $scope.$watch('vm.checkedAuth.items', function (value) {
                    //     for(var i in value){
                            
                    //         var obj=R.find(R.propEq('0',i-0))(self.authListData)
                    //         var name=obj[4]  // 获取选中对象的对象类型
                    //         console.error(name,value[i])
                            
                    //         var sameNameArray=R.filter(function(t){
                    //             return t[4]==name
                    //         },self.authListData)
                    //         console.error(sameNameArray)

                    //         R.forEach(function(t){
                    //             self.checkedAuth.items[t[0]]=value[i]
                    //         })(sameNameArray)
                    //     }
                    // },true)

                };

                self.checkAll = function (event) {
                    if (self.authListData) {
                        for (var i = 0; i < self.authListData.length; i++) {
                            self.checkedAuth.items[self.authListData[i][0]] = event.target.checked
                        }
                    }
                }

                self.selectSame = function (id,event) {
                    var obj=R.find(R.propEq('0',id-0))(self.authListData)
                    var name=obj[4]  // 获取选中对象的对象类型
                    
                    var sameNameArray=R.filter(function(t){
                        return t[4]==name
                    },self.authListData)
                    console.error(sameNameArray)

                    R.forEach(function(t){
                        self.checkedAuth.items[t[0]]=event.target.checked
                    })(sameNameArray)
                }

                // 加载对应权限列表
                self.loadAuthList = function (id, idx) {
                    self.checkedAuth.items = {}
                    self.selectedIdx = idx
                    var type = self.selectType.toLowerCase()
                    self.targetID = id
                    self.authTableParams = userRoleUtil.loadAuthList(id, type, self)
                }

                self.deleteAuth = function () {
                    self.selectedAuth = []
                    if (self.controlType != 'delete') return
                    for (var i in self.checkedAuth.items) {
                        if (self.checkedAuth.items[i]) {
                            self.selectedAuth.push(i - 0)
                        }
                    }
                    if (confirm("确定取消授权吗？")) {
                        var data = {
                            "action": "revokes",
                            "token": util.getParams("token"),
                            "data": {
                                "IDS": self.selectedAuth
                            }
                        }
                        $http({
                            method: 'POST',
                            url: util.getApiUrl('privilege', '', 'server'),
                            data: data
                        }).then(function successCallback(response) {
                            var data = response.data;
                            if (data.rescode == '200') {
                                alert('取消授权成功！')
                                self.loadAuthList(self.targetID);
                            } else if (data.rescode == '401') {
                                alert('访问超时，请重新登录');
                                $state.go('login');
                            } else {
                                alert('加载失败' + data.errInfo);
                            }
                        }, function errorCallback(response) {
                            alert('连接服务器出错，请重新导出');
                        }).finally(function (value) {
                            self.saving = false;
                        });
                    }
                }
            }
        ])
        // 用户管理
        .controller('userManageController', ['$scope', '$http', '$state', 'util', '$filter', 'NgTableParams', '$location', 'userRoleUtil',
            function ($scope, $http, $state, util, $filter, NgTableParams, $location, userRoleUtil) {
                var self = this;
                self.init = function () {
                    self.tableParams = userRoleUtil.loadUserList(0, self)
                };

                self.addUser = function () {
                    $scope.app.maskParams = {};
                    $scope.app.showHideMask(true, 'pages/auth/addUser.html');
                }

                self.editUser = function (id) {
                    $scope.app.maskParams.userId = id
                    $scope.app.showHideMask(true, 'pages/auth/editUser.html');
                }

                self.editUserRole = function (id) {
                    $scope.app.maskParams.userId = id
                    $scope.app.showHideMask(true, 'pages/auth/editUserRole.html');
                }

                self.deleteUser = function (id) {
                    if (confirm("确定要删除此用户吗？")) {
                        var data = {
                            "action": "delete",
                            "token": util.getParams("token"),
                            "data": {
                                "ID": id
                            }
                        };
                        data = JSON.stringify(data);
                        $http({
                            method: $filter('ajaxMethod')(),
                            url: util.getApiUrl('usermanager', '', 'server'),
                            data: data
                        }).then(function successCallback(data, status, headers, config) {
                            if (data.data.rescode == "200") {
                                alert('删除成功')
                                self.tableParams = userRoleUtil.loadUserList(0, self)
                            } else if (data.data.rescode == "401") {
                                alert('访问超时，请重新登录');
                                $state.go('login');
                            } else {
                                alert('删除失败， ' + data.data.errInfo);
                            }
                        }, function errorCallback(data, status, headers, config) {
                            alert('连接服务器出错')
                        }).finally(function (value) {
                            self.loading = false;
                        });
                    }
                }
            }
        ])
        // 添加用户
        .controller('addUserController', ['$scope', '$filter', '$state', '$http', '$stateParams', 'md5', 'util',
            function ($scope, $filter, $state, $http, $stateParams, md5, util) {
                var self = this;

                self.init = function () {
                    self.langStyle = util.langStyle();
                    // 表单提交 等级信息
                    self.form = {};
                }

                self.submit = function () {
                    var data = JSON.stringify({
                        "action": "add",
                        "token": util.getParams('token'),
                        "data": {
                            "UserName": self.form.userName,
                            "NickName": self.form.nickName,
                            "Email": self.form.email,
                            "Password": md5.createHash(self.form.password)
                        }
                    });
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('usermanager', '', 'server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        if (data.data.rescode == "200") {
                            alert('添加成功');
                            $state.reload();
                        }
                        else if (data.data.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        }
                        else {
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
        // 编辑用户
        .controller('editUserController', ['$scope', '$filter', '$state', '$http', '$stateParams', 'md5', 'util',
            function ($scope, $filter, $state, $http, $stateParams, md5, util) {
                var self = this;

                self.init = function () {
                    self.langStyle = util.langStyle();
                    // 表单提交 等级信息
                    self.form = {};
                    self.getUserInfo();
                }

                self.getUserInfo = function () {
                    var data = JSON.stringify({
                        "action": "get",
                        "token": util.getParams('token'),
                        "data": {
                            "ID": $scope.app.maskParams.userId
                        }
                    });
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('usermanager', '', 'server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        if (data.data.rescode == "200") {
                            self.form.userName = data.data.data.UserName
                            self.form.nickName = data.data.data.NickName
                            self.form.phone = data.data.data.Phone
                            self.form.email = data.data.data.Email
                        }
                        else if (data.data.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        }
                        else {
                            alert('添加失败，错误编码：' + data.data.rescode + '，' + data.data.errInfo);
                        }
                    }, function errorCallback(data, status, headers, config) {
                        alert('连接服务器出错');
                    }).finally(function (value) {
                        self.saving = false;
                    });
                }

                self.submit = function () {
                    var data = JSON.stringify({
                        "action": "edit",
                        "token": util.getParams('token'),
                        "data": {
                            "ID": $scope.app.maskParams.userId,
                            "UserName": self.form.userName,
                            "NickName": self.form.nickName,
                            "Phone": self.form.phone,
                            "Email": self.form.email,
                            "Password": md5.createHash(self.form.password)
                        }
                    });
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('usermanager', '', 'server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        if (data.data.rescode == "200") {
                            alert('修改成功');
                            $state.reload();
                        }
                        else if (data.data.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        }
                        else {
                            alert('修改失败，错误编码：' + data.data.rescode + '，' + data.data.errInfo);
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
        // 管理用户角色
        .controller('editUserRoleController', ['$scope', '$filter', '$state', '$http', '$stateParams', 'md5', 'util', 'userRoleUtil',
            function ($scope, $filter, $state, $http, $stateParams, md5, util, userRoleUtil) {
                var self = this;

                self.init = function () {
                    /**
                     * self.checkedList  初始选中
                     * self.currentList  当前选中
                     * self.allList  所有列表
                     * */
                    self.langStyle = util.langStyle();
                    self.checkboxes = { 'checked': false, items: {} };
                    // 获取列表数据和checkedList
                    self.tableParams = userRoleUtil.loadRoleList($scope.app.maskParams.userId, self)

                    self.addedArray = []
                    self.deletedArray = []
                }

                self.checkAll = function (event) {
                    var value = event.target.checked
                    if (self.tableData) {
                        R.forEach(function (t) {
                            self.checkboxes.items[t.ID] = value
                            if (value) {
                                if (self.checkedList.indexOf(t.ID) < 0 && self.addedArray.indexOf(t.ID) < 0) {
                                    self.addedArray.push(t.ID)
                                }
                                if (self.checkedList.indexOf(t.ID) >= 0 && self.deletedArray.indexOf(t.ID) >= 0) {
                                    var idx1 = self.deletedArray.indexOf(t.ID)
                                    self.deletedArray.splice(idx1, 1)
                                }
                            } else {
                                if (self.checkedList.indexOf(t.ID) >= 0 && self.deletedArray.indexOf(t.ID) < 0) {
                                    self.deletedArray.push(t.ID)
                                }
                                if (self.checkedList.indexOf(t.ID) < 0) {
                                    var idx2 = self.addedArray.indexOf(t.ID)
                                    self.addedArray.splice(idx2, 1)
                                }
                            }
                        })(self.tableData)
                    }
                }

                self.updateArray = function (event, id) {
                    var value = event.target.checked
                    if (self.checkedList.indexOf(id) < 0) {
                        if (value) {
                            self.addedArray.push(id)
                        } else {
                            var idx1 = self.addedArray.indexOf(id)
                            self.addedArray.splice(idx1, 1)
                        }
                    } else {
                        if (value) {
                            var idx2 = self.deletedArray.indexOf(id)
                            self.deletedArray.splice(idx2, 1)
                        } else {
                            self.deletedArray.push(id)
                        }
                    }
                }

                self.submit = function () {
                    var data = JSON.stringify({
                        "action": "updateRoles",
                        "token": util.getParams('token'),
                        "data": {
                            "UserID": $scope.app.maskParams.userId,
                            "AddedRoles": self.addedArray,
                            "DeletedRoles": self.deletedArray
                        }
                    });
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('usermanager', '', 'server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        if (data.data.rescode == "200") {
                            alert('保存成功');
                            $state.reload();
                        }
                        else if (data.data.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        }
                        else {
                            alert('保存失败，错误编码：' + data.data.rescode + '，' + data.data.errInfo);
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
        /**
         *---------------------- 角色管理---------------
         */
        .controller('roleManageController', ['$scope', '$http', '$state', 'util', '$filter', 'NgTableParams', '$location', 'userRoleUtil',
            function ($scope, $http, $state, util, $filter, NgTableParams, $location, userRoleUtil) {
                var self = this;
                self.init = function () {
                    self.tableParams = userRoleUtil.loadRoleList(0, self)
                };

                self.addRole = function () {
                    $scope.app.maskParams = {};
                    $scope.app.showHideMask(true, 'pages/auth/addRole.html');
                }

                self.editRole = function (id) {
                    $scope.app.maskParams.roleId = id
                    $scope.app.showHideMask(true, 'pages/auth/editRole.html');
                }

                self.editRoleUser = function (id) {
                    $scope.app.maskParams.roleId = id
                    $scope.app.showHideMask(true, 'pages/auth/editRoleUser.html');
                }

                self.deleteRole = function (id) {
                    if (confirm("确定要删除此角色吗？")) {
                        var data = {
                            "action": "delete",
                            "token": util.getParams("token"),
                            "data": {
                                "ID": id
                            }
                        };
                        data = JSON.stringify(data);
                        $http({
                            method: $filter('ajaxMethod')(),
                            url: util.getApiUrl('rolemanager', '', 'server'),
                            data: data
                        }).then(function successCallback(data, status, headers, config) {
                            if (data.data.rescode == "200") {
                                alert('删除成功')
                                self.tableParams = userRoleUtil.loadRoleList(0, self)
                            } else if (data.data.rescode == "401") {
                                alert('访问超时，请重新登录');
                                $state.go('login');
                            } else {
                                alert('删除失败， ' + data.data.errInfo);
                            }
                        }, function errorCallback(data, status, headers, config) {
                            alert('连接服务器出错')
                        }).finally(function (value) {
                            self.loading = false;
                        });
                    }
                }
            }
        ])
        //添加角色
        .controller('addRoleController', ['$scope', '$filter', '$state', '$http', '$stateParams', 'md5', 'util',
            function ($scope, $filter, $state, $http, $stateParams, md5, util) {
                var self = this;

                self.init = function () {
                    self.langStyle = util.langStyle();
                    // 表单提交 等级信息
                    self.form = {};
                }

                self.submit = function () {
                    var data = JSON.stringify({
                        "action": "add",
                        "token": util.getParams('token'),
                        "data": {
                            "RoleName": self.form.roleName,
                            "Description": self.form.des
                        }
                    });
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('rolemanager', '', 'server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        if (data.data.rescode == "200") {
                            alert('添加成功');
                            $state.reload();
                        }
                        else if (data.data.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        }
                        else {
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
        //编辑角色
        .controller('editRoleController', ['$scope', '$filter', '$state', '$http', '$stateParams', 'md5', 'util',
            function ($scope, $filter, $state, $http, $stateParams, md5, util) {
                var self = this;

                self.init = function () {
                    self.langStyle = util.langStyle();
                    // 表单提交 等级信息
                    self.form = {};
                    self.getRoleInfo();
                }

                self.getRoleInfo = function () {
                    var data = JSON.stringify({
                        "action": "get",
                        "token": util.getParams('token'),
                        "data": {
                            "ID": $scope.app.maskParams.roleId
                        }
                    });
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('rolemanager', '', 'server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        if (data.data.rescode == "200") {
                            self.form.roleName = data.data.data.RoleName
                            self.form.des = data.data.data.Description
                        }
                        else if (data.data.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        }
                        else {
                            alert('添加失败，错误编码：' + data.data.rescode + '，' + data.data.errInfo);
                        }
                    }, function errorCallback(data, status, headers, config) {
                        alert('连接服务器出错');
                    }).finally(function (value) {
                        self.saving = false;
                    });
                }

                self.submit = function () {
                    var data = JSON.stringify({
                        "action": "edit",
                        "token": util.getParams('token'),
                        "data": {
                            "ID": $scope.app.maskParams.roleId,
                            "Description": self.form.des
                        }
                    });
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('rolemanager', '', 'server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        if (data.data.rescode == "200") {
                            alert('修改成功');
                            $state.reload();
                        }
                        else if (data.data.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        }
                        else {
                            alert('修改失败，错误编码：' + data.data.rescode + '，' + data.data.errInfo);
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
        //管理角色用户
        .controller('editRoleUserController', ['$scope', '$filter', '$state', '$http', '$stateParams', 'md5', 'util', 'userRoleUtil',
            function ($scope, $filter, $state, $http, $stateParams, md5, util, userRoleUtil) {
                var self = this;

                self.init = function () {
                    /**
                     * self.checkedList  初始选中
                     * self.currentList  当前选中
                     * self.allList  所有列表
                     * */
                    self.langStyle = util.langStyle();
                    self.checkboxes = { 'checked': false, items: {} };
                    // 获取列表数据和checkedList
                    self.tableParams = userRoleUtil.loadUserList($scope.app.maskParams.roleId, self)

                    self.addedArray = []
                    self.deletedArray = []
                }

                self.checkAll = function (event) {
                    var value = event.target.checked
                    if (self.tableData) {
                        R.forEach(function (t) {
                            self.checkboxes.items[t.ID] = value
                            if (value) {
                                if (self.checkedList.indexOf(t.ID) < 0 && self.addedArray.indexOf(t.ID) < 0) {
                                    self.addedArray.push(t.ID)
                                }
                                if (self.checkedList.indexOf(t.ID) >= 0 && self.deletedArray.indexOf(t.ID) >= 0) {
                                    var idx1 = self.deletedArray.indexOf(t.ID)
                                    self.deletedArray.splice(idx1, 1)
                                }
                            } else {
                                if (self.checkedList.indexOf(t.ID) >= 0 && self.deletedArray.indexOf(t.ID) < 0) {
                                    self.deletedArray.push(t.ID)
                                }
                                if (self.checkedList.indexOf(t.ID) < 0) {
                                    var idx2 = self.addedArray.indexOf(t.ID)
                                    self.addedArray.splice(idx2, 1)
                                }
                            }
                        })(self.tableData)
                    }
                }

                self.updateArray = function (event, id) {
                    var value = event.target.checked
                    if (self.checkedList.indexOf(id) < 0) {
                        if (value) {
                            self.addedArray.push(id)
                        } else {
                            var idx1 = self.addedArray.indexOf(id)
                            self.addedArray.splice(idx1, 1)
                        }
                    } else {
                        if (value) {
                            var idx2 = self.deletedArray.indexOf(id)
                            self.deletedArray.splice(idx2, 1)
                        } else {
                            self.deletedArray.push(id)
                        }
                    }
                }

                self.submit = function () {
                    var data = JSON.stringify({
                        "action": "updateUsers",
                        "token": util.getParams('token'),
                        "data": {
                            "RoleID": $scope.app.maskParams.roleId,
                            "AddedUsers": self.addedArray,
                            "DeletedUsers": self.deletedArray
                        }
                    });
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('rolemanager', '', 'server'),
                        data: data
                    }).then(function successCallback(data, status, headers, config) {
                        if (data.data.rescode == "200") {
                            alert('保存成功');
                            $state.reload();
                        }
                        else if (data.data.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        }
                        else {
                            alert('保存失败，错误编码：' + data.data.rescode + '，' + data.data.errInfo);
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
        .factory('userRoleUtil', ['NgTableParams', 'util', '$http', function (NgTableParams, util, $http) {
            var utilObj = {
                'loadUserList': function (roleId, obj) {   // 获取用户列表
                    var tableParams = new NgTableParams(
                        {
                            page: 1,
                            count: 15,
                            url: ''
                        },
                        {
                            counts: false,
                            getData: function (params) {
                                var paramsUrl = params.url();

                                var data = JSON.stringify({
                                    "action": "getList",
                                    "token": util.getParams('token'),
                                    "data": {
                                        "per_page": paramsUrl.count - 0,
                                        "page": paramsUrl.page - 0,
                                        "RoleID": roleId
                                    }
                                });
                                obj.loading = true;
                                obj.noData = false;

                                return $http({
                                    method: 'POST',
                                    url: util.getApiUrl('usermanager', '', 'server'),
                                    data: data
                                }).then(function successCallback(response) {
                                    var data = response.data;
                                    if (data.rescode == '200') {
                                        if (data.data.total == 0) {
                                            obj.noData = true;
                                        }
                                        params.total(data.data.total);
                                        obj.checkedList = getCheckedList(data.data.data)
                                        obj.tableData = data.data.data
                                        // 查看权限时获取第一个对象的权限列表
                                        obj.authTableParams = utilObj.loadAuthList(obj.tableData[0].ID, 'user', obj)

                                        if (obj.checkboxes) {
                                            obj.checkboxes.checked = false
                                            R.forEach(function (t) {
                                                obj.checkboxes.items[t.ID] = t.Checked
                                            })(data.data.data)

                                            if (obj.addedUser) {
                                                R.forEach(function (t) {
                                                    obj.checkboxes.items[t] = true
                                                })(obj.addedUser)
                                            }
                                            if (obj.deletedUser) {
                                                R.forEach(function (t) {
                                                    obj.checkboxes.items[t] = false
                                                })(obj.deletedUser)
                                            }
                                        }

                                        return data.data.data
                                    } else if (data.rescode == '401') {
                                        alert('访问超时，请重新登录');
                                        $state.go('login');
                                    } else {
                                        alert('获取列表失败，' + data.errInfo);
                                    }
                                }, function errorCallback(response) {
                                    alert('连接服务器出错');
                                }).finally(function (value) {
                                    obj.loading = false;
                                });
                            }
                        }
                    )
                    return tableParams
                },
                'loadRoleList': function (userId, obj) {  // 获取角色列表
                    var tableParams = new NgTableParams(
                        {
                            page: 1,
                            count: 15,
                            url: ''
                        },
                        {
                            counts: false,
                            getData: function (params) {
                                var paramsUrl = params.url();

                                var data = JSON.stringify({
                                    "action": "getList",
                                    "token": util.getParams('token'),
                                    "data": {
                                        "per_page": paramsUrl.count - 0,
                                        "page": paramsUrl.page - 0,
                                        "UserID": userId
                                    }
                                });
                                obj.loading = true;
                                obj.noData = false;

                                return $http({
                                    method: 'POST',
                                    url: util.getApiUrl('rolemanager', '', 'server'),
                                    data: data
                                }).then(function successCallback(response) {
                                    var data = response.data;
                                    if (data.rescode == '200') {
                                        if (data.data.total == 0) {
                                            obj.noData = true;
                                        }
                                        params.total(data.data.total);
                                        obj.checkedList = getCheckedList(data.data.data)
                                        obj.tableData = data.data.data
                                        // 查看权限时获取第一个对象的权限列表
                                        obj.authTableParams = utilObj.loadAuthList(obj.tableData[0].ID, 'role', obj)

                                        if (obj.checkboxes) {
                                            obj.checkboxes.checked = false
                                            R.forEach(function (t) {
                                                if (t.Checked) {
                                                    obj.checkboxes.items[t.ID] = true
                                                } else {
                                                    obj.checkboxes.items[t.ID] = false
                                                }
                                            })(data.data.data)

                                            if (obj.addedUser) {
                                                R.forEach(function (t) {
                                                    obj.checkboxes.items[t] = true
                                                })(obj.addedUser)
                                            }
                                            if (obj.deletedUser) {
                                                R.forEach(function (t) {
                                                    obj.checkboxes.items[t] = false
                                                })(obj.deletedUser)
                                            }
                                        }
                                        return data.data.data;
                                    } else if (data.rescode == '401') {
                                        alert('访问超时，请重新登录');
                                        $state.go('login');
                                    } else {
                                        alert('获取列表失败，' + data.errInfo);
                                    }
                                }, function errorCallback(response) {
                                    alert('连接服务器出错');
                                }).finally(function (value) {
                                    obj.loading = false;
                                });
                            }
                        }
                    );
                    return tableParams
                },
                'loadAuthList': function (id, type, obj) {
                    obj.targetID = id
                    var tableParams = new NgTableParams(
                        {
                            page: 1,
                            count: 15,
                            url: ''
                        },
                        {
                            counts: false,
                            getData: function (params) {
                                var paramsUrl = params.url();

                                var data = JSON.stringify({
                                    "action": "getPrivilege",
                                    "token": util.getParams('token'),
                                    "data": {
                                        "per_page": paramsUrl.count - 0,
                                        "page": paramsUrl.page - 0,
                                        "ID": id
                                    }
                                });
                                obj.loading = true;
                                obj.noData = false;

                                return $http({
                                    method: 'POST',
                                    url: util.getApiUrl(type + 'manager', '', 'server'),
                                    data: data
                                }).then(function successCallback(response) {
                                    var data = response.data;
                                    obj.checkedAuth.checked = false
                                    if (data.rescode == '200') {
                                        if (data.data.total == 0) {
                                            obj.noData = true;
                                        }
                                        params.total(data.data.total);
                                        obj.authListHead = data.data.data.header
                                        obj.authListData = data.data.data.data
                                        return obj.authListData;
                                    } else if (data.rescode == '401') {
                                        alert('访问超时，请重新登录');
                                        $state.go('login');
                                    } else {
                                        alert('获取列表失败，' + data.errInfo);
                                    }
                                }, function errorCallback(response) {
                                    alert('连接服务器出错');
                                }).finally(function (value) {
                                    obj.loading = false;
                                });
                            }
                        }
                    );
                    return tableParams
                }
            }

            // 获取选中的列表
            function getCheckedList(arr) {
                var data = []
                for (var i in arr) {
                    if (arr[i].Checked) {
                        data.push(arr[i].ID)
                    }
                }
                return data
            }

            return utilObj
        }])
})();