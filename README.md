Race.js
=======

Pit JavaScript libraries against each other.

Purpose
-------

You've got a sweet library that does what some other library already does, and you want to race them to demonstrate that yours is superior.

Or, if you don't want to be a jerk about it... maybe you just want to point out the differences and trade-offs between different implementations of the same functionality.

This library serves two purposes:

1. To actually compare the performance of different implementations
2. To verify that different implementations actually produce the same results (if desired)

Usage
-----

Let's say we have two functions, `sumIterative()` and `sumRecursive()`, that do the same thing: sum up the values in an array. To race them, first we create a `Race` object:

```javascript
var sumRace = new Race({
  description: 'sumIterative() vs. sumRecursive()',

  impls: {
    'simple': sumIterative,
    'fast': sumRecursive
  },

  inputs: [
    {
      name: 'Small array',
      values: [Race.integers(10)],
      size: 10
    },

    {
      name: 'Medium array',
      values: [Race.integers(100)],
      size: 100
    },

    {
      name: 'Large array',
      values: [Race.integers(1000)],
      size: 1000
    }
  ],

  comparer: function(x, y) {
    if (x.length !== y.length) {
      return false;
    }

    for (var i = 0; i < x.length; ++i) {
      if (x[i] !== y[i]) {
        return false;
      }
    }

    return true;
  }
});
```

Then we begin the race and pass in some callbacks:

```javascript
sumRace.start({
  start: function(race) {
    /*
     * Here race will be a Race object like the one described above, with description, impls, etc.
     */
  },

  result: function(result) {
    /*
     * Here result will be a Race.Result object like this:
     *
     * {
     *   impl: 'simple',
     *   input: { name: 'Small input', size: 10 },
     *   perf: 1000000.0
     * }
     */
  },

  group: function(resultGroup) {
    /*
     * Here resultGroup will be a Race.ResultGroup object like this:
     *
     * {
     *   race: 'sumIterative() vs. sumRecursive()',
     *   input: { name: 'Small input', size: 10 },
     *   results: {
     *     'simple': 1000000.0,
     *     'fast': 1500000.0
     *   },
     *   winner: {
     *     impl: 'fast',
     *     margin: 0.5 // meaning 50% faster than second place
     *   }
     * }
     */
  },

  complete: function(resultGroups) {
    /*
     * Here resultGroups will be an array of Race.ResultGroup objects, i.e.:
     *
     * [
     *   {
     *     race: 'sumIterative() vs. sumRecursive()',
     *     input: { name: 'Small input', size: 10 },
     *     results: {
     *       'simple': 1000000.0,
     *       'fast': 1500000.0
     *     }
     *   },
     *   {
     *     race: 'sumIterative() vs. sumRecursive()',
     *     input: { name: 'Medium input', size: 100 },
     *     results: {
     *       'simple': 500000.0,
     *       'fast': 750000.0
     *     }
     *   },
     *   ...
     * ]
     */
  }
});
```

You can run multiple races in sequence using the `Race.Marathon` object:

```javascript
var marathon = new Race.Marathon();

marathon.add(new Race({
  /*
   * All the properties explained above.
   */
}));

marathon.add(new Race({
  /*
   * Add as many races as you like.
   */
}));

marathon.start({
  /*
   * All the same callbacks as you can pass to `Race.start()`, PLUS...
   */
  marathonComplete: function(results) {
    /*
     * Here results will be an array of ALL the Race.ResultGroup objects from
     * all of the races in the marathon.
     */
  }
});
```
