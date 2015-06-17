'use strict';

angular.module('ProcessApp.controllers')
  .controller('LabRequestController', [
       '$q','$rootScope', '$scope',
       '$modal',
       '$location', '$route', '$routeParams',
       'Restangular',
    function (
            $q, $rootScope, $scope,
            $modal,
            $location, $route, $routeParams,
            Restangular) {

      $scope.labReqModal = $modal({
        id: 'labRequestWindow',
        scope: $scope,
        template: '/app/lab-request/edit-lab-request.html',
        backdrop: 'static',
        show: false
      });

      $scope.alerts = [];
      $scope.labRequest = {};

      $scope.getName = function(user) {
          if (user === null) {
              return '';
          }
          return user.firstName +
              ((user.firstName ==='' || user.lastName ==='' || user.lastName === null ) ? '' : ' ') +
              (user.lastName === null ? '' : user.lastName);
      };

      /**
       * To load lab request list
       * @private
       */
      var _loadRequests = function() {
          var deferred = $q.defer();
          Restangular.all('labrequests').getList().then(function (labRequests) {
            //console.log(labRequests);
            $rootScope.labRequests = labRequests;
            deferred.resolve($scope.labRequests);
          }, function (err) {
            deferred.reject('Cannot load lab requests. ' + err);
          });
        return deferred.promise;
      };

      var getHTMLRequesterAddress = function (contactData) {

        var _createEmailTmp = function (email) {
          return '<span><i class="glyphicon glyphicon-envelope"></i></span> <a href="mailto:' + email
            +'">' + email + '</a>';
        };

        var _createPhoneTmp = function (phone) {
          return '<span><i class="glyphicon glyphicon-earphone"></i></span> ' + phone;
        };

        return ''
          .concat(contactData.address1 !== null ? contactData.address1 + '<br>' : '')
          .concat(contactData.address2 !== null ? contactData.address2 + '<br>' : '')
          .concat(contactData.city !== null ? contactData.city + ' ' : '')
          .concat(contactData.postalCode !== null ? contactData.postalCode + '<br>' : '')
          .concat(contactData.stateProvince !== null ? contactData.stateProvince + ', ' : '')
          .concat(contactData.stateProvince !== null ? contactData.country + '<br>' : '')
          .concat(contactData.telephone !== null ? _createPhoneTmp(contactData.telephone) + '<br>' : '')
          .concat(contactData.email !== null ? _createEmailTmp(contactData.email) + '<br>' : '');

      };

      /**
       * To load lab request
       * @private
       */
      var _loadRequest = function(obj) {
        var restInstance, deferred = $q.defer();

        if (obj.hasOwnProperty('get')) {
          restInstance = obj;
        } else {
          restInstance = Restangular.one('labrequests', obj);
        }

        restInstance.get().then(function (result) {
            $scope.labRequest = result;
            $scope.labRequest.htmlRequesterAddress = getHTMLRequesterAddress($scope.labRequest.requesterLab.contactData);
            $scope.labRequest.htmlRequesterLabAddress = getHTMLRequesterAddress($scope.labRequest.requesterLab.contactData);
            $scope.labRequest.htmlLabAddress = getHTMLRequesterAddress($scope.labRequest.lab.contactData);
            deferred.resolve($scope.labRequest);
        }, function (err) {
          var errMsg = 'Error : ' + err.data.status  + ' - ' + err.data.error;
          $scope.alerts.push({type: 'danger', msg: errMsg });
          deferred.reject(errMsg);
        });
        return deferred.promise;
      };

      if ($routeParams.labRequestId) {
        _loadRequest($routeParams.labRequestId);

      } else {
        _loadRequests();
      }

      $scope.edit = function (labRequest) {
        console.log('about to edit', labRequest);
        _loadRequest(labRequest).then (function () {
            $scope.labReqModal.show();
        });
      };

      $scope.cancel = function () {
        $scope.labReqModal.hide();
      };

      $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
      };

      $scope.reject = function (labRequest) {
        console.log(labRequest);
        bootbox.prompt({
            title: 'Are you sure you want to reject the lab request?\n<br>' +
            'Please enter a reject reason:',
            callback: function(result) {
                if (result) {
                    labRequest.rejectReason = result;
                    labRequest.customPUT(labRequest, 'reject').then(function (result) {
                        if ($scope.labReqModal) {
                          $scope.labReqModal.hide();
                        }
                        $location.path('/lab-request/view/'+labRequest.id);
                        //_loadRequests();
                      }
                      , function (err) {
                        console.log('Error: ', err);
                        $scope.alerts.push({type: 'danger', msg: err });
                      });
                }
            }
        });
      };

      $scope.accept = function (labRequest) {
        labRequest.customPUT({}, 'accept').then(function (result) {
          if ($scope.labReqModal) {
              $scope.labReqModal.hide();
          }
          _loadRequests();
        }, function (err) {
          $scope.alerts.push({type: 'danger', msg: err });
        });
      };

      $scope.claim = function (labRequest) {
        labRequest.customPUT({}, 'claim')
          .then(function (result) {
            _loadRequests();
          }, function (err) {
            $scope.alerts.push({type: 'danger', msg: err });
          });
      };

      $scope.unclaim = function (labRequest) {
        labRequest.customPUT({}, 'unclaim')
          .then(function (result) {
            _loadRequests();
          }, function (err) {
            $scope.alerts.push({type: 'danger', msg: err });
          });
      };

      $scope.update = function (labRequest) {
          labRequest.save().then(function (result) {
            console.log(result);
            if ($scope.labReqModal) {
              $scope.labReqModal.hide();
            }
          }, function (err) {
            $scope.alerts.push({type: 'danger', msg: err });
          });
      };

      $scope.isLabUser = function () {
        return $rootScope.globals.currentUser.roles.indexOf('lab_user') !== -1;
      };

    }]);
