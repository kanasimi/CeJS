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

// const 下載之後將壓縮檔存成這個檔名。
var target_file = 'CeJS-master.zip';

// --------------------------------------------------------------------------------------------

// const
var https = require('https'), node_fs = require('fs'), write_stream = node_fs
		.createWriteStream(target_file), child_process = require('child_process');

try_path_file();

// 目標目錄位置。將會解壓縮成這個目錄底下的 "CeJS-master/"
// process.chdir('D:\\');

// --------------------------------------------------------------------------------------------

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
	response.on('data', function(data) {
		sum_size += data.length;
		process.stdout.write(target_file + ': ' + sum_size + ' bytes...\r');
		write_stream.write(data);
	});
	response.on('end', function(e) {
		console.log(target_file + ': ' + sum_size
				+ ' bytes done. Extracting files to ' + process.cwd() + '...');
		write_stream.end();
		// 解開 GitHub 最新版本壓縮檔案。
		child_process.exec('"C:\\Program Files\\7-Zip\\7z.exe" x -y "'
				+ target_file + '"');
	});
}

// 取得 GitHub 最新版本壓縮檔案。
https.get('https://codeload.github.com/kanasimi/CeJS/zip/master', on_response)
//
.on('error', function(e) {
	console.error(e);
});
