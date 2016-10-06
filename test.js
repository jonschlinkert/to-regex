'use strict';

require('mocha');
var assert = require('assert');
var toRegex = require('./');

describe('to-regex', function() {
  describe('main export', function() {
    it('should export a function', function() {
      assert.equal(typeof toRegex, 'function');
    });

    it('should create a strict regex from the given string', function() {
      assert.deepEqual(toRegex('foo'), /^(?:foo)$/);
    });

    it('should create a strict regex from the given array of strings', function() {
      assert.deepEqual(toRegex(['foo', 'bar']), /^(?:foo|bar)$/);
    });

    it('should create a regex from the a mixture of strings and regexes', function() {
      assert.deepEqual(toRegex(['foo', /bar/, 'baz']), /^(?:foo|\/bar\/|baz)$/);
    });

    it('should return a regex unchanged', function() {
      assert.deepEqual(toRegex(/whatever/), /whatever/);
    });

    it('should create a loose regex when `options.contains` is true', function() {
      assert.deepEqual(toRegex('foo', {contains: true}), /(?:foo)/);
    });

    it('should create a negation regex when `options.negate` is true', function() {
      assert.deepEqual(toRegex('foo', {negate: true}), /^(?:(?:(?!^(?:foo)$).)*)$/);
      assert.equal(toRegex('foo', {negate: true}).test('foo'), false);
      assert.equal(toRegex('foo', {negate: true}).test('bar'), true);
      assert.equal(toRegex('foo', {negate: true}).test('foobar'), true);
      assert.equal(toRegex('foo', {negate: true}).test('barfoo'), true);
    });

    it('should create a loose negation regex when `options.strictNegate` is false', function() {
      assert.deepEqual(toRegex('foo', {strictNegate: false}), /^(?:(?:(?!(?:foo)).)*)$/);
      assert.equal(toRegex('foo', {strictNegate: false}).test('foo'), false);
      assert.equal(toRegex('foo', {strictNegate: false}).test('bar'), true);
      assert.equal(toRegex('foo', {strictNegate: false}).test('foobar'), false);
      assert.equal(toRegex('foo', {strictNegate: false}).test('barfoo'), false);
    });

    it('should create a loose negation regex when `options.contains` and `options.negate` are true', function() {
      assert.deepEqual(toRegex('foo', {contains: true, negate: true}), /^(?:(?:(?!(?:foo)).)*)$/);
      assert.equal(toRegex('foo', {contains: true, negate: true}).test('foo'), false);
      assert.equal(toRegex('foo', {contains: true, negate: true}).test('bar'), true);
      assert.equal(toRegex('foo', {contains: true, negate: true}).test('foobar'), false);
      assert.equal(toRegex('foo', {contains: true, negate: true}).test('barfoo'), false);
    });

    it('should create a negation regex for an array of strings', function() {
      var re = toRegex(['foo', 'bar'], {negate: true});
      assert.deepEqual(re, /^(?:(?:(?!^(?:foo|bar)$).)*)$/);
      assert(!re.test('foo'));
      assert(!re.test('bar'));
      assert(re.test('foobar'));
      assert(re.test('barfoo'));
    });

    it('should create a loose negation regex for an array of strings', function() {
      var re = toRegex(['foo', 'bar'], {negate: true, contains: true});
      assert.deepEqual(re, /^(?:(?:(?!(?:foo|bar)).)*)$/);
      assert(!re.test('foo'));
      assert(!re.test('bar'));
      assert(!re.test('foobar'));
      assert(!re.test('barfoo'));
    });

    it('should not enforce beginning anchor when `options.strictOpen` is false', function() {
      assert.deepEqual(toRegex('foo', {strictOpen: false}), /(?:foo)$/);
    });

    it('should not enforce ending anchor when `options.strictClose` is false', function() {
      assert.deepEqual(toRegex('foo', {strictClose: false}), /^(?:foo)/);
    });

    it('should use flags passed on `options.flags`', function() {
      assert.deepEqual(toRegex('foo', {flags: 'ig'}), /^(?:foo)$/ig);
    });

    it('should cache regex by default', function() {
      toRegex('whatever');
      toRegex('whatever');
      toRegex('whatever');
      var re = toRegex('whatever');

      assert.deepEqual(re, /^(?:whatever)$/);
      assert.equal(re.cached, true);
    });

    it('should not cache regex when options.cache is false', function() {
      toRegex('whatever', {cache: false});
      toRegex('whatever', {cache: false});
      toRegex('whatever', {cache: false});
      var re = toRegex('whatever', {cache: false});

      assert.deepEqual(re, /^(?:whatever)$/);
      assert.equal(typeof re.cached, 'undefined');
    });

    it('should add `i` to flags when `options.nocase` is true', function() {
      assert.deepEqual(toRegex('foo', {nocase: true}), /^(?:foo)$/i);
    });

    it('should throw an error when invalid args are passed', function(cb) {
      try {
        toRegex();
        cb(new Error('expected an error'));
      } catch (err) {
        assert(err);
        assert.equal(err.message, 'expected a string');
        cb();
      }
    });

    it('should throw an error on invalid regexes when `options.strictErrors` is not false', function(cb) {
      try {
        toRegex('*');
        cb(new Error('expected an error'));
      } catch (err) {
        assert(err);
        assert.equal(err.message, 'Invalid regular expression: /^(?:*)$/: Nothing to repeat');
        cb();
      }
    });

    it('should return an "unmatchable" regex for invalid regexes when `options.strictErrors` is false', function() {
      assert.deepEqual(toRegex('*', {strictErrors: false}), /.^/);
    });
  });

  describe('.makeRe', function() {
    it('should be a function', function() {
      assert.equal(typeof toRegex.makeRe, 'function');
    });

    it('should create a strict regex from the given string', function() {
      assert.deepEqual(toRegex.makeRe('foo'), /^(?:foo)$/);
    });

    it('should return a regex unchanged', function() {
      assert.deepEqual(toRegex.makeRe(/whatever/), /whatever/);
    });

    it('should create a loose regex when `options.contains` is true', function() {
      assert.deepEqual(toRegex.makeRe('foo', {contains: true}), /(?:foo)/);
    });

    it('should create a negation regex when `options.negate` is true', function() {
      assert.deepEqual(toRegex.makeRe('foo', {negate: true}), /^(?:(?:(?!^(?:foo)$).)*)$/);
      assert.equal(toRegex.makeRe('foo', {negate: true}).test('foo'), false);
      assert.equal(toRegex.makeRe('foo', {negate: true}).test('bar'), true);
      assert.equal(toRegex.makeRe('foo', {negate: true}).test('foobar'), true);
      assert.equal(toRegex.makeRe('foo', {negate: true}).test('barfoo'), true);
    });

    it('should create a loose negation regex when `options.strictNegate` is false', function() {
      assert.deepEqual(toRegex.makeRe('foo', {strictNegate: false}), /^(?:(?:(?!(?:foo)).)*)$/);
      assert.equal(toRegex.makeRe('foo', {strictNegate: false}).test('foo'), false);
      assert.equal(toRegex.makeRe('foo', {strictNegate: false}).test('bar'), true);
      assert.equal(toRegex.makeRe('foo', {strictNegate: false}).test('foobar'), false);
      assert.equal(toRegex.makeRe('foo', {strictNegate: false}).test('barfoo'), false);
    });

    it('should create a loose negation regex when `options.contains` and `options.negate` are true', function() {
      assert.deepEqual(toRegex.makeRe('foo', {contains: true, negate: true}), /^(?:(?:(?!(?:foo)).)*)$/);
      assert.equal(toRegex.makeRe('foo', {contains: true, negate: true}).test('foo'), false);
      assert.equal(toRegex.makeRe('foo', {contains: true, negate: true}).test('bar'), true);
      assert.equal(toRegex.makeRe('foo', {contains: true, negate: true}).test('foobar'), false);
      assert.equal(toRegex.makeRe('foo', {contains: true, negate: true}).test('barfoo'), false);
    });

    it('should not enforce beginning anchor when `options.strictOpen` is false', function() {
      assert.deepEqual(toRegex.makeRe('foo', {strictOpen: false}), /(?:foo)$/);
    });

    it('should not enforce ending anchor when `options.strictClose` is false', function() {
      assert.deepEqual(toRegex.makeRe('foo', {strictClose: false}), /^(?:foo)/);
    });

    it('should use flags passed on `options.flags`', function() {
      assert.deepEqual(toRegex.makeRe('foo', {flags: 'ig'}), /^(?:foo)$/ig);
    });

    it('should cache regex by default', function() {
      toRegex.makeRe('whatever');
      toRegex.makeRe('whatever');
      toRegex.makeRe('whatever');
      var re = toRegex.makeRe('whatever');

      assert.deepEqual(re, /^(?:whatever)$/);
      assert.equal(re.cached, true);
    });

    it('should not cache regex when options.cache is false', function() {
      toRegex.makeRe('whatever', {cache: false});
      toRegex.makeRe('whatever', {cache: false});
      toRegex.makeRe('whatever', {cache: false});
      var re = toRegex.makeRe('whatever', {cache: false});

      assert.deepEqual(re, /^(?:whatever)$/);
      assert.equal(typeof re.cached, 'undefined');
    });

    it('should add `i` to flags when `options.nocase` is true', function() {
      assert.deepEqual(toRegex.makeRe('foo', {nocase: true}), /^(?:foo)$/i);
    });

    it('should throw an error when invalid args are passed', function(cb) {
      try {
        toRegex.makeRe();
        cb(new Error('expected an error'));
      } catch (err) {
        assert(err);
        assert.equal(err.message, 'expected a string');
        cb();
      }
    });
  });
});
