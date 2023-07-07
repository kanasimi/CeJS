/**
 * @name CeL function for math application.
 * @fileoverview 本檔案包含了生成 math application 的 functions。
 * @since 2014/10/3
 * @example <code>
	CeL.run('application.math', function() {
		// ..
	});
 * </code>
 */

'use strict';
if (typeof CeL === 'function')
	CeL.run({
		name : 'application.math',
		// includes() @ data.code.compatibility.
		require : 'data.code.compatibility.|data.math.',
		// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
		code : module_code

	});

function module_code(library_namespace) {

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

	// ----------------------------------------------------- //

	(function() {
		runCode.setR = 0;
		for (var i = 0, j, t, s, n_e; i < 10;) {
			t = 2000 + 8000 * Math.random();
			s = get_random_prime.get_different_number_set(3, t, t / 8);
			if (s.LCM > 9999)
				continue;
			n_e = [];
			n_e[s.GCD] = 1;
			for (j = 0; j < s.length; j++)
				if (n_e[s[j]])
					continue;
				else
					n_e[s[j]] = 1;
			sl([ s.GCD, s.LCM ] + '<b style="color:#c4a">;</b> ' + s);
			i++;
		}
	});

	// ----------------------------------------------------- //

	// 中式短除法(Chinese short division)並非 short division.
	// https://en.wikipedia.org/wiki/Short_division
	function draw_short_division(naturals, layer, GCD_only) {
		if (!Array.isArray(naturals))
			if (isNaN(layer))
				naturals = [ naturals ];
			else
				naturals = arguments, layer = null;

		var i, length = naturals.length | 0, divisor, cell_width_em = 2,
		//
		natural_Array = [];
		for (i = 0; i < length; i++) {
			divisor = +naturals[i];
			if (0 < divisor && divisor < Number.MAX_SAFE_INTEGER) {
				natural_Array.push(divisor);
				if (cell_width_em < String(divisor).length * .6)
					cell_width_em = Math.ceil(String(divisor).length * .6);
			}
		}
		length = (naturals = Array.prototype.slice.call(natural_Array)).length | 0;

		var block = [], count = 0,
		//
		_GCD = library_namespace.GCD(natural_Array),
		//
		GCD = library_namespace.factorize(_GCD);

		library_namespace
				.debug(length + ' Naturals: ' + natural_Array + '.', 2);
		if (GCD) {
			// assert: _GCD > 1
			if (_GCD !== (divisor = GCD.toString(true)))
				_GCD += ' = ' + divisor;

			// phase 1: 處理 GCD 部分。
			for (divisor in GCD) {
				divisor |= 0;
				for (var j = 0; j < GCD[divisor] | 0; j++)
					if (length !== 1 || natural_Array[0] !== divisor) {
						block.push(draw_short_division.add_line(natural_Array,
								cell_width_em, divisor, count++, true));
						for (i = 0; i < length; i++)
							natural_Array[i] = natural_Array[i] / divisor;
					}
			}
		}

		// phase 2: 處理 LCM 部分。
		// TODO: 按大小排列。
		GCD = 0;
		do {
			var LCM = natural_Array[0];
			for (i = 1; i < length; i++)
				if (natural_Array[i] > 1
						&& (GCD = library_namespace.GCD(LCM, natural_Array[i])) > 1) {
					divisor = +library_namespace.first_factor(GCD);
					block.push(draw_short_division.add_line(natural_Array,
							cell_width_em, divisor, count++));
					for (i = 0; i < length; i++)
						if (natural_Array[i] % divisor === 0)
							natural_Array[i] = natural_Array[i] / divisor;
					break;
				}
		} while (GCD > 1);

		// 依照各種不同類之輸入，顯示不同備註標示。
		if (length === 1) {
			// 質因數分解。
			block.push(draw_short_division.add_line(natural_Array,
					cell_width_em), {
				div : [ _GCD ]
			});

		} else {
			i = library_namespace.LCM(naturals);
			block.push(draw_short_division.add_line(natural_Array,
					cell_width_em), {
				div : [ 'GCD',
				// '(', naturals.join(', '), ')',
				' = ', _GCD ],
				S : draw_short_division.GCD_style
			},
					{
						div : [ 'LCM',
						// '(', naturals.join(', '), ')',
						' = ', i, ' = ',
								library_namespace.factorize(i).toString(true) ]
					});
		}

		// 最後收尾。
		block = {
			div : block,
			style : 'width:'
					+ (1 + (length + (1 < length ? 2 : 1)) * cell_width_em | 0)
					+ 'em;background-color:#def',
			C : 'short_division'
		};
		return layer ? new_node(block, layer) : block;
	}
	draw_short_division.GCD_style = 'color:#f79;';

	draw_short_division.add_line = function(naturals, cell_width_em, divisor,
			count, phase_GCD) {
		library_namespace.debug(divisor + ': ' + naturals, 3,
				'draw_short_division.add_line');
		var line = [];
		naturals.forEach(function(natural, index) {
			line.push({
				span : natural,
				S :
				//
				'display:inline-block;text-align:right;padding-right:.2em;width:'
				//
				+ (cell_width_em + (index ? 0 : .5 - count / 5)).to_fixed(2)
						+ 'em'
			}, ' ');
		});
		line.pop();

		if (divisor)
			line = [ {
				span : divisor,
				S : 'text-align:right;padding-right:.2em;'
			}, {
				span : line,
				S : 'border-left:1pt solid #88f;border-bottom:1pt solid #88f'
			} ];

		return {
			div : line,
			S : 'clear:both;text-align:right;'
					+ (phase_GCD ? draw_short_division.GCD_style : '')
		};
	};

	_.draw_short_division = draw_short_division;

	/**
	 * <code>

	CeL.run('application.math', function() {
		CeL.draw_short_division([12], [ document.body, 2 ]);
		CeL.draw_short_division([12, 18], [ document.body, 2 ]);
		CeL.draw_short_division([12, 18, 24], [ document.body, 2 ]);
	});

	</code>
	 */

	// ----------------------------------------------------------------------------------------------
	// //
	var new_node = function() {
		var func = library_namespace.DOM.new_node;
		if (func)
			return (new_node = func).apply(null, arguments);
	},
	//
	check_MathML = function() {
		var math_node = new_node({
			div : {
				span : 'normal'
			},
			S : 'line-height:1em;visibility:hidden'
		}, document.body);

		if (!math_node)
			return;

		new_node({
			math : {
				mfrac : [ {
					mi : 'test'
				}, {
					mi : 'MathML'
				} ]
			}
		}, math_node, 'mathml');

		// Firefox/37.0 不需要 setTimeout()。
		// setTimeout(check_MathML.check.bind(math_node), 0);
		// return check_MathML.check.call(math_node, true);

		return check_MathML.check.call(math_node);
	};

	// 2015/1/1: Firefox only. 僅 firefox 回傳 true。
	check_MathML.check = function(no_remove) {
		// library_namespace.debug(this);

		Object.defineProperty(_, 'support_MathML', {
			// method 1:
			// 分數 2/3 之 2 的 offsetTop 應該比 3 更高一點。
			// 但在 ff 中，沒有 .offsetTop。
			// var mfrac = this.lastChild.firstChild;
			// value : mfrac.firstChild.offsetTop < mfrac.lastChild.offsetTop;

			// method 2: 因為插入 <mfrac>，<div> 應該比一般單行文字更高一點。但在 Chrome，兩者本身即有差別。
			value : this.offsetHeight > this.firstChild.offsetHeight + 3
		});

		if (!_.support_MathML)
			library_namespace
					.debug('The browser does not support MathML. 您的瀏覽器不支援 MathML，或是 MathML 功能已被關閉。');
		if (no_remove !== true) {
			// library_namespace.remove_node(this);
			document.body.removeChild(this);
		}

		return _.support_MathML;
	};

	// assert: support MathML 也必定 support Object.defineProperty().
	Object.defineProperty(_, 'support_MathML', {
		configurable : true,
		get : check_MathML
	});

	// ----------------------------------------------------- //

	/**
	 * 以 MathML 表現數學運算式。<br />
	 * 將 HTML 中 &lt;math>expression&lt;/math> 皆轉為 MathML。<br />
	 * parse math expression & output MathML.<br />
	 * 
	 * TODO: calculator, vector, ℕℤℚℝℂ, ∈∉
	 * 
	 * @example <code>

	// <script>
	CeL.run([
		// for new_node()
		'interact.DOM', 'application.math' ], function() {
		CeL.application.math.convert_MathML();
	});

	// <html>
	<math>α=r×β</math><hr />
	<math>5%*6=30%</math><hr />
	<math>3*5/7</math><hr />
	<math>3*(5/7)</math><hr />
	<math>(4+5)/2</math><hr />
	<math>5^4*3+2-4^2/5</math><hr />
	<math>(a/b)/(c/d)</math><hr />
	<math>資本收入=資本收益率×資本</math><hr />
	<math>資本收入/國民年收入=資本收益率×(資本存量/國民年收入)</math><hr />
	<math>
	1/2+(1+2)/(2+3%)+((2+3))/((3+4))
	</math><hr />
	<math>
	43+(54+5*(3+4)/3)*2
	</math><hr />
	<math>x_2^4</math><hr />
	<math>x^2+y_1+z_12^34</math><hr />
	<math>
	x_2^4 = 3/2,   y = 4/3,   z = 5/4
	</math><hr />
	<math>
	x_2^4 = 3/2
	y = 4/3
	z = 5/4
	</math><hr />
	<math>4^(1/7)</math><hr />

	<math>√453</math><hr />
	<math>√4e</math><hr />
	<math>√-4e</math><hr />
	<math>√(4e+3)</math><hr />
	<math>∛45</math><hr />
	<math>x=1/√3</math><hr />

	<math>3&lt;4</math><hr />
	<math>log_4(45+2)</math><hr />
	<math>log_4 452</math><hr />
	<math>log_e 452</math><hr />
	<math>sin(π/2) = sin(pi/2) = sin(90°)</math><hr />
	<math>sin π/2 = (sin π)/2</math><hr />
	<math>sin(34π) = sin 34π</math><hr />
	<math>sin^-1(2π) = sin^-1 2π = sin^(-1)(2 pi)</math><hr />
	<math>log_4^2 452</math><hr />
	<math>log_4^2(34+2)</math><hr />
	<math>2e+3^2π+4π</math><hr />
	<math>-4e</math><hr />
	<math>(5+3)⁄(5-4)</math><hr />
	<math>7^(1/4) , 4√7</math><hr />
	<math>x_y^2 x^2+2^(1/3)^8+4^(1/7)^6</math><hr />
	<math>1+(b^2-4a c)^(1/5)</math><hr />
	<math>x=(-b±√(b^2-4a c))/2a</math><hr />
	<math>y=x(x^2-1)</math><hr />

	<math>(^2)Fe</math><hr />
	<math>(^12)C</math><hr />
	<math>(_6^12)C</math><hr />
	<math>(_6)C</math><hr />
	<math>(_2^1)x_4^3</math><hr />
	<math>(_2^1)x_4</math><hr />

	<math>P(A∪B)=P((A))+P((B))-P(A∩B)</math>
	<math>P(A|B)</math>


	// TODO:
	<math>{ a; b; c, d, e }</math><hr />
	<math>{{4, 5, 6}, {7, 8, 9}, {1, 2, 3}}×((3,4,5),(5,6,7),(7,8,9))</math><hr />
	<math>{{1,2},{3,4}}((5),(6))</math><hr />

	<math>x_y^2 x^2 2^(1/3)^8 4^(1/7)^6</math><hr />
	<math>(_(a+b))x</math><hr />

	munderover
	<math>∫_2^4 dy/dx</math><hr />

	// reference
	http://www.w3.org/TR/MathML/chapter3.html#id.3.1.3.2
	https://developer.mozilla.org/en-US/docs/Web/MathML/Element
	http://www.wolframalpha.com/examples/Math.html
	http://reference.wolfram.com/language/ref/format/MathML.html

	 * </code>
	 * 
	 * @see
	 */
	function convert_MathML(handler) {
		if (!library_namespace.remove_all_child)
			return;
		// assert: library_namespace.DOM is loaded.
		if (!_.support_MathML) {
			library_namespace.warn('The browser does not support MathML!');
			if (!library_namespace.is_WWW(true))
				return;
		}

		// MathML nodes
		var nodes = document.getElementsByTagName('math'), length = nodes.length, i = 0, node;

		if (!handler)
			handler = convert_MathML.handler['default'];
		else if (handler in convert_MathML.handler)
			handler = convert_MathML.handler[handler];

		for (; i < length; i++) {
			node = nodes[i];
			if (!_.support_MathML) {
				if (!node.title
						&& node.getAttribute(convert_MathML.default_attribute)) {
					// useless... Chrome 不會像 <span> 一般顯示 .title。
					node.setAttribute('title', node
							.getAttribute(convert_MathML.default_attribute));
				}
				continue;
			}

			if (false && typeof node.getAttribute !== 'function')
				return;

			var text;
			if (node.childNodes.length !== 1
					|| node.firstChild.nodeType !== document.TEXT_NODE
					//
					|| !(text = node.firstChild.nodeValue.trim()))
				continue;
			// temporary usage.
			var attribute = convert_MathML.default_attribute,
			//
			structure = node.getAttribute(attribute)
					|| node.getAttribute(attribute = 'title');
			if (structure) {
				// 當可以使用 <math> 時，把原先展示的內容物 .childNodes 轉而擺到 .title 去。
				// 使用例： <math alt="e^(-)" title="e-">電子</math>, <math alt="H_2
				// O" title="水 H2O">水分子</math>

				// 避免覆蓋原先的 .title。.title 通常擺更詳細的資訊。
				if (!node.getAttribute(attribute = 'title')) {
					node.setAttribute('title', text);
				}
				text = '\n' + structure;
			}
			if (!node.getAttribute('xmlns')) {
				node
						.setAttribute('xmlns',
								"http://www.w3.org/1998/Math/MathML");
			}
			// library_namespace.debug(node);

			structure = convert_MathML.parse(text);

			if (!structure[0]) {
				// 若是所有 children 都是等式，則將之括弧起來。
				var equalities = [ '{' ], j = 1, tmp;
				for (; j < structure.length; j++) {
					if (tmp = structure[j])
						if (Array.isArray(tmp)
								&& convert_MathML.RELATIONSHIP_PATTERN
										.test(tmp[0])) {
							equalities.push(tmp);
						} else if (typeof tmp !== 'string' || tmp.trim()) {
							equalities = null;
							break;
						}
				}
				if (equalities)
					structure = equalities;
			}

			structure = convert_MathML.reduce(structure, node, handler);
			// library_namespace.debug('convert_MathML: structure:');
			// library_namespace.debug(structure);
			library_namespace.remove_all_child(node);
			new_node(structure, node, 'mathml');
		}
	}

	_.convert_MathML = convert_MathML;

	convert_MathML.default_attribute = 'alt';

	convert_MathML.reduce_quote = function(operand) {
		var row = operand.mrow;
		if (!row || !Array.isArray(row) || row.length !== 3) {
			return operand;
		}
		var operator = row[0].mo + row[2].mo;
		if (operator === '{}' || operator === '()') {
			// assert: Array.isArray(row[1].mrow)
			return row[1];
		}
		return operand;
	};

	convert_MathML.handler = {
		// toString()
		// 運算元,運算子,運算元(操作符/算符/算子)
		string : function(operand_1, operator, operand_2) {
			if (!operator && Array.isArray(operand_1))
				return operand_1.join(' ');
			switch (operator) {
			case '()':
				return '(' + operand_1 + ')';

			case 'm':
				// 以表格呈現。
				operand_1.forEach(function(row, index) {
					operand_1[index] = '{' + row.join(',') + '}';
				});
			case '{}':
				return '{' + operand_1 + '}';

			case ',':
				return operand_1.join(',');
			case '{':
				return operand_1.join('\n');
			}
			return operand_1 + (operator || '') + (operand_2 || '');
		},

		mathml : function(operand_1, operator, operand_2) {
			if (!operator && Array.isArray(operand_1))
				return operand_1;

			switch (operator) {
			case '{}':
			case '()':
				if (typeof operand_1 !== 'object') {
					operand_1 = convert_MathML.parse_scalar(operand_1);

				} else if (!operand_1.mfrac && Array.isArray(operand_1)) {
					operand_1 = [ {
						mo : operator === '{}' ? '{' : '('
					}, {
						mrow : operand_1
					}, {
						mo : operator === '{}' ? '}' : ')'
					} ];
				} else if (false && !operand_1.mfrac) {
					// for !operand_1.mfrac: "(1/2)" → "1/2"
					operand_1 = {
						// deprecated MathML <mfenced> element
						mfenced : operand_1,
						separators : ''
					};
					if (operator === '{}') {
						operand_1.open = '{';
						operand_1.close = '}';
					}
				}
				return operand_1;

			case 'm':
				// 以表格呈現矩陣。
				operand_1.forEach(function(row, index) {
					row.forEach(function(expression, index) {
						row[index] = {
							mtd : expression
						};
					});
					operand_1[index] = {
						mtr : row
					};
				});
				operand_1 = {
					mfenced : {
						mtable : operand_1
					}
				};
				if (operand_2 !== '()')
					operand_1.open = '[', operand_1.close = ']';
				return operand_1;

			case '{':
				// 以表格呈現方程式組。
				operand_1.forEach(function(equality, index) {
					operand_1[index] = {
						mtr : {
							mtd : equality
						}
					};
				});
				return {
					mfenced : {
						mtable : operand_1
					},
					open : '{',
					close : ''
				};

			case ',':
			case ';':
				operand_2 = [];
				operand_1.forEach(function(expression) {
					operand_2.push(convert_MathML.parse_scalar(expression), {
						mo : operator
					});
				});
				operand_2.pop();
				return operand_2;

			case '/':
			case '⁄':
				// ↑ Fraction slash
			case '∕':
				// ↑ Division slash
				operand_1 = convert_MathML.parse_scalar(operand_1);
				operand_2 = convert_MathML.parse_scalar(operand_2);
				// "(1)/(2)" → "1/(2)"
				operand_1 = convert_MathML.reduce_quote(operand_1);
				// "(1)/(2)" → "(1)/2"
				operand_2 = convert_MathML.reduce_quote(operand_2);
				if (false) {
					if (operand_1.mfenced)
						// "(1)/(2)" → "1/2"
						operand_1 = convert_MathML
								.parse_scalar(operand_1.mfenced);
					if (operand_2.mfenced)
						// "(1)/(2)" → "1/2"
						operand_2 = convert_MathML
								.parse_scalar(operand_2.mfenced);
				}
				// <mfrac> <mi>numerator</mi> <mi>denominator</mi> </mfrac>
				/** {Boolean}分子或分母為分數 */
				var content_hass_fraction = operand_1.mfrac || operand_2.mfrac;
				operand_1 = {
					mfrac : [ operand_1, operand_2 ]
				};
				// 除了這些外，皆當作分數，上下表示。
				if (false && (operator === '⁄' || operator === '∕')) {
					// @deprecated: https://github.com/w3c/mathml/issues/29
					operand_1.bevelled = true;
				}
				if (false && content_hass_fraction) {
					// chrome 不支援 width : "150%"。支援 width : "10px"。
					operand_1.mfrac[0] = {
						mpadded : operand_1.mfrac[0],
						width : "2em",
						lspace : "1em"
					};
					operand_1.mfrac[1] = {
						mpadded : operand_1.mfrac[1],
						width : "2em",
						lspace : "1em"
					};
				}
				if (false && content_hass_fraction) {
					// chrome 的 width : "100%" 指螢幕寬度。
					operand_1.style = "width: 2em";
				}
				return operand_1;

			case '^':
				operand_1 = convert_MathML.parse_scalar(operand_1);
				operand_2 = convert_MathML.parse_scalar(operand_2);
				if (operand_2.mfenced)
					// 去除括號 "()"。
					// "7^(2/3)" → "<msup>7 2/3</msup>"
					operand_2 = convert_MathML.parse_scalar(operand_2.mfenced);
				if (Array.isArray(operand_2.mfrac)
						&& operand_2.mfrac[0].mn === 1) {
					// 去除 operand_1 之括號 "()"。
					if (operand_1.mfenced)
						operand_1 = convert_MathML
								.parse_scalar(operand_1.mfenced);
					// (operand_1) 的 (operand_2.mfrac[1]) 次方根。
					// "7^(1/3)" → "<mroot> 7 3 </mroot>"
					return {
						mroot : operand_1 ? [ operand_1, operand_2.mfrac[1] ]
								: operand_2.mfrac[1]
					};
				}
				return {
					// 依照規定必須要有<mi>，不可以省略。 e.g., (^12)C
					msup : [ operand_1 || {
						none : null
					}, operand_2 ]
				};

			case '√':
			case '∛':
				// 去除括號 "()"。
				// "√(1+2)" → "<msqrt>1+2</msqrt>"
				if (operand_1.mfenced)
					operand_1 = operand_1.mfenced;
				// (平)方根 / 立方根
				return operator === '√' ? {
					msqrt : operand_1
				} : {
					mroot : [ operand_1, {
						mn : 3
					} ]
				};
			}
			operand_1 = convert_MathML.parse_scalar(operand_1);
			if (!operator)
				return operand_1;
			operand_1 = [ operand_1, {
				mo : operator
			} ];
			if (operand_2)
				operand_1.push(convert_MathML.parse_scalar(operand_2));
			return operand_1;
		}
	};

	convert_MathML.handler['default'] = convert_MathML.handler.mathml;

	// relationships, assignment, equalities
	// https://en.wikipedia.org/wiki/Mathematical_operators_and_symbols_in_Unicode
	// https://zh.wikipedia.org/wiki/%E6%95%B0%E5%AD%A6%E8%BF%90%E7%AE%97%E7%AC%A6_(Unicode%E5%8C%BA%E6%AE%B5)
	// [≁-⊋]:
	// ≁≂≃≄≅≆≇≈≉≊≋≌≍≎≏≐≑≒≓≔≕≖≗≘≙≚≛≜≝≞≟≠≡≢≣≤≥≦≧≨≩≪≫≬≭≮≯≰≱≲≳≴≵≶≷≸≹≺≻≼≽≾≿⊀⊁⊂⊃⊄⊅⊆⊇⊈⊉⊊⊋
	// [⋀-⋭]: ⋀⋁⋂⋃⋄⋅⋆⋇⋈⋉⋊⋋⋌⋍⋎⋏⋐⋑⋒⋓⋔⋕⋖⋗⋘⋙⋚⋛⋜⋝⋞⋟⋠⋡⋢⋣⋤⋥⋦⋧⋨⋩⋪⋫⋬⋭
	// TODO: "~"
	convert_MathML.RELATIONSHIP_PATTERN = '=><≪≫∝≁-⊋⋀-⋭';

	// https://en.wikipedia.org/wiki/Plus_and_minus_signs#Character_codes
	convert_MathML.non_scalar_chars = '(){}^√∛*\\/⁄∕×⋅÷+\\-−±∓'
			+ convert_MathML.RELATIONSHIP_PATTERN + ',;\r\n';

	// operator : [ pattern, handler, object_to_add ]
	// 運算子優先順序最高到最低
	// [[w:en:Mathematical operators and symbols in Unicode]]
	(convert_MathML.operator = [
	// parentheses
	[ /\(([^()]+)\)/, function($0, $1) {
		return [ '()', $1 ];
	} ], [ /{([^{}]+)}/, function($0, $1) {
		return [ '{}', $1 ];
	} ], [ /\[([^[]]+)\]/, function($0, $1) {
		return [ '[]', $1 ];
	} ],
	// exponents.
	[ /(\S*)\^([+\-−±∓]?\S+)/, function($0, $1, $2) {
		// [ , base, power ]
		return [ '^', $1, $2 ];
	} ], [ /([√∛])([+\-−±∓]?\S+)/, function($0, $1, $2) {
		// [ , base, power ]
		return [ $1, $2 ];
	} ],
	// multiplication and fraction.
	[ /(\S+)([*\/⁄∕×⋅÷])(\S+)/, function($0, $1, $2, $3) {
		if ($2 === '*')
			$2 = '⋅';
		// [ , numerator, denominator ]
		return [ $2, $1, $3 ];
	} ],
	// addition and subtraction
	[ /(\S+)([+\-−±∓])(\S+)/, function($0, $1, $2, $3) {
		return [ $2, $1, $3 ];
	} ],
	// set theory
	// TODO: [[w:en:Ordered set operators]]
	[ /(\S+)([∪∩\|])(\S+)/, function($0, $1, $2, $3) {
		return [ $2, $1, $3 ];
	} ],
	// relationships, assignment, equalities
	[ new RegExp('(\\S+)([' + convert_MathML.RELATIONSHIP_PATTERN
	//
	+ '])(\\S+)'), function($0, $1, $2, $3) {
		// console.trace([ $0, $1, $2, $3 ]);
		return [ $2, $1, $3 ];
	} ],
	// terms
	[ /\S+(?:,\S+)+/, function($0) {
		($0 = $0.split(',')).unshift(',');
		return $0;
	} ],
	// terms
	[ /\S+(?:;\S+)+/, function($0) {
		($0 = $0.split(';')).unshift(';');
		return $0;
	} ] ])
	//
	.forEach(function(term) {
		// 不可用 'g'! e.g., 2+3-4+5
		term[0] = new RegExp(term[0].source.replace(/\\S/g, '[^'
				+ convert_MathML.non_scalar_chars + ']'), '');
		// library_namespace.debug(term[0]);
	});

	convert_MathML.RELATIONSHIP_PATTERN = new RegExp('^['
			+ convert_MathML.RELATIONSHIP_PATTERN + ']$');

	convert_MathML.process = function(text, order, queue) {
		library_namespace.debug('[' + text + '] (' + order + ')', 3,
				'convert_MathML.process');
		var changed, operator;
		while (true) {
			if (changed)
				changed = false;
			else if (!(operator = convert_MathML.operator[order++]))
				break;
			else {
				library_namespace.debug('shift to ' + operator[0], 3,
						'convert_MathML.process');
			}

			text = text.trim();
			text = text.replace(operator[0], function($0, $1, $2, $3) {
				// return [ type, text1, text2 ]
				var expression = operator[1]($0, $1, $2, $3);
				if (!expression) {
					library_namespace.error('convert_MathML.process: '
							+ "Cannot parse: '" + $0 + "'");
					return $0;
				}
				changed = true;

				// next order
				expression.forEach(function(term, index) {
					if (index > 0)
						expression[index] = convert_MathML.resolve(
								convert_MathML.process(term, order, queue),
								queue);
				});

				queue.push(expression);
				return (// queue.separator +
				queue.prefix
				// - 1: get the real index
				+ (queue.length - 1) + queue.postfix
				// + queue.separator
				);
			});
			library_namespace.debug('→ [' + text + ']', 3,
					'convert_MathML.process');
		}
		library_namespace.debug('return [' + text + ']', 3,
				'convert_MathML.process');
		return text;
	};

	// parse math expression.
	convert_MathML.parse = function(text, queue) {
		if (!queue) {
			queue = [];
			// assert: NOT space or operator.
			queue.prefix = '［';
			queue.postfix = '］';
			while (text.includes(queue.prefix))
				// 維持 open/close quote 相同的長度。
				queue.prefix += '［', queue.postfix = '］' + queue.postfix;
			while (text.includes(queue.postfix))
				queue.prefix += '［', queue.postfix = '］' + queue.postfix;
			// queue.separator = queue.prefix + queue.postfix;

			queue.pattern = '\\' + queue.prefix.split('').join('\\') + '(\\d+)'
			//
			+ '\\' + queue.postfix.split('').join('\\');

			// [ , index ]
			queue.index_pattern = new RegExp('^\\s*' + queue.pattern + '\\s*$');

			// [ , index || '' ]
			queue.pattern = new RegExp(queue.pattern + '|$', 'g');
		}

		// 前期處理。
		// TODO: °º⁺⁻⁼ ⁰¹²³⁴⁵⁶⁷⁸⁹⁽⁾ ±∓♥´ ₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎ ₐₑₒₓₔ½ ⅓⅔ ¼¾ ⅕⅖⅗⅘ ⅙⅚
		// ⅛⅜⅝⅞
		text = text.replace(/!=|<>/g, '≠').replace(/>=/g, '≥').replace(/<=/g,
				'≤').replace(/⅟/g, '1⁄')
		// ugly workaround for <math>a=1=1/1</math>
		.replace(/\r?\n?([=≠≥≤])/g, '\n$1');

		// TODO: &InvisibleTimes; 用於表示乘法運算中被省略的乘號。
		// https://zh.wikipedia.org/wiki/%E6%95%B0%E5%AD%A6%E7%BD%AE%E6%A0%87%E8%AF%AD%E8%A8%80#Presentation_MathML

		if (false) {
			text = text.replace(
			// 處理數學常數。
			// https://en.wikipedia.org/wiki/Mathematical_constant
			// 3^2π → 3^(2⋅π)
			/(\d+(?:\.\d+)?)\s*(pi|[a-z\u0370-\u03FF])([^\da-z\u0370-\u03FF]|$)/ig
			// TODO: &pi;
			, '($1⋅$2)$3');
		}

		text = convert_MathML.process(text, 0, queue);
		if (false) {
			library_namespace.debug('convert_MathML.parse: [' + text + ']');
			library_namespace.debug('convert_MathML.parse: queue [' + queue
					+ ']');
		}

		text = convert_MathML.resolve(text, queue);
		if (false) {
			library_namespace.debug('convert_MathML.parse: return [' + text
					+ ']');
			library_namespace.debug('convert_MathML.parse: queue [' + queue
					+ ']');
		}
		// console.trace(queue);
		return text;
	};

	// (?:[+\-−±∓]?\d+(?:\.\d+)?[°∘%％‰‱]?|pi|PI|Pi|[eiKπδφγλΩ∞ℵ])
	var PATTERN_numeric = /[+\-−±∓]?\d+(?:\.\d+)?[°∘%％‰‱]?/;
	// [ , 純數, 識別元 ]
	convert_MathML.PATTERN_numeric_prefix = new RegExp('^('
			+ PATTERN_numeric.source + ')([^\d].*)?$' + '$');
	convert_MathML.is_numeric_prefix = function(expression) {
		return expression.match(convert_MathML.PATTERN_numeric_prefix);
	};

	convert_MathML.PATTERN_numeric = new RegExp('^' + PATTERN_numeric.source
			+ '$');
	// 傳回 {Boolean}，說明運算式是否可做為數字來評估。
	convert_MathML.is_numeric = function(expression) {
		return convert_MathML.PATTERN_numeric.test(expression);
	};

	// 解開 queue index。
	// for: number, queue index, or the combination.
	convert_MathML.resolve = function(text, queue) {
		if (false) {
			library_namespace.debug('convert_MathML.resolve: [' + text + ']');
			library_namespace.debug('convert_MathML.resolve: queue ['
					+ queue.join(';') + ']');

			function is_index(token) {
				return token.startsWith(queue.prefix)
						&& token.endsWith(queue.postfix);
			}
		}

		var matched = text.match(queue.index_pattern);
		if (matched)
			return queue[matched[1]];

		if (convert_MathML.is_numeric(text))
			return text;

		library_namespace
				.debug('convert_MathML.resolve: Parse combinated expression: ['
						+ text + ']');
		var array = [ null ], lastIndex = 0, changed, matched;
		for (queue.pattern.lastIndex = 0;;) {
			matched = queue.pattern.exec(text);
			// 前導 text
			var pre_text = null;
			if (matched.index > lastIndex) {
				pre_text = text.substring(lastIndex, matched.index);
				if (/(?:^\s*[+\-−±∓]?|\s)\d+(?:\.\d+)?(?:\s|$)/.test(pre_text))
					// e.g., "log 3.3"
					changed = true, Array.prototype.push.apply(array, pre_text
							.split(/\s+/));
				else
					array.push(pre_text);
			}
			lastIndex = queue.pattern.lastIndex;

			// library_namespace.debug([ pre_text, matched[1], lastIndex ]);
			if (matched[1])
				changed = true, array.push(queue[matched[1]]);
			else {
				if (!changed && pre_text && convert_MathML.is_numeric(pre_text))
					changed = true;
				break;
			}
		}
		// if (changed) library_namespace.debug(array);
		return changed ? array : text;
	};

	// 處理純量與變數。
	convert_MathML.parse_scalar = function(text, no_MathML) {
		if (typeof text === 'object') {
			return !no_MathML && Array.isArray(text) ? {
				mrow : text
			} : text;
		}
		if (no_MathML)
			return text;

		if (!(text = String(text).trim()))
			return text;

		if (/\s/.test(text)) {
			text = text.split(/\s+/);
			// 多項。 e.g., "2a 3b 4ac"
			text.forEach(function(term, index) {
				text[index] = convert_MathML.parse_scalar(term);
			});
			return text;
		}

		var is_numeric = convert_MathML.is_numeric(text);
		// 純數。e.g., "1"
		if (is_numeric)
			return {
				mn : text
			};

		// 純數 + 識別元。e.g., "2a", "3.3π"
		if (is_numeric = convert_MathML.is_numeric_prefix(text))
			return [ {
				mn : is_numeric[1]
			}, convert_MathML.parse_scalar(is_numeric[2]) ];

		// 下標。e.g., "log_2"
		if (is_numeric = text.match(/^([^_]*)_([^_]+)$/))
			// <msub><mi>x</mi><mi>y</mi></msub>
			return {
				// 依照規定必須要有<mi>，不可以省略。 e.g., (_6)C
				msub : [ convert_MathML.parse_scalar(is_numeric[1]) || {
					// TODO: should use <none />
					none : null
				}, convert_MathML.parse_scalar(is_numeric[2]) ]
			};

		if (library_namespace.is_debug()
				&&
				// a-zA-Z: normal variable. 變量
				// \u0370-\u03ff: mathematical constant. 數學常數/希臘字母變量. e.g., π
				!/^[a-zA-Z\u0370-\u03ff∞ℵ\u2E80-\u30000][a-zA-Z\u0370-\u03ff∞ℵ\u2E80-\u30000\d]*$/
				// \u2E80-\u30000: Unihan variable
				.test(text)) {
			library_namespace
					.error("convert_MathML.parse_scalar: Cannot parse: '"
							+ text + "'");
		}

		// 純識別元。e.g., "x"
		return {
			mi : text
		};
	};

	// 將 convert_MathML.parse() 之結果，reduce 成所須的格式。
	convert_MathML.reduce = function(structure, node, handler) {
		function process_mprescripts(structure, postsuperscript) {
			if (!structure[0]
					&& Array.isArray(structure[1])
					&& structure[1][0] === '()'
					&& structure[2]
					// e.g., (_2), (_2^1), (_(a+b)), (_(a+b)^(c+d))
					&& (Array.isArray(matched = structure[1][1]) ? /^[^_]$/
							.test(matched[0])
							&& (!matched[1] || /^_/.test(matched[1]))
							: !matched || /^_/.test(matched))) {
				// <mprescripts />
				// https://developer.mozilla.org/zh-TW/docs/Web/MathML/Element/mmultiscripts
				// e.g., (_2^1)x, (_2^1)x_4^3, (_2^1)x_4^(3)
				var mmultiscripts = convert_MathML.reduce(structure[2], node,
						handler);
				if (!Array.isArray(mmultiscripts)) {
					if (mmultiscripts && Array.isArray(mmultiscripts.msub)) {
						mmultiscripts = mmultiscripts.msub;
						mmultiscripts.push(postsuperscript && {
							mi : postsuperscript
						} || {
							none : null
						});
					} else {
						mmultiscripts = [ mmultiscripts, {
							none : null
						}, {
							none : null
						} ];
					}
				}
				mmultiscripts.push({
					mprescripts : null
				});
				structure = structure[1][1];
				if (!Array.isArray(structure)) {
					structure = convert_MathML.reduce(structure, node, handler);
					if (structure && Array.isArray(structure.msub)) {
						structure = [ , structure.msub[1], structure.msub[0] ];
					}
				}

				// presubscript
				matched = convert_MathML.reduce(structure[1], node, handler);
				if (!matched) {
					matched = {
						none : null
					};
				} else if (Array.isArray(matched.msub)
						&& matched.msub.length === 2
						&& ('none' in matched.msub[0])) {
					matched = matched.msub[1];
				}

				mmultiscripts.push(
				// presubscript
				matched,
				// presuperscript
				convert_MathML.reduce(structure[2], node, handler));
				return {
					mmultiscripts : mmultiscripts
				};
			}
		}

		function operand_is_matrix(operand, index) {
			if (index === 0)
				// pass the operator
				return true;
			// 確認 array 型態相同。
			if (operand[0] !== structure[0])
				return false;

			// 確認 operand 為 array。
			if (Array.isArray(operand[1]) && operand[1][0] === ','
			// 確認 array 大小皆同。
			&& (!matrix.length || matrix[0].length === operand[1].length - 1)) {
				// e.g., {{1,2},{3,4}}
				var m = [];
				operand[1].forEach(function(expression, index) {
					if (index > 0)
						m
								.push(convert_MathML.reduce(expression, node,
										handler));
				});
				// assert: true === !![].push(0)
				return matrix.push(m);
			}

			// 確認 operand 為 array。
			if (typeof operand[1] !== 'object'
			// 確認 array 大小皆同。
			&& (!matrix.length || matrix[0].length === 1))
				// e.g., ((5),(6))
				return matrix.push([ operand[1] ]);

			if (library_namespace.is_debug()) {
				library_namespace.debug('array 型態'
						+ (operand[0] === structure[0] ? '相同' : '不同'));
				library_namespace.debug(Array.isArray(operand[1])
						&& operand[1][0] === ',' ? 'operand 為 array'
						: 'operand 為 '
								+ (Array.isArray(operand[1]) ? operand[1][0]
										: operand[1]));
				if (matrix[0])
					library_namespace.debug('array 大小: ' + matrix[0].length
							+ ' != ' + (operand[1].length - 1));
			}
		}

		// library_namespace.debug(structure);
		if (!Array.isArray(structure))
			return handler(structure);

		// structure = [ operator, operand_1, operand_2, .. ]

		if ((structure[0] in {
			'()' : true,
			'{}' : true,
			'[]' : true
		})
		// 矩陣。
		&& structure.length === 2 && Array.isArray(structure[1])
				&& structure[1][0] === ',') {
			var matrix = [], i = 0, length = structure[1].length;
			if (structure[1].every(operand_is_matrix))
				return handler(matrix, 'm', structure[0]);
		}

		// 前期處理。
		var matched;

		if (structure[0] === '^') {
			if (matched = process_mprescripts(structure[1], structure[2])) {
				return matched;
			}

			// e.g., sin^-1(2π)
			if (Array.isArray(structure[2]) && structure[2].length === 3
					&& !structure[2][0]) {
				structure[2][1] = [ '^', structure[1], structure[2][1] ];
				structure = structure[2];
			}
			// e.g., sin^-1 2π
			if (typeof structure[2] === 'string'
					&& (matched = structure[2]
							.match(/^([+\-−±∓]?\d+(?:\.\d+)?)\s+(\S+)$/))) {
				structure[2] = matched[1];
				structure = [ , structure, matched[2] ];
			}

		} else if (matched = process_mprescripts(structure)) {
			return matched;
		}

		// TODO: <munderover />, <math>∫_2^4 dy/dx</math>

		// need_preserve_quotes: e.g., <math>P((A))</math>
		var need_preserve_quotes = Array.isArray(structure[1])
				&& structure[0] === structure[1][0];
		structure.forEach(function(operand, index) {
			if (index > 0)
				structure[index] = convert_MathML
						.reduce(operand, node, handler);
		});
		return !need_preserve_quotes && structure[0] && !(structure[0] in {
			'{' : true,
			',' : true,
			';' : true
		}) ? handler(structure[1], structure[0], structure[2]) : handler(
				structure.slice(1), structure[0]);
	};

	return (_// JSDT:_module_
	);
}
