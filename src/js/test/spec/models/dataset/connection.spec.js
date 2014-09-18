require(['models/dataset', 'models/dataset/connection', 'models/dataset/dimensionalConnection'],
    function(Dataset, Connection, DimensionalConnection) {
    /* global describe, beforeEach, expect, it */

    describe('A connection model', function() {

        beforeEach(function() {
            // Create a new dataset model
            this.dataset = new Dataset({
                    id: 'test01',
                    visualisation_id: 'test02'
                });

            // Don't make HTTP requests
            Connection.prototype.fetch = function() {};
            DimensionalConnection.prototype.fetch = function() {};
        });

        it('should construct API URLs for dimensions', function() {
            var conn = new DimensionalConnection({
                dataset: this.dataset,
                type: 'dimensions',
                dimension: 'test03',
                measure: 'test04',
                aggregation: 'sum'
            });
            expect(conn.url()).toEqual('/api/datasets/test01/dimensions/test03?aggregation=sum&measure=test04');
        });

        it('should construct API URLs for dimensions with a cut', function() {
            var conn = new DimensionalConnection({
                    dataset: this.dataset,
                    type: 'dimensions',
                    dimension: 'test04',
                    measure: 'test05',
                    aggregation: 'sum',
                    cut: {
                        test06: 'test07'
                    }
                });
            expect(conn.url()).toEqual('/api/datasets/test01/dimensions/test04?test06=test07&aggregation=sum&measure=test05');
        });

        it('should construct API URLs for observations', function() {
            var conn = new DimensionalConnection({
                    dataset: this.dataset,
                    type: 'observations',
                    dimension: 'test08',
                    measure: 'test09',
                    aggregation: 'sum'
                });
            expect(conn.url()).toEqual('/api/datasets/test01/observations/test08?aggregation=sum&measure=test09');

             // TODO move in observations test
            conn = new Connection({
                dataset: this.dataset,
                type: 'observations',
                measure: 'test09',
                aggregation: 'sum'
            });
            expect(conn.url()).toEqual('/api/datasets/test01/observations/?aggregation=sum&measure=test09');
        });

        it('should construct API URLs for observations with a cut', function() {
            var conn = new DimensionalConnection({
                    dataset: this.dataset,
                    type: 'dimensions',
                    dimension: 'test10',
                    measure: 'test11',
                    aggregation: 'sum',
                    cut: {
                        test12: 'test13'
                    }
                });
            expect(conn.url()).toEqual('/api/datasets/test01/dimensions/test10?test12=test13&aggregation=sum&measure=test11');

            // TODO move in observations test
            conn = new Connection({
                dataset: this.dataset,
                type: 'observations',
                measure: 'test11',
                aggregation: 'sum',
                cut: {
                    test12: 'test13'
                }
            });
            expect(conn.url()).toEqual('/api/datasets/test01/observations/?test12=test13&aggregation=sum&measure=test11');
        });

        it('should return dimension values', function() {
            var data = {
                    id01: {
                        id: 'id01',
                        label: 'Test Label 01'
                    },
                    id02: {
                        id: 'id02',
                        label: 'Test Label 02'
                    }
                },
                conn = new DimensionalConnection({
                    dataset: this.dataset,
                    type: 'dimensions',
                    dimension: 'test14',
                    measure: 'test15',
                    aggregation: 'sum',
                    test14: data
                });
            for (var key in data) {
                expect(conn.getValue(key)).toBe(data[key]);
            }
        });

        it('should return observations', function() {
            var data = [
                    {
                        id: 'id01',
                        total: 23483
                    },
                    {
                        id: 'id02',
                        total: 8394.3204
                    }
                ],
                conn = new DimensionalConnection({
                    dataset: this.dataset,
                    type: 'dimensions',
                    dimension: 'test16',
                    measure: 'test17',
                    aggregation: 'sum',
                    test16: data
                });
            for (var i = 0; i < data.length; i++) {
                expect(conn.getValue(i)).toBe(data[i]);
            }
        });

    });

});
