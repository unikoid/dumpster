'use strict';
const util = require('util');
const benchmark = require('benchmark');
const dumpster = require('../');
const jss = require('json-stringify-safe');
const largeJSON = require('./large.json');

const largeJSONBench = new benchmark.Suite();

largeJSONBench.add('dumpster (depth: 2)', () => {
    dumpster.dump(largeJSON, { depth: 2 });
}).add('dumpster (depth: Infinity)', () => {
    dumpster.dump(largeJSON, { depth: Infinity });
}).add('dumpster (pretty)', () => {
    dumpster.dump(largeJSON, { pretty: true, depth: Infinity });
}).add('JSON.stringify', () => {
    JSON.stringify(largeJSON);
}).add('JSON.stringify (pretty)', () => {
    JSON.stringify(largeJSON, null, 4);
}).add('util.inspect (depth: 2)', () => {
    util.inspect(largeJSON, { depth: 2 });
}).add('util.inspect (depth: Infinity)', () => {
    util.inspect(largeJSON, { depth: null });
}).add('util.format (%j)', () => {
    util.format('%j', largeJSON);
}).add('json-stringify-safe', function () {
    jss(largeJSON);
}).add('json-stringify-safe (pretty)', function () {
    jss(largeJSON, null, 4);
}).on('error', e => {
    console.log(e);
}).on('cycle', event => {
    console.log(String(event.target));
}).run();
