'use strict';

(function() {
  var app = angular.module('app.filters', [])

  .filter("ajaxMethod", ['CONFIG', function(CONFIG) {
    return function() {
        var method = CONFIG.test ? 'GET' : 'POST';
        return method;
    };
  }])

  .filter("fenToYuan", function() {
    return function(fen) {
        var s = fen + '';
        if(s.length == 1) { s = '00' + s; }
        else if(s.length == 2) { s = '0' + s; }
        var s1 = s.slice(0, -2);
        var s2 = s.slice(-2);
        return s1 + '.' + s2;
    };
  })

})();