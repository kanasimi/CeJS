/**
 * @name 自動配置好最新版本 CeJS 的工具。
 * @fileoverview 將會自動取得並解開 GitHub 最新版本壓縮檔案。
 * 
 * @example<code>

node _CeL.updater.node.js

 </code>
 * 
 * @since 2017/3/13 14:39:41
 */

'use strict';

// --------------------------------------------------------------------------------------------
// 設定區。

var p7zip_path = [ '7z',
// e.g., install p7zip package via yum
'7za', '"C:\\Program Files\\7-Zip\\7z.exe"' ],
// const 下載之後將壓縮檔存成這個檔名。
target_file = 'CeJS-master.zip';

// --------------------------------------------------------------------------------------------

// const
var https = require('https'), node_fs = require('fs'), child_process = require('child_process');

// Check 7z
if (!Array.isArray(p7zip_path)) {
	p7zip_path = [ p7zip_path ];
}
if (!p7zip_path.some(function(path) {
	// mute stderr
	var stderr = process.stderr.write;
	process.stderr.write = function() {
	};
	try {
		child_process.execSync(path + ' -h', 'ignore');
	} catch (e) {
		path = null;
	}
	process.stderr.write = stderr;
	return path && (p7zip_path = path);
})) {
	throw 'Please set up the p7zip_path first!';
}

try_path_file();

// 目標目錄位置。將會解壓縮成這個目錄底下的 "CeJS-master/"
// process.chdir('D:\\');

// --------------------------------------------------------------------------------------------

try {
	// 清理戰場。 TODO: backup
	node_fs.unlinkSync(target_file);
} catch (e) {
}

// 先確認/轉到目標目錄，才能 open file。
var write_stream = node_fs.createWriteStream(target_file);

function try_path_file() {
	// modify from _CeL.loader.nodejs.js
	var CeL_path_file = './_CeL.path.txt', CeL_path_list;

	try {
		CeL_path_list = node_fs.readFileSync(CeL_path_file).toString();
	} catch (e) {
	}

	if (!CeL_path_list) {
		// ignore CeL_path_file
		return;
	}

	CeL_path_list.split(CeL_path_list.includes('\n') ? /\r?\n/ : '|')
	// 載入CeJS基礎泛用之功能。（如非特殊目的使用的載入功能）
	.some(function(path) {
		if (path.charAt(0) === '#' && path.endsWith('CeJS-master')) {
			// path is comments
			return;
		}

		try {
			// 到path的上一層。
			process.chdir(path.replace(/[^\\\/]+[\\\/]?$/, ''));
			console.info('Use base path: ' + path);
			return true;
		} catch (e) {
			// try next path
		}
	});
}

// 已經取得的檔案大小
var sum_size = 0, buffer_array = [];

function on_response(response) {
	// 採用這種方法容易漏失資料。 @ node.js v7.7.3
	// response.pipe(write_stream);

	response.on('data', function(data) {
		sum_size += data.length;
		buffer_array.push(data);
		process.stdout.write(target_file + ': ' + sum_size + ' bytes...\r');
	});

	response.on('end', function(e) {
		write_stream.write(Buffer.concat(buffer_array, sum_size));
		// flush data
		write_stream.end();
		// release file handler
		write_stream.close();
	});
}

// 取得 GitHub 最新版本壓縮檔案。
https.get('https://codeload.github.com/kanasimi/CeJS/zip/master', on_response)
//
.on('error', function(e) {
	// network error?
	// console.error(e);
	throw e;
});

// ---------------------------

write_stream.on('close', function() {
	console.log(target_file + ': ' + sum_size
			+ ' bytes done. Extracting files to ' + process.cwd() + '...');

	// check file size
	var file_size = node_fs.statSync(target_file).size;
	if (file_size !== sum_size) {
		throw 'The file size ' + file_size + ' is not ' + sum_size
				+ '! Please try to run again.';
	}

	child_process.execSync(p7zip_path + ' t "' + target_file + '" && '
	// 解開 GitHub 最新版本壓縮檔案。
	+ p7zip_path + ' x -y "' + target_file + '"', {
		// pass I/O to the child process
		// https://nodejs.org/api/child_process.html#child_process_options_stdio
		stdio : 'inherit'
	});
	// throw 'Some error occurred! Bad archive?';
});
