/**
 * @name CeL function for Excel
 * @fileoverview 本檔案包含了 Excel 專用的 functions。
 * 
 * @since
 */

'use strict';
// 'use asm';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'application.OS.Windows.Excel',

	require : 'data.code.compatibility.|data.native.'
	//
	+ '|data.CSV.|application.storage.',

	// 設定不匯出的子函式。
	// no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	var module_name = this.id;

	/**
	 * null module constructor
	 * 
	 * @class Node.js 的 functions
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

	var execSync = require('child_process').execSync;

	// read .XLSX file → {Array}data list
	// 必須先安裝 Excel
	function read_Excel_file(Excel_file_path, options) {
		var text_file_path = Excel_file_path.replace(/(?:\.[^.]+)?$/, '.txt');

		// check if updated

		// 將 Microsoft Office spreadsheets (Excel .XLSX 檔)匯出成 Unicode 文字檔，

		// CScript.exe: Microsoft ® Console Based Script Host
		// WScript.exe: Microsoft ® Windows Based Script Host
		execSync('WScript.exe //Nologo //B "'
				+ library_namespace.get_module_path(module_name,
						'Excel_to_Unicode.js') + '" "' + Excel_file_path
				+ '" "' + text_file_path + '"');

		// 轉成 csv 再做處理用的 wrapper 函數。
		var array = library_namespace.parse_CSV(library_namespace.read_file(
				text_file_path, 'auto')
		// Excel 將活頁簿儲存成 "Unicode 文字"時的正常編碼為 UTF-16LE
		.trim().replace(/\r?\n\t*(\r?\n)+/g, '$1'), Object.assign({
			has_title : true,
			field_delimiter : '\t'
		}, options));

		return array;
	}

	_.read_Excel_file = read_Excel_file;

	function write_Excel_file(file_path, contents, options) {
		library_namespace.write_file(file_path, library_namespace
				.to_CSV_String(contents, Object.assign({
					field_delimiter : '\t',
					line_separator : '\r\n'
				}, options)));
	}

	_.write_Excel_file = write_Excel_file;

	return (_// JSDT:_module_
	);
}
