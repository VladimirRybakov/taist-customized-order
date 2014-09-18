module.exports = function() {
  return $('tr', '.taist-table')
    .not(':first')
    .toArray()
    .map(function(i) {
      return ko.dataFor(i).uuid
    });
}
