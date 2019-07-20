
/**
 * @name	CeL rational number function
 * @fileoverview
 * 本檔案包含了分數/有理數 (rational number)/比例值 (ratio) 的 functions，相當/類似於 BigRational, BigQuotient (numerator and denominator), BigDecimal。<br />
 * 在純 javascript 的環境下，藉由原生計算功能，盡可能提供高效的大數計算。<br />
 *
 * @example
 * <code>
 * CeL.run('data.math.rational');
 * </code>
 *
 * @since	2013/9/8 13:42:58
 * @see
 * https://en.wikipedia.org/wiki/Rational_number
 */


/*
TODO:
以 BigInt() 重寫。
http://reference.wolfram.com/mathematica/ref/RootApproximant.html

規格書:

rational = new Rational(numerator, denominator, base);

rational = new Rational(10783, 2775);
rational = new Rational('10783/2775');
rational = new Rational('3+2458/2775');
rational = new Rational('3 2458/2775');
//https://en.wikipedia.org/wiki/Vinculum_(symbol)
rational = new Rational('3.88¯576');
//Brackets
rational = new Rational('3.88(576)');

numerator 10783
denominator 2775

integer part 整數部分 == quotient == continued fraction[0]
fractional part 分數/小數部分 == remainder / denominator

mixed fraction 帶分數 == integer part + fractional part
vulgar fraction 真分數/假分數 == 

decimal approximation (numerical value) 無限小數 3.88576576576576576576576576
//https://en.wikipedia.org/wiki/Overline#Math_and_science
repeating decimal 循環小數 3.88¯576

continued fraction 連分數 == [3; 1, 7, 1, 3, 15, 1, 1, 2]

Egyptian fraction expansion 古埃及分數

最簡分數(irreducible fraction, reduced proper fraction)
約分 reduce

*/



