define(['jquery', 'models/dataset', 'models/dataset/connection', 'models/visualisation/element/dimensionalElement', 'views/element/d3/dc/line'],
    function($, Dataset, Connection, DimensionalElement, LineChartView) {
    /* global describe, beforeEach, expect, it */

    describe('A line chart view', function() {

        beforeEach(function() {
            Connection.prototype.fetch = function() {};

            this.$el = $('<div style="width: 800px; height: 600px;"/>');

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
                    type: 'line',
                    width: 3,
                    dimensions: [{
                        field: {
                            id: 'test04'
                        }
                    }],
                    measure: {
                        id: 'test05'
                    },
                    label: 'Test Line Chart'
                });

            this.view = new LineChartView({
                    parent: this.$el,
                    model: this.element,
                    visualisation: this.dataset.visualisation
                });
        });

        it('should not render without data', function() {
            this.element._getConnection('observations').set({
                test04: []
            }, {
                silent: true
            });
            this.element._getConnection('dimensions').set({
                test04: {}
            }, {
                silent: true
            });
            this.element._connections.observations.loaded = 1;
            this.element._connections.dimensions.loaded = 1;
            this.view.render();

            expect(this.view.el).not.toContainElement('svg');
        });

        it('should render lines and points correctly', function(done) {
            this.element._getConnection('observations').set({
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
            }, {
                silent: true
            });
            this.element._getConnection('dimensions').set({
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
            }, {
                silent: true
            });
            this.element._connections.observations.loaded = 1;
            this.element._connections.dimensions.loaded = 1;
            this.view.render();

            expect(this.view.el).toContainElement('svg');
            expect(this.view.el).toContainElement('g.axis.x');
            expect(this.view.el).toContainElement('g.axis.y');
            expect(this.view.el).toContainElement('path.line');
            expect(this.view.el).toContainElement('circle');

            expect(this.view.$el.find('path.line').length).toEqual(1);
            expect(this.view.$el.find('circle').length).toEqual(2);

            expect(this.view.el).toContainText('Test Line Chart');
            expect(this.view.el).toContainText('Test Label 01');
            expect(this.view.el).toContainText('Test Label 02');

            // Performance tests
            if (!window.__telemetry__) {
                done();
                return;
            }

            window.__telemetry__(function(results) {
                expect(results.load_time_ms).toBeLessThan(1000);
                expect(results.dom_content_loaded_time_ms).toBeLessThan(1000);
                expect(results.first_paint).toBeLessThan(1000);
                done();
            });
        });

    });
});
