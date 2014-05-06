define(['jquery', 'models/dataset', 'models/visualisation/element', 'views/element'], function($, Dataset, Element, ElementView) {

    describe('An element view', function() {

        beforeEach(function() {
            this.el = $('<div/>').get(0);

            this.dataset = new Dataset({
                    id: 'test01',
                    visualisation_id: 'test02',
                    fields: [{
                        id: 'test04'
                    }, {
                        id: 'test05'
                    }]
                });
            this.dataset.reset();

            this.element = new Element({
                    id: 'test03',
                    dataset: this.dataset,
                    visualisation: this.dataset.visualisation,
                    type: 'bar',
                    width: 3,
                    display: true,
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

        it('should be shown/hidden by the "display" property', function() {
            this.element.set({
                display: false
            });
            this.element.observations[0].set({
                test04: []
            });
            this.element.dimensions[0].set({
                test04: {}
            });
            this.element.loaded = 2;
            this.view.render();

            expect(this.view.el).toBeMatchedBy('.hide');
            expect(this.view.el).toBeEmpty();

            this.element.set({
                display: true
            });
            this.view.render();

            expect(this.view.el).not.toBeMatchedBy('.hide');
            expect(this.view.el).not.toBeEmpty();
        });

        it('should render correctly', function() {
            this.element.observations[0].set({
                test04: []
            });
            this.element.dimensions[0].set({
                test04: {}
            });
            this.element.loaded = 2;
            this.view.render();

            expect(this.view.el).toBeMatchedBy('.element.barElement.span9');
        });

    });

});
