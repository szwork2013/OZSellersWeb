/**
*	User Signin Controller
**/
angular.module('oz.UserApp')
 	.controller('OZSigninController', ['$scope', '$rootScope', '$state', '$timeout', '$stateParams', '$log', 'UserSessionService', function($scope, $rootScope, $state, $timeout, $stateParams, $log, UserSessionService) {
    $scope.submitted = false;  // form submit property is false
    $scope.user = 
      {
        'mobileno' :  '',
        'password' :  ''
      };
    $scope.forgotpassword = { 'mobileno': ''};
    $scope.reset_password = false;
    $scope.resetPassword = {};
    // function to clear form data on submit
    $scope.clearsigninformData = function() {
      $scope.signinForm.$setPristine();
      $scope.signinForm.submitted = false;
      $scope.user.mobileno = '';
      $scope.user.password = '';
    }

    $scope.clearforgotpasswordformData = function() {
      $scope.forgotPasswordForm.$setPristine();
      $scope.forgotPasswordForm.submitted = false;
       $scope.forgotpassword = { 'mobileno': ''};
    }

    $scope.clearresetpasswordformData = function() {
      $scope.resetPasswordForm.$setPristine();
      $scope.resetPasswordForm.submitted = false;
      $scope.resetPassword = {'otp': ''};
    }

    
    // function to send and stringify user signin data to Rest APIs
    $scope.jsonUserSigninData = function() {
      var userSigninData = 
        {
          'mobileno' : $scope.user.mobileno,
          'password' : $scope.user.password
        };
      return JSON.stringify(userSigninData); 
    }

    // function to handle server side responses
    $scope.handleSigninResponse = function(data){
      if (data.success) {
        console.log(data.success);
        $scope.clearsigninformData();    
        UserSessionService.authSuccess(data.success.user);
        $rootScope.OZNotify('Successful login !','success');
        $rootScope.signInStatus = 1;       
      } else { 
        if (data.error.code== 'AU005') {     // user does not exist
            $log.debug(data.error.code + " " + data.error.message);
            $rootScope.OZNotify(data.error.message,'error');             
        } else if (data.error.code=='AU002') {  // user password invalid
            $log.debug(data.error.code + " " + data.error.message);
           $rootScope.OZNotify(data.error.message,'error');

        } else if (data.error.code=='AV001') {  // enter valid data
            $log.debug(data.error.code + " " + data.error.message);
            $rootScope.OZNotify(data.error.message,'error');
        } else if (data.error.code=='AU006') {  // user signedin using OTP
            $log.debug(data.error.code + " " + data.error.message);
            $rootScope.OZNotify(data.error.message,'error');
        } else if (data.error.code=='AU003') {   // user has not verified
            $log.debug(data.error.code + " " + data.error.message);
            $rootScope.OZNotify(data.error.message,'error');
        } else if (data.error.code=='AS001') {   // user has not subscribed to any plan
            $log.debug(data.error.code + " " + data.error.message);
             $rootScope.OZNotify(data.error.message,'error');
        } else if (data.error.code=='AS002') { // user subscription expired
            $log.debug(data.error.code + " " + data.error.message);
             $rootScope.OZNotify(data.error.message,'error');
        } else if (data.error.code== 'AP001') {    // user has not done any payment
            $log.debug(data.error.code + " " + data.error.message);
             $rootScope.OZNotify(data.error.message,'error');
        } else {
            $log.debug(data.error.message);
             $rootScope.OZNotify(data.error.message,'error');

        }
      }
    };  

    // function to signin to Prodonus App using REST APIs and performs form validation.
    $scope.signin = function() {
      if ($scope.signinForm.$valid) {
        $log.debug('User Data entered successfully');
        console.log($scope.jsonUserSigninData());
        UserSessionService.signinUser($scope.jsonUserSigninData());
      } else {
        $scope.signinForm.submitted = true;
      }
    }

    var cleanupEventSigninDone = $scope.$on("signinDone", function(event, message){
      $scope.handleSigninResponse(message);
    });

    var cleanupEventSigninNotDone = $scope.$on("signinNotDone", function(event, message){
      $log.debug(message);
      $rootScope.OZNotify("It looks as though we have broken something on our server system. Our support team is notified and will take immediate action to fix it." + message, 'error');   
    }); 

    // function to send and stringify user signin data to Rest APIs
    $scope.jsonForgotPasswordData = function()
    {
      var userData = 
        {
         'mobileno' : '91' + $scope.forgotpassword.mobileno 
        }
      return JSON.stringify(userData); 
    }

    // function to handle server side responses
    $scope.handleForgotPasswordResponse = function(data){
      if (data.success) {   
        console.log(data.success);
        $scope.clearforgotpasswordformData();
        $scope.reset_password = true;
        $rootScope.OZNotify(data.success.message,'success');
      } else {
        if (data.error.code== 'AV001') {     // enter valid data
            $log.debug(data.error.code + " " + data.error.message);
            // $scope.showAlert('alert-danger', data.error.message);
            $rootScope.OZNotify(data.error.message, 'error');
        } else if (data.error.code=='AV004') {  // enter prodonus registered emailid
            $log.debug(data.error.code + " " + data.error.message);
            // $scope.showAlert('alert-danger', data.error.message);
            $rootScope.OZNotify(data.error.message, 'error');
        } else if (data.error.code== 'AT001') {    // user has not done any payment
            $log.debug(data.error.code + " " + data.error.message);
            // $scope.showAlert('alert-danger', data.error.message);
            $rootScope.OZNotify(data.error.message, 'error');
        } else {
            $log.debug(data.error.message);
            // $scope.showAlert('alert-danger', data.error.message);
            $rootScope.OZNotify(data.error.message, 'error');
        }
      }
    };  

    // function for forgotpassword to Prodonus App using REST APIs and performs form validation.
    $scope.forgotPassword = function() {
      if ($scope.forgotPasswordForm.$valid) {
        $log.debug('User Data entered successfully');
        console.log($scope.jsonForgotPasswordData());
        UserSessionService.forgotPasswordUser($scope.jsonForgotPasswordData());
      } else {
        $scope.forgotPasswordForm.submitted = true;
      }
    }

    var cleanupEventForgotPasswordDone = $scope.$on("forgotPasswordDone", function(event, message){
      $scope.handleForgotPasswordResponse(message); 
    });

    var cleanupEventForgotPasswordNotDone = $scope.$on("forgotPasswordNotDone", function(event, message){
      $log.debug(message);
      $rootScope.OZNotify("It looks as though we have broken something on our server system. Our support team is notified and will take immediate action to fix it." + message, 'error');   
    });

    // function to send and stringify user reset password data to Rest APIs
    $scope.jsonResetPasswordData = function()
      {
      var userData = 
          {
           'otp': $scope.resetPassword.token
          };
      return JSON.stringify(userData); 
      }
     

    // function to handle server side responses
    $scope.handleResetPasswordResponse = function(data){
      if (data.success) {
        console.log(data.success);
        $scope.clearresetpasswordformData();
        $scope.reset_password = false;
        $state.transitionTo('home.start');
        $rootScope.OZNotify(data.success.message,'success');
      } else {
        if (data.error.code== 'AV001') {     // enter valid data
            $log.debug(data.error.code + " " + data.error.message);
           $rootScope.OZNotify(data.error.message,'error');
        } else {
            $log.debug(data.error.message);
           $rootScope.OZNotify(data.error.message,'error');
        }
      }
    };

    // function for resetpassword to Prodonus App using REST APIs and performs form validation.
    $scope.resetPassword = function() {
      if ($scope.resetPasswordForm.$valid) {
        UserSessionService.resetPasswordUser($scope.jsonResetPasswordData());
      } else {
        $scope.resetPasswordForm.submitted = true;
      }
    }

    var cleanupEventResetPasswordDone = $scope.$on("resetPasswordDone", function(event, message){
      $scope.handleResetPasswordResponse(message);   
    });

    var cleanupEventResetPasswordNotDone = $scope.$on("resetPasswordNotDone", function(event, message){
      $log.debug(message);
      $rootScope.OZNotify("It looks as though we have broken something on our server system. Our support team is notified and will take immediate action to fix it." + message, 'error');   
    });


    $scope.$on('$destroy', function(event, message) {
      cleanupEventForgotPasswordDone();
      cleanupEventForgotPasswordNotDone();
      cleanupEventSigninDone(); 
      cleanupEventSigninNotDone(); 
      cleanupEventResetPasswordDone();
      cleanupEventResetPasswordNotDone();
    });

}]);
 