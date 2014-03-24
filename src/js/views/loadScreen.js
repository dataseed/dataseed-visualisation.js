//The loading screen view
define(['backbone', 'underscore', 'spin'], function(Backbone, _, Spinner) {
   'use strict';

    var LoadScreenView = Backbone.View.extend({

        className: 'spinner-container',

        defaultOptions: {
            lines: 11, // The number of lines to draw
            length: 24, // The length of each line
            width: 10, // The line thickness
            radius: 60, // The radius of the inner circle
            corners: 1, // Corner roundness (0..1)
            rotate: 0, // The rotation offset
            direction: 1, // 1: clockwise, -1: counterclockwise
            color: 'black', // #rgb or #rrggbb
            speed: 0.8, // Rounds per second
            trail: 67, // Afterglow percentage
            shadow: false, // Whether to render a shadow
            hwaccel: true, // Whether to use hardware acceleration
            className: 'spinner', // The CSS class to assign to the spinner
            zIndex: 2e9 // The z-index (defaults to 2000000000)
        },

        initialize: function(opts) {
            this.spinner = new Spinner(_.extend(this.defaultOptions, opts));
            this.render();
        },

        render: function() {
            this.spinner.spin(this.el);
            this.$el.css('height', '300px');
        }

    });

    return LoadScreenView;

});
