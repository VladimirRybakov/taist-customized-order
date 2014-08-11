module.exports = {
  changeState: function(name, data){
    $state.push({
      name: name,
      data: data
    })
  },

  getLastState: function(){
    return $state[$state.length - 1];
  },

  getFirstState: function(){
    return $state[0];
  },
};
