
/**
 * @name CeL integer function
 * @fileoverview
 * 本檔案包含了整數 (integer) 暨小數的 functions，相當/類似於 BigInteger, bigint, Large number。<br />
 * 在純 javascript 的環境下，藉由原生計算功能，盡可能提供高效的大數計算。<br />
 * integer 大數基本上即為 Integer.BASE 進位制之數字系統(Positional notation or place-value notation)。
 *
 * @example
 * <code>
 * CeL.run('data.math.integer');
 * var integer = new CeL.integer('654561264556287547824234523');
 * CeL.log(integer.add('096527893048039647894'));
 * </code>
 *
 * @since 2013/9/8 13:42:58
 * @see
 * https://zh.wikipedia.org/wiki/%E9%80%B2%E4%BD%8D%E5%88%B6
 */


/*
TODO:
在 ECMAScript 6 之後，或可以繼承重寫。
為了減輕負擔，有些屬性可以不放在 Integer.prototype。

http://reference.wolfram.com/mathematica/tutorial/SomeNotesOnInternalImplementation.html
http://gmplib.org/
http://www.craig-wood.com/nick/articles/pi-chudnovsky/

Arbitrary-precision arithmetic / 高精度計算
https://en.wikipedia.org/wiki/Arbitrary-precision_arithmetic

http://msdn.microsoft.com/zh-tw/library/system.numerics.biginteger.aspx
http://docs.oracle.com/javase/7/docs/api/java/math/BigInteger.html


https://github.com/silentmatt/javascript-biginteger
https://github.com/peterolson/BigInteger.js
https://github.com/peterolson/BigRational.js
https://github.com/cwacek/bigint-node/blob/master/lib/bigint.js

http://www.leemon.com/crypto/BigInt.html
http://www-cs-students.stanford.edu/~tjw/jsbn/
http://java.sun.com/javase/6/docs/api/java/math/BigInteger.html


規格書:

integer = new Integer(number,        do not set fraction = false, base = default base);
integer = new Integer(number String, base of String,              base = default base);
integer = new Integer(Integer,       (ignored),                   base = default base);

// digit Array
integer[{integer}digit index] = the digit of base ^ (index + exponent)
integer[KEY_NEGATIVE]		= {Undefined|Boolean}this integer is negative
integer[KEY_BASE]			= {natural number}base of this integer
integer[KEY_EXPONENT]		= {integer}exponent of this integer
integer[KEY_CACHE]			= {Undefined|Array}cache String of value
integer[KEY_CACHE][base]	= {String}value in base
integer[KEY_TYPE]			= {Undefined|Number}NaN / Infinity
integer[KEY_FACTORS]		= {Undefined|Array}factors / 因數
integer[KEY_FACTORS].sort(function(a,b){var na=Array.isArray(a),nb=Array.isArray(b);return na^nb?na^0:na&&nb?a.length-b.length||a[a.length-1]-b[b.length-1]:a-b;});


*/


