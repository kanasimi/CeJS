// node generate.js

/*


 2017/1/11 16:15:36
 [[en:character encoding]]


 先以generate_original_map();生成original_map.txt
 以各種編碼轉換original_map.txt


 encoding.map.json規格書:包含map:
 {
 // to single byte / 2 bytes set, continuous, split by /./u:
 start_char_code_in_hex:'map',
 // to single byte / 2 bytes set, continuous, .split('split string'):
 start_char_code_in_hex:['map', 'split string'],
 // 2 bytes set, .split('split string'):
 start_char_code_in_hex:[start of second byte, 'map', 'split string'],
 // .split(''):
 start_char_code_in_hex:[start of second byte, 'map', ''],
 // split by /./u:
 start_char_code_in_hex:[start of second byte, 'map'],
 // convert single code to single string
 start_char_code_in_hex:['map', 0],
 // 從start_char_code_in_hex開始持續，共count個字元，unicode與原編碼都有一對一對應，自char開始。
 start_char_code_in_hex:['char', {Natural}count],
 }

 e.g.,
 // split by .chars()
 {'A180':[0x80,'~~~~~~'],'A4B3':'##'}
 // .split('')
 {'A180':[0x80,'~~~~~~', ''],'A4B3':['#,#',',']}

 to_multi的不能跨越to_single的範圍。
 e.g.,
 {'A1FF':[0xFF,'abcde'],'A2FF':'12','A4B3':'~'}
 'A2FF','A4B3': 不在'A1FF'範圍內: A1FF:a, A2FF:b, A3FF:c, ...
 實作將直接以+1的方式配入 convert_map 中，因此A2FF之第二組"2"將被配入A300!


 */

'use strict';

// Load CeJS library and modules.
require('../../_for include/node.loader.js');
CeL.run([
// Add color to console messages. 添加主控端報告的顏色。
'interact.console',
// for string.chars()
'data.native' ]);

/** node.js file system module */
var node_fs = require('fs'), new_line = '\n', HEX_BASE = 0x10,
// 1バイト目
start_char_code_1 = 0x80 - 2, end_char_code = 0x100 - 1,
// 2バイト目: 起始必須跳過 \n, \t。
start_char_code_2 = 0x20,
// REPLACEMENT CHARACTER U+FFFD
UNKNOWN_CHARACTER = '�',
// 這應該是個轉換前後不會變化，且不會被納入其他字元組中的字元。
padding_character = '\t',
//
original_map_file = 'original_map.txt';

console.assert(padding_character.length === 1);
console.assert(8 <= padding_character.charCodeAt(0)
		&& padding_character.charCodeAt(0) < 0x40 && padding_character !== '?'
		&& padding_character !== ' ');

// generate_original_map();

// parse_converted('Big5.txt');
// parse_converted('EUC-JP.txt');
// parse_converted('GBK.txt');
// parse_converted('Shift_JIS.txt');

// array_vs_charAt();

if (process.argv[2]) {
	parse_converted(process.argv[2]);
} else {
	generate_original_map();
}

// --------------------------------------------------------------------------------------

/**
 * @see http://jsperf.com/charat-vs-array/7
 *      http://stackoverflow.com/questions/5943726/string-charatx-or-stringx
 *      https://www.sitepoint.com/javascript-fast-string-concatenation/
 */
function array_vs_charAt() {
	var array = [];
	for (var i = 0; i < 0x80 * 0x80; i++) {
		array.push(String.fromCharCode(13000 + 42000 * Math.random() | 0));
	}
	var string = array.join(''), length = array.length, result, text_length = 1e7;
	console.assert(length === string.length);

	result = [];
	console.time('array→array');
	for (var i = 0; i < text_length; i++) {
		result.push(array[length * Math.random() | 0]);
	}
	result = result.join('');
	console.log(result.slice(0, 20));
	console.timeEnd('array→array');

	result = [];
	console.time('string→array');
	for (var i = 0; i < text_length; i++) {
		result.push(string.charAt(length * Math.random() | 0));
	}
	result = result.join('');
	console.log(result.slice(0, 20));
	console.timeEnd('string→array');

	result = '';
	console.time('array→string');
	for (var i = 0; i < text_length; i++) {
		result += array[length * Math.random() | 0];
	}
	console.log(result.slice(0, 20));
	console.timeEnd('array→string');

	result = '';
	console.time('string→string');
	for (var i = 0; i < text_length; i++) {
		result += string.charAt(length * Math.random() | 0);
	}
	console.log(result.slice(0, 20));
	console.timeEnd('string→string');

	// node.js 7.4.0 一般測試最快的是 'array→string'
}

function to_hex(char) {
	if (typeof char === 'string') {
		return char.chars().map(function(c) {
			return to_hex(c.codePointAt(0));
		});
	}
	// assert: {Natural}char code
	return char.toString(HEX_BASE).toUpperCase();
}

// --------------------------------------------------------------------------------------

