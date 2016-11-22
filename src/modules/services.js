'use strict';

(function () {
    var app = angular.module('app.services', [])

        .factory('util', ['CONFIG', function (CONFIG) {
            var params = {};

            return {
                /** 调用接口，本地和服务器的接口切换，方便调试
                 * @url, @testUrl 接口名称
                 * @testType 测试接口时，有些接口强制服务端有效，此时设置为：server，其他设置为local，默认为local
                 */
                'getApiUrl': function (url, testUrl, testType) {
                    if (CONFIG.test) {
                        if (testType == 'server') {
                            return CONFIG.serverUrl + url;
                        }
                        else {
                            return CONFIG.testUrl + testUrl + CONFIG.testExtesion;
                        }
                    }
                    else {
                        return CONFIG.serverUrl + url;
                    }
                },
                /**
                 * 设置变量
                 * @param paramsName {String}
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
                },
                'MD5': function (value) {
                    
                }
            }
        }])

})();