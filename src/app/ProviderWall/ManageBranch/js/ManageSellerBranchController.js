angular.module('oz.ProviderApp')
  .controller('ManageSellerBranchController', ['$scope', '$state', '$http', '$timeout', '$sce', '$log', '$rootScope', 'ProviderServices','$upload','$stateParams', 'ManageSellerService', 'ManageBranchService', 'MyProviderBranchList', 'MySelectedProvider',  function($scope, $state, $http, $timeout, $sce, $log, $rootScope,ProviderServices,$upload, $stateParams, ManageSellerService,ManageBranchService, MyProviderBranchList, MySelectedProvider) {
  
    $log.debug("initialising manage seller branch controller");
    $scope.submitted = false;
    $scope.$state = $state;
    $scope.providers_branch_list = [];
    $scope.addnewbranch = false;
    $scope.support_nos = [];
    $scope.addbranch = {homedelivery: false,pickup: true, chargeinpercent:false };
    $scope.form = {};
    $scope.selectedprovider = {};
    $scope.showBranchDetail = false;
    $scope.editbranch = {};
    $scope.currentBranchIndex;
    $scope.contact_regex = /^([0-9]{10,13})(,([0-9]{10,13}))*$/;

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

    $scope.add_provider_branch = function(){
      $scope.addnewbranch = true;
    }

    $scope.cancelAddSellerBranch = function(){
      $scope.form.addBranchForm.$setPristine();
      $scope.form.addBranchForm.submitted = false;
      $scope.addbranch = {homedelivery: false,pickup: false, chargeinpercent:false };
      $scope.addnewbranch = false;
    }
    
    // function to send and stringify user registration data to Rest APIs
    $scope.jsonAddBranchData = function(){
      var supportnos = $scope.addbranch.supportno;
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
            'note' : $scope.addbranch.note
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
    $scope.openEditBranch = function(branch){
      $scope.editbranch = angular.copy(branch);
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
              'note' : $scope.editbranch.note
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
        if ($scope.jsonEditBranchData()) {
          ManageBranchService.editBranch($scope.jsonEditBranchData(), branchid);
        } else {
          $scope.form.editBranchForm.editcontact.$invalid = true;
          $scope.form.editBranchForm.submitted = true;
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

