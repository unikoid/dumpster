'use strict';

console.log('Benchmarking with tiny JS object');
require('./tiny');

console.log('\nBenchmarking with circular JS object');
require('./circular');

console.log('\nBenchmarking with http.ClientRequest');
require('./request');

console.log('\nBenchmarking with large JSON dataset');
require('./large');
