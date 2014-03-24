var system = require('system');

/**
* Wait until the test condition is true or a timeout occurs. Useful for waiting
* on a server response or for a ui change (fadeIn, etc.) to occur.
*
* @param testFx javascript condition that evaluates to a boolean,
* it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
* as a callback function.
* @param onReady what to do when testFx condition is fulfilled,
* it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
* as a callback function.
* @param timeOutMillis the max amount of time to wait. If not specified, 3 sec is used.
*/
function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3001, //< Default Max Timeout is 3s
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(function() {
            if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if(!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    console.log("'waitFor()' timeout");
                    phantom.exit(1);
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                    typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            }
        }, 100); //< repeat check every 100ms
};


if (system.args.length !== 2) {
    console.log('Usage: run-jasmine.js URL');
    phantom.exit(1);
}

var page = require('webpage').create();

// Route "console.log()" calls from within the Page context to the main Phantom context (i.e. current "this")
page.onConsoleMessage = function(msg) {
    console.log(msg);
};

page.open(system.args[1], function(status){
    if (status !== "success") {
        console.log("Unable to access network");
        phantom.exit();
    } else {
        waitFor(function(){
            return page.evaluate(function(){
                // If no .symbolSummary or pending is present then, we are not finished loading
                return document.body.querySelector('.symbolSummary .pending') === null
            });
        }, function(){
            var exitCode = page.evaluate(function(){
                console.log('');

                // Load jasmine version info
                var banner = document.body.querySelector('div.banner > span.title').innerText;
                banner += " " + document.body.querySelector('div.banner > span.version').innerText;
                banner += " " + document.body.querySelector('div.banner > span.duration').innerText;
                console.log(banner);
                console.log("");
                console.log("Test Summary");

                // Load passing tests
                var testSummary = document.body.querySelectorAll('ul.symbol-summary > li');
                var testSummaryOut = "";

                var alert = true;

                for(var i = 0; i < testSummary.length; i ++)
                {
                  if(testSummary[i].classList.contains('passed'))
                  {
                    testSummaryOut += ".";
                  }
                  else
                  {
                    testSummaryOut += "x";
                    alert = false;
                  }
                }
                console.log(testSummaryOut);

                // If alert is true, then we passed
                if(alert)
                {
                  console.log("----------------------------------------------------------------------");

                  // Get bar passed
                  console.log("Describe: " + document.body.querySelector("div.html-reporter > div.alert > span.passed").innerText);
                  console.log("----------------------------------------------------------------------");

                  // Get results
                  var specDetails = document.body.querySelectorAll('div.results > div.summary > ul');

                  // Print each fail
                  for(var i = 0; i < specDetails.length; i ++)
                  {
                    console.log('Test ' + i);

                    // Print what the fail is
                    console.log("Describe : " + specDetails[i].querySelector('li.suite-detail').innerText);
                    console.log("");

                    // Print out specs
                    var specs = specDetails[i].querySelectorAll('ul.specs');
                    for(var j = 0; j < specs.length; j++)
                    {
                      console.log(" it: " + specs[j].innerText);
                    }
                  }
                }
                else
                {
                  // We failed
                  console.log("----------------------------------------------------------------------");

                  // Get bar failed
                  console.log(document.body.querySelector("div.html-reporter > div.alert > span.failed").innerText);
                  console.log("----------------------------------------------------------------------");
                  console.log(document.body.querySelector("div.html-reporter > div.alert > span.failure-list").innerText);

                  // Get results
                  var specDetails = document.body.querySelectorAll('div.results > div.failures > div.spec-detail');

                  // Print each fail
                  for(var i = 0; i < specDetails.length; i ++)
                  {
                    console.log('Failed test: ' + i);

                    // Print what the fail is
                    console.log(specDetails[i].querySelector('div.description').innerText);
                    console.log("");

                    // Print error
                    console.log("Reference Error:");
                    console.log(specDetails[i].querySelector('div.messages > div.result-message').innerText);

                    console.log("");
                    console.log("Stack-trace:");
                    console.log(specDetails[i].querySelector('div.messages > div.stack-trace').innerText);
                  }
                }
            });
            phantom.exit(exitCode);
        });
    }
});
