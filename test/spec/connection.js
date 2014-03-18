describe('A connection model', function() {

    var dataset;

    beforeEach(function(done) {
        require(['models/dataset'], function(Dataset) {
            dataset = new Dataset({
                    id: 'test01',
                    visualisation_id: 'test02'
                });
            done();
        });
    });

    it('should construct API URLs correctly for dimensions', function(done) {
        require(['models/dataset/connection'], function(Connection) {
            var conn = new Connection({
                    dataset: dataset,
                    type: 'dimensions',
                    dimension: 'test03',
                    measure: 'test04',
                    aggregation: 'sum'
                });
            expect(conn.url()).toEqual('/api/datasets/test01/dimensions/test03?measure=test04&aggregation=sum');
            done();
        });
    });

    it('should construct API URLs correctly for dimensions with a cut', function(done) {
        require(['models/dataset/connection'], function(Connection) {
            var conn = new Connection({
                    dataset: dataset,
                    type: 'dimensions',
                    dimension: 'test04',
                    measure: 'test05',
                    aggregation: 'sum',
                    cut: {
                        test06: 'test07'
                    }
                });
            expect(conn.url()).toEqual('/api/datasets/test01/dimensions/test04?test06=test07&measure=test05&aggregation=sum');
            done();
        });
    });

    it('should construct API URLs correctly for observations', function(done) {
        require(['models/dataset/connection'], function(Connection) {
            var conn = new Connection({
                    dataset: dataset,
                    type: 'observations',
                    dimension: 'test08',
                    measure: 'test09',
                    aggregation: 'sum'
                });
            expect(conn.url()).toEqual('/api/datasets/test01/observations/test08?measure=test09&aggregation=sum');
            done();
        });
    });

    it('should construct API URLs correctly for observations with a cut', function(done) {
        require(['models/dataset/connection'], function(Connection) {
            var conn = new Connection({
                    dataset: dataset,
                    type: 'dimensions',
                    dimension: 'test10',
                    measure: 'test11',
                    aggregation: 'sum',
                    cut: {
                        test12: 'test13'
                    }
                });
            expect(conn.url()).toEqual('/api/datasets/test01/dimensions/test10?test12=test13&measure=test11&aggregation=sum');
            done();
        });
    });

    it('should return dimension values correctly', function(done) {
        require(['models/dataset/connection'], function(Connection) {
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
                conn = new Connection({
                    dataset: dataset,
                    type: 'dimensions',
                    dimension: 'test14',
                    measure: 'test15',
                    aggregation: 'sum',
                    test14: data
                });
            for (var key in data) {
                expect(conn.getValue(key)).toBe(data[key]);
            }
            done();
        });
    });

    it('should return observations correctly', function(done) {
        require(['models/dataset/connection'], function(Connection) {
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
                conn = new Connection({
                    dataset: dataset,
                    type: 'dimensions',
                    dimension: 'test16',
                    measure: 'test17',
                    aggregation: 'sum',
                    test16: data
                });
            for (var i = 0; i < data.length; i++) {
                expect(conn.getValue(i)).toBe(data[i]);
            }
            done();
        });
    });

    it('should sum a total of observations correctly', function(done) {
        require(['models/dataset/connection'], function(Connection) {
            var data = [
                    {
                        id: 'id01',
                        total: 1000
                    },
                    {
                        id: 'id02',
                        total: 999.99
                    },
                    {
                        id: 'id02',
                        total: 0.01
                    }
                ],
                conn = new Connection({
                    dataset: dataset,
                    type: 'dimensions',
                    dimension: 'test18',
                    measure: 'test19',
                    aggregation: 'sum',
                    test18: data
                });
            expect(conn.getTotal()).toBe(2000.0);
            done();
        });
    });

});
