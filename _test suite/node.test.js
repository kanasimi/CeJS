/**
 * @name npm test frontend for CeL.
 * 
 * @fileoverview 本檔案用於在 npm 中測試本 library。
 * 
 * @example <code>

# npm test

(git push)

# npm publish

# npm view

 * </code>
 * 
 * @since 2015/10/17 14:5:49
 */

'use strict';

// index.js
require('../index');

function test_math() {
	var n1 = 123, n2 = 234;
	CeL.assert([ CeL.GCD(n1, n2), 3 ], 'GCD(' + n1 + ', ' + n2 + ')');
}

function do_test() {
	CeL.assert([ typeof CeL.assert, 'function' ], 'CeL.assert is working.');
	CeL.run('data.math', test_math);
}

CeL.set_debug();
CeL.run([ 'application.debug', 'application.debug.log' ], do_test);
