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
        numFloat: d3.format('0,.2f'),

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
            [d3.time.format.utc('.%L'), function(d) { return d.getMilliseconds(); }],
            [d3.time.format.utc(':%S'), function(d) { return d.getSeconds(); }],
            [d3.time.format.utc('%I:%M'), function(d) { return d.getMinutes(); }],
            [d3.time.format.utc('%I %p'), function(d) { return d.getHours(); }],
            [d3.time.format.utc('%a %d'), function(d) { return d.getDay() && d.getDate() !== 1; }],
            [d3.time.format.utc('%b %d'), function(d) { return d.getDate() !== 1; }],
            [d3.time.format.utc('%B'), function(d) { return d.getMonth(); }],
            [d3.time.format.utc('%Y'), function() { return true; }]
        ],

        /**
         * Format a timestamp with day and month names for the current locale
         */
        dateLong: function(timestamp, granularity) {
            if (!(granularity in this._dateLongFormats)) {
                granularity = 'date_day';
            }
            return this._dateLongFormats[granularity](new Date(timestamp));
        },

        _dateLongFormats: {
            'date_year': d3.time.format.utc('%Y'),
            'date_quarter': function(date) {
                var m = d3.time.format.utc('%m')(date),
                    y = d3.time.format.utc('%Y')(date),
                    q = Math.ceil(m/3);
                return 'Q' + q + '-' + y;
            },
            'date_month': d3.time.format.utc('%B %Y'),
            'date_week': d3.time.format.utc('%Y Week %W'),
            'date_hour': d3.time.format.utc('%A, %e %B %Y %I%_p'),
            'date_minute': d3.time.format.utc('%A, %e %B %Y %H:%M'),
            'date_second': d3.time.format.utc('%A, %e %B %Y %H:%M:%S'),
            'date_day': d3.time.format.utc('%A, %e %B %Y')
        },

        /**
         * Format a value for output in an HTML5 data attribute
         */
        data: function(value) {
            return JSON.stringify({value: value});
        }

    };

    return format;

});
