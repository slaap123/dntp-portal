/**
 * Copyright (C) 2016  Stichting PALGA
 * This file is distributed under the GNU Affero General Public License
 * (see accompanying file LICENSE).
 */
(function(angular) {
'use strict';

angular.module('ProcessApp.controllers')
    .controller('NavigationController',['$rootScope', '$scope', '$http', '$location', '$route', '$translate', '$cookies',
        function ($rootScope, $scope, $http, $location, $route, $translate, $cookies) {

            $scope.$route = $route;
            
            var checkRoles = function (requirements) {
                if ($rootScope.globals.hasOwnProperty('currentUser')) {
                    var userFeatures = $rootScope.globals.currentUser.features;
                    for (var j=0;j<requirements.length; j++) {
                        for (var i=0;i<userFeatures.length; i++) {
                            if (requirements[j] === userFeatures[i]) {return true;}
                        }
                    }
                }
                return false;
            };

            $scope.rolesText = function() {
                return _.map(
                        _.get($rootScope.globals, 'currentUser.roles', []),
                        function(role) {
                            return $rootScope.translate('role_'+role);
                        })
                        .join(', ');
            };

            $scope.isViewLabsAllowed = function() {
                return checkRoles(['HAS_MANAGE_LAB_PAGE_AUTH']);
            };

            $scope.isViewRequestsAllowed = function() {
                return checkRoles(['HAS_MANAGE_REQUEST_PAGE_AUTH']);
            };

            $scope.isViewLabRequestsAllowed = function() {
              return checkRoles(['HAS_MANAGE_LAB_REQUEST_PAGE_AUTH']);
            };

            $scope.isViewSamplesAllowed = function() {
                return checkRoles(['HAS_MANAGE_SAMPLES_PAGE_AUTH']);
            };

            $scope.isViewUsersAllowed = function() {
                return checkRoles(['HAS_MANAGE_USER_PAGE_AUTH']);
            };

            $scope.isViewOwnLabAllowed = function() {
                return checkRoles(['HAS_MANAGE_OWN_LAB_PAGE_AUTH']);
            };

            $scope.isViewHubLabsAllowed = function() {
                return checkRoles(['HAS_MANAGE_HUB_LABS_PAGE_AUTH']);
            };

            $scope.isViewAccessLogsAllowed = function() {
                return checkRoles(['HAS_MANAGE_ACCESS_LOG_AUTH']);
            };

            $scope.isEditAgreementFormTemplateAllowed = function() {
                return checkRoles(['HAS_MANAGE_AGREEMENT_FORM_TEMPLATE_AUTH']);
            };

            $scope.isViewManagementAllowed = function() {
                return checkRoles([
                                   'HAS_MANAGE_USER_PAGE_AUTH',
                                   'HAS_MANAGE_LAB_PAGE_AUTH',
                                   'HAS_MANAGE_ACCESS_LOG_AUTH',
                                   'HAS_MANAGE_AGREEMENT_FORM_TEMPLATE_AUTH'
                                   ]);
            };

            $scope.isRequestsPage = function() {
                return $route.current.templateUrl=='app/request/edit-request.html' ||
                    $route.current.templateUrl=='app/request/requests.html' ||
                    $route.current.templateUrl=='app/request/request.html';
            };

            $scope.isLabRequestsPage = function() {
                return $route.current.templateUrl=='app/lab-request/edit-lab-request.html' ||
                    $route.current.templateUrl=='app/lab-request/lab-requests.html' ||
                    $route.current.templateUrl=='app/lab-request/lab-request.html';
            };

            $scope.isManagementPage = function() {
                return $route.current.templateUrl=='app/admin/user/users.html' ||
                    $route.current.templateUrl=='app/admin/lab/labs.html' ||
                    $route.current.templateUrl=='app/admin/agreementformtemplate/edit.html' ||
                    $route.current.templateUrl=='app/admin/accesslogs/accesslogs.html';
            };

            $scope.login = function() {
                $location.path('/login');
            };

            $scope.logout = function() {
                $rootScope.redirectUrl = undefined;
                $http.post('logout', {}).success(function() {
                    console.log('Logout succes.');
                    $rootScope.authenticated = false;
                    $rootScope.globals = {};
                    $cookies.remove('userid');
                    $cookies.remove('username');
                    $cookies.remove('roles');
                    $rootScope.error = false;
                    $rootScope.errormessage = '';
                    $location.path('/login');
                }).error(function(data) {
                    console.log('Logout error.');
                    $rootScope.error = true;
                    $rootScope.errormessage = '';
                    if (data.message) {
                        $rootScope.errormessage = data.message;
                    }
                    $rootScope.authenticated = false;
                    $location.path('/login');
                });
            };

            /* Fix nl locale for bootbox */
            bootbox.removeLocale('nl');
            bootbox.addLocale('nl', {
                OK : 'OK',
                CANCEL : 'Annuleren',
                CONFIRM : 'OK'
            });

            var _languages = ['nl', 'en'];

            $scope.changeLanguage = function(langKey) {
                if (_languages.indexOf(langKey) != -1) {
                    console.log('change language: ' + langKey);
                    $scope.currentLanguage = langKey;
                    $cookies.put('lang', $scope.currentLanguage);
                    console.log($cookies.get('lang'));
                    $translate.use(langKey);
                    bootbox.setDefaults({locale: langKey});
                }
            };

            $scope.currentLanguage = $cookies.get('lang');
            if ($scope.currentLanguage) {
                $translate.use($scope.currentLanguage);
                bootbox.setDefaults({locale: $scope.currentLanguage});
            } else {
                $scope.changeLanguage($translate.use());
            }

        }]);
})(angular);