// TODO: 將如padding_character,start_char_code_2之類的設定儲存在original_map_file中。
function parse_converted(file_path) {
	var code_lines = node_fs.readFileSync(file_path, 'utf8')
	// remove BOM
	.trimLeft().split(new_line), last_char_code = start_char_code_1 - 1, last_char_count = end_char_code
			- start_char_code_2 + 1, line = code_lines[code_lines.length - 1];
	if (line.replace(/\r$/, '') === '') {
		code_lines.pop();
	}
	if (code_lines.length === end_char_code - start_char_code_1 + 1) {
		CeL.log(file_path + ': ' + code_lines.length + ' lines');
	} else {
		CeL.warn(file_path + ': ' + code_lines.length + ' lines (should be '
				+ (end_char_code - start_char_code_1 + 1) + ')');
	}

	var convert_map = CeL.null_Object(), last_map_key, last_key, last_convert_to;
	function add_map(hex_key, convert_to, single) {
		if (last_map_key) {
			if (hex_key
					&& !single
					&& (last_map_key.length === hex_key.length
							// 檢測last_key的下一個是否為hex_key
							&& (parseInt(hex_key, HEX_BASE)
									- parseInt(last_key, HEX_BASE) === 1)
					// hex_key為首個byte。
					|| hex_key.charCodeAt(0) % 0x100 === parseInt(last_map_key
							.slice(-2), HEX_BASE))) {
				last_convert_to.push(convert_to);
				last_key = hex_key;
				return;
			}

			// map_key未接續。先登記last_map_key。
			if (last_map_key) {
				var first_char_code = last_convert_to[0].charCodeAt(0);
				if (last_convert_to.length > 1
						&& last_convert_to.every(function(char, index) {
							return char.length === 1
									&& char.charCodeAt(0) === index
											+ first_char_code;
						})) {
					last_convert_to = [ last_convert_to[0],
							last_convert_to.length ];
				} else {
					last_convert_to = last_convert_to.join('');
				}
				convert_map[last_map_key] = last_convert_to;
			}
			if (single) {
				convert_map[hex_key] = [ convert_to, 0 ];
				last_map_key = null;
				return;
			}
		}

		last_map_key = last_key = hex_key;
		last_convert_to = [ convert_to ];
	}

	code_lines.forEach(function(line) {
		var matched = line.replace(/\r$/, '')
		//
		.match(/^([\dA-F]{2}):([\s\S]+)$/);
		if (!matched) {
			// comments?
			// console.log(line);
			return;
		}
		// {Integer}char_code_1
		var char_code_1 = parseInt(matched[1], HEX_BASE);
		if (char_code_1 !== last_char_code + 1) {
			CeL.log(last_char_code + '→' + char_code_1);
		}
		last_char_code = char_code_1;
		// CeL.log(new RegExp('\\' + padding_character + '+'));
		// 雙字元/多位元組之第一/首位元
		var hex_char_1 = matched[1],
		//
		char_list = matched[2]
				.split(new RegExp('\\' + padding_character + '+')),
		//
		char_tmp = char_list.pop();
		if (char_tmp) {
			// separator
			CeL.err(hex_char_1 + ': 應以分隔符號結尾，但去掉最後一個時非空: '
					+ JSON.stringify(char_tmp));
		}
		if (last_char_count !== char_list.length) {
			CeL.log(hex_char_1 + ': ' + last_char_count + '→'
					+ char_list.length + ' chars');
			last_char_count = char_list.length;
		}

		char_tmp = char_list[0].chars()[0];
		if (char_tmp && char_tmp !== UNKNOWN_CHARACTER
				&& char_list.every(function(char, index) {
					return char_tmp === char.chars()[0];
				})) {
			if (hex_char_1 === to_hex(char_tmp)[0]) {
				// 轉換到相同字元了。
				return;
			}
			if (char_tmp.codePointAt(0) !== char_code_1) {
				CeL.log('單字元轉換: [' + hex_char_1 + '] → [' + char_tmp + '] ('
						+ to_hex(char_tmp) + ')');
			}
			add_map(hex_char_1, char_tmp);
			return;
		}

		char_list.forEach(function(char, index) {
			if (char.startsWith(UNKNOWN_CHARACTER)) {
				// 不能轉換。
				return;
			}
			// 因為有[[en:Surrogate mechanism]]，不可用(char.length!==1)
			if (char.chars().length !== 1) {
				// assert: (char.codePointAt(0) !== char_code_1)

				if (char.chars()[1].codePointAt(0) >= 0x0300 &&
				// [[en:Combining character#Unicode ranges]]
				char.chars()[1].codePointAt(0) <= 0x036F) {
					add_map(hex_char_1 + to_hex(index + start_char_code_2),
							char, true);
					return;
				}

				CeL.warn(hex_char_1 + to_hex(index + start_char_code_2)
				//
				+ '[' + index + ']: ' + JSON.stringify(char)
				// + ' ' + char.length + ' (' + to_hex(char) + ')'
				+ ' (' + to_hex(char) + ') will be skipped.');
				return;
			}
			// 雙字元轉換:
			add_map(hex_char_1 + to_hex(index + start_char_code_2), char);
		});
	});

	// 登記last_map_key。
	add_map();

	node_fs.writeFileSync(file_path.replace(/\..+/g, '.map'), JSON
			.stringify(convert_map));
}

// --------------------------------------------------------------------------------------

function generate_original_map() {
	var file_descriptor = node_fs.openSync(original_map_file, 'w'),
	// 添加" "是為了預防有4bytes的字元組。若有6bytes,8bytes的字元組則須再加。
	// 最後的 " " 是為了能 .split(new RegExp('\\' + padding_character + '+'))
	char_buffer = Buffer.from(padding_character.repeat(4 + 1)),
	//
	new_line_Buffer = Buffer.from(new_line);
	for (var char_code_1 = start_char_code_1; char_code_1 <= end_char_code; char_code_1++) {
		node_fs.writeSync(file_descriptor, Buffer.from(to_hex(char_code_1)
				+ ':'));
		char_buffer[0] = char_code_1;
		for (var char_code_2 = start_char_code_2; char_code_2 <= end_char_code; char_code_2++) {
			char_buffer[1] = char_code_2;
			node_fs.writeSync(file_descriptor, char_buffer);
		}
		node_fs.writeSync(file_descriptor, new_line_Buffer);
	}
	node_fs.closeSync(file_descriptor);
}
