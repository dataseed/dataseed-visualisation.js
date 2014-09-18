define(['jquery', 'models/dataset', 'models/dataset/connection', 'models/visualisation/element/dimensions', 'views/element/table'],
    function($, Dataset, Connection, DimensionsElement, TableChartView) {
    /* global describe, beforeEach, expect, it */

    describe('A table element view', function() {

        beforeEach(function() {
            Connection.prototype.fetch = function() {};

            this.$el = $('<div style="position: absolute; top: 0; left: 0; width: 800px; height: 600px;"/>');

            this.dataset = new Dataset({
                    id: 'test01',
                    visualisation_id: 'test02',
                    fields: [
                        {id: 'test04', type: 'string'},
                        {id: 'test05', type: 'integer'}
                    ]
                });
            this.dataset.reset();

            this.element = new DimensionsElement({
                    id: 'test03',
                    dataset: this.dataset,
                    visualisation: this.dataset.visualisation,
                    type: 'line',
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
                    measure_label: 'test label',
                    label: 'Test Table Chart'
                });

            this.view = new TableChartView({
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
            this.view.render();

            expect(this.view.el).not.toContainElement('.data-table');
        });

        it('should render rows correctly', function() {
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
            this.view.render();

            expect(this.view.el).toContainElement('table');
            expect(this.view.el).toContainElement('th');
            expect(this.view.el).toContainElement('.data-table tr');

            expect(this.view.$el.find('.data-table tr').length).toEqual(2);

            expect(this.view.el).toContainText('Test Table Chart');
            expect(this.view.el).toContainText('Test Label 01');
            expect(this.view.el).toContainText('Test Label 02');
        });

    });
});
