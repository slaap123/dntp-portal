/**
 * Copyright (C) 2016  Stichting PALGA
 * This file is distributed under the GNU Affero General Public License
 * (see accompanying file LICENSE).
 */
(function (window, console, angular, jQuery, _, bootbox) {
'use strict';

angular.module('ProcessApp.controllers')
    .controller('RequestController',['$rootScope', '$scope', '$modal', '$location', '$route',
        'Request', 'RequestAttachment', 'RequestComment',
        'ApprovalComment', 'ApprovalVote',
        '$translate',
        'Upload', '$routeParams', 'RequestFilter',
        '$alert', '$timeout',
        'AgreementFormTemplate',

        function ($rootScope, $scope, $modal, $location, $route,
                  Request, RequestAttachment, RequestComment,
                  ApprovalComment, ApprovalVote,
                  $translate,
                  Upload, $routeParams, RequestFilter,
                  $alert, $timeout,
                  AgreementFormTemplate) {

            $scope.statuses = Request.statuses;

            $scope.claimableStates = Request.claimableStates;

            $scope.editStates = Request.editStates;

            $scope.Upload = Upload;

            $scope.translate = function(key, params) {
                return $translate.instant(key, params);
            };

            $scope.serverurl = $location.protocol()+'://'+$location.host() +
                (($location.port()===80 || $location.port()===443) ? '' : ':'+$location.port());

            $rootScope.tempRequest = null;

            $scope.getRequest = function() {
                if (!$scope.allRequests) {
                    $scope.allRequests = [];
                }
                $scope.editComment = {};
                $scope.approvalComment = {};
                $scope.commentEditVisibility = {};
                Request.get({id:$routeParams.requestId}, function (req) {
                    req.type = Request.convertRequestOptsToType(req);
                    // set date -- to be used in the agreement form
                    var now = new Date();
                    req.date = now.getDate() + '-' + now.getMonth() + '-' + now.getFullYear();
                    $scope.request = req;
                    $rootScope.tempRequest = jQuery.extend( true, {}, req ); // deep copy
                }, function(response) {
                    $rootScope.logErrorResponse(response);
                });
            };

            $scope.getRequests = function() {
                Request.query().$promise.then(function(response) {
                    $scope.allRequests = response ? response : [];
                    $scope.allRequests.forEach(function(req) {
                        req.number = Request.convertRequestNumber(req);
                    });
                }, function(response) {
                    $rootScope.logErrorResponse(response);
                });
            };

            $scope.selections = {
                overview: RequestFilter.selectAll,
                suspended: RequestFilter.selectSuspended,
                claimed: RequestFilter.selectClaimed($rootScope.currentUserId),
                unclaimed: RequestFilter.selectUnclaimed,
                voted: RequestFilter.selectVoted,
                notvoted: RequestFilter.selectNotVoted
            };
            _(Request.getStatusesForRole($scope.currentRole)).forEach(function(status) {
                $scope.selections[status] = RequestFilter.selectByStatus(status);
            });

            $scope.showSelection = function(requests) {
                var selection = $scope.activeSidebar;
                if (requests && selection in $scope.selections) {
                    $scope.requests = $scope.selections[selection](requests);
                } else {
                    $scope.requests = [];
                }
                $scope.displayedCollection = [].concat($scope.requests);
            };

            $scope.$watch('allRequests', function(newValue) {
                if (newValue) {
                    $scope.showSelection(newValue);
                }
            });

            if ($routeParams.requestId) {
                $scope.getRequest();
            } else {
                if ($routeParams.selection && $routeParams.selection in $scope.selections) {
                    $scope.activeSidebar = $routeParams.selection;
                } else {
                    $scope.activeSidebar = 'overview';
                }
                $scope.getRequests();
            }

            $scope.loadTemplate = function() {
                AgreementFormTemplate.get()
                .then(function (template) {
                    $scope.agreementFormTemplate = template;
                }, function (response) {
                    $rootScope.logErrorResponse(response);
                });
            };

            $scope.printAgreementForm = function () {
                window.print();
            };

            if ($route.current.templateUrl === 'app/request/agreementform.html') {
                $scope.loadTemplate();
                AgreementFormTemplate.replaceVariables($scope, 'agreementFormTemplate.contents', 'request', 'template_contents');
            }

            $scope.resetDataLinkageValues = function (request, isOnlyResetReason) {
                if (!isOnlyResetReason) {
                    request.linkageWithPersonalDataNotes = '';
                    request.informedConsent = false;
                }
                request.reasonUsingPersonalData = '';
            };

            $scope.resetPreviousContactValues = function (request) {
                request.previousContactDescription = '';
            };

            $scope.upload_result = {
                    'attachment': '',
                    'agreement': '',
                    'mec_approval': '',
                    'excerpt_list': '',
                    'excerpt_selection': '',
                    'data': ''
            };

            $scope.upload_error = {};

            $scope.fileuploadsubmitted = function(type) {
                $scope.upload_result[type] = '';
                if (type in $scope.upload_error) {
                    delete $scope.upload_error[type];
                } 
            };

            $scope.fileuploadsuccess = function(request, data, type, flow) {
                $scope.lastUploadedFileName = flow.files[flow.files.length-1].name;
                $scope.upload_result[type] = 'success';
                $scope.upload_error[type] = '';
                $scope.$apply();
                var result = new Request(JSON.parse(data));
                //$scope.refresh(request, result);
                request.attachments = result.attachments;
                request.agreementAttachments = result.agreementAttachments;
                request.excerptList = result.excerptList;
                request.dataAttachments = result.dataAttachments;
                request.medicalEthicalCommitteeApprovalAttachments = result.medicalEthicalCommitteeApprovalAttachments;
            };

            $scope.fileuploaderror = function(message, type) {
                console.log('Upload error: ' + message);
                $scope.upload_result[type] = 'error';
                $scope.upload_error[type] = message;
            };

            $scope.start = function() {
                $scope.dataLoading = true;
                new Request().$save(function(request) {
                    $scope.edit(request);
                }, function(response) {
                    $rootScope.logErrorResponse(response);
                    $scope.dataLoading = false;
                });
            };

            /*eslint-disable no-unused-vars*/
            $scope.filterEmptyRequests = function(value, index) {
                return !value;
            };
            /*eslint-enable no-unused-vars*/

            $scope.refresh = function(request, result) {
                result.type = Request.convertRequestOptsToType(result);
                var index = -1;
                for (var i in $scope.allRequests) {
                    if ($scope.allRequests[i].processInstanceId === request.processInstanceId) {
                        index = i;
                        break;
                    }
                }
                $scope.allRequests[index] = result;
                $route.reload();
                $scope.request = result;
            };

            $scope.update = function(request) {
                $scope.dataLoading = true;
                Request.convertRequestTypeToOpts(request); // convert request type
                request.$update(function(result) {
                    $scope.refresh(request, result);
                    $scope.editRequestModal.hide();
                    $scope.dataLoading = false;
                }, function(response) {
                    $rootScope.logErrorResponse(response);
                    $scope.dataLoading = false;
                });
            };

            $scope.removeAgreementFile = function(f) {
                bootbox.confirm($scope.translate('Are you sure you want to delete file ?', {name: f.name}), function(result) {
                    if (result) {
                        var attachment = new RequestAttachment();
                        attachment.requestId = $scope.request.processInstanceId;
                        attachment.id = f.id;
                        attachment.$removeAgreementFile(function() {
                            $scope.request.agreementAttachments.splice($scope.request.agreementAttachments.indexOf(f), 1);
                            bootbox.alert('File ' + f.name + ' deleted.');
                        }, function(response) {
                            $rootScope.logErrorResponse(response);
                        });
                    }
                });
            };

            $scope.removeMECFile = function(f) {
                bootbox.confirm($scope.translate('Are you sure you want to delete file ?', {name: f.name}), function(result) {
                    if (result) {
                        var attachment = new RequestAttachment();
                        attachment.requestId = $scope.request.processInstanceId;
                        attachment.id = f.id;
                        attachment.$removeMECFile(function() {
                            $scope.request.medicalEthicalCommitteeApprovalAttachments.splice($scope.request.medicalEthicalCommitteeApprovalAttachments.indexOf(f), 1);
                            bootbox.alert('File ' + f.name + ' deleted.');
                        }, function(response) {
                            $rootScope.logErrorResponse(response);
                        });
                    }
                });
            };
            
            $scope.removeDataFile = function(f) {
                bootbox.confirm($scope.translate('Are you sure you want to delete file ?', {name: f.name}), function(result) {
                    if (result) {
                        var attachment = new RequestAttachment();
                        attachment.requestId = $scope.request.processInstanceId;
                        attachment.id = f.id;
                        attachment.$removeDataFile(function() {
                            $scope.request.dataAttachments.splice($scope.request.dataAttachments.indexOf(f), 1);
                            bootbox.alert('File ' + f.name + ' deleted.');
                        }, function(response) {
                            $rootScope.logErrorResponse(response);
                        });
                    }
                });
            };

            $scope.removeFile = function(f) {
                bootbox.confirm($scope.translate('Are you sure you want to delete file ?', {name: f.name}), function(result) {
                    if (result) {
                        var attachment = new RequestAttachment();
                        attachment.requestId = $scope.request.processInstanceId;
                        attachment.id = f.id;
                        attachment.$remove(function() {
                            $scope.request.attachments.splice($scope.request.attachments.indexOf(f), 1);
                            bootbox.alert('File ' + f.name + ' deleted.');
                        }, function(response) {
                            $rootScope.logErrorResponse(response);
                        });
                    }
                });
            };

            $scope.remove = function(request) {
                bootbox.confirm($scope.translate('Are you sure you want to delete request ?', {id: request.processInstanceId}), function(result) {
                    if (result) {
                        request.$remove(function() {
                            $scope.allRequests.splice($scope.allRequests.indexOf(request), 1);
                            bootbox.alert('Request ' + request.processInstanceId + ' deleted.');
                        }, function(response) {
                            $rootScope.logErrorResponse(response);
                        });
                    }
                });
            };

            $scope.submitRequest = function(request) {
                $scope.dataLoading = true;
                bootbox.confirm(
                    $scope.translate('Are you sure you want to submit the request? ' +
                        'After submission the request cannot be edited anymore.'),
                    function(confirmed) {
                        if (confirmed) {
                            Request.convertRequestTypeToOpts(request); // convert request type
                            request.$submit(function(result) {
                                $scope.refresh(request, result);
                                $scope.editRequestModal.hide();
                            }, function(response) {
                                $rootScope.logErrorResponse(response);
                            });
                        } else {
                            $scope.dataLoading = false;
                            $scope.$apply();
                        }
                    });
            };

            $scope.submitForApproval = function(request) {
                $scope.dataLoading = true;
                bootbox.confirm(
                        $scope.translate('Are you sure you want to submit the request for approval?'),
                    function(confirmed) {
                        if (confirmed) {
                            request.$submitForApproval(function(result) {
                                $scope.refresh(request, result);
                                $scope.editRequestModal.hide();
                            }, function(response) {
                                $rootScope.logErrorResponse(response);
                            });
                        } else {
                            $scope.dataLoading = false;
                            $scope.$apply();
                        }
                    });
            };

            $scope.finalise = function(request) {
                $scope.dataLoading = true;
                bootbox.confirm(
                        $scope.translate('Are you sure you want to finalise the request?'),
                    function(confirmed) {
                        if (confirmed) {
                            request.$finalise(function(result) {
                                $scope.refresh(request, result);
                                $scope.editRequestModal.hide();
                                $scope.dataLoading = false;
                            }, function(response) {
                                $rootScope.logErrorResponse(response);
                            });
                        } else {
                            $scope.dataLoading = false;
                            $scope.$apply();
                        }
                    });
            };

            $scope.closeRequest = function(request) {
                $scope.dataLoading = true;
                bootbox.confirm(
                    $scope.translate('Are you sure you want to close the request?<br>' +
                            'After closing, no data files can be added.'),
                    function(confirmed) {
                        if (confirmed) {
                            request.$close(function(result) {
                                $scope.refresh(request, result);
                                //$scope.editRequestModal.hide();
                            }, function(response) {
                                $rootScope.logErrorResponse(response);
                            });
                        } else {
                            $scope.dataLoading = false;
                            $scope.$apply();
                        }
                    });
            };

            $scope.reject = function(request) {
                $scope.dataLoading = true;
                bootbox.confirm(
                    '<h4>' + $scope.translate('Are you sure you want to reject the request?') + '</h4>\n' +
                    '<form id="reject" action="">' +
                    $scope.translate('Please enter a reject reason:') + '\n<br><br>\n' +
                    '<textarea type="text" class="form-control" name="rejectReason" id="rejectReason" required autofocus ng-model="rejectReason"></textarea>' +
                    '</form>',
                    function(result) {
                        if (result) {
                            request.rejectReason = jQuery('#rejectReason').val();
                            request.$reject(function(result) {
                                $scope.refresh(request, result);
                                $scope.editRequestModal.hide();
                                $scope.dataLoading = false;
                            }, function(response) {
                                $rootScope.logErrorResponse(response);
                                $scope.dataLoading = false;
                            });
                        } else {
                            $scope.dataLoading = false;
                            $scope.$apply();
                        }
                    }
                );
            };

            $scope.approveSelection = function(request) {
                bootbox.confirm(
                    $scope.translate('Are you sure you want to approve the selection?<br>' +
                    'After approving, lab requests will be generated.'),
                    function(confirmed) {
                        if (confirmed) {
                            request.selectionApproved = true;
                            request.$updateExcerptSelectionApproval(function(result) {
                                $scope.refresh(request, result);
                                $scope.dataLoading = false;
                            }, function(response) {
                                $rootScope.logErrorResponse(response);
                                $scope.dataLoading = false;
                            });
                        }
                    });
            };
            
            $scope.rejectSelection = function(request) {
                bootbox.confirm(
                    $scope.translate('Are you sure you want to reject the selection?<br>' +
                    'After rejecting, the status will return to \'Data delivery.\''),
                    function(confirmed) {
                        if (confirmed) {
                            request.selectionApproved = false;
                            request.$updateExcerptSelectionApproval(function(result) {
                                $scope.refresh(request, result);
                                $scope.dataLoading = false;
                            }, function(response) {
                                $rootScope.logErrorResponse(response);
                                $scope.dataLoading = false;
                            });
                        }
                    });
            };
            
            $scope.uploadDataFile = function(flow) {
                var max_size = 1024*1024*10;
                if (flow.getSize() > max_size) {
                    var mb_size = (flow.getSize()/(1024*1024)).toFixed(1);
                    bootbox.alert($scope.translate('File too large', {'mb_size': mb_size}));
                    flow.cancel();
                } else {
                    flow.upload();
                }
            };

            $scope.view = function(request) {
                $location.path('/request/view/' + request.processInstanceId);
            };
            
            $scope.cancelByEscKey = function (key, request) {
                //console.log('In cancelByEscKey');
                if (key.keyCode === 27) {
                    //console.log('Escape key');
                    $scope.cancel(request);
                }
            };
            
            $scope.cancel = function (request) {
                if ($rootScope.tempRequest.title === null) {
                    request.$remove(function (result) {
                        $scope.allRequests.splice($scope.allRequests.indexOf(request), 1);
                        $scope.refresh(request, result);
                    }, function (response) {
                        $rootScope.logErrorResponse(response);
                        return;
                    });
                } else {
                    // return request to the original
                    $scope.request = jQuery.extend( true, {},  $rootScope.tempRequest ); // deep copy
                }
                $scope.editRequestModal.hide();
            };

            $scope.edit = function(request) {
                if (request) {
                    Request.get({id:request.processInstanceId}, function (data) {
                        data.type = Request.convertRequestOptsToType(data);
                        $scope.request = data;
                        $rootScope.tempRequest = jQuery.extend( true, {}, data ); // deep copy

                        if ($rootScope.tempRequest.title === null) {
                            $scope.request.type = '1';
                        }

                        if ($scope.globals.currentUser.roles.indexOf('scientific_council') !== -1) {
                            if (!$scope.request.approvalVotes) {
                                $scope.request.approvalVotes = {};
                            }
                            if (!($scope.globals.currentUser.userid in $scope.request.approvalVotes)) {
                                $scope.request.approvalVotes[$scope.globals.currentUser.userid] =
                                    new ApprovalVote({value: 'NONE'});
                            }
                        }
                        $scope.editComment = {};
                        $scope.approvalComment = {};
                        $scope.commentEditVisibility = {};
                        if (data.returnDate === null) {
                            data.returnDate = new Date();
                        }
                        $scope.editRequestModal = $modal({
                            id: 'editRequestWindow',
                            scope: $scope,
                            template: '/app/request/edit-request.html',
                            backdrop: 'static'
                        });
                        $scope.dataLoading = false;
                    });
                }
            };

            $scope.open = function($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.opened = true;
            };

            $scope.claim = function(request) {
                request.$claim(function(result) {
                    $scope.refresh(request, result);
                }, function(response) {
                    $rootScope.logErrorResponse(response);
                });
            };

            $scope.unclaim = function(request) {
                request.$unclaim(function(result) {
                    $scope.refresh(request, result);
                }, function(response) {
                    $rootScope.logErrorResponse(response);
                });
            };

            $scope.suspend = function(request) {
                request.$suspend(function(result) {
                    $scope.refresh(request, result);
                }, function(response) {
                    $rootScope.logErrorResponse(response);
                });
            };

            $scope.resume = function(request) {
                request.$resume(function(result) {
                    $scope.refresh(request, result);
                }, function(response) {
                    $rootScope.logErrorResponse(response);
                });
            };

            $scope.size = function(obj) {
                var size = 0, key;
                for (key in obj) {
                    if (obj.hasOwnProperty(key)) { size++; }
                }
                return size;
            };

            $scope.isClaimable = function(status) {
                return _.includes($scope.claimableStates, status);
            };

            $scope.excerptSelectionStates = [
                'DataDelivery',
                'SelectionReview',
                'LabRequest'
            ];
            $scope.isExcerptSelectionState = function(state) {
                return _.includes($scope.excerptSelectionStates, state);
            };

            /**
             * Return true iff the curent user is a requester and the status is 'Open'
             * of the current user is a Palga user and the status is one of the
             * statuses where editing is allowed ('Open', 'Review', 'Approval').
             */
            $scope.isEditStatus = function(status) {
                return ($scope.isRequester() && status === 'Open') ||
                    ($scope.isPalga() && _.includes($scope.editStates, status));
            };

            $scope.autofocus = function() {
                $timeout(function() {
                    jQuery('#contactPersonName').focus();
                });
            };

            $scope.popoverEnablers = {
                previousContactPopover: ['previousContactYes', 'previousContactNo'],
                requestTypePopover: ['radio-numbers', 'radio-excerpts', 'radio-excerpts-PA', 'radio-excerpts-materials',
                                     'radio-excerpts-PA-materials', 'radio-PA', 'radio-materials'],
                dataLinkagePopover: ['linkageWithPersonalDataYes', 'linkageWithPersonalDataNo'],
                informedConsentPopover: ['informedConsentYes', 'informedConsentNo']
            };

            $scope.showPopover = function(id) {
                jQuery('#'+id).popover('show');
            };

            $scope.hidePopover = function(id) {
                $timeout(function() {
                    var enablersHaveFocus = false;
                    _($scope.popoverEnablers[id]).forEach(function(enabler) {
                        if (jQuery('#'+enabler).is(':focus')) {
                            enablersHaveFocus = true;
                        }
                    });
                    if (!enablersHaveFocus) { jQuery('#'+id).popover('hide'); }
                });
            };

            $scope.enablePopovers = function() {
                $timeout(function() {
                _($scope.popoverEnablers).forIn(function(enablers, id) {
                    _(enablers).forEach(function(enabler) {
                        var el = jQuery('#'+enabler);
                        el.focus(function() {
                            $scope.showPopover(id);
                        });
                        el.blur(function() {
                            $scope.hidePopover(id);
                        });
                    });
                });
                });
            };

        }]);
})(window, console, angular, jQuery, _, window.bootbox);
