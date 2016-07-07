'use strict';
const dump = require('./').dump;
const assert = require('assert');

/* eslint-env mocha */

function dumpAndRestore() {
    return JSON.parse(dump.apply(null, arguments));
}

describe('dumpster:', function () {
    describe('dumps primitives as is:', function () {
        it('string', function () {
            assert.strictEqual(dumpAndRestore('test'), 'test');
        });
        it('number', function () {
            assert.strictEqual(dumpAndRestore(100500.12), 100500.12);
        });
        it('boolean', function () {
            assert.strictEqual(dumpAndRestore(true), true);
            assert.strictEqual(dumpAndRestore(false), false);
        });
        it('null', function () {
            assert.strictEqual(dumpAndRestore(null), null);
        });
        it('undefined', function () {
            assert.strictEqual(dump(undefined), undefined);
        });
    });

    describe('dumps some special objects with descriptions:', function () {
        it('functions', function () {
            let result = dumpAndRestore(function () {});
            assert(result.startsWith('__') && result.endsWith('__'));
            assert(result.includes('Function'));

            result = dumpAndRestore({ x: function () {} });
            assert(result.x.startsWith('__') && result.x.endsWith('__'));
            assert(result.x.includes('Function'));
        });
        it('errors', function () {
            let result = dumpAndRestore(new Error('You fail'));
            assert(result.startsWith('__') && result.endsWith('__'));
            assert(result.includes('Error'));

            result = dumpAndRestore({ x: new Error('You fail') });
            assert(result.x.startsWith('__') && result.x.endsWith('__'));
            assert(result.x.includes('Error'));
        });
        it('regexps', function () {
            let result = dumpAndRestore(/re/);
            assert(result.startsWith('__') && result.endsWith('__'));
            assert(result.includes('RegExp'));

            result = dumpAndRestore({ x: /re/ });
            assert(result.x.startsWith('__') && result.x.endsWith('__'));
            assert(result.x.includes('RegExp'));
        });
    });

    describe('supports arrays:', function () {
        it('plain arrays', function () {
            const data = [1, 2, 3];
            assert.deepEqual(dumpAndRestore(data), data);
        });
        it('nested arrays', function () {
            const data = [
                1,
                [2, 3],
                [[4, 5], [6, 7]]
            ];
            assert.deepEqual(dumpAndRestore(data, { depth: Infinity }), data);
        });
        it('arrays with objects', function () {
            const data = [{
                x: 1,
                a: [1, {
                    c: 3
                }]
            }];
            assert.deepEqual(dumpAndRestore(data, { depth: Infinity }), data);
        });
    });

    describe('supports plain objects:', function () {
        it('simple objects', function () {
            const data = {
                x: 1,
                y: 2,
                z: 3
            };
            assert.deepEqual(dumpAndRestore(data, { depth: Infinity }), data);
        });
        it('nested objects', function () {
            const data = {
                x: 1,
                y: {
                    z: {
                        d: 4
                    },
                    c: 'test'
                }
            };
            assert.deepEqual(dumpAndRestore(data, { depth: Infinity }), data);
        });
    });

    describe('supports pretty printing:', function () {
        it('default 4 spaces', function () {
            const data = {
                a: 1,
                b: 2,
                c: {
                    d: 1
                }
            };
            const result = dump(data, { pretty: true }).split('\n');
            assert.equal(result.length, 7);
            result.forEach(str => {
                if (str === '{' || str === '}') {
                    return;
                }
                assert(str.startsWith('    '));
                if (str.includes('d')) {
                    assert(str.startsWith('        '));
                }
            });
        });
        it('custom number of spaces', function () {
            const data = {
                a: 1,
                b: 2,
                c: {
                    d: 1
                }
            };
            const result = dump(data, { pretty: 2 }).split('\n');
            assert.equal(result.length, 7);
            result.forEach(str => {
                if (str === '{' || str === '}') {
                    return;
                }
                assert(str.startsWith('  '));
                if (str.includes('d')) {
                    assert(str.startsWith('    '));
                }
            });
        });
        it('custom padding string', function () {
            const data = {
                a: 1,
                b: 2,
                c: {
                    d: 1
                }
            };
            const result = dump(data, { pretty: '**' }).split('\n');
            assert.equal(result.length, 7);
            result.forEach(str => {
                if (str === '{' || str === '}') {
                    return;
                }
                assert(str.startsWith('**'));
                if (str.includes('d')) {
                    assert(str.startsWith('****'));
                }
            });
        });
    });
    describe('supports serialization depth:', function () {
        it('for objects', function () {
            const data = {
                a: {
                    b: {
                        c: {
                            d: 3
                        }
                    }
                }
            };
            assert.deepEqual(dumpAndRestore(data, { depth: 2 }), {
                a: {
                    b: {
                        c: '__Object__'
                    }
                }
            });
        });
        it('for arrays', function () {
            const data = {
                a: {
                    b: {
                        c: [{
                            d: 3
                        }]
                    }
                }
            };
            assert.deepEqual(dumpAndRestore(data, { depth: 2 }), {
                a: {
                    b: {
                        c: '__Object__'
                    }
                }
            });
        });
        it('depth=0', function () {
            const data = {
                a: {
                    b: 1
                }
            };
            assert.deepEqual(dumpAndRestore(data, { depth: 0 }), { a: '__Object__' });
        });
    });

    describe('supports circular objects:', function () {
        it('recursive object', function () {
            const data = {
                a: {
                    b: 1
                }
            };
            data.a.c = data;
            assert.strictEqual(dumpAndRestore(data, { depth: Infinity }).a.c, '__Circular__');
        });
        it('recursive inside array', function () {
            const data = {
                a: [{
                    b: 1
                }]
            };
            data.a.push(data);
            assert.strictEqual(dumpAndRestore(data, { depth: Infinity }).a[1], '__Circular__');
        });
        it('multiple links', function () {
            const data = {
                a: {
                    b: {
                        c: 1
                    }
                }
            };
            data.a.b.d = data;
            data.a.d = data;
            const result = dumpAndRestore(data, { depth: Infinity });
            assert.strictEqual(result.a.b.d, '__Circular__');
            assert.strictEqual(result.a.d, '__Circular__');
        });
    });
});
