angular.module('oz.ProviderApp')
  .controller('ManageDeliveryChargesController', ['$scope', '$state', '$http', '$timeout', '$sce', '$log', '$rootScope', 'ProviderServices','$upload','$stateParams', 'ManageDeliveryChargesService', 'AllBranchDeliveryAreaList', 'CountryData', 'StateData', 'CityData', 'ZipcodeData', function($scope, $state, $http, $timeout, $sce, $log, $rootScope,ProviderServices,$upload, $stateParams, ManageDeliveryChargesService, AllBranchDeliveryAreaList, CountryData, StateData, CityData, ZipcodeData) {
  
    $log.debug("initialising manage delivery charges controller");

    $scope.$state = $state;
    $scope.countries = [];
    $scope.states = [];
    $scope.cities = [];
    $scope.zipcodes = [];
    $scope.deliveryAvailablityArea = [];
    $scope.AreaUnderZipcode = [];
    $scope.delivery = {available: []};
    $scope.delivery_available = [];
    $scope.showAreaUnderZipcode = false;
    $scope.showDeliveryAvailaibility = false;
    $scope.AllBranchAreaList = [];
    $scope.submitted = false;
    $scope.form = {};
    $scope.deliveryChargeError = false;

    $scope.$watch('$state.$current.locals.globals.AllBranchDeliveryAreaList', function (AllBranchDeliveryAreaList) {
      $log.debug(AllBranchDeliveryAreaList);
      if (AllBranchDeliveryAreaList.success && AllBranchDeliveryAreaList.success.branchdeliverycharges.length !== 0) {
        $scope.AllBranchAreaList = angular.copy(AllBranchDeliveryAreaList.success.branchdeliverycharges);
      } else {
        if (AllBranchDeliveryAreaList.success.branchdeliverycharges.length == 0) {
          $scope.AllBranchAreaList = [];
          $log.debug(AllBranchDeliveryAreaList.success.message);
        } else {
          $scope.AllBranchAreaList = [];
          $log.debug(AllBranchDeliveryAreaList.error.message);
          $rootScope.OZNotify(AllBranchDeliveryAreaList.error.message, 'error');
        }
      }
    });

    $scope.$watch('$state.$current.locals.globals.CountryData', function (CountryData) {
      $log.debug(CountryData);
      if (CountryData.success && CountryData.success.country.length !== 0) {
        $scope.countries = angular.copy(CountryData.success.country);
        var result = $scope.countries.indexOf("IN");
        if (result !== -1) {
          $scope.country = 'India';
        } else {
          $scope.country = $scope.countries[0];
        }
      }
    });

    $scope.$watch('$state.$current.locals.globals.StateData', function (StateData) {
      $log.debug(StateData);
      if (StateData.success && StateData.success.states.length !== 0) {
        $scope.states = angular.copy(StateData.success.states);
        var result = $scope.states.indexOf("Maharashtra");
        if (result !== -1) {
          $scope.state = $scope.states[result];
        } else {
          $scope.state = $scope.states[0];
        }
      }
    });

    $scope.$watch('$state.$current.locals.globals.CityData', function (CityData) {
      $log.debug(CityData);
      if (CityData.success && CityData.success.city.length !== 0) {
        $scope.cities = angular.copy(CityData.success.city);
        var result = $scope.cities.indexOf("Pune");
        if (result !== -1) {
          $scope.city = $scope.cities[result];
        } else {
          $scope.city = $scope.cities[0];
        }
      }
    });

    $scope.$watch('$state.$current.locals.globals.ZipcodeData', function (ZipcodeData) {
      $log.debug(ZipcodeData);
      if (ZipcodeData.success && ZipcodeData.success.zipcode.length !== 0) {
        $scope.zipcodes = angular.copy(ZipcodeData.success.zipcode);
        // $scope.zipcode = $scope.zipcodes[0];
      }
    });

    var cleanupEventChange_in_provideridDone = $scope.$on("change_in_providerid", function(event, data){
      $log.debug(data);
      $state.reload();     
    });

    var cleanupEventChange_in_provideridDone = $scope.$on("change_in_branchid", function(event, data){
      $log.debug(data);
      $state.reload();     
    });

    $scope.viewAvailableAreaList = function() {
      $state.reload();    
    }

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
          $scope.city = $scope.cities[0];
        } else {
          $scope.cities = [];
        }
        $rootScope.OZNotify(data.success.message,'success'); 
      } else {
        $log.debug(data.error.message);
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
        $log.debug(data.error.message);
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
        ManageDeliveryChargesService.GetAvailableAreaList(zipcode);
      }
    }

    // // function to handle server side responses
    $scope.handleGetAvailableAreaResponse = function(data, zipcode){
      if (data.success) {
        if (data.success.branchdeliverycharges.length !== 0) {
          $scope.showDeliveryAvailaibility = true;
          $scope.editDeliveryAvailaibility = false;
          $scope.showAreaUnderZipcode = false;
          $scope.deliveryAvailablityArea = angular.copy(data.success.branchdeliverycharges);
        } else {
          $scope.deliveryAvailablityArea = [];
          ManageDeliveryChargesService.GetAreaList(zipcode);
        }        
        $rootScope.OZNotify(data.success.message,'success'); 
      } else {
        $log.debug(data.error.message);
        $rootScope.OZNotify(data.error.message,'error');
      }
    };

    var cleanupEventEditBranchDone = $scope.$on("getAvailableAreaListDone", function(event, message, zipcode){
      $log.debug(message);
      $scope.handleGetAvailableAreaResponse(message, zipcode);      
    });

    var cleanupEventEditBranchNotDone = $scope.$on("getAvailableAreaListNotDone", function(event, message){
      $rootScope.OZNotify("It looks as though we have broken something on our server system. Our support team is notified and will take immediate action to fix it." + message, 'error');   
    });

    // // function to handle server side responses
    $scope.handleGetAreaListResponse = function(data, zipcode){
      if (data.success) {
        if (data.success.area.length >= 0) {
          $scope.showAreaUnderZipcode = true;
          $scope.showDeliveryAvailaibility = false;
          $scope.AreaUnderZipcode = angular.copy(data.success.area);
          if ($scope.deliveryAvailablityArea.length !== 0) {
            $scope.edit_availability = [];
            $scope.showAreaUnderZipcode = false;
            $scope.showDeliveryAvailaibility = false;
            var sorted = [];
            for (var i = 0; i < $scope.AreaUnderZipcode.length; ++i) {
              sorted.push($scope.AreaUnderZipcode[i].toLowerCase());
            }
            for (var i = 0; i < sorted.length; ++i) {
              if ($scope.deliveryAvailablityArea[i]) {
                var result = sorted.indexOf($scope.deliveryAvailablityArea[i].coverage.area);
                if (result !== -1) {     
                  $scope.edit_availability.push({value:$scope.deliveryAvailablityArea[i].value, coverage:{ area:$scope.deliveryAvailablityArea[i].coverage.area,city:$scope.deliveryAvailablityArea[i].coverage.city,zipcode:$scope.deliveryAvailablityArea[i].coverage.zipcode} });
                  $scope.delivery.available.push($scope.deliveryAvailablityArea[i].coverage.area);
                }
              } else {
                $scope.edit_availability.push({value:0, coverage:{ area:sorted[i],city:$scope.deliveryAvailablityArea[result].coverage.city,zipcode:zipcode} });
              }
            }
          } else {
            $scope.delivery_available = [];
            angular.forEach($scope.AreaUnderZipcode, function(area) {
              $scope.delivery_available.push({value:0, coverage:{ area:area,city:'',zipcode:zipcode} });
            });
            $log.debug($scope.delivery_available);
          }
        } 
        $rootScope.OZNotify(data.success.message,'success'); 
      } else {
        $log.debug(data.error.message);
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

    $scope.jsonAddDeliveryAvailabilityData = function(add_availability){
      var AvailabilityData = 
      {
        deliverychargedata:  add_availability 
      };
      return JSON.stringify(AvailabilityData); 
    } 

    $scope.addAreaDeliveryAvailability =function (city, zipcode) {
      var add_availability = [];
      for (var i = 0; i < $scope.delivery_available.length; ++i) {
        var result = $scope.delivery.available.indexOf($scope.delivery_available[i].coverage.area);
        if (result !== -1) {          
          add_availability.push({value:$scope.delivery_available[i].value, coverage:{ area:$scope.delivery_available[i].coverage.area,city:city,zipcode:$scope.delivery_available[i].coverage.zipcode} });
        };
      }
      if ($scope.form.deliveryChargeForm.$valid) {
        if (add_availability.length > 0) {
          var data = $scope.jsonAddDeliveryAvailabilityData(add_availability);
          $scope.deliveryChargeError = false;
          ManageDeliveryChargesService.AddDeliveryAvailability(data);
        }
      } else {
        $scope.deliveryChargeError = true;
        $scope.form.deliveryChargeForm.submitted = true;
      }
    }

    // // function to handle server side responses
    $scope.handleAddDeliveryAvailabilityResponse = function(data){
      if (data.success) {
        $log.debug(data);
        $scope.form.deliveryChargeForm.submitted = false;
        $rootScope.OZNotify(data.success.message,'success'); 
      } else {
        $log.debug(data.error.message);
        $rootScope.OZNotify(data.error.message,'error');
      }
    };

    var cleanupEventAddDeliveryAvailabilityDone = $scope.$on("addDeliveryAvailabilityDone", function(event, message){
      $scope.handleAddDeliveryAvailabilityResponse(message);      
    });

    var cleanupEventAddDeliveryAvailabilityNotDone = $scope.$on("addDeliveryAvailabilityNotDone", function(event, message){
      $rootScope.OZNotify("It looks as though we have broken something on our server system. Our support team is notified and will take immediate action to fix it." + message, 'error');   
    });

    $scope.cancelEditDelivery = function(){
      $scope.editDeliveryAvailaibility = false;
      $scope.showDeliveryAvailaibility = true;
    }

    $scope.showEditDeliveryAvailablity= function(zipcode) {
      $scope.editDeliveryAvailaibility = true;
      $scope.showDeliveryAvailaibility = false;
      ManageDeliveryChargesService.GetAreaList(zipcode);
    }

    $scope.jsonEditDeliveryAvailabilityData = function(data){
      var AvailabilityData = 
      {
        deliverychargedata:  data 
      };
      return JSON.stringify(AvailabilityData); 
    } 

    $scope.editAreaDeliveryAvailability =function (city, zipcode) {
      var update_availability = [];
      for (var i = 0; i < $scope.edit_availability.length; ++i) {
        var result = $scope.delivery.available.indexOf($scope.edit_availability[i].coverage.area);
        if (result !== -1) {          
          update_availability.push({value:$scope.edit_availability[i].value, coverage:{ area:$scope.edit_availability[i].coverage.area,city:city,zipcode:$scope.edit_availability[i].coverage.zipcode} });
        };
      }
      if (update_availability.length > 0) {
        var data = $scope.jsonEditDeliveryAvailabilityData(update_availability);
        $log.debug(data);
        ManageDeliveryChargesService.EditDeliveryAvailability(data);
      }
    }

    // // function to handle server side responses
    $scope.handleEditDeliveryAvailabilityResponse = function(data){
      if (data.success) {
        $log.debug(data);
        $rootScope.OZNotify(data.success.message,'success'); 
      } else {
        $log.debug(data.error.message);
        $rootScope.OZNotify(data.error.message,'error');
      }
    };

    var cleanupEventEditDeliveryAvailabilityDone = $scope.$on("editDeliveryAvailabilityDone", function(event, message){
      $scope.handleEditDeliveryAvailabilityResponse(message);      
    });

    var cleanupEventEditDeliveryAvailabilityNotDone = $scope.$on("editDeliveryAvailabilityNotDone", function(event, message){
      $rootScope.OZNotify("It looks as though we have broken something on our server system. Our support team is notified and will take immediate action to fix it." + message, 'error');   
    });

    $scope.$on('$destroy', function(event, message) {
      cleanupEventEditBranchDone();
      cleanupEventEditBranchNotDone();
      cleanupEventGetAreaListDone();
      cleanupEventGetAreaListNotDone();
      cleanupEventGetZipcodeListDone();
      cleanupEventGetZipcodeListNotDone();
      cleanupEventGetCityListDone();
      cleanupEventGetCityListNotDone();
      cleanupEventAddDeliveryAvailabilityDone();
      cleanupEventAddDeliveryAvailabilityNotDone();
      cleanupEventEditDeliveryAvailabilityDone();
      cleanupEventEditDeliveryAvailabilityNotDone();
    });

 }]);

