/**
 * @name CeL function for console
 * @fileoverview 本檔案包含了 console 操作用的 functions。<br />
 *               a.k.a. BBS ANSI color 轉換程式
 * @since 2015/3/1 13:16:6
 * @example <code>

 * </code>
 * @see
 */

if (false)
	CeL.run('interact.console', function() {
		var ansi = new CeL.interact.console.SGR('0123456789');
		// CeL.set_debug(3);

		CeL.assert([ '0123456789', ansi.text ]);

		CeL.log('set style {Object}');
		ansi.style_at(3, {
			bold : true,
			fg : 32,
			// blue background : 44
			bg : 'blue'
		});

		CeL.log('Test @ 3');
		CeL.assert([ 2, ansi.style_at(3, true).foreground ]);
		CeL.assert([ '1;32;44', ansi.style_at(3, true).toString(false) ]);
		CeL.assert([ undefined, ansi.style_at(4, true) ]);
		CeL.assert([ ansi.style_at(3).toString(false),
		//
		ansi.style_at(4).toString(false) ]);

		CeL.log('set style alias');
		ansi.style_at(5, 'fg=紫');

		CeL.log('Test @ 5');
		CeL.assert([ 4, ansi.style_at(5).background ]);
		CeL.assert([ 'blue',
				CeL.interact.console.SGR.color[ansi.style_at(5).background] ]);

		CeL.log('set style multi-alias');
		ansi.style_at(7, '5;-bold');

		CeL.assert([ true, ansi.style_at(8).blink ], '(8).blink');
		CeL.assert([ false, ansi.style_at(9).bold ], '(9).bold');

		CeL.log('Test all');
		//CeL.assert([ '\x1b[m', ansi.get_style() ]);

		// Not Yet Implemented!
		// ansi.to_HTML(style_mapping);
		// ansi.toJSON(style_mapping);

		CeL.info('All test OK.');
	});

