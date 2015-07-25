module.exports = (good) ->
  deliveryTimeAttributeId = "fda2bb16-2f16-11e5-7a40-e8970033ea1d"
  diliveryTimeAttr = good.attribute?.filter (attr) ->
    attr.metadataUuid is deliveryTimeAttributeId

  name: ko.observable good.name
  unit: ko.observable require('../dictsProvider').get('units', good.uomUuid)
  buyPrice: ko.observable ((good.buyPrice or 0) / 100).toFixed(2)
  minPrice: ko.observable ((good.minPrice or 0) / 100).toFixed(2)
  deliveryTime: ko.observable(diliveryTimeAttr?[0]?.valueString or [])
