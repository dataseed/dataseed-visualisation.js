# Dataseed Visualisation

Dataseed is an open platform for data visualisation, exploration and analysis. For more information and a live demo see [http://getdataseed.com](http://getdataseed.com).

This open-source toolkit allows you to create custom visualisations driven by our back-end. Dataseed's back-end supports large datasets, real-time data streams, on-the-fly aggregation (OLAP), and statistical operations.  You can import data via a RESTful API, or by uploading spreadsheets through the UI.

We are currently in beta, so please [sign-up](http://getdataseed.com#find-out-more) to be notified when we're accepting new users, or [send us an email](mailto:team@getdataseed.com) if you'd like to discuss a project.


## Features

* Cloud-hosted data storage and OLAP analytics engine
* RESTful JSON API for importing and querying data
* Open-source javascript front-end, built with backbone.js, grunt.js, bower, bootstrap - all the good stuff
* SVG charts built with d3.js
* Responsive and ready for desktop / tablet / mobile
* Versatile multi-dimensional data model
* Linked-data approach. Compatible with Datacube and SDMX
* Support for real-time data streams
* Statistical operations including mean, min, max, variance, sum of squares and standard deviation


## Getting Started

1. ```git clone git@github.com:dataseed/dataseed-visualisation.git```
2. Load index.html in a browser

You will see a visualisation of an example dataset. If you've already create a dataset, then just change the line in index.html:

```new DataSetEmbedView({'id': '<your dataset id>'});```


## Installation

A build process is provided that will compile and minify the JS and LESS in /src into a single .js and .css file in /dist.

### Requirements

* NodeJS
* NPM

### Process

1. ```git clone git@github.com:dataseed/dataseed-visualisation.git```
2. ```cd dataseed-visualisation```
3. ```npm install```
4. ```bower install```
5. ```grunt build```


## Developer API

An API is available for Dataseed that allows querying and importing of datasets. Documentation can be found at [getdataseed.com/documentation](http://getdataseed.com/documentation).
