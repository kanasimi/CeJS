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

// 目標目錄位置。將會解壓縮成這個目錄底下的 "CeJS-master/"
// process.chdir('D:\\');

// const 下載之後將壓縮檔存成這個檔名。
var target_file = 'CeJS-master.zip';

// --------------------------------------------------------------------------------------------

// const
var https = require('https'), fs = require('fs'), write_stream = fs
		.createWriteStream(target_file), child_process = require('child_process');

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
