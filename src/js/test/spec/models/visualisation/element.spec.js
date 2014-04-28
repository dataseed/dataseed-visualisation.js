define(['models/dataset', 'models/dataset/connection', 'models/visualisation/element'], function(Dataset, Connection, Element) {

    describe('An element model', function() {

        beforeEach(function() {
            // Create a new dataset model
            this.dataset = new Dataset({
                    id: 'test01',
                    visualisation_id: 'test02'
                });

            // Don't make HTTP requests
            Connection.prototype.fetch = function() {};
        });

        it('should construct API URLs correctly', function() {
            var element = new Element({
                    id: 'test03',
                    dataset: this.dataset,
                    visualisation: this.dataset.visualisation
                });
            expect(element.url()).toBe('/api/datasets/test01/visualisations/test02/elements/test03');
        });

        it('should return the correct measure label', function() {
            var element = new Element({
                    id: 'test03',
                    dataset: this.dataset,
                    visualisation: this.dataset.visualisation,
                    measure_label: 'Test Label'
                });
            expect(element.getMeasureLabel()).toBe('Test Label');
        });

        it('should add a cut correctly', function() {
            var element = new Element({
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

            spyOn(this.dataset, 'addCut')
            this.dataset.visualisation.addElement(element);

            element.addCut('val123');
            expect(this.dataset.addCut).toHaveBeenCalledWith({test04: 'val123'});
        });

        it('should update a cut correctly', function() {
            var element = new Element({
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

            spyOn(this.dataset, 'addCut')
            this.dataset.visualisation.addElement(element);

            element.addCut('val123');
            expect(this.dataset.addCut).toHaveBeenCalledWith({test04: 'val123'});

            element.addCut('val456');
            expect(this.dataset.addCut).toHaveBeenCalledWith({test04: 'val456'});
        });

        it('should remove a cut correctly', function() {
            var element = new Element({
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

            spyOn(this.dataset, 'addCut')
            spyOn(this.dataset, 'removeCut')
            this.dataset.visualisation.addElement(element);

            element.addCut('val123');
            expect(this.dataset.addCut).toHaveBeenCalledWith({test04: 'val123'});

            element.removeCut();
            expect(this.dataset.removeCut).toHaveBeenCalledWith(['test04']);
        });

    });

});
