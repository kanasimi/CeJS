/**
 * @name CeL function for character encoding
 * @fileoverview 本檔案包含了文字/字元編碼用的 functions。
 * 
 * @example <code>
 * CeL.run('data.character',function(){
 * 	// ..
 * });
 * </code>
 * 
 * @since 2017/1/22 22:38:52
 * 
 * @see [[en:binary-to-text encoding]], [[en:character encoding]]
 */

'use strict';
// 'use asm';

// --------------------------------------------------------------------------------------------

typeof CeL === 'function' && CeL.run({
	// module name
	name : 'data.character',

	// for String.prototype.chars()
	require : 'data.native.',

	// 設定不匯出的子函式。
	no_extend : 'add_map',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	var module_name = this.id;

	/**
	 * null module constructor
	 * 
	 * @class 處理編碼的 functions
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

	// TODO
	function Base64(text) {
		var index = 0, length = text.length, result = [];
		for (; index < length; index++) {
			// new Buffer('編碼');
		}
		return result.join('');
	}

	// -------------------------------------------------------------------------
	// character encoding 字元編碼

	var
	/** {Natural}base of 16 bit */
	HEX_BASE = 0x10,
	// 取得正式名稱。預先設定以供load_code_map()使用。
	// [經過normalize_encoding_name(encoding)之前期處理的key]
	// = module/file name below data/encoding/
	code_of_alias = {
		big5 : 'Big5',
		gbk : 'GBK',
		// 因為以實用性為主，因此全部導向到擴張至最大的最新字碼。
		gb2312 : 'GBK',
		eucjp : 'EUC-JP',
		shiftjis : 'Shift_JIS'
	},
	// encoding config hash. map_set[encoding_name]
	// = [ config, [1 byte map], [2 byte map], [3 byte map], [4 byte map] ]
	map_set = library_namespace.null_Object(),
	/** {String}REPLACEMENT CHARACTER U+FFFD */
	UNKNOWN_CHARACTER = '�';

	function normalize_encoding_name(encoding) {
		encoding = String(encoding).trim();
		return code_of_alias[encoding.toLowerCase().replace(/[-_ ]+/g, '')]
				|| encoding;
	}

	/**
	 * <code>

	encoding.map.json規格書:包含map:
	{
		// to single byte / 2 or multi bytes set, continuous, split by /./u:
		start_char_code_in_hex:'map',
		// ** deprecated: to single byte / 2 bytes set, continuous, .split('split string'):
		start_char_code_in_hex:['map', 'split string'],
		// ** deprecated: 2 bytes set, .split('split string'):
		start_char_code_in_hex:[start of second byte, 'map', 'split string'],
		// ** deprecated: .split(''):
		start_char_code_in_hex:[start of second byte, 'map', ''],
		// ** deprecated: split by /./u:
		start_char_code_in_hex:[start of second byte, 'map'],
		// ** deprecated: convert single code to single string
		start_char_code_in_hex:['map', 0],
		// 這邊的count表示中間有count個字元，分別是自char開始，unicode編碼之後的序列。
		start_char_code_in_hex:['char', {Natural}count, 'char', {Natural}count],
	}

	e.g.,
	// split by .chars(true)
	{'A180':[0x80,'~~~~~~'],'A4B3':'##'}
	// .split('')
	{'A180':[0x80,'~~~~~~', ''],'A4B3':['#,#',',']}

	to_multi的不能跨越to_single的範圍。
	e.g.,
	{'A1FF':[0xFF,'abcde'],'A2FF':'12','A4B3':'~'}
	'A2FF','A4B3': 不在'A1FF'範圍內: A1FF:a, A2FF:b, A3FF:c, ...
	實作將直接以+1的方式配入 convert_map 中，因此A2FF之第二組"2"將被配入A300!

	</code>
	 * 
	 * @see [[en:character encoding]]
	 *      https://github.com/ashtuchkin/iconv-lite/tree/master/encodings/tables
	 */

	/**
	 * 
	 * @param {String}code_name
	 * @param {Object}map_data
	 */
	function add_code_map(code_name, map_data) {
		library_namespace.debug(code_name, 1, 'add_code_map');
		var encoding = normalize_encoding_name(code_name);
		if (!(encoding in code_of_alias)) {
			code_of_alias[encoding] = code_name;
		}

		var code_map = map_set[encoding] = [], config = code_map;
		// console.log(Object.keys(map_data));
		for ( var key in map_data) {
			var char_list = map_data[key], matched = key
					.match(/^_?([\dA-F]+)$/i);
			// console.log([ key, matched, char_list ]);
			if (!matched) {
				// console.log(key);
				// config?
				code_map[key] = char_list;
				continue;
			}

			var base_byte_code = matched[1],
			//
			char_code = parseInt(base_byte_code, HEX_BASE),
			//
			main_map = Math.ceil(base_byte_code.length / 2);
			main_map = code_map[main_map]
			// initialize 稀疏矩陣。
			|| (code_map[main_map] = []);

			if (typeof char_list === 'string') {
				char_list.chars(true).forEach(function(character) {
					main_map[char_code++] = character;
				});
				continue;
			}

			if (!Array.isArray(char_list)) {
				library_namespace
						.err('Not Array: ' + JSON.stringify(char_list));
				throw new Error('Invalid character code map: ' + code_name
						+ '.' + base_byte_code);
			}

			// start_first_byte
			if (!('start_byte_code' in config)) {
				if (char_code === 0 && char_list[0] === '\u0000'
						&& char_list[1] > 0) {
					char_list.shift();
					// e.g., ['\0',2] → byte code < 2+1 的都能直接轉string。
					config.start_byte_code = char_list.shift() + 1;
				} else {
					config.start_byte_code = 0;
				}
			}

			// console.log(char_list);
			var last_char_code;
			char_list.forEach(function(slice, index) {
				if (typeof slice === 'string') {
					char_list = slice.chars(true);
					char_list.forEach(function(character) {
						main_map[char_code++] = character;
					});
					last_char_code = char_list[char_list.length - 1]
							.codePointAt(0);
					return;
				}

				if (!(last_char_code >= 0) || !(slice > 0)) {
					throw new Error('Invalid character of code map: '
							+ code_name + '.' + base_byte_code + '.' + slice);
				}

				// console.log([last_char_code, slice]);
				var end = last_char_code + slice;
				while (last_char_code < end) {
					main_map[char_code++] = String
							.fromCodePoint(++last_char_code);
				}
			});
		}
	}

	_.add_map = add_code_map;

	function load_code_map(encoding_list, callback) {
		if (!Array.isArray(encoding_list)) {
			encoding_list = [ encoding_list ];
		}

		encoding_list = encoding_list.map(normalize_encoding_name);

		// resource need to load
		var resource_path_list = [];

		encoding_list.forEach(function(encoding) {
			if (!(encoding in map_set)) {
				resource_path_list.push(library_namespace.get_module_path(
						module_name, encoding + '.js'));
			}
		})

		if (resource_path_list.length === 0) {
			callback && callback();
			return true;
		}

		if (resource_path_list.length === 1) {
			resource_path_list = resource_path_list[0];
		}
		library_namespace.debug(resource_path_list, 1, 'load_code_map');
		library_namespace.run(resource_path_list, callback);
	}

	_.load = load_code_map;

	// ---------------------------------------------------------------

	// TODO
	// encode()
	function String_to_code(encoding) {
		encoding = normalize_encoding_name(encoding);

		;
	}

	// ---------------------------------------------------------------

	if (library_namespace.platform.nodejs) {
		// Buffer.prototype.to_UTF8;
		// Buffer.prototype.to_Big5;
		// Buffer.prototype.to_EUC_JP;

		Buffer.prototype.native_toString = Buffer.prototype.toString;
		/** @deprecated */
		Buffer.prototype.toString = function deprecated_Buffer_toString(
				encoding) {
			var endoding_error;
			try {
				return this.native_toString(encoding);
			} catch (e) {
				endoding_error = e;
			}

			try {
				return code_array_to_String.call(this, encoding);
			} catch (e) {
				// throw e;
				throw endoding_error;
			}
		};

		Buffer.prototype.toString = function Buffer_toString(encoding) {
			try {
				return this.native_toString(encoding);
			} catch (e) {
			}

			// 有錯誤直接丟出去。
			return code_array_to_String.call(this, encoding);
		};
	}

	if (false) {
		CeL.run('data.character');
		CeL.character.load('Big-5', function() {
			console.assert('作' === Buffer.from([ 0xA7, 0x40 ])
					.toString('Big-5'));
		});
	}

	// assert: this = [ byte_code, byte_code, ... ]
	function code_array_to_String(encoding) {
		// check if we can convert the encoding.
		encoding = normalize_encoding_name(encoding);
		var code_map = map_set[encoding];
		if (!code_map) {
			throw new Error('Unknown encoding: ' + encoding
					+ '. You may need to ' + module_name + '.load("' + encoding
					+ '") first?');
		}
		// console.log(code_map);

		var start_byte_code = code_map.start_byte_code,
		// converted result
		converted = '', reminder = 0, code_index = 0;
		for (var byte_index = 0, length = this.length; byte_index < length; byte_index++) {
			if (code_index === 0) {
				reminder = this[byte_index];
				if (reminder < start_byte_code) {
					converted += String.fromCharCode(reminder);
					continue;
				}
			} else {
				reminder = reminder * 0x100 + this[byte_index];
			}

			if (++code_index === code_map.length) {
				// 自這次搜尋開始，無法找到能mapping的character。
				converted += UNKNOWN_CHARACTER;
				// rollback至自這次搜尋開始後的下一個byte。
				byte_index -= code_index - 2;
				// reset
				reminder = code_index = 0;
				continue;
			}

			var map_single = code_map[code_index];
			library_namespace.debug('Test ' + code_index + ' bytes: '
					+ reminder.toString(HEX_BASE), 6, 'code_array_to_String');
			if (map_single) {
				library_namespace
						.debug(map_single.slice(Math.max(0, reminder - 9),
								reminder + 9), 9, 'code_array_to_String');
			}
			if (map_single && (reminder in map_single)) {
				// find
				converted += map_single[reminder];
				// reset
				reminder = code_index = 0;
			}
		}

		if (code_index > 0) {
			converted += UNKNOWN_CHARACTER;
		}

		return converted;
	}

	// ---------------------------------------------------------------

	function Array_to_String(encoding) {
		var array = this.map(function(byte, index) {
			// 做基本檢測。
			if (typeof byte === 'string' && byte.length === 1) {
				byte = byte.charCodeAt(0);
			}
			if (typeof byte === 'number' && 0 <= byte && bute < 0x100
					&& (byte | 0 === byte)) {
				return byte;
			}
			throw new Error('Invalid byte: [' + index + '] ' + byte);
		});

		return code_array_to_String.call(array, encoding);
	}

	library_namespace.set_method(Array.prototype, {
		decode : Array_to_String
	});

	library_namespace.set_method(String.prototype, {
		encode : String_to_code,
		// e.g., ''
		decode : function decode_as_byte_String(encoding) {
			// use Array_to_String()
			return this.split('').decode(encoding);
		}
	});

	return (_// JSDT:_module_
	);
}
