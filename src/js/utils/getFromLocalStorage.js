var $api = require('../globals/api'),
    $vm = require('../globals/vm');

module.exports = function(key, callback) {
  var storedData = $api.localStorage.get($vm.companyUuid) || {};
  if(!storedData[key]) {
    storedData[key] = callback(key);
    $api.localStorage.set($vm.companyUuid, storedData);
  }
  return storedData[key];
}
