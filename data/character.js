/**
 * @name CeL function for character encoding
 * @fileoverview 本檔案包含了文字/字元編碼用的 functions。文字コード変換ライブラリ
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
			// Buffer.from('編碼');
		}
		return result.join('');
	}

	// =============================================================================================
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
		shiftjis : 'Shift_JIS',
		sjis : 'Shift_JIS'
	},
	// coding map / config hash for decoding specified coding to Unicode.
	// map_set[encoding_name]
	// = [ config, [1 byte map], [2 byte map], [3 byte map], [4 byte map] ]
	map_set = Object.create(null),
	// encoding Unicode to specified coding
	// encode_map_set[encoding_name]
	// = {Unicode_char:char_code}
	encode_map_set = Object.create(null),
	/** {String}REPLACEMENT CHARACTER U+FFFD, '?' in old IE */
	UNKNOWN_CHARACTER = '�', UNKNOWN_CHARACTER_CODE = UNKNOWN_CHARACTER
			.codePointAt(0);

	// _.map_set = map_set;

	function normalize_encoding_name(encoding) {
		encoding = String(encoding).trim();
		return code_of_alias[encoding.toLowerCase().replace(/[-_ ]+/g, '')]
				|| encoding;
	}

	function encoding_is_loaded(encoding) {
		return normalize_encoding_name(encoding) in map_set;
	}

	_.is_loaded = encoding_is_loaded;

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
	 *            encoding name
	 * @param {Object}map_data
	 */
	function add_code_map(code_name, map_data) {
		library_namespace.debug(code_name, 1, 'add_code_map');
		var encoding = normalize_encoding_name(code_name);
		if (!(encoding in code_of_alias)) {
			code_of_alias[encoding] = code_name;
		}

		if (!map_set[encoding]) {
			// 不重新設定，以允許多次設定。
			map_set[encoding] = [];
		}
		var code_map = map_set[encoding], config = code_map,
		// main_encode_map[Unicode character]
		// = {ℕ⁰:Natural+0}code of specified coding
		main_encode_map = encode_map_set[encoding]
				|| (encode_map_set[encoding] = Object.create(null));
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
					if (main_encode_map[character]) {
						library_namespace.debug(code_name
						// http://founder.acgvlyric.org/iu/doku.php/%E9%80%A0%E5%AD%97:%E5%BA%8F_%E5%B8%B8%E7%94%A8%E9%A6%99%E6%B8%AF%E5%A4%96%E5%AD%97%E8%A1%A8
						+ ': character mapping ['
						// 除了少數幾個特殊的字之外，其他大部分都對應到後來指定的字碼。
						+ character + ']: 0x'
						// @see data/character/Big5.js
						+ main_encode_map[character].toString(16).toUpperCase()
						// e.g., "包" should be A55D in Big5, not FABD
						+ ' → 0x'
						// "者" should be AACC in Big5, not 8ECD
						+ char_code.toString(16).toUpperCase(),
						//
						2, 'add_code_map');
					}
					// register
					main_encode_map[character] = char_code;

					// 為了能辨識，無論哪種都還是得設定這個對應 to Unicode。
					main_map[char_code++] = character;
				});
				continue;
			}

			if (!Array.isArray(char_list)) {
				library_namespace.error('Not Array: '
						+ JSON.stringify(char_list));
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
						// register
						main_encode_map[character] = char_code;
						main_map[char_code++] = character;
					});
					last_char_code = char_list.at(-1).codePointAt(0);
					return;
				}

				if (!(last_char_code >= 0) || !(slice > 0)) {
					throw new Error('Invalid character of code map: '
							+ code_name + '.' + base_byte_code + '.' + slice);
				}

				// console.log([last_char_code, slice]);
				var end = last_char_code + slice;
				while (last_char_code < end) {
					// register
					var character = String.fromCodePoint(++last_char_code);
					main_encode_map[character] = char_code;
					main_map[char_code++] = character;
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

		// resources need to load
		var resources_path_list = [];

		encoding_list.forEach(function(encoding) {
			if (!(encoding in map_set)) {
				resources_path_list.push(library_namespace.get_module_path(
						module_name, encoding + '.js'));
			}
		})

		if (resources_path_list.length === 0) {
			callback && callback();
			return true;
		}

		if (resources_path_list.length === 1) {
			resources_path_list = resources_path_list[0];
		}
		library_namespace.debug(resources_path_list, 1, 'load_code_map');
		library_namespace.run(resources_path_list, callback);
	}

	_.load = load_code_map;

	// ===============================================================

	// String.prototype.encode(), string.encode()
	function String_to_code(encoding, options) {
		encoding = normalize_encoding_name(encoding);

		// 4: 保險用，幾乎都夠用，卻仍舊不能保證。
		var buffer = Buffer.allocUnsafe(4 * this.length), index = 0,
		// main_encode_map[Unicode character]
		// = {ℕ⁰:Natural+0}code of specified coding
		main_encode_map = encode_map_set[encoding],
		//
		start_byte_code = map_set[encoding]
				&& map_set[encoding].start_byte_code;

		if (!main_encode_map) {
			throw new Error('Unknown encoding: ' + encoding
					+ '. You may need to ' + module_name + '.load("' + encoding
					+ '") first?');
		}

		// TODO: 對於不是以character分割，以及雙/多位元卻是0x0000的情況需要特別處理（這裡會被當作0x00而非0x0000）!
		this.chars(true).forEach(function(character) {
			var code = character.charCodeAt(0);
			if (code < start_byte_code) {
				buffer[index++] = code;
				return;
			}

			var _i = code = (main_encode_map[character]
			//
			|| UNKNOWN_CHARACTER_CODE) | 0, end = index;
			// 8: 0x100=2^8
			while ((_i >>= 8) > 0) {
				end++;
			}
			_i = end;
			while (true) {
				buffer[_i] = code % 0x100;
				if (--_i < index) {
					break;
				}
				code >>= 8;
			}
			index = end + 1;
		});

		// assert: buffer.length >= index
		return buffer.slice(0, index);
	}

	// ===============================================================

	if (library_namespace.platform.nodejs) {
		// Buffer.prototype.to_UTF8;
		// Buffer.prototype.to_Big5;
		// Buffer.prototype.to_EUC_JP;

		// cache original Buffer.prototype.toString
		Buffer.prototype.native_toString = Buffer.prototype.toString;
		/** @deprecated */
		if (false) {
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
		}

		// 把 Buffer 物件的內容當作是 encoding 編碼，並解析成 {String}UTF-8 string。
		Buffer.prototype.toString = function Buffer_toString(encoding, options) {
			try {
				// buffer.toString(null) will throw!
				return this.native_toString(encoding);
			} catch (e) {
				// TypeError [ERR_UNKNOWN_ENCODING]: Unknown encoding: gbk
				// console.trace(e);
			}

			// 有錯誤直接丟出去。
			return code_array_to_String.call(this, /* charset */encoding,
					options);
		};

		// TODO: use StringDecoder
	}

	if (false) {
		CeL.run('data.character');
		CeL.character.load('Big-5', function() {
			console.assert('作輩' === Buffer.from('A740BDFA', 'hex').toString(
					'Big-5'));
			var text = '做基本檢測。';
			console.assert(text === text.encode('Big_5').toString('Big 5'));
		});
	}

	// assert: this = [ byte_code, byte_code, ... ]
	function code_array_to_String(encoding, options) {
		// check if we can convert the encoding.
		encoding = normalize_encoding_name(encoding);
		var code_map = map_set[encoding];
		if (!code_map) {
			// Unknown encoding: e.
			// You may need to run CeL.data.character.load("e") first?
			throw new Error('Unknown encoding: ' + encoding
					+ '. You may need to run ' + module_name + '.load("'
					+ encoding + '") first?');
		}
		// console.trace(code_map);

		var code_index = 0,
		// converted result
		converted = '';
		for (var start_byte_code = code_map.start_byte_code, reminder = 0, max_byte = code_map.length,
		// main loop to decode to default inner encoding (Unicode).
		byte_index = 0, length = this.length; byte_index < length; byte_index++) {
			if (code_index === 0) {
				reminder = this[byte_index];
				if (reminder < start_byte_code) {
					converted += String.fromCharCode(reminder);
					continue;
				}
			} else {
				reminder = reminder * 0x100 + this[byte_index];
			}

			if (++code_index === max_byte) {
				// 自這次搜尋開始，無法找到能mapping的character。
				converted += UNKNOWN_CHARACTER;
				// rollback至自這次搜尋開始後的下一個byte。
				byte_index -= code_index - 2;
				// reset
				reminder = code_index = 0;
				continue;
			}

			var map_single = code_map[code_index];
			if (false) {
				library_namespace.debug('Test ' + code_index + ' bytes: '
						+ reminder.toString(HEX_BASE), 6,
						'code_array_to_String');
				if (map_single) {
					library_namespace.debug(map_single.slice(Math.max(0,
							reminder - 9), reminder + 9), 9,
							'code_array_to_String');
				}
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

	function Array_to_String(encoding, options) {
		var array = this.map(function(byte, index) {
			// 做基本檢測。
			if (typeof byte === 'string' && byte.length === 1) {
				byte = byte.charCodeAt(0);
			}
			if (typeof byte === 'number' && 0 <= byte && byte < 0x100
					&& ((byte | 0) === byte)) {
				return byte;
			}
			throw new Error('Invalid byte: [' + index + '] ' + byte);
		});

		return code_array_to_String.call(array, encoding, options);
	}

	library_namespace.set_method(Array.prototype, {
		decode : Array_to_String
	});

	library_namespace.set_method(String.prototype, {
		encode : String_to_code,
		// assert: /^[\x00-\xFF]*$/i.test(this)
		decode : function decode_as_byte_String(encoding, options) {
			if (false && !/^[\x00-\xFF]*$/i.test(this)) {
				throw new Error('Invalid byte: [' + index + '] ' + byte);
			}
			// use Array_to_String()
			return this.split('').decode(encoding, options);
		}
	});

	// ---------------------------------------------------------------

	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
	// /^[*\-._0-9A-Za-z]$/
	var PATTERN_has_URI_component_invalid_character = /[^a-zA-Z0-9\-_.!~*'()]/;
	// _.PATTERN_has_URI_component_invalid_character =
	// PATTERN_has_URI_component_invalid_character;
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI
	var PATTERN_has_URI_invalid_character = /[^a-zA-Z0-9;,/?:@&=+$\-_.!~*'()#]/;
	// _.PATTERN_has_URI_invalid_character = PATTERN_has_URI_invalid_character;

	/**
	 * @see https://www.w3.org/TR/html5/forms.html#url-encoded-form-data
	 */
	var encode_URI_component_base_map = [];
	// " "→"+"
	encode_URI_component_base_map[0x20] = '+';
	(function() {
		for (var code = 0x2A; code < 0x7A; code++) {
			var character = String.fromCharCode(code);
			if (!PATTERN_has_URI_component_invalid_character.test(character)) {
				encode_URI_component_base_map[code] = character;
			}
		}
	})();

	/**
	 * 
	 * @param {String}string
	 * @param [encoding]
	 * @returns
	 */
	function encode_URI_component(string, encoding) {
		if (!encoding || /^UTF-?8$/i.test(encoding)) {
			// fallback: native methods are faster
			return encodeURIComponent(string);
		}
		// charset
		encoding = normalize_encoding_name(encoding);

		if (false) {
			// for pure Big5, no 香港增補字符集
			string = string.replace(/[―喰蔃瀞靝鼗弌鍮蠏覩瑨牐]/g, function(char) {
				return '&#' + char.charCodeAt(0) + ';';
			});
		}

		var encoded = '';
		string.encode(encoding).forEach(function(byte) {
			encoded += byte in encode_URI_component_base_map
			//
			? encode_URI_component_base_map[byte]
			//
			: '%' + byte.toString(0x10).toUpperCase();
		});
		return encoded;
	}

	_.encode_URI_component = encode_URI_component;

	function encode_URI(string, encoding) {
		if (!encoding || /^UTF-?8$/i.test(encoding)) {
			// fallback: native methods are faster
			return encodeURI(string);
		}
		// charset
		encoding = normalize_encoding_name(encoding);

		var encoded = '';
		string.encode(encoding).forEach(function(byte) {
			encoded += (byte in encode_URI_component_base_map)
			//
			&& !PATTERN_has_URI_invalid_character.test(byte)
			//
			? encode_URI_component_base_map[byte]
			//
			: '%' + byte.toString(0x10).toUpperCase();
		});
		return encoded;
	}

	_.encode_URI = encode_URI;

	/**
	 * @see http://qiita.com/weal/items/3b3ddfb8157047119554
	 *      http://polygon-planet-log.blogspot.tw/2012/04/javascript.html
	 */
	function decode_URI_component(encoded, encoding) {
		if (!encoding || /^UTF-?8$/i.test(encoding)) {
			// fallback
			return decodeURIComponent(encoded);
		}
		// charset
		encoding = normalize_encoding_name(encoding);

		var string = '', buffer = [], PATTERN = /%([\dA-F]{2})|[\s\S]/ig, matched, code;
		while (matched = PATTERN.exec(encoded)) {
			if (matched[1]) {
				buffer.push(parseInt(matched[1], 0x10));
			} else if ((matched = matched[0]) === '+') {
				// "+"→" "
				buffer.push(0x20);
			} else if ((code = matched.charCodeAt(0)) < 0x100) {
				buffer.push(code);
			} else {
				if (buffer.length > 0) {
					string += code_array_to_String.call(buffer, encoding);
					buffer.length = 0;
				}
				string += matched;
			}
		}

		if (buffer.length > 0) {
			string += code_array_to_String.call(buffer, encoding);
		}
		return string;
	}

	_.decode_URI_component = decode_URI_component;
	// https://www.geeksforgeeks.org/difference-between-decodeuricomponent-and-decodeuri-functions-in-javascript/
	// decodeURI(): It takes encodeURI(url) string so it cannot decoded
	// characters (, / ? : @ & = + $ #)
	// TODO: decodeURI("%26") === "%26" && decodeURIComponent("%26") === "&"
	_.decode_URI = decode_URI_component;

	// ---------------------------------------------------------------

	return (_// JSDT:_module_
	);
}
