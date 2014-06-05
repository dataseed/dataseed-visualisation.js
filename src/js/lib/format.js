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
         * Format a timestamp for the current locale
         */
        dateShort: function(timestamp) {
            return this.date(timestamp, {year: 'numeric', month: 'numeric', day: 'numeric'});
        },

        /**
         * Format a timestamp with day and month names for the current locale
         */
        dateLong: function(timestamp) {
            return this.date(timestamp, {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'});
        },

        /**
         * Format a timestamp
         */
        date: function(timestamp, options) {
            return new Date(timestamp).toLocaleDateString(undefined, options);
        }

    };

    return format;

});
