(function(root) {
  if (typeof Benchmark === 'undefined' && typeof require === 'function') {
    Benchmark = require('benchmark');
  }

  Benchmark.options.maxTime = 0.5;

  /**
   * Races multiple implementations of some functionality, ensures they all return the same result,
   * and ranks them by performance.
   *
   * @constructor
   */
  function Race(options) {
    this.description     = options.description;
    this.implementations = options.impls;
    this.inputs          = options.inputs;
  }

  /**
   * Represents an input that will be passed to multiple implementations in a Race.
   *
   * @constructor
   */
  Race.Input = function(name, size, values) {
    this.name   = name;
    this.size   = size;
    this.values = values;
  };

  /**
   * Represents the result of a single implementation for a given input of a Race.
   *
   * @constructor
   */
  Race.Result = function(data) {
    this.impl  = data.impl;
    this.input = data.input;
    this.perf  = data.perf;
  };

  /**
   * Represents the results of all implementations for a given input of a Race.
   *
   * @constructor
   */
  Race.ResultGroup = function(data) {
    this.input   = data.input;
    this.results = data.results;
  };

  Race.prototype.start = function(callbacks) {
    var suite            = new Benchmark.Suite(),
        impls            = this.implementations,
        inputs           = this.inputs,
        implCount        = Object.keys(impls).length,
        results          = [],
        currentResults   = {},
        resultCallback   = callbacks.result   || function() {},
        groupCallback    = callbacks.group    || function() {},
        completeCallback = callbacks.complete || function() {};

    forEach(inputs, function(input) {
      forIn(impls, function(implName, impl) {
        var name = input.name + ' - ' + implName;

        var benchmark = new Benchmark(name, function() {
          fastApply(impl, input.values);
        });

        benchmark.impl  = implName;
        benchmark.input = input;

        suite.add(benchmark);
      });
    });

    suite.on('cycle', function(e) {
      var benchmark = e.target;

      var result = new Race.Result({
        impl:  benchmark.impl,
        input: benchmark.input,
        perf:  benchmark.hz
      });

      currentResults[benchmark.impl] = result.perf;
      resultCallback(result);

      if (Object.keys(currentResults).length === implCount) {
        (function() {
          var resultGroup = new Race.ResultGroup({
            input: benchmark.input,
            results: currentResults
          });

          results.push(resultGroup);
          groupCallback(resultGroup);
        }());

        currentResults = {};
      }
    });

    suite.on('complete', function() {
      completeCallback(results);
    });

    suite.run({ async: true });
  };

  function forEach(collection, fn) {
    for (var i = 0; i < collection.length; ++i) {
      fn(collection[i]);
    }
  }

  function forIn(object, fn) {
    for (var key in object) {
      fn(key, object[key]);
    }
  }

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