if (typeof CeL === 'function')
	CeL.run(
	{
		name: 'data.math.integer',
		require: 'data.code.compatibility.|data.native.|data.math.GCD',
		no_extend: 'random,compare',
		code: function (library_namespace) {
			'use strict';

			//	requiring
			var GCD = this.r('GCD');

			// ---------------------------------------------------------------------//
			// basic constants. 定義基本常數。

			var

			// assert: isNaN(KEY_*)
			// {safe integer} MIN_BASE <= instance[KEY_BASE] <= MAX_BASE
			// instance[KEY_BASE] 基數/底數初始設定完後，除非歸零，否則不可再改變!
			KEY_BASE = 'base',
			// sign. true: *this* is negative, false/undefined: positive.
			KEY_NEGATIVE = 'negative',
			//{integer|Undefined}[exponent]	輸入數值標記之科學記數法指數 in instance[KEY_BASE]。default 0.
			KEY_EXPONENT = 'exponent',
			//僅為大數整數分解（因數分解, integer factorization）存在。
			// this[KEY_FACTORS] = [ {safe integer}scalar純量, Integer, ..]
			KEY_FACTORS = 'factors',
			// instance[KEY_CACHE][base] = string in base;
			KEY_CACHE = 'cache',
			//instance[KEY_TYPE] = NaN / Infinity; unset: instance is normal number.
			// 指示/存儲特殊值。 ** instance[\d] 本身僅存儲純數字。
			KEY_TYPE = 'type',

			// 本 library 所允許之最大可安全計算整數。MAX_SAFE_INTEGER <= Number.MAX_SAFE_INTEGER。
			MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER,

			// see for_each_digit()
			//之後再作初始化。
			// assert: 1 < MIN_BASE <= MAX_BASE
			MIN_BASE = 0,
			// assert: MAX_BASE * MAX_BASE < MAX_SAFE_INTEGER + 2
			// see change_base_to(), for_each_digit()
			//	為方便乘法處理，因此取自乘不致 overflow ( > MAX_SAFE_INTEGER) 之值，預防 overflow 用。
			MAX_BASE = Math.floor(Math.sqrt(MAX_SAFE_INTEGER)),

			// 可辨認之數字字串。
			//	[ full , sign, integer part 整數部分, fractional part 小數部分, exponent 指數, percent ]
			PATTERN_NUMBER = /([+\-]?)([\d]*)(?:\.([\d]+))?(?:[eE]([+\-]?\d+))?\s*([%‰‱])?/,
			// hex 用。
			//	[ full , sign, integer part 整數部分, fractional part 小數部分, exponent 指數, percent ]
			PATTERN_NUMBER_HEX = /([+\-]?)([\da-z]*)(?:\.([\da-z]+))?(?:[eE]([+\-]?\d+))?\s*([%‰‱])?/,
			// https://en.wikipedia.org/wiki/Parts-per_notation
			exponent_parts_per = {
				// percentage (%), 百分比, ％（全形百分號）
				'%' : -2,
				// permille (‰), 千分率
				'‰' : -3,
				// permyriad (‱) (Basis point), 萬分率
				'‱' : -4
				// ppm (parts-per-million, 10–6), ppb (parts-per-billion, 10–9), ppt (parts-per-trillion, 10–12) and ppq (parts-per-quadrillion, 10-15).
			},

			//當展現十進位數字時，若非無窮小數，則最多可展現之位數。
			MAX_TRUNCATED = get_precision(1 / 3) - 1,

			DECIMAL_BASE_LENGTH = Math.log10(MAX_SAFE_INTEGER) >> 1,
			DECIMAL_BASE = (1 + '0'.repeat(DECIMAL_BASE_LENGTH)) | 0,
			//	default base.
			DEFAULT_BASE = DECIMAL_BASE,

			MULTIPLICATION_BOUNDARY = multiplication_boundary(DEFAULT_BASE),

			/**
			 * parseInt( , radix) 可處理之最大 radix，<br />
			 * 與 Number.prototype.toString ( [ radix ] )<br />
			 * 可用之最大基數 (radix, base)。<br />
			 * 10 Arabic numerals + 26 Latin alphabet.<br />
			 * 之後再作初始化。
			 *
			 * @inner
			 * @see
			 * <a href="https://en.wikipedia.org/wiki/Hexadecimal" accessdate="2013/9/8 17:26">Hexadecimal</a>
			 */
			MAX_RADIX = 0,
			// 之後再作初始化。
			MIN_RADIX = 0,
			// 應與 parseInt() 一致。
			DEFAULT_RADIX = parseInt('10'),
			HEX_RADIX = parseInt('0x10'),
			PATTERN_HEX = new RegExp('^0x([0-9a-f]{' + Number.MAX_SAFE_INTEGER.toString(HEX_RADIX).length + ',})$', 'i'),

			// 數字過大，parseInt() 無法獲得精密數值時使用 DEFAULT_DIGITS。不分大小寫。應與 parseInt() 一致。
			// assert: DEFAULT_DIGITS.length === MAX_RADIX
			// assert: DEFAULT_DIGITS.toLowerCase() === DEFAULT_DIGITS
			DEFAULT_DIGITS = '',
			DEFAULT_DIGITS_CACHE,

			// copy from data.math
			MULTIPLICATIVE_IDENTITY = library_namespace.MULTIPLICATIVE_IDENTITY,
			// copy from data.math
			ZERO_EXPONENT = library_namespace.ZERO_EXPONENT,
			// copy from data.math
			ABSORBING_ELEMENT = library_namespace.ABSORBING_ELEMENT,

			trim_0,

			// radix point / radix character / decimal mark 小數點
			radix_point = '.',

			// Array 或 Uint32Array。
			array_type = Array,
			// array_clone(from, to[, assignment]): 在不改變 to 之 reference 下，將 to 之陣列內容改為與 from 相同。
			array_clone,
			//reset digits of (this)
			array_reset,
			//
			shift_digits;

			// ---------------------------------------------------------------------//

			/**
			 * front end of operation(運算)
			 * @param {String}operator	operator
			 * @param number	the second integer
			 * @return	計算後的結果
			 * @see
			 * https://en.wikipedia.org/wiki/Operation_(mathematics)
			 * <a href="http://www.javaworld.com.tw/jute/post/view?bid=35&amp;id=30169&amp;tpg=1&amp;ppg=1&amp;sty=1&amp;age=0#30169" accessdate="2010/4/16 20:47">JavaWorld@TW Java論壇 - post.view</a>
			 * @_name	_module_.prototype.op
			 */
			function operate(OP_SET, target, operator, operand, flag) {
				if (operator.slice(-1) === '=') {
					if (operator === '===')
						return target === operand;
					if (operator !== '=' && operator !== '==')
						operator = operator.slice(0, -1);
					// 避免 target +-×÷ target
					if (target === operand)
						target = target.clone();
				} else
					target = target.clone();

				if (operator in OP_SET)
					OP_SET[operator].call(target, operand, flag);
				else
					library_namespace.error('operate: Invalid operator [' + operator + ']!');

				return target;
			}

			function set_operate(OP_SET) {
				return function (operator, operand, flag) {
					return operate(OP_SET, this, operator, operand, flag);
				};
			}


			// ---------------------------------------------------------------------//
			// 初始調整並規範基本常數。

			/**
			 * 工具函數：轉換 ['a','b','c'] → {a:0,b:1,c:2}。
			 *
			 * @param	{Array}[base]	輸入數值採用之進位制基底/數字 digit 字集。
			 *
			 * @return	回傳 cache 物件。
			 *
			 * @inner
			 */
			function digit_cache(base) {
				var digits = Object.create(null);
				base.forEach(function (digit, index) {
					if (digit.length !== 1)
						library_namespace.error('digit_cache: Invalid digit: [' + digit + '].');
					else if (digit in digits)
						library_namespace.error('Digit already exists: [' + digit + '] = ' + digits[digit]);
					else
						digits[digit] = index;
				});
				return digits;
			}

			// 工具函數
			//truncation: truncate array to length
			function Array_reset(array, to_length) {
				// 或可參考:
				// http://stackoverflow.com/questions/1232040/how-to-empty-an-array-in-javascript
				to_length = array.length - (to_length | 0);
				while (0 < to_length--)
					array.pop();
				return array;
			}

			function General_reset(array, to_length) {
				var i = array.length;
				to_length |= 0;
				while (to_length < i--)
					array[i] = 0;
				return [];
			}

			function Array_clone(from, to) {
				if (from !== to) {
					Array_reset(to);
					array_type.prototype.push.apply(to, from);
				}
			}

			function General_clone(from, to) {
				if (from !== to) {
					var index = to.length, l = from.length;
					if (index < l) {
						library_namespace.warn('General_clone: Target array has a shorter length!');
						//index = l;
					} else
						while (l < index)
							//高位補 0。
							to[--index] = 0;
					// assert: index <= from.length, should be (from.length).
					while (0 < index--)
						to[index] = from[index];
				}
			}

			// 清理高數位的 0。
			function Array_trim_0(integer, preserve) {
				var index = integer.length;
				// 1 < index: 直接保留最後一個，省得麻煩。
				if (preserve === undefined)
					preserve = 1;
				// assert: integer[index] is integer
				while (preserve < index-- && integer[index] === 0);
				integer.length = index + 1;
				return integer;
			}

			//exponent > 0 時，會去掉尾數 exponent 個 digits。
			//exponent < 0 時，會補上尾數 exponent 個 digits。
			function Array_shift_digits(integer, exponent, no_set_exponent) {
				if (exponent |= 0) {
					if (!no_set_exponent)
						integer[KEY_EXPONENT] += exponent;
					if (0 < exponent)
						integer.splice(0, exponent);
					else {
						//當 exponent 量過大(e.g., 在 .precise_divide() 中，循環節 period = 71687)，Chrome 32 用
						//<code>Array.prototype.unshift.apply(integer, new Array(-exponent));</code>
						//會出現 RangeError: Maximum call stack size exceeded
						var a = integer.slice();
						integer.length = -exponent;
						integer.fill(0);
						Array.prototype.push.apply(integer, a);
					}
				}
			}

			function General_shift_digits(integer, exponent) {
				if (exponent |= 0) {
					if (!no_set_exponent)
						integer[KEY_EXPONENT] += exponent;
					if (0 < exponent)
						for (var i = 0, l = integer.length; i < l; i++)
							integer[i] = i + exponent < l ? integer[i + exponent] : 0;
					else
						for (var i = integer.length - 1; 0 <= i; i--)
							integer[i] = i + exponent < 0 ? 0 : integer[i + exponent];
				}
			}


			//找出最小可用之 radix。
			while (Number.isNaN(parseInt('1', ++MIN_RADIX)));
			try {
				for (; ; MAX_RADIX++)
					// console.log(MAX_RADIX + ' ' + DEFAULT_DIGITS);
					// will be '0123456789abcdefghijklmnopqrstuvwxyz'
					DEFAULT_DIGITS += MAX_RADIX < DEFAULT_RADIX ? MAX_RADIX.toString() : MAX_RADIX.toString(MAX_RADIX + 1);
			} catch (e) { }
			// 將 DEFAULT_DIGITS 轉成小寫。
			DEFAULT_DIGITS = DEFAULT_DIGITS.toLowerCase();
			DEFAULT_DIGITS_CACHE = digit_cache(DEFAULT_DIGITS.split(''));

			//規範 MAX_SAFE_INTEGER
			if (MAX_SAFE_INTEGER > Number.MAX_SAFE_INTEGER)
				MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;

			//決定 determines thie MIN_BASE
			while ((MAX_SAFE_INTEGER / ++MIN_BASE | 0) < 0);

			(function () {
				// 測試 array_type 可存取 attributes。
				var a = array_type && new array_type(2), b;
				if (a)
					a[KEY_BASE] = 9;
				if (!a || a[KEY_BASE] !== 9)
					// assert: Array 可存取 attributes。
					a = new (array_type = Array);
				else if (0 < a.BYTES_PER_ELEMENT) {
					// for TypedArray, 決定 MAX_BASE。
					// 1 byte = 8 bits
					b = Math.floor(Math.sqrt(1 << 8 * a.BYTES_PER_ELEMENT));
					if (b < MAX_BASE) {
						if (a.BYTES_PER_ELEMENT < 4)
							library_namespace.warn('所使用之 array type 能存放之值過小，將影響效能！');
						MAX_BASE = b;
					} else if (MAX_BASE < b)
						// 一般說來，TypedArray 不可能存放超過 Number.MAX_SAFE_INTEGER 之整數值，因此不應該執行到這！
						library_namespace.error('所使用之 array type 能存放超過最大可安全計算整數 Number.MAX_SAFE_INTEGER 之值，恐造成錯誤計算結果！');
				}

				// 決定可用的 .push() 等 array 工具函數。
				if (array_type.prototype.push) {
					array_type.prototype.push.apply(a = new array_type, [4, 3]);
					if (a[1] === 3 && a.length === 2) {
						a.length = 0;
						if (a.length === 0) {
							//可設定 .length
							array_clone = Array_clone;
							array_reset = Array_reset;
							trim_0 = Array_trim_0;
							shift_digits = Array_shift_digits;
						}
					}
				}
				if (!array_clone) {
					array_clone = General_clone;
					//無法設定 .length
					array_reset = General_reset;
					trim_0 = function (integer) {
						return integer;
					};
					shift_digits = General_shift_digits;
				}
			})();

			// ---------------------------------------------------------------------//
			// 工具函數

			// 為正規 base。
			function valid_base(base, force_change_base) {
				// assert: MAX_BASE === MAX_BASE | 0
				if (base === (base | 0)
					//
					&& (force_change_base ? MIN_RADIX <= base : MIN_BASE <= base)
					&& base <= MAX_BASE
					//&& base !== Integer.prototype[KEY_BASE]
					)
					return base;
			}

			// 為正規 radix。
			function valid_radix(radix) {
				// assert: MIN_RADIX === MIN_RADIX | 0
				if (radix === (radix | 0)
					&& MIN_RADIX <= radix && radix <= MAX_BASE
					)
					return radix;
			}

			// 超過此界限，與元素(Integer digit)相乘時即有可能超過 Number.MAX_SAFE_INTEGER。
			// boundary(base+2)<Number.MAX_SAFE_INTEGER
			function multiplication_boundary(base) {
				// assert: return > 1
				return valid_base(base) ? Math.floor(MAX_SAFE_INTEGER / base) : MULTIPLICATION_BOUNDARY;
			}


			// 若為準確次方，則回傳次方數。
			// number = base ^ count_exponent(number, base)
			function count_exponent(number, base) {
				if (number < base)
					return -count_exponent(base, number);

				var exponent = 0;
				while (number !== 0 && 0 === number % base)
					number /= base, exponent++;
				if (number === ZERO_EXPONENT)
					return exponent;
			}

			function do_modified(integer) {
				delete integer[KEY_CACHE];
			}

			// ---------------------------------------------------------------------//
			//	definition of module integer

			/**
			 * 任意大小、帶正負號的整數。integer instance.
			 *
			 * @example
			 * <code>
			 * CeL.log((new CeL.integer('876567896')).op('*','6456789976545678'));
			 * </code>
			 *
			 * @class	Integer 的 constructor
			 * @constructor
			 */
			function Integer(number, base, to_base, force_change_base) {
				if (1 === arguments.length && is_Integer(number))
					// number = Integer(number)
					// 當純粹只是為了轉換型別時使用。
					return this instanceof Integer ? number.clone() : number;

				var integer = new_instance();
				if (number !== undefined || 1 < arguments.length)
					if (Number.isSafeInteger(number)) {
						if (MIN_RADIX <= base && !to_base || typeof to_base === 'boolean')
							// shift arguments
							force_change_base = to_base, to_base = base;
						// 快速處理常用功能。
						if (to_base = valid_base(to_base, force_change_base))
							integer[KEY_BASE] = to_base;
						else
							// assert: integer[KEY_BASE] === DEFAULT_BASE
							to_base = DEFAULT_BASE;
						if (number === 0)
							integer[0] = 0;
						else {
							if (number < 0)
								integer[KEY_NEGATIVE] = true, number = -number;
							for (var index = 0; 0 < number; number = number / to_base | 0)
								integer[index++] = number % to_base;
						}
					} else
						assignment.apply(integer, arguments);

				return integer;
			}

			//	instance public interface	-------------------

			//	每個位數存放 {safe integer} 0 – 此數-1，大於等於 此數 即須進位。
			//read-only
			Integer.prototype[KEY_BASE] = DEFAULT_BASE;
			// 預設為 0 次方。
			Integer.prototype[KEY_EXPONENT] = 0;

			// https://en.wikipedia.org/wiki/Operation_(mathematics)
			var OP_REFERENCE = {
				'+': add,
				'-': subtract,
				'*': multiply,
				'/': divide,
				'%': modulo,
				'^': power,
				'=': assignment,
				'==': compare
			};

			Object.assign(Integer.prototype, OP_REFERENCE, {
				forEach: Array.prototype.forEach,

				// 下面全部皆為 assignment，例如 '+' 實為 '+='。
				assignment: assignment,
				assign: assignment,

				// add_assignment
				add: add,
				// subtract_assignment
				subtract: subtract,
				// multiply_assignment
				multiply: multiply,
				// divide_assignment
				division: division,
				divide: divide,
				div: divide,
				modulo: modulo,
				mod: modulo,

				power: power,
				pow: power,
				square: square,
				square_root: square_root,
				sqrt: square_root,
				// 至此為 assignment。

				precise_divide: precise_divide,

				clone: clone,
				// 偶數的
				is_even: function (test_odd) {
					return !(KEY_TYPE in this) && this[KEY_EXPONENT] === 0
						//
						&& this.modulo(2) === (test_odd ? 1 : 0);
				},
				// 奇數的,單數的
				is_odd: function () {
					return this.is_odd(true);
				},

				// absolute value/絕對值/模
				// https://en.wikipedia.org/wiki/Absolute_value
				abs: function (negative) {
					if ((negative = !!negative) !== !!this[KEY_NEGATIVE])
						do_modified(this), this[KEY_NEGATIVE] = negative;
					return this;
				},
				// 變換正負號。
				negate: function () {
					do_modified(this);
					if (this[KEY_NEGATIVE])
						delete this[KEY_NEGATIVE];
					else if (!this.is_0())
						this[KEY_NEGATIVE] = true;
					return this;
				},
				is_positive: function () {
					return this.compare(0) > 0;
				},
				is_negative: function () {
					return !!this[KEY_NEGATIVE];
				},
				// 正負符號。
				// https://en.wikipedia.org/wiki/Sign_(mathematics)
				// https://en.wikipedia.org/wiki/Sign_function
				sign: function (negative) {
					// NaN: 0
					return this[KEY_NEGATIVE] ? -1 : this.is_0() ? 0 : Number.isNaN(this[KEY_TYPE]) ? undefined : 1;
				},
				get_base: function () {
					return this[KEY_BASE];
				},
				get_exponent: function (exp) {
					if (Number.isSafeInteger(exp) && exp !== this[KEY_EXPONENT]) {
						do_modified(this);
						// WARNING 注意: 除非有正當理由，否則不應直接修改 exponent！
						if (!(this[KEY_EXPONENT] = exp))
							// Can't use delete @ IE8.
							//delete this[KEY_EXPONENT];
							this[KEY_EXPONENT] = 0;
					}
					return this[KEY_EXPONENT];
				},
				expand_exponent: function () {
					//直接展開指數。直接作位元操作，以求效率。
					shift_digits(this, -this[KEY_EXPONENT], true);
					// assert: this[KEY_EXPONENT] === 0
					//去除 exponent 設定。
					// Can't use delete @ IE8.
					//delete this[KEY_EXPONENT];
					this[KEY_EXPONENT] = 0;
					return this;
				},

				Euclidean_algorithm: Euclidean_algorithm,

				to_precision: to_precision,
				round: round,
				floor: function (digits) {
					return this.round(digits, -Infinity);
				},
				ceil: function (digits) {
					return this.round(digits, Infinity);
				},

				log: log,

				is_0: is_0,
				compare_amount: compare_amount,
				compare: compare,
				equals: function (number) {
					return this.compare(number) === 0;
				},
				isFinite: function () {
					return !(KEY_TYPE in this);
				},
				isNaN: function () {
					return (KEY_TYPE in this) && isNaN(this[KEY_TYPE]);
				},

				power_modulo: power_modulo,
				Miller_Rabin: Miller_Rabin,
				not_prime: not_prime,
				Pollards_rho: Pollards_rho_1980,
				factorize: factorize,

				op: set_operate(OP_REFERENCE),
				for_each_digit: for_each_digit,

				ratio_to: ratio_to,
				valueOf: valueOf,
				digits: digits,
				digit_sum: digit_sum,
				toString: toString
			});

			// setup Integer constructor after Integer.prototype configured.
			var new_instance = Array.derive(Integer, array_type);

			//	class public interface	---------------------------

			var is_Integer = (new Integer) instanceof Integer ? function (number) {
				return number instanceof Integer;
			} : array_type === Array ? Array.isArray
			//
			: library_namespace.type_tester(library_namespace.is_type(new array_type));

			function Integer_compare(number1, number2) {
				if (typeof number1 === 'number' && typeof number2 === 'number')
					return number1 - number2;

				if (!is_Integer(number1))
					number1 = new Integer(number1, null, is_Integer(number2) && number2[KEY_BASE]);
				return number1.compare(number2);
			}

			// get the extreme value (極端值: maximum/min) of input values
			function extreme(values, get_minima) {
				var index = values.length, extreme_value, value, compare;
				if (!index)
					// ES6: Math.max: If no arguments are given, the result is −∞.
					return get_minima ? Infinity : -Infinity;

				extreme_value = values[--index];
				while (0 < index--) {
					// WARNING 注意: 當碰上許多大數時，會出現需要多次轉換 extreme_value 成 Integer 的效能低下情形!
					// 但若許多數字不同底，而最大的是 String，則可能獲得部分效能。
					if (Number.isNaN(compare = Integer_compare(extreme_value, value = values[index])))
						// ES6: Math.max: If any value is NaN, the result is NaN.
						return NaN;

					if (get_minima ? compare > 0 : compare < 0)
						extreme_value = value;

					// 依規範，必須掃描一次，確定沒 NaN。不可中途跳出。
					if (false && (get_minima ? compare > 0 : compare < 0)
						//當有改變時才偵測。
						&& typeof (extreme_value = value) === 'number' && !Number.isFinite(extreme_value = value))
						break;
				}
				return extreme_value;
			}

			// range:
			// 1 – Number.MAX_SAFE_INTEGER 當作 digits
			// Number.MAX_SAFE_INTEGER + 1 – Number.MAX_VALUE || (is_Integer(range) && !(KEY_TYPE in range)) 當作 maximum value
			// 其他採預設值 digits = 2
			function random(range, base) {
				var r, i;

				if (0 < range && isFinite(range))
					if (!Number.isSafeInteger(range = +range))
						range = new Integer(range, null, base);

				if (is_Integer(range) && !(KEY_TYPE in range)) {
					//求極值之最大位元
					for (i = range.length; 0 < i && range[--i] < 2 ;);
					if (range[i] < 2)
						range = 0;
					else {
						r = new Integer(0, base);
						r[i] = Math.floor(range[i] * Math.random());
						range = i;
					}
				}

				// 其他情況採預設值 digits = 2
				if (!(0 < range) || !Number.isSafeInteger(range))
					range = 2;

				// assert: range = {natural number}digits

				if (!r)
					r = new Integer(0, base);

				for (base = r[KEY_BASE]; 0 < range;)
					r[--range] = Math.floor(base * Math.random());

				return r;
			}

			// WARNING 注意: this operation will modify arguments!
			// https://en.wikipedia.org/wiki/Lehmer%27s_GCD_algorithm
			function Integer_GCD(number_array) {
				if (arguments.length > 1)
					// Array.from()
					number_array = Array.prototype.slice.call(arguments);

				// 盡可能先挑小的，增加效率。
				number_array.sort();

				var index = 0, length = number_array.length, number, n,
				//
				use_Number, Integer_Array = [], gcd = undefined;
				// 先嘗試是否可能找出較小的 gcd 以提升效能。
				for (; index < length;) {
					number = number_array[index++];
					if (typeof number === 'string')
						number = Number.isSafeInteger(n = parseInt(number)) ? n : new Integer(number);

					if (is_Integer(number))
						Integer_Array.push(number);
					else if (number && !(1 < (gcd = gcd === undefined ? number : GCD([number, gcd]))))
						return gcd;
				}

				for (use_Number = gcd !== undefined, index = 0, length = Integer_Array.length; index < length;) {
					number = Integer_Array[index++];
					if ((KEY_TYPE in number) || number.is_0())
						continue;
					if (gcd === undefined) {
						gcd = number;
						continue;
					}

					if (use_Number) {
						// number = number % gcd
						// assert: number.valueOf() is not Infinity
						if (number = number.modulo(gcd).valueOf()) {
							gcd = GCD([gcd, number]);
							if (gcd === 1)
								break;
						}
						//else: 整除，GCD 不變，跳過此數。

					} else {
						//if (typeof (gcd = number.Euclidean_algorithm(gcd)[1]) === 'number') use_Number = true;

						// 使用 .modulo() 以增進效率，不使用 .Euclidean_algorithm()。
						while (!number.modulo(gcd).is_0())
							//swap gcd, number.
							n = gcd, gcd = number, number = n;
						if (gcd.is_0(1)) {
							gcd = 1;
							break;
						}
						if (Number.isSafeInteger(n = gcd.valueOf()))
							gcd = n, use_Number = true;
					}
				};

				return gcd;
			}

			// https://en.wikipedia.org/wiki/Least_common_multiple
			function Integer_LCM(number_array) {
				if (arguments.length > 1)
					// Array.from()
					number_array = Array.prototype.slice.call(arguments);

				var lcm = new Integer(number_array[0]),
				//index = 1: [0] → lcm
				index = 1, length = number_array.length, number;
				// TODO: 增進效率。
				for (; index < length && lcm.compare(0) > 0 ;)
					lcm = lcm.division(lcm.clone().Euclidean_algorithm(
						// lcm = lcm / GCD * number
						is_Integer(number = number_array[index++]) ? number.clone() : number)[1])
						//
						.multiply(number);

				return lcm;
			}


			// factorial_cache[ n ] = n!
			// factorial_cache = [ 0! = 1, 1!, 2!, .. ]
			var factorial_cache = [1],
			// maximum cache length.
			// assert: (factorial_cache_limit!) 已逾越 SafeInteger 範圍， 約為 18。
			factorial_cache_limit = 80,
			factorial_SafeInteger_limit;
			/**
			 * Get the factorial (階乘) of (integer).<br />
			 * 
			 * @param {integer}integer
			 *            safe integer.
			 * @returns n的階乘.
			 * @see https://en.wikipedia.org/wiki/Factorial
			 */
			function factorial(integer) {
				if ((integer !== integer | 0) || !Number.isSafeInteger(integer)
						|| !(integer >= 0)) {
					library_namespace.error('factorial: invalid number: '
							+ integer);
					return NaN;
				}

				var length = factorial_cache.length;
				if (integer < length) {
					if (is_Integer(integer = factorial_cache[integer]))
						integer = integer.clone();
					return integer;
				}

				var f = factorial_cache[--length];
				if (!factorial_SafeInteger_limit) {
					while (length < integer)
						if (Number.isSafeInteger(f *= ++length))
							factorial_cache.push(f);
						else {
							f = factorial_cache[--length];
							factorial_SafeInteger_limit = length;
							break;
						}
					if (integer === length)
						return f;
				}

				f = new Integer(f);
				for (var l = Math.min(factorial_cache_limit, integer) ; length < l;)
					factorial_cache.push(f.multiply(++length).clone());

				while (length < integer)
					f.multiply(++length);
				return f;
			}

			// 組合數學

			/**
			 * Get the permutation (排列的可能方式數量) of (n).<br />
			 * = n! / (n - k)!<br />
			 * TODO: precision
			 * 
			 * @param {safe
			 *            integer}n: 排列的元素數量
			 * @param {safe
			 *            integer}k 排列的長度
			 * @param {safe
			 *            integer}precision
			 * 
			 * @returns {safe integer} permutation (排列的可能方式數量) of
			 *          (n).
			 * @see https://en.wikipedia.org/wiki/Permutation
			 */
			function permutation(n, k, precision) {
				if ((n !== n | 0) || !Number.isSafeInteger(n)
						|| !(n >= 0)) {
					library_namespace.error('permutation: invalid number: '
							+ n);
					return NaN;
				}

				if (isNaN(k))
					return factorial(n);
				if (!k)
					return factorial_cache[0];
				k = n - (k | 0);
				if (!(0 <= k && k < n)) {
					library_namespace.error('permutation: invalid number: '
							+ k);
					return NaN;
				}

				if (k < 2)
					return factorial(n);

				if (n <= factorial_cache_limit) {
					n = factorial(n);
					k = factorial_cache[k];
					if (is_Integer(n))
						n = n.division(k);
					else
						n /= k;
					return n;
				}

				var m, p;
				if (factorial_cache_limit < k)
					p = new Integer(++k);
				else
					m = factorial(factorial_cache_limit).division(factorial_cache[k]), p = new Integer(k = factorial_cache_limit + 1);
				while (++k <= n)
					p.multiply(k);
				if (m)
					p.multiply(m);

				return p;
			}

			// 多項式定理係數/multinomial coefficients
			// https://en.wikipedia.org/wiki/Multinomial_theorem#Multinomial_coefficients
			function multinomial_coefficient(count_array) {
				if (!Array.isArray(count_array))
					count_array = Array.prototype.slice.apply(arguments);
				// small → big
				count_array.sort();

				var c = new Integer(MULTIPLICATIVE_IDENTITY),
				//
				n = count_array.pop(), i = 0, l = count_array.length, k, p, f;
				while (i < l) {
					k = count_array[i++];
					p = permutation(n += k, k);
					f = factorial(k);
					c.multiply(typeof p !== 'number' || factorial_SafeInteger_limit < k ? Integer(p).division(f) : p / f);
				}
				return c;
			}

			// 二項式係數/組合
			// (1 + x)^n 的多項式展式中，x^k 項的係數。
			// combination(n, k) = n!/k!/(n-k)!
			// https://en.wikipedia.org/wiki/Combination
			function combination(n, k) {
				return multinomial_coefficient([k, n - k]);
			}

			// get the ratio of (length) th convergent of continued fraction.
			// 取得連分數序列(sequence)至第(length)個逼近的比例值
			// modified from data.math.continued_fraction
			// TODO: {Integer|Array}partial_numerator, {Boolean}get_coefficients, to quadratic
			function convergent_of(sequence, length, base, partial_numerator, get_coefficients) {
				if (!Array.isArray(sequence) || !sequence.length || sequence.length < 1)
					return sequence;

				if (length < 0)
					length += sequence.length;
				if (!(0 < length) || sequence.length < length)
					length = sequence.length;

				var numerator = new Integer(1), denominator = new Integer(0), i;
				if (length % 2)
					i = numerator, numerator = denominator, denominator = i;

				while (length--) {
					i = new Integer(sequence[length], base);
					if (length % 2)
						denominator.add(i.multiply(numerator));
					else
						numerator.add(i.multiply(denominator));
				}

				return [numerator, denominator];
			}


			Object.assign(Integer, {
				radix_point: function (p) {
					if (p)
						radix_point = p;
					return radix_point;
				},
				DEFAULT_BASE: DEFAULT_BASE,
				valid_radix: valid_radix,
				set_operate: set_operate,

				random: random,
				// maximum
				max: function Integer_max() {
					// get max()
					return extreme(arguments);
				},
				min: function Integer_min() {
					// get min()
					return extreme(arguments, true);
				},
				compare: Integer_compare,

				// WARNING 注意: this operation will modify both dividend and divisor!
				Euclidean_algorithm: function (dividend, divisor, get_coefficients) {
					if (!is_Integer(dividend))
						dividend = new Integer(dividend, is_Integer(divisor) && divisor[KEY_BASE]);
					return dividend.Euclidean_algorithm(divisor, get_coefficients);
				},
				GCD: Integer_GCD,
				LCM: Integer_LCM,

				// TODO: precision
				square_root: function (number, negative_exponent) {
					return (new Integer(number)).square_root(negative_exponent);
				},

				E: Integer_E,
				exp: Integer_exp,
				LN2: Integer_LN2,
				LN10: Integer_LN10,
				PI: Integer_PI,

				factorial: factorial,
				permutation: permutation,
				combination: combination,
				multinomial_coefficient: multinomial_coefficient,

				convergent_of: convergent_of,

				is_Integer: is_Integer
			});

			// ---------------------------------------------------------------------//

			// 因 clone 頗為常用，作特殊處置以增進效率。
			function clone(convert_to_Number_if_possible, target_Integer, include_cache) {
				if (convert_to_Number_if_possible === true) {
					var value = this.valueOf();
					if (value <= Number.MAX_SAFE_INTEGER) {
						return value;
					}

				} else if (typeof convert_to_Number_if_possible !== 'boolean' && include_cache === undefined) {
					// shift arguments
					include_cache = target_Integer;
					target_Integer = convert_to_Number_if_possible;
				}
				if (!is_Integer(target_Integer)) {
					target_Integer = new_instance();
				}

				[KEY_BASE, KEY_NEGATIVE, KEY_TYPE in this ? KEY_TYPE : KEY_EXPONENT].forEach(function (key) {
					if (key in this)
						target_Integer[key] = this[key];
				}, this);

				if (!(KEY_TYPE in this)) {
					array_clone(this, target_Integer);

					if (include_cache) {
						if (KEY_CACHE in this)
							// clone Array
							target_Integer[KEY_CACHE] = this[KEY_CACHE].slice();
						if (KEY_FACTORS in this)
							target_Integer[KEY_FACTORS] = this[KEY_FACTORS].slice();
					}
				}

				return target_Integer;
			}

			function get_precision(number) {
				var matched = String(number).match(/^-?(\d*)\.(\d+)$/);
				if (matched)
					return (matched[1] === '0' ? 0 : matched[1].length) + matched[2].length;
			}

			/**
			 * assignment value of integer instance.<br />
			 * 僅設定單一值。
			 *
			 * @param	{Number|String|Integer}number 輸入數值(value/number)大小。
			 * @param	{natural number|String|Array}[base]	輸入字串採用之進位制基底/數字 digit 字集。區分大小寫。僅於輸入字串時有用。
			 * @param	{natural number}[to_base]	內採基底/進位制。
			 *
			 * @example
			 * <code>
			 * CeL.log((new CeL.integer('876567896')).op('*','6456789976545678'));
			 * </code>
			 *
			 * @return	回傳 integer 物件。
			 */
			function assignment(number, base, to_base, force_change_base) {

				if (typeof number === 'number' && get_precision(number) < MAX_TRUNCATED) {
					//當可能以十進位為底做截斷時，採用十進位之值。
					//e.g., 輸入 3423.3451242354，則取 '3423.3451242354'，而非 3423.34512423539990778081119060516357421875。
					number = number.toString();
					// shift arguments
					force_change_base = to_base;
					to_base = base;
					base = DEFAULT_RADIX;
				}

				/**
				 * 前期處理: String → Number / Integer<br />
				 * 轉換指定進位的數字文字，成為{Number}純量或 {Integer} 物件。<br />
				 * treat arguments as: (number_String, base, to_base)
				 *
				 * @see
				 * <a href="https://en.wikipedia.org/wiki/Numerical_digit" accessdate="2010/4/16 20:47">Numerical digit</a>
				 */
				if (typeof number === 'string' && (number = number.trim())) {
					// 正規化(normalize) base

					// {Array}base → {String}base
					if (Array.isArray(base)) {
						base.forEach(function (digit) {
							if (digit.length !== 1)
								library_namespace.error('assignment: Invalid digit of base: [' + digit + '].');
						});
						base = base.join('');
					}
					if (typeof base === 'string' && DEFAULT_DIGITS.startsWith(base.toLowerCase()))
						// 使用 DEFAULT_DIGITS。
						base = base.length;

					if (typeof base === 'string' ? base.length < 2
						//base is number
						: !valid_radix(base)) {
						if (base)
							library_namespace.error('assignment: Invalid base: [' + base + ']');
						base = undefined;
					}

					var digits, value;

					if (value = number.match(PATTERN_HEX))
						number = value[1], base = HEX_RADIX;

					if (typeof base === 'string') {
						digits = digit_cache(base.split(''));
						value = number.split('');
						number = new Integer(0, base = base.length);


						// 使用 DEFAULT_DIGITS。不分大小寫(將轉成小寫)。基本上應與 parseInt() 一致。
						//	[ full , sign, integer part 整數部分, fractional part 小數部分, decimal exponent 指數, percent ]
					} else if (value = (value = number.toLowerCase()).match(PATTERN_NUMBER)
						//
						|| value.match(PATTERN_NUMBER_HEX)) {
						if (!base)
							base = DEFAULT_RADIX;
						number = new Integer(0, base);
						//處理 minus sign
						if (value[1] === '-')
							number[KEY_NEGATIVE] = true;
						//處理指數
						value[4] |= 0;
						if (value[3]) {
							//處理掉 fractional part 小數部分
							value[4] -= value[3].length;
							value[2] += value[3];
						}
						if ((digits = value[2].match(/^(.*)(0+)$/))
							//1e4: 若是 exponent 不大，則基本上無須處理，直接展開即可。
						&& (value[4] < 0 || 1e4 < value[4] + digits[2].length)) {
							//去掉最後的 0
							value[4] += digits[2].length;
							value[2] = digits[1];
						}
						if (value[5])
							value[4] += exponent_parts_per[value[5]];
						if (value[4])
							//1e4: 若是 exponent 不大，則基本上無須處理，直接展開即可。
							if (value[4] < 0 || 1e4 < value[4])
								number[KEY_EXPONENT] = value[4];
							else
								value[2] += '0'.repeat(value[4]);

						//去掉起頭的 '0'。
						value = value[2].replace(/^0+/, '').split('');
						digits = DEFAULT_DIGITS_CACHE;


						// 死馬當活馬醫，嘗試以 native method 取得。
						// 若非十進位又包含 radix_point，則跳過。
					} else if (//(!base || base !== DEFAULT_RADIX || number.indexOf(radix_point) === -1) &&
						Number.isSafeInteger(value = base ? parseInt(number, base) : parseFloat(number)))
						number = value;


					else {
						library_namespace.error('assignment: Invalid number string: [' + number + '].');
						number = NaN;
					}

					if (Array.isArray(value)) {
						//base: {natural number}length of base.
						//digits: {Object}base cache.
						//value: {Array}digits of specified base
						// number: 欲轉換 base 之 {Integer}。

						value.reverse();
						// Array.map()
						value.forEach(function (digit, index) {
							if (digit in digits)
								number[index] = digits[digit];
							else
								library_namespace.error('assignment: Invalid number digit: [' + digit + '].');
						});
						if (!to_base && count_exponent(DEFAULT_BASE, base))
							to_base = DEFAULT_BASE;
					}

				} else if (MIN_RADIX <= base && !to_base || typeof to_base === 'boolean')
					// shift arguments
					force_change_base = to_base, to_base = base, base = undefined;

				// ---------------------------------------
				if (is_Integer(number)) {
					// 已經是 Integer 了。
					// clone, deep_copy。

					//let to_base === this[KEY_BASE], base === number[KEY_BASE]
					// 無設定 to_base 時，將 base 視作 to_base。
					// assert: number[KEY_BASE] 為正規 base。
					to_base = valid_base(to_base, force_change_base) || number[KEY_BASE];
					base = number[KEY_BASE];

					if (this !== number || base !== to_base) {
						if (this === number)
							number = number.clone();
						else {
							// copy attributes.
							this[KEY_NEGATIVE] = number[KEY_NEGATIVE];

							if (KEY_CACHE in number) {
								var array = this[KEY_CACHE] = [];
								number[KEY_CACHE].forEach(function (string, radix) {
									array[radix] = string;
								});
							} else
								delete this[KEY_CACHE];

							if (KEY_FACTORS in number) {
								var array = this[KEY_FACTORS] = [];
								number[KEY_FACTORS].forEach(function (factor) {
									if (factor)
										array.push(is_Integer(factor) ? factor.clone() : factor);
								});
							} else
								delete this[KEY_FACTORS];
						}

						do_modified(this);

						this[KEY_BASE] = to_base;

						if (KEY_TYPE in number) {
							//處理特殊值。
							this[KEY_TYPE] = number[KEY_TYPE];
							// Can't use delete @ IE8.
							//delete this[KEY_EXPONENT];
							this[KEY_EXPONENT] = 0;
							array_reset(this);

						} else if (to_base === base || number.length < 2 && !(to_base <= number[0])) {
							//處理簡易數值。
							if (number[KEY_EXPONENT])
								this[KEY_EXPONENT] = number[KEY_EXPONENT];
							else
								// Can't use delete @ IE8.
								//delete this[KEY_EXPONENT];
								this[KEY_EXPONENT] = 0;
							array_clone(number, this);

						} else {
							// change base to / set base / 數字基底的轉換。
							// https://en.wikipedia.org/wiki/Change_of_base
							// https://en.wikipedia.org/wiki/Base_conversion

							var exponent = count_exponent(to_base, base), to_digit_Array = array_reset(this),
							scalar = 0,
							base_now = ZERO_EXPONENT;

							// 對 exponent 做特殊處置，增進效率。
							if (0 < exponent) {
								// e.g., base 10 → to_base 100
								if (number[KEY_EXPONENT]) {
									//因為會改變 number，因此新造一個。
									number = number.clone();
									if (0 < number[KEY_EXPONENT]) {
										// e.g., base=1e1, to_base=1e7, 23e(+17*1) = 23000e(+2*7)
										this[KEY_EXPONENT] = number[KEY_EXPONENT] / exponent | 0;
										shift_digits(number, -number[KEY_EXPONENT] % exponent);
									} else {
										// e.g., base=1e1, to_base=1e7, 23e(-17*1) = 230000e(-3*7)
										this[KEY_EXPONENT] = (number[KEY_EXPONENT] / exponent | 0) - 1;
										shift_digits(number, -(number[KEY_EXPONENT] % exponent) - exponent);
									}
								}

								number.forEach(function (digit, index) {
									scalar += digit * base_now;
									if ((index + 1) % exponent === 0)
										to_digit_Array.push(scalar), scalar = 0, base_now = ZERO_EXPONENT;
									else
										base_now *= base;
								});
								if (scalar)
									to_digit_Array.push(scalar);
								array_clone(to_digit_Array, this);

							} else if (exponent < 0) {
								// e.g., base 100 → to_base 10
								exponent = -exponent;
								if (number[KEY_EXPONENT])
									// e.g., base=1e7, to_base=1e1, 2300e(+2*7) = 2300e(+14*1)
									// e.g., base=1e7, to_base=1e1, 2300e(-2*7) = 2300e(-14*1)
									this[KEY_EXPONENT] = exponent * number[KEY_EXPONENT];
								number.forEach(function (digit, index) {
									for (var i = 0; i < exponent; i++)
										to_digit_Array.push(digit % to_base), digit = digit / to_base | 0;
								});
								trim_0(to_digit_Array);
								array_clone(to_digit_Array, this);

							} else if (1 === (exponent = Math.log(MAX_BASE) / Math.log(to_base) | 0)) {
								//無法做特殊處置時之一般性處理。
								var fraction = 0, index, boundary = multiplication_boundary(to_base);

								if (number[KEY_EXPONENT]) {
									//因為會改變 number，因此新造一個。
									number = number.clone();
									if (0 < number[KEY_EXPONENT])
										//直接展開指數。
										number.expand_exponent();
									else {
										library_namespace.error('assignment: Unable to convert from base ' + base + ' to base ' + to_base + ' with exponent ' + number[KEY_EXPONENT] + ' without loss of significance.');
										//計算 fraction。
										index = -number[KEY_EXPONENT];
										for (var fraction_base = ZERO_EXPONENT; fraction_base && index;)
											fraction += number[--index] * (fraction_base /= base);
										//直接展開指數。去掉 fraction。
										number.expand_exponent();
									}
								}

								//reset (this)
								array_clone([0], this);

								index = number.length;
								while (0 < index--) {
									base_now *= base;
									scalar = scalar * base + number[index];
									if (boundary < base_now * base || index === 0) {
										this.for_each_digit(function (digit, carry, index) {
											// 除了積本身，這邊可能出現 scalar<=(boundary-1), carry<=(base-1)。
											// (base-1)*boundary+(boundary-1)+(base-1) <= Number.MAX_SAFE_INTEGER
											// This is also the limit of (base), therefore:
											// MAX_BASE<=Math.sqrt(Number.MAX_SAFE_INTEGER+2),
											// boundary<=(Number.MAX_SAFE_INTEGER+2)/base-1,
											return digit * base_now + carry + (index ? 0 : scalar);
										});
										//reset
										scalar = 0, base_now = ZERO_EXPONENT;
									}
								}

								if (fraction)
									this.add(fraction, this[KEY_NEGATIVE]);

								if (0 === number.length)
									// assert: Array.(number)
									number.push(0);

							} else
								//盡可能把 to_base 加大，減少 call .for_each_digit() 的次數，以增進效率。
								this.assignment(new Integer(number, Math.pow(to_base, exponent)), to_base, force_change_base);
						}
					}

					// ---------------------------------------
				} else {
					if (typeof number !== 'number') {
						library_namespace.error('assignment: Invalid value to assignment: [' + number + '].');
						number = NaN;
					}

					if (base !== to_base
						//
						|| this.compare(number) !== 0) {
						do_modified(this);

						// value/scalar純量 to digit Array.
						// treat arguments as: (number, do not set fraction = false, to_base)

						// 對於非數字，無法斷定。
						if (number < 0)
							number = -number,
							this[KEY_NEGATIVE] = true;
						else
							delete this[KEY_NEGATIVE];

						delete this[KEY_FACTORS];
						// Can't use delete @ IE8.
						//delete this[KEY_EXPONENT];
						this[KEY_EXPONENT] = 0;

						if (!isFinite(number)) {
							//NaN, Infinity, -Infinity
							this[KEY_TYPE] = number;
							array_reset(this);

						} else {
							delete this[KEY_TYPE];
							//to_base 實為欲轉換之標的 base。
							if (to_base = valid_base(to_base, force_change_base))
								this[KEY_BASE] = to_base;
							else
								to_base = this[KEY_BASE];
							//base 實為是否不轉換小數部分。
							if (base && number !== Math.floor(number)) {
								//number 有小數部分。
								library_namespace.warn('assignment: Number has a fractional part: [' + number + '].');
								number = Math.floor(number);
							}
							if (number < to_base && number === (number | 0))
								// 僅設定scalar純量部份。
								array_clone([number], this);

							else {
								var digit_Array = array_reset(this);

								// assert: 1 < to_base
								if (number !== Math.floor(number)) {
									// 當 base_now === 0，表示系統已無法處理較這更小的數字，再保留這之下的數值已無意義。
									for (var base_now = ZERO_EXPONENT, remainder = number % 1; remainder && (base_now /= to_base) ;)
										digit_Array.unshift((remainder *= to_base) | 0), remainder %= 1;
									this[KEY_EXPONENT] = -digit_Array.length;
									number = Math.floor(number);
								} else if (!Number.isSafeInteger(number))
									//test only
									library_namespace.warn('assignment: Number is too large: [' + number + '].');

								while (0 < number) {
									digit_Array.push(number % to_base);
									number = Math.floor(number / to_base);
								}
								array_clone(digit_Array, this);
							}
						}
					}
				}

				return this;
			}


			function get_test_value(number) {
				return is_Integer(number) ? number.valueOf(TYPE_TEST) : +number;
			}


			// little_natural: little natural number < MIN_RADIX, e.g., 1
			function is_0(little_natural) {
				return !(KEY_TYPE in this) && this.length < 2 && (little_natural ? !this[KEY_EXPONENT] && this[0] === little_natural : !this[0]);
			}

			/**
			 * 測試大小/比大小。僅比較量之大小，忽略符號。
			 * @param number	the number to compare
			 * @return	{Number}	0:==, <0:<, >0:>
			 * @_name	_module_.prototype.compare_to
			 */
			// return < 0 : this < number
			// return === 0 : this === number
			// return > 0 : this > number
			// return others : invalid number
			function compare_amount(number) {
				if (this === number)
					return 0;

				var i = typeof number === 'string' ? 0 : get_test_value(number), l, d;
				if ((KEY_TYPE in this) || !isFinite(i))
					// NaN 等極端數字的情形。
					return Math.floor(this[KEY_TYPE]) - Math.floor(i);

				// 強制轉成同底的 Integer 再處理。
				if (!is_Integer(number) || this[KEY_BASE] !== number[KEY_BASE])
					number = new Integer(number, null, this[KEY_BASE]);

				i = this.length;
				// 處理 [KEY_EXPONENT]
				d = this[KEY_EXPONENT] - number[KEY_EXPONENT];
				l = i + d - number.length;
				if (!l)
					//找到第一個兩者不同的位數。
					while (0 < i-- && !(l = (this[i] || 0) - (number[i + d] || 0)));

				return l;
			}

			/**
			 * 測試大小/比大小
			 * @param number	the number to compare
			 * @return	{Number}	0:==, <0:<, >0:>
			 * @_name	_module_.prototype.compare_to
			 */
			function compare(number) {
				var c = typeof number === 'string' ? 0 : get_test_value(number);
				if ((KEY_TYPE in this) || !isFinite(c))
					// NaN 等極端數字的情形。
					return this[KEY_TYPE] - c;

				if (!is_Integer(number)) {
					if (typeof number === 'number' && this.length < 3
						//2: Math.min(-Math.floor(Math.log(Number.EPSILON) / Math.log(MAX_BASE), Math.floor(Math.log(Number.MAX_VALUE) / Math.log(MAX_BASE)) + 1))
						//預防 overflow or underflow.
						&& Math.abs(this[KEY_EXPONENT]) < 2)
						return this.valueOf() - number;
					number = new Integer(number, null, this[KEY_BASE]);
				}

				if (this[KEY_NEGATIVE] ^ number[KEY_NEGATIVE])
					return this[KEY_NEGATIVE] ? -1 : 1;

				c = this.compare_amount(number);
				return this[KEY_NEGATIVE] ? -c : c;
			}


			// 工具函數
			// 將有問題的數字全部作正確進位。
			// e.g., [10, 11].base = 10 → [0, 2, 1]
			function normalize_handle(digit, carry) {
				return digit + carry;
			}
			function normalize_digits(integer) {
				integer.for_each_digit(normalize_handle);
			}


			// 工具函數
			// 將 this integer instance 自低位依 callcack() 處理至高位，
			// 結果存至 target_Integer[跳過 target_shift 個] || this。
			// 可自動處理進退位。無法處理 overflow 問題。
			// assert: callcack() 任一回傳，皆 isSafeInteger() === true。
			function for_each_digit(callcack, target_Integer, target_shift) {
				if (!target_Integer)
					target_Integer = this;
				target_shift |= 0;

				var base = target_Integer[KEY_BASE], carry = 0, length = this.length, index = 0, digit;
				if (!Number.isSafeInteger(base))
					library_namespace.error('for_each_digit: Invalid base: [' + base + '].');

				for (; index < length || carry !== 0 ; index++, target_shift++)
					// 當 index >= length，僅作進位處理。
					if (typeof (digit = index < length ? callcack(this[index] || 0, carry, index)
						// 當 this 皆 callcack() 過後，僅處理進退位。
						: carry + (target_Integer[target_shift] || 0)) === 'number') {
						if (base <= digit) {
							// 處理進位。
							// assert: 0 < (digit / base | 0)
							// MIN_BASE: 因為用 `|0`，故 base < 5 會出現問題:
							// (Number.MAX_SAFE_INTEGER / 4 | 0) < 0, 0 < (Number.MAX_SAFE_INTEGER / 5 | 0)
							carry = digit / base | 0;
							digit %= base;
						} else if (digit < 0 && (index < length || target_shift < target_Integer.length)) {
							// 處理退位。
							carry = digit / base | 0;
							//確保 digit >=0
							if ((digit %= base) < 0)
								carry--, digit += base;
						} else
							carry = 0;
						target_Integer[target_shift] = digit;
					} else
						carry = 0;

				trim_0(target_Integer);

				if (carry)
					library_namespace.error('for_each_digit: carry [' + carry + '] left.');
				return carry;
			}

			// ---------------------------------------------------------------------//
			//四則運算，即加減乘除， + - * / (+-×÷)**[=]
			// https://en.wikipedia.org/wiki/Elementary_arithmetic

			// Addition 和: addend + addend = sum
			function add(addend, is_subtract) {
				// test if addend is zero.
				if (Number.isNaN(this[KEY_TYPE]) || get_test_value(addend) === 0)
					return this;

				// 強制轉成同底的 Integer 再處理。
				if (!is_Integer(addend) || this[KEY_BASE] !== addend[KEY_BASE])
					addend = new Integer(addend, null, this[KEY_BASE]);

				// assert: is_Integer(addend)

				if ((KEY_TYPE in this) || (KEY_TYPE in addend)) {
					addend = addend.valueOf(TYPE_TEST);
					// do simulation: 模擬與 NaN 等極端數字作運算。
					addend = this.valueOf(TYPE_TEST) + (is_subtract ? -addend : addend)
					if (addend !== this.valueOf(TYPE_TEST))
						this.assignment(addend);
					return this;
				}

				// 至此特殊值處理完畢。
				do_modified(this);

				var reverse = (is_subtract ^= this[KEY_NEGATIVE] ^ addend[KEY_NEGATIVE])
				//當兩數正負不同，且 abs(this) < abs(addend) 時，即需要反向，
				//將 addend 放在前項，改成 this = (addend - this)。
				&& this.compare_amount(addend) < 0,
				//
				shift = addend[KEY_EXPONENT] - this[KEY_EXPONENT];

				if (reverse)
					this[KEY_NEGATIVE] = !this[KEY_NEGATIVE];

				if (shift < 0)
					//為了位數對齊，須補足不足的位數。
					shift_digits(this, shift), shift = 0;

				addend.for_each_digit(
					// (addend digit, carry, index of addend)
					(reverse ? function (d, c, i) { return c + d - (this[i + shift] || 0); }
						: is_subtract ? function (d, c, i) { return c + (this[i + shift] || 0) - d; }
						: function (d, c, i) { return c + (this[i + shift] || 0) + d; }).bind(this)
					, this,
					//位數對齊。
					shift);

				if (this[KEY_NEGATIVE] && !this.valueOf(TYPE_TEST))
					//0, NaN
					delete this[KEY_NEGATIVE];

				return this;
			}

			// Subtraction 差: minuend − subtrahend = difference
			function subtract(subtrahend) {
				return this.add(subtrahend, true);
			}



			// 乘除法之先期處理。
			//@inner
			function multiply_preprocess(integer, number, is_division) {
				if (integer === number)
					throw new Error('multiply_preprocess: Same operand!');

				var value = get_test_value(number);
				// NaN (+-×÷) number = NaN
				if (Number.isNaN(integer[KEY_TYPE])
					// test if number is MULTIPLICATIVE_IDENTITY.
					|| value === MULTIPLICATIVE_IDENTITY && (!is_division || !integer[KEY_EXPONENT]))
					return;

				if (value === -MULTIPLICATIVE_IDENTITY && (!is_division || !integer[KEY_EXPONENT])) {
					//Be sure not 0, NaN.
					if (integer.valueOf(TYPE_TEST))
						integer.negate();
					return;
				}

				if (!is_Integer(number) || integer[KEY_BASE] !== number[KEY_BASE])
					// 強制轉成同底的 Integer 再處理。
					number = new Integer(number, null, integer[KEY_BASE]);

				if (value === ABSORBING_ELEMENT
					//
					|| (KEY_TYPE in integer) || (KEY_TYPE in number)
					//
					|| integer.is_0(ABSORBING_ELEMENT)) {
					// do simulation: 模擬與 NaN 等極端數字作運算。
					var v = integer.valueOf(TYPE_TEST), r;
					if (is_division) {
						r = v / value;
						value = v % value;
					} else
						value = v * value;
					if (value !== v)
						integer.assignment(value);
					return r;
				}

				// 至此特殊值處理完畢。
				do_modified(integer);

				return number;
			}


			// test:
			// check base & value: Integer (test if .is_safe_integer(true)===0, ±1, NaN)
			// show error and exit: NaN, ±Infinity
			// exit: 1
			// set sign and exit: -1
			// set value and exit: 0
			// translate to Integer: safe integer(e.g., 123), 1.23e123, '123'+'4'.repeat(400), '123'+'4'.repeat(16); the string type & negative
			// has a fractional part (有小數部分): .123, 1.123, 1903719924734991.36479887; the string type & negative; '123'+'4'.repeat(16)+'.1234'

			// 在前兩位數以上皆相同時，方可考慮採用 a × b = ((a+b)/2)^2 - ((a-b)/2)^2。

			// Multiplication 乘: multiplicand × multiplier = product
			// TODO: https://en.wikipedia.org/wiki/F%C3%BCrer%27s_algorithm
			// TODO: precision
			function multiply(multiplier, /* TODO */ precision) {
				if (multiplier = multiply_preprocess(this, multiplier)) {
					//特殊值已於 multiply_preprocess() 處理過。

					// copy factors, cache 用
					if (!(KEY_FACTORS in this))
						this[KEY_FACTORS] = [];
					this[KEY_FACTORS].push(multiplier);

					this[KEY_EXPONENT] += multiplier[KEY_EXPONENT];

					//一般乘法

					//	scalar * this，結果放在 target_digit_Array。
					var target_digit_Array = [];
					target_digit_Array[KEY_BASE] = this[KEY_BASE];

					// assert: multiplier 任一元素與 this 任一元素相乘，皆 isSafeInteger() === true。
					multiplier.forEach(function (scalar, shift) {
						if (scalar)
							this.for_each_digit(function (digit, carry, index) {
								// assert: target_digit_Array[] is natural number < base
								// 除了積本身，這邊可能出現 carry<=(base-2), target_digit_Array[]<=(base-1), 共 (2*base-3)。
								// assert: Number.isSafeInteger(base*base-2)
								// therefore: base<=Math.sqrt(Number.MAX_SAFE_INTEGER+2)
								return digit * scalar + carry + (target_digit_Array[index + shift] || 0);
							}, target_digit_Array, shift);
					}, this);

					//回存。
					array_clone(target_digit_Array, this);

					//預防中空跳號。
					if (Array.isArray(this)) {
						var index = this.length;
						while (0 < index--)
							if (this[index] === undefined)
								this[index] = 0;
					}

					if (multiplier[KEY_NEGATIVE])
						this.negate();
				}

				return this;
			}

			var REVERSE_REMAINDER = -2;
			// this → remainder。
			// return {digit Array}quotient
			// https://en.wikipedia.org/wiki/Euclidean_division
			// https://en.wikipedia.org/wiki/Division_algorithm
			function division(denominator, negative_exponent, get_nearest) {
				if (!is_Integer(denominator = multiply_preprocess(this, denominator, true))) {
					if (denominator === undefined)
						// denominator == ±1
						if (Number.isNaN(this[KEY_TYPE]))
							// NaN (+-×÷) number = NaN
							denominator = NaN;
						else if (get_test_value(this)) {
							// integer / ±1 = ±d, remainder 0.
							denominator = this.clone();
							this.assignment(0);
						} else
							denominator = 0;
					return denominator;
				}


				if (Number.isSafeInteger(negative_exponent |= 0)
					&& 0 < (negative_exponent -= denominator[KEY_EXPONENT])
					// 不減低精度，因此不處理負數。
					&& 0 < (negative_exponent += this[KEY_EXPONENT]))
					shift_digits(this, -negative_exponent);

				// (dividend or numerator) ÷ (divisor or denominator) = quotient + remainder / denominator
				var numerator = this, base = this[KEY_BASE], quotient = new Integer(0, base),
				// N: the highest digits of numerator.
				// D: the highest digits of denominator.
				N, NI, D, DI, Q, next_N, next_D;

				quotient[KEY_EXPONENT] = this[KEY_EXPONENT] - denominator[KEY_EXPONENT];

				// When denominator is bigger than numerator, the quotient will be 0 and the remainder will be numerator itself.
				while (0 < (DI = denominator.length) && DI <= (NI = numerator.length)) {
					// Get ths first non zero digit D of denominator.
					// 使用 while 的原因:對 Uint32Array 之類無法保證前幾位不為 0。
					while (!(D = denominator[--DI]) && 0 < DI);

					// Get ths first non zero digit N of numerator.
					while (!(N = numerator[--NI]) && 0 < NI);
					// 多取一位 numerator，確保 N > D。
					if (N <= D && 0 < NI && DI < NI)
						N = N * base + numerator[--NI];

					if (NI < DI || N < D)
						break;
					// assert: N >= D, NI >= DI

					//決定 determines Q = thie next digit of quotient
					// assert: (N + 1) / D === (Math.floor((N + 1) / D) | 0)
					if (DI === 0)
						//There is no digits of denominator lefting. The quotient digit has no other possibility.
						Q = N / D | 0;
					else
						//考慮兩個因素:
						//N, D 將在 Number.isSafeInteger() 的範圍內，一直乘到 N/(D+.99999~)|0===(N+.99999~)/D|0 為止。此兩數為當前 quotient 最高位數之可能值範圍。
						while (((Q = N / (D + 1) | 0) < ((N + 1) / D | 0))
							//
							&& 0 < DI
							&& Number.isSafeInteger(next_N = N * base + numerator[NI - 1])
							&& Number.isSafeInteger(next_D = D * base + denominator[DI - 1])) {
							N = next_N; NI--;
							D = next_D; DI--;
						}

					// 通常發生在 numerator 極為接近 denominator 之 Q 或 Q+1 倍時，會無法判別應該用 Q 或 Q+1。
					if (Q === 0) {
						// assert: numerator, denominator 前面幾位大小相同。
						// assert: index of quotient Array === NI - DI，尚未 borrowed。
						// 確認 numerator, denominator 孰大孰小。
						if (N === D)
							while (0 < DI && numerator[--NI] === denominator[--DI]);
						if (N < D || numerator[NI] < denominator[DI])
							if (--NI < DI)
								// numerator now (= remainder) < denominator
								break;
							else
								Q = base - 1;
						else
							// 剛好足夠減一。
							Q = 1;
					}

					//NI → index of quotient Array, the diff of numerator and denominator.
					NI -= DI;
					quotient[NI] = (quotient[NI] || 0) + Q;

					//numerator → remainder
					// numerator -= Q * denominator * base ^ (index of quotient Array = NI)
					denominator.for_each_digit(function (digit, carry, index) {
						// assert: numerator[index + NI] >= 0, carry <= 0, digit <= 0, Q > 0
						return carry + (numerator[index + NI] || 0) - Q * digit;
					}, numerator, NI);
					// assert: numerator >= 0
				}

				if (get_nearest && base <= 2 * this.at(-1)) {
					quotient[0]++;
					if (get_nearest === REVERSE_REMAINDER) {
						N = base;
						this.for_each_digit(function (digit, carry, index) {
							return (index ? N : N--) - digit + carry;
						});
					}
				}

				//處理需要進位的情況。雖然不常見，偶爾還是會發生，甚至連續進位，因此到最後才一次處理。
				normalize_digits(quotient);

				// remainder 不受 denominator 正負影響。
				// quotient 受 denominator 正負影響。
				if (quotient.valueOf(TYPE_TEST))
					// quotient is not 0 or NaN
					//e.g., 4/-5
					quotient[KEY_NEGATIVE] = this[KEY_NEGATIVE] ^ denominator[KEY_NEGATIVE];

				if (!this.valueOf(TYPE_TEST))
					// remainder is not 0 or NaN
					delete this[KEY_NEGATIVE];

				// this → remainder,
				// return {digit Array}quotient
				return quotient;
			}

			// Division 除: dividend ÷ divisor = quotient
			function divide() {
				return this.assignment(division.apply(this, arguments));
			}

			function modulo(modulus) {
				//if (KEY_TYPE in this) this.assignment(NaN); else
				if (Number.isSafeInteger(modulus) && !(KEY_TYPE in this) && !this[KEY_EXPONENT]) {
					// https://zh.wikipedia.org/wiki/%E6%95%B4%E9%99%A4%E8%A7%84%E5%88%99
					var base = this[KEY_BASE] % modulus,
					base_remainder = ZERO_EXPONENT, remainder = 0, index = 0;
					do {
						// 可於最後幾位判別。
						if (this[index]) {
							remainder += this[index] * base_remainder;
							remainder %= modulus;
						}
						if (base !== 1)
							base_remainder = base_remainder * base % modulus;
					} while (++index < this.length && 0 !== base_remainder);
					this.assignment(this[KEY_NEGATIVE] ? -remainder : remainder);

				} else
					division.apply(this, arguments);

				return this;
			}

			// 模反元素, modular multiplicative inverse
			// https://en.wikipedia.org/wiki/Modular_multiplicative_inverse
			function modular_inverse(modulus) {
				return result = this.clone().Euclidean_algorithm(modulus, true);
				if (result[1] === MULTIPLICATIVE_IDENTITY)
					return result[2];
			}

			// assert: GET_OBJECT 並非正規 radix.
			var GET_OBJECT = 1;
			// precise divide, to repeating decimal
			// radix === GET_OBJECT: get {Integer} object instead of {String}
			// return [ integer part, non-repeating fractional part, period (repeating decimal part) ]
			// https://en.wikipedia.org/wiki/Repeating_decimal
			function precise_divide(DENOMINATOR, radix, period_limit) {
				if (!DENOMINATOR)
					return [NaN, '', ''];

				if (radix !== GET_OBJECT && !valid_radix(radix))
					radix = DEFAULT_RADIX;

				if (DENOMINATOR == MULTIPLICATIVE_IDENTITY)
					return [radix === GET_OBJECT ? this : this.toString(radix), '', ''];

				// 不改變 this, DENOMINATOR
				DENOMINATOR = (new Integer(DENOMINATOR, null, this[KEY_BASE])).expand_exponent();
				var REMAINDER = this.clone().expand_exponent(), return_Array, gcd;
				if (DENOMINATOR[KEY_NEGATIVE]) {
					delete DENOMINATOR[KEY_NEGATIVE];
					REMAINDER[KEY_NEGATIVE] = !REMAINDER[KEY_NEGATIVE];
				}
				return_Array = REMAINDER.division(DENOMINATOR);

				if (radix !== GET_OBJECT)
					return_Array = return_Array.toString(radix);
				return_Array = [return_Array];
				if (REMAINDER.is_0()) {
					return_Array.push('', '');
					return return_Array;
				}

				if ((gcd = Integer_GCD(REMAINDER.abs().clone(), DENOMINATOR.clone())) !== 1)
					REMAINDER = REMAINDER.division(gcd), DENOMINATOR = DENOMINATOR.division(gcd);

				// assert: GCD(REMAINDER, DENOMINATOR) = 1, 0 < REMAINDER < DENOMINATOR, DENOMINATOR[KEY_EXPONENT] = 0.
				// e.g., 67/300 = 0.2233333...
				//radix: 10
				//F: non-repeating fractional part, '22'
				//f: digits of F, 2
				//R: 循環節 period (repeating decimal part), '3'
				//r: digits of R, 1
				//[FR]: the concatenation of F and R, '223'

				// 原理:
				// REMAINDER / DENOMINATOR = F / radix^f + R / (radix^f (radix^r - 1)) = ([FR] - F) / (radix^f (radix^r - 1))
				// radix^f (radix^r - 1) REMAINDER = ([FR] - F) DENOMINATOR
				// radix^(f+r) * REMAINDER / DENOMINATOR = [FR] + R / (radix^r - 1)
				// floor(radix^(f+r) * REMAINDER / DENOMINATOR) = [FR] = radix^r * F + R

				// 找出 f:
				// 因 GCD( DENOMINATOR, radix^f ) == GCD( DENOMINATOR, radix^(f+1) ) * d，可以此找出 f。
				// 令 d = DENOMINATOR / GCD( DENOMINATOR, radix^f )，為去掉所有 radix 因數之 DENOMINATOR。
				// 找出 r:
				// 再測試得 d | 99..9 (共 r 位)

				// 計算出 F, R:
				// 令 remainder = floor(radix^(f+r) * REMAINDER / DENOMINATOR) = [FR] = radix^r * F + R，則
				// F = remainder.slice(r),
				// R = remainder.slice(0, r).

				DENOMINATOR = new Integer(DENOMINATOR, radix);
				var d = DENOMINATOR.clone(), f = 0, r = new Integer(0, radix);
				//r → (10) in radix
				r[1] = 1;

				// 找出 f:
				// TODO: 增進效率。
				while ((gcd = Integer_GCD(d.clone(), r.clone())) !== 1)
					f++, d = d.division(gcd);

				// 找出 r:
				if (d.is_0(1))
					//is terminating decimal
					r = 0;
				else {
					// 測得 d | (remainder = 99..9) (共 r 位)
					//得先取與 d 相同之位數，保證 d <= remainder
					var remainder = new Integer(0, radix), highest = parseInt('10', radix) - 1;
					if (Array.isArray(d)) {
						//快捷方法。
						remainder.length = r = d.length;
						//fill up with highest digit
						remainder.fill(highest);
					} else {
						r = d.length;
						//確認 nonzero 之最高位。
						while (0 < r && d[--r] === 0);
						gcd = r;
						while (0 < gcd)
							//fill up with highest digit
							remainder[--gcd] = highest;
					}
					//若可能，嘗試簡化計算:將 d 轉成 {Number}。
					if (Number.isSafeInteger((gcd = d.valueOf()) * radix)) {
						remainder = remainder.modulo(d = gcd).valueOf();
						var limit = period_limit || 1e6;
						while ((remainder %= d) !== 0) {
							//未能整除。
							if (++r > limit) {
								// TODO: 盡量取得可得位數。
								library_namespace.error('precise_divide: The period of repeating decimal is too long (large than ' + limit + ')!');
								return;
							}
							//remainder + 1 <= d
							remainder = (remainder + 1) * radix - 1;
						}
					} else {
						var limit = period_limit || 1e4;
						while (!remainder.modulo(d).is_0()) {
							//未能整除。
							if (++r > limit) {
								// TODO: 盡量取得可得位數。
								library_namespace.error('precise_divide: The period of repeating decimal is too long (large than ' + limit + ')!');
								return;
							}
							shift_digits(remainder, -1, true);
							//fill up with highest digit
							remainder[0] = highest;
						}
					}
				}

				// 計算出 F, R:
				// assert: -f -r < 0, =0 的已在之前處理完畢。
				shift_digits(REMAINDER = new Integer(REMAINDER, radix), -f - r, true);
				REMAINDER = REMAINDER.division(DENOMINATOR);
				// assert: REMAINDER.length === f + r
				if (f) {
					if (r) {
						//作截斷處理。
						shift_digits(f = REMAINDER.clone(), r, true);
					} else
						f = REMAINDER;
					if (radix !== GET_OBJECT)
						f = f.toString(radix);
				}
				if (r) {
					if (f)
						//作截斷處理。
						if (Array.isArray(REMAINDER))
							REMAINDER.length = r;
						else
							while (r < REMAINDER.length)
								REMAINDER[r++] = 0;
					r = REMAINDER;
					if (radix !== GET_OBJECT)
						r = r.toString(radix);
				}
				return_Array.push(f || '', r || '');
				return return_Array;
			}


			// ---------------------------------------------------------------------//

			//最後會保留 digits 位數(in this.base)。
			//若 digits < 0，則會當作自尾端數起位數。
			//direct: directed rounding: undefined, 0, Infinity, -Infinity
			// https://en.wikipedia.org/wiki/Rounding
			//可視為 shift_digits() 之 frontend。
			function to_precision(digits, direct) {
				if ((digits = (digits < 0 ? 0 : this.length) - digits | 0)
					//長度相同: 毋須更動。
					&& digits !== this.length) {

					do_modified(this);

					var add_1;

					if (0 < digits) {
						var index = digits - 1, value, base = this[KEY_BASE];
						if (isNaN(direct)) {
							//nearest
							// http://mathworld.wolfram.com/NearestIntegerFunction.html
							if (base === (value = 2 * (this[index] || 0))) {
								for (--index; ;)
									if (--index < 0) {
										//四捨六入五成雙/best fraction
										//NOT 四捨五入
										add_1 = this[digits] % 2;
										break;
									} else if (0 < this[index]) {
										add_1 = true;
										break;
									}
							} else
								add_1 = base < value;

						} else if (!isFinite(direct)) {
							//floor, ceil
							//無條件捨去法/無條件進位法
							while (0 < --index)
								if (0 < this[index]) {
									add_1 = (0 < direct) ^ this[KEY_NEGATIVE];
									break;
								}
						}
						//else: treat as direct = 0, just truncate
					}

					shift_digits(this, digits);

					if (add_1 && base === ++this[0])
						//need to normalize
						normalize_digits(this);
				}

				return this;
			}

			//negative_exponent: 小數點後第 negative_exponent 位數(in this.base)，可為負數。
			//direct: directed rounding: undefined, 0, Infinity, -Infinity
			// https://en.wikipedia.org/wiki/Rounding
			function round(negative_exponent, direct) {
				if (0 < (negative_exponent = (negative_exponent | 0) + this[KEY_EXPONENT] + this.length))
					this.to_precision(negative_exponent, direct);
				return this;
			}


			// ---------------------------------------------------------------------//
			// advanced functions

			// WARNING 注意: this operation will modify both dividend and divisor!
			// return [ [ quotient Array ], remainder, Bézout coefficient for (dividend = this), Bézout coefficient for (divisor) ]
			// https://en.wikipedia.org/wiki/Extended_Euclidean_algorithm
			// https://en.wikipedia.org/wiki/Euclidean_algorithm
			// https://en.wikipedia.org/wiki/B%C3%A9zout%27s_identity
			function Euclidean_algorithm(divisor, get_coefficients) {
				var dividend = this, base = dividend[KEY_BASE],
				//
				quotient_Array = [], quotient, q, last_q,
				// coefficients
				// 前前group [dividend 應乘的倍數, divisor 應乘的倍數]
				c0 = [1, 0],
				// 前一group [dividend 應乘的倍數, divisor 應乘的倍數]
				c1 = [0, 1], c,
				// [dividend 採用 Integer, divisor 採用 Integer]
				is_i = [];

				function set_coefficient(i) {
					// 現 group = remainder = 前前group - quotient * 前一group
					if (!is_i[i]) {
						if (q && Number.isSafeInteger(c = c0[i] - c1[i] * last_q))
							return c;

						is_i[i] = true;
						c0[i] = new Integer(c0[i], base);
						c1[i] = new Integer(c1[i], base);
					}

					// TODO: 增進效率。
					return c0[i].add((new Integer(c1[i], base)).multiply(last_q), true);
				}

				do_modified(dividend);
				if (is_Integer(divisor))
					do_modified(divisor);
				else
					divisor = (new Integer(divisor, null, base)).abs();

				if ((KEY_TYPE in divisor) || divisor.compare(2) < 0)
					return [quotient_Array];

				for (; ;) {
					quotient = dividend.division(divisor);
					q = Number.isSafeInteger(last_q = quotient.valueOf(TYPE_TEST));
					if (!q)
						last_q = quotient;
					quotient_Array.push(last_q);
					if (dividend.is_0()) {
						q = [quotient_Array, Number.isSafeInteger(q = divisor.valueOf(TYPE_TEST)) ? q : divisor];
						if (get_coefficients)
							q.push(c1[0], c1[1]);
						return q;
					}

					if (get_coefficients)
						c = [set_coefficient(0), set_coefficient(1)],
						// shift
						c0 = c1, c1 = c;

					// swap (dividend, divisor)
					c = dividend;
					dividend = divisor;
					divisor = c;
				}
			}


			/*
			https://en.wikipedia.org/wiki/Square_(algebra)
			
			(please copy to a plain text)
			自乘時，乘法截圖: (下列數字皆為序號 index)
									5	4	3	2	1	0
								×	5	4	3	2	1	0
			-----------------------------------------------------------------------------------------------
									5×0	4×0	3×0	2×0	1×0	0×0
								5×1	4×1	3×1	2×1	1×1	1×0
							5×2	4×2	3×2	2×2	2×1	2×0
						5×3	4×3	3×3	3×2	3×1	3×0
					5×4	4×4	4×3	4×2	4×1	4×0
				5×5	5×4	5×3	5×2	5×1	5×0
			
			-----------------------------------------------------------------------------------------------
			注:加起來為序號 n 的組合:
				10	9	8	7	6	5	4	3	2	1	0
			
			** 除了自乘1倍外，皆為兩倍積。
			
			i:
				10	9	8	7	6	5	4	3	2	1	0
			i + 1 - this_length(6):
				5	4	3	2	1	0	1	-2	-3	-4	-5
			j start:
				5	4	3	2	1	0	0	0	0	0	0
			j end:
				5	4	4	3	3	2	2	1	1	0	0
			
			*/
			function square() {
				if ((KEY_TYPE in this) || this.is_0() || this.is_0(1))
					// 不處理虛數與複數。
					// do simulation: 模擬與 NaN 等極端數字作運算。
					return this;

				// 至此特殊值處理完畢。

				do_modified(this);
				delete this[KEY_NEGATIVE];
				this[KEY_EXPONENT] *= 2;

				var i = 0, j, this_length = this.length, length = 2 * this_length, product, value,
				//初始化。
				result = new Array(length--).fill(0);

				for (; i < length ; i++)
					for (j = Math.max(0, i + 1 - this_length) ; 2 * j <= i; j++)
						if (product = this[j] * this[i - j]) {
							if (2 * j < i)
								product *= 2;
							if (Number.isSafeInteger(value = result[i] + product))
								result[i] = value;
							else
								//手動進位。
								result[i + 1]++, result[i] -= Number.MAX_SAFE_INTEGER - product;
						}

				//將 {Array}result → this，順便作正規化。
				for_each_digit.call(result, normalize_handle, this);

				return this;
			}

			//9741
			//var square_root_base = Math.floor(Math.sqrt(Math.sqrt(MAX_SAFE_INTEGER)));
			//for debug
			//square_root_base = 1000;
			/*
			https://en.wikipedia.org/wiki/Square_root
			https://en.wikipedia.org/wiki/Methods_of_computing_square_roots
			
			
			slow method (don't use this):
			(please copy to a plain text)
			精準/準確直式開方 以  BASE = 100^2 = 10000 為例，sqrt(294565622121) = 542739：
			accumulate        54   27   39  remainder
			 54             2945 6562 2121
			+54             2916              ① q=Math.sqrt(2945)|0 = 54, 54×54 = 2916
			10827             29 6562         ② remainder=296562, accumulate=10800, q=remainder/accumulate|0 = 27, 自 q 起找尋 (accumulate+q)×q <= remainder 之最大數 q (if(remainder-accumulate*q<q*q)q--;)，即為 27。
			+  27             29 2329         ③ 10827×27 = 292329
			1085439              4233 2121    ④ remainder=42332121, accumulate=1085400, q=remainder/accumulate|0 = 39, 自 q 起找尋 (accumulate+q)×q <= remainder 之最大數 q (if(remainder-accumulate*q<q*q)q--;)，即為 39。
				 39              4233 2121    ⑤ 1085439×39 = 42332121
										 0    ⑥ remainder=0, done.
			*/
			//{Undefined|natural number}digit
			// WARNING 注意: this will get floor(sqrt(this))，結果僅會回傳整數！
			function square_root(negative_exponent) {
				if (this[KEY_NEGATIVE] || (KEY_TYPE in this) || this.is_0() || this.is_0(1))
					// 不處理虛數與複數。
					// do simulation: 模擬與 NaN 等極端數字作運算。
					return this.assignment(Math.sqrt(this.valueOf(TYPE_TEST)));

				// 至此特殊值處理完畢。

				if (0 < (negative_exponent |= 0) && Number.isSafeInteger(negative_exponent))
					shift_digits(this, -negative_exponent * 2 - this[KEY_EXPONENT]);

				// assert: this.at(-1) > 0
				var index = this.length, index_sr = --index / 2 | 0, base = this[KEY_BASE];
				if (!index_sr)
					// assert: this.length <= 2
					return this.assignment(Math.floor(Math.sqrt((this[1] || 0) * base + (this[0] || 0))));


				/*
				use Newton's method: x1 = (x0 + number / x0) / 2
				即使兩數僅差 1，亦不可直接回傳，有可能為 (準確值+1) & (準確值+2) 之類的。
			
				initial   sqrt  取值迭代變化: sr → _sr
				n^2 - 1   n-1   n+1 → n   → n-1 → n  ** NG: 反轉了。
				n^2       n     n+1 → n   → n   → n
				n^2       n     n-1 → n+  → n   → n
				n^2 + 1   n     n+2 → n   → n   → n
				n^2 + 1   n     n-1 → n+  → n   → n
			
				故:
				1. 取 initial value >= sqrt
				2. 當 _sr - sr = 0 or 1, 反轉時取較小的 sr 即為可回傳 sqrt。
			
				*/

				//決定 determines the initial value。
				//sr: square root value
				// TODO: 取更多位數。
				var sr, _sr = this[index--];
				if (index % 2 === 0)
					//e.g., √1024 = 32
					//取2位數
					_sr = _sr * base + this[index];
				else
					//e.g., √10000 = 100
					//取3位數
					_sr += (this[index] + this[index - 1] / base) / base;
				_sr = Math.sqrt(_sr);

				sr = new Integer(0, base);
				sr[KEY_EXPONENT] = -negative_exponent;

				//初始化 the initial value。
				sr[index_sr] = _sr | 0;
				//+1: 保證 initial value >= sqrt(this)
				sr[--index_sr] = ((_sr % 1) * base | 0) + 1;
				//sr[0] 已被設定過。
				while (0 < index_sr)
					sr[--index_sr] = 0;

				for (base--; ; sr = _sr) {
					//use Newton's method: x1 = (number / x0 + x0) / 2
					//_sr: next sr
					_sr = this.clone().division(sr).add(sr).division(2);

					/*
					check if 反轉: _sr - sr = 1
					possible condition:
					part:       1            2      3
					_sr = (the same digits)  n    (00000)
					 sr = (the same digits) (n-1) (99999)
			
					part 1, 3 may not exist, the part 2 is the keypoint.
			
					e.g.,
					 sr =  9999   19999   32999  42342
					_sr = 10000   20000   33000  42343
					*/

					for (index_sr = 0; index_sr < _sr.length;)
						if (_sr[index_sr] === 0 && sr[index_sr] === base)
							//skip part 3.
							index_sr++;
						else {
							// check part 2.
							index = _sr[index_sr] - (sr[index_sr] || 0);
							if (index_sr === 0 && index === 0 || index === 1)
								//skip part 1.
								for (; ;)
									if (++index_sr === _sr.length)
										// assert: _sr - sr = 0 or 1
										return this.assignment(sr);
									else if (sr[index_sr] !== _sr[index_sr])
										break;
							break;
						}
				}
			}

			// https://en.wikipedia.org/wiki/Nth_root
			// https://en.wikipedia.org/wiki/Nth_root_algorithm
			//nth root (surds): degree √radicand =	root
			function root(degree, negative_exponent) {
				if (!Number.isSafeInteger(degree) || degree < 3) {
					if (degree === 0)
						return this.assignment(1);
					if (degree === 2)
						//square_root() is faster
						return this.square_root(negative_exponent);
					if (degree !== 1)
						library_namespace.error('root: Invalid degree: [' + degree + '].');
					return this;
				}

				if (this[KEY_NEGATIVE])
					// 不處理虛數與複數。
					return this.assignment(NaN);
				if (KEY_TYPE in this)
					return this[KEY_TYPE];

				// 至此特殊值處理完畢。
				do_modified(this);

				if (0 < (negative_exponent |= 0) && Number.isSafeInteger(negative_exponent))
					shift_digits(this, -negative_exponent * 2 - this[KEY_EXPONENT]);

				// assert: this.at(-1) > 0
				var index = this.length, index_sr = --index / 2 | 0, base = this[KEY_BASE];
				if (!index_sr)
					// assert: this.length <= 2
					return this.assignment(Math.floor(Math.sqrt((this[1] || 0) * base + (this[0] || 0))));

				TODO;

				var r, delta;

				//+1: 保證 initial value >= root(this)

				for (; ;) {
					//use Newton's method
					delta = this.clone().division(r.clone().power(degree - 1)).add(r, true).division(2);
					if (delta.compare(0) >= 0)
						return this.assignment(r);
					r.add(delta.derive(degree));
				}
			}


			// ---------------------------------------------------------------------//

			// return {Number} = antecedent(=this) : consequent = N / D
			function ratio_to(consequent) {
				if (!consequent)
					// do simulation: 模擬與 NaN 等極端數字作運算。
					return (this[KEY_NEGATIVE] ? -1 : 1) / 0;
				if (typeof consequent === 'number')
					return this.valueOf() / consequent;

				// 至此特殊值處理完畢。
				//以下操作目的:當 this, consequent 個別過大或過小，但比例可表示時，嘗試表現之。

				var base = this[KEY_BASE], n = this.valueOf(TYPE_info_for_large), exponent_base = 0, next_n;
				if (Array.isArray(n))
					exponent_base = n[1], n = n[0];

				if (Array.isArray(consequent = (new Integer(consequent, null, base)).valueOf(TYPE_info_for_large)))
					exponent_base -= consequent[1], consequent = consequent[0];

				exponent_base = Math.pow(base, exponent_base);
				next_n = n / consequent;
				if (next_n === 0 || !isFinite(next_n))
					n = n * exponent_base / consequent;
				else
					n = next_n * exponent_base;

				return n;
			}


			//max_digits[base]={integer}, min_digits[base]={integer}
			var max_digits = Object.create(null), min_digits = Object.create(null),
			//
			LOG_MAX = Math.log(Number.MAX_VALUE), LOG_MIN = Math.log(Number.EPSILON);
			function max_digits_of(base) {
				if (!(base in max_digits))
					max_digits[base] = (LOG_MAX / Math.log(base) | 0) + 1;
				return max_digits[base];
			}
			function min_digits_of(base) {
				if (!(base in min_digits))
					min_digits[base] = LOG_MIN / Math.log(base) | 0;
				return min_digits[base];
			}


			// 當數字過大，轉回傳 {String}
			var TYPE_String_for_large = 1,
			// return [value, exponent]: this = value * base ^ exponent，value 已為可計算之極端值（最大或最小）
			TYPE_info_for_large = 2,
			// 與 NaN 等極端數字作運算用。僅回傳 NaN, ±Infinity, ±1, 0, ±是否在  Number.isSafeInteger() 內。
			TYPE_TEST = 3;
			// WARNING 注意: 若回傳非 Number.isSafeInteger()，則會有誤差，不能等於最佳近似值。
			function valueOf(type) {
				var value;
				//由消費最少，且必須先檢測的開始檢測。
				if (KEY_TYPE in this) {
					value = this[KEY_TYPE];
					return this[KEY_NEGATIVE] ? -value : value;
				}

				var v, base = this[KEY_BASE], exponent = this[KEY_EXPONENT],
				//實際應為首個 nonzero 之位置。
				index = this.length, e0, next_value, base_now = ZERO_EXPONENT;

				//先檢測是否為 {Number} 可表示之範圍。
				if (!type && (value = index + exponent) <= min_digits_of(base))
					value = 0;
				else if (!type && max_digits_of(base) < value)
					value = Infinity;


				else if (type === TYPE_TEST && this.length < 2) {
					if ((value = this[0] || 0) && exponent)
						value *= Math.pow(base, exponent);

				} else {
					// 這邊將處理3種情況:
					// F: first digit 首位.
					// e0: digit of base^0.
					// L: last digit that can presented.
					// F---L---e0 : 直接在過程 phase 1 即解決掉。
					// F---L=e0   : 直接在過程 phase 1 即解決掉。
					// F---e0--L  : phase 1 + 2。
					// F=e0----L  : phase 1 + 2。
					// e0--F---L  : 在過程 phase 2 解決掉。
					//分為整數與小數兩階段處理，是為了盡可能保持精度。

					//至此，除非是 TYPE_info_for_large，否則就算最後值應為 Infinity 或是 0，也應該會作到最後一個 loop 才發現。

					// phase 1: 整數
					for (value = 0, e0 = Math.max(0, -exponent) ; e0 < index; value = next_value)
						if ((next_value = (v = value * base) + (this[--index] || 0)) === Infinity
							//已經無法造成影響。
							|| this[index] && next_value === v) {
							//+1: 因為這邊取用 value，而非 next_value。
							index += exponent + 1;
							if (this[index])
								//彌補差值。
								value += this[index] / base;
							if (type === TYPE_info_for_large)
								return [this[KEY_NEGATIVE] ? -value : value, index];
							else if (type === TYPE_String_for_large) {
								//轉成 log_10(this)
								value = Math.log10(value) + Math.log10(base) * index;
								value = Math.pow(10, value % 1) + 'e+' + (value | 0);
							} else if (type !== TYPE_TEST) {
								// normal: 強迫回傳 {Number}
								value = next_value;
								index--;
								if (value !== Infinity && index)
									value *= Math.pow(base, index);
							}
							//TYPE_TEST: 與 NaN 等極端數字相較，再大的 Integer 都只是小兒科。因為不在乎精度，無須再處理。
							//但須注意 assignment() 之使用。

							//不需再處理小數了。
							index = 0;
							break;
						}

					// phase 2: 小數
					if (0 < index) {
						// 在 [length=12].exponent=-10 之類的情況下保持精度。
						for (; 0 < index;) {
							base_now /= base;
							if (this[--index]) {
								next_value = value + this[index] * base_now;
								if (next_value === value)
									//已經無法造成影響。
									break;
								if (0 === base_now / base) {
									value += this[index] / base * base_now;
									break;
								}
								value = next_value;
							}
						}
						//基本上，上面算法假設 index 在 E0 之前。因此需要對 index 在 E0 之後，即首位已在 E0 之後的情況作修正。
						if (this.length + exponent < 0) {
							if (type === TYPE_info_for_large)
								return [this[KEY_NEGATIVE] ? -value : value, this.length + exponent];
							next_value = value * Math.pow(base, index + exponent);
							if (next_value === 0) {
								//轉成 log_10(this)
								value = Math.log10(value) + Math.log10(base) * (this.length + exponent);
								value = value + 'e+' + (value | 0);
							} else
								value = next_value;
						}
					}
				}
				// minus sign
				return this[KEY_NEGATIVE] ? typeof value === 'number' ? -value : '-' + value : value;
			}

			function toString(radix) {
				var base;
				if (radix && isNaN(radix))
					radix = (base = Array.isArray(radix) ? radix : String(radix).split('')).length;
				else if (!valid_radix(radix))
					radix = DEFAULT_RADIX;
				if (!base && this[KEY_CACHE] && this[KEY_CACHE][radix])
					return this[KEY_CACHE][radix];

				var digits, value, zero;
				if (KEY_TYPE in this)
					digits = [this[KEY_TYPE]];
				else {
					if (!base)
						base = DEFAULT_DIGITS;
					if (typeof base === 'string')
						// IE8 不能用 string[index]。'ab'[1] === undefined, 'ab'[1] !== 'b'。
						// base.chars()
						base = base.split('');
					// assert: Array.isArray(base)
					zero = base[0];
					digits = [];
					value = new Integer(this, radix, true);
					value.forEach(function (digit) {
						digits.push(base[digit]);
					});
					if (value = value[KEY_EXPONENT])
						if (0 < value)
							digits.unshift(zero.repeat(value));
						else {
							if (digits.length < (value = -value))
								// 補足長度。
								if (digits.fill) {
									// Array.prototype.fill() 只會作用於 0~原先的 length 範圍內！
									var i = digits.length;
									digits.length = value;
									digits.fill(zero, i);
								} else
									for (var i = digits.length; i < value;)
										digits[i++] = zero;
							// add 小數點
							digits.splice(value, 0, radix_point);
							while (digits[0] == zero)
								// 去除末端的 '0'。
								digits.shift();
							if (digits[0] === radix_point)
								digits.shift();
						}
				}

				// 去除前導的 '0'。
				if (value = digits.length)
					while (0 < --value && digits[value] === zero)
						digits.pop();
				else
					digits = [zero];

				if (digits.at(-1) === radix_point)
					digits.push(zero);
				if (this[KEY_NEGATIVE])
					// minus sign
					digits.push('-');

				digits.reverse();

				if (!Array.isArray(this[KEY_CACHE]))
					this[KEY_CACHE] = [];
				return this[KEY_CACHE][radix] = digits.join('');
			}

			// assert: {ℕ⁰:Natural+0}this
			// TODO: 處理小數/負數
			function digits(radix) {
				if (!valid_radix(radix))
					radix = DEFAULT_RADIX;
				var count = count_exponent(this[KEY_BASE], radix);
				if (!(count > 0))
					return this.toString(radix).split('').map(function(digit) {
						return parseInt(digit, radix);
					});

				var digits = [];
				this.forEach(function(value) {
					for (var index = 0; index < count; index++) {
						digits.unshift(value % radix);
						value = value / radix | 0;
					}
				});
				while (!digits[0])
					digits.shift();
				return digits;
			}

			function digit_sum(radix) {
				return this.digits(radix).sum();
			}

			// ---------------------------------------------------------------------//
			//初等數論函數/數學常數
			// https://zh.wikipedia.org/wiki/%E6%95%B0%E5%AD%A6%E5%B8%B8%E6%95%B0

			// return this ^ {Integer}exponent % {Integer}modulus
			function power_modulo(exponent, modulus) {
				if ((KEY_TYPE in this) || this[KEY_EXPONENT] < 0
					//得允許 {Integer}exponent。
					//|| !Number.isSafeInteger(exponent) || exponent < 0
					)
					return;

				exponent = new Integer(exponent, null, 2, true);
				exponent[KEY_EXPONENT] && exponent.expand_exponent();
				if ((KEY_TYPE in exponent) || exponent[KEY_EXPONENT] || exponent[KEY_NEGATIVE])
					return;

				modulus = new Integer(modulus, null, this[KEY_BASE]);

				var remainder = new Integer(ZERO_EXPONENT, this[KEY_BASE]), power = this.clone().abs();

				for (power.division(modulus) ; ;) {
					if (exponent[0] === 1)
						remainder.multiply(power).division(modulus);
					if (exponent.length === 1)
						return remainder;
					power.square().division(modulus);
					if (power.is_0(1))
						return remainder;
					shift_digits(exponent, 1, true);
				}
			}

			//	Miller–Rabin primality test
			//	return true: is composite, undefined: probable prime (PRP) / invalid number
			// https://en.wikipedia.org/wiki/Miller%E2%80%93Rabin_primality_test
			function Miller_Rabin(times) {
				if ((KEY_TYPE in this) || this[KEY_EXPONENT] < 0
					//得允許 {Integer}exponent。
					//|| !Number.isSafeInteger(exponent) || exponent < 0
					)
					return;

				// assert: (this) is integer, (this) % 2 = 1, (this) > 4
				var n_1 = (new Integer(this, DECIMAL_BASE)).add(-1), d = n_1.clone(), s = 0, a, x;
				while (d[0] % 2 === 0)
					s++, d = d.division(2);
				// assert: s > 0

				if (!(times |= 0))
					times = 2;

				for (var prime_index = 0; prime_index < times;) {
					// 3rd 起應該用大數( > 307) 偵測。
					a = new Integer(get_prime(++prime_index + (prime_index < 3 ? 0 : 60)));
					x = a.power_modulo(d, this);
					if (x.is_0(1) || x.compare_amount(n_1) === 0)
						continue;

					var i = 1, j = 1;
					for (; i < s; i++) {
						x.square().division(this);
						if (x.is_0(1))
							return true;
						if (x.compare_amount(n_1) === 0) {
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

			var get_prime = library_namespace.data.math.prime,
				math_not_prime = library_namespace.data.math.not_prime,
				math_factorize = library_namespace.data.math.factorize,
			// copy from data.math
			sqrt_max_integer = Math.sqrt(Number.MAX_SAFE_INTEGER) | 0;
			// return false: number: min factor, is prime, true: not prime, undefined: maybe prime (unknown)
			// ** modified from data.math.not_prime()
			function not_prime(limit) {
				var integer = this.valueOf();
				if (Number.isSafeInteger(integer) && !(sqrt_max_integer < integer))
					return math_not_prime(integer);

				if ((KEY_TYPE in this) || this[KEY_EXPONENT] < 0)
					return;

				// 可先檢測此數是否在質數列表中。

				if (!limit)
					//迫於未能使用好的演算法，只好限制使用時間。
					limit = 1e5;

				// 採用試除法, trial division 檢測小質數整除性。
				var prime, index = 1;
				while (prime = get_prime(index++, limit))
					if (this.clone().modulo(prime).is_0())
						return this.compare_amount(prime) !== 0 && prime;

				library_namespace.debug('not_prime: 由於所測試的質數 '
					+ prime + ' 已大於 limit ' + limit
					+ '，因此不再試除 [' + this.toString() + ']。', 3);

				return this.Miller_Rabin();

				// TODO: https://en.wikipedia.org/wiki/Baillie%E2%80%93PSW_primality_test
				// TODO: https://en.wikipedia.org/wiki/Lucas_pseudoprime
			}


			// Pollard's rho algorithm is a general-purpose integer factorization algorithm.
			// https://en.wikipedia.org/wiki/Pollard's_rho_algorithm

			// The first rho method used random walks to find factors
			// https://sites.google.com/site/jmptidcott2/nthy
			function Pollards_rho_1975() {
				for (var x = new Integer(2), y = x.clone(), d; ;) {
					// f(x) = (x^2 + 1) % N
					x.square().add(1).division(this);
					y.square().add(1).division(this);
					y.square().add(1).division(this);
					//when n is a prime number, d will be always 1.
					d = Integer_GCD(y.clone().add(x, true).abs(), this.clone());
					if (d !== 1)
						return this.compare_amount(d) !== 0 && d;
				}
			}

			// http://maths-people.anu.edu.au/~brent/pub/pub051.html
			// https://github.com/search?q=Pollard+rho+Brent+factor&type=Code
			// http://comeoncodeon.wordpress.com/2010/09/18/pollard-rho-brent-integer-factorization/
			// WARNING: 雖然此演算法或可得到因子，但對於過大因子，將耗費大量時間！例如為十位數以上之質數時，恐得使用五分鐘以分解！
			// WARNING: Note that this algorithm may not find the factors and will return failure for composite n. In that case, use a different f(x) and try again.
			function Pollards_rho_1980() {
				if ((KEY_TYPE in this) || this[KEY_EXPONENT] < 0)
					// Invalid integer to factorize
					return;
				if (this.clone().modulo(2) === 0 || this.clone().modulo(3) === 0)
					return false;

				// reset initial value
				// assert: this > max(y, m, c)
				var y = new Integer(get_prime(2 + Math.random() * 1e3 | 0)),
					m = get_prime(2 + Math.random() * 1e3 | 0),
					c = get_prime(2 + Math.random() * 1e3 | 0),
					r = 1, q = new Integer(1), x, i, k, ys, G;
				do {
					for (x = y.clone(), i = r; i--;)
						// f(x) = (x^2 + c) % N
						y.square().add(c).division(this);
					k = 0;
					do {
						for (ys = y, i = Math.min(m, r - k) ; i-- ;) {
							// f(x) = (x^2 + c) % N
							y.square().add(c).division(this);
							q.multiply(x.clone().add(y, true).abs()).division(this);
						}
						G = Integer_GCD(q.clone(), this.clone());
						k += m;
					} while (k < r && G === 1);
					r *= 2;
					// TODO: 當 r 過大，例如為十位數以上之質數時，過於消耗時間。
				} while (G === 1);

				if (this.compare_amount(G) === 0)
					do {
						// f(x) = (x^2 + c) % N
						ys.square().add(c).division(this);
						G = Integer_GCD(x.clone().add(ys, true).abs(), this.clone());
					} while (G === 1);

				return this.compare_amount(G) !== 0 && G;
			}


			// TODO: the elliptic curve method (ECM)

			/**
			 * 取得某數的質因數分解，整數分解/因式分解/素因子分解, prime factorization, get floor factor.<br />
			 * 唯一分解定理(The Unique Factorization Theorem)告訴我們素因子分解是唯一的，這即是稱為算術基本定理 (The
			 * Fundamental Theorem of Arithmeric) 的數學金科玉律。
			 * 
			 * ** modified from data.math.factorize()
			 * 
			 * @param {Number}radix
			 *            output radix
			 * @param {Number}limit
			 *            maximum prime to test
			 * 
			 * @return {Object}factor {prime1:power1, prime2:power2, ..}
			 * 
			 * @see <a href="http://homepage2.nifty.com/m_kamada/math/10001.htm"
			 *      accessdate="2010/3/11 18:7">Factorizations of 100...001</a>
			 *      https://en.wikipedia.org/wiki/Integer_factorization
			 */
			function factorize(radix, limit) {
				var integer = this.valueOf();
				if (Number.isSafeInteger(integer))
					return math_factorize(integer, radix);

				if ((KEY_TYPE in this) || this[KEY_EXPONENT] < 0) {
					library_namespace.error('factorize: Invalid integer: [' + this.toString() + '].');
					return;
				}

				if (!limit)
					//迫於未能使用好的演算法，只好限制使用時間。
					limit = 1e6;

				if (!valid_radix(radix))
					// IE8 中，無法使用 Number.toString(undefined)。
					//radix = undefined;
					radix = DEFAULT_RADIX
				integer = this.clone();
				delete integer[KEY_NEGATIVE];

				var prime, index = 1, factors = Object.create(null), power,
				get_sqrt = function () {
					sqrt = Math.floor(integer.clone().square_root().valueOf());
				}, sqrt = get_sqrt();
				Object.defineProperty(factors, 'toString', {
					enumerable: false,
					value: math_factorize._toString
				});

				for (; ;) {
					// 採用試除法, trial division。
					if (integer.clone().modulo(prime = get_prime(index++)).is_0()) {
						for (power = 1; (integer = integer.division(prime)).clone().modulo(prime).is_0() ;)
							power++;
						factors[prime.toString(radix)] = power;
						if (integer.is_0(ZERO_EXPONENT))
							return factors;
						if (Number.isSafeInteger(sqrt = integer.valueOf())) {
							//use data.math.factorize();
							sqrt = math_factorize(sqrt, radix, index);
							for (prime in sqrt)
								factors[prime] = sqrt[prime];
							return factors;
						}
						get_sqrt();
					}

					if (sqrt < prime) {
						// assert: integer is now prime.
						factors[integer.toString(radix)] = 1;
						return factors;
					}

					if (limit < prime) {
						if (false) {
							if (integer.Miller_Rabin())
								library_namespace.warn('factorize: 由於所測試的質數 ' + prime + ' 已大於 limit ' + limit
									+ '，因此不再試除餘下之合數因子 [' + integer.toString() + ']；您有必要自行質因數分解此數！');
							factors[integer.toString(radix)] = 1;
						}

						prime = [];
						power = function (i) {
							if (i.not_prime()) {
								var p, count = 3;
								while (count-- && !(p = i.Pollards_rho()));
								if (p) {
									power(p = Integer(p));
									power(i.clone().division(p));
									return;
								} else
									library_namespace.warn('factorize: 無法分解'
										+ (library_namespace.is_debug() && i.Miller_Rabin() ? '合數' : '') + '因子 [' + i.toString() + ']；您或許有必要自行質因數分解此數！');
							}
							prime.push(i);
						};
						power(integer);

						prime.sort(Integer_compare);
						prime.forEach(function (p) {
							p = p.toString(radix);
							if (p in factors)
								factors[p]++;
							else
								factors[p] = 1;
						});

						return factors;
					}
				}
			}


			var summation_cache = {
				// cache of mathematical constant ℯ
				E: new Integer(Math.E.toString(), DEFAULT_RADIX, DEFAULT_RADIX),
				// cache of mathematical constant ln 2
				LN2: new Integer(Math.LN2.toString(), DEFAULT_RADIX, DEFAULT_RADIX),
				// cache of mathematical constant ln 10
				LN10: new Integer(Math.LN10.toString(), DEFAULT_RADIX, DEFAULT_RADIX),
				// cache of mathematical constant π
				PI: new Integer(Math.PI.toString(), DEFAULT_RADIX, DEFAULT_RADIX)
			};
			//@inner
			// https://en.wikipedia.org/wiki/Summation#Capital-sigma_notation
			function summation(name, operation, precision, initial_value, error_digits) {
				if (Number.isSafeInteger(precision |= 0) && (!name || summation_cache[name].length < precision)) {
					var sum = new Integer(isNaN(initial_value) ? 1 : initial_value);
					if (!error_digits)
						error_digits = 1;
					//欲取的位數。
					shift_digits(sum, -Math.ceil(precision / DECIMAL_BASE_LENGTH) - error_digits);

					// operation(sum): main loop of summation
					sum = new Integer((operation(sum) || sum).to_precision(-error_digits), DEFAULT_RADIX);

					if (name)
						summation_cache[name] = sum;
					name = sum;

				} else
					name = summation_cache[name];

				return name.clone().to_precision(precision);
			}

			//自然對數函數的底數
			// https://en.wikipedia.org/wiki/E_(mathematical_constant)
			// calculate mathematical constant ℯ ≈
			// TODO: 誤差範圍評估/估計
			// https://en.wikipedia.org/wiki/Errors_and_residuals_in_statistics
			function Integer_E(precision) {
				return summation('E', function (E) {
					for (var index = 0, addend = E.clone() ;
						!(addend = addend.division(++index)).is_0() ;)
						E.add(addend);
				}, precision);
			}


			//return ℯ^exponent
			//Integer_exp({Number}real number exponent, precision)
			// https://en.wikipedia.org/wiki/Exponential_function
			function Integer_exp(exponent, precision) {
				var l, error_digits = 2,
				//
				integer_part = is_Integer(exponent) && exponent[KEY_BASE] === DEFAULT_BASE;
				if (!integer_part)
					exponent = new Integer(exponent, null, DEFAULT_BASE);

				if ((KEY_TYPE in exponent) || exponent.is_0())
					// 不處理虛數與複數。
					// do simulation: 模擬與 NaN 等極端數字作運算。
					return Math.exp(exponent.valueOf(TYPE_TEST));

				if (exponent[KEY_NEGATIVE]) {
					// negative exponent.
					delete exponent[KEY_NEGATIVE];
					shift_digits(l = new Integer(1), -precision - error_digits);
					return l.division(Integer_exp(exponent, precision + error_digits)).to_precision(precision);
				}

				if (exponent.is_0(1))
					return Integer_E(precision);


				// 至此特殊值處理完畢。

				if (exponent[KEY_EXPONENT] < 0)
					if (0 < exponent.length + exponent[KEY_EXPONENT] && 9 < (l = exponent.valueOf())) {
						//分成兩部分處理以加快速度: exp(40.3) = exp(40) * exp(.3)。
						if (integer_part)
							exponent = exponent.clone();
						return Integer_exp(integer_part = l | 0, precision + error_digits)
							//fractional part 分數/小數部分
							.multiply(Integer_exp(exponent.add(-integer_part), precision + error_digits))
							.to_precision(precision);

					} else if (0 < (l = exponent.length - Math.ceil(precision / DECIMAL_BASE_LENGTH) - error_digits)) {
						//過精細的 exponent 無用。
						if (integer_part)
							exponent = exponent.clone();
						shift_digits(exponent, l);
					}

				return summation(null, function (exp) {
					//1 - exp[KEY_EXPONENT] for precision
					for (var index = 0, addend = exp.clone(), digits = error_digits - exp[KEY_EXPONENT];
						//截斷 addend 以加速運算。
						digits < addend.length && shift_digits(addend, addend.length - digits),
						!(addend = addend.multiply(exponent).division(++index)).is_0()
						//當數值過小，即使非 0 亦無意義。
						&& exp[KEY_EXPONENT] < addend.length + addend[KEY_EXPONENT];)
						digits < exp.add(addend).length && shift_digits(exp, exp.length - digits);
				}, precision, undefined, error_digits);
			}


			// https://en.wikipedia.org/wiki/Natural_logarithm_of_2#Series_representations
			// https://en.wikipedia.org/wiki/Logarithm#Power_series
			function Integer_LN2(precision) {
				return summation('LN2', function (LN2) {
					// TODO: no clone
					var index = 1, d = LN2.clone(), addend;
					while (!(addend = (d = d.division(9)).clone().division(index += 2)).is_0())
						LN2.add(addend);
					return LN2.division(3);
				}, precision, 2, 1);
			}

			// https://en.wikipedia.org/wiki/Logarithm#Power_series
			function Integer_LN10(precision) {
				return summation('LN10', function (LN10) {
					for (var index = 1, d = LN10.clone(), addend;
						!(addend = (d = d.division(81)).clone().division(index += 2)).is_0() ;)
						LN10.add(addend);
					return LN10.division(9).add(Integer_LN2(precision + 1).multiply(3));
				}, precision, 2);
			}

			//@inner
			// https://en.wikipedia.org/wiki/Natural_logarithm
			// https://en.wikipedia.org/wiki/Logarithm#Power_series
			// ln({Integer}power, precision)
			function ln(power, precision) {
				var error_digits = 1, exponent = Math.ceil((precision |= 0) / DECIMAL_BASE_LENGTH) + error_digits,
				//
				ln_value = new Integer(2), index, addend, b, d, to_add;

				power = new Integer(power, null, DECIMAL_BASE);

				//正規化:去除末尾的0。
				for (index = 0; index < power.length; index++)
					if (power[index]) {
						if (index)
							shift_digits(power, index);
						break;
					}

				for (d = 0, index = power[0], addend = 10; index % addend === 0;)
					d++, to_add = addend, addend *= 10;
				if (d)
					power = power.division(to_add);
				//至此處理完 10 ^ d 的部分。

				for (b = 0, index = power[0], addend = 2; index % addend === 0;)
					b++, to_add = addend, addend *= 2;
				if (b)
					power = power.division(to_add);
				//let 1 <= power < 2 以加速 main loop 運算。
				//先使 power 首位 [power.length - 1] < 2。
				while (power.at(-1) > 1) {
					if (power[0] % 2 === 1)
						//預防失去精度。
						shift_digits(power, -1);
					b++, power = power.division(2);
				}
				// assert: 1 <= power.at(-1)

				//至此處理完 2 ^ b 的部分。

				//再使 power 首位 power.at(-1) 之 exponent 為 0。
				if (to_add = (index = power.length - 1) + power[KEY_EXPONENT]) {
					d += to_add * DECIMAL_BASE_LENGTH;
					power[KEY_EXPONENT] = -index;
				}
				// assert: 1 <= power < 2,  power.at(-1) === ZERO_EXPONENT === 1

				if (d)
					d = Integer_LN10(precision + error_digits * DECIMAL_BASE_LENGTH).multiply(d);
				if (b) {
					to_add = Integer_LN2(precision + error_digits * DECIMAL_BASE_LENGTH).multiply(b);
					if (d)
						to_add.add(d);
				} else
					to_add = d || 0;

				if (!index)
					return to_add ? to_add.to_precision(-error_digits * DECIMAL_BASE_LENGTH) : new Integer(0, DEFAULT_RADIX);

				// assert: 1 < power < 2,  power.at(-1) === ZERO_EXPONENT === 1


				d = power.clone();
				d[index = d.length - 1] = 2;
				b = power.clone();
				if (Array.isArray(b))
					b.pop();
				else
					b[index] = 0;
				// assert: now: d = power + 1, b = power - 1

				//d = ( (power + 1) / (power - 1) ) ^ 2
				d = d.division(b, exponent).square().to_precision(exponent);

				//簡化d，去掉末尾的 0。
				index = 0;
				while (index < d.length && !d[index])
					index++;
				if (index)
					shift_digits(d, index);

				//初始化 ln_value, b, ..
				shift_digits(ln_value, -exponent);
				b = ln_value.clone();
				index = 1;

				// main loop of summation
				while (!(addend = (b = b.division(d, exponent)).clone().division(index += 2)).is_0())
					ln_value.add(addend);

				d = power.clone();
				d[index = d.length - 1] = 2;
				// assert: now: d = power + 1

				if (Array.isArray(power))
					power.pop();
				else
					power[index] = 0;

				ln_value = new Integer(ln_value.multiply(power).division(d), DEFAULT_RADIX);

				if (to_add)
					ln_value.add(to_add);

				return ln_value.to_precision(precision);
			}

			//Logarithm: log _ base(power) = exponent
			// https://en.wikipedia.org/wiki/Logarithm
			//default base: e
			//this.log({Number}real number base, precision)
			//return {Number|Integer}
			function log(base, precision) {
				if (this[KEY_NEGATIVE] || (KEY_TYPE in this) || this.is_0() || this.is_0(1) || base && !isFinite(+base))
					// 不處理虛數與複數。
					// do simulation: 模擬與 NaN 等極端數字作運算。
					return Math.log(this.valueOf(TYPE_TEST)) / (base ? Math.log(+base) : 1);

				// 至此特殊值處理完畢。

				var base_exponent = 0, value = this, remainder, quotient;
				if (base) {
					base = new Integer(quotient = base, null, this[KEY_BASE]);
					if (base[KEY_TYPE] || !(base.compare(ZERO_EXPONENT) > 0)) {
						library_namespace.error('log: Invalid base: [' + quotient + '].');
						return NaN;
					}

					// 盡量取得整數次方。
					for (; ; base_exponent++, value = quotient) {
						remainder = value.clone();
						quotient = remainder.division(base);
						if (!remainder.is_0())
							break;
					}

					// assert: is_Integer(base)
					// assert: this = value * base ^ {0|natural number}base_exponent in base
					// assert: value === value % base > 0
				}

				if (precision |= 0) {
					//+ 1: error digits
					value = ln(value, precision + (base ? 1 : 0));
					if (base) {
						if (!value.is_0())
							value = value.division(ln(base, precision + 1));
						if (base_exponent)
							value.add(base_exponent);
					}
					return value.to_precision(precision);
				}


				//將 value 轉成可表現之最大精度 {Number}。
				value = value.valueOf(TYPE_info_for_large);

				value = typeof value === 'number' ? Math.log(Math.abs(value))
					// assert: value = [{Number}large value, {0|natural number}exponent in this[KEY_BASE]]
					: value[1] * Math.log(this[KEY_BASE]) + Math.log(Math.abs(value[0]));

				if (base) {
					if (value)
						value /= base.log();
					value += base_exponent;
				}

				return value;
			}


			// Exponentiation 冪/乘方: base ^ exponent = power
			// https://en.wikipedia.org/wiki/Exponentiation
			// https://en.wikipedia.org/wiki/Exponentiation_by_squaring
			// {natural number}exponent
			// {natural number}modulus = base^this.exponent
			// this.power({Number}real number exponent, precision)
			function power(exponent, precision) {
				exponent = Integer(exponent);
				if (exponent.is_0(1))
					return this;

				if (this[KEY_NEGATIVE] || (KEY_TYPE in this) || this.is_0() || this.is_0(1) || (KEY_TYPE in exponent) || exponent.is_0())
					// 不處理虛數與複數。
					// do simulation: 模擬與 NaN 等極端數字作運算。
					return this.assignment(Math.pow(this.valueOf(TYPE_TEST), exponent.valueOf(TYPE_TEST)));

				if (exponent[KEY_NEGATIVE]) {
					//負數
					delete exponent[KEY_NEGATIVE];
					exponent = this.clone().power(exponent);
					return this.assignment((new Integer(1)).division(exponent, precision));
				}

				var integer_part = exponent.valueOf() | 0, error_digits = 2, _precision = (precision || 2 * DECIMAL_BASE_LENGTH) + error_digits;
				if (!Number.isSafeInteger(integer_part)) {
					library_namespace.error('power: Invalid exponent: [' + exponent + '] (exponent too large, overflowed / underflowed).');
					return this.assignment(this.compare(1) < 0 ? 0 : Infinity);
				}

				// 至此特殊值處理完畢。


				exponent = exponent[KEY_EXPONENT] === 0 ? 0
				// has a fractional part (有小數部分)
				// v ^ e = exp ^ (e ln v)
				: Integer_exp(exponent.add(-integer_part).multiply(ln(this, _precision)), _precision);

				if (integer_part) {
					//處理 integer part 整數部分。
					_precision = precision && 2 * (precision + error_digits);
					for (var product = this ; ;) {
						if (integer_part % 2 === 1)
							if (product !== this) {
								// array multiply: this *= product
								this.multiply(product);
								if (_precision && this.length > _precision)
									this.to_precision(_precision);
							} else if (1 < integer_part)
								product = this.clone();

						if ((integer_part >>= 1) === 0)
							break;

						product.square();
					}

					if (exponent)
						this.multiply(exponent);

				} else
					// assert: exponent != 0
					this.assignment(exponent);


				if (precision)
					(new Integer(this, DEFAULT_RADIX)).to_precision(precision).clone(this);

				return this;
			}


			// https://en.wikipedia.org/wiki/Pi
			// https://en.wikipedia.org/wiki/List_of_formulae_involving_%CF%80#Efficient_infinite_series
			// calculate mathematical constant π ≈
			function Integer_PI(precision) {
				return summation('PI', function (PI) {
					for (var index = 0, addend = PI.clone() ;
						!(addend = addend.multiply(++index).division(2 * index + 1)).is_0() ;)
						PI.add(addend);
				}, precision, 2, 2);
			}

			// ---------------------------------------------------------------------//

			return Integer;
		}

	});
