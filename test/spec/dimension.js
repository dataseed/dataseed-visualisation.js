describe('A dimension model', function() {

    it('should construct API URLs correctly', function(done) {
        require(['models/dataset', 'models/element/dimension'], function(Dataset, Dimension) {
            var dataset = new Dataset({
                    'id': 'test01',
                    'visualisation_id': 'test02'
                }),
                dimension = new Dimension({
                    'id': 'test03',
                    'dataset': dataset
                });
            expect(dimension.url()).toBe('/api/datasets/test01/dimensions/test03?');
            done();
        });
    });

});
