angular.module('oz.UserApp')
  .controller('OZWallSearchController', ['$scope', '$state', '$http', '$timeout', '$sce', '$log', 'UserSessionService',  'OZWallService', '$rootScope', function($scope, $state, $http, $timeout, $sce, $log, UserSessionService, OZWallService, $rootScope) {
   
   $scope.searchText = '';

   $scope.errors = '';

   $scope.providers = {};

   $scope.branches = [];

   $scope.branchesName = '';  $scope.suborderid = {};

   $scope.suborderid.content = '';  

   $scope.regexForNumbers = /[0-9]/;

   $scope.getAllBranches = function(list)
   {
      if(list.branches.length === 0 )
      {
           $rootScope.OZNotify('There are no branches associated with this provider','error');
      }
      else
      {
	   	for(var i = 0; i < list.branches.length ; i++)
	   	{
	   		$scope.branches = list.branches[i].branchname; 
	   	}
        $scope.broadcastContentWall($scope.branches,list.branches, list.providerlogo.image, list.providerid);
	  }
   };

   $scope.broadcastContentWall = function(name,branches, image, providerid)
   {
   	 	$rootScope.$broadcast('branch',name, branches, image, providerid);
   };

   $scope.getSuborderDetails = function()
   {  
        if($scope.suborderid.content !== '')
        {
            OZWallService.getSuborderDetails($scope.suborderid.content); 
        }
        else
        {
          $rootScope.OZNotify('Please enter suborder id to proceed with search', 'error');
        }
   };

    var cleanUpEventGetAllSuborder = $scope.$on("gotSuborderContent",function(event,data){
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
                $scope.broadcastOrderContent(data.success.orders);
            } 
    });

    $scope.broadcastOrderContent = function(content)
    {
      $rootScope.$broadcast('order', content);
    };

    var cleanUpEventNotGotSuborder = $scope.$on("notGotSuborderContent",function(event,data){
            $rootScope.OZNotify('Some issue with server! Please try after some time', 'error');
    });



     $scope.$on('$destroy', function(event, message) 
    {
      cleanUpEventGetAllSuborder();
      cleanUpEventNotGotSuborder();

    });


}]);