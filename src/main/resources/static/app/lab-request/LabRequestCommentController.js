/**
 * Copyright (C) 2016  Stichting PALGA
 * This file is distributed under the GNU Affero General Public License
 * (see accompanying file LICENSE).
 */
angular.module('ProcessApp.controllers')
    .controller('LabRequestCommentController',['$rootScope', '$scope', '$modal', '$location', '$route',
        'LabRequest', 'LabRequestComment',

    function ($rootScope, $scope, $modal, $location, $route,
              LabRequest, LabRequestComment) {
        'use strict';

        $scope.commentEditVisibility = {};
        //$scope.editComment = {};
        
        $scope.addComment = function(labRequest, body) {
            var comment = new LabRequestComment(body);
            comment.labRequestId = labRequest.id;
            comment.$save(function(result) {
                labRequest.comments.push(result);
                $scope.editComment = {};
            }, function(response) {
                $scope.error = response.statusText;
            });
        };
        
        $scope.updateComment = function(labRequest, body) {
            var comment = new LabRequestComment(body);
            comment.labRequestId = labRequest.id;
            comment.$update(function(result) {
                var index = $scope.labRequest.comments.indexOf(body);
                //console.log('Updating comment at index ' + index);
                $scope.labRequest.comments[index] = result;
                $scope.commentEditVisibility[comment.id] = 0;
            }, function(response) {
                $scope.error = $scope.error + response.data.message + '\n';
            });
        };

        $scope.removeComment = function(labRequest, body) {
            var comment = new LabRequestComment(body);
            comment.labRequestId = labRequest.id;
            comment.$remove(function() {
                $scope.labRequest.comments.splice(
                    $scope.labRequest.comments.indexOf(body), 1);
            }, function(response) {
                $scope.error = $scope.error + response.data.message + '\n';
            });
        };

    }]);
