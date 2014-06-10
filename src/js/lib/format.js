define(['underscore', 'd3'], function(_, d3) {
    'use strict';

    var format = {

        /**
         * Format a number
         */
        num: function(n) {
            if (!_.isNumber(n)) {
                // NaN
                return '0';

            } else if ((n % 1) === 0) {
                // Integer
                return this.numInteger(n);

            } else {
                // Float
                return this.numFloat(n);
            }
        },

        /**
         * Format a number with commas
         */
        numInteger: d3.format('0,'),

        /**
         * Format a number with commas to 2 d.p.
         */
        numFloat: d3.format('0,.3f'),

        /**
         * Format a number with an SI prefix (e.g. k, M)
         */
        numScale: d3.format(',s'),

        /**
         * Format a timestamp using the shortest date format
         */
        dateShort: function(timestamp) {
            var d = new Date(timestamp);
            return _.reduce(this._dateShortFormats, function(output, format) {
                if (format[1](d)) {
                    output += format[0](d) + ' ';
                }
                return output;
            }, '');
        },

        _dateShortFormats: [
            [d3.time.format('.%L'), function(d) { return d.getMilliseconds(); }],
            [d3.time.format(':%S'), function(d) { return d.getSeconds(); }],
            [d3.time.format('%I:%M'), function(d) { return d.getMinutes(); }],
            [d3.time.format('%I %p'), function(d) { return d.getHours(); }],
            [d3.time.format('%a %d'), function(d) { return d.getDay() && d.getDate() != 1; }],
            [d3.time.format('%b %d'), function(d) { return d.getDate() != 1; }],
            [d3.time.format('%B'), function(d) { return d.getMonth(); }],
            [d3.time.format('%Y'), function() { return true; }]
        ],

        /**
         * Format a timestamp with day and month names for the current locale
         */
        dateLong: function(timestamp) {
            return this._dateLongFormat(new Date(timestamp));
        },

        _dateLongFormat: d3.time.format('%A, %e %B %Y')

    };

    return format;

});
