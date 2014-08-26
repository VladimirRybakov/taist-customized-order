module.exports = function() {
  var positions = $vm.selectedOrder().customerOrderPosition;
  positions.remove(function(pos) {
    return pos._isSelected();
  });
  require('../handlers').onSaveOrder();
}
