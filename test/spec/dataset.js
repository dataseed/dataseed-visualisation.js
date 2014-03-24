describe('A dataset model', function() {

    it('should construct API URLs correctly', function(done) {
        require(['models/dataset'], function(Dataset) {
            var dataset = new Dataset({
                    id: 'test01',
                    visualisation_id: 'test02'
                });
            expect(dataset.url()).toBe('/api/datasets/test01');
            done();
        });
    });

    it('should return the correct cut', function(done) {
        require(['models/dataset'], function(Dataset) {
            var cut = {
                    test04: 'test05',
                    test05: '6'
                },
                dataset = new Dataset({
                    id: 'test02',
                    visualisation_id: 'test03',
                    cut: cut
                });

            // Check entire cut
            expect(dataset.getCut()).toBe(cut);

            // Check cut on each dimension
            for (var key in cut) {
                expect(dataset.getCut(key)).toBe(cut[key]);
            }
            done();
        });
    });

    it('should return the correct cut status', function(done) {
        require(['models/dataset'], function(Dataset) {
            var dataset = new Dataset({
                    id: 'test07',
                    visualisation_id: 'test08',
                    cut: {
                        test09: 'test10'
                    }
                });
            expect(dataset.isCut('test09')).toEqual(true);
            expect(dataset.isCut('test99')).toEqual(false);
            done();
        });
    });

    it('should correctly check for a specific cut ID', function(done) {
        require(['models/dataset'], function(Dataset) {
            var dataset = new Dataset({
                    id: 'test11',
                    visualisation_id: 'test12',
                    cut: {
                        test13: 'test14'
                    }
                });
            expect(dataset.hasCutId('test13', 'test14')).toEqual(true);
            expect(dataset.hasCutId('test13', 'test04')).toEqual(false);
            expect(dataset.hasCutId('test03', 'test04')).toEqual(false);
            done();
        });
    });

});
