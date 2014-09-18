define(['jquery', 'models/dataset', 'models/dataset/connection', 'models/visualisation/element/dimensions', 'views/element/filter/navigation'],
    function($, Dataset, Connection, DimensionsElement, NavigationElementView) {
    /* global describe, beforeEach, expect, it */

    describe('A navigation element view', function() {

        beforeEach(function() {
            Connection.prototype.fetch = function() {};

            this.$el = $('<div style="width: 800px; height: 600px;"/>');

            this.dataset = new Dataset({
                    id: 'test01',
                    visualisation_id: 'test02',
                    fields: [
                        {id: 'test04', type: 'string', label: 'Test Field 04'},
                        {id: 'test05', type: 'date', label: 'Test Field 05'},
                        {id: 'test06', type: 'integer'}
                    ]
                });
            this.dataset.reset();

            this.element = new DimensionsElement({
                    id: 'test03',
                    dataset: this.dataset,
                    visualisation: this.dataset.visualisation,
                    type: 'navigation',
                    width: 3,
                    display: true,
                    dimensions: [{
                        field: {
                            id: 'test04'
                        }
                    }, {
                        field: {
                            id: 'test05'
                        }
                    }],
                    measure: {
                        id: 'test06'
                    },
                    label: 'Test Filter'
                });

            this.view = new NavigationElementView({
                    parent: this.$el,
                    model: this.element,
                    visualisation: this.dataset.visualisation
                });
        });

        it('should not render without data', function() {
            this.view.render();
            expect(this.view.el).not.toContainElement('tr, th, td');
        });

        it('should render correctly', function() {
            // Test data
            var test04_observations = [
                    {
                        id: 'id01',
                        total: 5
                    },
                    {
                        id: 'id02',
                        total: 10
                    }
                ],
                test04_dimensions = {
                    id01: {
                        id: 'id01',
                        label: 'Filter Test Label 01'
                    },
                    id02: {
                        id: 'id02',
                        label: 'Filter Test Label 02'
                    }
                },
                test05_observations = [
                    {
                        id: -9642536702000,
                        total: 16
                    },
                    {
                        id: 1371600000000,
                        total: 8
                    },
                    {
                        id: 2146889166000,
                        total: 4
                    },
                    {
                        id: 218342653261000,
                        total: 2
                    }
                ];

            // Tests
            var tests = [
                {
                    field: 'test04',
                    label: 'Test Field 04',
                    expected: [
                        {
                            label: 'Filter Test Label 02',
                            total: 10
                        },
                        {
                            label: 'Filter Test Label 01',
                            total: 5
                        }
                    ]
                },
                {
                    field: 'test05',
                    label: 'Test Field 05',

                    // Note: We only check for the right year in the label as the other
                    // parts of the formatted dates are browser and locale specific
                    expected: [
                        {
                            label: '1664',
                            total: 16
                        },
                        {
                            label: '2013',
                            total: 8
                        },
                        {
                            label: '2038',
                            total: 4
                        },
                        {
                            label: '8889',
                            total: 2
                        }
                    ]
                }
            ];

            // Setup "fixtures"
            this.element._getConnection('observations', 'test04').set(
                {test04: test04_observations}, {silent: true}
            );
            this.element._getConnection('dimensions', 'test04').set(
                {test04: test04_dimensions}, {silent: true}
            );
            this.element._getConnection('observations', 'test05').set(
                {test05: test05_observations}, {silent: true}
            );
            this.element._connections.observations.loaded = 2;
            this.element._connections.dimensions.loaded = 1;

            // Render
            this.view.render();

            // Check element title
            expect(this.view.el).toContainElement("h2:contains('Test Filter')");

            // Dimensions' tests
            for (var i = 0; i < tests.length; i++) {

                // Get dimension <div>
                var $dimension = this.view.$("div.filter-group[data-dimension='" + tests[i].field + "']");
                expect($dimension.get(0)).toBeDefined();

                // Check dimension label
                expect($dimension.get(0)).toContainText(tests[i].label);

                // Check dimension members
                for (var j = 0; j < tests[i].expected.length; j++) {

                    // Get dimension member <tr>
                    var member = $dimension.find('tr:eq(' + j + ')').get(0);
                    expect(member).toBeDefined();

                    // Check label
                    expect(member).toContainText(tests[i].expected[j].label);

                    // Check value
                    expect($(member).find('td.cut-totals')).toContainText(tests[i].expected[j].total);
                }
            }

        });

    });
});
