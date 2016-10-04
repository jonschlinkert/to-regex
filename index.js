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
  if (!Array.isArray(pattern)) {
    return makeRe(pattern, options);
  }

  if (!options || (options && options.wrap !== false)) {
    for (var i = 0; i < pattern.length; i++) {
      var val = pattern[i];
      if (val instanceof RegExp) val = val.source;
      pattern[i] = '(?:' + val + ')';
    }
  }

  return makeRe(pattern.join('|'), options);
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
  if (!options || (options && options.cache !== false)) {
    for (var prop in options) {
      key += '; ' + prop + '=' + String(options[prop]);
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
  var regex;

  if (opts.nocase === true && !/i/.test(flags)) {
    flags += 'i';
  }

  try {
    if (opts.negate || typeof opts.strictNegate === 'boolean') {
      pattern = not.create(pattern, opts);
    }
    var str = open + '(?:' + pattern + ')' + close;
    regex = new RegExp(str, flags);
  } catch (err) {
    if (opts.strictErrors !== false) {
      err.key = key;
      err.pattern = pattern;
      err.originalOptions = options;
      err.createdOptions = opts;
      throw err;
    }
    regex = /.^/; //<= match nothing
  }

  cacheRegex(regex, key, pattern, opts);
  return regex;
}

/**
 * Cache generated regex. This can result in dramatic speed improvements
 * and simplify debugging by adding options and pattern to the regex. It can be
 * disabled by passing setting `options.cache` to false.
 */

function cacheRegex(regex, key, pattern, options) {
  if (options.cache !== false) {
    regex.cached = true;
    regex.pattern = pattern;
    regex.options = options;
    regex.key = key;
    cache[key] = regex;
  }
}

/**
 * Expose `makeRe`
 */

module.exports.makeRe = makeRe;
