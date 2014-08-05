angular.module('oz.ProviderApp')
  .controller('ManageDeliveryTimeController', ['$scope', '$state', '$http', '$timeout', '$sce', '$log', '$rootScope', 'ProviderServices','$upload','$stateParams', function($scope, $state, $http, $timeout, $sce, $log, $rootScope,ProviderServices,$upload, $stateParams) {
  
    
    $scope.enableTheEditorFunction = function(list)
    {
          list.editing = true;
    }
 }]);

