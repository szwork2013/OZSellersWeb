

angular.module('oz.UserApp')
  .controller('OZAdminController', ['$scope', '$state', '$http', '$timeout', '$sce', '$log', 'UserSessionService',  'OZWallService', '$rootScope', '$upload', function($scope, $state, $http, $timeout, $sce, $log, UserSessionService, OZWallService, $rootScope, $upload) {

     OZWallService.getAllCategories();

    $scope.ContentOfAllCategories = [];
 
    $scope.levelOneIds = ''; $scope.levelTwoIds = ''; $scope.levelThreeIds = '';

    $scope.arrayOfCategoryI = [];

    $scope.arrayOfCategoryII = [];

    $scope.arrayOfCategoryIII = [];

    $scope.category = [];

    OZWallService.getProductTags();

    $scope.allTagsContent = [];

    $scope.newTagsToBeSent = '';

    OZWallService.getAllProvidersLists();

    $scope.categoryIdContent = {};

    $scope.content = ''; 

    $scope.provider = {}; 

    var file; 

    $scope.showSpinners = 0;

    $scope.categoryLevelIII = [];

    $scope.contentOfCategories = {'categoryid' : '', 'configurationname' : '', 'configurationprice' : '', 'uom' : '',  'configurationtype' : '', 'description' : ''};
    
    $scope.categoryIdContents = {};

    OZWallService.getProductCriteria();

    $scope.allConfigContent = [];

    $scope.regexForNumbers = /[0-9]/;

    OZWallService.getOrderProcessConfig();

    $scope.orderProcessConfig = [];

    $scope.order = {'index' : '', 'order_status' : '', 'require' : ''};

    var cleanUpEventGotAllCategories = $scope.$on("gotAllCategoriesContent",function(event,data){
		    if(data.error)
		    {
		    	   if(data.error.code === 'AL001')
		    	   {
		    	   	    $rootScope.showModal();
		    	   }
		    	   else
		    	   {
		                $rootScope.OZNotify(data.error.message,'error');  $scope.showSpinners = 0;
		         }
		    }
		    if(data.success)
		    {      
                    $scope.ContentOfAllCategories = data.success.ProductCategory;
                    for(var i = 0; i<$scope.ContentOfAllCategories.length; i++)
                    {
                    	if($scope.ContentOfAllCategories[i].level === 1 && $scope.ContentOfAllCategories[i].category !== undefined)
                    	{
                    		$scope.arrayOfCategoryI = $scope.ContentOfAllCategories[i].category;
                    	}
                    	if($scope.ContentOfAllCategories[i].level === 2 && $scope.ContentOfAllCategories[i].category !== undefined)
                    	{
                    		$scope.arrayOfCategoryII = $scope.ContentOfAllCategories[i].category;
                    	}
                    	if($scope.ContentOfAllCategories[i].level === 3 && $scope.ContentOfAllCategories[i].category !== undefined)
                    	{
                    		$scope.arrayOfCategoryIII = $scope.ContentOfAllCategories[i].category;
                    	}
                    }
		          $scope.category = $scope.arrayOfCategoryI;
		    } 
    });

    var cleanUpEventNotGotAllCategories = $scope.$on("notGotAllCategories",function(event,data){
            $rootScope.OZNotify('Some issue with server! Please try after some time', 'error');
    });

    $scope.fetchLevelIIContent = function()
    { 
    	if($scope.levelOneIds.categoryid === '')
    	{
    		$rootScope.OZNotify('Please select atleast one level one category', 'error');
    	}
    	else if($scope.levelOneIds.categoryid !== '')
    	{     
    		    $scope.tempArray = [];
                for(var i = 0 ; i<$scope.arrayOfCategoryII.length; i++)
                {    
                	if($scope.levelOneIds.categoryid === $scope.arrayOfCategoryII[i].parent)
                	{
                		 $scope.tempArray.push($scope.arrayOfCategoryII[i]);
                	}
                }
                $scope.arrayOfCategoryII = $scope.tempArray;
                $scope.category = $scope.arrayOfCategoryII;
    	}
    };

    $scope.fetchLevelThreeContent = function()
    {
    	if($scope.levelTwoIds.categoryid === '')
    	{
    		$rootScope.OZNotify('Please select category from level two', 'error');
    	}
    	else if ($scope.levelTwoIds.categoryid !== '')
    	{    $scope.tempArray = [];
    		for(var i = 0; i<$scope.arrayOfCategoryIII.length ; i++)
    		{
    			if($scope.levelTwoIds.categoryid === $scope.arrayOfCategoryIII[i].parent)
    			{
    				$scope.tempArray.push($scope.arrayOfCategoryIII[i]);
    			}
    		}
    		$scope.arrayOfCategoryIII = $scope.tempArray;
    		$scope.category = $scope.arrayOfCategoryIII;
    	}
    };

    $scope.addToLavelFirst = function()
    {
        $scope.object = {};
        $scope.object = {'categorydata' : {'categoryname' : $scope.levelOneIds}};
    	OZWallService.addToLevelFirst($scope.object);
    };

    $scope.addToSecLevel = function()
    {
    	$scope.content = {'subcategory' : {'categoryname' : $scope.levelTwoIds}}; 
    	//console.log(JSON.stringify($scope.content)+'----'+ $scope.levelOneIds.categoryid);
    	OZWallService.addToLowerCategories($scope.levelOneIds.categoryid, $scope.content);
    };

    // $scope.addToLevelThree = function()
    // {
    // 	OZWallService.addToLowerCategories($scope.le)
    // }

    $scope.addToLevelThree = function()
    {
    	$scope.content = {'subcategory' : {'categoryname' : $scope.levelThreeIds}};
    	console.log(JSON.stringify($scope.content)+'----'+ $scope.levelTwoIds.categoryid);
    	OZWallService.addToLowerCategories($scope.levelTwoIds.categoryid, $scope.content);
    }

     var cleanUpEventAddToCategoryFirsts = $scope.$on("addedToFirstCategory",function(event,data){
		    if(data.error)
		    {
    	      if(data.error.code === 'AL001')
              {
                    $rootScope.showModal();
              }
              else
              {
		            $rootScope.OZNotify(data.error.message,'error');  $scope.showSpinners = 0;
		      }
		    }
		    if(data.success)
		    {      
		            $rootScope.OZNotify('Category added successfully', 'success');
		               OZWallService.getAllCategories();
		    } 
    });

    var cleanUpEventNotAddToCategoryFirst = $scope.$on("addedToFirstCategoryFailed",function(event,data){
            $rootScope.OZNotify('Some issue with server! Please try after some time', 'error');
    });

    // $scope.test = function(content)
    // {
    // 	alert(content);
    // };

     var cleanUpEventCategoryAddedSuccessfully = $scope.$on("insertToLowerCategorySuccess",function(event,data){
		    if(data.error)
		    {
    	      if(data.error.code === 'AL001')
              {
                      $rootScope.showModal();
              }
              else
              {
		            $rootScope.OZNotify(data.error.message,'error');  $scope.showSpinners = 0;
		      }
		    }
		    if(data.success)
		    {      
                    $rootScope.OZNotify(data.success.message, 'success');
                    OZWallService.getAllCategories();
		    } 
    });

    var cleanUpEventCategoryNotaddedSuccessfully = $scope.$on("insertToLowerCategoryError",function(event,data){
            $rootScope.OZNotify('Some issue with server! Please try after some time', 'error');
    });

    $scope.refreshArrayLists = function()
    {
    	  OZWallService.getAllCategories();
    	  $scope.levelTwoIds = ''; $scope.levelOneIds = '';
    	  $scope.levelThreeIds = '';
    };

    $scope.edit = function(list)
    {
    	list.editing = true;
    };

    $scope.stop = function(list)
    {
    	list.editing = false;
    };

    $scope.modifyCategoryName = function(list)
    {
    	if(list.categoryname === '')
    	{
    		$rootScope.OZNotify('Please add valid categoryname', 'error');
    	}
    	else
    	{
    		$scope.content = {'categorydata' : { 'categoryname' : list.categoryname}};
            OZWallService.modifyCategoryName(list.categoryid, $scope.content);
        }
    };

    var cleanUpEventCategoryModifiedSuccessfully = $scope.$on("categoryModifiedSuccessfully",function(event,data){
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
                    OZWallService.getAllCategories();
		    } 
    });

    var cleanUpEventCategoryNotModifiedSuccessfully = $scope.$on("categoryNotModifiedSuccessfully",function(event,data){
            $rootScope.OZNotify('Some issue with server! Please try after some time', 'error');
    });

    var cleanUpEventGotAllTags= $scope.$on("gotAllTags",function(event,data){
            if(data.error)
            {
              if(data.error.code === 'AL001')
              {
                      $rootScope.showModal();
              }
              else
              {
                    $rootScope.OZNotify(data.error.message,'error');  $scope.showSpinners = 0;
              }
            }
            if(data.success)
            {      
                    $scope.allTagsContent = data.success.tagnames;
            } 
    });

    var cleanUpEventNotGotAllTags = $scope.$on("notGotAllTags",function(event,data){
            $rootScope.OZNotify('Some issue with server! Please try after some time', 'error');
    });

    $scope.insertProductTags = function()
    {
          if($scope.newTagsToBeSent === '')
          {
            $rootScope.OZNotify('Please add atleast one tag', 'error');
          }
          else
          {
            $scope.content = {'tagnames' : []};

            var partsOfStr = $scope.newTagsToBeSent.split(','); $scope.newTagContent = [];
            for(var i = 0 ; i< partsOfStr.length ; i++)
            {
                    if(partsOfStr[i] !== '')
                       $scope.newTagContent.push(partsOfStr[i].toLowerCase());
            }
            $scope.content.tagnames = $scope.newTagContent;
            console.log('JASON ' + JSON.stringify($scope.content));
            OZWallService.insertProductTags($scope.content);
          }
    };

    var cleanUpEventNewTagsInsert= $scope.$on("tagsInsertedSuccessfully",function(event,data){
            if(data.error)
            {
              if(data.error.code === 'AL001')
              {
                      $rootScope.showModal();
              }
              else
              {
                    $rootScope.OZNotify(data.error.message,'error');  $scope.showSpinners = 0;
              }
            }
            if(data.success)
            {      
                    $rootScope.OZNotify(data.success.message, 'success');$scope.newTagsToBeSent = ''
                    OZWallService.getProductTags();
            } 
    });

    var cleanUpEventNotInsertedNewTags = $scope.$on("tagsNotInsertedSuccessfully",function(event,data){
            $rootScope.OZNotify('Some issue with server! Please try after some time', 'error');
    });

    $scope.jsonDeleteTagData = function(content){
      var data = 
      {
        "tagname" : content
      };
      return JSON.stringify(data); 
    } 
    $scope.removeTagContent = function(content)
    {
             OZWallService.deleteProductTags(content);
    };

    var cleanUpEventTagRemoveSuccess = $scope.$on("productTagDeletedSuccessfully",function(event,data){
            if(data.error)
            {
              if(data.error.code === 'AL001')
              {
                      $rootScope.showModal();
              }
              else
              {
                    $rootScope.OZNotify(data.error.message,'error');  $scope.showSpinners = 0;
              }
            }
            if(data.success)
            {      
                    $rootScope.OZNotify(data.success.message, 'success');
                    OZWallService.getProductTags();
            } 
    });

    var cleanUpEventTagRemoveFailure = $scope.$on("productTagNotDeleted",function(event,data){
            $rootScope.OZNotify('Some issue with server! Please try after some time', 'error');
    });
    $scope.allProvidersContent = [];
   var cleanUpEventTagRemoveSuccess = $scope.$on("gotAllProviders",function(event,data){
            if(data.error)
            {
              if(data.error.code === 'AL001')
              {
                      $rootScope.showModal();
              }
              else
              {
                    $rootScope.OZNotify(data.error.message,'error');  $scope.showSpinners = 0;
              }
            }
            if(data.success)
            {      
                   $scope.allProvidersContent = data.success.productprovider;
            } 
    });

    var cleanUpEventTagRemoveFailure = $scope.$on("notGotAllProviders",function(event,data){
            $rootScope.OZNotify('Some issue with server! Please try after some time', 'error');
    });

    $scope.onFileSelect = function($files)  {
     for (var i = 0; i < $files.length; i++) {
      if(($files[i].type == 'image/jpg') || ($files[i].type == 'image/png') || ($files[i].type == 'image/gif') || ($files[i].type == 'image/jpeg')){
       file = $files[i];
      }
      else{
        var field= document.getElementById('addAgreementSeller');
        field.value= '';
        $rootScope.OZNotify("Please upload image only" ,'error');
       }

      }
    };

    $scope.sendSellerPariticpationAgreement = function()
    {
         console.log('test');
      if($scope.provider.providerid === undefined)
      {
        $rootScope.OZNotify('Please select atleast one provider from list', 'error');
      }
      else
      {
              if(file === undefined || file === {})
              {
                $rootScope.OZNotify('Please select file before proceeding', 'error');
              }
              else
              {       $scope.showSpinners = 1;
                      $scope.upload = $upload.upload({
                        url: '/api/sellersagreement/'+$scope.provider.providerid, 
                        data: {"data":{'description' : $scope.content}} ,
                        file:file, 
                      })
                      .progress(function(event)
                      {

                      })
                      .success(function(data, status, headers, config)
                      {
                              if(data.success)
                              {
                                     $rootScope.OZNotify(data.success.message, 'success');
                                     OZWallService.getAllSellerAgreementContent($scope.provider.providerid);
                              }
                              $scope.showSpinners = 0;
                      })
                      .error(function(data, status, headers, config)
                      {
                              if(data.error)
                              {
                                     $rootScope.OZNotify(data.error.message, 'error');
                              }
                               $scope.showSpinners = 0; 
                      });
               }       
      }
    };

    $scope.insertSellerPariticpationAgreement = function()
    {
       
      if($scope.provider.providerid === undefined)
      {
        $rootScope.OZNotify('Please select atleast one provider from list', 'error');
      }
      else
      {
              if(file === undefined || file === {})
              {
                $rootScope.OZNotify('Please select file before proceeding', 'error');
              }
              else
              {       $scope.showSpinners = 1;
                      $scope.upload = $upload.upload({
                        url: '/api/sellersagreement/file/'+$scope.provider.providerid, 
                        data: {"data":{'description' : $scope.content}} ,
                        file:file, 
                      })
                      .progress(function(event)
                      {

                      })
                      .success(function(data, status, headers, config)
                      {
                              if(data.success)
                              {
                                     $rootScope.OZNotify(data.success.message, 'success');
                                     OZWallService.getAllSellerAgreementContent($scope.provider.providerid);
                              }
                              $scope.showSpinners = 0;
                      })
                      .error(function(data, status, headers, config)
                      {
                              if(data.error)
                              {
                                     $rootScope.OZNotify(data.error.message, 'error');
                              }
                               $scope.showSpinners = 0; 
                      });
               }       
      }

    };

   $scope.sellerAgreementContent = [];
   $scope.showSellerInsertScreen = 0;
   var cleanUpEventGotSellerAgreements = $scope.$on("gotSellerAgreement",function(event,data){
            if(data.error)
            {
              if(data.error.code === 'AL001')
              {
                      $rootScope.showModal();
              }
              else
              {
                    $rootScope.OZNotify(data.error.message,'error');  $scope.showSpinners = 0;$scope.sellerAgreementContent = {};$scope.showSellerInsertScreen = 0;
              }
            }
            if(data.success)
            {      
                  $scope.sellerAgreementContent = [];
                  $scope.sellerAgreementContent  = data.success.sellersagreement;$scope.showSellerInsertScreen = 1;
            } 
    });

    var cleanUpEventNotGotSellerAgreement = $scope.$on("notGotSellerAgreement",function(event,data){
            $rootScope.OZNotify('Some issue with server! Please try after some time', 'error');
    });

    $scope.getSellerAgreementContent = function(list)
    {
      if(list.providerid === undefined || list.providerid === '')
      {

      }
      else
      {
        OZWallService.getAllSellerAgreementContent(list.providerid);
      }
    };

    $scope.getLevelThreeContent = function()
    {
           $scope.categoryLevelIII = [];
           for(var i = 0 ; i < $scope.arrayOfCategoryIII.length ; i++)
           {
            if($scope.categoryIdContent.categoryid === $scope.arrayOfCategoryIII[i].parent)
            {
              $scope.categoryLevelIII.push($scope.arrayOfCategoryIII[i])

            }
           } 
    };
    $scope.clear = function()
    {
      $scope.contentOfCategories = {'categoryid' : '', 'configurationname' : '', 'configurationprice' : '', 'uom' : '',  'configurationtype' : ''};
    };

    $scope.addTheCriteria = function()
    {
          if($scope.categoryIdContents.categoryid === undefined || $scope.categoryIdContents.categoryid === '')
          {
            $rootScope.OZNotify('Please select atleast one level three category', 'error');
          }
          else if($scope.contentOfCategories.configurationtype === '')
          {
            $rootScope.OZNotify('Please enter valid configurationtype' , 'error');
          }
          else if($scope.contentOfCategories.configurationname === '')
          {
             $rootScope.OZNotify('Please enter valid configuration name', 'error');
          }
          else if($scope.contentOfCategories.configurationprice === '' || $scope.regexForNumbers.test($scope.contentOfCategories.configurationprice) === false)
          {
            $rootScope.OZNotify('Please enter valid configuration price', 'error');
          }
          else if($scope.contentOfCategories.uom === '')
          {
            $rootScope.OZNotify('Please enter valid unit of measurement ', 'error');
          }
          else if($scope.contentOfCategories.description === '')
          {
            $rootScope.OZNotify('Please enter valid configuration description ', 'error');
          }

          // $scope.ContentOfAllCategories.categoryid = $scope.categoryIdContents.categoryid;
          else
          {  
          var status = 0;
            for(var i = 0 ; i< $scope.allConfigContent.length ; i ++)
            {
              if($scope.categoryIdContents.categoryid === $scope.allConfigContent[i].categoryid)
              {
                      $scope.changeOfCriteria = [];
                      $scope.changeOfCriteria = $scope.allConfigContent[i];
                      $scope.changeOfCriteria.configuration.push({'prod_configtype' : $scope.contentOfCategories.configurationtype, 'prod_configname' : $scope.contentOfCategories.configurationname , 'prod_configprice' : { 'value' : $scope.contentOfCategories.configurationprice , 'uom' :  $scope.contentOfCategories.uom}, 'description' : $scope.contentOfCategories.description});
                      
                      $scope.putContentToCriteria = {'productconfig' : { 'configuration' : $scope.changeOfCriteria.configuration}};
                          
                      OZWallService.changeProductCriteria($scope.putContentToCriteria,$scope.categoryIdContents.categoryid);
                      status = 1;
              }
            }
            if(status === 0)
            {
                    $scope.objectOfCriteria = {};
                    $scope.objectOfCriteria = {'productconfig' : {'categoryname' : $scope.categoryIdContents.categoryname, 'configuration' : [{'prod_configtype' : $scope.contentOfCategories.configurationtype, 'prod_configname' : $scope.contentOfCategories.configurationname , 'prod_configprice' : { 'value' : $scope.contentOfCategories.configurationprice , 'uom' :  $scope.contentOfCategories.uom}, 'description' : $scope.contentOfCategories.description}] } };
                    
                    OZWallService.insertProductCriteria($scope.objectOfCriteria,$scope.categoryIdContents.categoryid)
            }
          }
    

    };

    var cleanUpEventCriteriaAddedSuccessfully= $scope.$on("categoryAddedSuccessfully",function(event,data){
            if(data.error)
            {
              if(data.error.code === 'AL001')
              {
                      $rootScope.showModal();
              }
              else
              {
                    $rootScope.OZNotify(data.error.message,'error');  $scope.showSpinners = 0;
              }
            }
            if(data.success)
            {      
                    $rootScope.OZNotify(data.success.message, 'success');
                    $scope.contentOfCategories = {'categoryid' : '', 'configurationname' : '', 'configurationprice' : '', 'uom' : '',  'configurationtype' : '', description : ''};
                     OZWallService.getProductCriteria();
                     $scope.categoryIdContent = {};
                     $scope.categoryIdContents = {};

            } 
    });

    var cleanUpEventCriteriaNotAddedSuccessfully = $scope.$on("categoryNotAdded",function(event,data){
            $rootScope.OZNotify('Some issue with server! Please try after some time', 'error');
    });


    var cleanUpEventGotAllProductCriteria = $scope.$on("gotAllCriteriaSuccessfully",function(event,data){
            if(data.error)
            {
              if(data.error.code === 'AL001')
              {
                      $rootScope.showModal();
              }
              else
              {
                    $rootScope.OZNotify(data.error.message,'error');  $scope.showSpinners = 0;
              }
            }
            if(data.success)
            {      
                    //$rootScope.OZNotify(data.success.message, 'success');
                    
                    $scope.allConfigContent = [];
                    $scope.allConfigContent = data.success.productconfig;
            } 
    });

    var cleanUpEventNotGotAllProductCriteria = $scope.$on("notGotProductCriteria",function(event,data){
            $rootScope.OZNotify('Some issue with server! Please try after some time', 'error');
    });

    $scope.editCriteriaContent = function(list)
    {
      list.editing = true;
    };

    $scope.cancel = function(list)
    {
      list.editing = false;
    };


    $scope.changeCriteriaContent = function(list)
    {
    
          
         if(list.configuration[0].prod_configtype === '')
          {
            $rootScope.OZNotify('Please enter valid configurationtype' , 'error');
          }
          else if(list.configuration[0].prod_configname === '')
          {
             $rootScope.OZNotify('Please enter valid configuration name', 'error');
          }
          else if(list.configuration[0].prod_configprice.value === '' || $scope.regexForNumbers.test(list.configuration[0].prod_configprice.value) === false)
          {
            $rootScope.OZNotify('Please enter valid configuration price', 'error');
          }
          else if(list.configuration[0].prod_configprice.uom === '')
          {
            $rootScope.OZNotify('Please enter valid unit of measurement ', 'error');
          }
          else
          {
                $scope.objectOfCriteria = {};
                $scope.objectOfCriteria = {'productconfig' : {'configuration' : [{'prod_configtype' : list.configuration[0].prod_configtype, 'prod_configname' : list.configuration[0].prod_configname , 'prod_configprice' : { 'value' : list.configuration[0].prod_configprice.value , 'uom' :  list.configuration[0].prod_configprice.uom}}] } };
               
                OZWallService.changeProductCriteria($scope.objectOfCriteria,list.categoryid);
          }
    };

    var cleanUpEventCriteriaChangedSuccessfully= $scope.$on("productCriteriaChanged",function(event,data){
            if(data.error)
            {
              if(data.error.code === 'AL001')
              {
                      $rootScope.showModal();
              }
              else
              {
                    $rootScope.OZNotify(data.error.message,'error');  $scope.showSpinners = 0;
              }
            }
            if(data.success)
            {      
                      $rootScope.OZNotify(data.success.message, 'success'); OZWallService.getProductCriteria();
                        $scope.categoryIdContent = {};
                     $scope.categoryIdContents = {};
                      $scope.contentOfCategories = {'categoryid' : '', 'configurationname' : '', 'configurationprice' : '', 'uom' : '',  'configurationtype' : ''};
                
            } 
    });

    var cleanUpEventCriteriaNotChangedSuccessfully = $scope.$on("productCriteriaNotChanged",function(event,data){
            $rootScope.OZNotify('Some issue with server! Please try after some time', 'error');
    });

    $scope.remove = function(list)
    {
      OZWallService.removeProductCriteria(list.configid);
    };

   var cleanUpEventCriteriaDeletedSuccessfully= $scope.$on("productCriteriaRemoved",function(event,data){
            if(data.error)
            {
              if(data.error.code === 'AL001')
              {
                      $rootScope.showModal();
              }
              else
              {
                    $rootScope.OZNotify(data.error.message,'error');  $scope.showSpinners = 0;
              }
            }
            if(data.success)
            {      
                      $rootScope.OZNotify(data.success.message, 'success'); OZWallService.getProductCriteria();
            } 
    });

    var cleanUpEventCriteriaNotDeletedSuccessfully = $scope.$on("productCriteriaRemovedFailure",function(event,data){
            $rootScope.OZNotify('Some issue with server! Please try after some time', 'error');
    });

    $scope.addOrderStatus = function()
    {
      if($scope.order.index === '' || $scope.regexForNumbers.test($scope.order.index) === false)
      {
        $rootScope.OZNotify('Please enter valid index', 'error');
      }
      else if ($scope.order.order_status === '')
      {
        $rootScope.OZNotify('Please add valid order status', 'error');
      }
      else if($scope.order.require === '')
      {
        $rootScope.OZNotify('Please select valid require option', 'error');
      }
      else
      {    console.log(JSON.stringify({'process' : $scope.order}));
        OZWallService.addOrderProcessConfig({'process' : $scope.order});
      }

    };

    var cleanUpEventOrderConfigurationAdded = $scope.$on("orderConfigAdded",function(event,data){
            if(data.error)
            {
              if(data.error.code === 'AL001')
              {
                      $rootScope.showModal();
              }
              else
              {
                    $rootScope.OZNotify(data.error.message, 'error' );
              }
            }
            if(data.success)
            {      
                      $rootScope.OZNotify(data.success.message, 'success'); 
                      OZWallService.getOrderProcessConfig();
            } 
    });

    var cleanUpEventOrderConfigurationNotAdded = $scope.$on("orderConfigNotAdde",function(event,data){
            $rootScope.OZNotify('Some issue with server! Please try after some time', 'error');
    });

    var cleanUpEventGetOrderProcessConfig = $scope.$on("gotAllOrderProcessSuccessfully",function(event,data){
            if(data.error)
            {  
              $scope.orderProcessConfig = [];
              if(data.error.code === 'AL001')
              {
                      $rootScope.showModal();
              }
              else
              {
                    $rootScope.OZNotify(data.error.message,'error');  $scope.showSpinners = 0;
              }
            }
            if(data.success)
            {      
                       $scope.orderProcessConfig = [];
                       $scope.orderProcessConfig = data.success.orderprocess; 
            } 
    });

    var cleanUpEventNotGotOrderProcessConfig = $scope.$on("notGotOrderProcess",function(event,data){
            $rootScope.OZNotify('Some issue with server! Please try after some time', 'error');
    });

    $scope.removeOrderProcess = function(index)
    {
      OZWallService.removeOrderConfigContent(index);
    };

    var cleanUpEventOrderProcessConfigurationRemove = $scope.$on('orderProcessConfigurationRemoved', function(event, data)
    {             
         if(data.error)
         {
          if(data.error.code === 'AL001')
          {
            $rootScope.showModal();
          }
          else
          {
            $rootScope.OZNotify(data.error.message, 'error');
          }
         }
         if(data.success)
         {
          $rootScope.OZNotify(data.success.message, 'success');
          OZWallService.getOrderProcessConfig();
         }
    });

    var cleanUpEventOrderProcessConfigurationRemoveError = $scope.$on('orderProcessNotRemoved', function(event, data)
    {
      $rootScope.OZNotify('Some issue with the server! Please try again after some time', 'error');
    });

    $scope.clearThisCategory = function(index, categoryid)
    {
            for(var i = 0 ; i< $scope.allConfigContent.length ; i ++)
            {
              if(categoryid === $scope.allConfigContent[i].categoryid)
              {
                      $scope.changeOfCriterias = [];
                      $scope.changeOfCriterias = $scope.allConfigContent[i];
                      $scope.changeOfCriterias.configuration.splice(index, 1);
                      
                      $scope.putContentToCriterias = {'productconfig' : { 'configuration' : $scope.changeOfCriterias.configuration}};
                       
                      OZWallService.changeProductCriteria($scope.putContentToCriterias, categoryid);
                      status = 1;
              }
            }
    };





    $scope.$on('$destroy', function(event, message) 
    {
        cleanUpEventGotAllCategories();
        cleanUpEventNotGotAllCategories();
        cleanUpEventAddToCategoryFirsts();
        cleanUpEventNotAddToCategoryFirst();
        cleanUpEventCategoryNotaddedSuccessfully();
        cleanUpEventCategoryAddedSuccessfully();
        cleanUpEventCategoryModifiedSuccessfully();
        cleanUpEventCategoryNotModifiedSuccessfully();
        cleanUpEventGotAllTags();
        cleanUpEventNotGotAllTags();
        cleanUpEventNewTagsInsert();
        cleanUpEventNotInsertedNewTags();
        cleanUpEventTagRemoveSuccess();
        cleanUpEventTagRemoveFailure();
        cleanUpEventNotGotSellerAgreement();
        cleanUpEventGotSellerAgreements();
        cleanUpEventCriteriaAddedSuccessfully();
        cleanUpEventCriteriaNotAddedSuccessfully();
        cleanUpEventGotAllProductCriteria();
        cleanUpEventNotGotAllProductCriteria();
        cleanUpEventCriteriaChangedSuccessfully();
        cleanUpEventCriteriaNotChangedSuccessfully();
        cleanUpEventCriteriaDeletedSuccessfully();
        cleanUpEventCriteriaNotDeletedSuccessfully();
        cleanUpEventOrderConfigurationAdded();
        cleanUpEventOrderConfigurationNotAdded();
        cleanUpEventGetOrderProcessConfig();
        cleanUpEventNotGotOrderProcessConfig();
        cleanUpEventOrderProcessConfigurationRemove();
        cleanUpEventOrderProcessConfigurationRemoveError();

    });

   }]);