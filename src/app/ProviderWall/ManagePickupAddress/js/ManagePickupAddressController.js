angular.module('oz.ProviderApp')
  .controller('ManagePickupAddressController', ['$scope', '$state', '$http', '$timeout', '$sce', '$log', '$rootScope', 'ProviderServices','$upload','$stateParams', 'ManageSellerService', 'ManageDeliveryChargesService', 'ManageBranchService', 'PickupAddressList', 'StateDataList', 'CityDataList', 'ZipcodeDataList', function($scope, $state, $http, $timeout, $sce, $log, $rootScope,ProviderServices,$upload, $stateParams, ManageSellerService, ManageDeliveryChargesService, ManageBranchService, PickupAddressList, StateDataList, CityDataList, ZipcodeDataList) {
  
    $log.debug("initialising manage pickup address controller");
    $scope.providers_pickup_address = [];
    $scope.pickup = {};
    $scope.editpickup = {};
    $scope.$state = $state;
    $scope.form = {};
    $scope.submitted = false;
    $scope.editAddress = false;
    $scope.states = [];
    $scope.cities = [];
    $scope.zipcodes = [];
    $scope.Areas = [];

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

    $scope.$watch('$state.$current.locals.globals.StateDataList', function (StateDataList) {
      console.log(StateDataList);
      if (StateDataList.success && StateDataList.success.states.length !== 0) {
        $scope.states = angular.copy(StateDataList.success.states);
      }
    });

    $scope.$watch('$state.$current.locals.globals.CityDataList', function (CityDataList) {
      console.log(CityDataList);
      if (CityDataList.success && CityDataList.success.city.length !== 0) {
        $scope.cities = angular.copy(CityDataList.success.city);
      }
    });

    $scope.$watch('$state.$current.locals.globals.ZipcodeDataList', function (ZipcodeDataList) {
      console.log(ZipcodeDataList);
      if (ZipcodeDataList.success && ZipcodeDataList.success.zipcode.length !== 0) {
        $scope.zipcodes = angular.copy(ZipcodeDataList.success.zipcode);
      }
    });

    $scope.getCityForState = function(state) {
      if (state) {
        ManageDeliveryChargesService.GetCityList(state);
      }
    }

    // // function to handle server side responses
    $scope.handleGetCityListResponse = function(data, state){
      if (data.success) {
        if (data.success.city.length >= 0) {
          $scope.cities = angular.copy(data.success.city);
        } else {
          $scope.cities = [];
        }
        $rootScope.OZNotify(data.success.message,'success'); 
      } else {
        console.log(data.error.message);
        $rootScope.OZNotify(data.error.message,'error');
      }
    };

    var cleanupEventGetCityListDone = $scope.$on("getCityListDone", function(event, message, state){
      $log.debug(message);
      $scope.handleGetCityListResponse(message, state);      
    });

    var cleanupEventGetCityListNotDone = $scope.$on("getCityListNotDone", function(event, message){
      $rootScope.OZNotify("It looks as though we have broken something on our server system. Our support team is notified and will take immediate action to fix it." + message, 'error');   
    });

    $scope.getZipcodeForCity = function(city) {
      if (city) {
        ManageDeliveryChargesService.GetZipcodeList(city);
      }
    }

    // // function to handle server side responses
    $scope.handleGetZipcodeListResponse = function(data, city){
      if (data.success) {
        if (data.success.zipcode.length >= 0) {
          $scope.zipcodes = angular.copy(data.success.zipcode);
        } else {
          $scope.zipcodes = [];
        }
        $rootScope.OZNotify(data.success.message,'success'); 
      } else {
        console.log(data.error.message);
        $rootScope.OZNotify(data.error.message,'error');
      }
    };

    var cleanupEventGetZipcodeListDone = $scope.$on("getZipcodeListDone", function(event, message, city){
      $log.debug(message);
      $scope.handleGetZipcodeListResponse(message, city);      
    });

    var cleanupEventGetZipcodeListNotDone = $scope.$on("getZipcodeListNotDone", function(event, message){
      $rootScope.OZNotify("It looks as though we have broken something on our server system. Our support team is notified and will take immediate action to fix it." + message, 'error');   
    });


    $scope.getAreaForZipcode = function(zipcode) {
      if (zipcode) {
        ManageDeliveryChargesService.GetAreaList(zipcode);
      }
    }

    // // function to handle server side responses
    $scope.handleGetAreaListResponse = function(data, zipcode){
      if (data.success) {
        if (data.success.area.length >= 0) {
          $scope.Areas = angular.copy(data.success.area);
        }
        $rootScope.OZNotify(data.success.message,'success'); 
      } else {
        console.log(data.error.message);
        $rootScope.OZNotify(data.error.message,'error');
      }
    };

    var cleanupEventGetAreaListDone = $scope.$on("getAreaListDone", function(event, message, zipcode){
      $log.debug(message);
      $scope.handleGetAreaListResponse(message, zipcode);      
    });

    var cleanupEventGetAreaListNotDone = $scope.$on("getAreaListNotDone", function(event, message){
      $rootScope.OZNotify("It looks as though we have broken something on our server system. Our support team is notified and will take immediate action to fix it." + message, 'error');   
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


    $scope.enableEditAddress = function(index, address) {
      $scope.editpickup = angular.copy(address);
      $scope.editAddress = true;
      $scope.CurrentAddressIndex = index;
    }

    $scope.cancelEnableEditAddress = function() {
      $scope.editAddress = false;
      $scope.CurrentAddressIndex = '';
      $scope.editpickup = {};
      $scope.form.editPickupAddress.$setPristine();
      $scope.form.editPickupAddress.submitted = false;
    }

    // function to send and stringify user registration data to Rest APIs
    $scope.jsonEditPickupAddressData = function(){
      var Pickupdata = 
      {
        location: {
          'address1': $scope.editpickup.address1,
          'address2': $scope.editpickup.address2,
          'area': $scope.editpickup.area,
          'city': $scope.editpickup.city,
          'country': $scope.editpickup.country,
          'state': $scope.editpickup.state,
          'zipcode': $scope.editpickup.zipcode
        }
      }
      return JSON.stringify(Pickupdata); 
    } 

    // function to handle server side responses
    $scope.handleEditPickupAddressResponse = function(data){
      if (data.success) {
        $state.reload();
        $scope.cancelEnableEditAddress();
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
  
    $scope.editPickupAddress = function(addressid){
      console.log($scope.jsonEditPickupAddressData());
      if ($scope.form.editPickupAddress.$valid) {
        ManageBranchService.updatePickupLocation($scope.jsonEditPickupAddressData(), addressid);
      } else {
        console.log('incorrect data');
        $scope.form.editPickupAddress.submitted = true;
      }
    }

    var cleanupEventEditPickupAddressDone = $scope.$on("updatePickupAddressDone", function(event, message){
      $log.debug(message);
      $scope.handleEditPickupAddressResponse(message);      
    });

    var cleanupEventEditPickupAddressNotDone = $scope.$on("updatePickupAddressNotDone", function(event, message){
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
      cleanupEventEditPickupAddressDone();
      cleanupEventEditPickupAddressNotDone();
    });

}]);

