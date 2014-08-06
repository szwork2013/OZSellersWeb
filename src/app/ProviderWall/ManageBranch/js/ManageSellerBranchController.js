angular.module('oz.ProviderApp')
  .controller('ManageSellerBranchController', ['$scope', '$state', '$http', '$timeout', '$sce', '$log', '$rootScope', 'ProviderServices','$upload','$stateParams', 'ManageSellerService', 'ManageBranchService', 'MyProviderBranchList', 'MySelectedProvider',  function($scope, $state, $http, $timeout, $sce, $log, $rootScope,ProviderServices,$upload, $stateParams, ManageSellerService,ManageBranchService, MyProviderBranchList, MySelectedProvider) {
  
    $log.debug("initialising manage seller branch controller");
    $scope.submitted = false;
    $scope.$state = $state;
    $scope.providers_branch_list = [];
    $scope.addnewbranch = false;
    $scope.support_nos = [];
    $scope.addbranch = {homedelivery: false,pickup: true, chargeinpercent:false , 'deliveryLeadTime' : {'time' : '', 'difference' : 'Minutes'}, 'operationHours' : {'from': {'hours' : '', 'minutes' : '', 'ismeridian': 'AM'}, 'to' : {'hours' : '', 'minutes' : '', 'ismeridian': 'AM'}}};
    $scope.form = {};
    $scope.selectedprovider = {};
    $scope.showBranchDetail = false;
    $scope.editbranch = {};
    $scope.addbranch.timeslots = [{from: {hours:'', minutes: ''}, to: {hours: '', minutes: ''}}, {from: {hours:'', minutes: ''}, to: {hours: '', minutes: ''}}]
    $scope.currentBranchIndex;
    $scope.contact_regex = /^([0-9]{10,13})(,([0-9]{10,13}))*$/;
    var finalStart = '';
    var finalEnd = '';
    var operationStartTimeEdit = '';
    var operationEndTimeEdit = '';
    $scope.edit = {'branch2Meridian' : 'AM', 'branchFromMeridian' : 'AM'};

    $scope.$watch('$state.$current.locals.globals.MyProviderBranchList', function (MyProviderBranchList) {
      console.log(MyProviderBranchList);
      if (MyProviderBranchList.success !== undefined && MyProviderBranchList.success.branches.length !== 0) {
        $scope.providers_branch_list = angular.copy(MyProviderBranchList.success.branches); 
        $rootScope.branches = angular.copy(MyProviderBranchList.success.branches);
        $rootScope.branch = $rootScope.branches[0];
        if (!$rootScope.selectedBranchId) {
          $rootScope.selectedBranchId = $scope.providers_branch_list[0].branchid;
        }
        $scope.addnewbranch = false;
      } else  {
        if (MyProviderBranchList.error != undefined) {
          $scope.providers_branch_list = [];
          $rootScope.branches = [];
          $scope.addnewbranch = true;
          $log.debug(MyProviderBranchList.error.message);
          $rootScope.OZNotify(MyProviderBranchList.error.message, 'error');
        } else {
          $scope.providers_branch_list = [];
          $rootScope.branches = [];
          $scope.addnewbranch = true;
          $log.debug(MyProviderBranchList);
          $rootScope.OZNotify(MyProviderBranchList, 'error');
        } 
      }
    });

    $scope.$watch('$state.$current.locals.globals.MySelectedProvider', function (MySelectedProvider) {
      console.log(MySelectedProvider);
      if (MySelectedProvider.success !== undefined && MySelectedProvider.success.productprovider !== undefined) {
        $scope.selectedprovider = angular.copy(MySelectedProvider.success.productprovider); 
      } else {
        if (MySelectedProvider.error != undefined) {
          $scope.selectedprovider = {};
          $log.debug(MySelectedProvider.error.message);
          $rootScope.OZNotify(MySelectedProvider.error.message, 'error');
        } else {
          $scope.selectedprovider = {};
          $log.debug(MySelectedProvider);
          $rootScope.OZNotify(MySelectedProvider, 'error');
        } 
      }
    });

    var cleanupEventChange_in_provideridDone = $scope.$on("change_in_providerid", function(event, data){
      console.log(data);
      $state.reload();     
    });

    $scope.viewBranchDetail = function(index){
      if (index !== null) {
        $scope.currentBranchIndex = index;
      } else {
        $scope.currentBranchIndex = '';
      }
      $scope.showBranchDetail = !$scope.showBranchDetail;
    }

    $scope.addSlots = function() { 
      $scope.addbranch.timeslots.push({from: {hours:'', minutes: ''}, to: {hours: '', minutes: ''}});
    };

    $scope.removeSlots = function(slot) {
      var timeslots = $scope.addbranch.timeslots;
      for (var i = 0, ii = timeslots.length; i < ii; i++) {
        if (slot === timeslots[i]) { 
          timeslots.splice(i, 1); 
        }
        else {
          timeslots.splice(i,0);
        } 
      }
    };

    $scope.add_provider_branch = function(){
      $scope.addnewbranch = true;
    }

    $scope.cancelAddSellerBranch = function(){
      $scope.form.addBranchForm.$setPristine();
      $scope.form.addBranchForm.submitted = false;
      $scope.addbranch = {homedelivery: false,pickup: false, chargeinpercent:false , 'deliveryLeadTime' : {'time' : '', 'difference' : 'Minutes'}, 'operationHours' : {'from': {'hours' : '', 'minutes' : '', 'ismeridian': 'AM'}, 'to' : {'hours' : '', 'minutes' : '', 'ismeridian': 'AM'}}};
      $scope.addnewbranch = false;
    }
    
    // function to send and stringify user registration data to Rest APIs
    $scope.jsonAddBranchData = function(){
      var supportnos = $scope.addbranch.supportno;
      var timeslots = [];
      var working_from_time = parseInt($scope.addbranch.operationHours.from.hours) + ($scope.addbranch.operationHours.from.minutes)/60;
      var working_to_time = parseInt($scope.addbranch.operationHours.to.hours) + ($scope.addbranch.operationHours.to.minutes)/60;
      for (var i = 0; i < $scope.addbranch.timeslots.length; i++) {
        var from_hrs = parseInt($scope.addbranch.timeslots[i].from.hours);
        var from_mins = ($scope.addbranch.timeslots[i].from.minutes)/60;
        var from_timeslot = from_hrs + from_mins;
        var to_hrs = parseInt($scope.addbranch.timeslots[i].to.hours);
        var to_mins = ($scope.addbranch.timeslots[i].to.minutes)/60;
        var to_timeslot = to_hrs + to_mins;
        timeslots.push({from:from_timeslot, to: to_timeslot});
      } 

      $scope.support_nos = supportnos.split(",");
      if ($scope.addbranch.homedelivery !== true) {
        if ($scope.addbranch.chargeinpercent == true) {
          $scope.addbranch.chargeinpercent = false;
        }
      }
      var Branchdata = 
      {
        branch:
          {
            'branchname' : $scope.addbranch.name,
            'branchcode' : $scope.addbranch.code,
            'location':{
              'address1': $scope.addbranch.address1,
              'address2': $scope.addbranch.address2,
              'area': $scope.addbranch.area,
              'city': $scope.addbranch.city,
              'country': $scope.addbranch.country,
              'state': $scope.addbranch.state,
              'zipcode': $scope.addbranch.pincode
            },
            'delivery':{
              'isprovidehomedelivery': $scope.addbranch.homedelivery,
              'isprovidepickup': $scope.addbranch.pickup,
              'isdeliverychargeinpercent': $scope.addbranch.chargeinpercent
            },
            'contact_supports': $scope.support_nos,
            'branchdescription' : $scope.addbranch.description,
            'note' : $scope.addbranch.note,
            "branch_availability" : {
              'from' : working_from_time,
              'to' : working_to_time
            },
            'deliverytimingslots': timeslots
          }  
      };
      return JSON.stringify(Branchdata); 
    } 

    // function to handle server side responses
    $scope.handleAddBranchResponse = function(data){
      if (data.success) {
        $state.reload();
        $scope.cancelAddSellerBranch();
        $rootScope.OZNotify(data.success.message,'success'); 
      } else {
        if(data.error.code=='AL001'){
          $rootScope.showModal();
        } else {
          console.log(data.error.message);
          $rootScope.OZNotify(data.error.message,'error');
        }
      }
    };
  
    $scope.addSellerBranch = function(){
      if ($scope.form.addBranchForm.$valid) {
        ManageBranchService.addBranch($scope.jsonAddBranchData());    
      } else {
        console.log('incorrect data');
        $scope.form.addBranchForm.submitted = true;
      }
    }

    var cleanupEventAddBranchDone = $scope.$on("addBranchDone", function(event, message){
      $log.debug(message);
      $scope.handleAddBranchResponse(message);      
    });

    var cleanupEventAddBranchNotDone = $scope.$on("addBranchNotDone", function(event, message){
      $log.debug(message);
      $rootScope.OZNotify("It looks as though we have broken something on our server system. Our support team is notified and will take immediate action to fix it." + message, 'error');   
    });


    // Publish Seller Branch Code.....................................................

    // function to handle server side responses
    $scope.handlePublishBranchResponse = function(data){
      if (data.success) {
        $state.reload();
        $rootScope.OZNotify(data.success.message,'success'); 
      } else {
        if(data.error.code=='AL001'){
          $rootScope.showModal();
        } else {
          console.log(data.error.message);
          $rootScope.OZNotify(data.error.message,'error');
        }
      }
    };

    $scope.publishSellerBranch = function(branchid){
      ManageBranchService.publishBranch(branchid);
    }

    var cleanupEventPublishBranchDone = $scope.$on("publishBranchDone", function(event, message){
      $log.debug(message);
      $scope.handlePublishBranchResponse(message);      
    });

    var cleanupEventPublishBranchNotDone = $scope.$on("publishBranchNotDone", function(event, message){
      $log.debug(message);
      $rootScope.OZNotify("It looks as though we have broken something on our server system. Our support team is notified and will take immediate action to fix it." + message, 'error');   
    });

    // Edit Seller Branch Code.....................................................
    $scope.edit.branchFromHours = '';
    $scope.edit.branchFromMinutes = '';
    $scope.edit.branchToHours = '';
    $scope.edit.branchToMinutes = '';
    $scope.edit.branchFromMeridian = '';
    $scope.edit.branch2Meridian = '';
    $scope.openEditBranch = function(branch){
      $scope.editbranch = {};
      $scope.editbranch = angular.copy(branch);
      if($scope.editbranch.branch_availability !== undefined)
      {
              var splittingoperationfromtime = $scope.editbranch.branch_availability.from.split(':');
              var splittingoperationtotime = $scope.editbranch.branch_availability.to.split(':');
              $scope.edit.branchFromHours = splittingoperationfromtime[0];
              $scope.edit.branchFromMinutes = splittingoperationfromtime[1];
              $scope.edit.branchToHours = splittingoperationtotime[0];
              $scope.edit.branchToMinutes = splittingoperationtotime[1];
              if(Number($scope.edit.branchFromHours) === 12)
              {
                $scope.edit.branchFromMeridian = 'PM';
              }
              else if(Number($scope.edit.branchFromHours) > 12 && $scope.edit.branchFromHours !== '00')
              {
                 $scope.edit.branchFromHours = Number($scope.edit.branchFromHours) - 12;
                 $scope.edit.branchFromMeridian = 'PM';
              }
              else if($scope.edit.branchFromHours === '00')
              {
                 $scope.edit.branchFromMeridian = 'AM';
              }
              else if(Number($scope.edit.branchFromHours) < 12)
              {
                $scope.edit.branchFromMeridian = 'AM';
              }

              if(Number($scope.edit.branchToHours) === 12)
              {
                $scope.edit.branch2Meridian = 'PM';
              }
              else if(Number($scope.edit.branchToHours) > 12 && $scope.edit.branchToHours !== '00')
              {
                      $scope.edit.branchToHours = Number($scope.edit.branchToHours) - 12;
                      $scope.edit.branch2Meridian = 'PM';
              }
              else if($scope.edit.branchToHours === '00')
              {
                $scope.edit.branch2Meridian = 'AM';
              }
              else if(Number($scope.edit.branchToHours) < 12)
              {
                $scope.edit.branch2Meridian = 'AM';
              }
            }

      var branch_supportnos = angular.copy($scope.editbranch.contact_supports);
      $scope.editbranch.edit_supportnos = branch_supportnos.toString();
      $('#editBranchModal').modal({ 
        keyboard: false,
        backdrop: 'static',
        show: true
      });
    };

    // function to send and stringify user registration data to Rest APIs
    $scope.jsonEditBranchData = function(){
      var result = $scope.contact_regex.test($scope.editbranch.edit_supportnos);
      if (result) {
        var supportnos = $scope.editbranch.edit_supportnos;
        var finalFromTimeEdit = '';
        var finalToTimeEdit = '';
        if(Number(operationStartTimeEdit) === 24)
        {
            if($scope.edit.branchFromMeridian === 'PM')
            {
              operationStartTimeEdit = 12;
            }
            else {operationStartTimeEdit = '00';}
        }
        if(Number(operationEndTimeEdit) === 24)
        {
            if($scope.edit.branch2Meridian === 'PM')
            {
              operationEndTimeEdit = 12;
            }
            
            else
            {
                operationEndTimeEdit = '00';
            }
        }
        if($scope.edit.branchFromMeridian === 'AM' && Number(operationStartTimeEdit === 12))
        {
          operationStartTimeEdit = '00';
        }
        if($scope.edit.branch2Meridian === 'AM' && Number(operationEndTimeEdit === 12))
        {
          operationEndTimeEdit = '00';
        }
        finalFromTimeEdit = operationStartTimeEdit + ":" + $scope.edit.branchFromMinutes;
        finalToTimeEdit = operationEndTimeEdit + ":" + $scope.edit.branchToMinutes;
        $scope.support_nos = supportnos.split(",");
        if ($scope.editbranch.delivery.isprovidehomedelivery !== true) {
          if ($scope.editbranch.delivery.isdeliverychargeinpercent == true) {
            $scope.editbranch.delivery.isdeliverychargeinpercent = false;
          }
        }
        var Branchdata = 
        {
          branch:
            {
              'branchname' : $scope.editbranch.branchname,
              'branchcode' : $scope.editbranch.branchcode,
              'location':{
                'address1': $scope.editbranch.location.address1,
                'address2': $scope.editbranch.location.address2,
                'area': $scope.editbranch.location.area,
                'city': $scope.editbranch.location.city,
                'country': $scope.editbranch.location.country,
                'state': $scope.editbranch.location.state,
                'zipcode': $scope.editbranch.location.zipcode
              },
              'delivery':{
                'isprovidehomedelivery': $scope.editbranch.delivery.isprovidehomedelivery,
                'isprovidepickup': $scope.editbranch.delivery.isprovidepickup,
                'isdeliverychargeinpercent': $scope.editbranch.delivery.isdeliverychargeinpercent
              },
              'contact_supports': $scope.support_nos,
              'branchdescription' : $scope.editbranch.branchdescription,
              'note' : $scope.editbranch.note,
              // 'delivery_leadtime' : {
              //     'time' : $scope.editbranch.delivery_leadtime.time,
              //     'format' : $scope.editbranch.delivery_leadtime.format
              // },
              "branch_availability" : {
                  'from' : finalFromTimeEdit,
                 'to' : finalToTimeEdit
            }
            }  
        };
        return JSON.stringify(Branchdata); 
      } else {
        return false;
      }
    } 

    // function to handle server side responses
    $scope.handleEditBranchResponse = function(data){
      if (data.success) {
        $('#editBranchModal').modal('hide');
        $state.reload();
        $rootScope.OZNotify(data.success.message,'success'); 
      } else {
        if(data.error.code=='AL001'){
          $rootScope.showModal();
        } else {
          console.log(data.error.message);
          $rootScope.OZNotify(data.error.message,'error');
        }
      }
    };
  
    $scope.editSellerBranch = function(branchid){
      if ($scope.form.editBranchForm.$valid) {
        console.log($scope.jsonEditBranchData());
        // if($scope.editbranchFromMeridian === 'PM')
        // {
        //   operationStartTimeEdit = Number($scope.editbranchFromHours) - 12;
        // }
        // else
        // {
        //   operationStartTimeEdit = $scope.editbranchFromHours;
        // }
        if($scope.edit.branch2Meridian === 'PM')
        {
          operationEndTimeEdit = Number($scope.edit.branchToHours) + 12;
        }
        else
        {
          operationEndTimeEdit = $scope.edit.branchToHours;
        }
        if($scope.edit.branchFromMeridian === 'PM')
        {
          operationStartTimeEdit = Number($scope.edit.branchFromHours) + 12;
        }
        else
        {
          operationStartTimeEdit = $scope.edit.branchFromHours;
        }
        if(($scope.edit.branchFromMeridian === $scope.edit.branch2Meridian) && (Number($scope.edit.branchFromHours)>Number($scope.edit.branchToHours)))
        {
          $rootScope.OZNotify('The opening time cant be greater than the closing time', 'error');
        }
        else
        {
            if ($scope.jsonEditBranchData()) {   
              ManageBranchService.editBranch($scope.jsonEditBranchData(), branchid);
            } else {
              $scope.form.editBranchForm.editcontact.$invalid = true;
              $scope.form.editBranchForm.submitted = true;
            }
      }
      } else {
        console.log('incorrect data');
        $scope.form.editBranchForm.editcontact.$invalid = true;
        console.log($scope.jsonEditBranchData());
        $scope.form.editBranchForm.submitted = true;
      }
    }

    var cleanupEventEditBranchDone = $scope.$on("editBranchDone", function(event, message){
      $log.debug(message);
      $scope.handleEditBranchResponse(message);      
    });

    var cleanupEventEditBranchNotDone = $scope.$on("editBranchNotDone", function(event, message){
      $log.debug(message);
      $rootScope.OZNotify("It looks as though we have broken something on our server system. Our support team is notified and will take immediate action to fix it." + message, 'error');   
    });



    $scope.$on('$destroy', function(event, message) {
      cleanupEventAddBranchDone();
      cleanupEventAddBranchNotDone();
      cleanupEventChange_in_provideridDone();
      cleanupEventPublishBranchDone();
      cleanupEventPublishBranchNotDone();
      cleanupEventEditBranchDone();
      cleanupEventEditBranchNotDone();
    });

 }]);

