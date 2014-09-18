define(['models/dataset'], function(Dataset) {
    /* global describe, beforeEach, expect, it */

    describe('A dataset model', function() {

        it('should construct API URLs correctly', function() {
            var dataset = new Dataset({
                    id: 'test01',
                    visualisation_id: 'test02'
                });
            expect(dataset.url()).toBe('/api/datasets/test01');
        });

        it('should return the correct cut', function() {
            var cut = {
                    test04:['test05'],
                    test05: [6, 7]
                },
                dataset = new Dataset({
                    id: 'test02',
                    visualisation_id: 'test03',
                    cut: cut
                });

            // Check entire cut
            expect(dataset.getCut()).toEqual({
                test04: ['test05'],
                test05: [6, 7]
            });

            // Check cut on each dimension
            for (var key in cut) {
                expect(dataset.getCut(key)).toEqual(cut[key]);
            }
        });

        it('should return the correct cut status', function() {
            var dataset = new Dataset({
                    id: 'test07',
                    visualisation_id: 'test08',
                    cut: {
                        test09: ['test10']
                    }
                });
            expect(dataset.isCut('test09')).toEqual(true);
            expect(dataset.isCut('test99')).toEqual(false);
        });

        it('should correctly check for a specific cut ID', function() {
            var dataset = new Dataset({
                    id: 'test11',
                    visualisation_id: 'test12',
                    cut: {
                        test13: ['test14']
                    }
                });
            expect(dataset.hasCutId('test13', 'test14')).toEqual(true);
            expect(dataset.hasCutId('test13', 'test04')).toEqual(false);
            expect(dataset.hasCutId('test03', 'test04')).toEqual(false);
        });

    });

});
