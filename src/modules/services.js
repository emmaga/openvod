'use strict';

(function () {
    var app = angular.module('app.services', [])

        .factory('util', ['CONFIG', function (CONFIG) {
            var params = {};

            return {
                /** 
                 * 调用接口，本地和服务器的接口切换，方便调试
                 * @param url 服务器接口名称 
                 * @param testUrl 测试接口名称
                 * @param forceType 强制读取服务器or本地接口 server or local
                 */
                'getApiUrl': function (url, testUrl, forceType) {
                    if(forceType) {
                        if (forceType == 'server') {
                            return CONFIG.serverUrl + url;
                        }
                        else {
                            return CONFIG.testUrl + testUrl + CONFIG.testExtesion;
                        }
                    }
                    else {
                        if (CONFIG.test) {
                            return CONFIG.testUrl + testUrl + CONFIG.testExtesion;
                        }
                        else {
                            return CONFIG.serverUrl + url;
                        }
                    }
                },
                /**
                 * 设置变量
                 * @param paramsName {String}
                 * {
                 *   userName: <String> 用户名,
                 *   projectName: <String> 项目名,
                 *   token: <String> token,
                 *   editLangs: <String> 语言
                 *   }
                 * @param value {String}
                 */
                'setParams': function (paramsName, value) {
                    params[paramsName] = value;
                },
                /**
                 * 获取变量
                 * @param paramsName
                 * @returns {*}
                 */
                'getParams': function (paramsName) {
                    return params[paramsName];
                }
            }
        }])

})();