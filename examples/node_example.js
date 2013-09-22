global.Race     = require('../race.js');
var stringTable = require('string-table');

require('./examples.js');

function truncate(value) {
  value = String(value);
  if (value.length > 100) {
    value = value.substring(0, 97) + '...';
  }
  return value;
}

function lineBreak() {
  console.log('');
}

function mapOutputMapToObjects(outputMap) {
  var objects = [];

  for (var implName in outputMap) {
    (function(output) {

      objects.push({
        impl: implName,
        label: output.label,
        value: truncate(output.value)
      });

    }(outputMap[implName]));
  }

  return objects;
}

function mapResultsToObjects(results) {
  var objects = [];

  for (var i = 0; i < results.length; ++i) {
    (function(resultGroup) {
      var object = { input: resultGroup.input.name };

      for (var implName in resultGroup.results) {
        object[implName] = resultGroup.results[implName];
      }

      object.winner = resultGroup.winner.impl + ' ' +
        '(' + Math.floor(resultGroup.winner.margin * 100) + '%)';

      objects.push(object);

    }(results[i]));
  }

  return objects;
}

runExamples({
  start: function(race) {
    lineBreak();
    console.log('Just started race: "' + race.description + '"');
  },

  group: function(resultGroup) {
    console.log('  * Finished running tests for "' + resultGroup.input.name + '"');
  },

  mismatch: function(outputSet) {
    console.log('  * Implementations did not match for "' + outputSet.input.name + '":');
    lineBreak();

    var table = stringTable.create(mapOutputMapToObjects(outputSet.getOutputMap()));

    console.log('    ' + table.replace(/\n/g, '\n    '));
    lineBreak();
  },

  complete: function(results) {
    lineBreak();
    console.log('----- RESULTS for "' + results[0].race  + '" -----');
    lineBreak();

    console.log(stringTable.create(mapResultsToObjects(results), {
      capitalizeHeaders: true,
      typeFormatters: {
        number: function(value) {
          return Race.addCommas(value.toFixed(3))
        }
      }
    }));

    lineBreak();
  }
});
