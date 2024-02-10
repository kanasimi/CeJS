/**
 * @name CeL function for source code.
 * @fileoverview 本檔案包含了處理 source code/text 的 functions。
 * @since
 */

// More examples: see /_test suite/test.js
'use strict';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'data.code',

	require : 'data.code.compatibility.'
	// .set_bind()
	+ '|data.native.',

	// 設定不匯出的子函式。
	// no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// nothing required

	/**
	 * null module constructor
	 * 
	 * @class 處理 source code 的 functions
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

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//

	// CamelCase to embedded_underscore/Snake case (underscore-based style) or
	// even hyphenated name
	function Camel_to_underscore(identifier, separator) {
		if (!separator)
			separator = '_';
		return identifier.replace(new RegExp('[\\' + separator + ']', 'g'),
				separator + separator).replace(/[A-Z]/g, function($0) {
			return separator + $0.toLowerCase();
		});
	}

	_.to_underscore = Camel_to_underscore;

	// underscore-based style to CamelCase
	function underscore_to_CamelCase(identifier, separator) {
		if (!separator)
			separator = '_';
		return identifier.replace(
				new RegExp('\\' + separator + '([a-zA-Z])', 'g'),
				function($0, $1) {
					return $1.toUpperCase();
				}).replace(new RegExp('[\\' + separator + ']{2}', 'g'),
				separator);

	}

	library_namespace.set_method(String.prototype, {
		to_underscore : library_namespace.set_bind(Camel_to_underscore),
		to_Camel : library_namespace.set_bind(underscore_to_CamelCase)
	});

	// @see to_hyphenated() @ interact.DOM

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//

	/**
	 * 類似 sprintf，處理 escape sequence 字串之 function。
	 * 
	 * TODO: http://numeraljs.com/
	 * 
	 * @example <code>
	 * 
	 * </code>
	 * 
	 * @param {String}string
	 *            欲格式化之字串 / source text.
	 * @param {Object|String|Function}[options]
	 *            附加參數/設定選擇性/特殊功能與選項: {<br />
	 *            {character}escape: escape character,<br />
	 *            {Object}escape_length: escape sequence length,<br />
	 *            {Function}handler: 處理 source text (非 escape sequence) 之
	 *            function,<br />
	 *            {Function}escape_handler: 處理 escape sequence 之 function.<br /> }
	 * 
	 * @returns {Array} source text list:<br />
	 *          [source text, escape sequence, source text, escape sequence, ..]
	 */
	function parse_escape(string, options) {
		var
		/**
		 * 搜索到匹配之部分。
		 */
		matched,
		/**
		 * 搜索之 pattern。
		 * 
		 * @type {RegExp}
		 */
		parse_RegExp,
		/**
		 * 下次檢索的起始點。
		 * 
		 * @type {Integer}
		 */
		last_index = 0,
		/**
		 * escape_character
		 * 
		 * @see <a href="http://en.wikipedia.org/wiki/Escape_character"
		 *      accessdate="2012/3/24 11:16" title="Escape character">escape
		 *      character</a>
		 * 
		 * @type {character}
		 */
		e_c = '\\',
		/**
		 * escape sequence length.<br />
		 * default: 1.<br />
		 * 為處理不定長 escape sequence. 這裡僅列出需要特別注意的。
		 * 
		 * @type {Object}
		 */
		e_l = {
			// TODO: [\d],
			u : 4,
			U : 8,
			x : 2
		},
		/**
		 * handle function.<br />
		 * 處理 source text (非 escape sequence) 之 function。
		 * 
		 * @type {Function}
		 */
		handler = undefined,
		/**
		 * Single Character Escape Sequences
		 * 
		 * !see https://en.wikipedia.org/wiki/Escape_sequences_in_C
		 * 
		 * @type {Object}
		 */
		escape_sequences = {
			u : to_char,
			U : to_char,
			x : to_char,
			// '"' : '\"', "'" : "\'", '\\' : '\\',
			b : '\b',
			t : '\t',
			n : '\n',
			v : '\v',
			f : '\f',
			r : '\r'
		},
		/**
		 * escape sequence handle function.<br />
		 * 處理 escape sequence 之 function.
		 * 
		 * @type {Function}
		 */
		e_s_handler = function(s, a) {
			library_namespace.debug(s + ': additional [' + a + '], ', 6);
			if (s in escape_sequences) {
				var f = escape_sequences[s];
				s = typeof f === 'function' ? f(s, a) : f;
			}
			return s;
		},
		/**
		 * 回傳之 source text list:<br />
		 * [source text, escape sequence, source text, escape sequence, ..]
		 * 
		 * @type {Array}
		 */
		source_text_list = [];

		/**
		 * Unicode to character.
		 * 
		 * @param {character}c
		 *            escape sequence 的種類: x, u, U, ..
		 * @param {String}x
		 *            hexadecimal digits /[\da-f]/i
		 * 
		 * @returns {character} character
		 */
		function to_char(c, x) {
			library_namespace.debug('U+' + x + ': ['
					+ String.fromCharCode(parseInt(x, 16)) + ']', 6);
			return String.fromCharCode(parseInt(x, 16));
		}

		/**
		 * 處理匹配之部分:<br />
		 * [source text, escape sequence]
		 * 
		 * @param {String}s
		 *            source text
		 * @param {String}e_s
		 *            escape sequence
		 */
		function handle_slice(s, e_s) {
			library_namespace.debug(last_index + ': [' + s + ']<em>|</em>'
					+ (e_s || ''), 6);
			if (s && handler)
				s = handler(s);
			if (e_s) {
				var l, e = '';
				if (e_s in e_l) {
					e = string.substr(last_index, l = e_l[e_s]);
					library_namespace.debug('(' + l + ') [' + e_s + e + ']', 6);
					parse_RegExp.lastIndex = (last_index += l);
				}
				if (e_s_handler)
					e_s = e_s_handler(e_s, e);
				else if (e !== '')
					e_s += e;
				source_text_list.push(s, e_s);
			} else if (s)
				source_text_list.push(s);
		}

		// 前置處理。
		if (typeof options === 'string')
			e_c = options;
		else if (typeof options === 'function')
			handler = options;
		else if (library_namespace.is_Object(options)) {
			if (typeof options.escape === 'string')
				e_c = options.escape;
			if (typeof options.escape_length === 'object')
				e_l = options.escape_length;
			if (typeof options.handler === 'function')
				handler = options.handler;
			if (typeof options.escape_handler === 'function')
				e_s_handler = options.escape_handler;
		}

		if (e_c.length !== 1)
			throw new Error('The escape character [' + e_c
					+ '] is not single character!');

		parse_RegExp = new RegExp('([\\s\\S]*?)\\' + e_c + '(.)', 'g');

		library_namespace.debug('[' + string + ']', 6);
		while (matched = parse_RegExp.exec(string)) {
			last_index = parse_RegExp.lastIndex;
			handle_slice(matched[1], matched[2]);
		}
		// 處理剩下未匹配之部分。
		handle_slice(string.slice(last_index));

		return handler ? source_text_list.join('') : source_text_list;
	}

	_// JSDT:_module_
	.parse_escape = parse_escape;

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//

	if (false) {
		'2A1B' === CeL.extract_literals('${a}A${b}B', {
			a : 2,
			b : 1
		});
	}

	/**
	 * 模仿樣板字面值（Template literals）
	 * 
	 * TODO: extract_literals('${ ({$:1})["$"] }')
	 * 
	 * @param {String}template_string
	 *            樣板字串（template strings）
	 * @param {Object}key_value_pairs
	 *            變數值 {key:value}
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
	 */
	function extract_literals(template_string, key_value_pairs, options) {
		if (library_namespace.gettext)
			template_string = library_namespace.gettext(template_string);

		template_string = template_string.replace_till_stable(/\${([^{}]+?)}/,
		//
		function(all, expression) {
			expression = expression.trim();
			if (expression in key_value_pairs) {
				return key_value_pairs[expression];
			}
			return all;
		});

		return template_string;
	}

	_// JSDT:_module_
	.extract_literals = extract_literals;

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//
	// TODO

	// format (escape sequence / conversion specifications) parser
	// functional keyword,
	function format_parser(escape_character, command_set, options) {
		if (typeof escape_character !== 'string' || !escape_character
				|| !library_namespace.is_Object(command_set))
			return;

		function get_pattern() {
			var pattern = [];
			for ( var i in command_set) {
				pattern.push(command_set[i] && command_set[i].pattern || i);
			}
			return pattern.join('|');
		}

		var search;
		if (options) {
			if (!library_namespace.is_Object(this.options = options))
				options = {
					search : options
				};
			search = options.search;
		} else
			this.options = false;

		if (!search) {
			// RegExp punctuators, reserved words
			escape_character = escape_character.replace(
					/([!?:.*+-^${}()\\\-\[\]])/g, '\\$1');
			search = new RegExp('((?:[^' + escape_character + ']+|'
					+ escape_character + '{2})+)(' + escape_character + ')('
					+ get_pattern() + ')', 'g');
		} else if (!library_namespace.is_type(search, 'RegExp')) {
			search = new RegExp(('' + search)
					.replace(/pattern/g, get_pattern()), 'g');
		}

		this.search = search;
		return format_parser.default_parser.bind(this);
	}

	// parser|parser array
	format_parser.default_parser = function(object, format, usage) {
		var search = this.search, command_set = this.command_set, options = this.options,
		// 處理整段 matched 的函數。
		parse_matched = options.parser,
		// 處理一般字串的函數。
		normal_parser = options.normal_parser,
		// main-loop 所需。
		matched, last_index = 0, command, result = [];

		// 為了 g 初始化. 或者設定 .lastIndex = 0 ?
		search.exec('');
		while (matched = search.exec(format)) {
			last_index = search.lastIndex;
			if (parse_matched)
				result.push(parse_matched.call(this, object, matched, usage));
			else {
				// matched = [matched slice (normal + escape sequence), normal,
				// escape character, format pattern, format command];
				// 處理一般字串。
				result.push(normal_parser ? normal_parser(object, matched[1],
						usage) : matched[1]);
				// 處理一般 format。
				command = matched[4] || matched[3];
				result.push(command in command_set ? command_set[command].call(
						object, matched[3]) : matched[2] + matched[3]);
			}
		}
		// 加入最後一段。
		matched = format.slice(last_index);
		result.push(normal_parser ? normal_parser(object, matched, usage)
				: matched);

		return result.join('');
	};
	format_parser.default_parser.constructor = format_parser;

	format_parser.prototype.concat = function(parser) {
		// TODO
		throw new Error(1,
				'format_parser.prototype.concat: Not Yet Implemented!');
	};

	format_parser.prototype.extend = function() {
		var new_parser = new format_parser(this);
	};

	function hex_to_Unicode() {
		// TODO
		throw new Error(1, 'hex_to_Unicode: Not Yet Implemented!');
	}

	if (false) {
		// backslash escape sequence parser
		var backslash_parser = new format_parser('\\', {
			u : {
				pattern : /[\da-z]{4}/i,
				handler : hex_to_Unicode
			},
			U : {
				pattern : /[\da-z]{8}/i,
				handler : hex_to_Unicode
			},
			x : {
				pattern : /[\da-z]{2}/i,
				handler : hex_to_Unicode
			},
			// '"' : '\"', "'" : "\'", '\\' : '\\',
			b : '\b',
			t : '\t',
			n : '\n',
			v : '\v',
			f : '\f',
			r : '\r'
		});

		// sprintf-like format parser. % conversion specifications
		var sprintf = new format_parser('%', {
			// 數字
			d : function() {
				return parseInt(this.valueOf());
			},
			s : function() {
				return String(this.valueOf());
			}
		}, {
			// replace '[.]'
			search : /%([+\-]?)(\d{0,3})(?:\.(\d{1,2}))([.])/,
			// pre-parser
			normal_parser : backslash_parser
		});

		var extend_sprintf = sprintf.extend('%', {
			// 數字
			z : function() {
			}

		}, {
			// replace '[.]'
			search : /%([+\-]?)(\d{0,3})(?:\.(\d{1,2}))([.])/
		});

	}

	function set_toString(Class, format_parser, special_condition) {
		if (!Class || typeof format_parser !== 'function')
			return;

		// 以指定 format 轉換 Class 之內容成 string。
		var old_toString = Class.prototype.toString;
		// format 用途：i18n|不同領域、不同產業採用不同 format
		Class.prototype.toString = function(format, usage) {
			if (!argument.length)
				return old_toString.call(this);
			if (typeof format === 'number' && special_condition)
				format = typeof special_condition === 'object' ? special_condition[format]
						: typeof special_condition === 'function' ? special_condition(format)
								: format;
			return format_parser.call(this, format, usage);
		};
		return old_toString;
	}

	if (false) {

		set_toString(Date, backslash_parser.extend('%', {
			// 完整年份(四位數的數字，如2000)
			Y : function() {
				return this.getFullYear();
			},
			// 月份 (1-12)。
			m : function() {
				return 1 + this.getMonth();
			}

		}, {
			search : /%([+\-]?)(\d{0,3})(?:\.(\d{1,2}))([.])/
		}));

		set_toString(Number);
		set_toString(library_namespace.quotient, backslash_parser.extend('%', {
			// numerator
			n : function() {
				return this.n;
			},
			// denominator
			d : function() {
				return this.d;
			}
		}, {
			search : /%([+\-]?)(\d{0,3})(?:\.(\d{1,2}))([.])/
		}));

	}

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//

	var is_controller = library_namespace.is_Object;

	// 處理非巢式嵌套格式處理器。
	// 2013/1/27 20:9:34
	function unnested_formatter(parameters, start, end) {
		var formatter = {
			start : typeof start === 'function' ? start : start ? function() {
				return start;
			} : function(values) {
				return values.join('');
			},
			parameters : parameters
		};
		if (typeof end === 'function')
			formatter.end = end;
		else if (end)
			formatter.end = function() {
				return end;
			};
		return unnested_formatter_convert.bind(formatter);
	}

	// 將改變 status，不改變 controller, parameters.
	function unnested_formatter_change_status(status, controller, _this,
			controller_is_status) {
		var type, value, parameter, parameter_result, changed_value = typeof _this.end === 'function' ? []
				: false, changed_to_value = [];

		for (type in controller)
			if ((value = controller[type]) !== undefined
					&& (parameter = _this.parameters[type])) {
				parameter_result = controller_is_status ? value
				//
				: typeof parameter === 'function' ? parameter(value, type)
						: parameter + value;
				if (parameter_result != status[type]) {
					// 僅處理有改變的值。
					changed_value && changed_value.push(type);
					changed_to_value.push(status[type] = parameter_result);
				}
			}

		// start
		parameter_result = changed_to_value.length ? _this
				.start(changed_to_value) : '';

		return changed_value && changed_value.length ?
		// close + start
		String(_this.end(changed_value)) + parameter_result
		// start only.
		: parameter_result;
	}

	function unnested_formatter_convert_Array(format_Array, _this, meta_status,
			item_processor) {
		var index = 0, length = format_Array.length, formatted_result = [], item,
		//
		status_now = Object.create(null),
		// 囤積的 controller。
		controller, cloned;

		if (meta_status)
			// duplicate meta_status.
			Object.assign(status_now, meta_status);

		for (; index < length; index++) {
			item = format_Array[index];
			// 先讓 item_processor 處理一下。
			if (item_processor && typeof item !== 'object')
				item = item_processor(item);

			if (is_controller(item)) {
				if (controller) {
					if (!cloned) {
						controller = cloned = Object.assign(
								Object.create(null), controller);
						// cloned = true;
					}
					Object.assign(controller, item);
				} else
					// 不直接 clone，減少 copy 次數。
					controller = item;

			} else {
				// 連續的 controller 只有在必要時（最後一個），才處理。
				if (controller) {
					formatted_result.push(unnested_formatter_change_status(
							status_now, controller, _this));
					controller = cloned = false;
				}

				// need test if item === null, undefined?
				formatted_result
						.push(Array.isArray(item) ? unnested_formatter_convert_Array(
								item, _this, status_now)
								: item);
			}
		}

		// 回復狀態至進入前。
		if (meta_status)
			formatted_result.push(unnested_formatter_change_status(status_now,
					meta_status, _this, true));

		return formatted_result.join('');
	}

	// front-end.
	function unnested_formatter_convert(format_structure, initial_controller,
			item_processor) {
		if (!Array.isArray(format_structure))
			return typeof format_structure === 'string' ? format_structure
					: format_structure || format_structure === 0 ? ''
							+ format_structure : '';

		return unnested_formatter_convert_Array(format_structure, this,
				initial_controller
						&& unnested_formatter_change_status(
								Object.create(null), initial_controller, this),
				typeof item_processor === 'function' && item_processor);
	}

	_.unnested_formatter = unnested_formatter;

	// ---------------------------------------------------------------------//

	/**
	 * create instence
	 * 
	 * @see<a href="http://docs.aegisub.org/manual/ASS_Tags"
	 *      accessdate="2012/4/21 13:16">ASS Tags - Aegisub Manual</a>, <a
	 *      href="http://www20.atwiki.jp/ass_advancedssa/" accessdate="2012/4/21
	 *      13:16">ASS(Advanced SubStation Alpha)@wiki - トップページ</a>
	 */
	var ass_tag = new unnested_formatter({
		italics : function(value) {
			return '\\i' + (value ? 1 : 0);
		},
		bold : function(value) {
			return '\\b' + (isNaN(value) ? value ? 1 : 0 : value);
		},
		underlined : function(value) {
			return '\\u' + (value ? 1 : 0);
		},
		// striked out
		striked : function(value) {
			return '\\s' + (value ? 1 : 0);
		},

		// Border size
		border : '\\bord',
		border_x : '\\xbord',
		border_y : '\\ybord',

		// TODO: shad,xshad,yshad,Blur edges,Letter spacing,Text rotation,Text
		// shearing,alpha,Karaoke effect,Wrap style,position,Movement,Rotation
		// origin,Fade,Animated transform,Clip,Drawing tags

		font_name : '\\fn',
		font_size : '\\fs',
		font_scale_x : '\\fscx',
		font_scale_y : '\\fscy',
		font_encoding : '\\fe',

		color : function(value) {
			return '\\1c&H' + value + '&';
		},
		border_color : function(value) {
			return '\\3c&H' + value + '&';
		},
		shadow_color : function(value) {
			return '\\4c&H' + value + '&';
		},

		// Line alignment:
		// 789
		// 456
		// 123
		align : '\\an'
	}, function(array) {
		return '{' + array.join('') + '}';
	});

	ass_tag.reduce = function(tag) {
		return tag && typeof tag === 'string' ? tag.replace(/}{\\/g, '\\')
				.replace(/{[^{}]+\\r([}\\])/g, '{\\r$1').replace(
						/(\n[^{}\n]*){\\r}/g, '$1').replace(
						/\s*{\\r}(\s*\r?\n)/g, '$1').replace(
						/(\\r}[^{]*){\\r}/g, '$1').replace(
						/(\\r}[^{]*){\\r\\/g, '$1{') : tag;
	};

	_.ass_tag = ass_tag;

	// test: "{\1c&HEEFFEE&}colored text"
	// var tag = CeL.ass_tag([ { color : 'EEFFEE' }, 'colored text' ]);

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//

	/**
	 * 字串摘要。
	 * 
	 * @param {String}string
	 *            字串 / message / text
	 * @param {Object|Number}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @returns {String}字串摘要。
	 */
	function string_digest(string, options) {
		if (typeof options === 'number' || typeof options === 'string'
				&& options >= 1) {
			options = {
				slice : options
			};
		} else {
			options = library_namespace.setup_options(options);
		}

		if (typeof string !== 'string') {
			if (Array.isArray(string)) {
				return string.map(function(text) {
					return string_digest(text, options);
				});
			}

			// String(string);
			string = '' + string;
		}

		var trim_slice_length = options.slice >= 1 ? Math.floor(options.slice)
				: 20;
		/** {String}刪節符號 */
		var ellipsis = options.ellipsis || '...';
		if (string.length < 2 * trim_slice_length
				+ (ellipsis + ' (' + trim_slice_length + ')').length) {
			return string;
		}

		return string.slice(0, trim_slice_length) + ellipsis
				+ string.slice(-trim_slice_length) + ' (' + string.length + ')';
	}

	_.string_digest = string_digest;

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//
	// https://en.wikipedia.org/wiki/Tree_traversal
	// traversal algorithm

	// @see traversal_DOM_backward() @ CeL.interact.DOM
	function traversal(start_node, action, options) {
		TODO;

		// no for_node action: just get {Array}list
		action = function(node) {
			return exit;
		};
		options = {
			// https://en.wikipedia.org/wiki/Depth-first_search
			// pre-order, in-order and post-order depth-first traversal
			// https://en.wikipedia.org/wiki/Breadth-first_search
			type : 'breadth',
			// direction: forward, backward
			backward : true,
			start_node_is_root : true,
			terminate_node : node,
			// get next node
			next_node : function(node_now, index, parent) {
				return node;
			},
			filter : function(node) {
				return true;
			},
			// final action
			last : function() {
			}
		};
	}

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//

	// e.g., '123', '-123', '+12.34', '-.123'
	var PATTERN_number_string = /^[+\-]?(?:\d{1,20}(?:\.\d{1,20})?|\.\d{1,20})$/,
	// 這些值將會被轉換為所指定的值，一如以 JSON.parse() or ecal() 解析所得。
	value_conversion = {
		'true' : true,
		'false' : false,

		'Infinity' : Infinity,
		'infinity' : Infinity,

		'null' : null,
		'undefined' : undefined
	};

	function convert_string(value) {
		value = value.replace(
				/\\(.)|(.)/g,
				function(all, escaped_character, character) {
					if (character)
						return character === '"' ? '\\"' : all;
					return /^["\\\/bfnrtu]$/.test(escaped_character) ? all
							: escaped_character;
				}).replace(/^'|'$/g, '"');
		value = value.replace(/\t/g, '\\t');
	}

	// @see function JSON_parse(text, reviver) @ CeL.data.code.compatibility
	function to_JS_value(value/* , options or reviver */) {
		if (false) {
			library_namespace.log('to_JS_value: eval(' + value + ')');
			console.trace(value);
			return eval(value);
		}

		// options = library_namespace.setup_options(options);

		if (typeof value !== 'string')
			return value;

		value = value.trim();

		if (value in value_conversion) {
			// 若是有必要將之當作字串值，必須特地加上引號。
			return value_conversion[value];
		}

		if (PATTERN_number_string.test(value)) {
			// treat as number
			return +value;
		}

		// 去掉絕對不會是 JS native value。如此可以避免 throw。
		if (!/^["'{\[]/.test(value))
			return value;

		try {
			return JSON.parse(value);
		} catch (e) {
			// TODO: handle exception
		}
		return value;
	}

	_.to_JS_value = to_JS_value;

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//

	return (_// JSDT:_module_
	);
}
