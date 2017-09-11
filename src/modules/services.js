'use strict';

(function () {
    var app = angular.module('app.services', ['ngCookies'])

        .factory('util', ['$cookies', '$translate', 'CONFIG', function ($cookies, $translate, CONFIG) {

            return {
                'projectChange': undefined,
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
                            return CONFIG.testUrl + testUrl;
                        }
                    }
                    else {
                        if (CONFIG.test) {
                            return CONFIG.testUrl + testUrl;
                        }
                        else {
                            return CONFIG.serverUrl + url;
                        }
                    }
                },
                /**
                 * 获取上传URL
                 * @returns {string}
                 */
                'getUploadUrl': function () {
                    return CONFIG.uploadUrl;
                },
                /**
                 * 设置变量
                 * @param paramsName {String}
                 * {
                 *   userName: <String> 用户名,
                 *   projectName: <String> 项目名,
                 *   token: <String> token,
                 *   lang: <String> 本地语言,
                 *   editLangs: <String> 语言
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
                    var date = new Date();
                    date.setDate(date.getDate() + 1);
                    var expires = date;
                    $cookies.put(paramsName, JSON.stringify(value),{'expires': expires})
                },
                /**
                 * 获取变量
                 * @param paramsName
                 * @returns {*}
                 */
                'getParams': function (paramsName) {
                    if($cookies.get(paramsName)) {
                        return JSON.parse($cookies.get(paramsName));
                    }
                    else {
                        return false;
                    }
                },

                /**
                 * 当前系统 使用 的 语言
                 * @returns {string|Object|string}
                 */
                'langStyle': function(){
                    return $translate.proposedLanguage() || $translate.use();
                },

                /**
                 * 获取多语言编辑中的默认语言code
                 */
                'getDefaultLangCode': function() {
                    var langs = [];
                    if($cookies.get('editLangs')) {
                        langs = JSON.parse($cookies.get('editLangs'));
                    }
                    for (var i = 0; i < langs.length; i++) {
                        if(langs[i].default) {
                            return langs[i].code;
                        }
                    }
                },

                /**
                 * actionType: "normal" 普通上传, "transcode" 转码上传
                 * @param xhr
                 * @param file
                 * @param uploadUrl
                 * @param actionType
                 * @param progressFn
                 * @param succFn
                 * @param failFn
                 */
                'uploadFileToUrl': function(xhr, file, uploadUrl, actionType, progressFn, succFn, failFn){
                    
                    var actionType = actionType ? actionType : 'normal';

                    var fd = new FormData();
                    fd.append('action', actionType);
                    fd.append('file', file);
                    
                    // var xhr = new XMLHttpRequest();
                    xhr.open('POST', uploadUrl, true);

                    xhr.upload.addEventListener("progress", function(evt) {
                        progressFn(evt);
                    }, false);

                    xhr.onreadystatechange = function(response) {
                        if (xhr.readyState == 4 && xhr.status == 200 && xhr.responseText != "") {
                            console.log(xhr.responseText);
                            if(JSON.parse(xhr.responseText).result !== 0) {
                              failFn(xhr);
                            }
                            else {
                              succFn(xhr);
                            }
                        } else if (xhr.status != 200 && xhr.responseText) {
                            failFn(xhr);
                        }
                    };

                    xhr.send(fd);
                },
                /**
                 * 获取今日日期 格式为‘yyyy-MM-dd’
                 * @returns {string}
                 */
                'getToday': function () {
                    var date = new Date();
                    var seperator1 = "-";
                    var month = date.getMonth() + 1;
                    var strDate = date.getDate();
                    if (month >= 1 && month <= 9) {
                        month = "0" + month;
                    }
                    if (strDate >= 0 && strDate <= 9) {
                        strDate = "0" + strDate;
                    }
                    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate;
                    return currentdate;
                },
                /**
                 * 获取明日日期 格式为‘yyyy-MM-dd’
                 * @returns {string}
                 */
                'getTomorrow': function () {
                    var date = new Date();
                    var seperator1 = "-";
                    var month = date.getMonth() + 1;
                    var strDate = date.getDate() + 1;
                    if (month >= 1 && month <= 9) {
                        month = "0" + month;
                    }
                    if (strDate >= 0 && strDate <= 9) {
                        strDate = "0" + strDate;
                    }
                    var tomorrowdate = date.getFullYear() + seperator1 + month + seperator1 + strDate;
                    return tomorrowdate;
                },
                /**
                 * 转换格式为‘yyyy-MM-dd’
                 * @param date
                 * @returns {string}
                 */
                'format_yyyyMMdd': function (date) {
                    var seperator1 = "-";
                    var month = date.getMonth() + 1;
                    var strDate = date.getDate();
                    if (month >= 1 && month <= 9) {
                        month = "0" + month;
                    }
                    if (strDate >= 0 && strDate <= 9) {
                        strDate = "0" + strDate;
                    }
                    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate;
                    return currentdate;
                },
                /**
                 * 转换格式为‘01:01’
                 * @param date
                 * @returns {string}
                 */
                'format_hhmm': function (date) {
                    var hour = date.getHours();
                    if (hour >= 0 && hour <= 9) {
                        hour = "0" + hour;
                    }
                    var mins = date.getMinutes();
                    if (mins >= 0 && mins <= 9) {
                        mins = "0" + mins;
                    }
                    var time = hour + ':' + mins;
                    return time;
                }
            }
        }])

})();