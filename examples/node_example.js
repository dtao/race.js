global.Race     = require('../race.js');
var stringTable = require('string-table');

require('./examples.js');

function lineBreak() {
  console.log('');
}

function mapResultsToObjects(results) {
  var objects = [];

  for (var i = 0; i < results.length; ++i) {
    (function(resultGroup) {
      var object = { input: resultGroup.input.name };

      for (var implName in resultGroup.results) {
        object[implName] = resultGroup.results[implName];
      }

      objects.push(object);

    }(results[i]));
  }

  return objects;
}

var race = startExample({
  result: function(result) {
  },

  group: function(resultGroup) {
    console.log('  * Finished running tests for "' + resultGroup.input.name + '"');
  },

  complete: function(results) {
    lineBreak();
    console.log('----- RESULTS -----');
    lineBreak();

    console.log(stringTable.create(mapResultsToObjects(results), {
      capitalizeHeaders: true
    }));

    lineBreak();
  }
});

lineBreak();
console.log('Just started race: "' + race.description + '"');
