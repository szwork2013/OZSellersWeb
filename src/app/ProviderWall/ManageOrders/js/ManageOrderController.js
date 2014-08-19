angular.module('oz.ProviderApp')
  .controller('ManageOrderController', ['$scope', '$state', '$http', '$timeout', '$sce', '$log', '$rootScope', 'ProviderServices','$upload','$stateParams',function($scope, $state, $http, $timeout, $sce, $log, $rootScope,ProviderServices,$upload, $stateParams) {
  
    $scope.form={};
    $scope.reason={};
   $scope.init=function(){
    $scope.search='';
    $scope.orders=[];
    $scope.tabForOrders={};
    $scope.todaysDate=new Date();
    // $scope.hideReceivedOrders ;
    // $scope.hideApproveOrders;
    // $scope.hideProcessingOrders;
    // $scope.hideDeliveryOrders;
    // $scope.hidePastOrders ;
    // $scope.hideProductOrders;
    // $rootScope.TotalOrdersCount=0;
    $scope.tabForOrders.recieved = true;

   };
    $scope.init();    


   $scope.getProvider=function(providerid){
     ProviderServices.get_provider.getProvider({providerid:providerid},
      function (successData) {
      if (successData.success == undefined) {
      
      } else {
        if(successData.success.productprovider.orderprocess_configuration){
           $log.debug(successData.success.productprovider.orderprocess_configuration);
           $rootScope.orderConfigStatus=successData.success.productprovider.orderprocess_configuration;
        }
      }
     }, function (error) {
       $log.debug("Server Error:" + error.status);
     });
   };

 $scope.getProvider($rootScope.selectedproviderid);
   
$log.debug($rootScope.orderConfigStatus);

   $rootScope.$watch('selectedBranchId', function (selectedBranchId) {
      $scope.init();  
      $rootScope.selectedBranchId=selectedBranchId;
      $scope.getBranchAddress($rootScope.selectedBranchId);
      $scope.getLatestOrders();
    });

   $scope.getBranchAddress=function(selectedBranchId){
     $log.debug($rootScope.branches);
      for (var i = $rootScope.branches.length - 1; i >= 0; i--) {
        if($rootScope.branches[i].branchid== selectedBranchId){
          $scope.branchAddress=$rootScope.branches[0].location;
        }
      };
             
       
   }
    
   $scope.getLatestOrders=function(){
      if($scope.tabForOrders.recieved == true){
       $scope.getReceived();
     }
     else if($scope.tabForOrders.approval == true){
       $scope.getApproved();
     }
     else if($scope.tabForOrders.processing == true){
        $scope.getProcessing();
     }
     else if($scope.tabForOrders.delivery == true){
       $scope.getDelivery();
     }
      else if($scope.tabForOrders.past == true){
       $scope.getPastOrders();
     }
      else if($scope.tabForOrders.product == true){
       $scope.getProductOrders();
     }
   };



$scope.getReceived=function(){
  $scope.hideReceivedOrders;
    $scope.resetCounters();
    // $scope.orders=[];
    if( $rootScope.selectedBranchId && $rootScope.selectedproviderid){
     ProviderServices.get_Orders.getOrders({
        branchid: $rootScope.selectedBranchId,
        providerid:$rootScope.selectedproviderid,
        criteriastatus:'recieved'
       },
        function (successData) {
        if (successData.success ) {
             $scope.orders=successData.success.suborders;
             $scope.hideReceivedOrders=false;
             // $rootScope.TotalOrdersCount=successData.success.suborders.length;
             $log.debug($scope.orders);
        } else {
           $scope.orders=[];
              $scope.hideReceivedOrders=true;
              // $rootScope.OZNotify(successData.error.message, 'error');  
               if(successData.error.code=='AL001'){
                  $rootScope.showModal();
                }
        }
       }, function (error) {
         $scope.hideReceivedOrders=true;
         $rootScope.OZNotify("Server Error:" + error.status, 'error');
       });
     }
 };

   $scope.getApproved=function(){
    $scope.hideApproveOrders
    $scope.resetCounters();
    // $scope.orders=[];
    if( $rootScope.selectedBranchId && $rootScope.selectedproviderid){
     ProviderServices.get_Orders.getOrders({
        branchid: $rootScope.selectedBranchId,
        providerid:$rootScope.selectedproviderid,
        criteriastatus:'approved'
       },
        function (successData) {
        if (successData.success ) {
             $scope.orders=successData.success.suborders;
             $scope.hideApproveOrders=false;
             // $rootScope.TotalOrdersCount=successData.success.suborders.length;
             $log.debug($scope.orders);
        } else {
           $scope.orders=[];
              $scope.hideApproveOrders=true;
              // $rootScope.OZNotify(successData.error.message, 'error');  
               if(successData.error.code=='AL001'){
                  $rootScope.showModal();
                }
        }
       }, function (error) {
         $scope.hideApproveOrders=true;
         $rootScope.OZNotify("Server Error:" + error.status, 'error');
       });
     }
 };


 $scope.getProcessing=function(){
  $scope.hideProcessingOrders;
    $scope.resetCounters();
    // $scope.orders=[];
    if( $rootScope.selectedBranchId && $rootScope.selectedproviderid){
     ProviderServices.get_Orders.getOrders({
        branchid: $rootScope.selectedBranchId,
        providerid:$rootScope.selectedproviderid,
        criteriastatus:'packing'
       },
        function (successData) {
          // $log.debug("calling.......");
        if (successData.success ) {
             $scope.orders=successData.success.suborders;
             $scope.hideProcessingOrders=false;
             // $scope.processingOrdersCount=$scope.orders.length;
              $log.debug($scope.orders);
        } else {
           $scope.orders=[];
             $scope.hideProcessingOrders=true;
             // $rootScope.OZNotify(successData.error.message, 'error');  
              if(successData.error.code=='AL001'){
                  $rootScope.showModal();
                }
        }
       }, function (error) {
         $scope.hideProcessingOrders=true;
         $rootScope.OZNotify("Server Error:" + error.status, 'error');
       });
     }
 };


   $scope.getDelivery=function(){
    $scope.hideDeliveryOrders;
    $scope.resetCounters();
    // $scope.orders=[];
    if( $rootScope.selectedBranchId && $rootScope.selectedproviderid){
     ProviderServices.get_Orders.getOrders({
        branchid: $rootScope.selectedBranchId,
        providerid:$rootScope.selectedproviderid,
        criteriastatus:'delivery'
       },
        function (successData) {
        if (successData.success ) {
             $scope.orders=successData.success.suborders;
             $scope.hideDeliveryOrders=false;
             // $scope.deliveryOrdersCount=$scope.orders.length;
              // $log.debug($scope.orders);
        } else {
           $scope.orders=[];
             $scope.hideDeliveryOrders=true;
             // $rootScope.OZNotify(successData.error.message, 'error');  
              if(successData.error.code=='AL001'){
                  $rootScope.showModal();
                }
        }
       }, function (error) {
         $scope.hideDeliveryOrders=true;
         $rootScope.OZNotify("Server Error:" + error.status, 'error');
       });
     }
   };


   $scope.getPastOrders=function(){
    $scope.hidePastOrders;
    $scope.resetCounters();
    // $scope.orders=[];
    if( $rootScope.selectedBranchId && $rootScope.selectedproviderid){
     ProviderServices.get_Orders.getOrders({
        branchid: $rootScope.selectedBranchId,
        providerid:$rootScope.selectedproviderid,
        criteriastatus:'past'
       },
        function (successData) {
        if (successData.success ) {
             $scope.orders=successData.success.suborders;
             $scope.hidePastOrders=false;
             // $scope.pastOrdersCount=$scope.orders.length;
              $log.debug($scope.orders);
        } else {
           $scope.orders=[];
             $scope.hidePastOrders=true;
             // $rootScope.OZNotify(successData.error.message, 'error');  
              if(successData.error.code=='AL001'){
                  $rootScope.showModal();
                }
        }
       }, function (error) {
         $scope.hidePastOrders=true;
         $rootScope.OZNotify("Server Error:" + error.status, 'error');
       });
     }
  };


    $scope.getProductOrders=function(){
      $scope.hideProductOrders
      $scope.resetCounters();
       $scope.orders=[];
      $http({
          method: 'GET',
          url: 'api/allorders/'+ $rootScope.selectedBranchId+'?type=product&providerid='+$rootScope.selectedproviderid,
         }).success(function(data, status, headers, cfg){
            $scope.handleGetProductOrders(data);
         }).error(function(data, status, headers, cfg){
            $rootScope.OZNotify(status, 'error');  
         });
     };


     $scope.handleGetProductOrders=function(data){
      if(data.success){
         $scope.orders=data.success.doc;
         $scope.hideProductOrders=false;
         // $scope.productOrdersCount=$scope.orders.length;
          // $log.debug('new changed data '+JSON.stringify($scope.orders));
       }
      else if(data.error){
            // $rootScope.OZNotify(data.error.message, 'error'); 
             $scope.orders=[]; 
            $log.debug(data.error.message);  
            $scope.hideProductOrders=true;
             if(data.error.code=='AL001'){
                  $rootScope.showModal();
                }
       }
     };

    $scope.resetCounters=function(){
     if($rootScope.selectedBranchId){
        $http({
          method: 'GET',
          url: '/api/suborderstatuscount/'+ $rootScope.selectedproviderid+'/'+$rootScope.selectedBranchId,
         }).success(function(data, status, headers, cfg){
          if(data.success){
            var counters=data.success.statuswisecount;
           for (var i = counters.length - 1; i >= 0; i--) {
             if(counters[i].status=='recieved'){
               $log.debug(counters[i].statuscount);
               $scope.receivedOrdersCount=counters[i].statuscount;
             }
             else if(counters[i].status=='approved'){
               $scope.TotalOrdersCount=counters[i].statuscount;
             }
             else if(counters[i].status=='packing'){
               $scope.processingOrdersCount=counters[i].statuscount;
             }
             else if(counters[i].status=='delivery'){
                $scope.deliveryOrdersCount=counters[i].statuscount;
             }
             else if(counters[i].status=='past'){
                $scope.pastOrdersCount=counters[i].statuscount;
             }
           };

          }
 
         }).error(function(data, status, headers, cfg){
            // $rootScope.OZNotify(status, 'error');  
            $log.debug(status);
         });
     }

        
    }

     $scope.setOrders=function(Orders){
        $scope.orders=[];
        $scope.orders=Orders;
     }

    

 }]);

