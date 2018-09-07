/**
 * @name GitHub repository auto-updater, and auto-update CeJS via GitHub. GitHub
 *       repository 自動更新工具 / 自動配置好最新版本 CeJS 程式庫的工具。
 * @fileoverview 將會採用系統已有的 7-Zip 程式，自動取得並解開 GitHub 最新版本 repository zip
 *               壓縮檔案至當前工作目錄下 (e.g., ./CeJS-master)。
 * 
 * @example<code>

# node _CeL.updater.node.js user/repository-branch target_directory

TODO:
use Zlib

 </code>
 * 
 * @since 2017/3/13 14:39:41 初版<br />
 *        2018/8/20 12:52:34 改寫成 GitHub 泛用的更新工具，並將 _CeL.path.txt →
 *        _repository_path_list.txt<br />
 *        2018/8/30 20:17:7 增加 target_directory 功能。
 */

'use strict';

// --------------------------------------------------------------------------------------------
// 設定區。

var p7zip_path = [ '7z',
// e.g., install p7zip package via yum
'7za', 'unzip', '"C:\\Program Files\\7-Zip\\7z.exe"' ],
/** {String}更新工具相對於 CeJS 根目錄的路徑。e.g., "CeJS-master/_for include/" */
update_script_directory = '/_for include/',
/** {String}下載之後將壓縮檔存成這個檔名。 const */
target_file, latest_version_file, PATTERN_repository_path = /([^\/]+)\/(.+?)(?:-([^-].*))?$/;

// --------------------------------------------------------------------------------------------

// const
var node_https = require('https'), node_fs = require('fs'), child_process = require('child_process'), path_separator = require('path').sep,
// modify from _CeL.loader.nodejs.js
repository_path_list_file = './_repository_path_list.txt';

// --------------------------------------------------------------------------------------------

function detect_base_path(repository, branch) {
	var CeL_path_list;

	try {
		CeL_path_list = node_fs.readFileSync(repository_path_list_file)
				.toString();
	} catch (e) {
	}

	if (!CeL_path_list) {
		// ignore repository_path_list_file
		return;
	}

	var target_directory;

	// modify from _CeL.loader.nodejs.js
	CeL_path_list = CeL_path_list.split(CeL_path_list.includes('\n') ? /\r?\n/
			: '|');
	CeL_path_list.unshift('./' + repository + '-' + branch);
	// console.log(CeL_path_list);
	// 載入 CeJS 基礎泛用之功能。（非特殊目的使用的載入功能）
	CeL_path_list.some(function(path) {
		if (path.charAt(0) === '#'
		//
		&& path.endsWith(repository + '-' + branch)) {
			// path is comments
			return;
		}

		var matched = path
				.match(/(?:^|[\\\/])([a-z_\d]+)-([a-z_\d]+)[\\\/]?$/i);
		if (matched && (matched[1] !== repository || matched[2] !== branch)) {
			// 是其他 repository 的 path。
			return;
		}

		try {
			var fso_status = node_fs.lstatSync(path);
			if (fso_status.isDirectory()) {
				if (/^\.\.(?:$|[\\\/])/.test(path)
						&& !node_fs.existsSync('../ce.js'))
					return;
				target_directory = path;
				// console.info('detect_base_path: Use base path: ' + path);
				return true;
			}
		} catch (e) {
			// try next path
		}
	});

	return target_directory;
}

// --------------------------------------------------------------------------------------------

