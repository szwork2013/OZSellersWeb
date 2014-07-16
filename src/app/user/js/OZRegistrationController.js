/**
*Registration Controller
**/
angular.module('oz.UserApp')
  .controller('OZRegistrationController', ['$scope', '$rootScope', '$state', '$http', '$timeout', '$sce', '$log', 'UserSessionService', function($scope, $rootScope, $state, $http, $timeout, $sce, $log, UserSessionService) {
    $scope.submitted = false; 
    $scope.consumer_verify_user = false;  
    $scope.verify_user = false;   
    $scope.verification = {};
    $scope.consumerverification = {};  

    $scope.user = 
      {
        'mobileno' : '',
        'email' :  '',
        'password' :  '',
        'username' : '',
        'usertype' : '',
      };

    // function to clear form data on submit
    $scope.clearformData = function() {
      $scope.signupForm.$setPristine();
      $scope.signupForm.submitted = false;
      $scope.user.mobileno = '';
      $scope.user.username = '';
      $scope.user.email = '';
      $scope.user.password = '';
    }

    // function to send and stringify user registration data to Rest APIs
    $scope.jsonUserData = function(){
      var userData = 
      {
        user:
          {
            'mobileno' : '91'+$scope.user.mobileno,
            'email' : $scope.user.email,
            'password' : $scope.user.password,
            'username' : $scope.user.username,
            'usertype' : 'provider'
          }  
      };
      return JSON.stringify(userData); 
    } 

    // function to handle server side responses
    $scope.handleSignupResponse = function(data){
      if (data.success) {
				$scope.clearformData();
        if (data.success.code !== undefined && data.success.code == 'POTP') {
          $scope.consumer_verify_user = true;
        } else {
          $scope.verify_user = true;
        }
        $rootScope.OZNotify(data.success.message,'success'); 
      } else {
        console.log(data.error.message);
        $rootScope.OZNotify(data.error.message,'error');
      }
    };
  
    $scope.signup = function(){
      if ($scope.signupForm.$valid) {
        console.log('User Data entered successfully');
        UserSessionService.signupUser($scope.jsonUserData());
      } else {
        $scope.signupForm.submitted = true;
      }
    }

    var cleanupEventSignupDone = $scope.$on("signupDone", function(event, message){
      $log.debug(message);
      $scope.handleSignupResponse(message);      
    });

    var cleanupEventSignupNotDone = $scope.$on("signupNotDone", function(event, message){
      $log.debug(message);
      $rootScope.OZNotify("It looks as though we have broken something on our server system. Our support team is notified and will take immediate action to fix it." + message, 'error');   
    });


     // function to send and stringify user registration data to Rest APIs
    $scope.jsonVerifyData = function(){
      var verifyData = 
      {
        'otp' : $scope.verification.token
      };
      return JSON.stringify(verifyData); 
    } 

    // function to handle server side responses
    $scope.handleVerificationResponse = function(data){
      if (data.success) {
        $scope.verify_user = false;
        $rootScope.OZNotify(data.success.message,'success'); 
        UserSessionService.authSuccess(data.success.user);
      } else {
        console.log(data.error.message);
        $rootScope.OZNotify(data.error.message,'error');
      }
    };
  
    $scope.verify = function(){
      if ($scope.verificationForm.$valid) {
        console.log('OTP entered successfully');
        UserSessionService.verifyUser($scope.jsonVerifyData());
      } else {
        $scope.verificationForm.submitted = true;
      }
    }

    var cleanupEventVerificationDone = $scope.$on("verificationDone", function(event, message){
      $log.debug(message);
      $scope.handleVerificationResponse(message);      
    });

    var cleanupEventVerificationNotDone = $scope.$on("verificationNotDone", function(event, message){
      $log.debug(message);
      $rootScope.OZNotify("It looks as though we have broken something on our server system. Our support team is notified and will take immediate action to fix it." + message, 'error');   
    });

     // function to send and stringify user registration data to Rest APIs
    $scope.jsonConsumerVerifyData = function(){
      var verifyData = 
      {
        'otp' : $scope.consumerverification.token
      };
      return JSON.stringify(verifyData); 
    } 

    // function to handle server side responses
    $scope.handleConsumerVerificationResponse = function(data){
      if (data.success) {
        $scope.consumer_verify_user = false;
        $rootScope.OZNotify(data.success.message,'success'); 
        UserSessionService.authSuccess(data.success.user);
      } else {
        console.log(data.error.message);
        $rootScope.OZNotify(data.error.message,'error');
      }
    };
  
    $scope.consumerVerify = function(){
      if ($scope.consumerVerificationForm.$valid) {
        console.log('OTP entered successfully');
        UserSessionService.consumerVerifyUser($scope.jsonConsumerVerifyData());
      } else {
        $scope.consumerVerificationForm.submitted = true;
      }
    }

    var cleanupEventConsumerVerificationDone = $scope.$on("consumerVerificationDone", function(event, message){
      $log.debug(message);
      $scope.handleConsumerVerificationResponse(message);      
    });

    var cleanupEventConsumerVerificationNotDone = $scope.$on("consumerVerificationNotDone", function(event, message){
      $log.debug(message);
      $rootScope.OZNotify("It looks as though we have broken something on our server system. Our support team is notified and will take immediate action to fix it." + message, 'error');   
    });

    $scope.$on('$destroy', function(event, message) {
      cleanupEventSignupDone();
      cleanupEventSignupNotDone();
      cleanupEventVerificationDone();
      cleanupEventVerificationNotDone();
      cleanupEventConsumerVerificationDone();
      cleanupEventConsumerVerificationNotDone();
    });

  }]);
 