angular.module('oz.ProviderApp')
  .controller('ProviderController', ['$scope', '$state', '$http', '$timeout', '$sce', '$log', '$rootScope', 'ProviderServices', 'ProviderServicesList', '$stateParams', 'BranchOrderCount', function($scope, $state, $http, $timeout, $sce, $log, $rootScope,ProviderServices, ProviderServicesList, $stateParams, BranchOrderCount) {
     $log.debug("hii provider");
 
      $scope.$state=$state;
      $scope.order_count = [];

      $scope.$watch('$state.$current.locals.globals.BranchOrderCount', function (BranchOrderCount) {
        console.log(BranchOrderCount);
        if (BranchOrderCount.success !== undefined && BranchOrderCount.success.statuswisecount.length !== 0) {
          $scope.order_count = angular.copy(BranchOrderCount.success.statuswisecount); 
        } else {
          if (BranchOrderCount.error != undefined) {
            $scope.order_count = [];
            $log.debug(BranchOrderCount.error.message);
            $rootScope.OZNotify(BranchOrderCount.error.message, 'error');
          } else {
            $scope.order_count = [];
            $log.debug(BranchOrderCount);
            $rootScope.OZNotify(BranchOrderCount, 'error');
          } 
        } 
      });

      // (function refreshOrderCount() {
      //  $state.reload();
      //   $timeout(refreshOrderCount, 120000);
      // })();

      var cleanupEventChange_in_provideridDone = $scope.$on("change_in_providerid", function(event, data){
        console.log(data);
        $state.reload();     
      });

      var cleanupEventChange_in_provideridDone = $scope.$on("change_in_branchid", function(event, data){
        console.log(data);
        $state.reload();     
      });
    
    $scope.printInvoice=function(orderid,selectedBranchId){
      ProviderServicesList.get_Invoice(orderid,selectedBranchId);
    }

    // function to handle server side responses
    $scope.handleGetInvoiceDataDone = function(data){
      if (data.success) {
        console.log(data.success);
        var invoice = window.open(data.success.invoice);
        invoice.print();
        $rootScope.OZNotify(data.success.message, 'success');
      } else {
        if(data.error.code=='AL001'){
          $rootScope.showModal();
        } else {
          console.log(data.error.message);
          $rootScope.OZNotify(data.error.message,'error');
        }
      }
    };  
  

    var cleanupEventGetInvoiceDataDone = $scope.$on("getInvoiceDataDone", function(event, data){
      $scope.handleGetInvoiceDataDone(data);  
    });

    var cleanupEventGetInvoiceDataNotDone = $scope.$on("getInvoiceDataNotDone", function(event, data){
      $rootScope.OZNotify("It looks as though we have broken something on our server system. Our support team is notified and will take immediate action to fix it." + data, 'error');    
    });

    $scope.$on('$destroy', function(event, message) {
      cleanupEventGetInvoiceDataDone();
      cleanupEventGetInvoiceDataNotDone();   
    });

 }]);
