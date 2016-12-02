'use strict';

(function () {
    var app = angular.module('app.tv-admin-controllers', [])

    .controller('tvAdminController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
        function ($scope, $state, $http, $stateParams, $location, util) {
            var self = this;
            var my_tree;
            $scope.my_tree = my_tree = {};
            
            self.init = function() {
                
            }

            // 菜单点击
            $scope.my_tree_handler = function(branch) {
                console.log('select ' + branch.label);
                // welcome
                if(branch.data.type == "welcome") {
                    $state.go('app.tvAdmin.welcome');
                }

                // version
                if(branch.data.type == 'version') {
                    $state.go('app.tvAdmin.version');
                }

                // live
                if(branch.data.type == 'Live') {
                    $state.go('app.tvAdmin.live', {moduleId: branch.data.moduleId});
                }

                // movieCommon
                if(branch.data.type == 'MovieCommon') {
                    $state.go('app.tvAdmin.movieCommon');
                }

                // menu
                if(branch.data.type == 'menuRoot' || branch.data.type == 'MainMenu_THJ_SecondMenu') {
                    $state.go('app.tvAdmin.blank');
                }
            }
        }
    ])

    .controller('tvWelcomeController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
        function ($scope, $state, $http, $stateParams, $location, util) {
            var self = this;
            
            self.init = function() {
                
            }

        }
    ])

    .controller('tvLiveController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
        function ($scope, $state, $http, $stateParams, $location, util) {
            var self = this;
            var id = $stateParams.moduleId;

            self.init = function() {
                console.log(id);
            }

        }
    ])

    .controller('movieCommonController', ['$scope', '$state', '$http', '$stateParams', '$location', 'util',
        function ($scope, $state, $http, $stateParams, $location, util) {
            var self = this;
            var id = $stateParams.moduleId;

            self.init = function() {
                console.log(id);
            }

        }
    ])    

})();
