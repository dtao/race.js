Race = require('../race.js')

describe 'Race', ->
  describe 'compare', ->
    describe 'for objects of different types', ->
      it 'returns false', ->
        expect(Race.compare(1, '1')).toBe(false)
        expect(Race.compare(false, null)).toBe(false)
        expect(Race.compare({}, [])).toBe(false)

    describe 'for functions', ->
      it 'tests for reference equality', ->
        f = ->
        g = ->
        expect(Race.compare(f, g)).toBe(false)
        expect(Race.compare(f, f)).toBe(true)

    describe 'for values', ->
      it 'performs a straightforward equality check', ->
        expect(Race.compare(1, 1)).toBe(true)
        expect(Race.compare(1, 2)).toBe(false)

    describe 'for arrays', ->
      it 'performs an element-wise comparison', ->
        expect(Race.compare([1, 2], [1, 2])).toBe(true)
        expect(Race.compare([1, 2], [1, 3])).toBe(false)

      it 'works for nested arrays of arrays', ->
        expect(Race.compare([[1, 2]], [[1, 2]])).toBe(true)
        expect(Race.compare([[1, 2]], [[1, 3]])).toBe(false)

    describe 'for objects', ->
      it 'performs a key/value pair-wise comparison', ->
        expect(Race.compare({ foo: 'bar' }, { foo: 'bar' })).toBe(true)
        expect(Race.compare({ foo: 'bar' }, { foo: 'baz' })).toBe(false)

      it 'works recursively for objects within objects', ->
        obj1 =
          parent:
            child: 'foo'

        obj2 =
          parent:
            child: 'foo'

        obj3 =
          parent:
            child: 'bar'

        expect(Race.compare(obj1, obj2)).toBe(true)
        expect(Race.compare(obj1, obj3)).toBe(false)

    describe 'for dates', ->
      moment = new Date().getTime()

      it 'performs a value comparison', ->
        expect(Race.compare(new Date(moment), new Date(moment))).toBe(true)
        expect(Race.compare(new Date(moment), new Date(moment + 1))).toBe(false)

  describe 'sizingChart', ->
    it 'takes an array of sizes and gives them names', ->
      expect(Race.sizingChart([1, 2, 3])).toEqual
        1: 'small'
        2: 'medium'
        3: 'large'

    it 'assigns size names in the appropriate order', ->
      expect(Race.sizingChart([100, 50, 200])).toEqual
        50: 'small'
        100: 'medium'
        200: 'large'

    describe 'for only two sizes', ->
      it 'assigns the names "small" and "large"', ->
        expect(Race.sizingChart([1, 2])).toEqual
          1: 'small'
          2: 'large'

    describe 'for more than three sizes', ->
      it 'adds "extra small", "extra large", etc.', ->
        expect(Race.sizingChart([1, 2, 3, 4, 5])).toEqual
          1: 'extra small'
          2: 'small'
          3: 'medium'
          4: 'large'
          5: 'extra large'

    describe 'for an even number of sizes over three', ->
      it 'assigns an "extra large" size before assigning an "extra small" size', ->
        expect(Race.sizingChart([1, 2, 3, 4])).toEqual
          1: 'small'
          2: 'medium'
          3: 'large'
          4: 'extra large'

    describe 'for lots and lots of sizes', ->
      it 'just keeps tacking more and more "extra"s on', ->
        expect(Race.sizingChart([1, 2, 3, 4, 5, 6, 7])).toEqual
          1: 'extra extra small'
          2: 'extra small'
          3: 'small'
          4: 'medium'
          5: 'large'
          6: 'extra large'
          7: 'extra extra large'

    describe 'for jagged arrays', ->
      it 'uses the first value in the array as the size', ->
        expect(Race.sizingChart([[10, 20], [30, 40]])).toEqual
          10: 'small'
          30: 'large'
