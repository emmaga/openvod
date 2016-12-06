'use strict';

(function() {
  var app = angular.module('app.directives', [])

  .directive('fileModel', ['$parse','CONFIG', function ($parse, CONFIG) {
      return {
          restrict: 'A',
          link: function(scope, element, attrs) {

              var model = $parse(attrs.fileModel);
              var modelSetter = model.assign;
              
              element.bind('change', function(){
                  console.log('ddd');
                  console.log(scope);
                  scope.$apply(function(){
                      modelSetter(scope, element[0].files[0]);
                  });
                  console&&console.log('click ' + attrs.e);
                  document.getElementById(attrs.e).click();
              });
          }
      };
  }])

})();