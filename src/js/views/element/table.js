define(['backbone', 'underscore', 'jquery', '../../lib/format', 'text!../../templates/element/table.html', 'text!../../templates/element/table-search-success.html', 'text!../../templates/element/table-search-fail.html'],
    function(Backbone, _, $, format, tableTemplate, tableSearchSuccessTemplate, tableSearchFailTemplate) {
    'use strict';

    var TableChartView = Backbone.View.extend({

        events: {
            'click tr a': 'featureClick',
            'click .table-sort': 'sortSelect',
            'keyup input': 'searchDebounce',
            'click .search-reset': 'searchReset'
        },

        // Main template
        template: _.template(tableTemplate),

        // Search success/failure templates
        searchSuccessTemplate: _.template(tableSearchSuccessTemplate),
        searchFailTemplate: tableSearchFailTemplate,

        searchQuery: '',
        sortProperty: 'total',
        sortDirection: -1,

        // Chart constants
        margin: 30,
        rowHeight: 29,
        maxHeight: 400,

        render: function() {
            var attrs = _.extend({
                format: format,
                values: _.chain(this.model.getObservations())
                    .map(function(value, index) {
                        return {
                            index: index,
                            id: value.id,
                            total: value.total,
                            totalFormat: format.num(value.total),
                            label: this.model.getLabel(value).label
                        };
                    }, this)
                    .sortBy(this.sortProperty)
                    .value(),
                field: this.model._getField().get('id'),
                cut: this.model.getCut(),
                searchQuery: this.searchQuery,
                sortProperty: this.sortProperty,
                sortDirection: this.sortDirection,
                dataset : this.model.dataset
            }, this.model.attributes);

            // Handle sort direction
            if (this.sortDirection === -1) {
                attrs.values.reverse();
            }

            // Render template
            this.$el.html(this.template(attrs));

            // Set search if we have a query
            if (this.searchQuery.length > 0) {
                this.search();
            }

            // Set styles (including cut highlighting)
            this.resetFeatures();

            // Calculate the table height
            var $scroll = this.$('.scroll');
            if (!this.height) {
                var pos = $scroll.position(),
                    headerHeight = (pos) ? pos.top : 0,
                    contentHeight = attrs.values.length * this.rowHeight;
                this.height = Math.min(headerHeight + contentHeight, this.maxHeight) - this.margin;
                this.tableHeight = (this.height - headerHeight) + this.margin;
            }

            // Set table height
            $scroll.css('max-height', this.tableHeight);

            // Fix table columns
            this.$('.data-table tr > td:first-child').width(this.$('.table-chevron-left').width());

            return this;
        },

        /**
         * Set table styles
         */
        resetFeatures: function() {
            // Generic styles
            var styles = this.model.visualisation.styles;
            this.$('h2').css('color', styles.getStyle('heading', this.model));
            this.$el.parent().css('background-color', styles.getStyle('background', this.model));

            if (this.model.isCut()) {
                // Cut styles
                this.$('.data-table tr a').css('color', styles.getStyle('featureFillActive', this.model));
                this.$('.data-table tr.cut-active a').css('color', styles.getStyle('featureFill', this.model));
            } else {
                // No-cut styles
                this.$('.data-table tr a').css('color', styles.getStyle('featureFill', this.model));
            }
        },

        /**
         * Table row click
         */
        featureClick: function(e) {
            e.preventDefault();
            var id = $(e.currentTarget).parents('tr').data('value').value;
            if (this.model.featureClick({id: id})) {
                this.resetFeatures();
            }
        },

        /**
         * Table column sort
         */
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
        },

        /**
         * Search (at the most every 200ms)
         */
        searchDebounce: _.debounce(function() {
            this.search(this.$('.table-search').val());
        }, 200),

        /**
         * Clear search
         */
        searchReset: function(e) {
            e.preventDefault();
            this.$('.table-search').val('');
            this.search('');
        },

        /**
         * Run a search
         */
        search: function(searchQuery) {
            if (!_.isUndefined(searchQuery)) {
                this.searchQuery = searchQuery;
            }

            // Get tokenized search terms and then create one long jquery attribute selector string.
            // Escape special characters and remove double quotes.
            var tokens = _.map(this.tokenizer(this.searchQuery.toLowerCase()), function(token) {
                    token = token
                        .replace(/^"|"$/g, '')  // Remove leading/trailing quotes
                        .replace(/\\/g, '\\\\') // Escape backslashes
                        .replace(/"/g, '\\"');  // Escape quotes
                    return '[data-content*="' + token + '"]';
                });

            // Remove any messages from previous searches
            this.$('p').remove();

            // Show table header by default
            this.$('.sort').show();

            if (tokens.length > 0) {
                this.$('.search-reset').show();

                // Hide show rows based on search query
                var matches = this.$('.data-table tr')
                    .hide()
                    .filter(tokens.join(''))
                        .show();

                if (matches.length > 0) {
                    // Found one or more results
                    this.$('.table-search-wrap').append(this.searchSuccessTemplate({
                        num: matches.length,
                        input: this.searchQuery
                    }));
                } else {
                    // No results
                    this.$el.append(this.searchFailTemplate);
                    this.$('.sort').hide();
                }

            } else {
                this.$('.search-reset').hide();
                this.$('tr').show();
            }
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
