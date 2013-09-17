(function(root) {
  if (typeof Benchmark === 'undefined' && typeof require === 'function') {
    Benchmark = require('benchmark');
  }

  /**
   * Races multiple implementations of some functionality, ensures they all return the same result,
   * and ranks them by performance.
   */
  function Race(options) {
    this.description     = options.description;
    this.implementations = options.impls;
    this.inputs          = options.inputs;
  }

  Race.prototype.start = function(callbacks) {
    var suite   = new Benchmark.Suite(),
        impls   = this.implementations,
        results = [];

    for (var key in impls) {
      (function(name, impl) {
        for (var i = 0; i < this.inputs.length; ++i) {
          var input = this.inputs[i];
          var benchmark = new Benchmark(name, function() {
            fastApply(impl, input.input);
          });

          benchmark.inputName = input.name;
          benchmark.inputSize = input.size;

          suite.add(benchmark);
        }
      }).call(this, key, impls[key]);
    }

    suite.on('cycle', function(e) {
      var benchmark = e.target;

      var result = {
        name:  benchmark.name,
        input: benchmark.inputName + ' (' + benchmark.inputSize + ')',
        perf:  benchmark.hz
      };

      results.push(result);

      if (typeof callbacks.result === 'function') {
        callbacks.result(result);
      }
    });

    suite.run({ async: true });

    suite.on('complete', function() {
      if (typeof callbacks.complete === 'function') {
        results.sort(function(x, y) {
          if (y.name > x.name) {
            return 1;
          } else if (y.name < x.name) {
            return -1;
          }
          return y.perf - x.perf;
        });

        callbacks.complete(results);
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

  if (typeof module !== 'undefined') {
    module.exports = Race;

  } else {
    root.Race = Race;
  }

}(this));
