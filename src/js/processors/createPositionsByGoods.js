module.exports = function(goods, quantitiesMap) {
  var i, l, good, positions = [];

  for( i = 0, l = goods.length; i < l; i+= 1 ) {
    good = goods[i];

    var buyPrice = good.buyPrice || 0
    var priceObject = {
      sum: buyPrice,
      sumInCurrency: buyPrice
    }

    var minPrice = good.minPrice || 0
    var minPriceObject = {
      sum: minPrice,
      sumInCurrency: minPrice
    };

    positions.push({
      vat: good.vat,
      goodUuid: good.uuid,
      quantity: quantitiesMap[good.uuid],
      discount: 0,
      reserve: 0,
      basePrice: minPriceObject,
      price: priceObject,
    });
  }

  return positions;
}
