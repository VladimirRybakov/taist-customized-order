module.exports = function(goods, quantitiesMap) {
  var i, l, good, positions = [];

  for( i = 0, l = goods.length; i < l; i+= 1 ) {
    good = goods[i];

    positions.push({
      vat: good.vat,
      goodUuid: good.uuid,
      quantity: quantitiesMap[good.uuid],
      discount: 0,
      reserve: 0,
      basePrice: {
        sum: good.salePrice,
        sumInCurrency: good.salePrice
      },
      price: {
        sum: good.salePrice,
        sumInCurrency: good.salePrice
      },
    });
  }

  return positions;
}
