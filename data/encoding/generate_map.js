// node generate.js

/*


 2017/1/11 16:15:36
 [[en:character encoding]]


 先以generate_original_map();生成original_map.txt
 以各種編碼轉換original_map.txt


 encoding.map.json規格書:包含map:
 {
 //to single byte:
 start_char_code_in_hex:[start of second byte, 'map', 'split string']
 //to 2 bytes
 start_char_code_in_hex:[start of second byte, 'map', 'split string']
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
var node_fs = require('fs'), new_line = '\n', HEX_COUNT = 0x10,
// 1バイト目
start_char_code_1 = 0x80 - 2, end_char_code = 0x100 - 1,
// 2バイト目: 起始必須跳過 \n, \t。
start_char_code_2 = 0x20,
// REPLACEMENT CHARACTER U+FFFD
UNKNOWN_CHARACTER = '�';

// generate_original_map();

// parse_converted('Big5.txt');
// parse_converted('EUC-JP.txt');
// parse_converted('GBK.txt');
// parse_converted('Shift_JIS.txt');

// array_vs_charAt();

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
	return char.toString(HEX_COUNT).toUpperCase();
}

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
	code_lines.forEach(function(line) {
		var matched = line.replace(/\r$/, '')
		//
		.match(/^([\dA-F]{2}):([\s\S]+)$/);
		if (!matched) {
			// comments?
			// console.log(line);
			return;
		}
		var char_code_1 = parseInt(matched[1], HEX_COUNT);
		if (char_code_1 !== last_char_code + 1) {
			CeL.log(last_char_code + '→' + char_code_1);
		}
		last_char_code = char_code_1;
		var char_1 = matched[1], char_list = matched[2].split(/\t+/),
		//
		char_tmp = char_list.pop();
		if (char_tmp) {
			// separator
			CeL.err(char_1 + ': 應以分隔符號結尾，但去掉最後一個時非空: '
					+ JSON.stringify(char_tmp));
		}
		if (last_char_count !== char_list.length) {
			CeL.log(char_1 + ': ' + last_char_count + '→' + char_list.length
					+ ' chars');
			last_char_count = char_list.length;
		}

		char_tmp = char_list[0].chars()[0];
		if (char_tmp && char_tmp !== UNKNOWN_CHARACTER
				&& char_list.every(function(char, index) {
					return char_tmp === char.chars()[0];
				})) {
			if (char_tmp.codePointAt(0) !== char_code_1) {
				CeL.log('單字元轉換: [' + char_1 + '] → [' + char_tmp + '] ('
						+ to_hex(char_tmp) + ')');
			}
			return;
		}

		char_list.forEach(function(char, index) {
			if (char.startsWith(UNKNOWN_CHARACTER)) {
				return;
			}
			// 因為有[[en:Surrogate mechanism]]，不可用(char.length!==1)
			if (char.chars().length !== 1) {
				if (char.codePointAt(0) !== char_code_1) {
					CeL.log(char_1 + to_hex(index + start_char_code_2)
					//
					+ '[' + index + ']: ' + JSON.stringify(char)
					// + ' ' + char.length + ' (' + to_hex(char) + ')'
					+ ' (' + to_hex(char) + ')');
				}
				return;
			}
			// 雙字元轉換:
		});
	});
}

function generate_original_map() {
	var file_descriptor = node_fs.openSync('original_map.txt', 'w'),
	// 添加" "是為了預防有4bytes的字元組。若有6bytes,8bytes的字元組則須再加。
	// 最後的" "是為了能.split(/\t+/)
	char_buffer = Buffer.from('  \t\t\t'), new_line_Buffer = Buffer
			.from(new_line);
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
