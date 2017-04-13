'use strict';

(function () {
    var app = angular.module('app.member-card-controllers', [])

    .controller('memberCardController', ['$scope', '$filter', '$q', '$state', '$http', '$stateParams', 'NgTableParams', 'util',
        function ($scope, $filter, $q, $state, $http, $stateParams, NgTableParams, util) {
            var self = this;
            
            self.init = function () {
                
            }

        }
    ])

    .controller('memberCardListController', ['$scope', '$filter', '$q', '$state', '$http', '$stateParams', 'NgTableParams', 'util',
        function ($scope, $filter, $q, $state, $http, $stateParams, NgTableParams, util) {
            var self = this;
            
            self.init = function () {
                
            }

            self.addLevel = function () {
                $scope.app.maskParams = {};
                $scope.app.showHideMask(true,'pages/memberCard/addLevel.html');
            }

            self.configUpgrade = function () {
                $scope.app.maskParams = {};
                $scope.app.showHideMask(true,'pages/memberCard/configUpgrade.html');
            }

            self.editMemberCard = function () {
                $scope.app.maskParams = {};
                $scope.app.showHideMask(true,'pages/memberCard/editMemberCard.html');
            }

            self.configMemberCard = function () {
                $scope.app.maskParams = {};
                $scope.app.showHideMask(true,'pages/memberCard/configMemberCard.html');
            }

        }
    ])

    .controller('memberListController', ['$scope', '$filter', '$q', '$state', '$http', '$stateParams', 'NgTableParams', 'util',
        function ($scope, $filter, $q, $state, $http, $stateParams, NgTableParams, util) {
            var self = this;
            
            self.init = function () {
                
            }

            self.editScores = function () {
                $scope.app.maskParams = {};
                $scope.app.showHideMask(true,'pages/memberCard/editScores.html');
            }

            self.editLevels = function () {
                $scope.app.maskParams = {};
                $scope.app.showHideMask(true,'pages/memberCard/editLevels.html');
            }

            self.memberDetail = function () {
                $scope.app.maskParams = {};
                $scope.app.showHideMask(true,'pages/memberCard/memberDetail.html');
            }
        }
    ])

    .controller('editScoresController', ['$scope', '$filter', '$q', '$state', '$http', '$stateParams', 'util',
        function ($scope, $filter, $q, $state, $http, $stateParams, util) {
            var self = this;
            
            self.init = function () {
                
            }

            self.submit = function () {

            }

            self.close = function () {
                $scope.app.showHideMask(false);
            }

        }
    ])   

    .controller('editLevelsController', ['$scope', '$filter', '$q', '$state', '$http', '$stateParams', 'util',
        function ($scope, $filter, $q, $state, $http, $stateParams, util) {
            var self = this;
            
            self.init = function () {
                
            }

            self.submit = function () {

            }

            self.close = function () {
                $scope.app.showHideMask(false);
            }

        }
    ]) 

    .controller('addLevelController', ['$scope', '$filter', '$q', '$state', '$http', '$stateParams', 'util',
        function ($scope, $filter, $q, $state, $http, $stateParams, util) {
            var self = this;
            
            self.init = function () {
                
            }

            self.submit = function () {

            }

            self.close = function () {
                $scope.app.showHideMask(false);
            }

        }
    ])

    .controller('editMemberCardController', ['$scope', '$filter', '$q', '$state', '$http', '$stateParams', 'util',
        function ($scope, $filter, $q, $state, $http, $stateParams, util) {
            var self = this;
            
            self.init = function () {
                
            }

            self.submit = function () {

            }

            self.close = function () {
                $scope.app.showHideMask(false);
            }

        }
    ]) 

    .controller('configMemberCardController', ['$scope', '$filter', '$q', '$state', '$http', '$stateParams', 'util',
        function ($scope, $filter, $q, $state, $http, $stateParams, util) {
            var self = this;
            
            self.init = function () {
                
            }

            self.submit = function () {

            }

            self.close = function () {
                $scope.app.showHideMask(false);
            }

        }
    ])         
})();
