describe('A connection model', function() {

    it('should construct API URLs correctly', function(done) {
        require(['models/dataset', 'models/dataset/connection'], function(Dataset, Connection) {
            var dataset = new Dataset({
                    'id': 'test01',
                    'visualisation_id': 'test02'
                }),
                conn = new Connection({
                    'type': 'dimensions',
                    'dimension': 'test03',
                    'measure': 'test04',
                    'aggregation': 'sum',
                    'dataset': dataset
                });
            expect(conn.url()).toBe('/api/datasets/test01/dimensions/test03?measure=test04&aggregation=sum');
            done();
        });
    });

});
