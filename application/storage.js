/**
 * @name CeL function for storage.
 * @fileoverview 載入在不同執行環境與平台皆可使用的檔案操作功能公用API，以統一使用介面。
 * @since 2017/1/27
 */

'use strict';
// 'use asm';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'application.storage',

	// 依照不同執行環境與平台載入可用的操作功能。
	require : detect_require,

	// 設定不匯出的子函式。
	// no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function detect_require(library_namespace) {
	if (library_namespace.platform.nodejs) {
		return 'application.platform.nodejs.';
	}

	// 理想作法應該偵測JScript與COM環境。
	// @see CeL.application.OS.Windows.file
	this.has_ActiveX = typeof WScript === 'object'
			|| typeof ActiveXObject === 'function'
			|| typeof Server === 'object' && Server.CreateObject;

	if (this.has_ActiveX) {
		// TODO: application.OS.Windows.archive.
		return 'application.OS.Windows.file.';
	}

	if (library_namespace.is_WWW()) {
		library_namespace.debug('It looks like we are running in a web environment.', 1, 'detect_require');
		return;
	}
	library_namespace.error('It looks like we are running in an unknown OS.');
}

function module_code(library_namespace) {

	/**
	 * null module constructor
	 * 
	 * @class storage 的 functions
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

	// -------------------------------------------------------------------------
	// 維護公用API。

	/**
	 * 公用API: 有些尚未完備，需要先確認。<code>

	// set/get current working directory. 設定/取得目前工作目錄。
	// current_directory() ends with path_separator
	CeL.storage.working_directory([change_to_directory])

	CeL.storage.fso_status(fso_path)
	CeL.storage.chmod(fso_path, options)
	CeL.storage.fso_exists(file_path)
	CeL.storage.file_exists(file_path)
	// get the contents of file
	CeL.storage.read_file(file_path, character_encoding = 'UTF-8').toString()
	CeL.storage.write_file(file_path, contents, character_encoding = 'UTF-8')
	CeL.storage.append_file(file_path, contents, character_encoding = 'UTF-8')
	// alias: delete
	CeL.storage.remove_file(file_path / directory_path_list)
	// alias: rename
	CeL.storage.move_file(move_from_path, move_to_path)
	CeL.storage.copy_file(copy_from_path, copy_to_path)

	// .folder_exists()
	CeL.storage.directory_exists(directory_path)
	// get the fso list (file and sub-directory list) of the directory.
	CeL.storage.read_directory(directory_path, options)
	CeL.storage.directory_is_empty(directory_path, options)
	// alias: mkdir
	CeL.storage.create_directory(directory_path / directory_path_list)
	// alias: delete. recursive: clean directory
	CeL.storage.remove_directory(directory_path / directory_path_list, recursive)
	// alias: rename
	CeL.storage.move_directory(move_from_path, move_to_path)
	CeL.storage.copy_directory(copy_from_path, copy_to_path)

	// 遍歷檔案系統，對每個 FSO 執行指定的動作。
	// TODO: 以 data.file.file_system_structure 代替 traverse_file_system()
	CeL.storage.traverse_file_system(directory_path, handler, filter or options)

	</code>
	 */

	// main module of OS adapted functions
	var storage_module;

	if (library_namespace.platform.nodejs) {
		library_namespace.debug('application.storage: use node.js functions.');
		storage_module = library_namespace.application.platform.nodejs;

		/** node.js file system module */
		var node_fs = require('fs');

		// _.current_directory()
		_.working_directory = storage_module.working_directory;

		// 警告: 此函數之API尚未規範。
		// .file_stats()
		// Not exist: will return false.
		_.fso_status = storage_module.fs_status;

		_.chmod = storage_module.chmod;

		_.file_exists = storage_module.file_exists;
		_.directory_exists = storage_module.directory_exists;

		_.read_file = storage_module.fs_read;

		_.write_file = storage_module.fs_write;

		_.copy_file = storage_module.fs_copySync;

		_.remove_file = _.remove_directory = function remove_fso(path,
				recursive) {
			return storage_module.fs_remove(path, recursive);
		};

		_.move_directory = _.move_file =
		//
		_.move_fso = storage_module.fs_move;

		_.read_directory = function(directory_path, options) {
			try {
				// fso_name_list
				return node_fs.readdirSync(directory_path, options);
			} catch (e) {
				library_namespace.debug('Error to read directory: '
						+ directory_path);
			}
		};

		// directory exists and is empty
		_.directory_is_empty = function(directory_path, options) {
			var fso_name_list = _.read_directory(directory_path, options);
			return Array.isArray(fso_name_list) && fso_name_list.length === 0;
		};

		_.create_directory = storage_module.fs_mkdir;

		_.traverse_file_system = storage_module.traverse_file_system;

	} else if (this.has_ActiveX) {
		storage_module = library_namespace.application.OS.Windows.file;

		_.working_directory = storage_module.working_directory;

		_.read_file = storage_module.read_file;

		_.write_file = storage_module.write_file;

		// TODO: many

		// others done @ CeL.application.OS.Windows.file

	}

	// ----------------------------------------------------

	function write_file(file_path, data, options) {
		// options = library_namespace.new_options(options);
		if (library_namespace.is_Object(data)
		// JSON.stringify() 放在 try 外面。這樣出現 circular structure 的時候才知道要處理。
		&& /.json$/i.test(file_path)) {
			// 自動將資料轉成 string。
			try {
				data = JSON.stringify(data);
			} catch (e) {
				// data 可能很長，擺在首位。
				library_namespace.debug(data);
				library_namespace.error('write_file: Failed to write to '
						+ file_path + ': ' + e);
				library_namespace.error(e);
				throw e;
			}
		}

		if (options && options.changed_only) {
			var original_data = _.read_file(file_path, options);
			if (String(data) === String(original_data))
				return new Error('Nothing changed');
			// delete options.changed_only;
		}

		if (options && options.backup && _.file_exists(file_path)) {
			var backup_options = typeof options.backup === 'string' ? /[\\\/]/
					.test(options.backup) ? {
				directory : options.backup
			} : {
				directory_name : options.backup
			} : library_namespace.new_options(options.backup);

			if (!backup_options.directory && backup_options.directory_name) {
				// 設定備份目錄於與檔案相同的目錄下。
				backup_options.directory = file_path.replace(/[^\\\/]+$/, '')
						+ backup_options.directory_name;
			}

			var backup_file_path = backup_options.directory
			//
			? append_path_separator(backup_options.directory,
			// get file name only
			file_path.match(/[^\\\/]+$/)[0])
			// append file name extension
			: backup_options.extension ? file_path + backup_options.extension
			// preserve original file name extension
			: file_path.replace(/(\.\w+)$/,
					(backup_options.file_name_mark || '.bak') + '$1');

			// Create backup
			if (backup_options.directory)
				_.create_directory(backup_options.directory);
			_.remove_file(backup_file_path);
			_.move_file(file_path, backup_file_path);
		}

		return _.write_file__OS_adapted(file_path, data, options);
	}

	if (_.write_file) {
		_.write_file__OS_adapted = _.write_file;
		_.write_file = write_file;
	}

	// ----------------------------------------------------

	get_not_exist_filename.PATTERN = /( )?(?:\((\d{1,3})\))?(\.[^.]*)?$/;
	get_not_exist_filename.max_index = 999;

	// 找到下一個可用的檔案名稱。若是有重複的檔案存在，則會找到下一個沒有使用的編號為止。
	// recheck: 從頭檢查起。否則接續之前的序號檢查。
	// CeL.next_fso_NO_unused("n (2).txt") 先檢查 "n (2).txt", "n (3).txt"，
	// CeL.next_fso_NO_unused("n (2).txt", true) 先檢查 "n.txt", "n (1).txt"
	function get_not_exist_filename(move_to_path, recheck) {
		if (recheck) {
			move_to_path = move_to_path.replace(get_not_exist_filename.PATTERN,
			//
			function(all, prefix_space, index, extension) {
				return extension || '';
			});
		}
		while (_.fso_status(move_to_path)) {
			move_to_path = move_to_path.replace(
			// Get next index that can use.
			get_not_exist_filename.PATTERN, function(all, prefix_space, index,
					extension) {
				if (index > get_not_exist_filename.max_index) {
					throw new Error('get_not_exist_filename: The index '
							+ index + ' is too big! ' + move_to_path);
				}
				return (prefix_space || !index ? ' ' : '') + '('
						+ ((index | 0) + 1) + ')' + (extension || '');
			});
		}
		return move_to_path;
	}
	_.next_fso_NO_unused = get_not_exist_filename;
	_.move_fso_with_NO = function(from_path, to_path) {
		to_path = get_not_exist_filename(to_path);
		if (false)
			library_namespace.info(library_namespace.display_align([
					[ 'Move: ', from_path ], [ '→ ', move_to_path ] ]));
		_.move_fso(from_path, to_path);
	};

	// 從一個目錄或檔案列表中，找出第一個存在的。
	_.first_exist_fso = function(fso_list) {
		var first_exist;
		if (!Array.isArray(fso_list)) {
			fso_list = [ fso_list ];
		}
		if (fso_list.some(function(fso) {
			if (_.fso_status(fso)) {
				first_exist = fso;
				return true;
			}
		})) {
			return first_exist;
		}
	};

	// -------------------------------------------------------------------------
	// 一些與平台無關，且常用的檔案操作函數。或者簡單並且依賴於上面所列出操作的函數。
	// platform-independent model (PIM)
	// https://en.wikipedia.org/wiki/Platform-independent_model

	var path_separator = library_namespace.env.path_separator;

	// join path 自動加上最後的路徑分隔符號/目錄分隔符號。
	function append_path_separator(directory_path, file_name) {
		if (!directory_path) {
			return directory_path;
		}

		// assert: typeof directory_path === 'string'

		// 正規化成當前作業系統使用的路徑分隔符號。
		if (false) {
			directory_path = directory_path.replace(/[\\\/]/g, path_separator);
		}

		if (!/[\\\/]$/.test(directory_path)) {
			directory_path +=
			// 所添加的路徑分隔符號，以路徑本身的路徑分隔符號為主。
			directory_path.includes('/') ? '/'
			//
			: directory_path.includes('\\')
			// e.g., 'C:'
			|| directory_path.endsWith(':') ? '\\'
			//
			: path_separator;

		} else {
			// 去除末尾太多個、不需要也不正規的路徑分隔符號。
			directory_path = directory_path.replace(/[\\\/]{2,}$/, function(
					path_separators) {
				return path_separators[0];
			});
		}

		// library_namespace.simplify_path()
		if (file_name || file_name === 0)
			file_name = String(file_name).replace(/^(\.{0,2}[\\\/])+/, '');
		return file_name ? directory_path + file_name : directory_path;
	}

	_.append_path_separator = append_path_separator;

	function extract_wildcard(pattern, options) {
		var matched = library_namespace.simplify_path(pattern).match(
				/^([\s\S]*[\\\/])?([^\\\/]+)$/);
		if (!matched)
			return [ pattern ];

		var directory = matched[1] || '.' + path_separator;
		matched = matched[2];
		pattern = library_namespace.wildcard_to_RegExp(matched);
		// console.trace(pattern);

		var fso_list = library_namespace.read_directory(directory);
		// console.trace(fso_list);
		fso_list = fso_list.filter(function(fso_name) {
			// console.trace([ fso_name, pattern, pattern.test(fso_name) ]);
			return pattern.test(fso_name)
			// e.g., 包含 "[", "]" 時。
			|| fso_name === matched;
		});
		// console.trace(fso_list);

		if (!options || !options.get_name) {
			fso_list = fso_list.map(function(fso_name) {
				return directory + fso_name;
			});
		}
		return fso_list;
	}

	_.extract_wildcard = extract_wildcard;

	/**
	 * Delete files in the directory that fit the filter.
	 * 刪除掉directory中符合filter的檔案。
	 * 
	 * @param {String}directory
	 *            in the directory
	 * @param {String}filter
	 *            file name filter
	 */
	function remove_files_in_directory(directory, filter) {
		// const
		var fso_list = library_namespace.read_directory(directory);
		fso_list = fso_list.filter(filter);
		directory = append_path_separator(directory);
		var errors = Object.create(null);
		fso_list.forEach(function(fso_name) {
			var fso_path = directory + fso_name;
			library_namespace.debug('Remove ' + fso_path);
			var error = _.remove_file(fso_path);
			if (error) {
				errors[fso_name] = {
					fso_path : fso_path,
					error : error
				};
			}
		});
		return errors;
	}

	_.remove_files_in_directory = remove_files_in_directory;

	// 決定預設的主要下載目錄。
	// macOS dmg APP 中無法將檔案儲存在APP目錄下。
	// 另外安裝包也比較適合放在 home directory 之下。
	// test_current_directory: 先嘗試下載於當前目錄下。
	function determin_download_directory(test_current_directory) {
		var download_directory = test_current_directory
				&& library_namespace.platform.nodejs && require.main
				&& require.main.filename;
		if (download_directory
		// macOS dmg electron APP 中: require.main.filename 例如為
		// /Applications/work_crawler.app/Contents/Resources/app.asar/gui_electron/gui_electron.html
		//
		// Linux Mint 中 AppImage: require.main.filename 例如為
		// /tmp/.mount_work_cWtD4AY/resources/app.asar/gui_electron/gui_electron.html
		//
		// Linux Mint 中 electron: require.main.filename 例如為
		// .../work_crawler-master/gui_electron/gui_electron.html
		//
		// Windows 10 中 electron: require.main.filename 例如為
		// ...\work_crawler\gui_electron\gui_electron.html
		//
		// 2021/4/20 11:36:5 require.main===undefined @ new electron-builder
		// package
		// may use `module.filename`
		// in electron-builder package: e.g.,
		// "C:\Users\user_name\AppData\Local\Programs\work_crawler\resources\app.asar\gui_electron\gui_electron.html"
// NOT in electron-builder package: e.g.,
		// "/program/work_crawler/gui_electron/gui_electron.html"
		&& !/\.html?$/i.test(download_directory)) {
			download_directory = download_directory.match(/[^\\\/]+$/)[0]
					.replace(/\.js$/i, '');

		} else if (test_current_directory && (download_directory =
		// 避免 "/". e.g., macOS dmg APP 中 process.cwd() === '/'
		_.working_directory().replace(/[\\\/]+$/, ''))) {
			;

		} else if (download_directory = library_namespace.env.home) {
			if ([ 'Downloads', '下載' ]
			// '下載': Linux Mint
			.some(function(user_download_directory) {
				user_download_directory = append_path_separator(
						download_directory, user_download_directory);
				if (_.directory_exists(user_download_directory)) {
					download_directory = user_download_directory;
					return true;
				}
			})) {
				library_namespace.debug('預設的主要下載目錄設置於用戶預設之下載目錄下: '
						+ download_directory, 1, 'determin_download_directory');

			} else {
				library_namespace.debug(
				// 家目錄 @see os.userInfo().homedir , os.homedir()
				'預設的主要下載目錄設置於用戶個人文件夾  home directory 下: ' + download_directory,
						1, 'determin_download_directory');
			}

		} else {
			// 應該不會到這邊來。
			library_namespace
					.warn('determin_download_directory: Cannot determin main download directory!');
			download_directory = '.';
		}

		// main_directory 必須以 path separator 作結。
		download_directory = append_path_separator(download_directory);
		library_namespace.debug('預設的主要下載目錄: ' + download_directory, 1,
				'determin_download_directory');
		return download_directory;
	}

	_.determin_download_directory = determin_download_directory;

	return (_// JSDT:_module_
	);
}
