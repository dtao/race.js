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
  Race.Input = function(data) {
    this.name   = data.name;
    this.size   = data.size;
    this.values = data.values;
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

  /**
   * Start your engines!
   */
  Race.prototype.start = function(callbacks) {
    var suite            = new Benchmark.Suite(),
        impls            = this.implementations,
        inputs           = this.inputs,
        implCount        = Object.keys(impls).length,
        results          = [],
        currentResults   = {},
        startCallback    = callbacks.start    || function() {},
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
        benchmark.input = new Race.Input(input);

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

    startCallback(this);
  };

  /**
   * Runs multiple races consecutively.
   *
   * @constructor
   */
  Race.Marathon = function() {
    this.races = [];
  };

  /**
   * Adds a race to the marathon.
   */
  Race.Marathon.prototype.add = function(race) {
    this.races.push(race);
  };

  /**
   * Starts the first race in the marathon, which will be followed by the next, and so on.
   */
  Race.Marathon.prototype.start = function(callbacks) {
    var races     = this.races,
        raceIndex = 0;

    if (races.length === 0) {
      return;
    }

    callbacks = override(callbacks, 'complete', function(complete) {
      return function(results) {
        if (typeof complete === 'function') {
          complete(results);
        }

        var nextRace = races[++raceIndex];
        if (nextRace) {
          nextRace.start(callbacks);
        }
      };
    });

    races[raceIndex].start(callbacks);
  };

  Race.integers = function(count) {
    var integers = [];
    while (integers.length < count) {
      integers.push(integers.length);
    }
    return integers;
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

  function override(object, propertyName, replacement) {
    var overridden = clone(object);
    overridden[propertyName] = replacement(object[propertyName]);
    return overridden;
  }

  function clone(object) {
    var cloned = {};
    for (var property in object) {
      if (object.hasOwnProperty(property)) {
        cloned[property] = object[property];
      }
    }
    return cloned;
  }

  if (typeof module !== 'undefined') {
    module.exports = Race;

  } else {
    root.Race = Race;
  }

}(this));
