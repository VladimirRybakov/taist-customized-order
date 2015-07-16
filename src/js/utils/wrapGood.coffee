module.exports = (good) ->
  name: ko.observable good.name
  unit: ko.observable require('../dictsProvider').get('units', good.uomUuid)
  buyPrice: ko.observable ((good.buyPrice or 0) / 100).toFixed(2)
  minPrice: ko.observable ((good.minPrice or 0) / 100).toFixed(2)
