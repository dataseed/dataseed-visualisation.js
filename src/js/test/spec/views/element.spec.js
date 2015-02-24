define(['jquery', 'models/dataset', 'models/visualisation/element/dimensionalElement', 'views/element'],
    function($, Dataset, DimensionalElement, ElementView) {
    /* global xdescribe, beforeEach, expect, it */

    xdescribe('An element view', function() {

        beforeEach(function() {
            this.el = $('<div/>').get(0);

            this.dataset = new Dataset({
                    id: 'test01',
                    visualisation_id: 'test02',
                    fields: [
                        {id: 'test04', type: 'string'},
                        {id: 'test05', type: 'integer'}
                    ]
                });
            this.dataset.reset();

            this.element = new DimensionalElement({
                    id: 'test03',
                    dataset: this.dataset,
                    visualisation: this.dataset.visualisation,
                    type: 'bar',
                    width: 3,
                    dimensions: [{
                        field: {
                            id: 'test04'
                        }
                    }],
                    measure: {
                        id: 'test05'
                    },
                    label: 'Test Field'
                });

            this.view = new ElementView({
                    el: this.el,
                    model: this.element,
                    visualisation: this.dataset.visualisation
                });
        });

        it('should not render before the model has loaded', function() {
            this.view.render();
            expect(this.view.el).toBeEmpty();
        });

        it('should render correctly', function() {
            this.element._getConnection('observations').set({
                test04: []
            });
            this.element._getConnection('dimensions').set({
                test04: {}
            });
            this.element._connections.observations.loaded = 1;
            this.element._connections.dimensions.loaded = 1;
            this.view.render();

            expect(this.view.el).toBeMatchedBy('.element.barElement');
        });

    });

});
