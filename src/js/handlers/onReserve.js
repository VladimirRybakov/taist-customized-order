var $vm = require('../globals/vm');

module.exports = function(doesUserWantToReserve){
  var positions = $vm.selectedOrder().customerOrderPosition();
  if($vm.selectedPositions().length > 0) {
    positions = $vm.selectedPositions();
  }

  ko.utils.arrayForEach(positions, function(item) {
    item.reserve(doesUserWantToReserve ? item._quantity() : 0);
  });

  require('../handlers').onSaveOrder();

  ko.utils.arrayForEach($vm.selectedPositions(), function(pos){
    pos._isSelected(false);
  })
}
