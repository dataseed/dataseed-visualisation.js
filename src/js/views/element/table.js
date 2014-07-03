define(['backbone', 'underscore', '../../lib/format', 'text!../../templates/element/table.html'],
    function(Backbone, _, format, tableTemplate) {
    'use strict';

    var TableChartView = Backbone.View.extend({

        events: {
            'click .table-row a': 'featureClick',
            'click .table-sort': 'sortSelect',
            'keyup input': 'search',
            'click .search-reset': 'searchReset'
        },

        template: _.template(tableTemplate),

        sortProperty: 'total',
        sortDirection: -1,

        // Chart constants
        margin: 25,
        rowHeight: 29,
        maxHeight: 400,
        fixedHeadHeight: 80,

        searchFailMsg: '<p class="no-result">Sorry no items matched your search, please try broadening your search terms.</p>',

        render: function() {
            var attrs = _.extend({
                values: this.getTableValues(),
                dimension: this.model.get('dimensions')[0],
                cut: this.model.getCut(),
                sortProperty: this.sortProperty,
                sortDirection: this.sortDirection,
                dataset : this.model.dataset
            }, this.model.attributes);

            // Render template
            this.$el.html(this.template(attrs));

            // Set styles (including cut highlighting)
            this.resetFeatures();

            // Calculate the table height
            if (!this.height) {
                this.height = (attrs.values.length * this.rowHeight) + this.margin;
                // Calculate table data height
                var currentHeight = Math.min(this.height, this.maxHeight);
                this.tableDataHeight = currentHeight - this.fixedHeadHeight;
            }

            // Set table data height
            this.$('.scroll').css('max-height', this.tableDataHeight);
            this.$('.table-data-label').width(this.$('.table-chevron-left').width());

            return this;
        },

        getTableValues: function() {
            var values = _.chain(this.model.getObservations())
                //._map transforms an array to another array
                //value parameter is the value of the chained getObservation
                .map(function(value, index) {
                    //_.extend used to add more objects to the value object
                    return {
                        index: index,
                        id: value.id,
                        total: value.total,
                        totalFormat: format.num(value.total),
                        label: this.model.getLabel(value).label
                    };
                }, this)
                //sort the object by the current sorting property
                .sortBy(this.sortProperty)
                //value() to return the value only and not the wrapped methods in _.chain()
                .value();

            if (this.sortDirection === -1) {
                values.reverse();
            }

            return values;
        },

        featureClick: function(e) {
            e.preventDefault();
            var index = $(e.currentTarget).parents('tr').data('index');
            if (this.model.featureClick(index)) {
                this.resetFeatures();
            }
        },

        sortSelect: function(e) {
            e.preventDefault();
            var $sort = $(e.currentTarget);

            //if the same th sort header is selected then change the direction, else switch the th
            if ($sort.data('sort-property') === this.sortProperty) {
                this.sortDirection *= -1;
            } else {
                this.sortProperty = $sort.data('sort-property');
            }

            this.render();
            return;
        },

        resetFeatures: function() {
            // Get the colours from the model
            var featureFill = this.model.visualisation.styles.getStyle('featureFill', this.model),
                backgroundColour = this.model.visualisation.styles.getStyle('background', this.model),
                headingColour = this.model.visualisation.styles.getStyle('heading', this.model),
                featureFillActive = this.model.visualisation.styles.getStyle('featureFillActive', this.model);

            // Generic styles
            this.$('h2').css('color', headingColour);
            this.$el.parent().css('background-color', backgroundColour);

            // Styles to apply if the table's dimension is not included in the
            // current cut.
            this.$('.table-row a').css('color', featureFill);

            // Styles to apply if the table's dimension is included in the
            // current cut.
            this.$('.table.cut .table-row a').css('color', featureFillActive);
            this.$('.table.cut .table-row.cut-active a').css('color', featureFill);
        },

        // Calls the wordSearch function and controls the view display
        search: _.debounce(function() {
            this.$(".search-reset").css("visibility", (this.$(".table-search").val()) ? "visible" : "hidden");

            var queryString = '';
            var textValue = this.$(".table-search").val().toLowerCase();

            this.$('.no-result').remove();
            this.$('.found').remove();
            this.$('tr').hide();

            // Get tokenized search terms and then create one long jquery attribute selector string.
            // Escape special characters and remove double quotes.
            queryString = _.map(this.tokenizer(textValue), function(token) {
                return '[data-content*=' + token.replace(/[!#$%&'()*+,./:;<=>?@\[\\\]^`{|}~]/g, "\\$&") + ']';
            }).join();

            // If invalid search term throw search fail message
            try {
                // If query has been found or query is empty display results. Otherwise show not found message.
                if(this.$('tr').is(queryString) || !queryString.length) {
                    this.$('tr.sort').show();
                    this.$('tr'+queryString).show();

                    // Show found message only if something is actually searched.
                    if(queryString.length) {
                        this.$('.table-search-wrap').append('<p class="found">Found <strong>' + this.$('tr'+queryString+':visible').length + '</strong> items containing \"<strong>' + textValue + '</strong>\"</p>');
                    }
                }
                else {
                    this.$el.append(this.searchFailMsg);
                }
            }
            catch (error) {
                this.$el.append(this.searchFailMsg);
            }
        }, 500),

        searchReset: function() {
            this.$(".table-search").val('');
            this.search();
        },


        /*
         * Search-text-tokenizer is a text tokenizer for Google-like search query supporting double quoted phrase.
         * https://github.com/tatsuyaoiw/search-text-tokenizer
        */
        tokenizer: function(str) {
            // trim spaces
            str = str.replace(/^\s+|\s+$/g, '');

            // retun if string is empty
            if (!str) {return str;}

            // split by spaces
            var terms = str.split(/\s/),
                i = 0,
                result = [];

            while (terms[i]) {
                var current = terms[i];

                // phrase if double quoted
                if (current[0] === '"') {

                    // iterate by the end of quotations
                    var j = i + 1;
                    while (terms[j]) {
                        var next = terms[j];
                        current += ' ' + next;

                        if (next.slice(-1) === '"') {
                            terms.splice(j, 1);
                            break;
                        } else {
                            terms.splice(j, 1);
                        }
                    }
                }

                result.push(current);

                i++;
            }

            return result;
        }

    });

    return TableChartView;

});
