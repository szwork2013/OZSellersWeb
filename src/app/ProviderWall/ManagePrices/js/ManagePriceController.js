angular.module('oz.ProviderApp')
  .controller('ManagePriceController', ['$scope', '$state', '$http', '$timeout', '$sce', '$log', '$rootScope', 'ProviderServices','$upload','$stateParams',function($scope, $state, $http, $timeout, $sce, $log, $rootScope,ProviderServices,$upload, $stateParams) {

  $scope.noProducts;
  $scope.priceForm={};
  $scope.priceFormHolding={};
   $scope.init=function(){
    $scope.tabForPrice={};
   	$scope.productPricelist=[];
    $scope.tempProductPricelist=[];
    $scope.editorPrice={};
    $scope.$state=$state;
    $scope.tabForPrice.np = true;
   };
    $scope.init();      



    $rootScope.$watch('selectedBranchId', function (selectedBranchId) {
     $scope.init();  
     if(selectedBranchId){
       $scope.getAllProducts($rootScope.selectedBranchId,$rootScope.selectedproviderid);
     }    
    });


    $scope.enableEditorPrice = function () {
     $scope.editorPrice.editorEnabled = true;
     $scope.tempProductPricelist = angular.copy( $scope.productPricelist);
    };

    $scope.disableEditorPrice = function () {
     $scope.editorPrice.editorEnabled = false;
     $scope.productPricelist = $scope.tempProductPricelist ;
     $scope.tempProductPricelist=[];
     // $scope.priceForm.submitted=false;

     // $scope.getAllProducts($rootScope.selectedBranchId,$rootScope.selectedproviderid);
   };



 $scope.getAllProducts=function(branchid,providerid){
  $scope.products=[];
   if((branchid!==null || branchid !==undefined ) && (providerid !==null || providerid !== undefined)){
   $scope.productPricelist=[];
    ProviderServices.get_allProducts.getAllProducts({
        branchid:branchid,
    	  providerid:providerid},
      	function (successData) {
        if (successData.success == undefined) {
          $scope.noProducts=true;
          if(successData.error.code=='AL001'){
            $rootScope.showModal();
          }
         // $rootScope.OZNotify(successData.error.message, 'error');  
        } else {
         $scope.noProducts=false;
         $log.debug(successData.success.proudctcatalog);
         $scope.products=successData.success.proudctcatalog;
         for (var i = successData.success.proudctcatalog.length - 1; i >= 0; i--) {
            $scope.productPricelist.push({
              productid: successData.success.proudctcatalog[i].productid,
              productname: successData.success.proudctcatalog[i].productname,
              productcode: successData.success.proudctcatalog[i].productcode,
              price: successData.success.proudctcatalog[i].price.value,
              newprice: successData.success.proudctcatalog[i].price.value
            })
         };
         // console.log($scope.productPricelist);
           
        }
       }, function (error) {
         $rootScope.OZNotify("Server Error:" + error.status, 'error');
       });
  }
 };





// update price
$scope.changePrice=function(product){
  if($scope.priceForm.$dirty){


  if($scope.priceForm.$invalid){
    // $rootScope.ProdoAppMessage("Please add valid information", 'error');
    $scope.priceForm.submitted=true;
  }
 else{
  $scope.priceForm.$setPristine();
  console.log( product);
  $scope.productPrices=[];
  for (var i = product.length - 1; i >= 0; i--) {
    $scope.productPrices.push ({
      productid:product[i].productid,
      newprice:product[i].newprice
    })
   };
   // console.log( $scope.productPrices);
       $http({
        method: 'PUT', 
        url: '/api/productprice/'+$scope.selectedBranchId, 
        data: {"productpricedata":$scope.productPrices} ,
        // file:file, 
      }).success(function(data, status, headers, config) {
      if(data.success){
       // console.log(data);
       $scope.disableEditorPrice();
       $scope.getAllProducts($rootScope.selectedBranchId,$rootScope.selectedproviderid);
       $rootScope.OZNotify(data.success.message, 'success'); 
      }
      else{
          if(data.error.code=='AL001'){
            $rootScope.showModal();
          }
         $rootScope.OZNotify(data.error.message, 'error');  
      }



      }).error(function (data, status, headers, cfg) {
        // $log.debug(status);
       $rootScope.OZNotify(status, 'error'); 
     });
   }
  }
  else{
     $rootScope.OZNotify("Product's price not changed...", 'success');
     $scope.disableEditorPrice(); 
  }
 };

// update price

// ///////////////////////////////////holding //////////////////////////////////////


     $scope.temp = {};

     $scope.tempProductCatalog = [];

    $scope.edit = function(list)
    {
       $scope.tempProductCatalog = angular.copy( $scope.products);
       if(list.holding_price !== undefined && list.holding_price.fromdate === null)
      {
        list.holding_price.fromdate = new Date();
      }
      if(list.holding_price !== undefined && list.holding_price.todate === null)
      {holding_price
        list.holding_price.todate = new Date();
      }
      if(list.holding_price === undefined)
      {
        list.holding_price = {'fromdate' : '' , 'todate' : ''}
        list.holding_price.fromdate = new Date();
        list.holding_price.todate = new Date();
      }
      $scope.temp = {};
      $scope.temp = angular.copy(list);
      list.editing = true;
    };

    $scope.cancel = function(list)
    {
      if(list.holding_price.fromdate === '' || list.holding_price.todate === '')
         {
              list.holding_price.fromdate = null;
              list.holding_price.todate = null;
         }
      $scope.products = [];
      $scope.products = $scope.tempProductCatalog;
      list.editing = false;
      $scope.tempProductCatalog=[];
      // $scope.getAllProducts($rootScope.selectedBranchId,$rootScope.selectedproviderid);
      
                     
    };

    $scope.addHoldingPrice = function(list){
       console.log(list);
        $scope.content = {'pricedata' : {"newprice":list.holding_price.value,"uom":list.price.uom}};
      console.log($scope.content);

       if($scope.priceForm.$invalid){
            $scope.priceForm.submitted=true;
          }
         else{
          $scope.priceForm.$setPristine();
          if(list.holding_price.value>0){
           $http({
              method: 'PUT', 
              url: '/api/saveprice/'+$rootScope.selectedBranchId +'/'+list.productid, 
              data:  $scope.content ,
              // file:file, 
            }).success(function(data, status, headers, config) {
              console.log(data);
            if(data.success){
             
             $scope.cancel(list);
             $scope.getAllProducts($rootScope.selectedBranchId,$rootScope.selectedproviderid);
             $rootScope.OZNotify(data.success.message, 'success'); 
            }
            else{
                if(data.error.code=='AL001'){
                  $rootScope.showModal();
                }
               $rootScope.OZNotify(data.error.message, 'error');  
            }



            }).error(function (data, status, headers, cfg) {
              // $log.debug(status);
             $rootScope.OZNotify(status, 'error'); 
           });

          }
          else{
             $rootScope.OZNotify("Price must be greater than 0", 'error'); 
          }
        }

    };





    $scope.activateHolpingPrice = function(list)
    {
      
        $http({
              method: 'PUT', 
              url: '/api/activateprice/'+$rootScope.selectedBranchId +'/'+list.productid
            }).success(function(data, status, headers, config) {
              console.log(data);
            if(data.success){
             console.log(data)
             // $scope.cancel(list);
              $rootScope.OZNotify(data.success.message, 'success');
              $scope.getAllProducts($rootScope.selectedBranchId,$rootScope.selectedproviderid);
             
            }
            else{
                if(data.error.code=='AL001'){
                  $rootScope.showModal();
                }
               $rootScope.OZNotify(data.error.message, 'error');  
                console.log(data.error.message);
            }



            }).error(function (data, status, headers, cfg) {
              // $log.debug(status);
             $rootScope.OZNotify(status, 'error'); 
           });
    };

 $scope.deactivateHolpingPrice = function(list)
    {
      
        $http({
              method: 'PUT', 
              url: '/api/deactivateprice/'+$rootScope.selectedBranchId +'/'+list.productid
            }).success(function(data, status, headers, config) {
              console.log(data);
            if(data.success){
             console.log(data)
             // $scope.cancel(list);
              $rootScope.OZNotify(data.success.message, 'success');
              $scope.getAllProducts($rootScope.selectedBranchId,$rootScope.selectedproviderid);
             
            }
            else{
                if(data.error.code=='AL001'){
                  $rootScope.showModal();
                }
               $rootScope.OZNotify(data.error.message, 'error');  
                console.log(data.error.message);
            }



            }).error(function (data, status, headers, cfg) {
              // $log.debug(status);
             $rootScope.OZNotify(status, 'error'); 
           });
    };




 }]);

