module.exports = function(goods, quantitiesMap) {
  var i, l, good, positions = [];

  for( i = 0, l = goods.length; i < l; i+= 1 ) {
    good = goods[i];

    price = good.buyPrice || 0
    priceObject = {
      sum: price,
      sumInCurrency: price
    }

    positions.push({
      vat: good.vat,
      goodUuid: good.uuid,
      quantity: quantitiesMap[good.uuid],
      discount: 0,
      reserve: 0,
      basePrice: priceObject,
      price: priceObject,
    });
  }

  return positions;
}
