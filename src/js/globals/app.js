var state = [];

module.exports = {
  changeState: function(name, data){
    state.push({
      name: name,
      data: data
    })
  },

  resetState: function(){
    state.splice(0,state.length);
  },

  getLastState: function(){
    return state[state.length - 1];
  },

  getFirstState: function(){
    return state[0];
  },
};
