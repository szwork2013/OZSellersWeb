angular.module('oz.ProviderApp')
  .controller('OZProductDiscountController', ['$scope', '$state', '$http', '$timeout', '$sce', '$log', 'UserSessionService',  'ProviderServicesList', '$rootScope', function($scope, $state, $http, $timeout, $sce, $log, UserSessionService, ProviderServicesList, $rootScope) {
  
    
    // $rootScope.selectedproviderid
    // ProviderServices.

    // ProviderServicesList.getAllProducts($rootScope.selectedproviderid);
      
    // var cleanUpEventGotAllProducts = $scope.$on("gotAllProductsWithDiscounts",function(event,data){
    //         if(data.error)
    //         {
    //             $rootScope.OZNotify(data.error.message,'error');
    //         }
    //         if(data.success)
    //         {   
    //         } 
    // });
    $scope.codeContent = {'discountcode':'', 'description' : '', 'percent' : '', 'startdate': '', 'expirydate' : ''};                                                                               
    // var cleanUpEventNotGotAllProducts = $scope.$on("notGotAllProductsWithDiscounts",function(event,data){
    //         $rootScope.OZNotify('Some issue with server! Please try after some time', 'error');$scope.showSpinners = 0;
    // });



    $scope.today =  new Date();

    $scope.submit = function()
    {    
        $scope.errorForEmptyCode = '';
        $scope.errorForEmptyDescription= '';
        $scope.errorForInvalidPercentage = '';
        $scope.errorForInvalidStartDate = '';
        $scope.errorForInvalidEnddate = '';
        $scope.allValidContent = 0;       
            if($scope.codeContent.discountcode === '')
            {
                $scope.errorForEmptyCode = 'Please enter valid discount code'; $scope.allValidContent = 1;
            }
            if($scope.codeContent.description === '')
            {
                $scope.errorForEmptyDescription = 'Please enter valid description for discount code';$scope.allValidContent = 1;
            }
            if($scope.codeContent.percent === '' || $scope.regexForNumbers.test($scope.codeContent.percent) === false || $scope.codeContent.percent>100)
            {
                $scope.errorForInvalidPercentage = 'Please enter valid percentage';$scope.allValidContent = 1;
            }
            if($scope.codeContent.startdate === '' || $scope.codeContent.expirydate === '')
            {   
                 if($scope.codeContent.startdate === '')
                {

                    $scope.errorForInvalidStartDate = 'Please enter valid start date';$scope.allValidContent = 1;
                }
                if($scope.codeContent.expirydate === '')
                {
                    $scope.errorForInvalidEnddate = 'Please enter valid end date';$scope.allValidContent = 1;
                }
            }
            if($scope.allValidContent === 0 )
            {   
               // $scope.isCollapsed = !$scope.isCollapsed;
                $scope.codeContentObject = {'discountdata' : $scope.codeContent}; 
                ProviderServicesList.addProductCode($scope.codeContentObject);
            }
    };

    $scope.cancelAll = function()
    {
            //$scope.codeContent = {'code':'', 'description' : '', 'percentage' : '', 'startdate': '', 'enddate' : ''}; 
            $scope.errorForEmptyCode = '';
            $scope.errorForEmptyDescription= '';
            $scope.errorForInvalidPercentage = '';
            $scope.errorForInvalidStartDate = '';
            $scope.errorForInvalidEnddate = '';  
            $scope.codeContent = {'discountcode':'', 'description' : '', 'percent' : '', 'startdate': '', 'expirydate' : ''};  
            $scope.isCollapsed = !$scope.isCollapsed;        
    };

    $scope.regexForText = /^[a-zA-Z\s]*$/;

    $scope.regexForNumbers = /[0-9]/;

    $scope.regexForEmail = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;

    $scope.regexForPhno = /^\(?[+]([0-9]{2,5})\)?[-]?([0-9]{10,15})$/;

    $scope.regexForMultipleEmail = /(([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)(\s*,\s*|\s*$)+)/;

    $scope.regularExpressionForManufactuter = /^manufacturer/i;

    $scope.errorForEmptyCode = '';

    $scope.errorForEmptyDescription= '';

    $scope.errorForInvalidPercentage = '';

    $scope.errorForInvalidStartDate = '';

    $scope.errorForInvalidEnddate = '';

    $scope.containerOfDiscountCode = {};

   $scope.$watch('selectedBranchId', function (selectedBranchId) {
        $scope.containerOfDiscountCode = [];    

        $scope.discountid = '';

            $scope.productsList = [];

            $scope.finalSelectedProducts = [];
       if(selectedBranchId !== undefined && selectedBranchId !== '')
        {

            ProviderServicesList.getAllDiscountCodes(); 
 
            ProviderServicesList.getAllProductList();
        }
    });

    $scope.productsList = [];

    $scope.finalSelectedProducts = [];

    $scope.discountid = '';

    $scope.set = 0;

    $scope.assignDiscountCodes = 0;

    $scope.manageDiscountCodes = 1;

    $scope.isCollapsed = true;


     $scope.openAddDiscountCode = function(){
    $scope.isCollapsed = !$scope.isCollapsed;
   }

    $scope.switchToManageDiscountCodes = function()
    {
         $scope.manageDiscountCodes = 1;
         $scope.assignDiscountCodes = 0;
    };

    $scope.switchToAssignDiscountCodes = function()
    {
         $scope.assignDiscountCodes = 1;
         $scope.manageDiscountCodes = 0;
         $scope.finalSelectedProducts = [];
         ProviderServicesList.getAllDiscountCodes();
         ProviderServicesList.getAllProductList();
    };

    var cleanUpEventaddedProductDiscountCode = $scope.$on("codeAddedSuccessfully",function(event,data){
            if(data.error)
            {

                 if(data.error.code === 'AL001')
                  {
                        $rootScope.showModal();
                  }
                  else
                  { $rootScope.OZNotify(data.error.message,'error');}
            }
            if(data.success)
            {    
                 $rootScope.OZNotify(data.success.message,'success');
                 $scope.openAddDiscountCode();
                 ProviderServicesList.getAllDiscountCodes();
                 $scope.codeContent = {'discountcode':'', 'description' : '', 'percent' : '', 'startdate': '', 'expirydate' : ''};   
                 
                   // $scope.isCollapsed = !$scope.isCollapsed;                                  
            } 
    });
                                                                            
    var cleanUpEventnotaddedProductDiscountCode = $scope.$on("productNotAddedSuccessfully",function(event,data){
            $rootScope.OZNotify('Some issue with server! Please try after some time', 'error');$scope.showSpinners = 0;
    });

   var cleanUpEventGetProductDiscountCode = $scope.$on("gotAllDiscountCodes",function(event,data){
            if(data.error)
            {
                  if(data.error.code === 'AL001')
                  {
                        $rootScope.showModal();
                  }
                  else
                  {
                // $rootScope.OZNotify(data.error.message,'error');
                    $scope.containerOfDiscountCode = [];    $scope.discountid = '';
                }
            }
            if(data.success)
            {    
                 $scope.containerOfDiscountCode = data.success.discountcodes;
                  ProviderServicesList.getExistingProductDetails($scope.containerOfDiscountCode[0].discountid);
                 $scope.discountid = $scope.containerOfDiscountCode[0].discountid;
            } 
    });
                                                                            
    var cleanUpEventnotgotProductDiscountCode = $scope.$on("notGotAllCodes",function(event,data){
            $rootScope.OZNotify('Some issue with server! Please try after some time', 'error');$scope.showSpinners = 0;
    });

    var cleanUpEventGotAllProducts = $scope.$on("gotAllProductsList",function(event,data){
            if(data.error)
            {
                  if(data.error.code === 'AL001')
                  {
                        $rootScope.showModal();
                  }
                  else
                  {
                        $rootScope.OZNotify(data.error.message,'error');$scope.productsList = [];
                  }
            }
            if(data.success)
            {    $scope.productsList = [];
                 $scope.productsList = data.success.products; 
            } 
    });
                                                                            
    var cleanUpEventnotgotAllProducts = $scope.$on("getProductListFailure",function(event,data){
            $rootScope.OZNotify('Some issue with server! Please try after some time', 'error');$scope.showSpinners = 0;
    });
 
    var cleanUpEventGotExistingProductsWithCode = $scope.$on("gotProductContent",function(event,data){
            if(data.error)
            {
                //$rootScope.OZNotify(data.error.message,'error');
                  if(data.error.code === 'AL001')
                  {
                        $rootScope.showModal();
                  }
            }
            if(data.success)
            {    $scope.finalSelectedProducts = [];
                 $scope.finalSelectedProducts = data.success.products; 
                 for(var i = 0 ; i<$scope.finalSelectedProducts.length; i ++)
                 {
                    for(var j = 0; j < $scope.productsList.length ; j ++)
                    {
                        if($scope.productsList[j].productid === $scope.finalSelectedProducts[i].productid)
                        {
                            $scope.productsList.splice(j,1);
                        }
                    }
                 }

                 for(var i = 0 ;i<$scope.productsList.length;i++)
                 {
                    $scope.productsList[i].$$hashKey = undefined;
                 }
                 for(var j = 0 ;j<$scope.finalSelectedProducts.length;j++)
                 {
                    $scope.finalSelectedProducts[j].$$hashKey = undefined;
                 }
                 // $scope.productsList = _.filter($scope.productsList, function(obj){ return !_.findWhere($scope.finalSelectedProducts, obj); });
                 // console.log('test-----'+JSON.stringify($scope.productsList));
            } 
    });
                                                                            
    var cleanUpEventNotGotExistingProductsWithCode = $scope.$on("notGotProductContent",function(event,data){
            $rootScope.OZNotify('Some issue with server! Please try after some time', 'error');$scope.showSpinners = 0;
    });

    $scope.selectedDiscountId = '';

    // $scope.$watch('selectedDiscountId', function (selectedDiscountId) {
    //          $scope.discountid = $scope.selectedDiscountId;
    // });
    
    $scope.addToFinalProductList = function(list, index)
    {   
         // if($scope.finalSelectedProducts.length === 0)
         // {
         //    $scope.finalSelectedProducts.splice(0,1);
         // }
         $scope.finalSelectedProducts.push(list);
         var indexOfSelectedProduct = '';
         for(var i = 0; i<$scope.productsList.length; i++)
         {
               if($scope.productsList[i].productname === list.productname)
               {
                indexOfSelectedProduct = i;
               }
         }
         $scope.productsList.splice(indexOfSelectedProduct,1);   
    };

    $scope.insertProductToProductList = function(list, index)
    {
         $scope.productsList.push(list);
         var indexOfSelectedProduct = '';
         for(var i = 0; i<$scope.finalSelectedProducts.length; i++)
         {
               if($scope.finalSelectedProducts[i].productname === list.productname)
               {
                indexOfSelectedProduct = i;
               }
         }
         $scope.finalSelectedProducts.splice(indexOfSelectedProduct,1);
    };

    $scope.addAllProductsToFinalList = function()
    {
            if($scope.productsList.length !== 0)
            {
                for(var i = 0; i<$scope.productsList.length ; i++)
                    {
                        $scope.finalSelectedProducts.push($scope.productsList[i]);
                    }

            }
            // $scope.finalSelectedProducts = [];
            // $scope.finalSelectedProducts = $scope.productsList;
            $scope.productsList = [];
    };

    $scope.clearAllProductsToFinalList = function()
    {    
            if($scope.finalSelectedProducts.length !== 0)
            {
                for(var i = 0; i<$scope.finalSelectedProducts.length ; i++)
                    {
                        $scope.productsList.push($scope.finalSelectedProducts[i]);
                    }

            }
            // $scope.finalSelectedProducts = [];
            // $scope.finalSelectedProducts = $scope.productsList;
            $scope.finalSelectedProducts = [];

    };

    $scope.assignDiscountsToProducts = function()
    {
        $scope.productids = [];
        for(var i = 0 ; i<$scope.finalSelectedProducts.length ; i++)
        {
            $scope.productids.push($scope.finalSelectedProducts[i].productid);
        }
        $scope.content = {'products' : $scope.productids};
        if($scope.discountid === '')
        {
            $rootScope.OZNotify('Please select discount code from side list! If list is empty then please add discount code','error');
        }
        else
        {   //console.log('///////'+JSON.stringify($scope.content));
            ProviderServicesList.addignCodesToProd($scope.content,$scope.discountid);
        }
    };

   var cleanUpEventAssignedDiscountCodes = $scope.$on("codeAssignedSuccessfully",function(event,data){
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
            } 
    });
                                                                            
    var cleanUpEventNotAssignedDiscountCodes = $scope.$on("codeNotAssignedSuccessfully",function(event,data){
            $rootScope.OZNotify('Some issue with server! Please try after some time', 'error');$scope.showSpinners = 0;
    });

    $scope.assignCodes = function(id, hover)
    {
           $scope.discountid = id;
           for(var z = 0 ; z < $scope.containerOfDiscountCode.length ; z ++)
           {
                document.getElementById(z).style.backgroundColor = '#FFFFFF';
           }
           document.getElementById(hover).style.backgroundColor = '#ddd';
           $scope.productsList = [];
           $scope.finalSelectedProducts = [];
           ProviderServicesList.getAllProductList();
           ProviderServicesList.getExistingProductDetails(id);
    };

    $scope.edit = function(list)
    {
        list.editing = true;
    };

    $scope.cancelEditing = function(list)
    {
        list.editing = false;
         ProviderServicesList.getAllDiscountCodes();
    };

    $scope.updateDiscountDetails = function(list)
    { 
        $scope.newCodeContents = {'description' : '', 'percent' : '', 'startdate': '', 'expirydate' : ''};  
        // $scope.newCodeContents.discountcode = list.discountcode;
        $scope.newCodeContents.description = list.description;
        $scope.newCodeContents.startdate = list.startdate;
        $scope.newCodeContents.expirydate = list.expirydate;
        $scope.newCodeContents.percent = list.percent; 
        $scope.newCodeContent = {'discountdata' : $scope.newCodeContents}; 
        if($scope.newCodeContents.description === '')
        {
            $rootScope.OZNotify('Please enter valid description before proceeding', 'error');
        }
        else if($scope.newCodeContents.percent === '' || $scope.regexForNumbers.test($scope.newCodeContents.percent) === false)
        {
            $rootScope.OZNotify('Please enter valid percentage before proceeding' , 'error');
        }
        else
        {
                        ProviderServicesList.updateDiscountDetails(list.discountid, $scope.newCodeContent, list);
        }
        
    };

    var cleanUpEventcodeChangedSuccessfully = $scope.$on("codeChangedSuccessfully",function(event,data, list){
            if(data.error)
            {  if(data.error.code === 'AL001')
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
                list.editing = false;
                ProviderServicesList.getAllDiscountCodes();

            } 
    });
                                                                            
    var cleanUpEventcodenotChangedSuccessfully = $scope.$on("codenotChangedSuccessfully",function(event,data){
            $rootScope.OZNotify('Some issue with server! Please try after some time', 'error');$scope.showSpinners = 0;
    });

    $scope.deleteCurrentCode = function(ids)
    {
            ProviderServicesList.deleteDiscountCode(ids);
    };

   var cleanUpEventcodeRemovedSuccessfully = $scope.$on("codeRemovedSuccessfully",function(event,data, list){
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
                ProviderServicesList.getAllDiscountCodes();
            } 
    });
                                                                            
    var cleanUpEventcodeNotRemovedSuccessfully = $scope.$on("codeNotRemovedSuccessfully",function(event,data){
            $rootScope.OZNotify('Some issue with server! Please try after some time', 'error');$scope.showSpinners = 0;
    });

    $scope.currentDiscountCode = '';

    $scope.assignCodeContent = function(ids)
    {
             $scope.currentDiscountCode = ids;
    };

    $scope.$on('$destroy', function(event, message) 
    {
             cleanUpEventaddedProductDiscountCode();

             cleanUpEventnotaddedProductDiscountCode();

             cleanUpEventnotaddedProductDiscountCode();

             cleanUpEventnotgotProductDiscountCode();

             cleanUpEventGotAllProducts();

             cleanUpEventnotgotAllProducts();

             cleanUpEventAssignedDiscountCodes();

             cleanUpEventNotAssignedDiscountCodes();

             cleanUpEventGotExistingProductsWithCode();

             cleanUpEventcodeChangedSuccessfully();

             cleanUpEventcodenotChangedSuccessfully();

             cleanUpEventcodeRemovedSuccessfully();

             cleanUpEventcodeNotRemovedSuccessfully();
    });


  }]);