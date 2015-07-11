module.exports = (good) ->
  name: ko.observable good.name
  unit: ko.observable require('../dictsProvider').get('units', good.uomUuid)
  minPrice: ko.observable ((good.minPrice or good.buyPrice) / 100).toFixed(2)
