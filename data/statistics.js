/**
 * @name CeL function for statistics
 * @fileoverview 本檔案包含了 statistics 用的 functions。
 * 
 * TODO: Combine statistics and charts/tables. Read .csv/.txt data.
 * 
 * @since
 * @example <code>
	CeL.run('data.statistics', function() {
		var data_array = [1, 2, 3];
		var statistics = CeL.statistics(data_array);
		console.log(statistics);
	});
	</code>
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
	 * @class 處理統計的 functions
	 * 
	 * @see 集中趨勢 https://en.wikipedia.org/wiki/Central_tendency
	 */
	function statistics(data_array) {
		// assert: data_array = [{Number},...]

		var statistics_status = Object.create(null);
		// summation
		var sum = 0, count = 0, variance = 0;
		for (var index = 0, length = data_array.length; index < length; index++) {
			var data = data_array[index];
			count++;
			sum += data;

			variance += data * data;

			// TODO: 中位數、眾數
			// https://stackoverflow.com/questions/4201292/on-algorithm-to-find-the-median-of-a-collection-of-numbers
		}

		Object.assign(statistics_status, {
			count : count,
			sum : sum,
			// 算術平均數 arithmetic mean, average
			mean : sum / count
		});

		// 變異數
		statistics_status.variance = variance = variance / count
				- statistics_status.mean * statistics_status.mean;
		// 標準差 standard deviation
		statistics_status.SD = Math.sqrt(variance);

		return statistics_status;
	}

	/**
	 * for JSDT: 有 prototype 才會將之當作 Class
	 */
	statistics// JSDT:_module_
	.prototype = {};

	return statistics;
}
