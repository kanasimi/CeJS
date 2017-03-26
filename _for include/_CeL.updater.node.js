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

var p7z_path = [ '7z', '"C:\\Program Files\\7-Zip\\7z.exe"' ],
// const 下載之後將壓縮檔存成這個檔名。
target_file = 'CeJS-master.zip';

// --------------------------------------------------------------------------------------------

// const
var https = require('https'), node_fs = require('fs'), child_process = require('child_process');

// Check 7z
if (!Array.isArray(p7z_path)) {
	p7z_path = [ p7z_path ];
}
if (!p7z_path.some(function(path) {
	// mute stderr
	var stderr = process.stderr.write;
	process.stderr.write = function() {};
	try {
		child_process.execSync(path + ' -h', 'ignore');
	} catch(e) {
		path = null;
	}
	process.stderr.write = stderr;
	return path && (p7z_path = path);
})) {
	throw 'Please set up the p7z_path first!';
}

try_path_file();

// 目標目錄位置。將會解壓縮成這個目錄底下的 "CeJS-master/"
// process.chdir('D:\\');

// --------------------------------------------------------------------------------------------

try {
	// 清理戰場。
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
var sum_size = 0;

function on_response(response) {
	response.pipe(write_stream);
	response.on('data', function(data) {
		sum_size += data.length;
		process.stdout.write(target_file + ': ' + sum_size + ' bytes...\r');
	});
	response.on('end', function(e) {
		// flush data
		write_stream.end();
		// release file handler
		write_stream.close();
		console.log(target_file + ': ' + sum_size
				+ ' bytes done. Extracting files to ' + process.cwd() + '...');
		// 解開 GitHub 最新版本壓縮檔案。
		child_process.execSync(p7z_path + ' t "' + target_file + '" && '
				+ p7z_path + ' x -y "' + target_file + '"', {
			// pass I/O to the child process
			// https://nodejs.org/api/child_process.html#child_process_options_stdio
			stdio : 'inherit'
		});
		// throw 'Some error occurred! Bad archive?';
	});
}

// 取得 GitHub 最新版本壓縮檔案。
https.get('https://codeload.github.com/kanasimi/CeJS/zip/master', on_response)
//
.on('error', function(e) {
	console.error(e);
});