'use strict';
if (typeof CeL === 'function')
	CeL.run({
		name : 'interact.console',
		// includes() @ data.code.compatibility.
		require : 'data.code.compatibility.',
		code : function(library_namespace) {

			/**
			 * null module constructor
			 * 
			 * @class console 處理的 functions
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

			function SGR_style_name(style_name) {
				library_namespace.debug('Search style name [' + style_name
						+ '] in SGR_code.style_name_alias', 3);
				if (typeof style_name !== 'object'
						&& (style_name in SGR_code.style_name_alias))
					style_name = SGR_code.style_name_alias[style_name];
				if (library_namespace.is_debug()
						&& (typeof style_name === 'object'
						//
						|| !(style_name in SGR_code.style_data)))
					library_namespace.warn('Unknown style name: [' + style_name
							+ ']');
				return style_name;
			}

			function SGR_style_value(style_value, style_name) {
				if (typeof style_value !== 'object'
						&& (style_value in SGR_code.color_index)) {
					if (typeof style_name !== 'string'
							|| !(style_name in color_shift)) {
						library_namespace.warn(
						// Expects value in
						// color_shift.
						'Illegal name of color: [' + style_name + '].');
						return;
					}
					// color_shift[style_name] +
					return SGR_code.color_index[style_value];
				}

				if (style_value === 'true')
					style_value = true;
				else if (style_value === 'false')
					style_value = false;

				if (typeof style_value === 'boolean') {
					if ((style_name in SGR_code.style_data)
							&& SGR_code.style_data[style_name][style_value ? 0
									: 1] === undefined) {
						library_namespace.warn('Illegal value [' + style_value
								+ '] of style: [' + style_name
								+ ']: boolean value not setted.');
						return;
					}
					return style_value;
				}

				if (isNaN(style_value) || (style_value |= 0) < 0) {
					library_namespace.warn('Illegal value [' + style_value
							+ '] of style: [' + style_name
							+ ']: value is not number.');
					return;
				}

				// do more check.
				if ((style_name in SGR_code.style_data)
						&& !SGR_code.style_data[style_name]
								.includes(style_value))
					if (style_name in color_shift) {
						if (style_value >= color_shift[style_name])
							style_value -= color_shift[style_name];
					} else {
						library_namespace.warn('Illegal value [' + style_value
								+ '] of style [' + style_name
								+ ']: value does not @ '
								+ SGR_code.style_data[style_name] + '.');
						return;
					}

				return style_value;
			}

			function is_reset_style(style) {
				return style === 0 || style === '0';
			}

			function SGR_style_add(style) {
				if (!style && !is_reset_style(style))
					// skip.
					return;

				library_namespace.debug('Search style (' + (typeof style)
						+ ') [' + style
						//
						+ '] in SGR_code.style_value_alias', 3);
				if (typeof style !== 'object')
					while (style in SGR_code.style_value_alias) {
						library_namespace.debug('Find style [' + style
								+ '] → [' + SGR_code.style_value_alias[style]
								+ ']', 3);
						style = SGR_code.style_value_alias[style];
					}

				library_namespace.debug('parse (' + (typeof style) + ') ['
						+ style + '] if it is a pure value.', 3);
				if (typeof style === 'string')
					if (style.includes(SGR_code.separator))
						style = style.split(SGR_code.separator);

					else if (isNaN(style)) {
						library_namespace.debug('test if [' + style
								+ '] is "[+-] style name".', 3);
						var matched = style.match(/^([+-])\s*([^\s].*)$/);
						if (matched
								&& (matched[2] = SGR_style_name(matched[2]
										.trim()))) {
							if (matched[2] in color_shift)
								library_namespace.warn(
								// Expects integer.
								'Illegal configuration of style: ['
										+ matched[2] + '].');
							else {
								library_namespace.debug('Set style "'
										+ matched[2] + '" = '
										+ (matched[1] === '+') + '.', 3);
								this[matched[2]] = matched[1] === '+';
							}
							return this;
						}

						library_namespace.debug('test if [' + style +
						//
						'] is "style name = style value (0,1,false,true,..)".',
								3);
						matched = style.match(/^([^=]+)=(.+)$/);
						if (matched
								&& (matched[1] = SGR_style_name(matched[1]
										.trim()))) {
							if (undefined !== (matched[2] = SGR_style_value(
									matched[2].trim(), matched[1])))
								this[matched[1]] = matched[2];
							return this;
						}

						// 死馬當活馬醫。
						style = SGR_style_name(style);
					} else
						style |= 0;
				else if (typeof style === 'number')
					style |= 0;

				library_namespace.debug('parse (' + (typeof style) + ') ['
						+ style + '] if it is a object.', 3);
				if (library_namespace.is_Object(style)) {
					Object.keys(style).some(
							function(style_name) {
								var style_value = style[style_name];
								if (!(style_name = SGR_style_name(style_name)))
									// 已於 SGR_style_name() 警告過。
									return;

								style_value = SGR_style_value(style_value,
										style_name);
								if (style_value !== undefined) {
									library_namespace.debug('Set ['
											+ style_name + '] = ['
											+ style_value + '].', 3);
									this[style_name] = style_value;
								} else if (is_reset_style(style_value)) {
									library_namespace.debug('reset style ('
											+ (typeof style) + ') [' + style
											+ '].', 3);
									this.to_reset();
									return true;
								}
							}, this);

				} else if (Array.isArray(style)) {
					style.forEach(function(value) {
						this.add(value);
					}, this);

				} else if (30 <= style && style <= 37) {
					this.foreground = style;
				} else if (40 <= style && style <= 47) {
					this.background = style;
				} else if (is_reset_style(style)) {
					library_namespace.debug('reset style (' + (typeof style)
							+ ') [' + style + '].', 3);
					this.to_reset();
				} else if (library_namespace.is_debug()) {
					library_namespace.warn('Unknown style: [' + style + ']');
				}

				return this;
			}

			function SGR_style(style, options) {
				if (false)
					if (library_namespace.is_Object(options))
						this.options = options;
				library_namespace.debug('Set style [' + style + ']', 2);
				this.add(style);
				library_namespace.debug('Set style [' + style + '] finished.',
						3);
			}

			var color_shift = {
				foreground : 30,
				background : 40
			};

			Object.assign(SGR_style.prototype, {
				add : SGR_style_add,
				forEach : function(callback, thisArg) {
					// 下面當前不使用。
					if (false) {
						var style_names = Object.keys(this);
						if (this.options)
							// remove 'options'
							// key 很多的話，應該用 delete + 去除
							// blank.
							style_names.splice(style_names.indexOf('options'),
									2);
						style_names.forEach(callback, thisArg || this);
					}

					Object.keys(this).forEach(callback, thisArg || this);
				},

				to_reset : function() {
					library_namespace.debug('reset style.', 2,
							'SGR_style.prototype.to_reset');
					this.forEach(function(style_name) {
						delete this[style_name];
					});
					this.reset = true;
					return this;
				},
				clone : function(options) {
					library_namespace.debug('clone [' + this + '].', 2,
							'SGR_style.prototype.clone');
					var result = new SGR_style();
					this.forEach(function(style_name) {
						result[style_name] = this[style_name];
					});
					if (false)
						if (options = options || this.options)
							result.options = options;
					return result;
				},

				to_Array : function() {
					var array = [];
					if (library_namespace.is_debug(3))
						library_namespace.debug('style [' + Object.keys(this)
								+ ']', 1, 'SGR_style.prototype.to_Array');
					if (false)
						for ( var name in this)
							library_namespace.debug('[' + name + ']', 3);
					this.forEach(function(style_name) {
						var value = this[style_name];
						library_namespace.debug('style "' + style_name + '" ['
								+ SGR_code.style_data[style_name] + '] = ('
								+ (typeof value) + ') [' + value + ']', 3,
								'SGR_style.prototype.to_Array');
						if (style_name in color_shift) {
							if (value < color_shift[style_name])
								// 正常情況。
								value += color_shift[style_name];
						} else if (typeof value !== 'number')
							// 正常情況。
							value = SGR_code.style_data[style_name]
							// 0: on, 1: off.
							[value ? 0 : 1];
						if (typeof value === 'number')
							array.push(value);
						// else: e.g., reset.
					});
					library_namespace.debug('style array [' + array + ']', 3,
							'SGR_style.prototype.to_Array');
					array.sort();
					library_namespace.debug('sorted style array [' + array
							+ ']', 2, 'SGR_style.prototype.to_Array');
					return array;
				},
				// (): use default CSI
				// (false): No CSI
				toString : function(CSI, end_code) {
					var code = this.to_Array().join(SGR_code.separator);
					library_namespace.debug('code [' + code + ']', 2,
							'SGR_style.prototype.toString');
					if (CSI || CSI === undefined)
						code = (CSI || SGR_code.CSI) + code
								+ (end_code || SGR_code.end_code);
					return code;
				}
			});

			/**
			 * cf. String.prototype.split ( separator, limit )
			 * 
			 * @returns [ {SGR_code} ]
			 */
			function SGR_split(separator, limit) {
				// TODO
				throw new Error('Not Yet Implemented!');
			}

			/**
			 * cf. String.prototype.slice ( start, end )
			 * 
			 * @returns {SGR_code}
			 */
			function SGR_slice() {
				var result = new SGR_code(this.text.split(start, end));
				result.style = this.style.split(start, end);
				result.style.forEach(function(style, index) {
					result[index] = result[index].clone();
				});
				return result;
			}

			/**
			 * 會改變 this!<br />
			 * cf. Array.prototype.concat ( ...arguments )
			 * 
			 * @param {String|SGR_code}value
			 * @returns {SGR_code}
			 */
			function SGR_concat(value) {
				var index = 0, length = argument.length,
				//
				text = [ this.text ], value;
				for (; index < length; index++)
					if (is_SGR_code(value = argument[index])) {
						// treat as {SGR_code}
						text = text.join('');
						this.style.forEach(function(style, index) {
							this.style[text.length + index] = style;
						}, this);
						text = [ text, value.text ];
					} else if (value)
						// treat as {String}
						text.push(value);
				this.text = text.join('');
			}

			/**
			 * @param {String}string
			 *            text
			 * @returns {SGR_code}
			 */
			function SGR_parse(string) {
				// TODO
				throw new Error('Not Yet Implemented!');
			}

			/**
			 * get / set SGR style.
			 * 
			 * @param {integer}index
			 * @param {Object|String|Boolean}style
			 * @param {integer}to_index
			 * 
			 * @returns {SGR_style}
			 */
			function SGR_style_at(index, style, to_index) {
				index |= 0;
				if (style === true)
					return this.style[index];

				var style_now;
				library_namespace.debug('start 遍歷 to ' + index, 2);
				this.style.some(function(this_style, this_index) {
					if (this_index > index)
						return true;

					library_namespace.debug('遍歷 to index ' + this_index, 3);
					if (style_now) {
						// TODO: reduce
						style_now.add(this_style);
					} else
						style_now = this_style.clone();
				});

				if (!style_now)
					style_now = new SGR_style();

				if (style) {
					library_namespace.debug('設定 style of "' + this.text + '"['
							+ index + '] = [' + style + ']', 2);
					if (!this.style[index])
						this.style[index] = style_now;
					style_now.add(style = new SGR_style(style));

					library_namespace.debug('設定 to_index', 2);
					if (index < to_index) {
						// TODO: 更有效率點。
						while (index < to_index)
							if (this.style[index]) {
								var inter_style = this.style[index];
								delete inter_style.reset;
								style.forEach(function(style_name) {
									// 覆寫設定。
									delete inter_style[style_name];
								})
							}
					}
				} else if (is_reset_style(style))
					this.style[index] = style_now.add(0);

				return style_now;
			}

			function SGR_style_to_String(get_Array) {
				var sequence = this.text.split('');
				this.style.forEach(function(style, index) {
					sequence[index] = style.toString() + sequence[index];
				}, this);
				return get_Array ? sequence : sequence.join('');
			}

			function is_SGR_code(value) {
				return value instanceof SGR_code;
			}

			/**
			 * ANSI escape code (or escape sequences)
			 * 
			 * @param {String}string
			 *            text
			 * @param {Object}options
			 *            options : { CSI : '' }
			 * @returns
			 * 
			 * @see <a
			 *      href="https://en.wikipedia.org/wiki/ANSI_escape_code#graphics"
			 *      accessdate="2015/3/1 8:1" title="ANSI escape code (or escape
			 *      sequences)"><span title="Select Graphic Rendition">SGR
			 *      </span> parameters</a><br />
			 *      <a href="http://vt100.net/docs/vt510-rm/SGR"
			 *      accessdate="2015/3/1 8:1">SGR—Select Graphic Rendition</a>
			 */
			function SGR_code(string, options) {
				if (false)
					if (typeof options === 'string')
						options = {
							CSI : options
						};
				if (library_namespace.is_Object(options))
					this.options = options;

				// 標準化 / normalization
				this.text = String(string);

				// {inner}private properties
				// style[ index ] = new SGR_style();
				this.style = [];
			}

			Object.assign(SGR_code.prototype, {
				// SGR_style_to_HTML(style_mapping)
				// to_HTML : SGR_style_to_HTML,
				// toJSON : SGR_style_to_JSON,

				// style : SGR_style,
				slice : SGR_slice,
				// split : SGR_split,
				concat : SGR_concat,

				style_at : SGR_style_at,
				get_style : SGR_style_to_String

			});

			/**
			 * ECMA-48 8.3.117 SGR - SELECT GRAPHIC RENDITION<br />
			 * 為允許使用者參照，因此放在 public。
			 */
			SGR_code.style_data = {
				// name : [ on, off ]
				// reset / normal
				reset : [ 0, ],
				// bold or increased intensity (bright / highlight / 高亮)
				bold : [ 1, 22 ],
				// faint, decreased intensity or second colour
				faint : [ 2, 22 ],
				// singly underlined (mono only)
				underline : [ 4, 24 ],
				// blink / 閃爍
				// 5: slowly blinking less then 150 per minute,
				// 6: rapidly blinking
				blink : [ 5, 25 ],
				// negative / positive image (反白, reverse type)
				reverse : [ 7, 27 ],
				// concealed characters (invisible image) 隱瞞,隱匿,隱蔽,隱藏來源
				conceal : [ 8, 28 ],
				// display (text color, foreground color, 文字部份前景色):
				// 30–37
				foreground : [ , 39 ],
				// background color (背景色/底色): 40–47
				background : [ , 49 ],
				// Overlined / Not overlined
				overline : [ 53, 55 ]
			};

			/**
			 * style name alias<br />
			 * 為允許使用者添增，因此放在 public。
			 */
			SGR_code.style_name_alias = {
				normal : 'reset',
				bright : 'bold',
				highlight : 'bold',
				hidden : 'conceal',
				text : 'foreground',
				color : 'foreground',
				fg : 'foreground',
				bg : 'background'
			};

			/**
			 * style value alias<br />
			 * 為允許使用者添增，因此放在 public。
			 */
			SGR_code.style_value_alias = {};
			// SGR_code.color_index.black = 0
			SGR_code.color_index = {};
			(SGR_code.color = 'black,red,green,yellow,blue,magenta,cyan,white'
					.split(',')).forEach(function(color, index) {
				SGR_code.color_index[color] = index;
			});
			// 鎖定物件。
			Object.seal(SGR_code.color);

			// 使中文亦可使用。
			'黑紅綠黃藍紫青白'.split('').forEach(function(color, index) {
				SGR_code.color_index[color] = index;
			});

			// alias of number
			(function() {
				for ( var property in SGR_code.style_data) {
					var value = SGR_code.style_data[property];
					if (typeof value[0] === 'number')
						SGR_code.style_value_alias[value[0]] = '+' + property;
					if (typeof value[1] === 'number')
						SGR_code.style_value_alias[value[1]] = '-' + property;
				}
			})();
			// 鎖定物件。
			Object.seal(SGR_code.style_data);

			Object.assign(SGR_code, {
				parse : SGR_parse,

				/**
				 * {String} Control Sequence Introducer, or Control Sequence
				 * Initiator.<br />
				 * "\x1b" : [Esc]<br />
				 * some BBS: 按 Esc 兩次, '\x1b\x1b['。
				 */
				CSI : '\x1b[',
				separator : ';',
				end_code : 'm'
			});

			_.SGR = SGR_code;

			return (_// JSDT:_module_
			);
		}

	});
