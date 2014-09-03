var $api = require('../globals/api');

module.exports = function (order){
  var labels  = $('.b-operation-form-top td.label'),
      widgets = $('.b-operation-form-top td.widget'),
      i, l,
      label,
      key,
      val,
      mapping = {
        'Организация'         : '_company',
        'Контрагент'          : '_customer',
        'Сотрудник'           : '_employee',
        'Склад'               : '_store',
        'Договор'             : '_contract',
        'План. дата отгрузки' : '_date',
        'Проект'              : '_project',
      };

  for(i = 0, l = labels.length; i < l; i += 1) {
    label = $(labels[i]).text();
    key = mapping[label]
    if(typeof key !== 'undefined') {
      if(typeof order[key] != 'function') {
        order[key] = ko.observable('');
      }
      val = $('input:first', widgets[i]).val();
      $api.log('order attributes', key, val);
      order[key](val);
    }
  }
}
