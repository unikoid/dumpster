# dumpster
Serializes any JS object to valid JSON, which is useful for debugging purposes (i.e. logs).
This JSON may then be passed to various log processing systems, etc.

## Features

- Supports circular objects (like `a = {}; a.a = a;`)
- Keeps information about object methods (functions), some special types (regexps, errors, etc)
- Supports pretty printing and serialization depth limit
- Provides good serialization speed ([see benchmarks](#benchmark))

## Usage

```js
const dump = require('dumpster').dump;
let obj = {
  sample: {
    object: 1
  }
}
console.log(dump(obj));
// {"sample":{"object":1}}

let req = new (require('http').ClientRequest)();
console.log(dump(req, {pretty: true}));
// Pretty printed http.ClientRequest object goes here
```

## API

- `dumpster.dump(obj, [options])` - serialize JS object to JSON. Valid options are:
    - options.pretty (default: false) - may be either boolean, number or string, enables pretty printing and 
    sets corresponding indentation.
    Number and string works exactly as
    [third argument of JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
     and `true` means to use 4 space identation.
    - options.depth (default: 2) - sets serialization depth. If `obj` have nested objects with depth more then 
    `options.depth`, these objects are replaced with string `__Object__` in final JSON. To disable this feature you
    may set `options.depth` to `Infinity`.

## TODO:

- Pre-ES6 environment support (now you need Object.assign and WeakSet polyfills)
- Browser builds
- Memory usage benchmark

## Similar tools

There are plenty of tools that solves similar tasks, but all of them have their own pros and cons.

- `JSON.stringify`
    - + is part of JS standard
    - + is much faster than dumpster
    - - fails on circular objects
    - - doesn't support serialization depth limit
    - - throws away information about functions, RegExps, etc, useful for debug
- `util.inspect` (Node.js)
    - + is included into nodejs
    - + supports custom inspect and rich colorful output
    - - does not produce valid JSON
    - - is rather slow ([see benchmarks](#benchmark))
- `util.format('%j')` (Node.js)
    - it is actually the same as JSON.stringify, but it does not fail on Circular objects. It returns useless string instead
- [json-stringify-safe](https://www.npmjs.com/package/json-stringify-safe)
    - - doesn't support serialization depth limit
    - - slower than dumpster ([see benchmarks](#benchmark))
    - - throws away information about functions, RegExps, etc
    - - project seems to be abandoned, with open issues
- [circular-json](https://www.npmjs.com/package/circular-json)
    - + provides ability to deserialize circular objects
    - + slightly faster than dumpster on small objects
    - - doesn't support serialization depth limit
    - - throws away information about functions, RegExps, etc
    - - is dramatically slow on large JSON datasets
    
## Benchmark
Benchmarks are implemented using [benchmark](https://www.npmjs.com/package/benchmark) module. See the source code [here](./benchmark).
Data from http://mtgjson.com is used as an example of large JSON dataset.

I got the following benchmark results on my laptop:

```
Benchmarking with tiny JS object
dumpster (depth: 2) x 56,990 ops/sec ±1.34% (82 runs sampled)
dumpster (depth: Infinity) x 34,368 ops/sec ±1.38% (84 runs sampled)
dumpster (pretty) x 29,036 ops/sec ±1.93% (87 runs sampled)
JSON.stringify x 220,139 ops/sec ±1.60% (83 runs sampled)
JSON.stringify (pretty) x 55,766 ops/sec ±1.35% (85 runs sampled)
util.inspect (depth: 2) x 15,973 ops/sec ±1.54% (85 runs sampled)
util.inspect (depth: Infinity) x 8,261 ops/sec ±1.54% (87 runs sampled)
util.format (%j) x 197,480 ops/sec ±1.29% (87 runs sampled)
json-stringify-safe x 26,140 ops/sec ±1.62% (84 runs sampled)
json-stringify-safe (pretty) x 22,919 ops/sec ±1.55% (88 runs sampled)
circular-json x 37,951 ops/sec ±2.42% (81 runs sampled)
circular-json (pretty) x 28,412 ops/sec ±3.06% (72 runs sampled)

Benchmarking with circular JS object
dumpster (depth: 2) x 49,207 ops/sec ±1.78% (80 runs sampled)
dumpster (depth: Infinity) x 28,805 ops/sec ±1.74% (80 runs sampled)
dumpster (pretty) x 25,218 ops/sec ±1.88% (84 runs sampled)
util.inspect (depth: 2) x 12,064 ops/sec ±2.04% (80 runs sampled)
util.inspect (depth: Infinity) x 6,810 ops/sec ±1.80% (85 runs sampled)
json-stringify-safe x 16,361 ops/sec ±1.86% (75 runs sampled)
json-stringify-safe (pretty) x 15,153 ops/sec ±1.73% (83 runs sampled)
circular-json x 25,566 ops/sec ±1.82% (80 runs sampled)
circular-json (pretty) x 22,141 ops/sec ±2.16% (83 runs sampled)

Benchmarking with http.ClientRequest
dumpster (depth: 2) x 11,393 ops/sec ±2.15% (82 runs sampled)
dumpster (depth: Infinity) x 5,112 ops/sec ±1.94% (82 runs sampled)
dumpster (pretty) x 4,881 ops/sec ±1.66% (83 runs sampled)
util.inspect (depth: 2) x 5,652 ops/sec ±1.82% (84 runs sampled)
util.inspect (depth: Infinity) x 1,358 ops/sec ±1.87% (85 runs sampled)
json-stringify-safe x 2,705 ops/sec ±2.29% (79 runs sampled)
json-stringify-safe (pretty) x 2,621 ops/sec ±2.12% (78 runs sampled)
circular-json x 5,199 ops/sec ±1.85% (82 runs sampled)
circular-json (pretty) x 4,902 ops/sec ±1.81% (83 runs sampled)

Benchmarking with large JSON dataset
dumpster (depth: 2) x 66.78 ops/sec ±1.69% (68 runs sampled)
dumpster (depth: Infinity) x 1.52 ops/sec ±4.82% (8 runs sampled)
dumpster (pretty) x 1.26 ops/sec ±4.40% (8 runs sampled)
JSON.stringify x 7.20 ops/sec ±7.40% (22 runs sampled)
JSON.stringify (pretty) x 1.39 ops/sec ±6.38% (8 runs sampled)
util.inspect (depth: 2) x 5.43 ops/sec ±6.36% (18 runs sampled)
util.inspect (depth: Infinity) x 0.32 ops/sec ±6.32% (5 runs sampled)
util.format (%j) x 6.88 ops/sec ±7.24% (21 runs sampled)
json-stringify-safe x 0.58 ops/sec ±2.78% (6 runs sampled)
json-stringify-safe (pretty) x 0.55 ops/sec ±4.18% (6 runs sampled)
circular-json@0.3.0 couldn't pass this benchmark in reasonable time. Looks like
it takes about a minute for this library to dump provided example.
```

