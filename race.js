var Benchmark = require('benchmark');

/**
 * Races multiple implementations of some functionality, ensures they all return the same result,
 * and ranks them by performance.
 */
function Race(options) {
  this.description     = options.description;
  this.implementations = options.impls;
  this.inputs          = options.inputs;
}

Race.prototype.start = function() {
  var suite   = new Benchmark.Suite(),
      impls   = this.implementations,
      results = [];

  for (var key in impls) {
    (function(name, impl) {
      for (var i = 0; i < this.inputs.length; ++i) {
        var input = this.inputs[i];
        var benchmark = suite.add(name, function() {
          fastApply(impl, input);
        });
      }
    }).call(this, key, impls[key]);
  }

  suite.on('cycle', function(e) {
    var result = e.target;

    results.push({
      name: result.name,
      perf: result.stats.mean
    });
  });

  suite.run({ async: true });

  suite.on('complete', function() {
    results.sort(function(x, y) {
      return y.perf - x.perf;
    });

    for (var i = 0; i < results.length; ++i) {
      console.log(results[i].name + '\t' + results[i].perf.toFixed(3) + ' ops/sec');
    }
  });
};

Race.numbers = function(count) {
  var array = [];
  while (array.length < count) {
    array.push(array.length);
  }
  return array;
};

function fastApply(fn, args) {
  switch (args.length) {
    case 0:
      fn();
      break;

    case 1:
      fn(args[0]);
      break;

    case 2:
      fn(args[0], args[1]);
      break;

    case 3:
      fn(args[0], args[1], args[2]);
      break;

    case 4:
      fn(args[0], args[1], args[2], args[3]);
      break;

    case 5:
      fn(args[0], args[1], args[2], args[3], args[4]);
      break;

    default:
      fn.apply(this, args);
      break;
  }
}

module.exports = Race;
