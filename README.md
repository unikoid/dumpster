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

- Pre-ES6 environment support (now you need Object.assign polyfill and const keyword support)
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

I got the following benchmark results on my laptop and nodejs v4:

```
Benchmarking with tiny JS object
dumpster (depth: 2) x 65,318 ops/sec ±1.40% (85 runs sampled)
dumpster (depth: Infinity) x 39,443 ops/sec ±1.71% (87 runs sampled)
dumpster (pretty) x 34,469 ops/sec ±1.13% (87 runs sampled)
JSON.stringify x 237,355 ops/sec ±1.32% (89 runs sampled)
JSON.stringify (pretty) x 59,712 ops/sec ±1.02% (89 runs sampled)
util.inspect (depth: 2) x 15,146 ops/sec ±1.32% (89 runs sampled)
util.inspect (depth: Infinity) x 8,434 ops/sec ±1.34% (90 runs sampled)
util.format (%j) x 210,131 ops/sec ±1.41% (90 runs sampled)
json-stringify-safe x 25,030 ops/sec ±3.06% (83 runs sampled)
json-stringify-safe (pretty) x 22,264 ops/sec ±2.12% (83 runs sampled)
circular-json x 37,935 ops/sec ±3.73% (79 runs sampled)
circular-json (pretty) x 26,561 ops/sec ±2.11% (82 runs sampled)

Benchmarking with circular JS object
dumpster (depth: 2) x 55,658 ops/sec ±1.55% (85 runs sampled)
dumpster (depth: Infinity) x 33,038 ops/sec ±2.04% (82 runs sampled)
dumpster (pretty) x 25,904 ops/sec ±2.90% (79 runs sampled)
util.inspect (depth: 2) x 12,770 ops/sec ±1.72% (82 runs sampled)
util.inspect (depth: Infinity) x 6,931 ops/sec ±2.16% (80 runs sampled)
json-stringify-safe x 17,769 ops/sec ±2.59% (73 runs sampled)
json-stringify-safe (pretty) x 14,756 ops/sec ±1.97% (79 runs sampled)
circular-json x 25,914 ops/sec ±1.86% (80 runs sampled)
circular-json (pretty) x 22,910 ops/sec ±1.92% (84 runs sampled)

Benchmarking with http.ClientRequest
dumpster (depth: 2) x 12,127 ops/sec ±2.79% (82 runs sampled)
dumpster (depth: Infinity) x 5,172 ops/sec ±3.62% (76 runs sampled)
dumpster (pretty) x 5,421 ops/sec ±1.96% (84 runs sampled)
util.inspect (depth: 2) x 5,326 ops/sec ±2.11% (83 runs sampled)
util.inspect (depth: Infinity) x 1,376 ops/sec ±1.73% (85 runs sampled)
json-stringify-safe x 2,867 ops/sec ±2.32% (82 runs sampled)
json-stringify-safe (pretty) x 2,749 ops/sec ±1.92% (81 runs sampled)
circular-json x 5,255 ops/sec ±2.09% (82 runs sampled)
circular-json (pretty) x 4,976 ops/sec ±2.36% (82 runs sampled)

Benchmarking with large JSON dataset
dumpster (depth: 2) x 58.45 ops/sec ±1.66% (60 runs sampled)
dumpster (depth: Infinity) x 1.74 ops/sec ±5.42% (9 runs sampled)
dumpster (pretty) x 1.42 ops/sec ±5.54% (8 runs sampled)
JSON.stringify x 8.20 ops/sec ±8.18% (25 runs sampled)
JSON.stringify (pretty) x 1.55 ops/sec ±10.81% (9 runs sampled)
util.inspect (depth: 2) x 6.09 ops/sec ±3.05% (19 runs sampled)
util.inspect (depth: Infinity) x 0.35 ops/sec ±2.57% (5 runs sampled)
util.format (%j) x 8.17 ops/sec ±5.54% (24 runs sampled)
json-stringify-safe x 0.54 ops/sec ±11.63% (6 runs sampled)
json-stringify-safe (pretty) x 0.51 ops/sec ±5.88% (6 runs sampled)
circular-json@0.3.0 couldn't pass this benchmark in reasonable time. Looks like
it takes about a minute for this library to dump provided example.
```

