
/**
 * @name CeL function for math
 * @fileoverview 本檔案包含了數學演算相關的 functions。
 * @since
 */

/*
 * TODO: 方程式圖形顯示 by SVG
 */

// More examples: see /_test suite/test.js

'use strict';
if (typeof CeL === 'function')
CeL.run(
{
name: 'data.math',
require: 'data.code.compatibility.',
code : function(library_namespace) {



/**
 * null module constructor
 * 
 * @class 數學相關的 functions
 */
var _// JSDT:_module_
= function() {
	// null module constructor
};

/**
 * for JSDT: 有 prototype 才會將之當作 Class
 */
_// JSDT:_module_
.prototype = {
};



/*

數位
十分位 tenths digit
整數 whole number

*/

// ---------------------------------------------------------------------//
// basic constants. 定義基本常數。

var 

/**
 * empty product, or nullary product, 乘法單位元素.<br />
 * number * MULTIPLICATIVE_IDENTITY === number.<br />
 * 2/2, 3/3, ..
 * 
 * MULTIPLICATIVE_IDENTITY = 1
 * 
 * @type {Number}
 * @constant
 * 
 * @see https://en.wikipedia.org/wiki/Identity_element
 *      https://en.wikipedia.org/wiki/Empty_product
 */
MULTIPLICATIVE_IDENTITY = 1 / 1,
/**
 * Any nonzero number raised by the exponent 0 is 1.<br />
 * (any number) ^ 0 === Math.pow(number, 0) === ZERO_EXPONENT<br />
 * Math.pow(2, 0), Math.pow(3, 0), ..
 * 
 * ZERO_EXPONENT = 1
 * 
 * @type {Number}
 * @constant
 * 
 * @see https://en.wikipedia.org/wiki/Exponentiation
 */
ZERO_EXPONENT = Math.pow(1, 0),
/**
 * absorbing element, zero element.<br />
 * number * ABSORBING_ELEMENT === ABSORBING_ELEMENT<br />
 * Math.pow(2, 0), Math.pow(3, 0), ..
 * 
 * @type {Number}
 * @constant
 * 
 * @see https://en.wikipedia.org/wiki/Absorbing_element
 */
ABSORBING_ELEMENT = 0,
/**
 * multiplication sign. e.g., '⋅', '*', '×'.
 * 
 * @type {String}
 * @constant
 * 
 * @see https://en.wikipedia.org/wiki/Multiplication_sign
 *      https://en.wikipedia.org/wiki/Interpunct
 */
MULTIPLICATION_SIGN = '⋅',
/**
 * The biggest integer we can square. 超過此數則無法安全操作平方。
 * 
 * @type {Integer}
 */
sqrt_max_integer = Math.sqrt(Number.MAX_SAFE_INTEGER) | 0;


// ---------------------------------------------------------------------//


/**
 * use Horner's method to calculate the value of polynomial.
 * 
 * @param {Array}coefficients
 *            coefficients of polynomial.<br />
 *            coefficients: [ degree 0, degree 1, degree 2, .. ]
 * @param {Number}variable
 *            value of (x)
 * 
 * @returns {Number} the value of polynomial
 * 
 * @see https://en.wikipedia.org/wiki/Horner%27s_method
 */
function polynomial_value(coefficients, variable) {
	return coefficients.reduceRight(function(value, coefficient) {
		return value * variable + coefficient;
	});
}

_.polynomial_value = polynomial_value;


_// JSDT:_module_
.
/**
 * 輾轉相除 n1/n2 或 小數 n1/1 轉成 整數/整數。
 * 
 * @param {Number}
 *            n1 number 1
 * @param {Number}
 *            [n2] number 2
 * @param {Number}
 *            times max 次數, 1,2,..
 * 
 * @return {Array} 連分數序列 (continued fraction) ** 負數視 _.mutual_division.done 而定!
 */
mutual_division = function mutual_division(n1, n2, times) {
	var q = [], c;
	if (isNaN(times) || times <= 0)
		times = 80;
	if (!n2 || isNaN(n2))
		n2 = 1;

	if (n1 != Math.floor(n1)) {
		c = n1;
		var i = 9, f = n2;
		while (i--)
			// 以整數運算比較快！這樣會造成整數多4%，浮點數多1/3倍的時間，但仍值得。
			if (f *= 10, c *= 10, c === Math.floor(c)) {
				n1 = c, n2 = f;
				break;
			}
	}

	// 連分數負數之處理。更沒問題的: (n1 < 0?1:0) ^ (n2 < 0?1:0)
	if (_.mutual_division.mode && ((n1 < 0) ^ (n2 < 0))) {
		// 使兩數皆為正
		if (n2 < 0)
			n2 = -n2;
		else
			n1 = -n1;

		q.push(-(1 + (n1 - (c = n1 % n2)) / n2));
		n1 = n2, n2 -= c;
	}

	// old:
	if(false){
		while (b && n--) {
			// 2.08s@10000
			// 可能因為少設定（=）一次c所以較快。但（若輸入不為整數）不確保d為整數？用Math.floor((a-(c=a%b))/b)可確保，速度與下式一樣快。
			d.push((a - (c = a % b)) / b), a = b, b = c;
			// 2.14s@10000:mutual_division(.142857)
			// d.push(c=Math.floor(a/b)),c=a-b*c,a=b,b=c;
			// 2.2s@10000
			// d.push(Math.floor(a/b)),b=a%(c=b),a=c;
		}
		if (n)
			d.push(0);
	}

	// 2.4s@10000
	// 可能因為少設定（=）一次c所以較快。但（若輸入不為整數）不確保d為整數？用Math.floor((a-(c=a%b))/b)可確保，速度與下式一樣快。
	while (times--)
		if (n2)
			q.push((n1 - (c = n1 % n2)) / n2), n1 = n2, n2 = c;
		else {
			// [ .. , done mark, (最後非零的餘數。若原 n1, n2 皆為整數，則此值為
			// GCD。但請注意:這邊是已經經過前面為了以整數運算，增加倍率過的數值!!) ]
			q.push(_.mutual_division.done, n1);
			// library_namespace.debug('done: ' + q);
			break;
		}

	// 2.26s@10000
	// while(b&&n--)if(d.push((a-(c=a%b))/b),a=b,!(b=c)){d.push(0);break;}

	// var
	// m=1;c=1;while(m&&n--)d.push(m=++c%2?b?(a-(a%=b))/b:0:a?(b-(b%=a))/a:0);//buggy

	return q;
};

_// JSDT:_module_
.
mutual_division.done = -7;// ''

_// JSDT:_module_
.
/**
 * !!mode:連分數處理，對負數僅有最初一數為負。
 */
mutual_division.mode = 0;

_// JSDT:_module_
.
/**
 * 取得連分數序列的數值。
 * 
 * @param {Array}
 *            sequence 序列
 * @param {Number}
 *            [max_no] 取至第 max_no 個
 * 
 * @return {Number}連分數序列的數值
 * 
 * @requires mutual_division.done
 */
continued_fraction = function(sequence, max_no) {
	if (!Array.isArray(sequence) || !sequence.length)
		return sequence;

	if (sequence[sequence.length - 2] === _.mutual_division.done)
		sequence.length -= 2;

	if (sequence.length < 1)
		return sequence;

	if (!max_no/* ||max_no<2 */|| max_no > sequence.length)
		max_no = sequence.length;

	var a, b;
	if (max_no % 2)
		b = 1, a = 0;
	else
		a = 1, b = 0;
	if(false){ sequence[max_no++]=1;if(--max_no%2)b=sequence[max_no],a=s[--max_no];else
	 a=sequence[max_no],b=sequence[--max_no];}

	// library_namespace.debug('a=' + a + ', b=' + b + ', max_no=' + max_no);
	while (max_no--)
		if (max_no % 2)
			b += a * sequence[max_no];
		else
			a += b * sequence[max_no];
	// library_namespace.debug('a=' + a + ', b=' + b);
	return [ a, b ];
};

// quadratic (m√r + i) / D → continued fraction [.. , [period ..]]
// https://en.wikipedia.org/wiki/Periodic_continued_fraction
// Rosen, Kenneth H. (2005). Elementary Number Theory and its Applications (5th
// edition). Boston: Pearson Addison-Wesley. pp. 510-512.
function quadratic_to_continued_fraction(r, m, i, D) {
	if (!i)
		i = 0;
	if (!D)
		D = 1;
	if (!m)
		m = 1;
	else if (m < 0)
		m = -m, i = -i, D = -D;

	// (m√r + i) / D
	// = (√(r m^2) + i) / D
	// = (√(d in book) + P0) / Q0
	var d = m * m * r,
	//
	P = i, Q = D,
	// A: α in book.
	A, a, sequence = [], ptr = sequence, start_PQ;

	// Be sure Q0 | (d - P0^2)
	if ((d - P * P) % Q !== 0)
		P *= Q, d *= Q * Q, Q *= Q;

	// assert: now: Q0 | (d - P0^2)

	for (var sqrt = Math.sqrt(d), t; ;) {
		if (start_PQ) {
			if (P === start_PQ[0] && Q === start_PQ[1])
				return sequence;
		} else if (0 < (t = sqrt - P) && t < Q) {
			// test if α is purely periodic.
			start_PQ = [P, Q];
			sequence.push(ptr = []);
		}
		ptr.push(a = Math.floor(A = (sqrt + P) / Q));
		library_namespace.debug(((sequence === ptr ? 0 : sequence.length - 1) + ptr.length - 1) + ': P=' + P + ', Q=' + Q + ', α≈' + (10 * A | 0) / 10 + ', a=' + a);

		// set next Pn = a(n-1)Q(n-1) - P(n-1), Qn = (d - Pn^2) / Q(n-1).
		P = a * Q - P;
		Q = (d - P * P) / Q;
		// assert: Pn, Qn are both integers.
	}
}
_.quadratic_to_continued_fraction = quadratic_to_continued_fraction;

// get the first solution of Pell's equation: x^2 + d y^2 = 1 or -1.
// https://en.wikipedia.org/wiki/Pell%27s_equation
// Rosen, Kenneth H. (2005). Elementary Number Theory and its Applications (5th
// edition). Boston: Pearson Addison-Wesley. pp. 542-545.
function solve_Pell(d, is_m1) {
	// TODO
	;
}
_.solve_Pell = solve_Pell;


_// JSDT:_module_
.
/**
 * The best rational approximation. 取得值最接近之有理數 (use 連分數 continued fraction),
 * 取近似值. c.f., 調日法 在分子或分母小於下一個漸進分數的分數中，其值是最接近精確值的近似值。
 * 
 * @param {Number}
 *            number number
 * @param {Number}
 *            [rate] 比例在 rate 以上
 * @param {Number}
 *            [max_no] 最多取至序列第 max_no 個 TODO : 並小於 l: limit
 * 
 * @return [分子, 分母, 誤差]
 * 
 * @requires mutual_division,continued_fraction
 * @see https://en.wikipedia.org/wiki/Continued_fraction#Best_to_rational_numbers
 */
to_rational_number = function(number, rate, max_no) {
	if (!rate)
		// This is a magic number: 我們無法準確得知其界限為何。
		rate = 65536;
	var d = _.mutual_division(number, 1, max_no && max_no > 0 ? max_no : 20),
	i = 0, a, b = d[0], done = _.mutual_division.done;

	if (!b)
		b = d[++i];
	while (++i < d.length && (a = d[i]) !== done)
		if (a / b < rate)
			b = a;
		else
			break;

	if (false)
		library_namespace.debug(
			number + ' ' +
			// 連分數表示 (continued fraction)
			(d.length > 1 && d[d.length - 2] === _.mutual_division.done ?
				'=' + ' [<em>' + d[0] + ';' + d.slice(1, i).join(', ') + '</em>'
					+ (i < d.length - 2 ? ', ' + d.slice(i, -2).join(', ') : '')
					+ '] .. ' + d.slice(-1) :
				// 約等於的符號是≈或≒，不等於的符號是≠。
				// https://zh.wikipedia.org/wiki/%E7%AD%89%E4%BA%8E
				'≈' + ' [<em>' + d[0] + ';' + d.slice(1, i).join(', ') + '</em>'
					+ (i < d.length ? ', ' + d.slice(i).join(', ') : '') + ']: '
					+ d.length + ',' + i + ',' + d[i]
			)
		);
	d = _.continued_fraction(d, i);
	// library_namespace.debug('→ ' + d[0] + '/' + d[1]);
	if (d[1] < 0)
		d[0] = -d[0], d[1] = -d[1];

	return [ d[0], d[1], d[0] / d[1] - number ];
};


/**
 * 求多個數之 GCD(Greatest Common Divisor, 最大公因數/公約數).<br />
 * Using Euclidean algorithm(輾轉相除法).<br />
 * 
 * TODO: 判斷互質.
 * 
 * @param {Integers}
 *            number_array number array
 * 
 * @returns {Integer} GCD of the numbers specified
 */
function GCD(number_array) {
	if (arguments.length > 1)
		// Array.from()
		number_array = Array.prototype.slice.call(arguments);

	// 不在此先設定 gcd = number_array[0]，是為了讓每個數字通過資格檢驗。
	var index = 0, length = number_array.length, gcd, remainder, number;
	while (index < length) {
		if (typeof (number = number_array[index++]) !== 'number')
			number = parseInt(number);
		if (number = Math.abs(number)) {
			if (gcd)
				// Euclidean algorithm 輾轉相除法。
				while (remainder = number % gcd) {
					number = gcd;
					// 使用絕對值最小的餘數。
					gcd = Math.min(remainder, gcd - remainder);
				}
			else
				gcd = number;
			if (!(1 < gcd))
				break;
		}
	}
	return gcd;
}

_// JSDT:_module_
.GCD = GCD;


_// JSDT:_module_
.
/**
 * 求多個數之 LCM(Least Common Multiple, 最小公倍數): method 1.<br />
 * Using 類輾轉相除法.<br />
 * 
 * TODO: 更快的方法： 短除法? 一次算出 GCD, LCM?
 * 
 * @param {Integers}
 *            number_array number array
 * 
 * @returns {Integer} LCM of the numbers specified
 */
LCM = function(number_array) {
	if (arguments.length > 1)
		// Array.from()
		number_array = Array.prototype.slice.call(arguments);

	var i = 0, l = number_array.length, lcm, r = [], n, n0, lcm0;
	// 正規化數字
	for (; i < l; i++) {
		if (n = Math.abs(parseInt(number_array[i])))
			r.push(n);
		// 允許 0:
		// else if (!n) return n;
	}
	// r.sort().reverse();
	for (number_array = r, l = number_array.length, lcm = number_array[0], i = 1; i < l; i++) {
		n = n0 = number_array[i];
		lcm0 = lcm;
		// 倒反版的 Euclidean algorithm 輾轉相除法.
		// 反覆讓兩方各自加到比對方大的倍數，當兩者相同時，即為 lcm。
		while (lcm !== n) {
			if (lcm > n) {
				if (r = -lcm % n0) {
					n = lcm + r + n0;
				} else {
					// n0 整除 lcm: 取 lcm 即可.
					break;
				}
			} else {
				if (r = -n % lcm0) {
					lcm = n + r + lcm0;
				} else {
					// lcm0 整除 n: 取 n 即可.
					lcm = n;
					break;
				}
			}
		}
	}
	return lcm;
};

_// JSDT:_module_
.
/**
 * 求多個數之 LCM(Least Common Multiple, 最小公倍數): method 2.<br />
 * Using 類輾轉相除法.<br />
 * 
 * @param {Integers}
 *            number_array number array
 * @returns {Integer} LCM of the numbers specified
 */
LCM2 = function(number_array) {
	if (arguments.length > 1)
		// Array.from()
		number_array = Array.prototype.slice.call(arguments);

	var i = 0, l = number_array.length, lcm = 1, r, n, num, gcd;
	for (; i < l && lcm; i++) {
		// 每個數字都要做運算，雖可確保正確，但沒有效率!
		if (!isNaN(num = n = Math.abs(parseInt(number_array[i])))) {
			gcd = lcm;
			// Euclidean algorithm.
			while (r = n % gcd)
				n = gcd, gcd = r;
			lcm = num / gcd * lcm;
		}
	}
	return lcm;
};


/**
 * Get <a href="https://en.wikipedia.org/wiki/Extended_Euclidean_algorithm"
 * accessdate="2013/8/3 19:45">Extended Euclidean algorithm</a><br />
 * 
 * @param {Integer}n1
 *            number 1
 * @param {Integer}n2
 *            number 2
 * @returns [ GCD, m1, m2 ]: GCD = m1 * n1 + m2 * n2
 * 
 * @see Euclidean_division() @ data.math
 * @since 2013/8/3 20:24:30
 */
function Extended_Euclidean(n1, n2) {
	var remainder, quotient, use_g1 = false,
	// 前一group [dividend 應乘的倍數, divisor 應乘的倍數]
	m1g1 = 1, m2g1 = 0,
	// 前前group [dividend 應乘的倍數, divisor 應乘的倍數]
	m1g2 = 0, m2g2 = 1;

	while (remainder = n1 % n2) {
		quotient = (n1 - remainder) / n2 | 0;
		// 現 group = remainder = 前前group - quotient * 前一group
		if (use_g1 = !use_g1)
			m1g1 -= quotient * m1g2, m2g1 -= quotient * m2g2;
		else
			m1g2 -= quotient * m1g1, m2g2 -= quotient * m2g1;
		// swap numbers
		n1 = n2;
		n2 = remainder;
	}
	return use_g1 ? [ n2, m1g1, m2g1 ] : [ n2, m1g2, m2g2 ];
}

_.EGCD = Extended_Euclidean;



/**
 * 帶餘除法 Euclidean division。<br />
 * 除非設定 closest，否則預設 remainder >= 0.
 * 
 * @param {Number}dividend
 *            被除數。
 * @param {Number}divisor
 *            除數。
 * @param {Boolean}[closest]
 *            get the closest quotient
 * 
 * @returns {Array} [ {Integer}quotient 商, {Number}remainder 餘數 ]
 * 
 * @see http://stackoverflow.com/questions/14997165/fastest-way-to-get-a-positive-modulo-in-c-c
 * @see Extended_Euclidean() @ data.math
 * 
 * @since 2015/10/31 10:4:45
 */
function Euclidean_division(dividend, divisor, closest) {
	if (false)
		return [ Math.floor(dividend / divisor),
		// 轉正。保證餘數值非負數。
		(dividend % divisor + divisor) % divisor ];

	var remainder = dividend % divisor;
	if (closest) {
		if (remainder !== 0
		//
		&& Math.abs(2 * remainder) > Math.abs(divisor))
			if (remainder < 0)
				remainder += Math.abs(divisor);
			else
				remainder -= Math.abs(divisor);

	} else if (remainder < 0)
		// assert: (-0 < 0) === false
		remainder += Math.abs(divisor);

	return [ Math.round((dividend - remainder) / divisor), remainder ];
}

_.division = Euclidean_division;




/**
 * 從數集 set 中挑出某些數，使其積最接近指定的數 target。<br />
 * To picks some numbers from set, so the product is approximately the target
 * number.
 * 
 * TODO: improve/optimize
 * 
 * @param {Array}set
 *            number set of {Natural}
 * @param {Natural}target
 *            target number
 * @param {Object}[options]
 *            options 設定特殊功能:<br />
 * 
 * @returns {Array}某些數，其積最接近 target。
 * 
 * @see http://stackoverflow.com/questions/19572043/given-a-target-sum-and-a-set-of-integers-find-the-closest-subset-of-numbers-tha
 */
function closest_product(set, target, options) {
	var status, minor_data;
	if (Array.isArray(options)) {
		status = options;
		minor_data = status[0];
		options = minor_data.options;

	} else {
		// 初始化
		if (!options)
			options = new Boolean;
		else if (typeof options === 'number')
			options = {
				direction : options
			};
		else if (typeof options === 'boolean')
			options = {
				sorted : options
			};
		minor_data = [ Infinity ];
		minor_data.options = options;
		// status = [ [minor, set of minor], product, set of product ]
		status = [ minor_data, ZERO_EXPONENT, [] ];
		if (!options.sorted)
			set = set.clone()
			// 由小至大排序。
			.sort(function(a, b) {
				return a - b;
			});
	}

	// direction = -1: 僅接受小於 target 的積。
	// direction = +1: 僅接受大於 target 的積。
	var direction = options.direction,
	//
	product = status[1], selected = status[2];

	set.some(function(natural, index) {
		if (selected[index])
			// 已經處理過，跳過。
			return;

		var _product = product * natural, _selected,
		/** {Number}差 >= 0 */
		difference = Math.abs(target - _product),
		// 是否發現新極小值。採用 minor_data 而不 cache 是因為此間 minor_data 可能已經改變。
		_status = difference <= minor_data[0];
		library_namespace.debug(target + '=' + (target - _product) + '+'
				+ natural + '×' + product + ', ' + product + '='
				+ (set.filter(function(n, index) {
					return selected[index];
				}).join('⋅') || 1), 6, 'closest_product');

		if (target < _product) {
			library_namespace.debug('target < _product, direction: ' + direction, 6, 'closest_product');
			if (!_status || direction < 0) {
				library_namespace.debug('積已經過大，之後不會有合適的。', 5, 'closest_product');
				return true;
			}
		}

		_selected = selected.clone();
		_selected[index] = true;

		if (_status && (!(direction > 0) || target <= _product)) {
			_status = set.filter(function(n, index) {
				return _selected[index];
			}).join(closest_product.separator);
			if (difference === minor_data[0]) {
				if (minor_data.includes(_status)) {
					library_namespace.debug('已經處理過相同的，跳過。', 5,
							'closest_product');
					return;
				}
				minor_data.push(_status);
			} else {
				minor_data.clear();
				minor_data.push(difference, _status);
			}
			library_namespace.debug('發現極小值:' + target + '=' + difference + '+'
					+ natural + '×' + product + ', ' + product + '='
					+ (set.filter(function(n, index) {
						return selected[index];
					}).join('⋅') || 1), 3, 'closest_product');
		}

		_status = [ minor_data, _product, _selected ];
		library_namespace.debug('繼續探究是否有更小的差:' + _status.join(';'), 4,
				'closest_product');
		closest_product(set, target, _status);
	});

	return minor_data.length > 1 && minor_data;
}

closest_product.separator = MULTIPLICATION_SIGN;

_.closest_product = closest_product;

// TODO:將數列分為積最接近的兩組。


/**
 * Get <a href="https://en.wikipedia.org/wiki/Modular_multiplicative_inverse"
 * accessdate="2013/8/3 20:10">modular multiplicative inverse</a> (模反元素)
 * 
 * TODO:<br />
 * untested!
 * 
 * @param {Integer}number
 *            number
 * @param {Integer}modulo
 *            modulo
 * @returns {Integer} modular multiplicative inverse
 * @since 2013/8/3 20:24:30
 */
function modular_inverse(number, modulo) {
	number = Extended_Euclidean(number, modulo);
	if (number[0] === 1)
		return (number = number[1]) < 0 ? number + modulo : number;
}

_.modular_inverse = modular_inverse;


// factorial_cache[ n ] = n!
// factorial_cache = [ 0! = 1, 1!, 2!, .. ]
var factorial_cache = [ 1 ], factorial_cache_to;
/**
 * Get the factorial (階乘) of (integer).<br />
 * 
 * @param {integer}integer
 *            safe integer. 0 ~ 18
 * @returns {safe integer} n的階乘.
 * @see https://en.wikipedia.org/wiki/Factorial
 */
function factorial(integer) {
	var length = factorial_cache.length;
	if (length <= integer && !factorial_cache_to) {
		var f = factorial_cache[--length];
		while (length++ < integer)
			if (isFinite(f *= length))
				factorial_cache.push(f);
			else {
				factorial_cache_to = length - 1;
				break;
			}
	}
	return integer < length ? factorial_cache[integer] : Infinity;
}
_.factorial = factorial;


// ---------------------------------------------------------------------//

/*
 * http://www.math.umbc.edu/~campbell/NumbThy/Class/Programming/JavaScript.html
 * http://aoki2.si.gunma-u.ac.jp/JavaScript/
 */

/**
 * 得到開方數，相當於 Math.floor(Math.sqrt(number)) === Math.sqrt(number) | 0. get
 * integer square root. TODO: use 牛頓法
 * 
 * @param {Number}
 *            positive number
 * 
 * @return r, r^2 <= number < (r+1)^2
 * 
 * @see <a href="http://www.azillionmonkeys.com/qed/sqroot.html"
 *      accessdate="2010/3/11 18:37">Paul Hsieh's Square Root page</a><br />
 *      <a
 *      href="http://www.embeddedrelated.com/usenet/embedded/show/114789-1.php"
 *      accessdate="2010/3/11 18:34">Suitable Integer Square Root Algorithm for
 *      32-64-Bit Integers on Inexpensive Microcontroller? | Comp.Arch.Embedded |
 *      EmbeddedRelated.com</a>
 */
function floor_sqrt(number) {
	if (isNaN(number = Math.floor(number)))
		return;
	var g = 0, v, h, t;
	while ((t = g << 1) < (v = number - g * g)) {
		// library_namespace.debug(t + ', ' + v);
		h = 1;
		while (h * (h + t) <= v)
			// 因為型別轉關係，還是保留 << 而不用 *2
			h <<= 1;// h *= 2;
		g += h >> 1;// h / 2;//
	}
	// library_namespace.debug('end: ' + t + ', ' + v);
	return g;
}

_.floor_sqrt = floor_sqrt;


/** all possible last 2 digits of square number */
var square_ending = library_namespace.null_Object();
[0, 1, 4, 9, 16, 21, 24, 25, 29, 36, 41, 44, 49, 56, 61, 64, 69, 76, 81, 84, 89, 96].forEach(function(n) {
	square_ending[n] = 1;
});

// 完全平方數, a square number or perfect square. TODO: use 牛頓法
// is square number
function is_square(number) {
	if (!((number % 100) in square_ending))
		return false;

	number = Math.sqrt(number);
	return number === (number | 0);
}
_.is_square = is_square;



// ---------------------------------------------------------------------//

/** {Array}Collatz_conjecture_steps[number] = steps. cache 以加快速度。 */
var Collatz_conjecture_steps_cache = [ , 1 ];
if (false) {
	// 此法費時 1.5 倍， 12s → 19s
	Collatz_conjecture_steps_cache = new Array(1000001);
	Collatz_conjecture_steps_cache[1] = 1;
}
// assert: Collatz_conjecture_steps_cache[1] === 1 (因程式判別方法需要此項)

// Collatz conjecture
// https://en.wikipedia.org/wiki/Collatz_conjecture
function Collatz_conjecture(natural) {
	if (!(natural > 0))
		return;

	var chain = [ natural ];
	while (natural > 1) {
		chain.push(natural % 2 === 0 ? natural /= 2
				: (natural = natural * 3 + 1));
	}
	//Collatz_conjecture_steps_cache[natural] = chain.length;

	// return all terms
	return chain;
}


// 為計算 steps 特殊化。
// assert: CeL.Collatz_conjecture.steps(natural) === CeL.Collatz_conjecture(natural).length
function Collatz_conjecture_steps(natural) {
	if (!(natural > 0))
		return;

	var chain = [];
	while (!(natural in Collatz_conjecture_steps_cache)) {
		chain.push(natural);
		if (natural % 2 === 0)
			natural /= 2;
		else
			natural = natural * 3 + 1;
	}

	var steps = Collatz_conjecture_steps_cache[natural] + chain.length, s = steps;
	// 紀錄 steps。
	chain.forEach(function(natural) {
		Collatz_conjecture_steps_cache[natural] = s--;
	});
	return steps;
}

/*

backwards 反向:
1000000: 153 steps
999999: 259 steps
999667: 290 steps
999295: 396 steps
997823: 440 steps
970599: 458 steps
939497: 507 steps
837799: 525 steps

*/

// search the longest chain / sequence below ((natural))
function Collatz_conjecture_longest(natural) {
	if (!(natural > 0))
		return;

	var max_steps = 0, max_steps_natural;
	// brute force
	for (var n = 1, steps, _n; n <= natural; n++) {
		if (n in Collatz_conjecture_steps_cache)
			steps = Collatz_conjecture_steps_cache[_n = n];
		else {
			steps = Collatz_conjecture_steps(_n = n);
			// 預先快速處理所有 2倍數字。採用此方法，約可增加 5% 速度。不採用此方法，n 正反向速度差不多。
			while (_n * 2 <= natural) {
				Collatz_conjecture_steps_cache[_n *= 2] = ++steps;
			}
		}
		if (max_steps < steps) {
			library_namespace.debug(natural + ': ' + steps + ' steps', 3,
					'Collatz_conjecture.longest');
			max_steps = steps;
			max_steps_natural = _n;
		}
	}
	return [ max_steps_natural, max_steps ];
}

_.Collatz_conjecture = Collatz_conjecture;
Collatz_conjecture.steps = Collatz_conjecture_steps;
Collatz_conjecture.longest = Collatz_conjecture_longest;


// ---------------------------------------------------------------------//


/** {Array}質數列表。 cache 以加快速度。 */
var primes = [2, 3, 5],
/**
 * last prime tested.<br />
 * assert: primes_last_test is ((6n ± 1)). 因此最起碼應該從 5 開始。
 * 
 * @type {Natural}
 */
primes_last_test = primes[primes.length - 1];

// integer: number to test
function test_is_prime(integer, index, sqrt) {
	// assert: integer === Math.floor(integer)
	index |= 0;
	if (!sqrt)
		sqrt = floor_sqrt(integer);
	for (var prime, length = primes.length ; index < length;) {
		if (integer % (prime = primes[index++]) === 0)
			return integer === prime ? false : prime;
		if (sqrt < prime)
			return false;
	}
	// 質數列表中的質數尚無法檢測 integer。
}

// index starts from 1!
function prime(index, limit) {
	if (primes.length < index) {
		// assert: primes_last_test is ((6n ± 1))
		/** {Boolean}p1 === true: primes_last_test is 6n+1. else: primes_last_test is 6n-1 */
		var p1 = primes_last_test % 6 === 1;

		for (; primes.length < index && Number.isSafeInteger(primes_last_test);) {
			primes_last_test += (p1 = !p1) ? 2 : 4;
			// 實質為 https://en.wikipedia.org/wiki/Sieve_of_Eratosthenes
			if (!test_is_prime(primes_last_test, 2))
				primes.push(primes_last_test);
			if (limit && limit <= primes_last_test)
				break;
		}
		library_namespace.debug('primes_last_test = ' + primes_last_test);
	}

	return index > 0 ? primes[index - 1] : primes;
}
_.prime = prime;


// prime #5484598 = 94906249, the biggest prime < Math.sqrt(Number.MAX_SAFE_INTEGER) - 1.
// the 2nd biggest prime is 94906247.

// CeL.prime(CeL.prime_pi(Number.MAX_SAFE_INTEGER = 2^53 - 1)) = 9007199254740881
function prime_pi(value) {
	value = Math.abs(Math.floor(value));
	if (primes_last_test < value)
		prime(value, value);
	// +1: index of function prime() starts from 1!
	return primes.search_sorted(value, true) + 1;
}
_.prime_pi = prime_pi;



// return multiplicand × multiplier % modulus
// assert: 三者皆為 natural number, and Number.isSafeInteger() is OK.
// max(multiplicand, multiplier) < modulus. 否則會出現錯誤!
function multiply_modulo(multiplicand, multiplier, modulus) {
	var quotient = multiplicand * multiplier;
	if (Number.isSafeInteger(quotient))
		return quotient % modulus;

	// 避免 overflow
	if (multiplicand > multiplier)
		quotient = multiplicand, multiplicand = multiplier, multiplier = quotient;
	if (quotient === 1)
		throw new Error('Please use data.math.integer instead!');
	quotient = Math.floor(modulus / multiplicand);
	quotient = (multiplicand * (multiplier % quotient) - Math.floor(multiplier / quotient) * (modulus % multiplicand)) % modulus;
	return quotient;
}
_.multiply_modulo = multiply_modulo;

// return integer ^ exponent % modulus
// assert: 三者皆為 natural number, and Number.isSafeInteger() is OK. 否則會出現錯誤!
function power_modulo(integer, exponent, modulus) {
	for (var remainder = 1, power = integer % modulus; ;) {
		if (exponent % 2 === 1)
			remainder = multiply_modulo(remainder, power, modulus);
		if ((exponent >>= 1) === 0)
			return remainder;
		if ((power = multiply_modulo(power, power, modulus)) === 1)
			return remainder;
	}
}
_.power_modulo = power_modulo;


function power_modulo(natural, exponent, modulus) {
	var remainder = 1;
	for (natural %= modulus; exponent > 0; natural = natural * natural % modulus, exponent >>= 1)
		if (exponent % 2 === 1)
			remainder = remainder * natural % modulus;
	return remainder;
}
_.power_modulo = power_modulo;

// Miller–Rabin primality test
// return true: is composite, undefined: probable prime (PRP) / invalid number
// https://en.wikipedia.org/wiki/Miller%E2%80%93Rabin_primality_test
function Miller_Rabin(natural, times) {
	if (natural % 2 === 0)
		return natural !== 2;
	if (!(natural < sqrt_max_integer) || natural < 2)
		return;

	var n_1 = natural - 1, d = n_1, s = 0, a, x;
	do {
		s++, d /= 2;
	} while (d % 2 === 0);
	// assert: s > 0

	if (!(times |= 0))
		times = 3;

	for (var prime_index = 0; prime_index < times;) {
		// 3rd 起用大數( > 307) 偵測。
		x = power_modulo(prime(++prime_index + (prime_index < 3 ? 0 : 60)), d, natural);
		if (x === 1 || x === n_1)
			continue;

		var i = 1, j = 1;
		for (; i < s; i++) {
			x = x * x % natural;
			if (x === 1)
				return true;
			if (x === n_1) {
				j = 0;
				break;
			}
		}
		if (j)
			// composite
			return true;
	}

	// probable prime to base 2, 3.

	// probable prime (PRP), probably prime
	// https://en.wikipedia.org/wiki/Probable_prime
}
_.Miller_Rabin = Miller_Rabin;


// return false: is prime,
// number: min factor,
// undefined: probable prime (PRP) / invalid number,
// true: is composite.
function not_prime(natural) {
	if (!Number.isSafeInteger(natural) || natural < 2)
		return;

	var p;
	// 可先檢測此數是否在質數列表中。

	// 採用試除法, use trial division。
	if (false) {
		var sqrt = floor_sqrt(natural = p);
		p = 0;
		while ((p = test_is_prime(natural, p, sqrt)) === undefined) {
			// 多取一些質數。
			prime((p = primes.length) + 1);
		}
	}


	// 為 Miller_Rabin() 暖身。
	prime(70);
	if ((p = test_is_prime(natural)) === undefined)
		p = Miller_Rabin(natural);

	return p;
}
_.not_prime = not_prime;


function Pollards_rho_1980(natural) {
	if (natural % 2 === 0)
		return 2;
	if (natural % 3 === 0)
		return 3;
	if (!(natural < sqrt_max_integer) || natural < 2)
		return;

	// reset initial value
	// assert: natural > max(y, m, c)
	var x = natural - 4,
		y = 2 + (Math.random() * x | 0),
		m = 2 + (Math.random() * x | 0),
		c = 2 + (Math.random() * x | 0),
		r = 1, q = 1, i, k, ys, G;
	do {
		for (x = y, i = r; i--;)
			// f(x) = (x^2 + c) % N
			y = (y * y % natural + c) % natural;
		k = 0;
		do {
			for (ys = y, i = Math.min(m, r - k) ; i-- ;) {
				// f(x) = (x^2 + c) % N
				y = (y * y % natural + c) % natural;
				q = q * Math.abs(x - y) % natural;
			}
			G = GCD(q, natural);
			k += m;
		} while (k < r && G === 1);
		r *= 2;
		// TODO: 當 r 過大，例如為十位數以上之質數時，過於消耗時間。
	} while (G === 1);

	if (natural === G)
		do {
			// f(x) = (x^2 + c) % N
			ys = (ys * ys % natural + c) % natural;
			G = GCD(Math.abs(x - ys), natural);
		} while (G === 1);

	return natural === G && G;
}
_.Pollards_rho = Pollards_rho_1980;



// ---------------------------------------------------------------------//


// CeL.factorize(natural > 1).toString(exponentiation_sign, multiplication_sign)
function factors_toString(exponentiation_sign, multiplication_sign) {
	if (!exponentiation_sign && !Number.prototype.to_super)
		exponentiation_sign = true;

	if (!multiplication_sign)
		// https://en.wikipedia.org/wiki/Multiplication_sign
		multiplication_sign = '⋅';
	else if (multiplication_sign === true)
		// https://en.wikipedia.org/wiki/Interpunct
		multiplication_sign = '×';
	// others: '*'

	var list = [];

	for (var factor in this) {
		if (this[factor] > ZERO_EXPONENT)
			// expand exponentiation
			factor += exponentiation_sign === true ? (multiplication_sign + factor).repeat(this[factor] - ZERO_EXPONENT)
			// https://en.wikipedia.org/wiki/Exponentiation#In_programming_languages
			// exponentiation_sign: ^, **, ↑, ^^, ⋆
			: exponentiation_sign ? exponentiation_sign + this[factor]
			// https://en.wikipedia.org/wiki/Prime_factor
			// To shorten prime factorizations, factors are often expressed in
			// powers (multiplicities).
			: this[factor].to_super();
		list.push(factor);
	}

	return list.join(multiplication_sign);
}

// 計算所有因數個數。
// 計算所有質因數個數: Object.keys(factors).length
// 質因數列表: Object.keys(factors)
function count_all_factors() {
	var count = MULTIPLICATIVE_IDENTITY;
	for (var prime in this) {
		// exponent
		count *= this[prime] + 1;
	}
	// re-define count
	Object.defineProperty(this, 'count', {
		enumerable : false,
		value : count
	});
	return count;
}

// 歐拉函數 φ(n) 是小於或等於n的正整數中與n互質的數的數目。
function coprime() {
	var count = this.natural;
	for (var prime in this) {
		count = count / prime * (prime - 1);
	}
	// re-define coprime
	Object.defineProperty(this, 'coprime', {
		enumerable : false,
		value : count
	});
	return count;
}

/**
 * 取得某數的質因數分解，整數分解/因式分解/素因子分解, prime factorization, get floor factor.<br />
 * 唯一分解定理(The Unique Factorization Theorem)告訴我們素因子分解是唯一的，這即是稱為算術基本定理 (The
 * Fundamental Theorem of Arithmeric) 的數學金科玉律。<br />
 * 
 * @param {Number}natural
 *            integer number >= 2
 * @param {Number}radix
 *            output radix
 * @param {Number}index
 *            start prime index
 * 
 * @return {Object}prime factors { prime1:power1, prime2:power2, .. }
 * 
 * @requires floor_sqrt
 * 
 * @see <a href="http://homepage2.nifty.com/m_kamada/math/10001.htm"
 *      accessdate="2010/3/11 18:7">Factorizations of 100...001</a>
 */
function factorize(natural, radix, index, factors) {
	if (!Number.isSafeInteger(natural) || natural < 2
		/*
		 * javascript 可以表示的最大整數值 = 10^21-2^16-1 = 999999999999999934463
		 * 
		 * @see http://www.highdots.com/forums/javascript/how-js-numbers-represented-internally-166538-4.html
		 */
		// && !(1 < (natural = Math.floor(Math.abs(natural))) && natural <
		// 999999999999999934469)
		)
		return;

	if (!radix)
		radix = undefined;
	try {
		radix.toString(radix);
	} catch (e) {
		// IE8?
		radix = 10;
	}
	if (!factors)
		factors = library_namespace.null_Object();
	Object.defineProperties(factors, {
		natural : {
			enumerable : false,
			value : natural
		},
		toString : {
			enumerable : false,
			value : factors_toString
		},
		count : {
			enumerable : false,
			configurable : true,
			get : count_all_factors
		},
		coprime : {
			enumerable : false,
			configurable : true,
			get : coprime
		}
	});


	index |= 0;
	var p = 1, sqrt = floor_sqrt(natural);
	for (var power, length = primes.length ; p <= sqrt ;)
		// 採用試除法, trial division。
		if (natural % (p = index < length ? primes[index++]
			// find enough primes
			: prime(++index)) === 0) {
			for (power = 1; (natural /= p) % p === 0;)
				power++;
			factors[p.toString(radix)] = power;
			sqrt = floor_sqrt(natural);
		}
	if (1 < natural)
		factors[natural.toString(radix)] = 1;
	return factors;

	// 為了獲得確實結果，在 (Number.MAX_SAFE_INTEGER) 範圍內不採用 Pollard's rho。
	// 事實上，若加上 (natural < sqrt_max_integer) 的限制，
	// 一般說來在此範圍內使用 Pollard's rho 亦不切實際。

	if (sqrt < p) {
		// assert: natural is now prime.
		if (1 < natural)
			factors[natural.toString(radix)] = 1;
		return factors;
	}
	var fA = [], fac = function (i) {
		if (sqrt_max_integer <= natural || not_prime(i)) {
			var p, count = 3;
			while (count-- && !(p = Pollards_rho_1980(i)));
			if (p) {
				fac(p);
				fac(i / p);
				return;
			} else
				library_namespace.warn('factorize: 無法分解'
					+ (library_namespace.is_debug() && Miller_Rabin(i) ? '合數' : '') + '因子 [' + i.toString() + ']；您或許有必要自行質因數分解此數！');
		}
		fA.push(i);
	};
	fac(natural);

	if (Array.isArray(factors)) {
		// TODO
	}

	fA.sort(function (a, b) { return a - b; });
	fA.forEach(function (p) {
		p = p.toString(radix);
		if (p in factors)
			factors[p]++;
		else
			factors[p] = 1;
	});

	return factors;
}

factorize._toString = factors_toString;

_.factorize = factorize;


// test
(function() {
	function count(n) {
		var a = factorize(n), s = '', v = 1;
		if (a) {
			for ( var i in a) {
				s += '*' + i + (a[i] > 1 ? '^' + a[i] : '');
				v *= Math.pow(i, a[i]);
			}
			s = s.substr(1) + '=' + v + '=' + n;
		} else
			s = 'error! ' + n;
		document.getElementById('result').value += s
				+ '\n-------------------------------------------\n';
	}
});


function first_factor(natural) {
	for (var p = 1, sqrt = floor_sqrt(natural), index = 0, length = primes.length ; p <= sqrt ;)
		// 採用試除法, trial division。
		if (natural % (p = index < length ? primes[index++]
			// find enough primes
			: prime(++index)) === 0)
			return p;
	return natural;
}

_.first_factor = first_factor;


// ---------------------------------------------------------------------//


_// JSDT:_module_
.
/**
 * 猜測一個數可能的次方數。
 * 
 * @param {Number}
 *            number 數字
 * @param {Boolean}
 *            type false: base 為整數, true: base 為有理數
 * 
 * @returns [{Integer} base 分子, {Integer} base 分母, {Integer} exponent 分子,
 *          {Integer} exponent 分母]
 * 
 * @since 2005/2/18 19:20 未完成
 */
guess_exponent = function(number, type) {
	var bn, bd, en = 1, ed, sq = [ 1, number ], t, q,
	// default error, accuracy, stopping tolerance, 容許誤差 
	error = Number.EPSILON,
	//
	g = function(n) {
		q = _.to_rational_number(n, 99999);
		if ((!type || q[1] === 1) && !(q[0] > 99999 && q[1] > 99999)
				&& q[2] / n < error)
			bn = q[0], bd = q[1], ed = t;
	};

	if (!ed)
		g(sq[t = 1]);
	if (!ed)
		g(sq[t = 2] = sq[1] * sq[1]);
	if (!ed)
		g(sq[t = 3] = sq[1] * sq[2]);
	if (!ed)
		g(sq[t = 4] = sq[2] * sq[2]);
	if (!ed)
		g(sq[t = 5] = sq[2] * sq[3]);
	if (!ed)
		bn = number, bd = ed = 1;

	return [ bn, bd, en, ed ];
};




/**
 * get random prime(s)
 * 
 * @param {Integer}count
 *            個數
 * @param {Array}exclude
 *            排除
 * @param {Boolean}all_different
 * 
 * @returns random prime / random prime array
 * 
 * @since 2009/10/21 11:57:47
 */
function get_random_prime(count, exclude, all_different) {
	var i, j, p = [], l;
	if (!count || count < 1)
		count = 1;
	if (!get_random_prime.excluded)
		get_random_prime.excluded = [];
	if (exclude)
		exclude = [];

	// 先行準備好足夠的 primes。
	prime(2 * count, 2 * count);

	for (j = 0; j < count; j++) {
		// timeout
		l = 80;
		do {
			i = Math.round(10 * Math.tan(Math.random() * 1.5));
			if (!--l)
				// timeout
				return;
		} while (get_random_prime.excluded[i]);
		p.push(primes[i]);
		if (exclude)
			exclude.push(i);
	}

	// 選完才排除本次選的
	if (exclude)
		for (j = 0, l = exclude.length; j < l; j++) {
			i = exclude[j];
			if (get_random_prime.excluded[i])
				get_random_prime.excluded[i]++;
			else
				get_random_prime.excluded[i] = 1;
		}

	return count === 1 ? p[0] : p;
}


// return [GCD, n1, n2, ..]
get_random_prime.get_different_number_set = function(count, till, GCD_till) {
	delete this.excluded;
	if (!GCD_till)
		GCD_till = 1e5;
	if (!till)
		till = 1e5;

	/**
	 * 求乘積, 乘到比till小就回傳.
	 * 
	 * @param nums
	 *            num array
	 * @param till
	 * @returns {Number}
	 */
	function get_product(nums, till) {
		var p = 1, i = 0, l = nums.length;
		for (; i < l; i++) {
			if (till && p * nums[i] > till)
				break;
			p *= nums[i];
		}
		return p;
	}

	var GCD = get_product(this(20, 1), GCD_till), na = [], n_e = [], n, i = 0, out;
	n_e[GCD] = 1;

	for (; i < count; i++) {
		out = 80; // timeout
		do {
			n = this(20);
			n.unshift(GCD);
			n = get_product(n, till);
		} while (n_e[n] && --out);
		n_e[n] = 1;
		na.push(n);
	}

	if (typeof lcm == 'function')
		na.LCM = lcm(na);
	na.GCD = GCD;
	return na;
};


// ------------------------------------------------------------------------------------------------------//

/**
 * 求取反函數 caculator[-1](result)
 * 
 * @deprecated
 */
function get_boundary(caculator, result, down, up, limit) {
	if (up - down === 0)
		return up;

	var boundary, value, increase;
	// assert: caculator(down) – caculator(up) 為嚴格遞增/嚴格遞減函數。
	if (caculator(up) - caculator(down) < 0)
		// swap.
		boundary = up, up = down, down = boundary;

	// assert: caculator(down)<caculator(up)
	increase = down < up;
	if (!(limit > 0))
		limit = 800;

	do {
		boundary = (up + down) / 2;
		// console.log(down + ' – ' + boundary + ' – ' + up);
		if (boundary === down || boundary === up)
			return boundary;
		value = result - caculator(boundary);
		if (value === 0) {
			if (result - caculator(down) === 0)
				down = boundary, value = true;
			if (result - caculator(up) === 0)
				up = boundary, value = true;
			if (value && (increase ? up - down > 0 : up - down < 0))
				continue;
			return boundary;
		}
		if (value > 0)
			down = boundary;
		else
			up = boundary;
	} while (--limit > 0 && (increase ? up - down > 0 : up - down < 0));

	throw 'get_boundary: caculator is not either strictly increasing or decreasing?';
}


/**
 * 求根/求取反函數 equation^-1(y)。 using Secant method.
 * 
 * @param {Function}equation
 *            演算式, mapping function
 * @param {Number}x0
 *            內插法(線性插值 Interpolation)求值之自變數 variable 下限，設定初始近似值。
 * @param {Number}x1
 *            內插法(線性插值 Interpolation)求值之自變數 variable 上限，設定初始近似值。
 * @param {Number}[y]
 *            目標值。default: 0. get (equation^-1)(y)
 * @param {Object}[options]
 *            options 設定特殊功能:<br />
 * 
 * @returns {Number}root: equation(root)≈y
 * 
 * @see Interpolation 以內插值替換
 *      https://en.wikipedia.org/wiki/Root-finding_algorithm
 *      https://en.wikipedia.org/wiki/Secant_method
 */
function secant_method(equation, x0, x1, y, options) {
	// default error, accuracy, stopping tolerance, 容許誤差 
	var error = Number.EPSILON;
	if (!options)
		options = library_namespace.null_Object();
	else if (options > 0)
		error = options;
	else if (options.error > 0)
		error = Math.abs(options.error);

	y = +y || 0;

	var count = (options.count || 40) | 0,
	// assert: y0 = equation(x0)
	y0 = 'y0' in options ? options.y0 : equation(x0),
	// assert: y1 = equation(x1)
	y1 = 'y1' in options ? options.y1 : equation(x1),
	//
	x2 = x1, y2 = y1;

	if (typeof options.start_OK === 'function'
		// 初始測試: Invalid initial value, 不合理的初始值，因此毋須繼續。
		&& !options.start_OK(y0, y1))
			return;

	// main loop
	while (error < Math.abs(y2 - y) && count-- > 0
	// 分母不應為 0 或 NaN。
	&& (y0 -= y1)
	// 測試已達極限，已經得到相當好的效果。無法取得更精確值。
	// assert: else: x0===x, 可能是因為誤差已過小。
	&& ((x2 = x1 - (x1 - x0) * (y - y1) / y0) !== x1 || x1 !== x0)) {
		// evaluate result
		y2 = equation(x2);
		if (false)
			library_namespace.debug(count + ': ' + x2 + ',' + y2 + ' → '
					+ (y2 - y));
		// shift items
		x0 = x1, y0 = y1;
		x1 = x2, y1 = y2;
	}

	return x2;
}

_.secant_method = secant_method;


/**
 * 求根/求取反函數 equation^-1(y)。 using Sidi's generalized secant method.
 * 
 * @param {Function}equation
 *            演算式, mapping function
 * @param {Number}x0
 *            求值之自變數 variable 下限，設定初始近似值。
 * @param {Number}x1
 *            求值之自變數 variable 上限，設定初始近似值。
 * @param {Number}[y]
 *            目標值。default: 0. get (equation^-1)(y)
 * @param {Object}[options]
 *            options 設定特殊功能:<br />
 * 
 * @returns {Number}root: equation(root)≈y
 * 
 * @see https://en.wikipedia.org/wiki/Root-finding_algorithm
 * @see https://en.wikipedia.org/wiki/Sidi's_generalized_secant_method
 */
function Sidi_method(equation, x0, x1, y, options) {
	// default error, accuracy, stopping tolerance, 容許誤差 
	var error = Number.EPSILON;
	if (!options)
		options = library_namespace.null_Object();
	else if (typeof options === 'number' && options > 0)
		// ↑ @Firefox/44.0:
		// isNaN(Object.create(null)): TypeError: can't convert v to number
		// Number.isNaN(Object.create(null)) === false
		error = options;
	else if (options.error > 0)
		error = Math.abs(options.error);

	y = +y || 0;

	var count = (options.count || 40) | 0,
	// assert: y0 = equation(x0)
	y0 = 'y0' in options ? options.y0 : equation(x0),
	// assert: y1 = equation(x1)
	y1 = 'y1' in options ? options.y1 : equation(x1);

	if (typeof options.start_OK === 'function'
		// 初始測試: Invalid initial value, 不合理的初始值，因此毋須繼續。
		&& !options.start_OK(y0, y1))
			return;

	// initialization
	var x2 = x1 - (x1 - x0) * (y1 - y) / (y1 - y0),
	//
	y2 = equation(x2), x3 = x2, y3 = y2,
	// divided differences, 1階差商
	y10 = (y1 - y0) / (x1 - x0), y21 = (y2 - y1) / (x2 - x1),
	// 2階差商
	y210 = (y21 - y10) / (x2 - x0),
	// 暫時使用。
	denominator;

	// main loop of Sidi's generalized secant method (take k = 2)
	while (error < Math.abs(y3 - y) && count-- > 0
	// 檢查是否兩個差距極小的不同輸入，獲得相同輸出。
	&& y21 !== 0
	// 分母不應為 0 或 NaN。
	&& (denominator = y21 + y210 * (x2 - x1))
	// Avram Sidi (2008), "Generalization Of The Secant Method For Nonlinear
	// Equations"
	// 可能需要考量會不會有循環的問題。
	&& ((x3 = x2 - (y2 - y) / denominator) !== x2 || x2 !== x1 || x1 !== x0)) {
		// evaluate result
		y3 = equation(x3);
		// console.log(count + ': ' + x3 + ',' + y3 + ' → error ' + (y3 - y));
		// shift items
		x0 = x1, y0 = y1;
		x1 = x2, y1 = y2;
		x2 = x3, y2 = y3;
		// reckon divided differences
		y10 = y21;
		y21 = (y2 - y1) / (x2 - x1);
		// y210 = (y21 - y10) / (x2 - x0);
		// incase y21 === y10
		if (y210 = y21 - y10)
			y210 /= x2 - x0;
		// console.log('divided differences: ' + [ y10, y21, y210 ]);
	}

	return x3;
}

_.Sidi_method = Sidi_method;

/**
 * 以 Brent's method 求根/求取反函數 equation^-1(y)。
 * 
 * TODO: 牛頓法, options.derivative
 * 
 * @param {Function}equation
 *            演算式, mapping function
 * @param {Number}x0
 *            求值之自變數 variable 下限，設定初始近似值。
 * @param {Number}x1
 *            求值之自變數 variable 上限，設定初始近似值。
 * @param {Number}[y]
 *            目標值。default: 0. get (equation^-1)(y)
 * @param {Object}[options]
 *            options 設定特殊功能:<br />
 * 
 * @returns {Number}root: equation(root)≈y
 * 
 * @see https://en.wikipedia.org/wiki/Root-finding_algorithm
 * @see https://en.wikipedia.org/wiki/Brent%27s_method
 * @see http://www.boost.org/doc/libs/1_58_0/boost/math/tools/minima.hpp
 * @see http://people.sc.fsu.edu/~jburkardt/cpp_src/brent/brent.cpp
 * @see http://www.cscjournals.org/manuscript/Journals/IJEA/volume4/Issue1/IJEA-33.pdf
 * @see http://www.cscjournals.org/manuscript/Journals/IJEA/volume2/Issue1/IJEA-7.pdf
 */
function Brent_method(equation, x0, x1, y, options) {
	// default error, accuracy, stopping tolerance, 容許誤差
	// @see Number.EPSILON
	var error = 0;
	if (!options)
		options = library_namespace.null_Object();
	else if (typeof options === 'number' && options > 0)
		error = options;
	else if (options.error > 0)
		error = Math.abs(options.error);

	y = +y || 0;

	var count = (options.count || 40) | 0,
	// assert: y0 = equation(x0)
	y0 = 'y0' in options ? options.y0 : equation(x0),
	// assert: y1 = equation(x1)
	y1 = 'y1' in options ? options.y1 : equation(x1);

	if (typeof options.start_OK === 'function'
	// 初始測試: Invalid initial value, 不合理的初始值，因此毋須繼續。
	&& !options.start_OK(y0, y1))
		return;

	if (y0 === y)
		return x0;
	if (y1 === y)
		return x1;
	if (!((y0 - y) * (y1 - y) < 0))
		// the root is not bracketed.
		// 但亦有可能只是所取範圍過大，若中間多挑幾點，或許能找到合適的值。
		// 回退至使用  Sidi's generalized secant method。
		return Sidi_method(equation, x0, x1, y, options);

	// copy from double zero () @
	// http://people.sc.fsu.edu/~jburkardt/cpp_src/brent/brent.cpp
	// rewrite when I have time...

	var a = x0, b = x1, c, d, e, sa, sb, sc, fa, fb, fc, m, tol, p, q, r, s;

	//
	// Make local copies of A and B.
	//
	c = sa = a;
	fc = fa = y0 - y;
	sb = b;
	fb = y1 - y;

	d = e = b - a;

	for (;;) {
		if (Math.abs(fc) < Math.abs(fb)) {
			sa = sb, sb = c, c = sa;
			fa = fb, fb = fc, fc = fa;
		}

		//tol = 2 * Number.EPSILON * Math.abs(sb) + error;
		tol = 0;
		if (sa === sb || Math.abs(m = (c - sb) / 2) <= tol || fb === 0) {
			break;
		}

		if (Math.abs(e) < tol || Math.abs(fa) <= Math.abs(fb)) {
			d = e = m;
		} else {
			s = fb / fa;

			if (sa === c) {
				p = 2 * m * s;
				q = 1 - s;
			} else {
				q = fa / fc;
				r = fb / fc;
				p = s * (2 * m * q * (q - r) - (sb - sa) * (r - 1));
				q = (q - 1) * (r - 1) * (s - 1);
			}

			if (0 < p) {
				q = -q;
			} else {
				p = -p;
			}

			s = e;
			e = d;

			if (2 * p < 3 * m * q - Math.abs(tol * q)
					&& p < Math.abs(0.5 * s * q)) {
				d = p / q;
			} else {
				d = e = m;
			}
		}
		sa = sb;
		fa = fb;

		if (tol < Math.abs(d)) {
			sb = sb + d;
		} else if (0 < m) {
			sb = sb + tol;
		} else {
			sb = sb - tol;
		}

		fb = equation(sb) - y;

		if ((0 < fb && 0 < fc) || (fb <= 0 && fc <= 0)) {
			c = sa;
			fc = fa;
			d = e = sb - sa;
		}
	}

	return sb;
}

_.Brent_method = Brent_method;

_.find_root = Brent_method;




/**
 * 不用微分求取局部極小值 get local minimum using Brent's golden section search
 * 
 * 注意: 不同的輸入，即使對同一極值，亦可能會得出不同的輸出值。
 * 
 * @param {Function}equation
 *            演算式, mapping function
 * @param {Number}min
 *            求值之自變數 variable 下限，設定初始近似值。
 * @param {Number}max
 *            求值之自變數 variable 上限，設定初始近似值。
 * @param {Object}[options]
 *            options 設定特殊功能:<br />
 * 
 * @returns {Number}[x,fx]: equation(x)≈fx≈minimum
 * 
 * @see https://en.wikipedia.org/wiki/Maxima_and_minima
 *      https://en.wikipedia.org/wiki/Golden_section_search
 *      https://zh.wikipedia.org/wiki/%E6%9E%81%E5%80%BC#.E6.B1.82.E6.9E.81.E5.80.BC.E7.9A.84.E6.96.B9.E6.B3.95
 *      https://zh.wikipedia.org/wiki/%E5%8F%98%E5%88%86%E6%B3%95
 *      http://maths-people.anu.edu.au/~brent/pub/pub011.html
 *      http://math.stackexchange.com/questions/58787/looking-for-numerical-methods-for-finding-local-maxima-and-minima-of-a-function
 */
function Brent_minima(equation, min, max, options) {
	// default error, accuracy, stopping tolerance, 容許誤差
	// @see Number.EPSILON
	var error = 0;
	if (!options)
		options = library_namespace.null_Object();
	else if (options > 0)
		error = options;
	else if (options.error > 0)
		error = Math.abs(options.error);

	var count = (options.count || 40) | 0, data, data_u;

	// copy from std::pair<T, T> brent_find_minima @
	// http://www.boost.org/doc/libs/1_58_0/boost/math/tools/minima.hpp
	// rewrite when I have time...

	var tolerance = error,
	// minima so far
	x,
	// second best point
	w,
	// previous value of w
	v,
	// most recent evaluation point
	u,
	// The distance moved in the last step
	delta,
	// The distance moved in the step before last
	delta2,
	// function evaluations at u, v, w, x
	fu, fv, fw, fx,
	// midpoint of min and max
	mid,
	// minimal relative movement in x
	fract1, fract2,
	// golden ratio, don't need too much precision here!
	golden = 0.3819660;

	x = w = v = max;
	fx = equation(x);
	if (Array.isArray(fx))
		 data = fx[1], fx = fx[0];
	fw = fv = fx;
	delta2 = delta = 0;

	do {
		// get midpoint
		mid = (min + max) / 2;
		// work out if we're done already:
		fract1 = tolerance * Math.abs(x) + tolerance / 4;
		fract2 = 2 * fract1;
		if (Math.abs(x - mid) <= (fract2 - (max - min) / 2))
			break;

		if (Math.abs(delta2) > fract1) {
			// try and construct a parabolic fit:
			var r = (x - w) * (fx - fv), q = (x - v) * (fx - fw), p = (x - v)
					* q - (x - w) * r;
			q = 2 * (q - r);
			if (q > 0)
				p = -p;
			q = Math.abs(q);
			var td = delta2;
			delta2 = delta;
			// determine whether a parabolic step is acceptible or not:
			if ((Math.abs(p) >= Math.abs(q * td / 2)) || (p <= q * (min - x))
					|| (p >= q * (max - x))) {
				// nope, try golden section instead
				delta2 = (x >= mid) ? min - x : max - x;
				delta = golden * delta2;
			} else {
				// whew, parabolic fit:
				delta = p / q;
				u = x + delta;
				if (((u - min) < fract2) || ((max - u) < fract2))
					delta = (mid - x) < 0 ? -Math.abs(fract1) : Math
							.abs(fract1);
			}
		} else {
			// golden section:
			delta2 = (x >= mid) ? min - x : max - x;
			delta = golden * delta2;
		}
		// update current position:
		u = (Math.abs(delta) >= fract1) ? (x + delta) : (delta > 0 ? (x + Math
				.abs(fract1)) : (x - Math.abs(fract1)));
		fu = equation(u);
		if (Array.isArray(fu))
			 data_u = fu[1], fu = fu[0];
		if (fu <= fx) {
			// good new point is an improvement!
			// update brackets:
			if (u >= x)
				min = x;
			else
				max = x;
			if (x === u)
				// 無改變。
				break;
			// update control points:
			v = w, w = x, x = u;
			fv = fw, fw = fx, fx = fu;
			data = data_u;
		} else {
			// Oh dear, point u is worse than what we have already,
			// even so it *must* be better than one of our endpoints:
			if (u < x)
				min = u;
			else
				max = u;
			if ((fu <= fw) || (w == x)) {
				// however it is at least second best:
				v = w, w = u;
				fv = fw, fw = fu;
			} else if ((fu <= fv) || (v == x) || (v == w)) {
				// third best:
				v = u;
				fv = fu;
			}
		}

	} while (--count);

	(x = new Number(x)).y = fx;
	if (data !== undefined)
		if (library_namespace.is_Object(data))
			Object.assign(x, data);
		else
			x.data = data;
	return x;
}

_.Brent_minima = Brent_minima;


// 不用微分求取求取局部極小值 get local minimum
_.find_minima = Brent_minima;
_.find_maxima = function(equation, min, max, options) {
	return Brent_minima(function(x) {
		return -equation(x);
	}, min, max, options);
};
// 不用微分求取局部極值 get local maximum and minimum
// _.find_extremum = Brent_minima;


// ------------------------------------------------------------------------------------------------------//


_// JSDT:_module_
.
/**
 * VBScript has a Hex() function but JScript does not.
 * 
 * @param {Number}
 *            number
 * @return {String} number in hex
 * @example alert('0x'+CeL.hex(16725))
 */
hex = function(number) {
	return ((number = Number(number)) < 0 ? number + 0x100000000 : number).toString(16);
};

_// JSDT:_module_
.
/**
 * 補數計算。 正數的補數即為自身。若要求得互補之後的數字，請設成負數。
 * 
 * @param {Number}
 *            number
 *
 * @return {Number} base 1: 1's Complement, 2: 2's Complement, (TODO: 3, 4, ..)
 * @example alert(complement())
 * @see http://www.tomzap.com/notes/DigitalSystemsEngEE316/1sAnd2sComplement.pdf
 *      https://en.wikipedia.org/wiki/Method_of_complements
 *      https://en.wikipedia.org/wiki/Signed_number_representations
 * @since 2010/3/12 23:47:52
 */
complement = function() {
	return this.from.apply(this, arguments);
};

_// JSDT:_module_
.
complement.prototype = {

base : 2,

// 1,2,..
bits : 8,

// radix complement or diminished radix complement.
// https://en.wikipedia.org/wiki/Method_of_complements
diminished : 0,

/**
 * 正負符號. 正: 0/false, 負 negative value:!=0 / true
 */
sign : 0,

// get the value
valueOf : function() {
	return this.sign ? -this.value : this.value;
},

/**
 * set value
 */
set : function(value) {
	var m = Number(value), a = Math.abs(m);
	if (isNaN(m) || m && a < 1e-8 || a > 1e12){
		library_namespace.debug('complement.set: error number: ' + value);
		return;
	}

	this.sign = m < 0;
	// this.value 僅有正值
	this.value = a;

	return this;
},


/**
 * input
 */
from : function(number, base, diminished) {
	// 正規化
	number = ('' + (number||0)).replace(/\s+$|^[\s0]+/g, '') || '0';
	// library_namespace.debug(number + ':' + number.length + ',' + this.bits);

	// 整數部分位數
	var value = number.indexOf('.'), tmp;
	if (value == -1)
		value = number.length;
	// TODO: not good/optimize
	if (value > this.bits)
		// throw 'overflow';
		library_namespace.err('complement.from: overflow: ' + value);

	if (typeof diminished === 'undefined')
		// illegal setup
		diminished = this.diminished;
	else
		this.diminished = diminished;

	if ((base = Math.floor(base)) && base > 0){
		if (base === 1)
			base = 2, this.diminished = 1;
		this.base = base;
	}else
		// illegal base
		base = this.base;
	// library_namespace.debug(base + "'s Complement");

	// TODO: 僅對 integer 有效
	value = parseInt(number, base);
	tmp = Math.pow(base, this.bits - 1);
	if (value >= tmp * base)
		// throw 'overflow';
		library_namespace.err('complement.from: overflow: ' + value);

	// library_namespace.debug('compare ' + value + ',' + tmp);
	if (value < tmp)
		this.sign = 0;
	else {
		library_namespace.debug('負數 ' + (tmp * base - (diminished ? 1 : 0)) + '-'
				+ value + '=' + (tmp * base - (diminished ? 1 : 0) - value), 3);
		this.sign = 1;
		value = tmp * base - (diminished ? 1 : 0) - value;
	}

	this.value = value;
	// library_namespace.debug(number + ' → '+this.valueOf());

	return this;
},

/**
 * output
 */
to : function(base, diminished) {
	if (!(base = Math.floor(base)) || base < 1)
		base = this.base;
	else if (base === 1)
		base = 2, diminished = 1;
	if (typeof diminished === 'undefined')
		diminished = this.diminished;

	var value = this.value, tmp = Math.pow(base, this.bits - 1);
	if (value > tmp || value === tmp && (diminished || !this.sign))
		// throw 'overflow';
		library_namespace.err('complement.to: overflow: ' + (this.sign ? '-' : '+') + value);

	if (this.sign){
		tmp *= base;
		if (diminished)
			// TODO: 僅對 integer 有效
			tmp--;
		// library_namespace.debug('負數 ' + value + '，sum=' + tmp);
		// 負數，添上兩補數之和
		value = tmp - value;
	}

	// library_namespace.debug('value: ' + (this.sign ? '-' : '+') + value);

	value = value.toString(Math.max(2, this.base));

	return value;
}

};

_// JSDT:_module_
.
complement.prototype.toString = _.complement.prototype.to;



/**
 * haversines
 * 
 * @param {Number}θ
 *            angle (in radians)
 * 
 * @returns {Number}haversines(θ)
 * 
 * @see https://en.wikipedia.org/wiki/Haversine_formula
 */
function hav(θ) {
	return (1 - Math.cos(θ)) / 2;
	// hav(θ) = sin^2(θ/2)
}



// ---------------------------------------------------------------------//
// export 導出.


_.MULTIPLICATIVE_IDENTITY = MULTIPLICATIVE_IDENTITY;
_.ZERO_EXPONENT = ZERO_EXPONENT;
_.ABSORBING_ELEMENT = ABSORBING_ELEMENT;
_.MULTIPLICATION_SIGN = MULTIPLICATION_SIGN;


library_namespace.set_method(Number.prototype, {
	// division, divided_by
	//divided : set_bind(Euclidean_division)
	divided : function(divisor, closest) {
		return Euclidean_division(this, divisor, closest);
	},
	floor_sqrt : function(number) {
		return floor_sqrt(this);
	}
});

library_namespace.set_method(Math, {
	hav : hav
});



return (
	_// JSDT:_module_
);
}


});

