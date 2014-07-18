

angular.module('oz.ProviderApp')
  .controller('OZProductAvailabilityController', ['$scope', '$state', '$http', '$timeout', '$sce', '$log', 'UserSessionService',  'ProviderServicesList', '$rootScope', function($scope, $state, $http, $timeout, $sce, $log, UserSessionService, ProviderServicesList, $rootScope) {
    $scope.$watch('selectedBranchId', function(selectedBranchId)
    {
    	$scope.allProductsContent = [];
    	if(selectedBranchId !== undefined && selectedBranchId !== '')
    	{
             ProviderServicesList.getAllProductForAvailability();
    	}
    });

    $scope.mytime = new Date();

    $scope.mytimes = new Date();

     $scope.ismeridian = false;

     $scope.regexForText = /^[a-zA-Z\s]*$/;

     $scope.temp = {};

     $scope.tempProductCatalog = [];

    var cleanUpEventGotAllProducts = $scope.$on("gotAllProducts",function(event,data){
            if(data.error)
            {
              if(data.error.code === 'AL001')
              {
                      $rootScope.showModal();
              }
              else
              {
                    $scope.allProductsContent = [];$rootScope.OZNotify(data.error.message,'error');  
              }
            }
            if(data.success)
            {      
                      //$rootScope.OZNotify(data.success.message, 'success'); 
                      $scope.tempProductCatalog = [];
                      $scope.allProductsContent = data.success.proudctcatalog;
                      $scope.tempProductCatalog = angular.copy(data.success.proudctcatalog);
                      //console.log(JSON.stringify( $scope.allProductsContent));
                      //ProviderServicesList.getAllProductForAvailability();
                      // console.log(JSON.stringify($scope.allProductsContent));
            } 
    });

    var cleanUpEventCriteriaNotGotAllProducts = $scope.$on("notGotAllProducts",function(event,data){
            $rootScope.OZNotify('Some issue with server! Please try after some time', 'error');
    });

    $scope.edit = function(list)
    {
      if(list.productnotavailable !== undefined && list.productnotavailable.from === null)
      {
        list.productnotavailable.from = new Date();
      }
      if(list.productnotavailable !== undefined && list.productnotavailable.to === null)
      {
        list.productnotavailable.to = new Date();
      }
      if(list.productnotavailable === undefined)
      {
        list.productnotavailable = {'from' : '' , 'to' : ''}
        list.productnotavailable.from = new Date();
        list.productnotavailable.to = new Date();
      }
      $scope.temp = {};
      $scope.temp = angular.copy(list);
    	list.editing = true;
    };

    $scope.cancel = function(list)
    {
      if(list.productnotavailable.from === '' || list.productnotavailable.to === '')
         {
              list.productnotavailable.from = null;
              list.productnotavailable.to = null;
         }
      $scope.allProductsContent = [];
      $scope.allProductsContent = $scope.tempProductCatalog;
      list.editing = false;
      ProviderServicesList.getAllProductForAvailability();
      
                     
    };

    $scope.saveListContent = function(list)
    {
    	   if(moment.utc(list.productnotavailable.to).diff(moment.utc(list.productnotavailable.from), 'days')<0)
         {
             $rootScope.OZNotify("The To date can't be lesser than From date", 'error');
         }
         else
          {
            $scope.content = {'productnotavailable' : {'from' : list.productnotavailable.from, 'to' : list.productnotavailable.to}};
            ProviderServicesList.assignProductAvailabilityContent(list.productid, $scope.content, list);
          }
    };

    var cleanUpEventAssignedPA = $scope.$on("assignedProductAvail",function(event,data, list){
            if(data.error)
            {
              if(data.error.code === 'AL001')
              {
                      $rootScope.showModal();
              }
              else
              {
                    $rootScope.OZNotify(data.error.message,'error');  
              }
            }
            if(data.success)
            {      
                      $rootScope.OZNotify(data.success.message, 'success'); 
                      ProviderServicesList.getAllProductForAvailability();
                      list.editing = false;
            } 
    });

    // $scope.convertDate = function(date)
    // {
    // 	return date.toUTCString();
    // }

    var cleanUpEventCriteriaNotAssignedPA = $scope.$on("notAssignedProductAvail",function(event,data){
            $rootScope.OZNotify('Some issue with server! Please try after some time', 'error');
    });

    $scope.saveListContents = function(list)
    {
    	 $scope.content = {'productnotavailable' : {'from' : null, 'to' : null}};
       ProviderServicesList.assignProductAvailabilityContent(list.productid, $scope.content, list);
    };

    $scope.verifyStartDate = function(content, list)
    {
             // var validate = new Date(content);
             if(content === undefined || content === null || $scope.regexForText.test(content) === true)
             {
                  list.productnotavailable.from = $scope.temp.productnotavailable.from;
                  $rootScope.OZNotify('Please enter valid time! Your from time is reset to previous value', 'error');
                  // $rootScope.OZNotify('')
             }
    };

    // $scope.verifyStartDate = function(content, list)
    // {
    //          // var validate = new Date(content);
    //          if(content === undefined || content === null || $scoppe.regexForText.test(content) === true)
    //          {
    //               list.productnotavailable.from = $scope.temp.productnotavailable.from;
    //               // $rootScope.OZNotify('')
    //          }
    // };

    // campaignExpiryDate.diff(todays,'days')<0)

    $scope.verifyEndDate = function(content, list)
    {
             // var validate = new Date(content);
             if(content === undefined || content === null || $scope.regexForText.test(content) === true)
             {
                  list.productnotavailable.to = $scope.temp.productnotavailable.to;
                  $rootScope.OZNotify('Please enter valid time! Your to time is reset to previous value', 'error');
                  // $rootScope.OZNotify('')
             }
    }

    $scope.$on('$destroy', function(event, message) 
    {
         cleanUpEventGotAllProducts();cleanUpEventCriteriaNotGotAllProducts();

         
    });


  }]);