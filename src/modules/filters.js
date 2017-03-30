'use strict';

(function() {
  var app = angular.module('app.filters', [])

  .filter("ajaxMethod", ['CONFIG', function(CONFIG) {
    return function() {
        var method = CONFIG.test ? 'GET' : 'POST';
        return method;
    };
  }])

  .filter("fenToYuan", function() {
    return function(fen) {
        var s = fen + '';
        if(s.length == 1) { s = '00' + s; }
        else if(s.length == 2) { s = '0' + s; }
        var s1 = s.slice(0, -2);
        var s2 = s.slice(-2);
        return s1 + '.' + s2;
    };
  })

  .filter("orderStatus",['$filter', function($filter){
    return function(orderStatus){
      var flag;
      switch (orderStatus){
         case 'WAITPAY':
             flag = $filter('translate')('WAITPAY');
             break;
         case 'WAITAPPROVAL':
             flag = $filter('translate')('WAITAPPROVAL');
             break;

         case 'ACCEPT':
             flag = $filter('translate')('ACCEPT');
             break;
         case 'COMPLETED':
             flag = $filter('translate')('COMPLETED');
             break;
         case 'REFUNDING':
             flag = $filter('translate')('REFUNDING');
             break;
         case 'CANCELED':
             flag = $filter('translate')('CANCELED');
             break;
      }
      return flag;
    }
  }])

  .filter("shopOrderStatus", ['$filter', function($filter) {
    return function(shopOrderStatus) {
      var flag;
      switch (shopOrderStatus) {
        case 'WAITPAY':
          flag = '待付款';
          break;
        case 'WAITAPPROVAL':
          flag = '待审核';
          break;
        case 'ACCEPT':
          flag = '待发货';
          break;
        case 'DELIVERING':
          flag = '待收货';
          break;
        case 'COMPLETED':
          flag = '订单完成';
          break;
        case 'REFUNDING':
          flag = '退款中';
          break;
        case 'CANCELED':
          flag = '已取消';
          break;
      }


      return flag;
    }
  }])


  .filter("operateAction",['$filter', function($filter){
    return function(operateAction){
      var flag;
      // translate to do
      switch (operateAction){
         case 'GUEST_CANCEL':
             flag = '用户取消订单';
             break;
         case 'ADMIN_CANCEL':
             flag = '管理员取消订单';
             break;

         case 'CANCEL_REFUNDING':
             flag = '用户取消退款中';
             break;
         case 'SELLER_CANCEL_REFUNDING':
             flag = '管理员取消退款中';
             break;
         case 'ACCEPT':
             flag = '订单审核通过';
             break;
         case 'COMPLETED':
             flag = '订单完成';
             break;
         case 'SELLER_DECLINE':
            flag = '订单审核不通过';
            break;
         case 'CHANGE_EXPRESS':
            flag = '更新了快递信息';
            break;
      }
      return flag;
    }
  }])

  .filter("deliverWay",['$filter', function($filter){
    return function(deliverWay){
      var flag;
      // translate to do
      switch (deliverWay){
         case 'express':
             flag = '快递';
             break;
         case 'bySelf':
             flag = '自提';
             break;
      }
      return flag;
    }
  }])

  // 是否生效
  .filter('isValid', function() {
    return function(input) {
      var flag;
      if (input == 0) {
        flag = "否";
      } else {
        flag = "是";
      }
      return flag;
    }
  })

  
  // 数组转化为字符串
  .filter('arrToString', function() {
    return function(arr) {
        return arr.join('; ')
    }
  });
  
  

})();