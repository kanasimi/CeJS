/**
 * @name CeL function for statistics
 * @fileoverview 本檔案包含了 statistics 用的 functions。
 * 
 * TODO: Combine statistics and charts/tables. Read .csv/.txt data.
 * 
 * @since
 * @example <code>
 * CeL.run('data.statistics',function(){
 * 	// ..
 * });
 * </code>
 * 
 * @see <a href="http://www.jstat.org/" accessdate="2011/10/22 10:6">jStat : a
 *      JavaScript statistical library</a>
 */

'use strict';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'data.statistics',

	require : '',

	// 設定不匯出的子函式。
	// no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	/**
	 * null module constructor
	 * 
	 * @class 處理統計的 functions
	 */
	var _// JSDT:_module_
	= function() {
		// null module constructor
	};

	/**
	 * for JSDT: 有 prototype 才會將之當作 Class
	 */
	_// JSDT:_module_
	.prototype = {};

	/**
	 * ...
	 */

	return (_// JSDT:_module_
	);
}