'use strict';
if (typeof CeL === 'function')
	CeL.run(
	{
		name: 'data.math.rational',
		require: 'data.code.compatibility.|data.native.|data.math.integer.',
		no_extend: 'random,compare',
		code: function (library_namespace) {

			//	requiring
			var Integer = library_namespace.data.math.integer,
			// radix point / radix character / decimal mark
			radix_point = Integer.radix_point(),

			// 為正規 radix。
			valid_radix = Integer.valid_radix,
			DEFAULT_BASE = Integer.DEFAULT_BASE

			;

			// ---------------------------------------------------------------------//
			// basic constants. 定義基本常數。

			var

			// copy from data.math
			MULTIPLICATIVE_IDENTITY = library_namespace.MULTIPLICATIVE_IDENTITY,
			// copy from data.math
			ZERO_EXPONENT = library_namespace.ZERO_EXPONENT,

			// copy from data.math.integer.

			//{Integer}
			KEY_NUMERATOR = 'numerator',
			//{Integer|Undefined}integer > 0
			KEY_DENOMINATOR = 'denominator',
			//{Boolean|Undefined}最簡分數
			KEY_IRREDUCIBLE = 'irreducible',

			// 應與 parseInt() 一致。
			DEFAULT_RADIX = parseInt('10'),

			// 可辨認之數字字串。
			//	[ full , sign, integer part 整數部分, sign of fractional part 小數部分, numerator, denominator ]
			PATTERN_FRACTION = /([+\-]?)(?:(\d+)([ +\-]))?(\d+)\/(\d+)/,
			//	[ full , sign, integer part 整數部分, fractional part 小數部分, repeating decimal 循環小數1, repeating decimal 循環小數2 ]
			PATTERN_DECIMAL = /([+\-]?)(\d*)\.(\d*)(?:¯(\d+)|\((\d+)\))?/

			;

			// ---------------------------------------------------------------------//
			// 初始調整並規範基本常數。


			// ---------------------------------------------------------------------//
			// 工具函數

			function do_modified(rational, not_amount) {
				if (!not_amount)
					delete rational[KEY_IRREDUCIBLE];
			}


			// ---------------------------------------------------------------------//
			//	definition of module integer

			/**
			 * 任意大小、帶正負號的有理數。rational number instance.
			 *
			 * @example
			 * <code>
			 * </code>
			 *
			 * @class	Rational 的 constructor
			 * @constructor
			 */
			function Rational(number) {
				if (!(this instanceof Rational))
					return 1 === arguments.length && is_Rational(number) ? number : assignment.apply(new Rational, arguments);
				if (arguments.length > 0)
					assignment.apply(this, arguments);
			}

			//	instance public interface	-------------------

			// https://en.wikipedia.org/wiki/Operation_(mathematics)
			var OP_REFERENCE = {
				'+': add,
				'-': subtract,
				'*': multiply,
				'/': divide,
				'^': power,
				'=': assignment,
				'==': compare
			};

			Object.assign(Rational.prototype, OP_REFERENCE, {
				reduce: reduce,
				// 下面全部皆為 assignment，例如 '+' 實為 '+='。
				assignment: assignment,

				// add_assignment
				add: add,
				// subtract_assignment
				subtract: subtract,
				// multiply_assignment
				multiply: multiply,
				// divide_assignment
				divide: divide,
				div: divide,

				power: power,
				pow: power,
				square: square,
				square_root: square_root,
				sqrt: square_root,
				// 至此為 assignment。

				clone: clone,

				//https://en.wikipedia.org/wiki/Absolute_value
				abs: function (negative) {
					do_modified(this, true);
					this[KEY_NUMERATOR].abs(negative);
					return this;
				},
				// 變換正負號。
				negate: function () {
					do_modified(this, true);
					this[KEY_NUMERATOR].negate();
					return this;
				},
				is_positive: function () {
					return this.compare(0) > 0;
				},
				is_negative: function () {
					return this[KEY_NUMERATOR].is_negative();
				},
				// 正負符號。
				// https://en.wikipedia.org/wiki/Sign_(mathematics)
				// https://en.wikipedia.org/wiki/Sign_function
				sign: function (negative) {
					return this[KEY_NUMERATOR].sign(negative);
				},

				to_continued_fraction: to_continued_fraction,
				to_repeating_decimal: to_repeating_decimal,
				integer_part: function () {
					var n = this[KEY_NUMERATOR].clone().expand_exponent();
					if (KEY_DENOMINATOR in this)
						n.divide(this[KEY_DENOMINATOR]);
					return n;
				},
				toPrecision: toPrecision,

				factorize: factorize,
				log: log,

				is_0: function (little_natural) {
					return this[KEY_NUMERATOR].is_0(little_natural);
				},
				isFinite: function () {
					return this[KEY_NUMERATOR].isFinite();
				},
				//compare_amount: compare_amount,
				compare: compare,
				equals: function (number) {
					return this.compare(number) === 0;
				},
				// is proper fraction
				is_proper: function () {
					return (KEY_DENOMINATOR in this) && this[KEY_NUMERATOR].compare(this[KEY_DENOMINATOR]) < 0;
				},

				op: Integer.set_operate(OP_REFERENCE),
				valueOf: valueOf,
				toString: toString
			});

			//	class public interface	---------------------------
			function is_Rational(value) {
				return value instanceof Rational;
			}

			function Rational_compare(number1, number2) {
				if (typeof number1 === 'number' && typeof number2 === 'number')
					return number1 - number2;

				if (!is_Rational(number1))
					number1 = new Rational(number1);
				return number1.compare(number2);
			}

			//get the extreme value (極端值: max/min) of input values
			function extreme(values, get_minima) {
				var index = values.length, extreme_value, value, compare;
				if (!index)
					// ES6: Math.max: If no arguments are given, the result is −∞.
					return get_minima ? Infinity : -Infinity;

				extreme_value = values[--index];
				while (0 < index--) {
					// WARNING 注意: 當碰上許多大數時，會出現需要多次轉換 extreme_value 成 Rational 的效能低下情形!
					//但若許多數字不同底，而最大的是 String，則可能獲得部分效能。
					if (Number.isNaN(compare = Rational_compare(extreme_value, value = values[index])))
						// ES6: Math.max: If any value is NaN, the result is NaN.
						return NaN;

					if (get_minima ? compare > 0 : compare < 0)
						extreme_value = value;

					//依規範，必須掃描一次，確定沒 NaN。不可中途跳出。
					if (false && (get_minima ? compare > 0 : compare < 0)
						//當有改變時才偵測。
						&& typeof (extreme_value = value) === 'number' && !Number.isFinite(extreme_value = value))
						break;
				}
				return extreme_value;
			}

			// TODO: max
			function random(max) {
				return new Rational(Integer.random(), Integer.random());
			}

			function is_0(value, little_natural) {
				if (typeof value === 'string')
					value = new Rational(value);
				return value === (little_natural || 0) || (is_Rational(value) ? value[KEY_NUMERATOR] : Integer(value)).is_0(little_natural);
			}

			Object.assign(Rational, {
				from_continued_fraction: function (sequence, length, base) {
					var convergent = Integer.convergent_of(sequence, length, base);
					return new Rational(convergent[0], convergent[1]);
				},

				random: random,
				max: function Rational_max() {
					// get max()
					return extreme(arguments);
				},
				min: function Rational_min() {
					// get min()
					return extreme(arguments, true);
				},
				compare: Rational_compare,
				// little_natural: little natural number, e.g., 1
				is_0: is_0,

				is_Rational: is_Rational
			});


			// ---------------------------------------------------------------------//

			// 因 clone 頗為常用，作特殊處置以增進效率。
			function clone() {
				var rational = new Rational;
				rational[KEY_NUMERATOR] = this[KEY_NUMERATOR].clone();
				if (KEY_DENOMINATOR in this)
					rational[KEY_DENOMINATOR] = this[KEY_DENOMINATOR].clone();
				if (KEY_IRREDUCIBLE in this)
					rational[KEY_IRREDUCIBLE] = this[KEY_IRREDUCIBLE];
				return rational;
			}

			function assignment(numerator, denominator, base) {
				do_modified(this);

				var matched, tmp;
				if (is_Rational(numerator)) {
					[KEY_DENOMINATOR, KEY_IRREDUCIBLE].forEach(function (key) {
						if (key in numerator)
							this[key] = numerator[key];
						else
							delete this[key];
					}, this);
					this[KEY_NUMERATOR] = numerator = numerator[KEY_NUMERATOR];

				} else if (typeof numerator === 'string' && (matched = numerator.match(PATTERN_FRACTION))) {
					//rational = new Rational('10783/2775');
					//rational = new Rational('3+2458/2775');
					//rational = new Rational('3 2458/2775');

					if (base === undefined && valid_radix(denominator))
						// shift arguments
						base = denominator, denominator = undefined;

					if (!valid_radix(base))
						base = DEFAULT_RADIX;

					//	[ full , sign, integer part 整數部分, sign of fractional part 小數部分, numerator, denominator ]
					if (matched[3] === '-' && matched[1] !== '-')
						library_namespace.error('assignment: Invalid number sign!');

					this[KEY_DENOMINATOR] = tmp = new Integer(matched[5], base, DEFAULT_BASE);
					this[KEY_NUMERATOR] = numerator = new Integer(matched[4], base, DEFAULT_BASE);
					if (matched[2])
						numerator.add((new Integer(matched[2], base, DEFAULT_BASE)).multiply(tmp));
					if (matched[1] === '-')
						// 將正負符號擺在 [KEY_NUMERATOR]，確保 [KEY_DENOMINATOR] 不為負。
						numerator.negate();

				} else if (typeof numerator === 'string' && (matched = numerator.match(PATTERN_DECIMAL))) {
					//https://en.wikipedia.org/wiki/Vinculum_(symbol)
					//rational = new Rational('3.88¯576');
					//Brackets
					//rational = new Rational('3.88(576)');

					if (base === undefined && valid_radix(denominator))
						// shift arguments
						base = denominator, denominator = undefined;

					if (!valid_radix(base))
						base = DEFAULT_RADIX;

					//	[ full , sign, integer part 整數部分, fractional part 小數部分, repeating decimal 循環小數1, repeating decimal 循環小數2 ]
					// e.g., 1111.222¯33333 → 1111 + (22233333 - 222) / 99999000

					// 處理完小數部分之 numerator。
					if (matched[4] || (matched[4] = matched[5])) {
						// 有循環節(period)。
						numerator = new Integer(matched[3] + matched[4], base, DEFAULT_BASE);
						if (matched[3])
							numerator.add(new Integer(matched[3], base, DEFAULT_BASE), true);
						tmp = (base - 1).toString(base).repeat(matched[4].length);
					} else {
						// 無循環節(period)。
						numerator = new Integer(matched[3] || 0, base, DEFAULT_BASE);
						tmp = MULTIPLICATIVE_IDENTITY;
					}

					if (matched[3])
						tmp += '0'.repeat(matched[3].length);
					if (tmp === MULTIPLICATIVE_IDENTITY)
						delete this[KEY_DENOMINATOR];
					else
						// assert: {String} tmp
						this[KEY_DENOMINATOR] = new Integer(tmp, base, DEFAULT_BASE);

					if (matched[2])
						numerator.add(new Integer(matched[2], base, DEFAULT_BASE).multiply(this[KEY_DENOMINATOR]));

					if (matched[1] === '-')
						// 將正負符號擺在 [KEY_NUMERATOR]，確保 [KEY_DENOMINATOR] 不為負。
						numerator.negate();
					this[KEY_NUMERATOR] = numerator;

				} else {
					delete this[KEY_DENOMINATOR];
					if ((this[KEY_NUMERATOR] = numerator = new Integer(tmp = numerator, base, DEFAULT_BASE)).isNaN())
						library_namespace.error('assignment: Invalid number: [' + tmp + '].');

						// 確保不使用 exponent，使 exponent 為 0。
					else if ((tmp = numerator.get_exponent()) > 0)
						numerator.expand_exponent();
					else if (tmp < 0) {
						(this[KEY_DENOMINATOR] = new Integer(numerator.get_base(), numerator.get_base()))
							.power(-tmp);
						numerator.get_exponent(0);
					}
				}

				if (denominator)
					// rational = new Rational(10783, 2775);
					this.divide(valid_radix(base) && typeof denominator === 'string' ? new Rational(denominator, MULTIPLICATIVE_IDENTITY, base) : denominator);

				if ((KEY_DENOMINATOR in this)
					&& (!numerator.isFinite()
					|| numerator.is_0()
					// [KEY_DENOMINATOR] 預設即為 MULTIPLICATIVE_IDENTITY。
					|| this[KEY_DENOMINATOR].is_0(MULTIPLICATIVE_IDENTITY)
					))
					delete this[KEY_DENOMINATOR];

				return this;
			}

			function reduce() {
				if ((KEY_DENOMINATOR in this) && !this[KEY_IRREDUCIBLE]) {
					var gcd = this[KEY_NUMERATOR].clone().Euclidean_algorithm(this[KEY_DENOMINATOR].clone())[1];
					this[KEY_NUMERATOR].divide(gcd);
					if (this[KEY_DENOMINATOR].equals(gcd))
						delete this[KEY_DENOMINATOR];
					else
						this[KEY_DENOMINATOR].divide(gcd);
					this[KEY_IRREDUCIBLE] = true;
				}

				return this;
			}

			/**
			 * 測試大小/比大小
			 * @param number	the number to compare
			 * @return	{Number}	0:==, <0:<, >0:>
			 * @_name	_module_.prototype.compare_to
			 */
			function compare(number) {
				if (typeof number === 'string')
					number = new Rational(number);
				if (is_Rational(number) && (KEY_DENOMINATOR in number.reduce()))
					return this.reduce()[KEY_NUMERATOR].clone().multiply(number[KEY_DENOMINATOR])
					//
					.compare(KEY_DENOMINATOR in this ? this[KEY_DENOMINATOR].clone().multiply(number[KEY_NUMERATOR]) : number[KEY_NUMERATOR]);

				else {
					if (is_Rational(number))
						number = number[KEY_NUMERATOR];
					return this.reduce()[KEY_NUMERATOR]
					//
					.compare(KEY_DENOMINATOR in this ? this[KEY_DENOMINATOR].clone().multiply(number) : number);
				}
			}


			// ---------------------------------------------------------------------//
			//四則運算，即加減乘除， + - * / (+-×÷)**[=]
			//https://en.wikipedia.org/wiki/Elementary_arithmetic

			// 正規化(normalize) operand
			// return is_Integer
			function normalize_operand(operand, rational) {
				// TODO: defferent base
				return Integer.is_Integer(operand) && operand.get_base() === rational[KEY_NUMERATOR].get_base()
					|| is_Rational(operand) && operand[KEY_NUMERATOR].get_base() === rational[KEY_NUMERATOR].get_base()
					? operand
					: new Rational(operand);
			}

			// Addition 和: addend + addend = sum
			function add(addend, is_subtract) {
				if (!is_0(addend = normalize_operand(addend, this))) {
					//	assert: addend != 0.

					do_modified(this.reduce());

					addend = Rational(addend);

					if (is_Rational(addend) && !(KEY_DENOMINATOR in addend.reduce()))
						addend = addend[KEY_NUMERATOR];
					// assert: addend is non-Rational or reduced Rational with denominator.

					if (is_Rational(addend)
						// 分母相同時，直接相加減分子。
					 ? (KEY_DENOMINATOR in this) && addend[KEY_DENOMINATOR].equals(this[KEY_DENOMINATOR])
						// 分母相同(=1)時，直接相加減分子。
					 : !(KEY_DENOMINATOR in this))
						this[KEY_NUMERATOR].add(is_Rational(addend) ? addend[KEY_DENOMINATOR] : addend, is_subtract);
						// 分母相同，毋須更動。

					else {
						// n1/d1 ± n2/d2 = (n1d2 ± n2d1)/d1d2
						// assert: d1 != d2
						var denominator_need_multiply;
						if (is_Rational(addend)) {
							// 僅在 (KEY_DENOMINATOR in addend) 時，才須處理分母。
							if (KEY_DENOMINATOR in this)
								//為不干擾 this[KEY_NUMERATOR].add() 之操作，另作 cache。
								denominator_need_multiply = addend[KEY_DENOMINATOR];
							else
								// 為不干擾 addend，另外創建。
								this[KEY_DENOMINATOR] = addend[KEY_DENOMINATOR].clone();
							this[KEY_NUMERATOR].multiply(addend[KEY_DENOMINATOR]);
							addend = addend[KEY_NUMERATOR];
						}
						this[KEY_NUMERATOR].add(KEY_DENOMINATOR in this ? this[KEY_DENOMINATOR].clone().multiply(addend) : addend, is_subtract);
						if (denominator_need_multiply)
							this[KEY_DENOMINATOR].multiply(denominator_need_multiply);
					}
				}

				return this;
			}

			// Subtraction 差: minuend − subtrahend = difference
			function subtract(subtrahend) {
				return this.add(subtrahend, true);
			}

			// Multiplication 乘: multiplicand × multiplier = product
			function multiply(multiplier) {
				if (!this[KEY_NUMERATOR].isNaN())
					if (is_0(multiplier = normalize_operand(multiplier, this))) {
						do_modified(this);
						this[KEY_NUMERATOR].assignment(this[KEY_NUMERATOR].isFinite() ? 0 : NaN);
						delete this[KEY_DENOMINATOR];

					} else if (!is_0(multiplier, MULTIPLICATIVE_IDENTITY)) {
						do_modified(this.reduce());

						if (is_Rational(multiplier) && !(KEY_DENOMINATOR in multiplier.reduce()))
							multiplier = multiplier[KEY_NUMERATOR];
						// assert: multiplier is non-Rational or reduced Rational with denominator.

						if (is_Rational(multiplier)) {
							this[KEY_NUMERATOR].multiply(multiplier[KEY_NUMERATOR]);
							if (KEY_DENOMINATOR in this)
								this[KEY_DENOMINATOR].multiply(multiplier[KEY_DENOMINATOR]);
							else
								this[KEY_DENOMINATOR] = multiplier[KEY_DENOMINATOR].clone();
						} else
							this[KEY_NUMERATOR].multiply(multiplier);
					}

				return this;
			}

			// Division 除: dividend ÷ divisor = quotient
			function divide(denominator) {
				if (!this[KEY_NUMERATOR].isNaN())
					if (!denominator || is_0(denominator = normalize_operand(denominator, this))) {
						do_modified(this);
						this[KEY_NUMERATOR].assignment(1 / 0);
						delete this[KEY_DENOMINATOR];

					} else if (!is_0(denominator, MULTIPLICATIVE_IDENTITY)) {
						do_modified(this.reduce());

						if (is_Rational(denominator)) {
							if (KEY_DENOMINATOR in denominator.reduce())
								this[KEY_NUMERATOR].multiply(denominator[KEY_DENOMINATOR]);
							denominator = denominator[KEY_NUMERATOR];
						}

						if (KEY_DENOMINATOR in this)
							this[KEY_DENOMINATOR].multiply(denominator);
						else
							this[KEY_DENOMINATOR] = denominator.clone();
					}

				return this;
			}


			// ---------------------------------------------------------------------//

			// https://en.wikipedia.org/wiki/Minimal_polynomial_(field_theory)
			// return p[{Integer}], p[0] + p[1]*this = 0
			function minimal_polynomial() {
				this.reduce();
				var polynomial = [this[KEY_NUMERATOR], this[KEY_DENOMINATOR]];
				// translate to {Number} if possible.
				polynomial.forEach(function (coefficient, index) {
					var value = coefficient.valueOf();
					polynomial[index] = Number.isSafeInteger(value) ? value : coefficient.clone();
				});
				return polynomial;
			}

			function continued_fraction_toString() {
				return '[' + this.join(',').replace(/,/, ';') + ']';
			}

			function to_continued_fraction() {
				var c = KEY_DENOMINATOR in this
				// http://www.mathpath.org/concepts/cont.frac.htm
				? this[KEY_NUMERATOR].clone().Euclidean_algorithm(this[KEY_DENOMINATOR].clone())[0]
				//
				: [this[KEY_NUMERATOR].clone()];
				Object.defineProperty(c, 'toString', {
					enumerable: false,
					value: continued_fraction_toString
				});
				return c;
			}

			// precise divide, to repeating decimal
			// radix===1: get {Integer} object instead of {String}
			// return [ integer part, non-repeating fractional part, period (repeating decimal part) ]
			// https://en.wikipedia.org/wiki/Repeating_decimal
			function to_repeating_decimal(radix, period_limit) {
				return this[KEY_NUMERATOR].precise_divide(this[KEY_DENOMINATOR] || MULTIPLICATIVE_IDENTITY, radix, period_limit);
			}

			// precision: 不包含小數點，共取 precision 位，precision > 0。
			function toPrecision(precision) {
				if (!(0 < precision) || !Number.isSafeInteger(precision |= 0))
					return this.toString();

				var d, tmp, is_negative = this[KEY_NUMERATOR].is_negative();
				if (precision < 1e2
					// 當循環節(period)相對於 precision 過長，採用 .to_repeating_decimal() 無實益。
					|| ((KEY_DENOMINATOR in this) && precision < 4 * this[KEY_DENOMINATOR].valueOf())
					|| !(d = this.to_repeating_decimal(DEFAULT_RADIX, precision))) {
					//general method
					d = new Integer(this[KEY_NUMERATOR], DEFAULT_RADIX);
					if (KEY_DENOMINATOR in this)
						d.divide(tmp = new Integer(this[KEY_DENOMINATOR], DEFAULT_RADIX),
							precision + tmp.length + Math.max(tmp.get_exponent(), 0));
					d = d.toString();
					d = d.match(/(-?\d*)\.(\d+)/) || d.match(/(-?\d*)/);
					d = [d[1], d[2] || '', ''];
				}

				// assert: d = [ {String}integer part, {String}non-repeating fractional part, {String}period (repeating decimal part) ]

				if (d[0].length === precision + (is_negative ? 1 : 0) && d[0].charAt(d[0].length - 1) !== '0')
					return d[0];

				if (is_negative)
					//減少負擔。
					d[0] = d[0].slice(1);

				if (d[0] === '0') {
					precision++;
					if (tmp = d[1].match(/^0+/))
						precision += tmp[0].length;
				}

				if (d[0].length < precision) {
					// 會用到小數部分。
					d[0] += radix_point + d[1];
					// -2: radix_point, 判斷用之位數1位
					if (d[0].length - 2 < precision) {
						if (!d[2])
							d[2] = '0';
						d[0] += d[2].repeat(Math.ceil((precision - d[0].length + 2) / d[2].length));
					}
					// 34.56  3
					d = (5 <= (d[0].charAt(precision + 1) | 0)
						? d[0].slice(0, precision) + ((d[0].charAt(precision) | 0) + 1)
						: d[0].slice(0, precision + 1));

				} else
					d = d[0].charAt(0) + radix_point
						+ (5 <= (d[0].charAt(precision) | 0)
						? d[0].slice(1, --precision) + ((d[0].charAt(precision) | 0) + 1)
						: d[0].slice(1, precision))
						+ 'e+' + (d[0].length - 1);


				return is_negative ? '-' + d : d;
			}

			// ---------------------------------------------------------------------//
			// advanced functions

			function factorize(radix, limit) {
				var f, d, factors = this.reduce()[KEY_NUMERATOR].factorize(radix, limit);

				if (KEY_DENOMINATOR in this) {
					d = this[KEY_DENOMINATOR].factorize(radix, limit);
					// TODO: sort
					for (f in d)
						factors[f] = -d[f];
				}

				return factors;
			}

			function square() {
				do_modified(this.reduce());

				this[KEY_NUMERATOR].square();

				if (KEY_DENOMINATOR in this)
					this[KEY_DENOMINATOR].square();

				return this;
			}

			// Exponentiation 冪/乘方: base ^ exponent = power
			// https://en.wikipedia.org/wiki/Exponentiation
			// https://en.wikipedia.org/wiki/Exponentiation_by_squaring
			function power(exponent) {
				do_modified(this.reduce());

				this[KEY_NUMERATOR].power(exponent);

				if (KEY_DENOMINATOR in this)
					this[KEY_DENOMINATOR].power(exponent);

				return this;
			}

			// WARNING 注意: this will get floor(sqrt(this))，結果僅會回傳整數！
			function square_root(precision) {
				do_modified(this.reduce());

				if (KEY_DENOMINATOR in this) {
					this[KEY_NUMERATOR].divide(this[KEY_DENOMINATOR], precision);
					delete this[KEY_DENOMINATOR];
				}

				this[KEY_NUMERATOR].square_root(precision);

				return this;
			}

			function log(base) {
				var value = this[KEY_NUMERATOR].log(base);

				if (KEY_DENOMINATOR in this)
					value -= this[KEY_DENOMINATOR].log(base);

				return value;
			}


			// ---------------------------------------------------------------------//

			// WARNING 注意: 若回傳非 Number.isSafeInteger()，則會有誤差，不能等於最佳近似值。
			function valueOf(type) {
				var n = this[KEY_NUMERATOR].valueOf(), d;
				if (KEY_DENOMINATOR in this)
					if (isFinite(d = this[KEY_DENOMINATOR].valueOf()) || isFinite(n))
						n /= d;
					else
						n = this[KEY_NUMERATOR].ratio_to(this[KEY_DENOMINATOR]);
				return n;
			}

			// default: numerator/denominator
			// e.g., 1 2/3
			var TYPE_MIX = 1,
			// e.g., 1.2¯3
			TYPE_DECIMAL = 2,
			// Parentheses, e.g., 1.2(3)
			TYPE_PARENTHESES = 3;
			function toString(type) {
				if (!(KEY_DENOMINATOR in this))
					return this[KEY_NUMERATOR].toString();

				var string = this[KEY_NUMERATOR];
				if (type === TYPE_DECIMAL || type === TYPE_PARENTHESES) {
					string = string.precise_divide(this[KEY_DENOMINATOR]);
					if (string[2]) {
						string[1] += type === TYPE_DECIMAL
						// e.g., 1.2¯3
						? '¯' + string[2]
						// Parentheses, e.g., 1.2(3)
						: '(' + string[2] + ')';
						// using the combining overline (U+0305)
						// https://en.wikipedia.org/wiki/Vinculum_(symbol)#Computer_entry_of_the_symbol
						// https://en.wikipedia.org/wiki/Overline
						//string[1] += string[2].replace(/(.)/g, '$1̅');
					}
					if (string[1])
						string[0] += radix_point + string[1];
					return string[0];
				}

				return (type === TYPE_MIX ? (string = string.clone()).division(this[KEY_DENOMINATOR]).toString() + ' ' + string.abs().toString() : string.toString())
				//
				+ '/' + this[KEY_DENOMINATOR].toString();
			}


			// ---------------------------------------------------------------------//

			return Rational;
		}

	});
