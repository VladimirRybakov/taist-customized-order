client = require '../globals/client'

module.exports = (uuid) ->
  result = []

  plan = client.from('ProcessingPlan').select({ uuid: uuid }).load()[0];
  if plan?
    client
      .from('Good')
      .select( uuid: plan.material.reduce ((str, good) -> "#{str};uuid=#{good.goodUuid}"), "0" )
      .load (err, goods) ->
        result = goods
  result
