module.exports = {
  parseProcessingPlans: require('./utils/parseProcessingPlans'),
  saveTaistOptions: require('./utils/saveTaistOptions'),
  getPositionsOrder: function(){
    return $('tr', '.taist-table')
      .not(':first')
      .toArray()
      .map(function(i) {
        return ko.dataFor(i).uuid
      });
  },
}
