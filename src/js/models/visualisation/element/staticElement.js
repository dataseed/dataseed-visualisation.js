define(['backbone', 'underscore', '../element'],
function (Backbone, _, Element) {
    'use strict';

    /**
     * Element without any dimensions or measures
     */
    var StaticElement = Element.extend({
        isLoaded: _.constant(true),
        isCut: _.constant(false)
    });

    return StaticElement;

});
