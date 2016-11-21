'use strict';

(function() {
  var app = angular.module('app.filters', [])

  .filter("ajaxMethod", ['CONFIG', function(CONFIG) {
    return function() {
        var method = CONFIG.test ? 'GET' : 'POST';
        return method;
    };
  }])

})();