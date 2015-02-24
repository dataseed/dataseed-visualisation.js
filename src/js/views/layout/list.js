define(['backbone', 'underscore', 'jquery'], function(Backbone, _, $) {
    'use strict';

    var ListLayout = Backbone.View.extend({

        cellHeight: 50,

        init: $.noop,
        resize: $.noop,
        removeElement: $.noop,
        customise: $.noop,

        /**
         * Append element to list
         */
        addElement: function(element, $element) {
            this.resizeElement(element, $element);
            $element.appendTo(this.$('.elements'));
        },

        /**
         * Resize element (elements are always full width)
         */
        resizeElement: function(element, $element) {
            $element.height(element.get('height') * this.cellHeight);
        }

    });

    return ListLayout;
});
