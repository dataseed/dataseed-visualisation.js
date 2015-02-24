define(['backbone', 'underscore', 'jquery', 'gridster'], function(Backbone, _, $) {
    'use strict';

    var GridLayout = Backbone.View.extend({

        numCols: 4,
        cellHeight: 50,
        cellMargin: 10,

        customise: $.noop,

        /**
         * Initialise grid layout
         */
        init: function() {
            // Enable gridster to position elements
            this._gridster = this.$('.elements')
                .gridster(this._getConfig())
                .data('gridster')
                .disable_resize()
                .disable();
        },

        /**
         * Resize grid
         */
        resize: function() {
            // Set new widget base dimensions
            var opts = this._gridster.options;
            opts.widget_base_dimensions = this._getCellSize();

            // Update minimum widget width and height
            this._gridster.min_widget_width = (opts.widget_margins[0] * 2) + opts.widget_base_dimensions[0];
            this._gridster.min_widget_height = (opts.widget_margins[1] * 2) + opts.widget_base_dimensions[1];

            // Re-generate gridster styles
            this._gridster.generate_stylesheet();
        },

        /**
         * Add element to grid
         */
        addElement: function(element, $element) {
            this._gridster.add_widget(
                $element,
                element.get('width'),
                element.get('height'),
                element.get('x'),
                element.get('y')
            );
        },

        /**
         * Remove element from grid
         */
        removeElement: function(element, $element) {
            this._gridster.remove_widget($element);
        },

        /**
         * Resize grid element
         */
        resizeElement: function(element, $element, render) {
            // Update widget (element) size in gridster, keeping existing element dimensions
            var data = this._gridster.serialize($element)[0];
            this._gridster.resize_widget($element, data.sizex, data.sizey);

            // If transitions are supported, re-render the element
            // after the gridster resize animation completes
            if ($.support.transition.end) {
                $element.one($.support.transition.end, render);

            // Otherwise (IE9), re-render at the end of the current execution queue
            } else {
                setTimeout(render, 0);
            }
        },

        /**
         * Get gridster configuration options
         */
        _getConfig: function() {
            return {
                widget_selector: null,
                widget_base_dimensions: this._getCellSize(),
                widget_margins: [this.cellMargin, this.cellMargin],
                min_cols: this.numCols,
                max_cols: this.numCols,
                resize: {
                    enabled: true,
                    handle_class: 'resize'
                },
                draggable: {}
            };
        },

        /**
         * Determine the current gridster cell width and height
         */
        _getCellSize: function() {
            return [
                (this.$('.container').width() / this.numCols) - (this.cellMargin * 2),
                this.cellHeight
            ];
        }

    });

    return GridLayout;
});
