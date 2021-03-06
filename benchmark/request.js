'use strict';
const util = require('util');
const benchmark = require('benchmark');
const dumpster = require('../');
const jss = require('json-stringify-safe');
const cjson = require('circular-json');

const sample = new (require('http').ClientRequest)();
sample.on('error', () => {});

const tinyJSONBench = new benchmark.Suite();

tinyJSONBench.add('dumpster (depth: 2)', () => {
    dumpster.dump(sample, { depth: 2 });
}).add('dumpster (depth: Infinity)', () => {
    dumpster.dump(sample, { depth: Infinity });
}).add('dumpster (pretty)', () => {
    dumpster.dump(sample, { pretty: true, depth: Infinity });
}).add('util.inspect (depth: 2)', () => {
    util.inspect(sample, { depth: 2 });
}).add('util.inspect (depth: Infinity)', () => {
    util.inspect(sample, { depth: null });
}).add('json-stringify-safe', function () {
    jss(sample);
}).add('json-stringify-safe (pretty)', function () {
    jss(sample, null, 4);
}).add('circular-json', function () {
    cjson.stringify(sample);
}).add('circular-json (pretty)', function () {
    cjson.stringify(sample, null, 4);
}).on('error', e => {
    console.log(e);
}).on('cycle', event => {
    console.log(String(event.target));
}).run();