function check_update(repository_path, post_install) {
	/** {String}Repository name */
	var repository = repository_path.trim().match(PATTERN_repository_path),
	/** const {String}目標目錄位置。將會解壓縮至這個目錄底下。 default: repository_path/ */
	target_directory = process.argv[3], original_work_directory,
	//
	user_name = repository[1], branch = repository[3] || 'master';
	repository = repository[2];

	if (!target_directory) {
		target_directory = detect_base_path(repository, branch);
	} else if (!node_fs.existsSync(target_directory)) {
		node_fs.mkdirSync(target_directory);
	}
	if (target_directory) {
		// console.log('target_directory: ' + target_directory);
		target_directory = target_directory.replace(/[\\\/]+$/, '');
		if (target_directory
				&& (target_directory.endsWith(path_separator + repository + '-'
						+ branch) || target_directory.endsWith('\\'
						+ repository + '-' + branch))) {
			original_work_directory = process.cwd();
			process.chdir(target_directory.slice(0, -(path_separator
					+ repository + '-' + branch).length));
		}
		target_directory += path_separator;
	}

	if (!target_file)
		target_file = repository + '-' + branch + '.zip';

	if (!latest_version_file)
		// read repository-branch.version.json
		latest_version_file = target_file.replace(/[^.]+$/g, 'version.json');

	console.info('Read ' + latest_version_file);
	var have_version;
	try {
		have_version = JSON.parse(node_fs.readFileSync(latest_version_file)
				.toString()).version;
	} catch (e) {
	}

	console.info('Get the infomation of latest version of '
	// 取得 GitHub 最新版本 infomation。
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
			var contents = Buffer.concat(buffer_array, sum_size).toString(),
			//
			latest_commit = JSON.parse(contents),
			//
			latest_version = latest_commit.commit.author.date;
			if (have_version === latest_version) {
				console.info('Already have the latest version: '
				//
				+ have_version);
			} else {
				process.title = 'Update ' + repository_path;
				console.info('Update: ' + (have_version
				//
				? have_version + '\n     → ' : 'to ') + latest_version);
				update_via_7zip(latest_version,
				//
				user_name, repository, branch, function() {
					if (typeof post_install === 'function')
						post_install(target_directory || '');
					if (original_work_directory)
						process.chdir(original_work_directory);
				}, target_directory);
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

function update_via_7zip(latest_version, user_name, repository, branch,
		post_install, target_directory) {
	// detect 7z path
	if (!Array.isArray(p7zip_path)) {
		p7zip_path = [ p7zip_path ];
	}
	// 若是 $PATH 中有 7-zip 的可執行檔，應該在這邊就能夠被偵測出來。
	if (!p7zip_path.some(function(path) {
		// mute stderr
		var stderr = process.stderr.write;
		process.stderr.write = function() {
		};
		try {
			child_process.execSync(path + ' -h');
		} catch (e) {
			path = null;
		}
		process.stderr.write = stderr;
		return path && (p7zip_path = path);
	})) {
		console.error('Please set up the p7zip_path first!');
		p7zip_path = null;
	}

	// --------------------------------------------------------------------------------------------

	try {
		// 清理戰場。
		node_fs.unlinkSync(target_file);
	} catch (e) {
	}

	// 先確認/轉到目標目錄，才能 open file。
	var write_stream = node_fs.createWriteStream(target_file),
	// 已經取得的檔案大小
	sum_size = 0, start_time = Date.now(), total_size;

	function on_response(response) {
		// 採用這種方法容易漏失資料。 @ node.js v7.7.3
		// response.pipe(write_stream);

		// 可惜 GitHub 沒有提供 Content-Length，無法加上下載進度。
		total_size = +response.headers['content-length'];
		var buffer_array = [];

		response.on('data', function(data) {
			sum_size += data.length;
			buffer_array.push(data);
			process.stdout.write(target_file + ': ' + sum_size
			//
			+ (total_size ? '/' + total_size : '') + ' bytes ('
			// 00% of 0.00MiB
			+ (total_size ? (100 * sum_size / total_size | 0) + '%, ' : '')
			//
			+ (sum_size / 1.024 / (Date.now() - start_time)).toFixed(2)
					+ ' KiB/s)...\r');
		});

		response.on('end', function(e) {
			if (total_size && sum_size !== total_size) {
				console.error('Expected ' + total_size + ' bytes, but get '
						+ sum_size + ' bytes!');
			}
			write_stream.write(Buffer.concat(buffer_array, sum_size));
			// flush data
			write_stream.end();
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
		console.info(target_file + ': ' + sum_size
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
		quoted_target_file = '"' + target_file + '"';
		if (p7zip_path.includes('unzip')) {
			command = p7zip_path + ' -t ' + quoted_target_file + ' && '
			// 解開 GitHub 最新版本壓縮檔案 via unzip。
			+ p7zip_path + ' -x -o ' + quoted_target_file;
		} else {
			command = p7zip_path + ' t ' + quoted_target_file + ' && '
			// 解開 GitHub 最新版本壓縮檔案 via 7z。
			+ p7zip_path + ' x -y ' + quoted_target_file;
		}

		child_process.execSync(command, {
			// pass I/O to the child process
			// https://nodejs.org/api/child_process.html#child_process_options_stdio
			stdio : 'inherit'
		});

		if (latest_version) {
			node_fs.writeFileSync(latest_version_file, JSON.stringify({
				check_date : new Date(),
				version : latest_version
			}));

			try {
				// 解壓縮完成之後，可以不必留著程式碼檔案。 TODO: backup
				node_fs.unlinkSync(target_file);
			} catch (e) {
			}

			move_all_files_under_directory(repository + '-' + branch,
					target_directory, true);
			update_script_directory = (target_directory || repository + '-'
					+ branch).replace(/[\\\/]+$/, '')
					+ path_separator + update_script_directory;
			typeof post_install === 'function'
					&& post_install(target_directory || '');

			console.info('Done.\n\n' + 'Installation completed successfully.');
		}

		// throw 'Some error occurred! Bad archive?';
	});

}

function simplify_path(path) {
	return path.replace(/[\\\/]+$/, '').replace(/^(?:\.\/)+/, '') || '.';
}

// 把 source_directory 下面的檔案全部搬移到 target_directory 下面去。
function move_all_files_under_directory(source_directory, target_directory,
		overwrite, create_empty_directory) {
	if (!target_directory)
		return 'NEEDLESS';

	function move(_source, _target) {
		var fso_list = node_fs.readdirSync(_source);
		if (!node_fs.existsSync(_target)
		// 對於空目錄看看是否要創建一個。
		&& (fso_list.length > 0 || create_empty_directory)) {
			node_fs.mkdirSync(_target);
		}
		_source += path_separator;
		_target += path_separator;
		fso_list.forEach(function(fso_name) {
			var fso_status = node_fs.lstatSync(_source + fso_name);
			if (fso_status.isDirectory()) {
				move(_source + fso_name, _target + fso_name);
			} else {
				if (node_fs.existsSync(_target + fso_name)) {
					if (overwrite)
						node_fs.unlinkSync(_target + fso_name);
					else
						return;
				}
				// console.log(_source + fso_name+'→'+ _target + fso_name);
				node_fs.renameSync(_source + fso_name, _target + fso_name);
			}
		});
		node_fs.rmdirSync(_source);
	}

	source_directory = simplify_path(source_directory);
	target_directory = simplify_path(target_directory);
	if (source_directory !== target_directory) {
		console.log('move_all_files_under_directory [' + source_directory
				+ ']→[' + target_directory + ']');
		move(source_directory, target_directory);
	}
}

// --------------------------------------------------------------------------------------------

// {String}repository path
var repository_path = process.argv[2], default_repository_path = 'kanasimi/CeJS';
if (PATTERN_repository_path.test(repository_path)) {
	// GitHub 泛用的更新工具。
	check_update(repository_path, default_post_install_for_all);

} else if (repository_path) {
	console.log('Usage:\n	node ' + process.argv[1]
			+ ' "user/repository-branch" "target_directory"'
			+ '\n\ndefault repository path: ', default_repository_path);

} else {
	// default action
	check_update(default_repository_path, default_post_install);
}

function default_post_install_for_all(base_directory) {
}

function default_post_install(base_directory) {
	console.info('Update the tool itself...');
	copy_file('_CeL.updater.node.js', null, base_directory);

	console.info('Setup basic execution environment...');
	copy_file('_CeL.loader.nodejs.js', null, base_directory);
	try {
		// Do not overwrite repository_path_list_file.
		node_fs.accessSync(base_directory + repository_path_list_file,
				node_fs.constants.R_OK);
	} catch (e) {
		try {
			node_fs.renameSync(update_script_directory
					+ repository_path_list_file.replace(/(\.[^.]+)$/,
							'.sample$1'), base_directory
					+ repository_path_list_file);
		} catch (e) {
			// TODO: handle exception
		}
	}
}

function copy_file(source_name, taregt_name, base_directory) {
	var taregt_path = base_directory + (taregt_name || source_name);
	try {
		node_fs.unlinkSync(taregt_path);
	} catch (e) {
		// TODO: handle exception
	}
	if (false)
		console.log('copy_file [' + update_script_directory + source_name
				+ ']→[' + taregt_path + ']');
	node_fs.renameSync(update_script_directory + source_name, taregt_path);
}
