
/**
 * @name	CeL quadratic irrational function
 * @fileoverview
 * 本檔案包含了二次無理數 (quadratic irrational, quadratic irquadratic, also known as a quadratic irquadraticity or quadratic surd) 的 functions。<br />
 * TODO: 可充作 Gaussian rational (簡易 complex number)、Gaussian integer、Eisenstein integer、dual number、split-complex numbers。<br />
 * 在純 javascript 的環境下，藉由原生計算功能，盡可能提供高效的大數計算。<br />
 *
 * @example
 * <code>
 * CeL.run('data.math.quadratic');
 * </code>
 *
 * @since	2013/11/8 18:16:52
 * @see
 * https://en.wikipedia.org/wiki/Quadratic_irrational
 */


/*
TODO:

https://en.wikipedia.org/wiki/Quadratic_integer
https://en.wikipedia.org/wiki/Quadratic_field

√∛∜

*/


'use strict';
if (typeof CeL === 'function')
	CeL.run(
	{
		name: 'data.math.quadratic',
		require: 'data.code.compatibility.|data.native.|data.math.quadratic_to_continued_fraction|data.math.integer.',
		no_extend: 'random,compare',
		code: function (library_namespace) {

			//	requiring
			var quadratic_to_continued_fraction = this.r('quadratic_to_continued_fraction'),
			//
			Integer = library_namespace.data.math.integer;

			// ---------------------------------------------------------------------//
			// basic constants. 定義基本常數。

			var

			// copy from data.math
			MULTIPLICATIVE_IDENTITY = library_namespace.MULTIPLICATIVE_IDENTITY,
			// copy from data.math
			ZERO_EXPONENT = library_namespace.ZERO_EXPONENT,

			// copy from data.math.integer, data.math.rational.

			// Quadratic = (integer + multiplier × √radicand) / denominator
			//{Integer}square-free integer
			KEY_RADICAND = 'radicand',
			//{Integer}
			KEY_MULTIPLIER = 'multiplier',
			//{Integer}
			KEY_INTEGER = 'integer',
			//{Integer|Undefined}integer > 0
			KEY_DENOMINATOR = 'denominator',
			//{Boolean|Undefined}最簡, GCD(multiplier, integer, denominator) = 1
			KEY_IRREDUCIBLE = 'irreducible'
			;

			// ---------------------------------------------------------------------//
			// 初始調整並規範基本常數。


			// ---------------------------------------------------------------------//
			// 工具函數

			function do_modified(quadratic, not_amount) {
				if (!not_amount)
					delete quadratic[KEY_IRREDUCIBLE];
			}


			// ---------------------------------------------------------------------//
			//	definition of module integer

			/**
			 * 任意大小、帶正負號的有理數。quadratic irrational number instance.<br />
			 *
			 * @example
			 * <code>
			 * </code>
			 *
			 * @class	Quadratic 的 constructor
			 * @constructor
			 */
			function Quadratic(number) {
				if (!(this instanceof Quadratic))
					return 1 === arguments.length && is_Quadratic(number) ? number
					//
					: assignment.apply(new Quadratic, 1 === arguments.length && (typeof number === 'number' || Integer.is_Integer(number)) ? [1, 0, number] : arguments);

				if (arguments.length > 0)
					assignment.apply(this, arguments);
				else
					;
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

			Object.assign(Quadratic.prototype, OP_REFERENCE, {
				reduce_factor: reduce_factor,
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

				conjugate: conjugate,
				reciprocal: reciprocal,
				// 至此為 assignment。

				clone: clone,

				abs: abs,
				// 變換正負號。
				negate: function () {
					do_modified(this, true);
					this[KEY_INTEGER].negate();
					this[KEY_MULTIPLIER].negate();
					return this;
				},
				is_positive: function () {
					return this.sign(0) > 0;
				},
				is_negative: function () {
					return this.sign(0) < 0;
				},
				sign: sign,

				to_continued_fraction: to_continued_fraction,
				integer_part: function () {
					return this[KEY_RADICAND].clone().square_root().multiply(this[KEY_MULTIPLIER]).add(this[KEY_INTEGER]).division(this[KEY_DENOMINATOR]);
				},
				toPrecision: toPrecision,
				minimal_polynomial: minimal_polynomial,

				is_0: function (little_natural) {
					return is_0(this, little_natural);
				},
				//compare_amount: compare_amount,
				compare: compare,
				equals: function (number) {
					//	虛數無法比較大小。
					return this.compare(number) === 0;
				},

				op: Integer.set_operate(OP_REFERENCE),
				valueOf: valueOf,
				toString: toString
			});

			//	class public interface	---------------------------
			function is_Quadratic(value) {
				return value instanceof Quadratic;
			}

			function is_0(value, little_natural) {
				return value == (little_natural || 0)
				//
				|| value[KEY_INTEGER].is_0(little_natural) && (value[KEY_RADICAND].is_0(0) || value[KEY_MULTIPLIER].is_0(0))
				//
				|| value[KEY_RADICAND].is_0(1) && value[KEY_INTEGER].clone().add(value[KEY_MULTIPLIER]).is_0(little_natural);
			}

			// 正負符號。
			// https://en.wikipedia.org/wiki/Sign_(mathematics)
			// https://en.wikipedia.org/wiki/Sign_function
			function sign(negative) {
				if (this[KEY_RADICAND].is_positive()) {
					var si = this[KEY_INTEGER].sign(), sm = this[KEY_MULTIPLIER].sign();
					if (si * sm < 0)
						// KEY_MULTIPLIER, KEY_INTEGER 正負相異時須比較大小。
						return this[KEY_INTEGER].compare_amount(this[KEY_MULTIPLIER]) < 0
						//
						|| this[KEY_INTEGER].clone().square().compare_amount(this[KEY_MULTIPLIER].clone().square().multiply(this[KEY_RADICAND])) < 0
						//
						? sm : si;
					return si || sm;
				}
				if (this[KEY_RADICAND].is_0())
					return this[KEY_MULTIPLIER].sign();
			}

			/**
			 * 測試大小/比大小
			 * @param number	the number to compare
			 * @return	{Number}	0:==, <0:<, >0:>
			 * @_name	_module_.prototype.compare_to
			 */
			function compare(number) {
				if (!this[KEY_RADICAND].is_negative() && !number[KEY_RADICAND].is_negative()) {
					TODO;
				}
			}

			// 整係數一元二次方程式 ax^2+bx+c=0 的兩根公式解。
			// solve quadratic equation
			function solve_quadratic(c, b, a) {
				if (!a)
					a = 1;
				if (!b)
					b = 0;
				// discriminant = b^2 - 4ac
				var discriminant = (new Integer(b)).square().add((new Integer(a)).multiply(c || 0).multiply(-4));
				a = (new Integer(a)).multiply(2);
				b = (new Integer(b)).negate();
				if (discriminant.is_0())
					return [(new Quadratic(1, 0, b, a)).reduce_factor()];

				a = (new Quadratic(discriminant, 1, b, a)).reduce_factor();
				b = a.clone();
				b[KEY_MULTIPLIER].negate();
				return [a, b];
			}

			function from_continued_fraction(sequence, length, base) {
				TODO;
			}

			// Get the first to NO-th solutions of Pell's equation: x^2 - d y^2 = n (n=+1 or -1).
			// https://en.wikipedia.org/wiki/Pell%27s_equation
			// Rosen, Kenneth H. (2005). Elementary Number Theory and its Applications (5th edition). Boston: Pearson Addison-Wesley. pp. 542-545.
			// TODO: [[en:chakravala method]]
			// TODO: https://www.alpertron.com.ar/METHODS.HTM Solve the equation: a x2 + b xy + c y2 + dx + ey + f = 0 圓錐曲線/二元二次方程
			// [[en:Conic_section#General Cartesian form]]
			function solve_Pell(d, n, limit, return_Integer) {
				if (!(d >= 1) || !((d | 0) === d)) {
					// 錯誤參數
					throw 'Invalid parameter: ' + d;
				}
				if (typeof n !== 'number')
					n = 1;
				else if (n !== 1 && n !== -1)
					return;
				library_namespace.debug("Solve Pell's equation: x^2 - " + (-d) + ' y^2 = ' + n);
				var cf = (new Quadratic(d)).to_continued_fraction(),
				// 漸進連分數表示
				period = cf.pop(), solutions = [];
				if (!Array.isArray(period)) {
					// e.g., d is a perfect square integer
					// 若 d 是完全平方數，則這個方程式只有平凡解
					return n === 1 && [1, 0];
				}
				Array.prototype.push.apply(cf, period);
				if (period.length % 2 === 0) {
					if (n !== 1)
						// n = -1: no solution
						return;
				} else if (n === 1)
					// 2*l - 1
					Array.prototype.push.apply(cf, period);
				cf.pop();
				cf = Integer.convergent_of(cf);
				if (limit !== undefined && !(limit > 0) && typeof limit !== 'function') {
					library_namespace.error('Invalid limit: ' + limit);
					limit = undefined;
				}
				if (limit === undefined) {
					limit = n === 1 ? 2 : 1;
				}
				// [1, 0]: trivial solution
				n = n === 1 ? [new Integer(1), new Integer(0)] : [cf[0].clone(), cf[1].clone()];
				solutions.push([n[0].clone(!return_Integer), n[1].clone(!return_Integer)]);

				// limit() return true if 到達界限 / reach the limit / out of valid range.
				while (limit > 0 ? --limit : !limit(n[0].clone(!return_Integer))) {
					period = n[0].clone();
					n[0].multiply(cf[0]).add(n[1].clone().multiply(d).multiply(cf[1]));
					n[1].multiply(cf[0]).add(period.multiply(cf[1]));
					solutions.push([n[0].clone(!return_Integer), n[1].clone(!return_Integer)]);
				}

				return solutions;
			}

			Object.assign(Quadratic, {
				solve_quadratic: solve_quadratic,

				from_continued_fraction: from_continued_fraction,
				solve_Pell: solve_Pell,

				// little_natural: little natural number, e.g., 1
				is_0: is_0,

				is_Quadratic: is_Quadratic
			});


			// ---------------------------------------------------------------------//

			// 因 clone 頗為常用，作特殊處置以增進效率。
			function clone(convert_to_Number_if_possible) {
				var quadratic = new Quadratic;
				[KEY_RADICAND, KEY_MULTIPLIER, KEY_INTEGER, KEY_DENOMINATOR].forEach(function (key) {
					if (key in this)
						quadratic[key] = this[key].clone();
					else
						delete quadratic[key];
				}, this);
				if (KEY_IRREDUCIBLE in this)
					quadratic[KEY_IRREDUCIBLE] = this[KEY_IRREDUCIBLE];
				return quadratic;
			}

			function assignment(radicand, multiplier, integer, denominator) {
				do_modified(this);

				this[KEY_INTEGER] = new Integer(integer || 0);
				this[KEY_DENOMINATOR] = new Integer(denominator || 1);

				this[KEY_MULTIPLIER] = multiplier = new Integer(multiplier === undefined ? 1 : multiplier);
				radicand = new Integer(radicand || 0);

				//	為了允許 二元數/dual numbers，因此不對 radicand.is_0() 時作特殊處置，而當作 ε = √0。
				//	http://en.wikipedia.org/wiki/Dual_number

				// make radicand square-free
				var factors = radicand.factorize(), power;
				for (var factor in factors)
					if (factors[factor] > 1) {
						multiplier.multiply((power = new Integer(factor)).power(factors[factor] / 2 | 0));
						radicand = radicand.division(power.square());
					}
				this[KEY_RADICAND] = radicand;

				if (this[KEY_DENOMINATOR].is_negative()) {
					// 保證分母為正。
					this[KEY_MULTIPLIER].negate();
					this[KEY_INTEGER].negate();
					this[KEY_DENOMINATOR].negate();
				}

				return this.reduce_factor();
			}

			function reduce_factor() {
				if (!this[KEY_IRREDUCIBLE] && !this[KEY_DENOMINATOR].is_0(1)) {
					var gcd = new Integer(Integer.GCD(this[KEY_MULTIPLIER].clone(), this[KEY_INTEGER].clone(), this[KEY_DENOMINATOR].clone()));
					if (!(gcd.compare(2) < 0)) {
						this[KEY_MULTIPLIER].divide(gcd);
						this[KEY_INTEGER].divide(gcd);
						this[KEY_DENOMINATOR].divide(gcd);
					}
					this[KEY_IRREDUCIBLE] = true;
				}

				return this;
			}

			// 調整 field，使兩數成為相同 field。
			// return: operand with the same field.
			function adapt_field(_this, operand) {
				operand = Quadratic(operand);
				if (!_this[KEY_RADICAND].equals(operand[KEY_RADICAND]))
					if (_this[KEY_MULTIPLIER].is_0())
						_this[KEY_RADICAND] = operand[KEY_RADICAND].clone();
					else if (operand[KEY_MULTIPLIER].is_0())
						(operand = operand.clone())[KEY_RADICAND] = _this[KEY_RADICAND].clone();
					else
						throw new Error('Different field: ' + _this[KEY_RADICAND] + ' != ' + operand[KEY_RADICAND]);
				return operand;
			}

			// ---------------------------------------------------------------------//
			//四則運算，即加減乘除， + - * / (+-×÷)**[=]
			//https://en.wikipedia.org/wiki/Elementary_arithmetic

			// Addition 和: addend + addend = sum
			function add(addend, is_subtract) {
				addend = adapt_field(this, addend);

				do_modified(this);
				if (this[KEY_DENOMINATOR].compare(addend[KEY_DENOMINATOR]) !== 0) {
					// n1/d1 ± n2/d2 = (n1d2 ± n2d1)/d1d2
					// assert: d1 != d2
					var multiplier = this[KEY_DENOMINATOR], tmp = addend[KEY_DENOMINATOR];
					if (multiplier.is_0(MULTIPLICATIVE_IDENTITY))
						tmp = tmp.clone();
					else {
						addend = addend.clone();
						addend[KEY_INTEGER].multiply(multiplier);
						addend[KEY_MULTIPLIER].multiply(multiplier);
						addend[KEY_DENOMINATOR].multiply(multiplier);
					}

					if (!tmp.is_0(MULTIPLICATIVE_IDENTITY)) {
						this[KEY_INTEGER].multiply(tmp);
						this[KEY_MULTIPLIER].multiply(tmp);
						this[KEY_DENOMINATOR].multiply(tmp);
					}
				}

				this[KEY_INTEGER].add(addend[KEY_INTEGER], is_subtract);
				this[KEY_MULTIPLIER].add(addend[KEY_MULTIPLIER], is_subtract);
				return this.reduce_factor();
			}

			// Subtraction 差: minuend − subtrahend = difference
			function subtract(subtrahend) {
				return this.add(subtrahend, true);
			}

			// Multiplication 乘: multiplicand × multiplier = product
			function multiply(multiplier) {
				multiplier = adapt_field(this, multiplier);

				do_modified(this);
				this[KEY_DENOMINATOR].multiply(multiplier[KEY_DENOMINATOR]);
				var i = this[KEY_INTEGER].clone();
				this[KEY_INTEGER].multiply(multiplier[KEY_INTEGER]).add(this[KEY_MULTIPLIER].clone().multiply(multiplier[KEY_MULTIPLIER]).multiply(this[KEY_RADICAND]));
				this[KEY_MULTIPLIER].multiply(multiplier[KEY_INTEGER]).add(i.multiply(multiplier[KEY_MULTIPLIER]));

				return this.reduce_factor();
			}

			// 共軛
			function conjugate() {
				do_modified(this);
				this[KEY_MULTIPLIER].negate();

				return this.reduce_factor();
			}

			// 倒數, multiplicative inverse or reciprocal
			function reciprocal() {
				do_modified(this.reduce_factor());
				var d = this[KEY_DENOMINATOR];
				if ((this[KEY_DENOMINATOR] = this[KEY_INTEGER].clone().square().add(this[KEY_MULTIPLIER].clone().square().multiply(this[KEY_RADICAND]), true)).is_negative())
					this[KEY_DENOMINATOR].negate(), d.negate();
				this[KEY_INTEGER].multiply(d);
				this[KEY_MULTIPLIER].multiply(d.negate());

				return this.reduce_factor();
			}

			// Division 除: dividend ÷ divisor = quotient
			function divide(denominator) {
				denominator = adapt_field(this, denominator);

				do_modified(this);
				return this.multiply(denominator.clone().reciprocal());
			}


			// ---------------------------------------------------------------------//

			// absolute value/絕對值/模
			// https://en.wikipedia.org/wiki/Absolute_value
			function abs() {
				var v = this, i2, r2 = function () {
					i2 = v[KEY_INTEGER].clone().square();
					return r2 = v[KEY_MULTIPLIER].clone().square().multiply(v[KEY_RADICAND]);
				};

				// test: (this) 為實數或複數。
				if (v[KEY_RADICAND].is_negative())
					// 複數一般方法: abs() = √(i^2 - r m^2) / d
					return new Quadratic(r2().negate().add(i2), 1, 0, v[KEY_DENOMINATOR]);

				v = v.clone();
				// KEY_MULTIPLIER, KEY_INTEGER 正負相異時須比較大小。
				if (v[KEY_MULTIPLIER].is_negative() && (!v[KEY_INTEGER].is_positive() || r2().compare(i2) > 0)
					//
					|| v[KEY_INTEGER].is_negative() && (v[KEY_MULTIPLIER].is_0() || r2().compare(i2) < 0)) {
					v[KEY_MULTIPLIER].negate();
					v[KEY_INTEGER].negate();
				}

				return v;
			}

			function is_pure() {
				var D = this[KEY_RADICAND].clone().square_root(1).multiply(this[KEY_MULTIPLIER]);
				return D.clone().add(this[KEY_INTEGER]).compare(this[KEY_DENOMINATOR]) > 0
					&& D.add(this[KEY_INTEGER], true).compare(0) > 0 && D.compare(this[KEY_DENOMINATOR]) < 0;
			}

			function continued_fraction_toString() {
				return '[' + this.join(',').replace(/,/, ';') + ']';
			}

			function to_continued_fraction() {

				return quadratic_to_continued_fraction(this[KEY_RADICAND].valueOf(), this[KEY_MULTIPLIER].valueOf(), this[KEY_INTEGER].valueOf(), this[KEY_DENOMINATOR].valueOf());

				// TODO: for large arguments

				// (m√r + i) / d
				// = (√(r m^2) + i) / d
				// = (√(d in book) + P0) / Q0
				var d = this[KEY_MULTIPLIER].clone().square().multiply(this[KEY_RADICAND]),
				//
				P = this[KEY_INTEGER].clone(), Q = this[KEY_DENOMINATOR].clone(),
				// A: α in book.
				A, a;

				return;
			}


			// precision: 不包含小數點，共取 precision 位，precision > 0。
			function toPrecision(precision) {
				return this.valueOf(precision).toString();
			}

			// ---------------------------------------------------------------------//
			// advanced functions

			// Exponentiation 冪/乘方: base ^ exponent = power
			// https://en.wikipedia.org/wiki/Exponentiation
			// https://en.wikipedia.org/wiki/Exponentiation_by_squaring
			// TODO: use matrix?
			// http://en.wikipedia.org/wiki/2_%C3%97_2_real_matrices
			function power(exponent) {
				if (exponent == 0) {
					if (!this.is_0(ZERO_EXPONENT)) {
						do_modified(this);
						this[KEY_DENOMINATOR] = new Integer(1);
						this[KEY_INTEGER] = new Integer(1);
						this[KEY_MULTIPLIER] = new Integer(0);
					}

				} else if (1 < (exponent |= 0)) {
					do_modified(this.reduce_factor());

					var power = new Quadratic, r, _m = exponent % 2 === 1, m, i,
					//
					d = this[KEY_DENOMINATOR].power(exponent);

					power[KEY_RADICAND] = r = this[KEY_RADICAND];
					power[KEY_MULTIPLIER] = m = this[KEY_MULTIPLIER];
					power[KEY_INTEGER] = i = this[KEY_INTEGER];
					power[KEY_DENOMINATOR] = new Integer(MULTIPLICATIVE_IDENTITY);

					this[KEY_MULTIPLIER] = _m ? m.clone() : new Integer(0);
					this[KEY_INTEGER] = _m ? i.clone() : new Integer(MULTIPLICATIVE_IDENTITY);
					this[KEY_DENOMINATOR] = new Integer(MULTIPLICATIVE_IDENTITY);

					while (exponent >>= 1) {
						// numerator := square of numerator
						_m = m.clone();
						m.multiply(2).multiply(i);
						i.square().add(_m.square().multiply(r));
						if (exponent % 2 === 1)
							// this *= power
							this.multiply(power);
					}
					this[KEY_DENOMINATOR] = d;
				}
				return this;
			}

			/*
			https://en.wikipedia.org/wiki/Square_(algebra)
			*/
			function square() {
				return this.power(2);
			}

			// https://en.wikipedia.org/wiki/Minimal_polynomial_(field_theory)
			// return p[{Integer}], p[0] + p[1]*this + p[1]*this^2 = 0
			function minimal_polynomial() {
				this.reduce_factor();
				// TODO: need GCD()?
				var value, polynomial = [this[KEY_INTEGER].clone().square().add(this[KEY_MULTIPLIER].clone().square().multiply(this[KEY_RADICAND]), true),
					//
					this[KEY_INTEGER].clone().multiply(-2).multiply(this[KEY_DENOMINATOR]),
					//
					this[KEY_DENOMINATOR].clone().square()];
				// translate to {Number} if possible.
				polynomial.forEach(function (coefficient, index) {
					if (Number.isSafeInteger(value = coefficient.valueOf()))
						polynomial[index] = value;
				});
				return polynomial;
			}


			// ---------------------------------------------------------------------//

			// WARNING 注意: 若回傳非 Number.isSafeInteger()，則會有誤差，不能等於最佳近似值。
			function valueOf(precision) {
				// 2: (default base of Integer) ^ 2 > JavaScript 內定 precision.
				var value = Math.max(2, precision || 0);
				value = this[KEY_INTEGER].clone().add(this[KEY_RADICAND].clone().square_root(value).multiply(this[KEY_MULTIPLIER])).divide(this[KEY_DENOMINATOR], value);
				return precision && value || value.valueOf();
			}

			function toString(type) {
				var string = this[KEY_MULTIPLIER].is_0() ? []
				: [(this[KEY_MULTIPLIER].is_0(MULTIPLICATIVE_IDENTITY)
					? '' : this[KEY_MULTIPLIER].toString()) + '√' + this[KEY_RADICAND].toString()];
				// assert: (string) is now {Array}
				if (!this[KEY_INTEGER].is_0())
					string.unshift(this[KEY_INTEGER].toString());
				if (string.length > 1) {
					if (!/^-/.test(string[1]))
						string[1] = '+' + string[1];
					string = string.join('');
				} else
					string = string[0] || '';
				// assert: (string) is now {String}
				if (!this[KEY_DENOMINATOR].is_0(MULTIPLICATIVE_IDENTITY))
					string = '(' + string + ')/' + this[KEY_DENOMINATOR].toString();
				return string;
			}


			// ---------------------------------------------------------------------//

			return Quadratic;
		}

	});
