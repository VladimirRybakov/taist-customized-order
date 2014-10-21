var $vm = require('../globals/vm'),
    $api = require('../globals/api'),
    $client = require('../globals/client');

module.exports = function(){
  var positions = $vm.selectedPositions(),
      length = positions.length,
      updatedPositions = [],
      ts = new Date().getTime();

  function updateGoodName(name) {
    var suffix = ts,
        order = $vm.selectedOrder();

    if(order) {
      if(order._project()) {
        suffix = order._project();
      }
    }

    name = name.replace(/\s*\(.+?\)\s*$/, '');
    name += ' (' + suffix + ')';
    return name;
  }

  ko.utils.arrayForEach(positions, function(pos) {
    var good = $api.moysklad.cloneGood(pos.goodUuid(), updateGoodName);

    $client.save('moysklad.good', good, function(dummy, good){
      delete(pos.consignmentUuid);
      pos.goodUuid(good.uuid);

      updatedPositions.push(good);
      if(updatedPositions.length === length){
        console.log(updatedPositions);

        require('../handlers').onSaveOrder();

        ko.utils.arrayForEach($vm.selectedPositions(), function(pos){
          pos._isSelected(false);
        })
      }
    });
  });
}

$api.onCreateGoodsForOrder = module.exports;
