var $api = require('../globals/api'),
    $vm = require('../globals/vm');

module.exports = function (order){
  var labels  = $('.b-operation-form-top td.label,  .b-operation-form-bottom td.legend'),
      widgets = $('.b-operation-form-top td.widget, .b-operation-form-bottom td.widget'),
      i, l,
      label,
      key,
      input,
      val,
      attrs = $vm.orderAttributes,
      mapping = {
        'Организация'             : '_company',
        'Контрагент'              : '_customer',
        'Сотрудник'               : '_employee',
        'Склад'                   : '_store',
        'Договор'                 : '_contract',
        'План. дата отгрузки'     : '_date',
        'Проект'                  : '_project',
      },
      props = {};

  for(i = 0, l = attrs.length; i < l; i += 1) {
    mapping[attrs[i].name] = '$' + attrs[i].uuid;
  }

  $api.log(mapping);

  for(i = 0, l = labels.length; i < l; i += 1) {
    label = $(labels[i]).text();
    key = mapping[label]
    if(typeof key !== 'undefined') {
      if(typeof order[key] !== 'function') {
        order[key] = ko.observable('');
      }
      input = $('textarea:first,input:first', widgets[i]);
      val = input.attr('type') == 'checkbox' ? input[0].checked : input.val();
      order[key](val);
      props[label] = val;
    }
  }
  $api.log('OrderProperties', props);

  val = $('.state-panel').text();
  if(typeof order._state !== 'function') {
    order._state = ko.observable('');
  }
  order._state(val);
}
