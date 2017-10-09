'use strict';

(function () {
    var app = angular.module('app.services', ['ngCookies'])

        .factory('util', ['$cookies', '$translate', 'CONFIG', function ($cookies, $translate, CONFIG) {
            var utilObj = {
                'projectChange': undefined,
                /**
                 * 调用接口，本地和服务器的接口切换，方便调试
                 * @param url 服务器接口名称
                 * @param testUrl 测试接口名称
                 * @param forceType 强制读取服务器or本地接口 server or local
                 */
                'getApiUrl': function (url, testUrl, forceType) {
                    if (forceType) {
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
                    $cookies.put(paramsName, JSON.stringify(value), {'expires': expires})
                },
                /**
                 * 获取变量
                 * @param paramsName
                 * @returns {*}
                 */
                'getParams': function (paramsName) {
                    if ($cookies.get(paramsName)) {
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
                'langStyle': function () {
                    return $translate.proposedLanguage() || $translate.use();
                },

                /**
                 * 获取多语言编辑中的默认语言code
                 */
                'getDefaultLangCode': function () {
                    var langs = [];
                    if ($cookies.get('editLangs')) {
                        langs = JSON.parse($cookies.get('editLangs'));
                    }
                    for (var i = 0; i < langs.length; i++) {
                        if (langs[i].default) {
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
                'uploadFileToUrl': function (xhr, file, uploadUrl, actionType, progressFn, succFn, failFn) {

                    var actionType = actionType ? actionType : 'normal';

                    var fd = new FormData();
                    fd.append('action', actionType);
                    fd.append('file', file);

                    // var xhr = new XMLHttpRequest();
                    xhr.open('POST', uploadUrl, true);

                    xhr.upload.addEventListener("progress", function (evt) {
                        progressFn(evt);
                    }, false);

                    xhr.onreadystatechange = function (response) {
                        if (xhr.readyState == 4 && xhr.status == 200 && xhr.responseText != "") {
                            console.log(xhr.responseText);
                            if (JSON.parse(xhr.responseText).result !== 0) {
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
                },
                /**
                 * 多图上传初始化
                 * self.imgs = new util.initUploadImgs([],self,$scope,'imgs');        //多图
                 * self.imgs = new util.initUploadImgs([],self,$scope,'imgs',true);   //单图
                 * */
                'initUploadImgs': function (imgList, target, scope, img, single) {
                    var obj = {
                        initImgList: imgList,
                        data: [],
                        maxId: 0,
                        single: single ? true : false,
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

                        uploadFile: function (e) {
                            if (single) {
                                // 删除第二张以后的图片
                                console.info(this.data)
                                for (var i = 0; i < this.data.length; i++) {
                                    this.deleteById(this.data[i].id);
                                }
                            }
                            var file = scope[e];
                            var uploadUrl = CONFIG.uploadUrl;
                            var xhr = new XMLHttpRequest();
                            var fileId = this.add(xhr, file.name, file.size, xhr);
                            // self.search();

                            utilObj.uploadFileToUrl(xhr, file, uploadUrl, 'normal',
                                function (evt) {
                                    scope.$apply(function () {
                                        if (evt.lengthComputable) {
                                            var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                                            target[img].update(fileId, percentComplete, evt.total - evt.loaded, evt.total);
                                            console.log(percentComplete);
                                        }
                                    });
                                },
                                function (xhr) {
                                    var ret = JSON.parse(xhr.responseText);
                                    console && console.log(ret);
                                    scope.$apply(function () {
                                        target[img].setSrcSizeByXhr(xhr, ret.upload_path, ret.size);
                                    });
                                },
                                function (xhr) {
                                    scope.$apply(function () {
                                        target[img].update(fileId, -1, '', '');
                                    });
                                    console.log('failure');
                                    xhr.abort();
                                }
                            );
                        }
                    }
                    return obj;
                }
            },
            /**
              * 初始化时间范围选择控件
              * */
              'initRangeDatePicker': function (obj, opt) {
                  obj.startTime = this.format_yyyyMMdd(new Date(new Date().getTime() - 2678400000))
                  obj.endTime = this.format_yyyyMMdd(new Date())
                  var defaultOption = {
                      startEl: '#startTime',
                      endEl: '#endTime',
                      maxDate: this.format_yyyyMMdd(new Date())
                  }
                  var option = extend(defaultOption, opt || {})

                  // 日期选择-开始时间
                  laydate.render({
                      elem: option.startEl,
                      max: option.maxDate,
                      btns: ['now','confirm'],
                      done: function (value, date, endDate) {
                          obj.$apply(function () {
                              obj.startTime = value
                          })
                      }
                  });
                  // 日期选择-结束时间
                  laydate.render({
                      elem: option.endEl,
                      max: option.maxDate,
                      btns: ['now','confirm'],
                      done: function (value, date, endDate) {
                          obj.$apply(function () {
                              obj.endTime = value
                          })
                      }
                  });

                  function extend (a, b) {
                      for (var i in b) {
                          //这个是检测for循环到的属性是不是b自身的
                          if (b.hasOwnProperty(i)) {
                              a[i] = b[i]
                          }
                      }
                      return a;
                  }
              },
              /**
               * 时间格式控制
               * */
              'resetTime':function (obj,range) {
                  if (obj.startTime > obj.endTime) {
                      var k = obj.startTime;
                      obj.startTime = obj.endTime;
                      obj.endTime = k;
                  }
                  if(!range) return true;
                  if (Math.abs(new Date(obj.startTime).getTime() - new Date(obj.endTime).getTime()) > range*24*60*60*1000) {
                      alert('时间范围不能大于'+range+'天')
                      return false;
                  }else{
                      return true;
                  }
              }
          }

            return utilObj;
        }])

})();