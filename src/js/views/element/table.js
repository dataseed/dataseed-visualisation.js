define(['backbone', 'underscore', 'jquery', '../../lib/format', 'text!../../templates/element/table.html'],
    function(Backbone, _, $, format, tableTemplate) {
    'use strict';

    var TableElementView = Backbone.View.extend({

        className: 'inner-element',

        events: {
            'click td a': 'featureClick',
            'click .table-sort': 'sortSelect',
            'keyup input': 'searchDebounce',
            'click .search-reset': 'searchReset'
        },

        // Main template
        template: _.template(tableTemplate),

        // Search success/failure templates
        searchSuccessTemplate: _.template('<p class="found">Found <strong><%- num %></strong> item<% if (num !== 1) { %>s<% } %> containing "<strong><%- input %></strong>"</p>'),
        searchFailTemplate: '<p class="no-result">Sorry no items matched your search, please try broadening your search terms.</p>',

        searchQuery: '',

        defaultSortProperty: 'total',
        defaultSortDirection: -1,

        scrollPosition: 0,

        render: function() {
            var sortProperty = this.getSortProperty(),
                sortDirection = this.getSortDirection(),
                attrs = _.extend({
                    format: format,
                    cut: this.model.isCut(),
                    values: _.chain(this.model.getObservations())
                        .map(function(value, index) {
                            return {
                                id: value.id,
                                total: value.total,
                                label: this.model.getLabel(value).label,
                                cut: this.model.hasCutId(value.id)
                            };
                        }, this)
                        .sortBy(sortProperty)
                        .value(),
                    searchQuery: this.searchQuery,
                    sortProperty: sortProperty,
                    sortDirection: sortDirection
                }, this.model.attributes);

            // Handle sort direction
            if (sortDirection === -1) {
                attrs.values.reverse();
            }

            // Render template
            this.$el.html(this.template(attrs));

            // Set search if we have a query
            if (this.searchQuery.length > 0) {
                this.search();
            }

            // Set styles (including cut highlighting)
            this.setFeatures();

            // Fix table columns' width
            this.$('.data-table tr > td:first-child').width(this.$('.table-chevron-left').width());

            // Set table height and scroll position
            this.$('.scroll')
                .css('height', this.$el.height() - this.$('.scroll').position().top)
                .scrollTop(this.scrollPosition);

            return this;
        },

        /**
         * Set table styles
         */
        setFeatures: function() {
            // Generic styles
            var styles = this.model.visualisation.styles;
            this.$('h2').css({
                'color': styles.getStyle('heading', this.model),
                'border-color': styles.getStyle('visualisationBackground', this.model)
            });
            this.$('.table th a span').css('color', styles.getStyle('heading', this.model));
            this.$el.css('background-color', styles.getStyle('background', this.model));

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

            // Save the current scroll position of the table
            this.scrollPosition = this.$('.scroll').scrollTop();

            // Get dimension ID and use to set cut on model
            var id = $(e.currentTarget).parents('tr').data('value').value;
            if (this.model.featureClick({id: id})) {
                this.setFeatures();
            }
        },

        /**
         * Get sort property
         */
        getSortProperty: function() {
            if (this.sortProperty) {
                // User
                return this.sortProperty;

            } else if (this.model.getSort()) {
                // Model
                return this.model.getSort();

            }
            // Default
            return this.defaultSortProperty;
        },

        /**
         * Get sort direction
         */
        getSortDirection: function() {
            if (this.sortDirection) {
                // User
                return this.sortDirection;
            } else if (this.model.get('settings').has('sort_direction')) {
                // Model
                return (this.model.get('settings').get('sort_direction') === 'asc') ? 1 : -1;
            }
            // Default
            return this.defaultSortDirection;
        },

        /**
         * Set sort property and direction
         */
        sortSelect: function(e) {
            e.preventDefault();
            var newSortProperty = $(e.currentTarget).data('sort-property');

            // Set default direction if this is the user's first sort
            if (!this.sortDirection) {
                this.sortDirection = this.defaultSortDirection;
            }

            // Set property or toggle direction
            if (newSortProperty === this.sortProperty) {
                this.sortDirection *= -1;
            } else {
                this.sortProperty = newSortProperty;
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
                    this.$('.table-search-wrap').append(this.searchFailTemplate);
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

    return TableElementView;

});
