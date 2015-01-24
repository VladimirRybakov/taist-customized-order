var $api = require('../globals/api'),
    $vm = require('../globals/vm');

module.exports = function(key, callback, forceUpdate) {
  var storedData = $api.localStorage.get($vm.companyUuid) || {};
  if(!storedData[key]) {
    storedData[key] = callback(key);
    $api.localStorage.set($vm.companyUuid, storedData);
  }
  else if (forceUpdate) {
    data = callback(key);
    Object.keys(data).forEach(function(entityKey){
      storedData[key][entityKey] = data[entityKey]
    })
    $api.localStorage.set($vm.companyUuid, storedData);
  }
  return storedData[key];
}
