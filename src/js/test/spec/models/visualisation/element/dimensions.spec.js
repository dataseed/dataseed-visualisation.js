define(['models/dataset', 'models/dataset/connection', 'models/visualisation/element/dimensionalElement'],
    function(Dataset, Connection, DimensionalElement) {
    /* global describe, beforeEach, expect, it, spyOn */

    describe('A dimensions element model', function() {

        beforeEach(function() {
            // Create a new dataset model
            this.dataset = new Dataset({
                    id: 'test01',
                    visualisation_id: 'test02',
                    fields: [
                        {id: 'test04', type: 'string'},
                        {id: 'test05', type: 'integer'}
                    ]
                });
            this.dataset.reset();

            // Don't make HTTP requests
            Connection.prototype.fetch = function() {};
        });

        it('should construct API URLs correctly', function() {
            var element = new DimensionalElement({
                    id: 'test03',
                    dataset: this.dataset,
                    visualisation: this.dataset.visualisation
                });
            expect(element.url()).toBe('/api/datasets/test01/visualisations/test02/elements/test03');
        });

        it('should (re-)initialise connections correctly', function (){
            var element = new DimensionalElement({
                id: 'test03',
                dataset: this.dataset,
                visualisation: this.dataset.visualisation,
                measure: null,
                aggregation: 'rows',
                dimensions: [
                    {
                        field: {
                            id: 'test04',
                            type: 'string'
                        }
                    }
                ]
            });

            expect(element._connections['observations'].num).toBe(1);
            expect(element._connections['observations'].pool.test04.url()).toBe("/api/datasets/test01/observations/test04?aggregation=rows");

            expect(element._connections['dimensions'].num).toBe(1);
            expect(element._connections['dimensions'].pool.test04.url()).toBe("/api/datasets/test01/dimensions/test04?aggregation=rows");

            // Change measure and aggregation
            element.set("measure", {id: "test05"});
            element.set("aggregation", "sum");

            // re-initialise connections
            element.resetConnections();

            // We should still have only one observations connection and one
            // dimensions connection (connections have to be replaced)
            expect(element._connections['observations'].num).toBe(1);
            expect(element._connections['dimensions'].num).toBe(1);

            // Assert the connection URLs are correct
            expect(element._connections['observations'].pool.test04.url()).toBe("/api/datasets/test01/observations/test04?aggregation=sum&measure=test05");
            expect(element._connections['dimensions'].pool.test04.url()).toBe("/api/datasets/test01/dimensions/test04?aggregation=sum&measure=test05");
        });

        it('should return the correct measure label', function() {
            var element = new DimensionalElement({
                    id: 'test03',
                    dataset: this.dataset,
                    visualisation: this.dataset.visualisation,
                    measure_label: 'Test Label'
                });
            expect(element.getMeasureLabel()).toBe('Test Label');
        });

        it('should add a cut correctly', function() {
            var element = new DimensionalElement({
                    id: 'test03',
                    dataset: this.dataset,
                    visualisation: this.dataset.visualisation,
                    dimensions: [{
                        field: {
                            id: 'test04'
                        }
                    }],
                    measure: {
                        id: 'test05'
                    }
                });

            spyOn(this.dataset, 'addCut');
            this.dataset.visualisation.addElement(element);

            element.addCut('val123');
            expect(this.dataset.addCut).toHaveBeenCalledWith({test04: 'val123'});
        });

        it('should update a cut correctly', function() {
            var element = new DimensionalElement({
                    id: 'test03',
                    dataset: this.dataset,
                    visualisation: this.dataset.visualisation,
                    dimensions: [{
                        field: {
                            id: 'test04'
                        }
                    }],
                    measure: {
                        id: 'test05'
                    }
                });

            spyOn(this.dataset, 'addCut');
            this.dataset.visualisation.addElement(element);

            element.addCut('val123');
            expect(this.dataset.addCut).toHaveBeenCalledWith({test04: 'val123'});

            element.addCut('val456');
            expect(this.dataset.addCut).toHaveBeenCalledWith({test04: 'val456'});
        });

        it('should remove a cut correctly', function() {
            var element = new DimensionalElement({
                    id: 'test03',
                    dataset: this.dataset,
                    visualisation: this.dataset.visualisation,
                    dimensions: [{
                        field: {
                            id: 'test04'
                        }
                    }],
                    measure: {
                        id: 'test05'
                    }
                });

            spyOn(this.dataset, 'addCut');
            spyOn(this.dataset, 'removeCut');
            this.dataset.visualisation.addElement(element);

            element.addCut('val123');
            expect(this.dataset.addCut).toHaveBeenCalledWith({test04: 'val123'});

            element.removeCut();
            expect(this.dataset.removeCut).toHaveBeenCalledWith(['test04']);
        });

    });

});
