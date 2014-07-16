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
    // $scope.showAccept =false;
    // $scope.showReject =false;
    // $scope.showCancel =false;
    // $scope.showProduction =false;
    // $scope.showPacking =false;
    // $scope.showShiptostore =false;
    // $scope.showDeliverytocustomer =false;
    // $scope.showPickfromstore =false;
    // $scope.showDone =false;


$scope.fromNow = function (time) {
  if (time != undefined) {
    return moment(time).calendar();
  }
};


 $scope.changeStatus=function(status,order){
    var orderid=order.suborderid

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




$scope.onDateSelected=function(delivery_date){
    $('#calenderModal').modal('hide');
    $scope.delivery_date="";
    // console.log("date = "+ delivery_date);
    $scope.callServiceChangeStatusApprove(t_status,t_order,delivery_date);

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
    
    // if(status =='production' || status =='delivertohome' || status =='pickfromstore' || status =='done'){
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


// $scope.getOrderDate=function(deliverydatetime){
//   var d= new Date(deliverydatetime);
//   return moment(d).format("YYYY-MM-DD");
// };

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
    if(status=='orderstart'){
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
       $scope.tab3=true;
       $scope.tab4=false;
     }

    if(status=='storepickup'){
       $scope.tab1=false;
       $scope.tab2=false;
       $scope.tab3=false;
       $scope.tab4=true;
     }

    if(status=='homedelivery'){
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

    if(status=='orderstart'){
        $scope.showAccept =true;
        $scope.showReject =true;
        $scope.showCancel =false;
        $scope.showProduction =false;
        $scope.showPacking =false;
        $scope.showShiptostore =false;
        $scope.showDeliverytocustomer =false;
        $scope.showPickfromstore =false;
        $scope.showDone =false;
     }

    if(status=='accepted'){
       $scope.showAccept =false;
       $scope.showReject =false;
       $scope.showCancel =true;
       $scope.showProduction =true;
       $scope.showPacking =false;
       $scope.showShiptostore =false;
       $scope.showDeliverytocustomer =false;
       $scope.showPickfromstore =false;
       $scope.showDone =false;
     }

    if(status=='rejected'){
       $scope.showAccept =false;
       $scope.showReject =false;
       $scope.showCancel =false;
       $scope.showProduction =false;
       $scope.showPacking =false;
       $scope.showShiptostore =false;
       $scope.showDeliverytocustomer =false;
       $scope.showPickfromstore =false;
       $scope.showDone =false;
     }

    if(status=='cancelled'){
       $scope.showAccept =false;
       $scope.showReject =false;
       $scope.showCancel =false;
       $scope.showProduction =false;
       $scope.showPacking =false;
       $scope.showShiptostore =false;
       $scope.showDeliverytocustomer =false;
       $scope.showPickfromstore =false;
       $scope.showDone =false;
     }

    if(status=='inproduction'){
       $scope.showAccept =false;
       $scope.showReject =false;
       $scope.showCancel =true;
       $scope.showProduction =false;
       $scope.showPacking =true;
       $scope.showShiptostore =false;
       $scope.showDeliverytocustomer =false;
       $scope.showPickfromstore =false;
       $scope.showDone =false;
     }

    if(status=='packing'){
       $scope.showAccept =false;
       $scope.showReject =false;
       $scope.showCancel =true;
       $scope.showProduction =false;
       $scope.showPacking =false;
       $scope.showShiptostore =true;
       $scope.showDeliverytocustomer =false;
       $scope.showPickfromstore =false;
       $scope.showDone =false;
     }

    if(status=='factorytostore'){
       $scope.showAccept =false;
       $scope.showReject =false;
       $scope.showCancel =true;
       $scope.showProduction =false;
       $scope.showPacking =false;
       $scope.showShiptostore =false;
       $scope.showDeliverytocustomer =true;
       $scope.showPickfromstore =true;
       $scope.showDone =false;
     }

    if(status=='storepickup'){
       $scope.showAccept =false;
       $scope.showReject =false;
       $scope.showCancel =true;
       $scope.showProduction =false;
       $scope.showPacking =false;
       $scope.showShiptostore =false;
       $scope.showDeliverytocustomer =false;
       $scope.showPickfromstore =false;
       $scope.showDone =true;
     }

    if(status=='homedelivery'){
       $scope.showAccept =false;
       $scope.showReject =false;
       $scope.showCancel =true;
       $scope.showProduction =false;
       $scope.showPacking =false;
       $scope.showShiptostore =false;
       $scope.showDeliverytocustomer =false;
       $scope.showPickfromstore =false;
       $scope.showDone =true;
     }

    if(status=='ordercomplete'){
       $scope.showAccept =false;
       $scope.showReject =false;
       $scope.showCancel =false;
       $scope.showProduction =false;
       $scope.showPacking =false;
       $scope.showShiptostore =false;
       $scope.showDeliverytocustomer =false;
       $scope.showPickfromstore =false;
       $scope.showDone =false;
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

