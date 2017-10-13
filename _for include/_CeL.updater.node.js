/**
 * @name Auto update CeJS via GitHub. 自動配置好最新版本 CeJS 的工具。
 * @fileoverview 將會自動取得並解開 GitHub 最新版本壓縮檔案至當前工作目錄下。
 * 
 * @example<code>

# node _CeL.updater.node.js

TODO:
use Zlib

 </code>
 * 
 * @since 2017/3/13 14:39:41
 */

'use strict';

// --------------------------------------------------------------------------------------------
// 設定區。

var p7zip_path = [ '7z',
// e.g., install p7zip package via yum
'7za', 'unzip', '"C:\\Program Files\\7-Zip\\7z.exe"' ], user_name = 'kanasimi',
/** {String}Repository name */
repository = 'CeJS', branch = 'master',
// const 下載之後將壓縮檔存成這個檔名。
target_file = repository + '-' + branch + '.zip',
//
latest_version_file = target_file.replace(/[^.]+$/g, 'version');

// --------------------------------------------------------------------------------------------

// const
var node_https = require('https'), node_fs = require('fs'), child_process = require('child_process');

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
		if (path.charAt(0) === '#'
		//
		&& path.endsWith(repository + '-' + branch)) {
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

// --------------------------------------------------------------------------------------------

function check_update() {

	var have_version, latest_commit;

	console.log('Read ' + latest_version_file);
	try {
		have_version = node_fs.readFileSync(latest_version_file).toString();
	} catch (e) {
	}

	console.log('Get the infomation of latest version of '
	// 取得 GitHub 最新版本infomation。
	+ repository + '...');
	node_https.get({
		// https://api.github.com/repos/kanasimi/CeJS/commits/master
		host : 'api.github.com',
		path : '/repos/' + user_name + '/' + repository + '/commits/' + branch,
		// https://developer.github.com/v3/#user-agent-required
		headers : {
			'user-agent' : 'CeL_updater/2.0'
		}
	}, function(response) {
		var buffer_array = [], sum_size = 0;

		response.on('data', function(data) {
			sum_size += data.length;
			buffer_array.push(data);
		});

		response.on('end', function(e) {
			var latest_commit = JSON.parse(
			//
			Buffer.concat(buffer_array, sum_size).toString()),
			//
			latest_version = latest_commit.commit.author.date;
			if (have_version === latest_version) {
				console.log('Already have the latest version: '
				//
				+ have_version);
			} else {
				console.info('Update: ' + (have_version
				//
				? have_version + '\n     → ' : 'to ') + latest_version);
				update_via_7zip(latest_version);
			}
		});
	})
	//
	.on('error', function(e) {
		// network error?
		// console.error(e);
		throw e;
	});

}

// --------------------------------------------------------------------------------------------

function update_via_7zip(latest_version) {
	// Check 7z
	if (!Array.isArray(p7zip_path)) {
		p7zip_path = [ p7zip_path ];
	}
	// 若是$PATH中有7-zip的可執行檔，應該在這邊就能夠被偵測出來。
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
		console.error('Please set up the p7zip_path first!');
		p7zip_path = null;
	}

	// 目標目錄位置。將會解壓縮成這個目錄底下的 "CeJS-master/"
	// process.chdir('D:\\');

	// --------------------------------------------------------------------------------------------

	try {
		// 清理戰場。
		node_fs.unlinkSync(target_file);
	} catch (e) {
	}

	// 先確認/轉到目標目錄，才能 open file。
	var write_stream = node_fs.createWriteStream(target_file),
	// 已經取得的檔案大小
	sum_size = 0, start_time = Date.now();

	function on_response(response) {
		// 採用這種方法容易漏失資料。 @ node.js v7.7.3
		// response.pipe(write_stream);

		var buffer_array = [];

		response.on('data', function(data) {
			sum_size += data.length;
			buffer_array.push(data);
			process.stdout.write(target_file + ': ' + sum_size + ' bytes ('
					+ (sum_size / 1.024 / (Date.now() - start_time)).toFixed(2)
					+ ' KiB/s)...\r');
		});

		response.on('end', function(e) {
			write_stream.write(Buffer.concat(buffer_array, sum_size));
			// flush data
			write_stream.end();
			// release file handler
			write_stream.close();
		});
	}

	node_https.get('https://codeload.github.com/'
	// 取得 GitHub 最新版本壓縮檔案。
	+ user_name + '/' + repository + '/zip/' + branch, on_response)
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

		if (!p7zip_path) {
			throw 'Please extract the archive file manually: ' + target_file;
		}

		var command,
		//
		q_target_file = '"' + target_file + '"';
		if (p7zip_path.includes('unzip')) {
			command = p7zip_path + ' -t ' + q_target_file + ' && '
			// 解開 GitHub 最新版本壓縮檔案 by unzip。
			+ p7zip_path + ' -x -o ' + q_target_file;
		} else {
			command = p7zip_path + ' t ' + q_target_file + ' && '
			// 解開 GitHub 最新版本壓縮檔案 by 7z。
			+ p7zip_path + ' x -y ' + q_target_file;
		}

		child_process.execSync(command, {
			// pass I/O to the child process
			// https://nodejs.org/api/child_process.html#child_process_options_stdio
			stdio : 'inherit'
		});

		if (latest_version) {
			node_fs.writeFileSync(latest_version_file, latest_version);

			try {
				// 解壓縮完成之後，可以不必留著程式碼檔案。 TODO: backup
				node_fs.unlinkSync(target_file);
			} catch (e) {
			}
		}

		// throw 'Some error occurred! Bad archive?';
	});

}

// --------------------------------------------------------------------------------------------

try_path_file();

check_update();
