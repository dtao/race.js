var Race = require('../race.js');

var race = new Race({
  description: 'endsWith',

  impls: {
    'Using lastIndexOf': function(str, suffix) {
      var targetStart = str.length - suffix.length,
          actualStart = str.lastIndexOf(suffix);
      return actualStart === targetStart;
    },

    'Using substring': function(str, suffix) {
      var actualSuffix = str.substring(str.length - suffix.length);
      return actualSuffix === suffix;
    }
  },

  inputs: [
    {
      name: 'Positive case',
      input: ['You are my sunshine', 'shine'],
      size: 1
    },
    {
      name: 'Negative case',
      input: ['You are my sunshine', 'rainbow'],
      size: 1
    }
  ]
});

race.start({
  result: function(result) {
    console.log(result.input.name + ' (' + result.input.size + '):');
    for (var impl in result.results) {
      (function(r) {
        console.log(r.name + ' - ' + r.perf);
        console.log('\n');
      }(result.results[impl]));
    }
  },

  complete: function(results) {
    console.log('\n\n----- FINAL RESULTS -----\n\n');
    for (var inputDesc in results) {
      for (var impl in results[inputDesc]) {
        console.log([inputDesc, results[inputDesc][impl].name, results[inputDesc][impl].perf].join(' - '));
      }
    }
  }
});
