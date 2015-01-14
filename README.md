# Dataseed Visualisation

[![Build Status](https://travis-ci.org/dataseed/dataseed-visualisation.svg)](https://travis-ci.org/dataseed/dataseed-visualisation)

Dataseed is an open platform for data visualisation, exploration and analysis. For more information and a live demo see [https://getdataseed.com](https://getdataseed.com).

This open-source toolkit allows you to create custom visualisations driven by our back-end. Dataseed's back-end supports large datasets, real-time data streams, on-the-fly aggregation (OLAP), and statistical operations.  You can import data via a RESTful API, or by uploading spreadsheets through the UI.

We are currently in beta, so please [sign-up](https://getdataseed.com#get-invited) to be notified when we're accepting new users, or [send us an email](mailto:team@getdataseed.com) if you'd like to discuss a project.


## Features

* Powerful cloud-hosted OLAP analytics engine
* Support for real-time data streams
* RESTful JSON API for importing and querying data
* Open-source javascript front-end, built with backbone.js, gulp, bootstrap - all the good stuff
* SVG charts build with d3.js and dc.js
* Versatile multi-dimensional data model
* Statistical operations including mean, min, max, variance, sum of squares and standard deviation
* Responsive and ready for desktop / tablet / mobile
* Paid support plans, custom development, training, and consultancy are available - just ask

## Getting Started

1. ```git clone git@github.com:dataseed/dataseed-visualisation.git```
2. Load index.html in a browser

You will see a visualisation of an example dataset. If you've already create a dataset, then just change the line in index.html:

```new DataSetEmbedView({'id': '<your dataset id>'});```


## Installation

A build process is provided that will compile and minify the JS and LESS in /src into a single .js and .css file in /dist, as well as run jasmine tests.

### Requirements

* NodeJS
* NPM

### Process

1. ```git clone git@github.com:dataseed/dataseed-visualisation.git```
2. ```cd dataseed-visualisation```
3. ```npm install```
4. ```npm install -g bower gulp```
5. ```bower install```
6. ```gulp serve```
7. Load in a browser: [http://localhost:8080](http://localhost:8080)

This will serve the [index.html](https://github.com/dataseed/dataseed-visualisation/blob/master/index.html) file which includes the compiled css and js from [/dist](https://github.com/dataseed/dataseed-visualisation/tree/master/dist) and loads the demo "mortality" visualisation.

You should only modify the js and less within the [/src](https://github.com/dataseed/dataseed-visualisation/tree/master/src) directory, after which you will need to run the build process with: ```gulp```

To see your changes immediately you can serve up the [index-src.html](https://github.com/dataseed/dataseed-visualisation/blob/master/index-src.html) file which includes the uncompiled js and less from [/src](https://github.com/dataseed/dataseed-visualisation/tree/master/src).

Load in a browser: [http://localhost:8080/index-src.html](http://localhost:8080/index-src.html)


## Developer API

An API is available for Dataseed that allows querying and importing of datasets. Documentation can be found at [getdataseed.com/documentation](https://getdataseed.com/documentation).
