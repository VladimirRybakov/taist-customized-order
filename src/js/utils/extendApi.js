var $client = require('../globals/client');

module.exports = function(api) {
  api.getOrder = function(uuid, callback) {
    api.companyData.getPart('ordersList', uuid, callback);
  }

  api.getOrdersList = function(callback) {
    api.companyData.get('ordersList', function(error, data){
      callback(error, data);
      api.getOrdersList = function(callback) {
        callback(error, data);
      }
    });
  }

  api.setOrder = function(uuid, data, callback) {
    api.companyData.setPart('ordersList', uuid, data, callback);
  }

  api.moysklad = {};

  api.moysklad.cloneGood = function(uuid, newName) {
    var goods = $client.from('Good').select({uuid: uuid}).load(),
        good;

    if(goods) {

      good = goods[0];
      delete(good.uuid);
      delete(good.externalcode);

      if(good.attribute) {
        good.attribute = good.attribute.map(function(attr){
          delete(attr.uuid);
          delete(attr.goodUuid);
          return attr;
        });
      }

      if(good.salePrices) {
        good.salePrices = good.salePrices.map(function(price){
          delete(price.uuid);
          return price;
        });
      }

      if(newName) {
        if(typeof(newName) === 'function') {
          good.name = newName(good.name);
        } else {
          good.name = newName;
        }
      } else {
          good.name += ' ' + new Date().getTime()
      }
    }
    return good;
  }
}
