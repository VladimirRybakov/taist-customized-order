client = require '../globals/client'

module.exports = (uuid) ->
  result = []

  plan = client.from('ProcessingPlan').select({ uuid: uuid }).load()[0];
  if plan?
    result = client
      .from('Good')
      .select( uuid: plan.material.reduce ((str, good) -> "#{str};uuid=#{good.uuid}"), "0" )
      .load (err, goods) ->
  result
