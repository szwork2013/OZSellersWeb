angular.module('oz.ProviderApp')
  .controller('ManageProductController', ['$scope', '$state', '$http', '$timeout', '$sce', '$log', '$rootScope', 'ProviderServices','$upload','$stateParams','userproducttags','filterFilter',function($scope, $state, $http, $timeout, $sce, $log, $rootScope,ProviderServices,$upload, $stateParams,userproducttags,filterFilter) {
    $scope.tabForPrice={};
    $scope.currentProdle='';
    $scope.editorPrice={};
    $scope.ProductCategory=[];
    $scope.ProductCategoryLevel3=[];
    $scope.ProductCategoryLevel3All=[];
    $scope.filtered;
    $scope.category;
    $scope.search={};
   $scope.$state = $state;
   $scope.editMode={
    editStatus:'',
    editorEnabled:false
    };
    $rootScope.selectedCategoryid="";
    $scope.form={};
      var file=[];
      var fileUpdate;
   $scope.init=function(){
    $scope.ProductConfigs=[];
    $scope.chckedIndexs=[];
   	$scope.productlist=[];
     $scope.tempProduct={};
      $scope.product={
      	"productname":"",
        "leadtime":{"value":"1","option":""}, 
      	"price":{"value":"","currency":"\u20b9","uom":""},
      	"productdescription":"",
      	"productcode":"",
      	"foodtype":"",
        "usertags":[]
      };
   	  $scope.foodtypes=['veg','non-veg','both'];
      $scope.leadOptions=['minutes','hours','days','weeks','months'];
      $scope.$state = $state;
      // $scope.product.usertags=[];
      $scope.product.foodtype=$scope.foodtypes[0]; 
      $scope.measures=['kg','gm','no','lb','lt'];
      $scope.product.price.uom=$scope.measures[0];
      $scope.product.leadtime.option=$scope.leadOptions[0];
      $scope.editMode.editorEnabled=false;
      $scope.productusertags=[];
      $scope.product.usertags=[]
   }

   $scope.usertagsList=[];
   $scope.init();      

$scope.clearProduct=function(){
   $scope.product={
        "productname":"",
        "leadtime":{"value":"1","option":"hours"}, 
        "price":{"value":"","currency":"\u20b9","uom":""},
        "productdescription":"",
        "productcode":"",
        "foodtype":"",
        "usertags":[]
      };
    $scope.chckedIndexs=[];
    $scope.tempProduct={};
}


  if(userproducttags.error){
    $scope.usertagsList= ['egg','eggless','birthday'];
    $log.debug( $scope.usertagsList);
   }
   else if(userproducttags.success){
     $scope.usertagsList= userproducttags.success.productusertags;
      $log.debug( $scope.usertagsList);
   }

   $scope.$watch('$state.$current.locals.globals.userproducttags', function (userproducttags) {
    if (userproducttags.success !== undefined && userproducttags.success.productusertags.length !== 0) {
      $scope.usertagsList = angular.copy(userproducttags.success.productusertags); 
    } else {
      $scope.usertagsList= ['egg','eggless','birthday'];
      $log.debug(userproducttags.error.message);
    } 
  });
   
   $rootScope.$watch('selectedproviderid', function (selectedproviderid) {
      $scope.search.prod="";
      if($rootScope.selectedproviderid){
         $scope.getCategories($rootScope.selectedproviderid);
      }
    });

  $rootScope.$watch('selectedBranchId', function (selectedBranchId) {
    $scope.search.prod="";
    $rootScope.selectedBranchId=selectedBranchId;
      $scope.currentProdle='';
      if($rootScope.selectedBranchId && $rootScope.selectedproviderid){
       $scope.getAllProducts($rootScope.selectedBranchId,$rootScope.selectedproviderid);
      }
  });


     $scope.getCategories=function(providerid){

       ProviderServices.get_categories.getCategories({providerid:providerid},
      	function (successData) {
        if (successData.success == undefined) {
            $scope.ProductCategory=[];
            $scope.ProductCategoryLevel3All=[];
            $scope.selectedCategory='';
            $scope.ProductCategoryLevel3=[];
            $rootScope.selectedCategoryid=[];
            $scope.category={};
            $rootScope.selectedCategoryid="";
         // $rootScope.OZNotify(successData.error.message, 'error');  
          if(successData.error.code=='AL001'){
            $rootScope.showModal();
          }
        } else {
         console.log(successData.success);
         if(successData.success.ProductCategory[1].level=2){
             $scope.ProductCategory=successData.success.ProductCategory[1].category;
             $scope.ProductCategoryLevel3All=successData.success.ProductCategory[0].category;
         }else{
           $scope.ProductCategory=successData.success.ProductCategory[0].category;
           $scope.ProductCategoryLevel3All=successData.success.ProductCategory[1].category;
         }
         if($scope.ProductCategory.length>0){
          $scope.selectedCategory=$scope.ProductCategory[0].categoryid
          $scope.getLevel3Categories($scope.ProductCategory[0].categoryid);
          
         }

        }
       }, function (error) {
         $rootScope.OZNotify("Server Error:" + error.status, 'error');
       });
     };

        $scope.getLevel3Categories=function(category){
           $scope.ProductCategoryLevel3=[];
        // console.log(category);
        // console.log($scope.ProductCategoryLevel3All);
        for (var i = $scope.ProductCategoryLevel3All.length - 1; i >= 0; i--) {
          if(category==$scope.ProductCategoryLevel3All[i].parent){
            $scope.ProductCategoryLevel3.push($scope.ProductCategoryLevel3All[i]);
          }
        };
        // console.log($scope.ProductCategoryLevel3);
           if($scope.ProductCategoryLevel3[0]){
             $scope.category=$scope.ProductCategoryLevel3[0];
             $rootScope.selectedCategoryid=$scope.ProductCategoryLevel3[0].categoryid;
           }
           else{
                  $scope.ProductCategoryLevel3All=[];
                  $scope.ProductCategoryLevel3=[];
                  $scope.category;
                  $rootScope.selectedCategoryid="";
           }
       
      };


  $scope.changeCategory=function(category){
    console.log(category.categoryid);
    $rootScope.selectedCategoryid=category.categoryid;
    $scope.getProductConfig(category.categoryid);
  };


   $scope.onFileSelect = function($files) {
    console.log($files);
     for (var i = 0; i < $files.length; i++) {
      if(($files[i].type == 'image/jpg') || ($files[i].type == 'image/png') || ($files[i].type == 'image/gif') || ($files[i].type == 'image/jpeg')){
       file = $files[i];
      }
      else{
        var field= document.getElementById('addLogoImg');
        field.value= field.defaultValue;
       $rootScope.OZNotify("Please upload image only" ,'error');
      }
     }
   };

   $scope.onFileSelectUpdate = function($files) {
     for (var i = 0; i < $files.length; i++) {
      if(($files[i].type == 'image/jpg') || ($files[i].type == 'image/png') || ($files[i].type == 'image/gif') || ($files[i].type == 'image/jpeg')){
             fileUpdate = $files[i];
             $scope.upload = $upload.upload({
                url: '/api/productlogo/'+$scope.selectedproviderid+'/'+$scope.product.productid, 
                file:fileUpdate, 
              }).progress(function(evt) {
                // console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
              }).success(function(data, status, headers, config) {
                 $scope.handleChangeLogo(data, status, headers, config);
                // console.log(data);
              });

      }
      else{
        var field= document.getElementById('updateLogo');
        field.value= field.defaultValue;
       $rootScope.OZNotify("Please upload image only" ,'error');
      }
     }
  
    
   };


$scope.handleChangeLogo=function(data, status, headers, config){
  if(data.success){
      if($rootScope.selectedBranchId && $rootScope.selectedproviderid){
        // $scope.init();
        $scope.currentProdle=$scope.product.productid;
        $scope.getAllProducts($rootScope.selectedBranchId, $rootScope.selectedproviderid);
        $scope.enableEditor(); 
      }
      $rootScope.OZNotify("Product logo updated successfully...", 'success');
  }
   else {
        if(data.error.code=='AL001'){
            $rootScope.showModal();
          }
       $rootScope.OZNotify(data.error.message, 'error');
        $log.debug(data.error.code + " " + data.error.message);
    }

};


    $scope.enableEditor = function () {
     $scope.tempProduct = angular.copy( $scope.product);
     $scope.editMode.editorEnabled = true;
    
     if($scope.editMode.editStatus=='add'){
      $scope.getCategories($rootScope.selectedproviderid);
      $scope.getLevel3Categories($scope.ProductCategory[0].categoryid);
      // $scope.getProductConfig($scope.ProductCategoryLevel3[0].categoryid);
     }
     else{
      if($scope.product.category){
      $scope.getProductConfig($scope.product.category.id);
      }
     }
     console.log("id= "+$rootScope.selectedCategoryid);
    // $rootScope.OZNotify("   Adding product data....", 'info');
  };


  $scope.disableEditor = function () {
   $scope.product=  $scope.tempProduct ;
      var field= document.getElementById('addLogoImg');
      field.value= field.defaultValue;
      var field= document.getElementById('updateLogo');
      field.value= field.defaultValue;
     file=null;
     fileUpdate=null;
    $scope.editMode.editorEnabled = false;
    $scope.form.productForm.submitted=false;
  };


$scope.addProduct = function (editStatus) {

    // $scope.product.to1=moment($scope.product.to).format('hh:mm');
    // $scope.product.from2=moment($scope.product.from).format('hh:mm');
console.log($scope.product);

  if($scope.form.productForm.$invalid){
      // $rootScope.ProdoAppMessage("Please add valid information", 'error');
      $scope.form.productForm.submitted=true;
    }
  else{
    $scope.form.productForm.$setPristine();
  
    $scope.ErrMsging=0;
    $scope.product.productconfiguration={
      "categoryid":$scope.ProductConfigs.categoryid,
      "categoryname":$scope.ProductConfigs.categoryname,
      "configuration": $scope.chckedIndexs
     };

   if (editStatus == 'add') { 

    $scope.product.usertags=$scope.productusertags;
    console.log($scope.product);
    console.log(file);
    if($scope.productusertags){
    if(file!==null || file !== undefined || file!=={}){
     $scope.upload = $upload.upload({
        url: '/api/productcatalog/'+$scope.selectedBranchId+'/'+$scope.selectedproviderid+'/'+$rootScope.selectedCategoryid, 
        data: {"data":$scope.product} ,
        file:file, 
      }).progress(function(evt) {
        // console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
      }).success(function(data, status, headers, config) {
         $scope.currentProdle='';
         $scope.handleSaveProductResponse(data, status, headers, config);
        // console.log(data);
      });
    }
     else{
           $rootScope.ProdoAppMessage("Please upload product image", 'error');
    }
  }
    else{
           $rootScope.ProdoAppMessage("Please add user tags", 'error');
    }

  }
  else{
    $scope.productUpdated={
      productname:$scope.product.productname,
      productdescription:$scope.product.productdescription,
      productcode:$scope.product.productcode,
      foodtype:$scope.product.foodtype,
      max_weight:$scope.product.max_weight,
      min_weight:$scope.product.min_weight,
      usertags:$scope.product.usertags,
      productconfiguration:$scope.product.productconfiguration
    }
 // console.log($scope.product);
 if($scope.product.usertags){
  	 $http({
        method: 'PUT',
        url: '/api/productcatalog/'+$scope.selectedproviderid+'/'+$scope.product.productid, 
        data: {"productcatalog":$scope.productUpdated} ,
        // file:file, 
      }).success(function(data, status, headers, config) {
         $scope.handleSaveProductResponse(data, status, headers, config);
        // console.log(data);
      }).error(function (data, status, headers, cfg) {
        // $log.debug(status);
       $rootScope.OZNotify(status, 'error'); 
     });

   }else{
           $rootScope.ProdoAppMessage("Please add user tags", 'error');
    }

  }
 
   }
  };


$scope.handleSaveProductResponse=function(data, status, headers, config){
  if(data.success){
     file=null;
     fileUpdate=null;
      $scope.init();
      $scope.disableEditor();
      $rootScope.OZNotify(data.success.message, 'success');
       if($rootScope.selectedBranchId && $rootScope.selectedproviderid){
        $scope.getAllProducts($rootScope.selectedBranchId, $rootScope.selectedproviderid);
      }
  }
   else {
        if(data.error.code=='AL001'){
       $rootScope.OZNotify(data.error.message, 'error');
        $rootScope.showModal();
      }
      else  {
        $log.debug(data.error.code + " " + data.error.message);
        $rootScope.OZNotify(data.error.message, 'error');
      } 
    }

};

 $scope.getAllProducts=function(branchid,providerid){
 
  $scope.productlist=[];
  if((branchid!==null || branchid !==undefined ) && (providerid !==null || providerid !== undefined)){
    ProviderServices.get_allProducts.getAllProducts({
        branchid:branchid,
    	  providerid:providerid},
      	function (successData) {
        if (successData.success == undefined) {
           if(successData.error.code=='AL001'){
            $rootScope.showModal();
          }
         $scope.filtered=[];
         $scope.product=[];
         // $rootScope.OZNotify(successData.error.message, 'error');  
        } else {
         $log.debug(successData.success.proudctcatalog);
         $scope.productlist=successData.success.proudctcatalog;
         $scope.filtered=$scope.productlist;
         if($scope.currentProdle!==''){
          $scope.getProduct($rootScope.selectedBranchId,$scope.currentProdle);
         }
         else{
          $scope.product= $scope.productlist[0];
          $scope.currentProdle=$scope.product.productid;
          $scope.category=$scope.product.category;
          $rootScope.selectedCategoryid=$scope.product.category.id;
         }
         
        }
       }, function (error) {
         $rootScope.OZNotify("Server Error:" + error.status, 'error');  
       });
  }

 };


   $scope.getProduct = function (branchid,productid) {
     if((branchid !==null || branchid !== undefined) && (productid !==null || productid!==undefined)){
      ProviderServices.get_product.getProduct({
         branchid:branchid,
         productid:productid
      }, function (successData) {
        if (successData.success == undefined) { //if not product

           $scope.handleGetProductError(successData.error);
        } else {
          $scope.handleGetProductSuccess(successData); 
        }
      }, function (error) { //if error geting product
        $rootScope.OZNotify("Server Error:" + error.status, 'error');
        $scope.ErrMsging=1;
        document.getElementById("ErrMsging").innerHTML = "Server Error:" + error.status;
       
      });
    }
  }



 $scope.changeProduct=function(product1){
    $scope.form.productForm.submitted=false;
    $scope.currentProdle = product1.productid;
    $scope.getProduct($rootScope.selectedBranchId,$scope.currentProdle);
    $scope.editMode.editorEnabled = false;
    // $scope.disableEditor();
    $('#productExtraInfo').css('display','block'); 
  };

$scope.getSelectedProduct = function (product1) {
    if(($scope.editMode.editorEnabled == true) ){
      $('#changeProductModal').modal('toggle');
      $('#changeProductModal').modal('show');
      $('#ChangeProductOkButton').on('click', function (event) {
        $scope.changeProduct(product1)
      });

      //modal code here , if yes clear data and show product if cancel, prev state
    }else{
    $scope.currentProdle = product1.productid;
    $scope.getProduct($rootScope.selectedBranchId,$scope.currentProdle);
    }
  };


  $scope.preAddProduct = function (product1) {
     $scope.editMode.editStatus='add';
    if(($scope.editMode.editorEnabled == true)){
      $('#addProductModal').modal('toggle');
      $('#addProductModal').modal('show');
      $('#addProductOkButton').on('click', function (event) {
         $scope.form.productForm.$setPristine();
         $scope.enableEditor() ; 
         $scope.clearProduct();
      });
      //modal code here , if yes clear data and show product if cancel, prev state
    }else{
         $scope.form.productForm.$setPristine();
         $scope.enableEditor() ; 
         $scope.clearProduct();
    }
  };


 $scope.handleGetProductSuccess=function(successData){
   console.log(successData);
        $scope.ErrMsging=0;
        $scope.currentProdle=successData.success.proudctcatalog.productid;
        $scope.product = successData.success.proudctcatalog;
        $scope.category=successData.success.proudctcatalog.category;
        $rootScope.selectedCategoryid=successData.success.proudctcatalog.category.id;
        // $rootScope.currentProdleRoot=successData.success.product.prodle;
      
  };

 $scope.handleGetProductError=function(error){
    //error code check here
    if(error.code=='AL001'){
      $rootScope.showModal();
    }
    else{
     $log.debug(error.message);
     $scope.ErrMsging=1;
     if (document.getElementById("ErrMsging") !== null) document.getElementById("ErrMsging").innerHTML = "Product not available , please select product....";
   
    }       
 };

  //delete product
   $scope.handleDeleteProductSuccess=function(success){
      $log.debug(success);
      $rootScope.OZNotify( "Product deleted successfully...", 'success'); 
      $scope.currentProdle='';
      $scope.product={};
      $scope.productlist=[];
      if($rootScope.selectedBranchId && $rootScope.selectedproviderid){
        $scope.getAllProducts($rootScope.selectedBranchId, $rootScope.selectedproviderid);
      }
  };

   $scope.handleDeleteProductError=function(error){
    if(error.code=='AL001'){
        $rootScope.showModal();
      }
      else{
        $rootScope.OZNotify(error.message , 'error'); 
        $log.debug(error.message);
      }
   }
  

  $scope.deleteProduct = function () {

    if ($scope.currentProdle !== undefined || $scope.currentProdle !== null || $scope.currentProdle !== "") {
        ProviderServices.delete_product.deleteProduct({
           providerid:$rootScope.selectedproviderid,
           productid:$scope.currentProdle
        }, function (success) {
          if(success.success){
           $scope.handleDeleteProductSuccess(success);   
          }else if(success.error){
            $scope.handleDeleteProductError(success.error);
          }  
        }, function (error) {
          $log.debug(error);
          $rootScope.OZNotify(error, 'error'); 
        });
    
    }
  };
  //delete product

 // publish product

 $scope.publishProduct=function(productid,value){
  var arrayProductIds=[];
  arrayProductIds.push(productid);

if(value=='publish'){
   $http({
        method: 'PUT',
        url: '/api/publishunpublish/product/'+$scope.selectedBranchId+'?action=publish', 
        data: {"productids":arrayProductIds} ,
        // file:file, 
      }).success(function(data, status, headers, config) {
        // console.log(data);
        if(data.success){
          $rootScope.OZNotify(data.success.message, 'success'); 
           if($rootScope.selectedBranchId && $rootScope.selectedproviderid){
              $scope.getAllProducts($rootScope.selectedBranchId, $rootScope.selectedproviderid);
            }
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
    else if(value=='unpublish'){
         $http({
              method: 'PUT',
              url: '/api/publishunpublish/product/'+$scope.selectedBranchId+'?action=unpublish', 
              data: {"productids":arrayProductIds} ,
              // file:file, 
            }).success(function(data, status, headers, config) {
              // console.log(data);
              if(data.success){
                $rootScope.OZNotify(data.success.message, 'success'); 
                 if($rootScope.selectedBranchId && $rootScope.selectedproviderid){
                    $scope.getAllProducts($rootScope.selectedBranchId, $rootScope.selectedproviderid);
                  }
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

 //publish product

// get product configurations

   $scope.getProductConfig = function (categoryid) {
      $scope.ProductConfigs=[];
      $scope.chckedIndexs=[];
 
    if ($scope.editMode.editStatus == 'update') { 
       if($scope.product.productconfiguration.configuration){
         $scope.chckedIndexs=$scope.product.productconfiguration.configuration;
       }
     }

      if(categoryid !== undefined || categoryid!==null || categoryid!==""){
          ProviderServices.get_productConfig.getProductConfig({
             categoryid:categoryid
          }, function (successData) {
            if (successData.success == undefined) {
              // $rootScope.OZNotify(successData.error.message, 'error');
               if(successData.error.code=='AL001'){
                        $rootScope.showModal();
                      }
               $log.debug(successData.error.message);
             
            } else {
              
               $scope.ProductConfigs= angular.copy(successData.success.productconfig);
               // console.log($scope.ProductConfigs);

                 if ($scope.editMode.editStatus == 'update') { 
                       
                  
                            for (var i = 0, len = $scope.chckedIndexs.length; i < len; i++) { 
                            for (var j = 0, len2 = $scope.ProductConfigs.configuration.length; j < len2; j++) { 
                                if ($scope.chckedIndexs[i].prod_configname === $scope.ProductConfigs.configuration[j].prod_configname) {
                                    $scope.ProductConfigs.configuration.splice(j, 1);
                                    len2=$scope.ProductConfigs.configuration.length;
                                }
                            }
                        }

                 }

            }
          }, function (error) { 
            $rootScope.OZNotify("Server Error:" + error.status, 'error');
            $scope.ErrMsging=1;
            document.getElementById("ErrMsging").innerHTML = "Server Error:" + error.status;
           
          });
              
       }

  };



$scope.getSelectedConfigs=function(config){
      $scope.ProductConfigs.configuration.splice($scope.ProductConfigs.configuration.indexOf(config), 1);
      $scope.chckedIndexs.push(config);
      $log.debug($scope.chckedIndexs);
};

$scope.rmSelectedConfigs=function(config){
   if ($scope.chckedIndexs.length !== 0) {
      $scope.chckedIndexs.splice($scope.chckedIndexs.indexOf(config), 1);
      $scope.ProductConfigs.configuration.push(config);
      $log.debug($scope.chckedIndexs);
   }    
};


// get product configurations

//Product List pagination
  $scope.currentPage = 0;
  $scope.pageSize = 7;
  $scope.numberOfPages = function () {
    return Math.ceil($scope.productlist.length / $scope.pageSize);
  };
  //Product List pagination
 
 $scope.search.prod="";

 $scope.$watch('search.prod', function (search) {
       // console.log(search);
        // $scope.filtered = filterFilter(  $scope.productlist, search);

        $scope.filtered= filterFilter($scope.productlist,{productname:search});
        $scope.numberOfPages = Math.ceil($scope.filtered.length/$scope.pageSize);
  });

  // $scope.$watch('filtered', function (filtered) {

  //      console.log(filtered);

  // });



  $scope.startsWith = function(list, viewValue) {
        return list.substr(0, viewValue.length).toLowerCase() == viewValue.toLowerCase();
    } ;


 }]);




 angular.module('oz.ProviderApp').filter('startFrom', function () {
  return function (input, start) {
    if (input !== undefined || start !== undefined) {
      start = +start;
      return input.slice(start);
    }
  }
});

function isEmpty(value) {
  return angular.isUndefined(value) || value === '' || value === null || value !== value;
}

  angular.module('oz.ProviderApp').directive('ngMin', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elem, attr, ctrl) {
            scope.$watch(attr.ngMin, function(){
                ctrl.$setViewValue(ctrl.$viewValue);
            });
            var minValidator = function(value) {
              var min = scope.$eval(attr.ngMin) || 0;
              if (!isEmpty(value) && value < min) {
                ctrl.$setValidity('ngMin', false);
                return undefined;
              } else {
                ctrl.$setValidity('ngMin', true);
                return value;
              }
            };

            ctrl.$parsers.push(minValidator);
            ctrl.$formatters.push(minValidator);
        }
    };
});

 angular.module('oz.ProviderApp').directive('ngMax', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elem, attr, ctrl) {
            scope.$watch(attr.ngMax, function(){
                ctrl.$setViewValue(ctrl.$viewValue);
            });
            var maxValidator = function(value) {
              var max = scope.$eval(attr.ngMax) || Infinity;
              if (!isEmpty(value) && value > max) {
                ctrl.$setValidity('ngMax', false);
                return undefined;
              } else {
                ctrl.$setValidity('ngMax', true);
                return value;
              }
            };

            ctrl.$parsers.push(maxValidator);
            ctrl.$formatters.push(maxValidator);
        }
    };
});

