(function(root) {
  if (typeof Benchmark === 'undefined' && typeof require === 'function') {
    Benchmark = require('benchmark');
  }

  Benchmark.options.maxTime = 0.5;

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
    var suite     = new Benchmark.Suite(),
        impls     = this.implementations,
        inputs    = this.inputs,
        implCount = Object.keys(impls).length,
        results   = {},
        current   = {};

    var startCallback    = callbacks.start,
        cycleCallback    = callbacks.cycle,
        resultCallback   = callbacks.result,
        completeCallback = callbacks.complete;

    for (var i = 0; i < inputs.length; ++i) {
      (function(input) {
        for (var key in impls) {
          (function(name, impl) {
            var fn = function() {
              fastApply(impl, input.input);
            };

            var benchmark = new Benchmark(name, fn, {
              onStart: function() {
                if (typeof startCallback === 'function') {
                  startCallback({
                    input: input.name,
                    impl: name
                  });
                }
              },

              onCycle: function() {
                if (typeof cycleCallback === 'function') {
                  cycleCallback({
                    input: input.name,
                    impl: name
                  });
                }
              },
            });

            benchmark.inputName = input.name;
            benchmark.inputSize = input.size;

            suite.add(benchmark);
          }(key, impls[key]));
        }
      }(inputs[i]));
    }

    suite.on('cycle', function(e) {
      var benchmark = e.target;

      var inputDesc = {
        name: benchmark.inputName,
        size: benchmark.inputSize
      };

      var result = {
        name:  benchmark.name,
        input: inputDesc,
        perf:  benchmark.hz
      };

      current[benchmark.name] = result;
      if (Object.keys(current).length === implCount) {
        results[benchmark.inputName + ':' + benchmark.inputSize] = current;

        if (typeof resultCallback === 'function') {
          resultCallback({
            input: inputDesc,
            results: current
          });
        }

        current = {};
      }
    });

    suite.on('complete', function() {
      if (typeof completeCallback === 'function') {
        completeCallback(results);
      }
    });

    suite.run({ async: true });
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
