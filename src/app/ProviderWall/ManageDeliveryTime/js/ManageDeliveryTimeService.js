

angular.module('oz.ProviderApp')

.factory('ProviderLeadtimeService', [
  '$resource',
  '$rootScope',
  function($resource, $rootScope)
  {
       var service = {
       	getAllProducts : $resource('/api/test', {}, {get : {method : 'GET', params : {branchid : '@branchid'}}})
       };

       var callService = {};

       callService.getAllCategories = function()
       {
       	service.getAllProducts.get({branchid : branchid}, function(success)
       		{ 
       		      $rootScope.$broadcast('gotAllProductsSuccessfully', success);
       		},
       		function(error)
       		{
       			$rootScope.$broadcast('notGotProducts', error);
       		}
       	);
       };
       return callService;
  }]);


