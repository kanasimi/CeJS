/**
 * @name CeL function for <a
 *       href="http://en.wikipedia.org/wiki/Random_number_generation"
 *       accessdate="2012/3/9 9:36" title="random number generator (RNG)">number
 *       generator</a>
 * @fileoverview 本檔案包含了生成數字用的 functions。
 * @since 2010/1/21 17:58:15
 * @example <code>
 * CeL.run('application.math.number_generator', function() {
 * 	// ..
 * });
 * </code>
 */

'use strict';
// 'use asm';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	name : 'application.math.number_generator',
	require : 'data.native.to_fixed|data.math.to_rational_number',
	code : module_code
});

function module_code(library_namespace) {
	// requiring
	var to_rational_number = this.r('to_rational_number');

	if (!Number.prototype.to_fixed) {
		Number.prototype.to_fixed = library_namespace.to_fixed;
	}

	/**
	 * null module constructor
	 * 
	 * @class 出數學題目用的 functions
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

	_// JSDT:_module_
	.
	/**
	 * 轉換數學式成容易閱讀的形式。
	 * 
	 * @param formula
	 *            數學式.
	 * @param {Boolean}[mode]
	 *            轉換模式.
	 * @returns
	 */
	express_formula = function(formula, mode) {
		if (Array.isArray(formula))
			formula = formula.join('');

		return _.express_formula.extra[formula]
		//
		|| (typeof formula === 'string' && formula ? mode
		//
		? formula.replace(/\+/g, '加').replace(/\-/g, '減')
		//
		.replace(/\*/g, '乘').replace(/\//g, '除')
		//
		: formula.replace(/\s*([+\-*\/])\s*/g, function($0, $1) {
			return ' ' + {
				'+' : '+',
				'-' : '-',
				'*' : '×',
				// obelus (symbol: ÷, plural: obeli)
				'/' : '÷'
			}[$1] + ' ';
		}) : '');
	};

	_// JSDT:_module_
	.express_formula.extra = {
		'+-*/' : '四則',
		// [Mathematics] to find a common denominator / the lowest common
		// denominator
		f_cd : '通分',
		reduction : '約分',
		converting_mixed : '代換(假分數←→帶分數)',
		compare_size : '比大小',
		with_decimal : '與小數運算'
	};

	/**
	 * http://163.32.181.11/ymt91050/m/%E6%95%B8%E5%AD%B8%E7%B7%B4%E7%BF%92%E9%A1%8C.htm
	 * http://webmail.ysps.tp.edu.tw/~wenji/material.htm
	 * 
	 * 一位小數加法(直式)
	 * 
	 * 一位小數減法(橫式)
	 */

	_// JSDT:_module_
	.
	/**
	 * 將問題 pattern 中的 '??' 等轉成實際數字，生成實際問題。
	 * 
	 * @param {String}problem_pattern
	 *            problem pattern. e.g., '???.??', '[??/?]', 可用 + - * /.
	 * @param {Integer}method
	 *            method. 1: 只是要取得亂數. 2: 取得整個數值的亂數. others: 產出整個題目。
	 * @returns
	 */
	parse_problem = function(problem_pattern, method) {
		if (typeof problem_pattern !== 'string' || !problem_pattern)
			return problem_pattern;

		var _s = _.parse_problem,
		/**
		 * gn: generate number
		 */
		gn = function(n, z) {
			/**
			 * z: can start with zero
			 */
			if (!z)
				n = n.replace(/\?/, function($0) {
					return 1 + Math.floor(Math.random() * 9);
				});
			return n.replace(/\?/g, function($0) {
				return Math.floor(Math.random() * 10);
			});
		}, gn2 = function(n) {
			return n.replace(
					/(\?*|0)\.(\?+)/g,
					function($0, $1, $2) {
						return ($1.indexOf('?') === -1 ? '0' : gn($1)) + '.'
								+ gn($2, 1);
					}).replace(/\?+/g, function($0) {
				return gn($0);
			});
		};

		if (false && !problem_pattern
		//
		.match(/^(((\?*|0)\.)?\?+|[+\-*\/]|\s){3,}$/))
			library_namespace.debug('No match: ' + problem_pattern);

		problem_pattern = problem_pattern.replace(/\[((\d\-\d|\d+)+)\]/g,
		//
		function($0, $1) {
			var n = $1.replace(/(\d)\-(\d)/g, function($0, $1, $2) {
				var i = Math.min($1, $2), n = '', M = Math.max($1, $2);
				for (; i < M; i++)
					n += i;
				return n;
			});
			return n.charAt(Math.floor(Math.random() * n.length));
		}).replace(/(\d)(\?+)/g, function($0, $1, $2) {
			return $1 + gn($2, 1);
		});

		problem_pattern = gn2(problem_pattern);

		// method === 1: 只是要取得亂數
		return method === 1 ? problem_pattern
		// method === 2: 取得整個數值的亂數
		: method === 2 ? problem_pattern.replace(/0+$|^0+/g, '') : _s
				.express(problem_pattern);
	};

	_// JSDT:_module_
	.parse_problem.express = function(q) {
		return typeof q !== 'string' ? [ q, q ]
		//
		: [ q.replace(/\/\//g, '/')
		//
		.replace(/\s*÷\s*/g, '/').replace(/\s*×\s*/g, '*')
		// .replace(/\s*=+\s*/g, '===')
		, q.replace(/\/\//g, '\\').replace(/[+\-*\/]/g, function($0) {
			return _.express_formula($0);
		}).replace(/\\/g, '/') ];
	};

	_// JSDT:_module_
	.
	/**
	 * 隨機生成 count 個不同之數字。
	 * 
	 * @param {String}pattern
	 *            生成數字之 pattern
	 * @param {Number}count
	 *            生成個數，預設 2。僅要一個時直接 call .parse_problem() 即可。
	 * @param {Function}comparator
	 *            回傳以 comparator 排序後的數列。
	 * @return {Array} [numbers] 排序過之數字
	 */
	get_different_numbers = function(pattern, count, comparator) {
		if (!count || isNaN(count))
			count = 2;

		var i = 0, s, seeds = [], seed_hash = {}, limit;
		for (; i < count; i++) {
			limit = 50;
			while (limit--
			//
			&& (!(s = parseFloat(_.parse_problem(pattern, 1)).to_fixed())
			//
			|| (s in seed_hash)))
				;
			if (!limit) {
				library_namespace
						.warn('Fault to generate number using pattern ['
								+ pattern + ']!');
			}

			seeds.push(s);
			seed_hash[s] = i;
		}

		if (comparator) {
			library_namespace.is_Function(comparator) ? seeds.sort(comparator)
					: seeds.sort();
		}

		return seeds;
	};

	_// JSDT:_module_
	.
	/**
	 * 演算解答.
	 * 
	 * @param {String}problem
	 *            problem
	 * @returns {String}answer in float, (帶)分數, ..
	 * @see data.math.quotient
	 */
	evaluate_value = function(problem) {
		// if(!isNaN(problem))return problem;
		if (!problem)
			return;

		problem = _.parse_problem.express(String(problem))[0];

		var answer, m = problem.match(/^(\d+(\.\d+)?)\/(\d+)$/);

		function adding(v) {
			if (v !== Math.floor(v)) {
				m = to_rational_number(v);
				// 處理真分數、假分數。
				answer += ' '
				// 約等於的符號是≈或≒，不等於的符號是≠。
				+ (m[2] < 1e-13 ? ' = ' : ' <span title="大約">≈</span> ')
				// http://zh.wikipedia.org/wiki/%E7%AD%89%E4%BA%8E
				+ '<span class="fraction">' + m[0] + ' / ' + m[1] + '</span>';

				// 處理帶分數。 mixed numeral (often called a mixed number, also
				// called a mixed fraction)
				if (m[0] >= m[1]) {
					problem = m[0] % m[1];
					answer += ' = <span class="mixed_numeral">'
					//
					+ (m[0] - problem) / m[1]
					//
					+ ' + ' + problem + ' / ' + m[1] + '</span>';
				}
			}
		}

		if (m) {
			answer = Math.floor(m[1] / m[3]).to_fixed(12) + ' ... '
			//
			+ (m[1] % m[3]).to_fixed()
			//
			+ (m[1] % m[3] ? ' <span title="大約">≈</span> '
			//
			+ (m[1] / m[3]).to_fixed() : ''), adding(m[1] / m[3]);
		} else {
			try {
				// 直接執行
				// 須預防 6/2/3 的情況
				m = 'return('
						+ problem.replace(/(\d+)\s+(\d+\/\d+)/g, '($1+$2)')
						+ '\n)';
				m = (new Function(m))();
				if (false) {
					library_namespace.debug('{return('
							+ problem.replace(/(\d+)\s+(\d+\/\d+)/g, '($1+$2)')
							+ ');}' + ' = ' + m);
				}
				if (isNaN(m)) {
					library_namespace
							.warn('evaluate_value: No problem generated for ['
									+ problem + '].');
				} else {
					answer = m.to_fixed();
					adding(m);
				}
			} catch (e) {
				library_namespace.warn('evaluate_value: 無法演算 [' + problem
						+ '] (' + m + '). ' + e);
				answer = '`' + problem + '`';
			}
		}

		return answer;
	};

	return (_// JSDT:_module_
	);
}
