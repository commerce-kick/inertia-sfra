'use strict';

var Cleave = require('cleave').default;

module.exports = {
    handleDateInput: function (dateFormat) {
        if ($('.grEventDate').length) {
            var cleave = new Cleave('.grEventDate', {
                date: true,
                datePattern: dateFormat
            });
            $('.grEventDate').data('cleave', cleave);
        }
    },

    serializeData: function (form) {
        var serializedArray = form.serializeArray();

        serializedArray.forEach(function (item) {
            if (item.name.indexOf('_eventDate') > -1) {
                item.value = $('.grEventDate').data('cleave').getISOFormatDate(); // eslint-disable-line
            }
        });

        return $.param(serializedArray);
    }
};
