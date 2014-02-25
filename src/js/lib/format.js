define([], function() {
    'use strict';

    var format = {

        /**
         * Format a number with commas
         */
        num: function(num) {
            var parts = num.toString().split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            return parts.join('.');
        },

        /**
         * Format a date as dd/mm/yyyy
         */
        date: function(date) {
            var d = date.getDate(),
                m = date.getMonth() + 1,
                y = date.getFullYear();
            return d + '/' + m + '/' + y;
        }

    };

    return format;

});
