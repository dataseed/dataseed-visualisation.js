define(['backbone', 'jquery'],
    function(Backbone, $) {
    'use strict';

    var TextElementView = Backbone.View.extend({

        className: 'inner-element',

        initialize: function() {
            this.listenTo(this.model.get('settings'), 'change:content', this.render);
        },

        render: function() {
            // Set content
            var $content = this.$('.text').length ? this.$('.text') : $('<div class="text">').appendTo(this.$el);
            $content.html(this.model.get('settings').get('content'));

            // Set custom colours
            var styles = this.model.visualisation.styles;
            this.$el.css('background-color', styles.getStyle('background'));
            this.$('h1, h2, h3, h4').css('color', styles.getStyle('heading'));
            this.$('.text, p, blockquote, a, strong, em, del, u, li, td').css('color', styles.getStyle('label'));
            this.$('td').css('border-color', styles.getStyle('label'));
        }

    });

    return TextElementView;

});
