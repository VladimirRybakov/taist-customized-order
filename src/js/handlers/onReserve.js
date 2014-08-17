var $vm = require('../globals/vm');

module.exports = function(doesUserWantToReserve){
  ko.utils.arrayForEach($vm.selectedOrder().customerOrderPosition(), function(item) {
    item.reserve(doesUserWantToReserve ? item._quantity() : 0);
  });
  require('../handlers').onSaveOrder();
}
