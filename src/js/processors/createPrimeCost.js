var $vm = require('../globals/vm');

module.exports = function (options) {
  var defaults = {
    quantity: 30,
    discount: 0,
  };

  $.extend(defaults, options);

  var primeCost = ko.mapping.fromJS(defaults);

  primeCost.cost = ko.computed(function(){
    var order = $vm.selectedOrder();
    if(!order || typeof order._pricePerPresent !== 'function') {
      return 0;
    }
    return order._pricePerPresent() *
      ( 1 - this.discount() / 100 ) *
      ( 1 + $vm.primeCostInterest() ) *
      ( 1 + $vm.primeCostTax() );
  }, primeCost);

  primeCost.income = ko.computed(function(){
    if(!$vm.selectedOrder()) {
      return 0;
    }
    return this.cost() * $vm.primeCostOutput() - $vm.selectedOrder()._pricePerPresent();
  }, primeCost);

  primeCost.total = ko.computed(function(){
    if(!$vm.selectedOrder()) {
      return 0;
    }
    return this.income() * $vm.selectedOrder()._presentsCount();
  }, primeCost);

  return primeCost;
}
