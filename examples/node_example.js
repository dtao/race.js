var Race        = require('../race.js'),
    stringTable = require('string-table');

global.Race = Race;

require('./examples.js');

function mapResultsToObjects(results) {
  var keys    = Object.keys(results),
      objects = [];

  for (var i = 0; i < keys.length; ++i) {
    objects.push(results[keys[i]]);
  }

  return objects;
}

var runs = 0;

startExample({
  start: function(info) {
    process.stdout.write('Running ' + info.input + ' - ' + info.impl + '...\n');
    runs = 0;
  },

  cycle: function(info) {
    process.stdout.write('\r');
    process.stdout.write(info.input + ' - ' + info.impl + ': ' + (++runs));
  },

  result: function(resultGroup) {
  },

  complete: function(results) {
    console.log(stringTable.create(mapResultsToObjects(results)));
  }
});
