'use strict';

var extend = require('extend-shallow');
var not = require('regex-not');

/**
 * Session cache
 */

var cache = {};

/**
 * Create a regular expression from the given `pattern` string.
 *
 * @param {String|RegExp} `pattern` Pattern can be a string or regular expression.
 * @param {Object} `options`
 * @return {RegExp}
 * @api public
 */

module.exports = function(pattern, options) {
  options = options || {};
  if (Array.isArray(pattern)) {
    if (options.wrap !== false) {
      for (var i = 0; i < pattern.length; i++) {
        var val = pattern[i];
        if (val instanceof RegExp) {
          val = val.source;
        }
        pattern[i] = '(?:' + val + ')';
      }
    }
    pattern = pattern.join('|');
  }
  return makeRe(pattern, options);
};

/**
 * Create a regular expression from the given `pattern` string.
 *
 * @param {String|RegExp} `pattern` Pattern can be a string or regular expression.
 * @param {Object} `options`
 * @return {RegExp}
 * @api public
 */

function makeRe(pattern, options) {
  if (pattern instanceof RegExp) {
    return pattern;
  }

  if (typeof pattern !== 'string') {
    throw new TypeError('expected a string');
  }

  var key = pattern;
  // do this before shallow cloning options, it's a lot faster
  if (options && options.cache !== false) {
    for (var prop in options) {
      key += ':' + prop + ':' + String(options[prop]);
    }
  }

  if ((!options || (options && options.cache !== false)) && cache.hasOwnProperty(key)) {
    return cache[key];
  }

  var opts = extend({}, options);
  if (opts.contains === true) {
    if (opts.negate === true) {
      opts.strictNegate = false;
    } else {
      opts.strict = false;
    }
  }

  if (opts.strict === false) {
    opts.strictOpen = false;
    opts.strictClose = false;
  }

  var open = opts.strictOpen !== false ? '^' : '';
  var close = opts.strictClose !== false ? '$' : '';

  var flags = opts.flags || '';
  if (opts.nocase === true && !/i/.test(flags)) {
    flags += 'i';
  }

  try {
    if (opts.negate || typeof opts.strictNegate === 'boolean') {
      pattern = not.create(pattern, opts);
    }
    var str = open + '(?:' + pattern + ')' + close;
    var re = new RegExp(str, flags);
    if (opts.cache !== false) {
      re.cached = true;
      cache[key] = re;
    }
    return re;
  } catch (err) {
    if (opts.strictErrors !== false) throw err;
    return /.^/; //<= match nothing
  }
}

/**
 * Expose `makeRe`
 */

module.exports.makeRe = makeRe;
