/*
* Overview: comment Directive
* It is comments block , where it has user avatar, user name, company name, date and time difference from the time of posting that comment, tags and many more
* Dated: 28/10/2013.
* Author: Bhagyashri Jangam
* Copyright: Prodonus Software Private Limited and GiantLeap Systems Private Limited 2013
* Change History:
* ----------------------------------------------------------------------
* date | author | description 
* ----------------------------------------------------------------------
* 27-3/2013 | xyx | Add a new property
* 
*/

angular.module('oz.ProviderApp').directive('ozOrders', function () {
return {
  restrict: 'A',
  templateUrl: function (tElement, tAttrs) {
        return tAttrs.templateUrl;
      },
  controller: [
  '$scope',
  '$log',
  'ProviderServices',
  '$rootScope',
  '$http',

  function ($scope, $log, ProviderServices, $rootScope, $http) {
    $scope.tabFortrack={};
    $scope.delivery_date;
    $scope.todaysDate=moment();
    var t_status;
    var t_orderid;
    $scope.today=Date();
    $scope.deliveryOption;
    $scope.ismeridian = false;

$scope.fromNow = function (time) {
  if (time != undefined) {
    return moment(time).calendar();
    // return moment(time).subtract('hours', 5.5).calendar();
  }
};


 $scope.changeStatus=function(status,order){
    $scope.search='';
    var orderid=order.suborderid
    $scope.order=order;
     $scope.orderPrefDate=new Date($scope.order.preferred_delivery_date);
  // console.log(status + " "+ orderid);
  if(status=='accept'){
       t_status=status;
       t_order=order;
      // $('#calenderModal').modal('toggle');
      $('#calenderModal').modal('show');
  }
  else if(status=='reject' || status=='cancel'){
       t_status=status;
       t_order=order;
      // $('#calenderModal').modal('toggle');
      $('#cancelReasonModal').modal('show');
  }

  else{
    $scope.callServiceChangeStatus(status,order);
  }
};





$scope.onDateSelected=function(delivery_date,deliveryOption,preferred_delivery_date){
 var date;
     if(deliveryOption=='custom'){
      date=delivery_date;
     }else if(deliveryOption=='pref'){
      date=preferred_delivery_date;
     }
  if(date==null || date==undefined || date == ''){
      $rootScope.OZNotify("Please Select Delivery Date", 'error');  
  }
  else{
    $('#calenderModal').modal('hide');
    $scope.delivery_date="";
    $scope.deliveryOption='';
    console.log("date = "+ date);
    $scope.callServiceChangeStatusApprove(t_status,t_order,date);
  }
};

$scope.callServiceChangeStatusApprove=function(status,order,date){
  $rootScope.OZNotify("Suborder "+order.suborderid+" moving to "+status, 'central'); 
  
    $http({
          method: 'GET',
          url: 'api/manageorder/'+order.suborderid+'?action='+status+'&deliverydate='+date,
         }).success(function(data, status, headers, cfg){
            $scope.handleChangeStatus(data);
         }).error(function(data, status, headers, cfg){
            $rootScope.OZNotify(status, 'error');  
         });
};

$scope.reasonEntered=function(reason){

  if($scope.form.orderReason.$invalid){
      // $rootScope.OZNotify("Please add valid information", 'error');
      $scope.form.orderReason.submitted=true;
    }
  else{
    $scope.form.orderReason.$setPristine();
    $('#cancelReasonModal').modal('hide');
    $scope.delivery_date="";
    console.log("t_order "+" reason = "+ reason.text);
    $scope.callServiceChangeStatusCancelReject(t_status,t_order,reason.text);
   
   }
};

$scope.callServiceChangeStatusCancelReject=function(status,order,reason){
  $rootScope.OZNotify("Suborder "+order.suborderid+" moving to "+status, 'central'); 
  
    $http({
          method: 'GET',
          url: 'api/manageorder/'+order.suborderid+'?action='+status+'&remark='+reason,
         }).success(function(data, status, headers, cfg){
            $scope.reason.text="";
            $scope.handleChangeStatus(data);
         }).error(function(data, status, headers, cfg){
            $rootScope.OZNotify(status, 'error');  
         });
};




$scope.callServiceChangeStatus=function(status,order){
   var orderid=order.suborderid;
    
    // if(status =='production' || status =='indelivery' || status =='done'){
    //    var index = $scope.orders.indexOf(order);
    //         if (index != -1){
    //            $scope.orders.splice(index, 1);
    //         }
    // }
   
  $rootScope.OZNotify("Suborder "+order.suborderid+" moving to "+status, 'central'); 
    $http({
          method: 'GET',
          url: 'api/manageorder/'+orderid+'?action='+status,
         }).success(function(data, status, headers, cfg){
            $scope.handleChangeStatus(data);
         }).error(function(data, status, headers, cfg){
            $rootScope.OZNotify(status, 'error');  
         });
 
};


$scope.getOrderDate=function(deliverydatetime){
  var format = 'DD-MM-YYYY, h:mm:ss a';
    return moment(deliverydatetime).format(format);
    // return moment(deliverydatetime).subtract('hours', 5.5).format(format);

  
};

$scope.getDate=function(dayorder){
  if($scope.orders[0].deliverydatetime){
     if(dayorder!==undefined || dayorder !==null){
       var d= new Date(dayorder.deliverydatetime.year,dayorder.deliverydatetime.month-1,dayorder.deliverydatetime.day);
      return moment(d).format("dddd, MMMM Do YYYY");
     }
  }
};

 $scope.handleChangeStatus=function(data){
   if(data.error){
        $rootScope.OZNotify(data.error.message, 'error');  
        $log.debug(data.error.message);
        if(data.error.code=='AL001'){
          $rootScope.showModal();
        }
   }
   else if(data.success){
    // $rootScope.OZNotify(data.success.message, 'success');  
    console.log(data.success);
    $scope.getLatestOrders();
   }
  };

  $scope.firstTreeTabOpen=function(status){
    if(status=='orderreceived'){
       $scope.tab1=true;
       $scope.tab2=false;
       $scope.tab3=false;
       $scope.tab4=false;
     }

    if(status=='accepted'){
       $scope.tab1=true;
       $scope.tab2=false;
       $scope.tab3=false;
       $scope.tab4=false;
     }

    if(status=='inproduction'){
       $scope.tab1=false;
       $scope.tab2=true;
       $scope.tab3=false;
       $scope.tab4=false;
     }

    if(status=='packing'){
       $scope.tab1=false;
       $scope.tab2=true;
       $scope.tab3=false;
       $scope.tab4=false;
     }

    if(status=='factorytostore'){
       $scope.tab1=false;
       $scope.tab2=false;
       $scope.tab3=false;
       $scope.tab4=true;
     }

    if(status=='indelivery'){
       $scope.tab1=false;
       $scope.tab2=false;
       $scope.tab3=false;
       $scope.tab4=true;
     }


    if(status=='ordercomplete'){
       $scope.tab1=false;
       $scope.tab2=false;
       $scope.tab3=false;
       $scope.tab4=true;
     }

  };



$scope.displayAction = function (status) {


for (var i = $scope.orderConfigStatus.length - 1; i >= 0; i--) {
 if(status==$scope.orderConfigStatus[i].order_status){
   return {
      display: "block"
    }
 }
}
};



  }
  ]
  };
  });

angular.module('oz.ProviderApp').directive('altSrc', function() {
  return {
    link: function(scope, element, attrs) {
      var defaultSrc = attrs.src;
      element.bind('error', function() {
        if(attrs.errSrc) {
            element.attr('src', attrs.errSrc);
        }
        else if(attrs.src) {
            element.attr('src', defaultSrc);
        }
      });
    }
  }
});

angular.module('oz.ProviderApp').filter('datetime1', function($filter)
{
 return function(input)
 {
  if(input == null){ return ""; } 
 
  var _date = $filter('date')(new Date(input),
                              'yyyy-MM-dd @ HH:mm:ss');
 
  return _date.toUpperCase();

 };
});