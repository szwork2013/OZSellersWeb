angular.module('oz.CommonApp', []);
angular.module('oz.UserApp', []);
angular.module('oz.AdApp', []);
angular.module('oz.AdminApp', []);
angular.module('oz.ProviderApp', []);

angular.module('oz.OrderZappApp',['ui.router', 'ui.bootstrap', 'ngAnimate','textAngular', 'vcRecaptcha', 'ngResource', 'tags-input',  'oz.CommonApp',
  'oz.UserApp', 'oz.AdApp', 'oz.AdminApp',  'oz.ProviderApp','angularFileUpload', 'checklist-model'
])

  .config(function($logProvider)  { 
    $logProvider.debugEnabled(true);
  })

	.run([
  '$rootScope',
  'UserSessionService',
  '$log',
  function ($rootScope, UserSessionService, $log) {
    UserSessionService.checkUser();
    $rootScope.usersession = UserSessionService;
    $rootScope.$log = $log;
  }
])

  .controller('OZMainController', ['$scope', '$rootScope', '$state', '$log','UserSessionService', 'notify','ProviderServices',  function($scope, $rootScope, $state, $log, UserSessionService, notify,ProviderServices) {
    $state.transitionTo('home.start');
    $rootScope.selectedproviderid = '';
    $rootScope.selectedBranchId = '';
    $rootScope.providers=[];
    $rootScope.branches=[]; 
    $rootScope.branch={};
    $rootScope.provider={};
    $scope.static_template = {
      terms: '',
      privacy: ''
    }

    var cleanupEventSession_Changed_Failure = $scope.$on('session-changed-failure', function (event, message) {
      UserSessionService.authfailed();
      $state.transitionTo('home.start');
      $rootScope.OZNotify("It looks as though we have broken something on our server system. Our support team is notified and will take immediate action to fix it." + message, 'error');   
    });

    var cleanupEventSessionDone = $scope.$on('session', function (event, data) {
      if ($rootScope.usersession.isLoggedIn) {
        if (data.isAdmin !== undefined && data.isAdmin == true && data.isAdmin !== null) {
          if (data.usertype !== undefined && data.usertype !== null && data.usertype == 'provider') {
           $scope.getProviders();
          } else {
            $state.transitionTo('oz.ozWall');
          }
        } else if (data.isAdmin !== undefined && data.isAdmin == false && data.isAdmin !== null) {
          $scope.getProviders();
        }
      }  
    });

$scope.getProviders=function(){

         ProviderServices.get_allProviders.getAllProviders(
             function (successData) {
              if (successData.success == undefined) {
                $rootScope.provider={};
                $rootScope.providers=[];
                $rootScope.selectedproviderid="";
                if(successData.error.code=='AL001'){
                    $rootScope.showModal();
                  }
               $rootScope.OZNotify(successData.error.message, 'error');  
             } else {
               $rootScope.providers=[];
               $rootScope.providers=successData.success.providers;
               if(successData.success.providers[0]){
                 $rootScope.provider=successData.success.providers[0];
                 $rootScope.selectedproviderid=successData.success.providers[0].providerid;
                 console.log($scope.provider);
                 $scope.getBranches($rootScope.selectedproviderid);
                }               
              }
              $state.transitionTo('providerorders.view.orderbyBranch');
            }, function (error) {
              $rootScope.OZNotify("Server Error:" + error.status, 'error');
            });
};


   $rootScope.OZNotify = function(message,flag)
    {
      if(flag === 'success')
      {
        notify({message:message,template:'common/notification/views/oz.success.tpl.html',position:'center'});
      }
      else if (flag === 'error') 
      {
         notify({message:message,template:'common/notification/views/oz.failure.tpl.html',position:'center'});
      } 
       else if (flag === 'central') 
      {
         notify({message:message,template:'common/notification/views/oz.central.tpl.html',position:'center'});
      } 
    };

    $scope.signOut = function()
    {
      UserSessionService.logoutUser();
    };
    
    var cleanupEventLogoutDone = $scope.$on('logoutDone', function (event, data) {
      $log.debug($rootScope.usersession.isLoggedIn);
      $scope.resetProviderData();
      if (data.success !== undefined && data.success.message !== undefined) {
        $state.transitionTo('home.start');
        $rootScope.OZNotify(data.success.message, 'success');
      } else {
        $state.transitionTo('home.start');
        $rootScope.OZNotify(data.error.message, 'error');
      }   
    });

    var cleanupEventLogoutNotDone = $scope.$on('logoutNotDone', function (event, message) {
      $rootScope.OZNotify("It looks as though we have broken something on our server system. Our support team is notified and will take immediate action to fix it." + message, 'error');   
    });

   $scope.getProviderId=function(provider){
      $rootScope.selectedproviderid=provider.providerid;
      $rootScope.$broadcast('change_in_providerid', $rootScope.selectedproviderid);
      $log.debug("pid "+ $rootScope.selectedproviderid);
      if($rootScope.selectedproviderid){
        $scope.getBranches($rootScope.selectedproviderid);
      } 
   };

    $scope.resetProviderData=function(){
      $rootScope.providers=[];
      $rootScope.branches=[]; 
      $rootScope.provider={};
      $rootScope.branch={};
      $rootScope.selectedproviderid = '';
      $rootScope.selectedBranchId = '';
    }


   $scope.getBranches=function(providerid){
     $rootScope.selectedBranchId;
     $rootScope.branches = [];
     // $scope.selectedBranchId;
     ProviderServices.get_branches.getBranches({providerid:providerid},
      function (successData) {
      if (successData.success == undefined) {
       $rootScope.selectedBranchId="";
       $rootScope.branches = [];
       $rootScope.branch={};
        if(successData.error.code=='AL001'){
                    $rootScope.showModal();
                  }
       $rootScope.OZNotify(successData.error.message, 'error');  
      } else {
       $rootScope.branches=successData.success.branches;
       console.log($rootScope.branches);
       if(successData.success.branches[0]){
        $rootScope.selectedBranchId=successData.success.branches[0].branchid;
        $rootScope.branch=successData.success.branches[0];
       }
      }
     }, function (error) {
       $rootScope.OZNotify("Server Error:" + error.status, 'error');
     });
   };

  $scope.getBranchId=function(branch){
    console.log(branch);
          $rootScope.selectedBranchId=branch.branchid;
          $rootScope.$broadcast('change_in_branchid', $rootScope.selectedBranchId);
          $log.debug("bid "+ $rootScope.selectedBranchId);

       };

  // $rootScope.$watch('selectedproviderid', function (selectedproviderid) {
  //   console.log("watch"+ selectedproviderid);
  //   if($rootScope.selectedproviderid){
  //     $scope.getBranches($rootScope.selectedproviderid);
  //   }   
  // });

  $scope.showStaticTemplates = function(type){
    UserSessionService.getStaticData(type);
  }

  var cleanupEventGetStaticTemplateDone = $scope.$on('getStaticTemplateDone', function (event, data) {
    if (data.success) {
      if (data.success.template.type == 'tc') {
        $scope.static_template.terms = angular.copy(data.success.template.template);
        $state.transitionTo('staticcontent.terms');
      } else if (data.success.template.type == 'pp') {
        $scope.static_template.privacy = angular.copy(data.success.template.template);
        $state.transitionTo('staticcontent.privacy');
      }      
      $rootScope.OZNotify(data.success.message, 'success');
    } else {
      $rootScope.OZNotify(data.error.message, 'error');
    }   
  });

  var cleanupEventGetStaticTemplateNotDone = $scope.$on('getStaticTemplateNotDone', function (event, message) {
    $rootScope.OZNotify("It looks as though we have broken something on our server system. Our support team is notified and will take immediate action to fix it." + message, 'error');   
  });

  $rootScope.showModal = function () 
  {
       $('#sessionModal').modal({ keyboard: false,backdrop: 'static',show: true});
  };

   $scope.sessionout = function() 
   {
            $('#sessionModal').modal('hide');
            UserSessionService.logoutUser();
   };

   $scope.$on('$destroy', function(event, message) 
    {
        cleanupEventSession_Changed_Failure();
        cleanupEventSessionDone();
        cleanupEventLogoutDone();
        cleanupEventLogoutNotDone();
        cleanupEventGetStaticTemplateDone();
        cleanupEventGetStaticTemplateNotDone();
    });
    
  }]);
