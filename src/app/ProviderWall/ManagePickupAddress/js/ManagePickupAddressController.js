angular.module('oz.ProviderApp')
  .controller('ManagePickupAddressController', ['$scope', '$state', '$http', '$timeout', '$sce', '$log', '$rootScope', 'ProviderServices','$upload','$stateParams', 'ManageSellerService', 'ManageBranchService', 'PickupAddressList', function($scope, $state, $http, $timeout, $sce, $log, $rootScope,ProviderServices,$upload, $stateParams, ManageSellerService, ManageBranchService, PickupAddressList) {
  
    $log.debug("initialising manage pickup address controller");
    $scope.providers_pickup_address = [];
    $scope.pickup = {};
    $scope.$state = $state;
    $scope.form = {};
    $scope.submitted = false;


    $scope.$watch('$state.$current.locals.globals.PickupAddressList', function (PickupAddressList) {
      console.log(PickupAddressList);
      if (PickupAddressList.success !== undefined && PickupAddressList.success.addresses.length !== 0) {
        $scope.providers_pickup_address = angular.copy(PickupAddressList.success.addresses); 
      } else {
        if(PickupAddressList.error.code=='AL001'){
          $scope.providers_pickup_address = [];
          $rootScope.showModal();
        } else {
          $scope.providers_pickup_address = [];
          $log.debug(PickupAddressList.error.message);
          $rootScope.OZNotify(PickupAddressList.error.message,'error');
        }
      }
    });


    $scope.cancelAddPickupAddress = function(){
      $scope.pickup = {};
      $scope.form.addPickupAddress.$setPristine();
      $scope.form.addPickupAddress.submitted = false;
    };


    // function to send and stringify user registration data to Rest APIs
    $scope.jsonAddPickupAddressData = function(){
      var Pickupdata = 
      {
        location: {
          'address1': $scope.pickup.address1,
          'address2': $scope.pickup.address2,
          'area': $scope.pickup.area,
          'city': $scope.pickup.city,
          'country': $scope.pickup.country,
          'state': $scope.pickup.state,
          'zipcode': $scope.pickup.zipcode
        }
      }
      return JSON.stringify(Pickupdata); 
    } 

    // function to handle server side responses
    $scope.handleAddPickupAddressResponse = function(data){
      if (data.success) {
        $state.reload();
        $scope.cancelAddPickupAddress();
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
  
    $scope.addPickupAddress = function(){
      console.log($rootScope.selectedproviderid);
      console.log($scope.jsonAddPickupAddressData());
      if ($scope.form.addPickupAddress.$valid) {
        ManageBranchService.addPickupLocation($scope.jsonAddPickupAddressData());
      } else {
        console.log('incorrect data');
        $scope.form.addPickupAddress.submitted = true;
      }
    }

    var cleanupEventAddPickupAddressDone = $scope.$on("addPickupAddressDone", function(event, message){
      $log.debug(message);
      $scope.handleAddPickupAddressResponse(message);      
    });

    var cleanupEventAddPickupAddressNotDone = $scope.$on("addPickupAddressNotDone", function(event, message){
      $log.debug(message);
      $rootScope.OZNotify("It looks as though we have broken something on our server system. Our support team is notified and will take immediate action to fix it." + message, 'error');   
    });


    // function to handle server side responses
    $scope.handleDeletePickupAddressResponse = function(data){
      if (data.success) {
        $state.reload();
        // $scope.cancelAddPickupAddress();
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


    $scope.deletePickupAddress = function(addressid) {
      ManageBranchService.deletePickupLocation(addressid);
    }

    var cleanupEventDeletePickupAddressDone = $scope.$on("deletePickupAddressDone", function(event, message){
      $log.debug(message);
      $scope.handleDeletePickupAddressResponse(message);      
    });

    var cleanupEventDeletePickupAddressNotDone = $scope.$on("deletePickupAddressNotDone", function(event, message){
      $log.debug(message);
      $rootScope.OZNotify("It looks as though we have broken something on our server system. Our support team is notified and will take immediate action to fix it." + message, 'error');   
    });


    $scope.$on('$destroy', function(event, message) {
      cleanupEventAddPickupAddressDone();
      cleanupEventAddPickupAddressNotDone();
      cleanupEventDeletePickupAddressDone();
      cleanupEventDeletePickupAddressNotDone();
    });

 }]);

