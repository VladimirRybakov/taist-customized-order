var $api = require('../globals/api'),
    $vm = require('../globals/vm');

module.exports = function() {
  $api.localStorage.set($vm.companyUuid, null);
}
