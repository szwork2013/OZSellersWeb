angular.module('oz.ProviderApp')
  .controller('ManageDeliveryChargesController', ['$scope', '$state', '$http', '$timeout', '$sce', '$log', '$rootScope', 'ProviderServices','$upload','$stateParams', 'ManageDeliveryChargesService', 'AllBranchDeliveryAreaList', 'CountryData', 'StateData', 'CityData', 'ZipcodeData', 'AreaData', 'checkIfSessionExist', function($scope, $state, $http, $timeout, $sce, $log, $rootScope,ProviderServices,$upload, $stateParams, ManageDeliveryChargesService, AllBranchDeliveryAreaList, CountryData, StateData, CityData, ZipcodeData, AreaData, checkIfSessionExist) {
  
    $log.debug("initialising manage delivery charges controller");

    $scope.$state = $state;
    $scope.countries = [];
    $scope.states = [];
    $scope.cities = [];
    $scope.zipcodes = [];
    $scope.locationareas = [];
    $scope.submitted = false;
    $scope.form = {};
    $scope.AllBranchAreaList = [];
    $scope.deliveryAvailablityArea = [];
    $scope.AreaUnderZipcode = [];
    $scope.edit_delivery_available = [];
    $scope.viewAreaAvailability = false;
    $scope.viewAddAreaAvailability = false;
    $scope.viewEditAreaAvailability = false;
    var availability_for_area = '';
    var availability_for_zipcode = '';
    var availability_for_city = '';
    $scope.locationarea = {};
    $scope.deliveryChargeError = false;

    $scope.$watch('$state.$current.locals.globals.checkIfSessionExist', function (checkIfSessionExist) {
      if (checkIfSessionExist.error) {
        $rootScope.showModal();
      };
    });

    $scope.$watch('$state.$current.locals.globals.AllBranchDeliveryAreaList', function (AllBranchDeliveryAreaList) {
      $log.debug(AllBranchDeliveryAreaList);
      if (AllBranchDeliveryAreaList.success && AllBranchDeliveryAreaList.success.branchdeliverycharges.length !== 0) {
        $scope.AllBranchAreaList = angular.copy(AllBranchDeliveryAreaList.success.branchdeliverycharges);
      } else {
        if (AllBranchDeliveryAreaList.success && AllBranchDeliveryAreaList.success.branchdeliverycharges.length == 0) {
          $scope.AllBranchAreaList = [];
          $log.debug(AllBranchDeliveryAreaList.success.message);
        } else if (AllBranchDeliveryAreaList.error && AllBranchDeliveryAreaList.error.message) {
          $scope.AllBranchAreaList = [];
          $log.debug(AllBranchDeliveryAreaList.error.message);
          $rootScope.OZNotify(AllBranchDeliveryAreaList.error.message, 'error');
        } else {
          $scope.AllBranchAreaList = [];
          $log.debug(AllBranchDeliveryAreaList);
          $rootScope.OZNotify(AllBranchDeliveryAreaList, 'error');
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
      if (ZipcodeData.success && ZipcodeData.success.zipcode.length !== 0) {
        $scope.zipcodes = angular.copy(ZipcodeData.success.zipcode);
      }
    });

    $scope.$watch('$state.$current.locals.globals.AreaData', function (AreaData) {
      console.log(AreaData);
      if (AreaData.success && AreaData.success.location.length !== 0) {
        $scope.locationareas = angular.copy(AreaData.success.location);
      }
    });

    var cleanupEventChange_in_provideridDone = $scope.$on("change_in_providerid", function(event, data){
      $log.debug('change_in_providerid ' + data);
      $scope.deliveryAvailablityArea = [];
      $scope.AreaUnderZipcode = [];
      $scope.edit_delivery_available = [];
      $scope.viewAreaAvailability = false;
      $scope.viewAddAreaAvailability = false;
      $scope.viewEditAreaAvailability = false;
      var zipcode = document.getElementById('zipcode');
      if (zipcode && zipcode.value !== null) {
        zipcode.value = '';
      }      
      var area = document.getElementById('area');
      if (area && area.value !== null) {
        area.value = '';
      }   
      $state.reload();     
    });

    var cleanupEventChange_in_provideridDone = $scope.$on("change_in_branchid", function(event, data){
      $log.debug('change_in_branchid ' + data);
      $scope.deliveryAvailablityArea = [];
      $scope.AreaUnderZipcode = [];
      $scope.edit_delivery_available = [];
      $scope.viewAreaAvailability = false;
      $scope.viewAddAreaAvailability = false;
      $scope.viewEditAreaAvailability = false;
      var zipcode = document.getElementById('zipcode');
      if (zipcode && zipcode.value !== null) {
        zipcode.value = '';
      }      
      var area = document.getElementById('area');
      if (area && area.value !== null) {
        area.value = '';
      }   
      $state.reload();     
    });


    $scope.handleGetAllAreaAvailabilityResponse = function(data){
      if (data.success) {
        $log.debug(data);
        if (data.success && data.success.branchdeliverycharges.length !== 0) {
          $scope.AllBranchAreaList = angular.copy(data.success.branchdeliverycharges);
          $rootScope.OZNotify(data.success.message,'success'); 
        } else if (data.success && data.success.branchdeliverycharges.length == 0) {
          $scope.AllBranchAreaList = [];
          $log.debug(data.success.message);
        }        
      } else {
        if(data.error.code=='AL001'){
          $rootScope.showModal();
        } else {
          $log.debug(data.error.message);
          $rootScope.OZNotify(data.error.message,'error');
        }
      }
      $rootScope.hideSpinner();
    };

    $scope.viewAvailableAreaList = function() {
      $rootScope.showSpinner();
      ManageDeliveryChargesService.GetAllAreaAvailabilityForBranch();    
    }

    var cleanupEventGetAllAreaAvailabilityDone = $scope.$on("getAllAreaAvailabilityDone", function(event, message, state){
      $log.debug(message);
      $scope.handleGetAllAreaAvailabilityResponse(message);      
    });

    var cleanupEventGetAllAreaAvailabilityNotDone = $scope.$on("getAllAreaAvailabilityNotDone", function(event, message){
      $rootScope.hideSpinner();
      $rootScope.OZNotify("It looks as though we have broken something on our server system. Our support team is notified and will take immediate action to fix it." + message, 'error');   
    });

    $scope.getCityForState = function(state) {
      if (state) {
        $rootScope.showSpinner();
        ManageDeliveryChargesService.GetCityList(state);
      }
    }

    // function to handle server side responses
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
        if(data.error.code=='AL001'){
          $rootScope.showModal();
        } else {
          $log.debug(data.error.message);
          $rootScope.OZNotify(data.error.message,'error');
        }
      }
      $rootScope.hideSpinner();
    };

    var cleanupEventGetCityListDone = $scope.$on("getCityListDone", function(event, message, state){
      $log.debug(message);
      $scope.handleGetCityListResponse(message, state);      
    });

    var cleanupEventGetCityListNotDone = $scope.$on("getCityListNotDone", function(event, message){
      $rootScope.hideSpinner();
      $rootScope.OZNotify("It looks as though we have broken something on our server system. Our support team is notified and will take immediate action to fix it." + message, 'error');   
    });

    $scope.getZipcodeForCity = function(city) {
      if (city) {
        $rootScope.showSpinner();
        ManageDeliveryChargesService.GetZipcodeList(city);
      }
    }

    // function to handle server side responses
    $scope.handleGetZipcodeListResponse = function(data, city){
      if (data.success) {
        if (data.success.zipcode.length >= 0) {
          $scope.zipcodes = angular.copy(data.success.zipcode);
        } else {
          $scope.zipcodes = [];
        }
        $rootScope.OZNotify(data.success.message,'success'); 
      } else {
        if(data.error.code=='AL001'){
          $rootScope.showModal();
        } else {
          $log.debug(data.error.message);
          $rootScope.OZNotify(data.error.message,'error');
        }
      }
      $rootScope.hideSpinner();
    };

    var cleanupEventGetZipcodeListDone = $scope.$on("getZipcodeListDone", function(event, message, city){
      $log.debug(message);
      $scope.handleGetZipcodeListResponse(message, city);      
    });

    var cleanupEventGetZipcodeListNotDone = $scope.$on("getZipcodeListNotDone", function(event, message){
      $rootScope.hideSpinner();
      $rootScope.OZNotify("It looks as though we have broken something on our server system. Our support team is notified and will take immediate action to fix it." + message, 'error');   
    });

    $scope.getAvailabilityForArea = function(area) {
      $scope.locationarea = angular.copy(area);
      availability_for_area = area.area;
      availability_for_zipcode = area.zipcode;
      availability_for_city = area.city;
      if(availability_for_area) {
        var zipcode = document.getElementById('zipcode');
        if (zipcode.value !== null) {
          zipcode.value = '';
        }      
        $rootScope.showSpinner();
        var available_areas = [];
        $scope.delivery_available = [];
        $scope.add_availability = [];
        $scope.viewAddAreaAvailability = false;
        for (var i = 0; i < $scope.AllBranchAreaList.length; i++) {
          available_areas.push($scope.AllBranchAreaList[i].coverage.area);
        }
        var result = available_areas.indexOf(availability_for_area.toLowerCase());
        if (result !== -1) {
          if (available_areas[result] == $scope.AllBranchAreaList[result].coverage.area) {
            $scope.viewAreaAvailability = true;
            $scope.delivery_available.push({value:$scope.AllBranchAreaList[result].value, coverage:{area:$scope.AllBranchAreaList[result].coverage.area, city:$scope.AllBranchAreaList[result].coverage.city, zipcode:$scope.AllBranchAreaList[result].coverage.zipcode}, available:true});
            $scope.edit_delivery_available = angular.copy($scope.delivery_available);
            $rootScope.hideSpinner();
          } 
        } else {
          $scope.viewAddAreaAvailability = true;
          $scope.viewEditAreaAvailability = false;
          $scope.add_availability.push({value:0, coverage:{area:availability_for_area, city:availability_for_city, zipcode:availability_for_zipcode}, available:false})
          $rootScope.hideSpinner();
        }          
      }
    }

    $scope.getAreaForZipcode = function(zipcode) {
      if (zipcode) {
        availability_for_zipcode = zipcode;
        $rootScope.showSpinner();
        var area = document.getElementById('area');
        if (area.value !== null) {
          area.value = '';
        }
        ManageDeliveryChargesService.GetAreaList(zipcode);
      }
    }

    // // function to handle server side responses
    $scope.handleGetAreaListResponse = function(data, zipcode){
      if (data.success) {
        if (data.success.area.length > 0) {
          console.log(data.success.area);
          $scope.AreaUnderZipcode = angular.copy(data.success.area);
          var sorted = [];
          for (var i = 0; i < $scope.AreaUnderZipcode.length; ++i) {
            sorted.push($scope.AreaUnderZipcode[i].toLowerCase());
          }
          ManageDeliveryChargesService.GetAvailableAreaList(zipcode, sorted);
        } 
        $rootScope.OZNotify(data.success.message,'success'); 
      } else {
        if(data.error.code=='AL001'){
          $rootScope.showModal();
        } else {
          $log.debug(data.error.message);
          $rootScope.OZNotify(data.error.message,'error');
        }
      }
    };

    var cleanupEventGetAreaListDone = $scope.$on("getAreaListDone", function(event, message, zipcode){
      $log.debug(message);
      $scope.handleGetAreaListResponse(message, zipcode);      
    });

    var cleanupEventGetAreaListNotDone = $scope.$on("getAreaListNotDone", function(event, message){
      $rootScope.hideSpinner();
      $rootScope.OZNotify("It looks as though we have broken something on our server system. Our support team is notified and will take immediate action to fix it." + message, 'error');   
    });


    
    // function to handle server side responses
    $scope.handleGetAvailableAreaResponse = function(data, zipcode, arealist){
      if (data.success) {
        if (data.success.branchdeliverycharges.length !== 0) {
          $scope.viewAreaAvailability = true;
          $scope.viewAddAreaAvailability = false;
          $scope.viewEditAreaAvailability = false;
          $scope.delivery_available = [];
          var deliveryArea = [];
          var city = '';
          $scope.deliveryAvailablityArea = angular.copy(data.success.branchdeliverycharges);
          city = $scope.deliveryAvailablityArea[0].coverage.city;
          for (var i = 0; i < $scope.deliveryAvailablityArea.length; i++) {
            deliveryArea.push($scope.deliveryAvailablityArea[i].coverage.area);
          }

          for (var i = 0; i < arealist.length; i++) {
            var result = deliveryArea.indexOf(arealist[i]);
            if (result !== -1) {
              if (deliveryArea[result] == $scope.deliveryAvailablityArea[result].coverage.area) {
                $scope.delivery_available.push({value:$scope.deliveryAvailablityArea[result].value, coverage:{area:$scope.deliveryAvailablityArea[result].coverage.area, city:city, zipcode:zipcode}, available:true})
              }
            } else {
                $scope.delivery_available.push({value:0, coverage:{area:arealist[i], city:city, zipcode:zipcode}, available:false})
            }
          } 
          console.log($scope.delivery_available);
          $scope.edit_delivery_available = angular.copy($scope.delivery_available);
        } else {
          $scope.add_availability = [];
          $scope.viewAreaAvailability = false;
          $scope.viewAddAreaAvailability = true;
          $scope.viewEditAreaAvailability = false;
          for (var i = 0; i < arealist.length; i++) {
            $scope.add_availability.push({value:0, coverage:{area:arealist[i], city:availability_for_city, zipcode:zipcode}, available:false})
          }
        } 
        $rootScope.OZNotify(data.success.message,'success'); 
      } else {
        if(data.error.code=='AL001'){
          $rootScope.showModal();
        } else {
          $log.debug(data.error.message);
          $rootScope.OZNotify(data.error.message,'error');
        }
      }
      $rootScope.hideSpinner();
    };

    var cleanupEventGetAvailableAreaListDone = $scope.$on("getAvailableAreaListDone", function(event, message, zipcode, arealist){
      $log.debug(message);
      $scope.handleGetAvailableAreaResponse(message, zipcode, arealist);      
    });

    var cleanupEventGetAvailableAreaListNotDone = $scope.$on("getAvailableAreaListNotDone", function(event, message){
      $rootScope.hideSpinner();
      $rootScope.OZNotify("It looks as though we have broken something on our server system. Our support team is notified and will take immediate action to fix it." + message, 'error');   
    });

    $scope.jsonAddDeliveryAvailabilityData = function(add_availability){
      var AvailabilityData = 
      {
        deliverychargedata:  add_availability 
      };
      return JSON.stringify(AvailabilityData); 
    } 

    $scope.addAreaDeliveryAvailability =function (city, add_availability) {
      if ($scope.form.addDeliveryChargeForm.$valid) {
        availability_for_city = city;
        if (add_availability.length > 0) {
          $rootScope.showSpinner();
          var zipcode = add_availability[0].coverage.zipcode;
          var data = $scope.jsonAddDeliveryAvailabilityData(add_availability);
          $log.debug(data);
          $scope.deliveryChargeError = false;
          ManageDeliveryChargesService.AddDeliveryAvailability(data, zipcode);
        }
      } else {
        $scope.deliveryChargeError = true;
        $scope.form.addDeliveryChargeForm.submitted = true;
      }
    }

    // // function to handle server side responses
    $scope.handleAddDeliveryAvailabilityResponse = function(data, zipcode){
      if (data.success) {
        $log.debug(data);
        $scope.form.addDeliveryChargeForm.submitted = false;
        $state.reload();
        var ele_zipcode = document.getElementById('zipcode');
        var ele_area = document.getElementById('area');
        if (ele_zipcode && ele_zipcode.value == '' && ele_area.value !== null) {
          for (var i = 0; i < $scope.add_availability.length; i++) {
            if($scope.add_availability[i].available) {
              $scope.delivery_available = [];
              $scope.viewAreaAvailability = true;
              $scope.viewAddAreaAvailability = false;
              $scope.viewEditAreaAvailability = false;
              $scope.delivery_available.push({value:$scope.add_availability[i].value, coverage:{area:$scope.add_availability[i].coverage.area, city:$scope.add_availability[i].coverage.city, zipcode:$scope.add_availability[i].coverage.zipcode}, available:true});
              $scope.edit_delivery_available = angular.copy($scope.delivery_available);
            } 
          };
        } else {
          $scope.getAreaForZipcode(zipcode);
        } 
        $rootScope.OZNotify(data.success.message,'success'); 
      } else {
        if(data.error.code=='AL001'){
          $rootScope.showModal();
        } else {
          $log.debug(data.error.message);
          $rootScope.OZNotify(data.error.message,'error');
        }
      }
      $rootScope.hideSpinner();
    };

    var cleanupEventAddDeliveryAvailabilityDone = $scope.$on("addDeliveryAvailabilityDone", function(event, message, zipcode){
      $scope.handleAddDeliveryAvailabilityResponse(message, zipcode);      
    });

    var cleanupEventAddDeliveryAvailabilityNotDone = $scope.$on("addDeliveryAvailabilityNotDone", function(event, message){
      $rootScope.hideSpinner();
      $rootScope.OZNotify("It looks as though we have broken something on our server system. Our support team is notified and will take immediate action to fix it." + message, 'error');   
    });

    $scope.cancelEditDelivery = function(){
      $scope.viewAreaAvailability = true;
      $scope.viewAddAreaAvailability = false;
      $scope.viewEditAreaAvailability = false;
    }

    $scope.showEditDeliveryAvailablity= function(zipcode) {
      $scope.viewAreaAvailability = false;
      $scope.viewAddAreaAvailability = false;
      $scope.viewEditAreaAvailability = true;
    }

    $scope.jsonEditDeliveryAvailabilityData = function(data){
      if (data.length !== 0) {
        var AvailabilityData = 
        {
          deliverychargedata:  data 
        };
        return JSON.stringify(AvailabilityData); 
      }
    } 

    $scope.editAreaDeliveryAvailability = function(editDeliveryCharge){
      var zipcode = editDeliveryCharge[0].coverage.zipcode;
      console.log(zipcode);
      if ($scope.form.editDeliveryChargeForm.$valid) {
        $rootScope.showSpinner();
        $scope.deliveryChargeError = false;
        $scope.form.editDeliveryChargeForm.submitted = false;
        var data = $scope.jsonEditDeliveryAvailabilityData(editDeliveryCharge);
        $log.debug(data);
        ManageDeliveryChargesService.EditDeliveryAvailability(data, zipcode);
      } else {
        $scope.deliveryChargeError = true;
        $scope.form.editDeliveryChargeForm.submitted = true;
      }
    }

    // // function to handle server side responses
    $scope.handleEditDeliveryAvailabilityResponse = function(data, zipcode){
      if (data.success) {
        $log.debug(data);
        $scope.viewEditAreaAvailability = false;
        console.log(zipcode);
        $state.reload();
        var ele_zipcode = document.getElementById('zipcode');
        var ele_area = document.getElementById('area');
        if (ele_zipcode && ele_zipcode.value == '' && ele_area.value !== null) {
          for (var i = 0; i < $scope.edit_delivery_available.length; i++) {
            if(!$scope.edit_delivery_available[i].available) {
              $scope.add_availability = [];
              $scope.viewAreaAvailability = false;
              $scope.viewAddAreaAvailability = true;
              $scope.viewEditAreaAvailability = false;
              $scope.add_availability.push({value:0, coverage:{area:$scope.edit_delivery_available[i].coverage.area, city:$scope.edit_delivery_available[i].coverage.city, zipcode:$scope.edit_delivery_available[i].coverage.zipcode}, available:false});
            } else {
              $scope.delivery_available = [];
              $scope.viewAreaAvailability = true;
              $scope.viewAddAreaAvailability = false;
              $scope.viewEditAreaAvailability = false;
              $scope.delivery_available.push({value:$scope.edit_delivery_available[i].value, coverage:{area:$scope.edit_delivery_available[i].coverage.area, city:$scope.edit_delivery_available[i].coverage.city, zipcode:$scope.edit_delivery_available[i].coverage.zipcode}, available:true});
              $scope.edit_delivery_available = angular.copy($scope.delivery_available);
            }
          };
        } else {
          $scope.getAreaForZipcode(zipcode);
        } 
        $rootScope.OZNotify(data.success.message,'success'); 
      } else {
        if(data.error.code=='AL001'){
          $rootScope.showModal();
        } else {
          $log.debug(data.error.message);
          $rootScope.OZNotify(data.error.message,'error');
        }
      }
      $rootScope.hideSpinner();
    };

    var cleanupEventEditDeliveryAvailabilityDone = $scope.$on("editDeliveryAvailabilityDone", function(event, message, zipcode){
      $scope.handleEditDeliveryAvailabilityResponse(message, zipcode);      
    });

    var cleanupEventEditDeliveryAvailabilityNotDone = $scope.$on("editDeliveryAvailabilityNotDone", function(event, message){
      $rootScope.hideSpinner();
      $rootScope.OZNotify("It looks as though we have broken something on our server system. Our support team is notified and will take immediate action to fix it." + message, 'error');   
    });

    $scope.$on('$destroy', function(event, message) {
      cleanupEventGetAvailableAreaListDone();
      cleanupEventGetAvailableAreaListNotDone();
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
      cleanupEventGetAllAreaAvailabilityDone();
      cleanupEventGetAllAreaAvailabilityNotDone();
    });

 }]);

