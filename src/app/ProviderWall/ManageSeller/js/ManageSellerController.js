angular.module('oz.ProviderApp')
  .controller('ManageSellerController', ['$scope', '$state', '$http', '$timeout', '$sce', '$log', '$rootScope', 'ProviderServices','$upload','$stateParams', 'ManageSellerService', 'ManageBranchService', 'MyProviderList', 'ProviderCategoryList', 'OrderStatusList', function($scope, $state, $http, $timeout, $sce, $log, $rootScope,ProviderServices,$upload, $stateParams, ManageSellerService,ManageBranchService, MyProviderList, ProviderCategoryList, OrderStatusList) {
  
    $log.debug("initialising manage seller controller");
    $scope.submitted = false;
    $scope.$state = $state;
    $scope.addprovider = false;
    $scope.form = {};
    $scope.addseller = {cod: false, online:true};
    $scope.addSellerLogo = false;
    $scope.editseller = {};
    $scope.providers_list = [];
    $scope.providers_category_list = [];
    $scope.order_status_list = [];
    $scope.edit_order_status_list = [];
    $scope.sellercategory = {categoryid: '', categoryname: ''};
    var file;
    var fileUpdate;
    $scope.currentSellerIndex;

    $scope.$watch('$state.$current.locals.globals.MyProviderList', function (MyProviderList) {
      console.log(MyProviderList);
      if (MyProviderList.success !== undefined && MyProviderList.success.providers.length !== 0) {
        $scope.providers_list = angular.copy(MyProviderList.success.providers); 
        $rootScope.providers = angular.copy(MyProviderList.success.providers); 
        $rootScope.provider =  $rootScope.providers[0];
        if (!$rootScope.selectedproviderid) {
          $rootScope.selectedproviderid = $scope.providers_list[0].providerid;
        } else {
          $rootScope.selectedproviderid = $rootScope.selectedproviderid;
        }
      } else {
        $scope.providers_list = [];
        $rootScope.providers = [];
        $scope.addprovider = true;
        $log.debug(MyProviderList.error.message);
      } 
    });

    $scope.$watch('$state.$current.locals.globals.ProviderCategoryList', function (ProviderCategoryList) {
      console.log(ProviderCategoryList);
      if (ProviderCategoryList.success !== undefined && ProviderCategoryList.success.category.length !== 0) {
        $scope.providers_category_list = angular.copy(ProviderCategoryList.success.category); 
      } else {
        if(ProviderCategoryList.error.code=='AL001'){
          $scope.providers_category_list = [];
          $rootScope.showModal();
        } else {
          $scope.providers_category_list = [];
          $log.debug(ProviderCategoryList.error.message);
          $rootScope.OZNotify(ProviderCategoryList.error.message,'error');
        }
      }
    });

    $scope.$watch('$state.$current.locals.globals.OrderStatusList', function (OrderStatusList) {
      console.log(OrderStatusList);
      if (OrderStatusList.success !== undefined && OrderStatusList.success.orderprocess.length !== 0) {
        var orderstatuslist = [];
        orderstatuslist = angular.copy(OrderStatusList.success.orderprocess);
        if ($scope.order_status_list.length == 0) {
          for (var i = 0; i < orderstatuslist.length; ++i) {
            if(orderstatuslist[i].require == true) {
              $scope.order_status_list.push({index:orderstatuslist[i].index, order_status:orderstatuslist[i].order_status, require:orderstatuslist[i].require, default:true });
            } else {
              $scope.order_status_list.push({index:orderstatuslist[i].index, order_status:orderstatuslist[i].order_status, require:orderstatuslist[i].require});
            }
          }
        }  
      } else {
        if(OrderStatusList.error.code=='AL001'){
          $scope.order_status_list = [];
          $rootScope.showModal();
        } else {
          $scope.order_status_list = [];
          $log.debug(OrderStatusList.error.message);
          $rootScope.OZNotify(OrderStatusList.error.message,'error');
        }
      }
    });

    $scope.showSellerDetail = false;

    $scope.viewSellerDetail = function(index){
      if (index !== null) {
        $scope.currentSellerIndex = index;
      } else {
        $scope.currentSellerIndex = '';
      }
      $scope.showSellerDetail = !$scope.showSellerDetail;
    }

    $scope.add_provider = function(){
      $scope.addprovider = true;
    }

    $scope.cancelAddSeller = function(){
      $scope.form.addSellerForm.submitted = false;
      $scope.addseller = {};
      $scope.addSellerLogo = false;
      $scope.form.addSellerForm.$setPristine();
      $scope.addprovider = false;
    }

    $scope.onFileSelect = function($files) {
      for (var i = 0; i < $files.length; i++) {
        file = $files[i];
      }
      if (file != null) {
        $scope.addSellerLogo = false;
      }
    };

    $scope.onFileSelectUpdate = function($files) {
      for (var i = 0; i < $files.length; i++) {
        fileUpdate = $files[i];
      }
    };  

    // function to send and stringify user registration data to Rest APIs
    $scope.jsonAddSellerData = function(){
      var order_status_list = [];
      for (var i = 0; i < $scope.order_status_list.length; ++i) {
        if($scope.order_status_list[i].require == true) {
          order_status_list.push({index:$scope.order_status_list[i].index, order_status:$scope.order_status_list[i].order_status });
        }
      }
      var sellerdata = 
      {
        data:
          {
            'providername' : $scope.addseller.name,
            'providercode' : $scope.addseller.code,
            'category' : { 'categoryid': $scope.sellercategory.categoryname.categoryid, 'categoryname': $scope.sellercategory.categoryname.categoryname },
            'providerdescription' : $scope.addseller.description,
            'tax': {
              'tino': $scope.addseller.tino,
              'servicetaxno': $scope.addseller.servicetaxno
            },
            'paymentmode': {
              'cod': $scope.addseller.cod,
              'online': $scope.addseller.online
            }, 
            'orderprocess_configuration': order_status_list
          }  
      };
      return sellerdata; 
    } 

    // function to handle server side responses
    $scope.handleAddSellerResponse = function(data){
      if (data.success) {
        $state.reload();
        $scope.cancelAddSeller();
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
  
    $scope.addSeller = function(){
      if ($scope.form.addSellerForm.$valid) {
        if (file !== undefined && file !== null) {
          $scope.addSellerLogo = false;
          console.log('seller Data entered successfully');
          var sellerdata = $scope.jsonAddSellerData();
          console.log($scope.jsonAddSellerData());
          $scope.upload = $upload.upload({
            url: '/api/productprovider/', 
            data: sellerdata ,
            file:file, 
          }).progress(function(evt) {
            console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
          }).success(function(data, status, headers, config) {
            $scope.handleAddSellerResponse(data);
            console.log(data);
          });
        } else{
          $scope.addSellerLogo = true;
        }
      } else {
        if (file == null) {
          $scope.addSellerLogo = true;
        }
        $scope.form.addSellerForm.submitted = true;
      }
    };

    $scope.openEditSeller = function(Seller){
      if (Seller.orderprocess_configuration) {
        var orderprocess = [];
        var status_list = [];
        $scope.edit_order_status_list = [];
        orderprocess = angular.copy(Seller.orderprocess_configuration);
        if (orderprocess.length !== 0) {
          for (var i = 0; i < orderprocess.length; i++) {
            status_list.push(orderprocess[i].order_status);
          }
          if (status_list.length !== 0 && $scope.order_status_list.length !== 0) {
            for (var i = 0; i < $scope.order_status_list.length; i++) {
              var result = status_list.indexOf($scope.order_status_list[i].order_status);
              if (result !== -1) {
                if ($scope.order_status_list[i].default && $scope.order_status_list[i].default == true) {
                  $scope.edit_order_status_list.push({index:$scope.order_status_list[i].index, order_status:$scope.order_status_list[i].order_status, require:true, default:$scope.order_status_list[i].default});
                } else {
                  $scope.edit_order_status_list.push({index:$scope.order_status_list[i].index, order_status:$scope.order_status_list[i].order_status, require:true});
                }
              } else {
                $scope.edit_order_status_list.push({index:$scope.order_status_list[i].index, order_status:$scope.order_status_list[i].order_status, require:false});
              }
            }
          }
        }
      }
      $scope.editseller = angular.copy(Seller);
      $('#editSellerModal').modal({ 
        keyboard: false,
        backdrop: 'static',
        show: true
      });
    };

    // function to send and stringify user registration data to Rest APIs
    $scope.jsonEditSellerData = function(){
      var edit_order_status_list = [];
      for (var i = 0; i < $scope.edit_order_status_list.length; ++i) {
        if($scope.edit_order_status_list[i].require == true) {
          edit_order_status_list.push({index:$scope.edit_order_status_list[i].index, order_status:$scope.edit_order_status_list[i].order_status });
        }
      }
      var sellerdata = 
      {
        providerdata:
          {
            'providername' : $scope.editseller.providername,
            'providercode' : $scope.editseller.providercode,
            'providerdescription' : $scope.editseller.providerdescription,
            'tax': {
              'tino': $scope.editseller.tax.tino,
              'servicetaxno': $scope.editseller.tax.servicetaxno
            },
            'paymentmode': {
              'cod': $scope.editseller.paymentmode.cod,
              'online': true
            }, 
            'orderprocess_configuration': edit_order_status_list
          }  
      };
      return JSON.stringify(sellerdata); 
    } 

    $scope.handleEditSellerResponse = function(data){
      if (data.success) {
        $('#editSellerModal').modal('hide');
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


    $scope.handleChangeProviderLogo = function(data, providerid){
      if (data.success) {
        ManageBranchService.update_seller($scope.jsonEditSellerData(), providerid);
        $rootScope.OZNotify(data.success.message,'success'); 
      } else {
        console.log(data.error.message);
        $rootScope.OZNotify(data.error.message,'error');
      }
    };

    $scope.editSeller = function(providerid){
      if ($scope.form.editSellerForm.$valid) {
        if (fileUpdate !== undefined && fileUpdate !== null) {
          console.log('seller Data entered successfully with logo');
          $scope.upload = $upload.upload({
            url: '/api/productprovider/logo/'+providerid, 
            file:fileUpdate, 
          }).progress(function(evt) {
            console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
          }).success(function(data, status, headers, config) {
            $scope.handleChangeProviderLogo(data, providerid);
            console.log(data);
          });
        } else if (fileUpdate == null) {
          ManageBranchService.update_seller($scope.jsonEditSellerData(), providerid);
        }
      } else {
        console.log('incorrect data');
        $scope.form.editSellerForm.submitted = true;
      }
    }


    var cleanupEventEditSellerDone = $scope.$on("editSellerDone", function(event, message){
      $log.debug(message);
      $scope.handleEditSellerResponse(message);      
    });

    var cleanupEventEditSellerNotDone = $scope.$on("editSellerNotDone", function(event, message){
      $log.debug(message);
      $rootScope.OZNotify("It looks as though we have broken something on our server system. Our support team is notified and will take immediate action to fix it." + message, 'error');   
    });

    $scope.$on('$destroy', function(event, message) {
      cleanupEventEditSellerDone();
      cleanupEventEditSellerNotDone();
    });

 }]);

