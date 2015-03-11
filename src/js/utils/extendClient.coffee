api = require '../globals/api'
client = require '../globals/client'

module.exports = () ->
  originalSaveFunction = client.save

  client.save = (type, data, callback) ->

    originalSaveFunction.call client, type, data, (error, savedData) ->
      unless error
        api.companyData.setPart "history.#{savedData.uuid}", Date.now(), savedData, ->
          console.log 'history saved'
          
      callback(error, savedData)
