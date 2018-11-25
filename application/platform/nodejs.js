/**
 * @name CeL function for Node.js
 * @fileoverview 本檔案包含了 Node.js 專用的 functions。
 * 
 * use 'application.storage' instead
 * 
 * @since
 */

'use strict';
// 'use asm';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// TODO: 使用此名稱，在 include 時可能沖到原先的 CeL.platform!!
	// module name
	name : 'application.platform.nodejs',

	// 設定不匯出的子函式。
	// no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// http://nodejs.org/api/process.html
	if (!library_namespace.platform.nodejs) {
		library_namespace.warn('Error loading ' + this.name
				+ ': Not in Node.js?');
		// library_namespace.set_debug();
		library_namespace.debug('typeof process: ' + typeof process);
		library_namespace.debug('process.title: ' + process.title);
		library_namespace.debug('typeof global: ' + typeof global);
		library_namespace.debug('typeof require: ' + typeof require);

		return;
	}

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

	/** {String}path separator. e.g., '/', '\' */
	var path_separator = library_namespace.env.path_separator,
	// placeholder for library_namespace.storage.append_path_separator()
	append_path_separator = function(directory_path, file_name) {
		if (library_namespace.append_path_separator)
			return (append_path_separator = library_namespace.append_path_separator)
					.apply(null, arguments);
		return directory_path + path_separator + (file_name || '');
	};

	// set/get current working directory. 設定/取得目前工作目錄。
	function working_directory(change_to_directory) {
		if (change_to_directory)
			process.chdir(change_to_directory);
		return append_path_separator(process.cwd());
	}
	_.working_directory = working_directory;

	/** const node.js file system module */
	var node_fs = require('fs'), child_process = require('child_process');

	// TODO: 規範化
	function fs_status(file_path, with_error) {
		var file_status;
		try {
			return node_fs.lstatSync(file_path);
		} catch (e) {
			if (with_error) {
				return e;
			}
		}
	}
	_.fs_status = fs_status;

	_.file_exists = function file_exists(file_path) {
		var fso_status = fs_status(file_path);
		return fso_status
				&& (fso_status.isFile() || fso_status.isSymbolicLink());
	};

	function directory_exists(directory_path) {
		var fso_status = fs_status(directory_path);
		return fso_status && fso_status.isDirectory();
	}
	_.directory_exists = directory_exists;

	function copy_attributes(source, target) {
		var file_status;
		try {
			// TODO: fs.stat can not read a filename includes U+FBC6 "?"
			file_status = node_fs.statSync(source);
			node_fs.utimesSync(target, file_status.atime, file_status.mtime);
		} catch (e) {
			return e;
		}
	}
	_.copy_attributes = copy_attributes;

	function fs_copy(source, target, callback, overwrite) {
		if (!callback)
			callback = function(error) {
				if (false) {
					library_namespace.log(source + '\n->\n' + target);
				}
				if (error) {
					library_namespace.error(error);
				}
			};

		if (node_fs.existsSync(target))
			if (overwrite) {
				node_fs.unlinkSync(path);
			} else {
				callback();
			}

		// 2016/8/18 20:5:5 可採用 fs.ReadStream.prototype.bytesRead
		var source_stream = node_fs.createReadStream(source),
		//
		target_stream = node_fs.createWriteStream(target);

		source_stream.on("error", callback);
		target_stream.on("error", callback);
		target_stream.on("close", function() {
			copy_attributes(source, target);
			callback();
		});

		source_stream.pipe(target_stream);
	}
	_.fs_copy = fs_copy;

	// returns undefined if successful
	function fs_copySync(source, target, overwrite) {
		// destination
		if (node_fs.existsSync(target))
			if (overwrite) {
				node_fs.unlinkSync(target);
			} else {
				return new Error('Target file exists: [' + target + ']!');
			}

		// TODO: use fs.createReadStream(), fs.createWriteStream(, {mode})
		// https://github.com/coderaiser/fs-copy-file/blob/master/lib/fs-copy-file.js
		var buffer_length = 1 * 1024 * 1024,
		//
		buffer = Buffer.allocUnsafe(buffer_length),
		//
		source_descriptor = node_fs.openSync(source, 'r'),
		//
		target_descriptor = node_fs.openSync(target, 'w'),
		//
		bytesRead, position = 0;

		while (0 < (bytesRead
		//
		= node_fs.readSync(source_descriptor, buffer, 0, buffer_length,
				position))) {
			node_fs.writeSync(target_descriptor, buffer, 0, bytesRead);
			position += bytesRead;
		}
		node_fs.closeSync(source_descriptor);
		node_fs.closeSync(target_descriptor);

		copy_attributes(source, target);
	}
	_.fs_copySync = node_fs.copyFileSync ? function(source, target, overwrite) {
		try {
			node_fs.copyFileSync(source, target, overwrite ? 0
					: node_fs.constants.COPYFILE_EXCL);
		} catch (e) {
			// TODO: handle exception
		}
	} : fs_copySync;

	/**
	 * create directory / directories
	 * 
	 * @param {String|Array}directories
	 *            directory name
	 * 
	 * @returns error count
	 */
	function create_directory(directories, mode) {
		// var node_fs = require('fs');
		var error = [];
		if (typeof directories === 'string') {
			directories = [ directories ];
		}
		directories.forEach(function(directory_name) {
			try {
				directory_name
				//
				&& node_fs.accessSync(directory_name, node_fs.F_OK
				//
				| node_fs.R_OK | node_fs.W_OK | node_fs.X_OK);
			} catch (e) {
				try {
					if (library_namespace.platform.is_Windows()
							&& directory_name.endsWith('.')) {
						library_namespace
								.warn('以點 "." 作為結尾的目錄名稱，將導致沒有辦法刪除或者複製: '
										+ directory_name);
					}
					if (isNaN(mode)) {
						mode = parseInt('700', 8)
								| (parseInt('777', 8) ^ process.umask());
					}
					node_fs.mkdirSync(directory_name, mode);
				} catch (e) {
					if (e.code !== 'EEXIST')
						;
					library_namespace.debug('Error to create ' + directory_name
							+ ': ' + e, 1, 'create_directory');
					error++;
				}
			}
		});
		return error;
	}
	_.fs_mkdir = create_directory;

	/**
	 * remove path list.
	 * 
	 * @param {Array}list
	 *            path list.
	 * @param {Array}parent
	 *            parent directory
	 * 
	 * @returns error
	 * 
	 * @inner
	 */
	function remove_fso_list(list, recurse, parent) {
		if (parent) {
			parent = append_path_separator(parent);
		}

		var error;
		list.some(function(fso_name) {
			// recurse, iterative method
			return error = remove_fso(parent ? parent + fso_name : fso_name,
					recurse);
		});
		return error;
	}

	/**
	 * remove file / directory recursively.<br />
	 * 若有需要先刪除之子檔案列表，需要把母directory置於Array最末尾。
	 * 
	 * 注意：改變API時需要順便修訂CeL.application.storage中的remove_file。
	 * 
	 * TODO: 有時操作來不及，會出現錯誤，需要 flush disk cache。<br />
	 * TODO: 處理強制刪除force，例如無視唯讀屬性。<br />
	 * 
	 * @param {String|Array}path
	 *            file / directory name
	 * 
	 * @see https://github.com/isaacs/rimraf/blob/master/rimraf.js
	 */
	function remove_fso(path, recurse) {
		if (Array.isArray(path)) {
			return remove_fso_list(path, recurse);
		}

		try {
			/**
			 * The lstat() system call is like stat() except in the case where
			 * the named file is a symbolic link, in which case lstat() returns
			 * information about the link, while stat() returns information
			 * about the file the link references.
			 */
			var fso_status = node_fs.lstatSync(path);
			// https://nodejs.org/api/fs.html#fs_class_fs_stats
			if (!fso_status.isDirectory()) {
				library_namespace
						.debug('Remove file: ' + path, 1, 'remove_fso');
				// delete file, link, ...
				node_fs.unlinkSync(path);
				return;
			}

			// 設定recurse/force時才會recurse操作。
			if (recurse) {
				library_namespace.debug('recurse remove sub-fso of ' + path, 2,
						'remove_fso');
				var error
				// recurse, iterative method
				= remove_fso_list(node_fs.readdirSync(path), recurse, path);
				if (error) {
					return error;
				}
			}

			library_namespace.debug('Remove directory: ' + path, 1,
					'remove_fso');
			// delete directory itself.
			node_fs.rmdirSync(path);

		} catch (e) {
			// https://nodejs.org/api/errors.html
			if (e.code === 'EPERM') {
				// TODO: .chmodSync(path, 666) @ Windows??
				;
			}
			if (e.code === 'EBUSY') {
				// TODO
				;
			}
			if (e.code === 'ENOTEMPTY') {
				// TODO: 可能有其他原因不能刪除子物件？
				;
			}
			if (e.code !== 'ENOENT') {
				return e;
			}
		}

		return;
	}
	// _.fs_delete, _.fs_rmdir
	_.fs_remove = remove_fso;

	var KEY_auto_detect_encoding = 'auto',
	// https://en.wikipedia.org/wiki/Byte_order_mark#Byte_order_marks_by_encoding
	// TODO: more detecting, @see guess_encoding()
	// "binary", "iso2022", "iso88591", "usascii", "utf7"
	BOM_to_encoding = {
		// e.g., Excel 將活頁簿儲存成 "Unicode 文字"時的正常編碼為 UTF-16LE
		fffe : 'utf16le',
		// byte order mark (BOM) of UTF-16BE Unicode Big-endian
		feff : 'utf16be',
		// byte order mark (BOM) of UTF-8: 0xEF,0xBB,0xBF
		efbbbf : 'utf8'
	}, BOM_list = Object.keys(BOM_to_encoding),
	//
	max_BOM_length = BOM_list.reduce(function(length, BOM) {
		// assert: BOM.length / 2 | 0 === BOM.length / 2
		return Math.max(length, Math.ceil(BOM.length / 2));
	}, 0);

	/**
	 * fs.readFileSync() without throw.
	 * 
	 * @param {String}file_path
	 *            file path.
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @returns {String}檔案內容
	 * @returns {Undefined}error occurred
	 */
	function fs_readFileSync(file_path, options) {
		// auto detect encoding
		var auto_detect_encoding;
		if (options === KEY_auto_detect_encoding) {
			options = null;
			auto_detect_encoding = true;
		} else if (options && options.encoding === KEY_auto_detect_encoding) {
			// delete options.encoding
			options.encoding = null;
			auto_detect_encoding = true;
		}
		try {
			// TODO:
			// https://github.com/sonicdoe/detect-character-encoding
			var buffer = node_fs.readFileSync(file_path, options);
			if (auto_detect_encoding) {
				var BOM = buffer.slice(0, max_BOM_length).toString('hex');
				if (BOM_list.every(function(BOM_key) {
					if (!BOM.startsWith(BOM_key))
						return true;
					// 去掉 BOM
					// assert: BOM.length / 2 | 0 === BOM.length / 2
					buffer = buffer.slice(BOM_key.length / 2).toString(
							BOM_to_encoding[BOM_key]);
				})) {
					buffer = buffer.toString();
				}
			}
			return buffer;
		} catch (e) {
			if (library_namespace.is_debug()) {
				library_namespace.error(e);
			}
			// return e;
		}
	}
	_.fs_read = fs_readFileSync;

	/**
	 * 取得 .json 檔案內容，並回傳 {Object} 或錯誤時回傳 undefined。
	 * 
	 * @param {String}file_path
	 *            file path.
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @returns {Object}JavaScript object
	 * @returns {Undefined}錯誤時回傳
	 */
	function get_JSON_file(file_path, options) {
		if (!/\.[^.\\\.]+$/i.test(file_path)
		// auto add filename extension
		&& (!options || !options.no_add_extension)) {
			file_path += '.json';
		}
		var json = fs_readFileSync(file_path, options);
		try {
			if (json && (json = json.toString())) {
				return JSON.parse(json);
			}
		} catch (e) {
			// SyntaxError: Invalid JSON
			if (library_namespace.is_debug())
				library_namespace.error(e);
		}
	}
	_.get_JSON = get_JSON_file;

	/**
	 * fs.writeFileSync() without throw.
	 * 
	 * @example <code>
	CeL.fs_write(path, data, 'utf8');
	 * </code>
	 * 
	 * @param {String}file_path
	 *            file path.
	 * @param data
	 *            data to write.
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @returns error
	 */
	function fs_writeFileSync(file_path, data, options) {
		if (library_namespace.is_Object(data)
		// JSON.stringify() 放在 try 外面。這樣出現 circular structure 的時候才知道要處理。
		&& /.json$/i.test(file_path)) {
			// 自動將資料轉成 string。
			data = JSON.stringify(data);
		}

		try {
			node_fs.writeFileSync(file_path, data, options);
		} catch (e) {
			if (library_namespace.is_debug()) {
				library_namespace.error('fs_writeFileSync: Can not save data!');
				library_namespace.error(e);
			}
			return e;
		}
	}
	_.fs_write = fs_writeFileSync;

	/**
	 * move file, fs.renameSync() without throw.
	 * 
	 * WARNING: If the target path already exists, it will be overriden.
	 * https://linux.die.net/man/2/rename
	 * 
	 * @param {String}move_from_path
	 *            old file path.
	 * @param {String}move_to_path
	 *            new file path.
	 * 
	 * @returns error
	 */
	function fs_renameSync(move_from_path, move_to_path, base_path) {
		if (base_path) {
			base_path = append_path_separator(base_path);
			move_from_path = base_path + move_from_path;
			move_to_path = base_path + move_to_path;
		}
		try {
			node_fs.renameSync(move_from_path, move_to_path);
		} catch (e) {
			return e;
		}
	}
	_.fs_move = fs_renameSync;

	// --------------------------------------------

	if (false) {
		require('./_for include/node.loader.js');
		CeL.run('application.platform.nodejs');

		CeL.traverse_file_system('.', function(path, fso_status, is_directory) {
			console.log(path);
		}, /\.js$/);
	}

	// https://github.com/coolaj86/node-walk
	// https://github.com/oleics/node-filewalker/blob/master/lib/filewalker.js
	function traverse_file_system(path, handler, options, depth) {
		// 前置處理。
		if (library_namespace.is_RegExp(options)) {
			options = {
				filter : options
			};
		} else if (!library_namespace.is_Object(options)) {
			options = library_namespace.null_Object();
		}

		if (isNaN(depth)) {
			depth = Infinity;
		} else if (!(depth >= 1)) {
			depth = options.depth | 0;
		}
		if (!(depth-- >= 1)) {
			// depth === 1: 僅到本層為止。
			return;
		}

		var filter = library_namespace.is_RegExp(options.filter)
				&& options.filter,
		//
		list;
		try {
			list = node_fs.readdirSync(path);
		} catch (e) {
			library_namespace.debug('Not exists: ' + path);
			return;
		}
		// treat path as directory
		path = append_path_separator(path);

		// console.log([ depth, filter ]);
		// console.log(list);

		list.forEach(function(fso_name) {
			try {
				var full_path = path + fso_name,
				// https://nodejs.org/api/fs.html#fs_class_fs_stats
				fso_status = node_fs.lstatSync(full_path),
				// else: e.g., is file
				is_directory = fso_status.isDirectory();

				// 設定額外的屬性以供利用。
				fso_status.name = fso_name;
				fso_status.directory = path;

				// Depth-first search (DFS)
				if (is_directory) {
					traverse_file_system(full_path, handler, options, depth);
				}

				if (!filter || filter.test(fso_name)) {
					handler(full_path, fso_status, is_directory);
				}

			} catch (e) {
				// https://nodejs.org/api/errors.html
				if (e.code === 'EPERM') {
					// TODO: .chmodSync(path, 666) @ Windows??
					;
				}
				if (e.code === 'EBUSY') {
					// TODO
					;
				}
				if (e.code !== 'ENOENT') {
					;
				}
			}
		});

		library_namespace.debug('處理完畢: ' + path, 2, 'traverse_file_system');
	}

	_.traverse_file_system = traverse_file_system;

	// --------------------------------------------

	// e.g., '123', '-123', '+12.34', '-.123'
	var PATTERN_number_string = /^[+\-]?(?:\d{1,20}(?:\.\d{1,20})?|\.\d{1,20})$/,
	// 在命令列設定這些值時，將會被轉換為所指定的值。
	// 若是有必要將之當作字串值，必須特地加上引號。
	arg_conversion = {
		'true' : true,
		'false' : false,

		'Infinity' : Infinity,
		'infinity' : Infinity,

		'null' : null,
		'undefined' : undefined
	};

	/**
	 * command line arguments 指令列參數
	 * 
	 * https://github.com/nodejs/node/blob/master/doc/changelogs/CHANGELOG_V10.md#10.12.0
	 * The options parser now normalizes "_" to "-"; --no_warnings has the same
	 * effect as --no-warnings
	 * 
	 * test code: <code>
	 * '-h|--help|-f=|--file=|-f=File|--file=File|File|file=File'.split('|').forEach(function(arg) { console.log(arg.match(/^(-{0,2})([^=]+?)(=(.*))?$/)); });
	 * </code>
	 */
	if (process.argv && process.argv.length > 2) {
		// CeL.env.argv: see module.js
		process.argv.slice(2).forEach(function(arg) {
			var matched = arg.match(/^(-{0,2})([^=]+?)(=(.*))?$/);
			if (matched[2].startsWith('-')) {
				console.warn(
				//
				'platform.nodejs: Invalid argument: [' + arg + ']');
				this[arg] = true;
				return;
			}

			if (!matched[3]) {
				// e.g., "script.js force": force=true
				this[matched[2]] = true;
				return;
			}

			var value = matched[4];
			this[matched[2]] = (value in arg_conversion)
			// 若是有必要將之當作字串值，必須特地加上引號。
			? arg_conversion[value]
			// treat as number
			: PATTERN_number_string.test(value) ? +value
			//
			: value;
		}, library_namespace.env.arg_hash
		// ↑ use ((CeL.env.arg_hash)) to get command line arguments
		= library_namespace.null_Object());
	}

	// --------------------------------------------

	// WshShell.ExpandEnvironmentStrings()
	function ExpandEnvironmentStrings(string) {
		return string.replace(/%([a-z_]+)%/ig, function(all, variable) {
			return process.env.variable === undefined ? all
					: process.env.variable;
		});
	}

	/**
	 * search $PATH, 搜尋可執行檔案的完整路徑。
	 * 
	 * @example <code>
	// cache the path of p7z executable file
	var p7zip_path = CeL.executable_file_path('7z')
		|| '%ProgramFiles%\\7-Zip\\7z.exe';
	 * </code>
	 * 
	 * @param {String}file_name
	 *            要搜尋的執行檔名。
	 * @param {Array}[search_path_list]
	 *            搜尋這些目錄路徑。
	 * 
	 * @returns {String}可執行檔案的完整路徑。
	 * 
	 * @see GitHub.updater.node.js
	 */
	function executable_file_path(file_name, search_path_list) {
		if (!file_name)
			return;

		if (!Array.isArray(search_path_list)) {
			search_path_list = String(search_path_list
			// Unix: process.env.PATH, Windows: process.env.Path
			|| process.env.PATH
			// /usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:.
			|| '');

			// Unix: ':', Windows: ';'
			search_path_list = search_path_list.split(search_path_list
			// e.g., "C:\"
			.includes(':\\') ? ';' : ':');
			if (library_namespace.platform('windows')) {
				// windows 會自動搜尋當前目錄 ".\\" 下的執行檔。
				search_path_list.push('');
			}
		}

		if (Array.isArray(file_name)) {
			file_name.some(function(_file_name) {
				return file_name = executable_file_path(_file_name,
						search_path_list);
			})
			return file_name;
		}

		// is absolute path
		var is_absolute_path;

		// assert: {String}file_name
		if (library_namespace.platform('windows')) {
			// 直接給予包括 %environment variable% 的路徑名稱，在 Windows 下不用
			// WshShell.ExpandEnvironmentStrings() 解析，亦可正常 **執行**。
			// 但是採用 fs_status() 無法正常作動。
			if (false && /%[a-z_]+%/i.test(file_name)) {
				// TODO: using process.env.ProgramFiles
				if (library_namespace.is_debug())
					library_namespace
							.warn('executable_file_path: Can not handle '
									+ file_name);
				return file_name;
			}
			// e.g., "%ProgramFiles%\\7-Zip\\7z.exe"
			file_name = ExpandEnvironmentStrings(file_name);

			if (/^[a-z]:\\/i.test(file_name)) {
				is_absolute_path = true;
			}

		} else if (file_name.startsWith('/')) {
			is_absolute_path = true;
		}

		if (is_absolute_path)
			return fs_status(file_name) && file_name;

		// console.log(search_path_list);
		if (search_path_list
		// .unique()
		.some(function(directory) {
			// directory === '': './'
			if (directory && !directory_exists(directory)) {
				return;
			}

			var exec_file_path = append_path_separator(directory || '.',
					file_name);
			// console.log('Test: ' + exec_file_path);
			var fso_status = fs_status(exec_file_path);
			if (!fso_status && library_namespace.platform('windows')
			// env.PATHEXT @ Windows:
			// .COM;.EXE;.BAT;.CMD;.VBS;.VBE;.JS;.JSE;.WSF;.WSH;.MSC
			&& !/\.(?:exe|com|bat|cmd)$/i.test(exec_file_path)) {
				fso_status = fs_status(exec_file_path + '.exe')
						|| fs_status(exec_file_path + '.com');
			}
			// TODO: 應該測試是否可以執行。
			if (fso_status) {
				file_name = exec_file_path;
				return true;
			}
		})) {
			return file_name;
		}
	}

	_.executable_file_path = executable_file_path;

	// --------------------------------------------

	// encode: ASCII string → Base64
	// https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/btoa
	// https://gist.github.com/jmshal/b14199f7402c8f3a4568733d8bed0f25
	// btoa 僅支持 ASCII
	function btoa(stringToEncode) {
		return Buffer.from(stringToEncode).toString('base64');
	}

	// decode: Base64 → ASCII string
	// https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/atob
	function atob(encodedData) {
		return Buffer.from(encodedData, 'base64').toString('binary');
	}

	// --------------------------------------------

	// 為 electron-builder 安裝包
	var is_installation_package = process.env.Apple_PubSub_Socket_Render
			// @ Windows, Linux Mint
			|| process.mainModule
			&& process.mainModule.filename.replace(/[\\\/]app\.asar.+/, '') === process.resourcesPath
			&& library_namespace.platform.OS;

	_.is_installation_package = function() {
		return is_installation_package;
	};

	// --------------------------------------------

	function run_JSctipt(code, options) {
		if (!library_namespace.platform('windows')) {
			library_namespace
					.error('run_JSctipt: Only executing under Windows!');
			return;
		}

		// 前置處理。
		if (typeof options === 'string') {
			options = {
				result_file_name : options
			};
		} else {
			options = library_namespace.setup_options(options);
		}

		var script_file = append_path_separator(library_namespace.env.TEMP
				|| library_namespace.env.TMP || '.', 'run_JSctipt.'
				+ Math.random() + '.js');
		// console.log('script_file: ' + script_file);
		remove_fso(script_file);
		if (options.attach_library) {
			// console.log('attach library code: ' + run_JSctipt.library_code);
			code = run_JSctipt.library_code + code;
		}
		var BOM = Buffer.from('fffe', 'hex');
		code = Buffer.from(code, 'utf16le');
		fs_writeFileSync(script_file, Buffer.concat([ BOM, code ], BOM.length
				+ code.length));

		var result, result_file_name = options.result_file_name;
		if (result_file_name) {
			remove_fso(result_file_name);
		}

		try {
			result = child_process.spawnSync('CScript.exe', [ '//Nologo',
					script_file ]);
		} catch (e) {
			// TODO: handle exception
		}
		// 去掉暫存檔(執行檔)
		remove_fso(script_file);

		if (result_file_name) {
			// console.log('result_file_name: ' + result_file_name);
			var result = /\.json$/i.test(result_file_name) ? get_JSON_file(
					result_file_name, 'auto') : fs_readFileSync(
					result_file_name, 'auto');
			remove_fso(result_file_name);
			// console.log(result);
			return result;
		}

		return result;
	}

	_.run_JSctipt = run_JSctipt;

	// 常用函數集。
	run_JSctipt.library_code = "var WshShell=WScript.CreateObject('WScript.Shell'),FSO=WScript.CreateObject('Scripting.FileSystemObject'),WshProcessEnv=WshShell.Environment('Process'),"
			// https://msdn.microsoft.com/ja-jp/library/cc364502.aspx
			+ "tmp_dir=(WshProcessEnv('TEMP')||WshProcessEnv('TMP'))+'\\\\',"
			// https://stackoverflow.com/questions/4388879/vbscript-output-to-console
			+ "console={_stdout:FSO.GetStandardStream(1),_stderr:FSO.GetStandardStream(2),"
			// + "log:function(m){console._stdout.WriteLine(m);},"
			+ "log:function(m){WScript.Echo(m);},"
			+ "error:function(m){console._stderr.WriteLine(m);}};"
			+ "function add_quote(text){return '\"'+text.replace(/([\"\\\\])/g,'\\\\$1').replace(/[^\u0020-\u007e]/g,function($){$=$.charCodeAt(0).toString(16);return '\\\\u0000'.slice(0,-$.length)+$;})+'\"';}"
			+ "function RegRead(key){try{return WshShell.RegRead(key);}catch(e){}}"
			// WshShell.ExpandEnvironmentStrings('%TEMP%\\\\file_name')
			// 2: ForWriting, -1: TristateTrue (Opens the file as Unicode)
			+ "function write_file(file_name,content){var file=FSO.OpenTextFile(file_name,2,-1);content&&file.Write(content);file.Close();}";

	// --------------------------------------------------------

	// TODO:
	// Buffer.prototype.indexOf()
	// https://github.com/nodejs/node/blob/master/lib/buffer.js#L578

	function export_function() {
		library_namespace.set_method(node_fs, {
			copy : fs_copy,
			copySync : fs_copySync
		}, null);
	}
	_['export'] = export_function;

	// 當 require('fs') 得到同一 instance 時，才作 export。
	if (node_fs === require('fs')) {
		export_function();
	}

	library_namespace.set_method(library_namespace.env.global, {
		btoa : btoa,
		atob : atob
	}, null);

	return (_// JSDT:_module_
	);
}
