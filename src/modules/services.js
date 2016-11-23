'use strict';

(function () {
    var app = angular.module('app.services', [])


        .factory('util', ['$cookies', '$translate', 'CONFIG', function ($cookies, $translate, CONFIG) {



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
                 *   editLangs: <Array> 语言
                 *   [
                 *      {
                 *          "name": "中文",
                 *          "code": "zh-CN"
                 *      },
                 *      {
                 *          "name": "en",
                 *          "code": "en-US"
                 *      }
                 *    ]
                 *  }
                 * @param value {String}
                 */
                'setParams': function (paramsName, value) {
                    $cookies.put(paramsName, value)
                },
                /**
                 * 获取变量
                 * @param paramsName
                 * @returns {*}
                 */
                'getParams': function (paramsName) {

                    return $cookies.get(paramsName);

                  
                },
                
                // 当前系统 使用 的 语言
                'langStyle': function(){
                    return $translate.proposedLanguage() || $translate.use();

                }
            }
        }])

})();