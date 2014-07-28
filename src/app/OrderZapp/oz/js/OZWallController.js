angular.module('oz.UserApp')
  .controller('OZWallController', ['$scope', '$state', '$http', '$timeout', '$sce', '$log', 'UserSessionService',  'OZWallService', '$rootScope' ,function($scope, $state, $http, $timeout, $sce, $log, UserSessionService, OZWallService, $rootScope) {
     
     OZWallService.getContentOfOrder();

     $scope.branchNames = [];

     $scope.branchContent = [];

     $scope.currentBranch = {'branchname':''};

     $scope.type = "order";
  
     $scope.showOrderResult = 0 ;

     $scope.viewOrderContent = 0;

     $scope.viewProductContent = 0;

     $scope.controlWallView = 1;    

     $scope.showSorderView = 0;

     $scope.currentBranchId = '';
    
     $scope.products = {};

     $scope.orders = {};

     $scope.currentPage = 0;

     $scope.pageSize = 3;

     $scope.showTabs = 0; 

     $scope.searchCriteria = '';

     $scope.template = {};

     $scope.template.content = '';

     $scope.templates = {'hp' : '', 'au' : '', 'pp' : '', 'sa' : '', 'tc' : ''};

     $scope.orders = 10;

     $scope.customers = 110;

  

    $scope.orderContentObject = {}; $scope.hideLoadMore = 0;

    $scope.showTextAngular = 0;
    $scope.active = {'init' :''};
    $scope.active.init = false; 

    OZWallService.getAllProvidersList();

    $scope.providers = {'list' : []};

    $scope.trigger = function()
    {
      $scope.active.init = true;
      $scope.showConfigurationWizard = false;
      $scope.showPoliciesWizard = false;
    };

    $scope.triggerConfigurationWizard = function()
    {
           $scope.showConfigurationWizard = true;
           $scope.showPoliciesWizard = false;
           $scope.active.init = false;
    };

    $scope.triggerPoliciesWizard = function()
    {
           $scope.showPoliciesWizard = true;
           $scope.showConfigurationWizard = false;
           $scope.active.init = false;

    };
  
    $scope.providerlogo = '';
      
     $scope.showSpinners = 0;

     $scope.orderViewStatus = true;

     $scope.productViewStatus = false;

     $scope.getOrderContent = function()
     { 
              OZWallService.getContentOfOrder();
     };
   
     $scope.showRadioButtonss = 0;

     $scope.$on('branch', function (event, name, branches, image, providerid)
      {
              $scope.emptyAllContent();
              $scope.branchNames = name; 
              $scope.branchContent = branches; 
              $scope.controlWallView = 0;if(branches !== undefined) {$scope.controlWallView = 1; $scope.showSorderView = 0;} 
              $scope.currentBranch = $scope.branchContent[0];
              $scope.providerlogo = image;    
              $scope.showSpinners = 0;           
              $scope.showTabs = 0;
              $rootScope.adminProviderId = providerid;
              $scope.active.init = true;
              // $state.transitionTo('');
      });

     $scope.clearTemplatecontent = function()
     {
                $scope.template.content = '';
     };

      $scope.emptyAllContent = function()
      {
          $scope.branchNames = [];
          $scope.branchContent = {};
          $scope.showRadioButtonss = 0;
          $scope.orders = {};
          $scope.products = {};
          $scope.viewProductContent = 0;
          $scope.viewOrderContent = 0;
          $scope.orderContentObject = {};
      };

      $scope.$on('order', function(event, content)
      {
          $scope.orderContentObject = content; 
          $scope.showSOrderView = 1;
          $scope.controlWallView = 0;

          // console.log('content from suborder search '+ content);
      });
 
     $scope.showOrderContent = function(branchid)
     {   
         $scope.orders = [];              $scope.hideLoadMore = 0; 
         $scope.showSpinners = 1;
         //$rootScope.showSpinner();
         $scope.currentBranchId = branchid;
         $scope.showOrderContents(); 
         $scope.showTabs = 0;
         // $scope.showSOrderView = 0;
         // $scope.controlWallView = 1;
         $scope.orderViewStatus = true;             $scope.productViewStatus = false;
     };

     $scope.showProductContent = function()
     {
           $scope.type = "product";
           if($scope.currentBranchId === '')
           {
            // $rootScope.OZNotify('Please search provider from sidebar and then proceed ! ', 'error');
            $rootScope.OZNotify('Please search provider from sidebar to view product details ! ', 'error');
           }
           else
           {
            OZWallService.getAllBranchOrders($scope.currentBranchId,$scope.type);
          }
           $scope.orderViewStatus = false;         
           $scope.productViewStatus = true;
     };

     $scope.showOrderContents = function()
     {
           $scope.type = "order";
           if($scope.currentBranchId === '')
           {
            // $rootScope.OZNotify('Please search provider from sidebar and then proceed ! ', 'error');
              $rootScope.OZNotify('Please search provider from sidebar to view order details ! ', 'error');
           }
           else
           {
            OZWallService.getAllBranchOrders($scope.currentBranchId,$scope.type);
          }
            $scope.showRadioButtonss = 1;
           $scope.viewOrderContent = 0;
           $scope.viewProductContent = 0;
           $scope.orderViewStatus = true;   
           $scope.productViewStatus = false;
     };

    var cleanUpEventGetAllBranchSpecificorders = $scope.$on("gotAllBranchSpecificOrders",function(event,data){
           $scope.hideLoadMore = 0;
            if(data.error)
            {//test
                  if(data.error.code === 'AL001')
                  {
                        $rootScope.showModal();
                  }
                  else
                  {
                      $rootScope.OZNotify(data.error.message,'error');
                      $scope.showOrderResult = 0;
                      $scope.showSpinners = 0; 
                      $scope.showTabs = 1;
                  }
                  $scope.products = {};
                  $scope.orders = {};
            }
            if(data.success)
            {   
                //$scope.orders = {};
                //$rootScope.hideSpinner();
                $scope.showSpinners = 0;
                if(data.success.orders !== undefined)
                { 
                  $scope.orders = data.success.orders; 
                  $scope.viewOrderContent = 1;    
                }
                else
                {
                  $scope.products = {};
                  $scope.products = data.success.doc;
                  $scope.viewProductContent = 1;
                }

                if($scope.orders !== undefined)
                 {
                   if($scope.orders.length >0)
                   {
                        $scope.showOrderResult = 1;
                   }
                   else
                   {
                        $scope.showOrderResult = 0;
                   }
                 } 
                $scope.showTabs = 1;
              } 
    });

    var cleanUpEventNotGotAllBranchSpecificorders = $scope.$on("notGotAllBranchSpecificOrders",function(event,data){
            $rootScope.OZNotify('Some issue with server! Please try after some time', 'error');$scope.showSpinners = 0;
    });


    $scope.sendTemplateContent = function(type)
    {   
      OZWallService.insertTemplateContent($scope.jsonTemplateContent(type), type);
    };

   $scope.jsonTemplateContent = function(type) {
      var currentTemplate = 
        {
          'templatedata':
          {
            'type' : type,
            'template' : $scope.template.content,
          }
       
        };
      return JSON.stringify(currentTemplate); 
  };

     $scope.jsonTemplateContentChange = function() {
      var currentTemplate = 
        {
          'templatedata':
          {
            'template' : $scope.template.content,
          }
       
        };
      return JSON.stringify(currentTemplate); 
  };

   var cleanUpEventSentTemplateSuccessfully = $scope.$on("contentAddedSuccessfully",function(event,data,type){
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
            $rootScope.OZNotify(data.success.message,'success');
            $scope.template.content = '';
            $scope.getTemplateContent(type);
            
        } 
    });

    var cleanUpEventNotSentTemplateSuccessfully = $scope.$on("contentNotAddedSuccessfully",function(event,data){
            $rootScope.OZNotify('Some issue with server! Please try after some time', 'error');$scope.showSpinners = 0;
    });

    $scope.getTemplateContent = function(type)
    {   
               $scope.showTextAngular = 0;
               OZWallService.getTemplateContent(type);
    };

    $scope.updateCurrentTemplateContent = function(type)
    {     
          OZWallService.changeTemplateContent($scope.jsonTemplateContentChange(),type);
    };

   var cleanUpEventUpdateTemplateSuccessfully = $scope.$on("contentChangedSuccessfully",function(event,data,type){
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
            $rootScope.OZNotify(data.success.message,'success');
            $scope.getTemplateContent(type);
        } 
    });

    var cleanUpEventUpdateTemplateFailure = $scope.$on("contentNotChanged",function(event,data){
            $rootScope.OZNotify('Some issue with server! Please try after some time', 'error');$scope.showSpinners = 0;
    });


    var cleanUpEventgetTemplateSuccessfully = $scope.$on("gotTemplates",function(event,data){
        if(data.error)
        {
           // $rootScope.OZNotify(data.error.message,'error');
               if(data.error.code === 'AL001')
                  {
                        $rootScope.showModal();
                  }
                
        }
        if(data.success)
        {    
            $scope.templates = {'hp' : '', 'au' : '', 'pp' : '', 'sa' : '', 'tc' : ''};
            if(data.success.template.type.toLowerCase() === 'hp')
            {
              $scope.templates.hp = data.success.template.template;
            }
            if(data.success.template.type.toLowerCase() === 'au')
            {
              $scope.templates.au = data.success.template.template;
            }
            if(data.success.template.type.toLowerCase() === 'tc')
            {
              $scope.templates.tc = data.success.template.template;
            }
            if(data.success.template.type.toLowerCase() === 'pp')
            {
              $scope.templates.pp = data.success.template.template;
            }
              if(data.success.template.type.toLowerCase() === 'sa')
            {
              $scope.templates.sa = data.success.template.template;
            }
        } 
    });

    var cleanUpEventNotGotTemplateSuccessfully = $scope.$on("notGotTemplates",function(event,data){
            $rootScope.OZNotify('Some issue with server! Please try after some time', 'error');$scope.showSpinners = 0;
    });

    $scope.updateCurrentTemplate = function(content)
    {  
      $scope.template.content = content;
        $scope.showTextAngular = 1;

    };

    $scope.accept = function(id)
    {
          OZWallService.acceptProviderRequest(id, 'accept');
    };

    $scope.reject = function(id)
    {
          OZWallService.acceptProviderRequest(id, 'reject');
    };

   var cleanUpEventproviderRequestAcceptORReject = $scope.$on("providerRequestAccepted",function(event,data){
        if(data.error)
        {

                if(data.error.code === 'AL001')
                  {
                        $rootScope.showModal();
                  }
                  else
                  {$rootScope.OZNotify(data.error.message,'error');}
        }
        if(data.success)
        {    
            $rootScope.OZNotify(data.success.message, 'success');
            OZWallService.getAllProvidersList();
        } 
    });

    var cleanUpEventproviderRequestAcceptORRejectFail = $scope.$on("providerRequestNotAccepted",function(event,data){
            $rootScope.OZNotify('Some issue with server! Please try after some time', 'error');
    });

    // $scope.getAllProviderList = function()
    // {
      
    // };
    
    $scope.getAllProvidersList = function()
    {
          OZWallService.getAllProvidersList();
    };

    var cleanUpEventgetAllProvidersSuccess = $scope.$on("gotAllProviders",function(event,data){
        if(data.error)
        {
        if(data.error.code === 'AL001')
            {
                  $rootScope.showModal();
            }
            else
            {
            //$rootScope.OZNotify(data.error.message,'error');
            $scope.providers.list = [];
          }
        }
        if(data.success)
        {
               $scope.providers.list = data.success.provider;
        } 
    });

    var cleanUpEventNotGotAllProviders = $scope.$on("notGotAllProvider",function(event,data){
            $rootScope.OZNotify('Some issue with server! Please try after some time', 'error');
    });

    $scope.loadMoreOrder = function(id)
    { 
          $scope.showSpinners = 1;
          OZWallService.loadMoreOrder(id);
    };

     var cleanUpEventLoadMore = $scope.$on("more",function(event,data){
        if(data.error)
        {
                if(data.error.code === 'AL001')
                  {
                        $rootScope.showModal();
                  }
                  else
                  {$rootScope.OZNotify(data.error.message,'error');  $scope.showSpinners = 0;}
        }
        if(data.success)
        {      $scope.showSpinners = 0;
               for (var j = 0 ; j<data.success.orders.length; j++)
               {
                      $scope.orders.push(data.success.orders[j]);
               }
               if(data.success.orders.length <10)
               {
                 $scope.hideLoadMore = 1;
               }
        } 
    });

    var cleanUpEventLoadMoreFail = $scope.$on("fail",function(event,data){
            $rootScope.OZNotify('Some issue with server! Please try after some time', 'error');
    });



    $scope.$on('$destroy', function(event, message) 
    {
        cleanUpEventGetAllBranchSpecificorders();
        cleanUpEventNotGotAllBranchSpecificorders();
        cleanUpEventSentTemplateSuccessfully();
        cleanUpEventNotSentTemplateSuccessfully();
        cleanUpEventgetTemplateSuccessfully();
        cleanUpEventNotGotTemplateSuccessfully();
        cleanUpEventUpdateTemplateSuccessfully();
        cleanUpEventUpdateTemplateFailure();
        cleanUpEventgetAllProvidersSuccess();
        cleanUpEventNotGotAllProviders();
        cleanUpEventproviderRequestAcceptORReject();
        cleanUpEventproviderRequestAcceptORRejectFail();
        cleanUpEventLoadMore();
        cleanUpEventLoadMoreFail();
        // cleanUpEventgetAllCountSuccess();
        // cleanUpEventNotGotAllCount();

    });

    $scope.numberOfPages = function () 
    {    
         return Math.ceil($scope.branchContent.length / $scope.pageSize);
    };
    
    $scope.getAllProviders = function()
    {
          OZWallService.getAllProvidersList();
    };

    $scope.showConfigurationContent = function(product)
    {
       if(product.editing === true)
       {
        product.editing = false;
       }
       else
       {
        product.editing = true;
       }

    };

    $scope.clearContentT = function()
    {
          $scope.showSOrderView = 0;
    };
    // if(userCounter.error)
    // {
    //         $rootScope.OZNotify('There is some issue with server!', 'error');
    // }
    // if(userCounter.success)
    // {
    //   $rootScope.OZNotify('success','success');
    //   console.log(JSON.stringify(userCounter.success));
    // }
    $scope.resetToMain = function()
    {
          $scope.showSOrderView = 0;
          $scope.controlWallView = 1;
    };


 }]);

angular.module('oz.UserApp').filter('startFrom', function () {
  return function (input, start) {
    if (input !== undefined || start !== undefined) {
      start = +start;
      return input.slice(start);
    }
  }
})