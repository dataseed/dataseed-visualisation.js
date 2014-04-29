define(['jquery', 'models/dataset', 'models/visualisation/element', 'views/element/d3/bar'], function($, Dataset, Element, BarChartView) {

    describe('A bar chart view', function() {

        beforeEach(function() {
            this.$el = $('<div style="width: 800px; height: 600px;"/>');

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
                    label: 'Test Bar Chart'
                });

            this.view = new BarChartView({
                    parent: this.$el,
                    model: this.element,
                    visualisation: this.dataset.visualisation
                });
        });

        it('should not render without data', function() {
            this.element.observations[0].set({
                test04: []
            });
            this.element.dimensions[0].set({
                test04: {}
            });
            this.view.render();

            expect(this.view.el).not.toContainElement('rect');
            expect(this.view.el).not.toContainElement('text.chartLabel');
            expect(this.view.el).not.toContainElement('text.scaleLabel');
        });

        it('should render bars and labels correctly', function() {
            this.element.observations[0].set({
                test04: [
                    {
                        id: 'id01',
                        total: 1234
                    },
                    {
                        id: 'id02',
                        total: 5678
                    }
                ]
            });
            this.element.dimensions[0].set({
                test04: {
                    id01: {
                        id: 'id01',
                        label: 'Test Label 01'
                    },
                    id02: {
                        id: 'id02',
                        label: 'Test Label 02'
                    }
                }
            });
            this.view.render();

            expect(this.view.el).toContainElement('rect');
            expect(this.view.el).toContainElement('text.chartLabel');
            expect(this.view.el).toContainElement('text.scaleLabel');

            expect(this.view.$el.find('rect').length).toEqual(2);
            expect(this.view.$el.find('text.chartLabel').length).toEqual(2);

            expect(this.view.el).toContainText('Test Label 01');
            expect(this.view.el).toContainText('Test Label 02');
        });

    });

});
