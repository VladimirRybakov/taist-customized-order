var $api = require('../globals/api'),
    $client = require('../globals/client'),
    $dom = require('../globals/dom'),
    $app = require('../globals/app'),
    STATE = require('../state'),

    $queue = require('../requestQueue');

module.exports = function (options) {
  if(typeof options.data.vat !== 'number') {
    options.data.vat = 18;
  }

  var koData = ko.mapping.fromJS(options.data, {
        basePrice: require('../processors').createSumObject,
        price: require('../processors').createSumObject,
        copy: [
          'TYPE_NAME',
          'accountId',
          'accountUuid',
          '//basePrice{}',
          'changeMode',
          'consignmentUuid',
          '//discount',
          '//goodUuid',
          '//price{}',
          '//quantity',
          'readMode',
          '//reserve',
          'uuid',
          '//vat',
        ]
      }),
      goodUuid = koData.goodUuid();

  if(!$vm.goods[goodUuid]) {
    $vm.goods[goodUuid] = {
      name: ko.observable(goodUuid),
      unit: ko.observable(goodUuid),
      minPrice: ko.observable(0),
      buyPrice: ko.observable(0),
      deliveryTime: ko.observable(''),
    };
  }

  koData._available = ko.observable(0);
  koData._availableInfo = ko.observable('');
  koData._isSelected = ko.observable(false);

  $queue.push({
    req: function(callback){
      $client.stock({
        goodUuid: goodUuid
      }, function(){
        callback.apply(null, arguments);
      });
    },
    res: function(dummy, data){
      data[0] || (data[0] = {
        quantity: 0,
        stock: 0,
        reserve: 0,
        inTransit: 0,
      });

      koData._available(
        data[0].quantity
      );

      koData._availableInfo(
          'Доступно: ' + data[0].quantity + '<br>'
        + 'Остаток: ' + data[0].stock + '<br>'
        + 'Резерв: ' + data[0].reserve + '<br>'
        + 'Ожидание: ' + data[0].inTransit
      );
    }
  });

  koData._availabilityColor = ko.computed(function(){
    return this.quantity() > this._available() ? 'red' : 'green';
  }, koData);

  koData._name = $vm.goods[goodUuid].name;
  koData._unit = $vm.goods[goodUuid].unit;

  koData._minPrice = $vm.goods[goodUuid].minPrice;
  koData._buyPrice = $vm.goods[goodUuid].buyPrice;

  koData._deliveryTime = $vm.goods[goodUuid].deliveryTime;

  koData._price = ko.computed({
    read: function () {
      return (this.price.sum()/100).toFixed(2); //.replace('.', ',');
    },
    write: function (value) {
      this.price.sum(Math.round(value * 100));
      this.price.sumInCurrency(Math.round(value * 100));
    },
    owner: koData
  });

  koData._vat = ko.computed(function(){
    var vat = (this.quantity() * this.price.sum() / 100 * this.vat() / (100 + this.vat()));
    return Math.round(vat * 100) / 100;
  }, koData);

  koData._sVat = ko.computed(function(){
    return this._vat().toFixed(2).replace('.', ',');
  }, koData);

  koData._total = ko.computed(function(){
    return (this.quantity() * this.price.sum() / 100);
  }, koData);

  koData._sTotal = ko.computed(function(){
    return this._total().toFixed(2).replace('.', ',');
  }, koData);

  koData._quantityPerPresent = ko.observable(
    $vm.selectedPlan().materials[koData.goodUuid()] || 1
  );

  koData._minimalPrice = ko.computed({
    read: function () {
      if($vm.selectedOrder() && $vm.selectedOrder().minimalPrices[this.uuid])
        return ($vm.selectedOrder().minimalPrices[this.uuid]).toFixed(2);
      else
        if($vm.selectedOrder() && $vm.selectedOrder().minimalPrices) {
          // temporary code to save current values for min prices
          $vm.selectedOrder().minimalPrices[this.uuid] = this.basePrice.sum()/100;
        }
        return (this.basePrice.sum()/100).toFixed(2);
    },
    write: function (value) {
      $vm.selectedOrder().minimalPrices[this.uuid] = parseFloat(value);
    },
    owner: koData
  });

  koData._onRemove = function(){
    $vm.selectedOrder().customerOrderPosition.remove(this);
  }

  return koData;
}
