/**
 * Copyright (C) 2016  Stichting PALGA
 * This file is distributed under the GNU Affero General Public License
 * (see accompanying file LICENSE).
 */
(function(console, angular, jQuery) {
'use strict';

angular.module('ProcessApp.controllers')
    .controller('RegistrationController',['$scope', '$rootScope',
                                          'Restangular',
                                          '$location', '$alert',
        function ($scope, $rootScope,
                Restangular,
                $location, $alert) {

        $scope.labs = []; // init labs

        // Get lab list
        Restangular.all('public/labs').getList()
            .then(function (labs) {
                $scope.labs = labs;
            });

        $scope.submit = function (user) {
            if ($scope.registrationForm.$valid) {
                user.currentRole = 'requester';
                user.username = user.contactData.email;
                $rootScope.registrant = user;
                Restangular.all('register/users').post(user)
                    .then(function () {
                        $location.path('/register/success');
                    }, function (response) {
                        if (response.data) {
                            _error(response.data.message);
                        } else {
                            _error('Error');
                        }
                    });
            }
        };

        var _error = function (msg) {
            $alert({
                title : 'Error',
                content : msg,
                placement : 'top-right',
                type : 'danger',
                show : true,
                duration : 5
            });
        };

        angular.element(document).ready(function() {
            jQuery('#firstName').focus();
        });

}]);
})(console, angular, jQuery);
