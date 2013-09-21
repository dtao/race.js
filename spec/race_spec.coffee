Race = require('../race.js')

describe 'Race', ->
  describe 'compare', ->
    describe 'for objects of different types', ->
      it 'returns false', ->
        expect(Race.compare(1, '1')).toBe(false)
        expect(Race.compare(false, null)).toBe(false)
        expect(Race.compare({}, [])).toBe(false)

    describe 'for values', ->
      it 'performs a straightforward equality check', ->
        expect(Race.compare(1, 1)).toBe(true)
        expect(Race.compare(1, 2)).toBe(false)

    describe 'for arrays', ->
      it 'performs a shallow element-wise comparison', ->
        expect(Race.compare([1, 2], [1, 2])).toBe(true)
        expect(Race.compare([1, 2], [1, 3])).toBe(false)
