var $vm = require('../globals/vm');

module.exports = function (options) {
  var defaults = {
    quantity: 30,
    discount: 0,
  };

  $.extend(defaults, options);

  var primeCost = ko.mapping.fromJS(defaults);

  function round(n) {
    return Math.round(n * 100) / 100;
  }

  primeCost.costWithPackage = ko.computed(function(){
    var order = $vm.selectedOrder();
    if(!order) {
      return 0;
    }
    return parseInt(order._pricePerPresent(), 10) + parseInt(order.primeCostPackage(), 10);
  });

  primeCost.cost = ko.computed(function(){
    var order = $vm.selectedOrder();
    if(!order) {
      return 0;
    }
    return round ( this.costWithPackage() *
      ( 1 + order.primeCostRisk() / 100 ) *
      ( 1 - this.discount() / 100 ) *
      ( 1 + order.primeCostInterest() ) *
      ( 1 + order.primeCostTax() ) );
  }, primeCost);

  primeCost.income = ko.computed(function(){
    var order = $vm.selectedOrder();
    if(!order) {
      return 0;
    }
    return round (
      this.cost() * order.primeCostOutput() - this.costWithPackage()
    );
  }, primeCost);

  primeCost.total = ko.computed(function(){
    if(!$vm.selectedOrder()) {
      return 0;
    }
    return round ( this.income() * this.quantity() );
  }, primeCost);

  return primeCost;
}
