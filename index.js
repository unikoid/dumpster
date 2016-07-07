'use strict';
const DEFAULTS = {
    depth: 2,
    pretty: false
};

function replacer(maxDepth) {
    // `stack` and `scope` here actually contains same refs on any serialization step.
    // The difference is that stack saves order of parent objects, that is useful to track depth,
    // and set has fast lookup time, so it is useful for cycle detection.
    const stack = [];
    const scope = new WeakSet();
    return function (key, value) {
        if (typeof value === 'function') {
            return `__Function ${value.name}(<${value.length}>)__`;
        }
        if (typeof value !== 'object' || value === null) {
            return value;
        }
        while (stack.length && stack[stack.length - 1] !== this) {
            scope.delete(stack.pop());
        }
        if (stack.length > maxDepth) {
            return '__Object__';
        }
        if (scope.has(value)) {
            return '__Circular__';
        }
        if (value instanceof RegExp) {
            return `__RegExp ${value.toString()}__`;
        }
        if (value instanceof Error) {
            return `__Error ${value.toString()}__`;
        }
        stack.push(value);
        scope.add(value);
        return value;
    };
}

/**
 * Stringify any JS object to valid JSON
 * @param {*} obj - an object to serialize
 * @param {Object} [options]
 * @param {number} [options.depth=2] - serialization depth
 * @param {number|string|boolean} [options.pretty] - enable pretty printing
 *   number sets number of spaces for indentation, string - custom indentation line,
 *   true - sets indentation to 4 spaces
 * @returns {string}
 */
function dump(obj, options) {
    options = Object.assign({}, DEFAULTS, options);
    if (options.pretty === true) {
        options.pretty = 4;
    }
    return JSON.stringify(obj, replacer(options.depth), options.pretty);
}

module.exports = {
    dump
};
