/**
 * @name CeL functions for archive file.
 * @fileoverview 本檔案包含了壓縮封裝/抽取抽出 compress / extract archive file 的 functions。
 * 
 * 注意: 這需要先安裝 7z.exe 程式。
 * 
 * 注意: macOS 下似乎可用 / 與 \ 作目錄名稱?
 * 
 * <code>

// {Object|String}options.switches: additional command line switches to list
archive_file = new CeL.application.storage.archive('file.zip',
		callback);
archive_file = new CeL.application.storage.archive('file.7z',
		callback, options);
archive_file = new CeL.application.storage.archive('file.rar',
		callback);

// {String}
archive_file.program = executable_file_path['7z'];
archive_file.execute(switches, callback);

//  FSO status hash get from archive_file.info()
archive_file.fso_path_hash = { FSO path : {FSO data}, ... }
archive_file.information = { archive information }

// list FSOs, get FSO status hash
// callback({fso_status});
// fso_status = {path:'',name:'',size:0,modify:{Date},create:{Date}}
archive_file.info(options, callback);
archive_file.info(options, callback);

// compress / add new FSOs to archive_file
// {Object|String}options.switches: additional command line switches
archive_file.update([ file/folder list to compress, add, update ], options, callback);
archive_file.update([ file/folder list to compress, add, update ], {
	type : 'zip',
	// level of compression, compression method
	// '' as -mx
	level : '',
}, callback);

archive_file.remove([ to_delete ]);
archive_file.remove([ to_delete ], options, callback);

// {Array|String}options.list: FSO path list to extract
// {Object|String}options.switches: additional command line switches
archive_file.extract({output : target_directory}, callback);
archive_file.extract([ files to extract ], {output : target_directory, other options}, callback);

// 請注意： rename 必須先安裝 7-Zip **16.04 以上的版本**。
// {Array}pairs=[from,to,from,to]
// TODO: {Object}pairs={from:to,from:to}
archive_file.rename(pairs, callback);

TODO:

// test archive_file
// {Object|String}options.switches: additional command line switches
// {String}options.switches.password: password
archive_file.verify(options, callback);

// https://github.com/ObjSal/p7zip/blob/master/GUI/Lang/ja.txt

 </code>
 * 
 * @see CeL.application.OS.Windows.archive
 * @see https://github.com/quentinrossetti/node-7z https://stuk.github.io/jszip/
 * 
 * @since 2018/3/4 13:57:28
 * @since 2018/3/8 19:59:47 初步可用
 */

'use strict';
// 'use asm';

// --------------------------------------------------------------------------------------------

if (typeof CeL === 'function') {
	// 忽略沒有 Windows Component Object Model 的錯誤。
	CeL.env.ignore_COM_error = true;

	CeL.run({
		// module name
		name : 'application.storage.archive',

		// .includes() @ CeL.data.code.compatibility
		require : 'data.code.compatibility.'
		// run_JScript() @ CeL.application.platform.nodejs
		// executable_file_path() @ CeL.application.platform.nodejs
		+ '|application.platform.nodejs.',

		// 設定不匯出的子函式。
		no_extend : '*',

		// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
		code : module_code
	});
}

function module_code(library_namespace) {

	// requiring
	var path_separator = library_namespace.env.path_separator;
	var execSync = require('child_process').execSync;

	// --------------------------------------------------------------------------------------------

	// @see CeL.application.OS.Windows.execute
	// @see CeL.application.platform.nodejs.executable_file_path
	// search executable file path / 執行檔, `which`
	var executable_file_path = {
		// filename extension : executable file path

		// wrapper for 7-Zip
		// cache the path of p7z executable file
		// library_namespace.application.platform
		// .execute.search([ "7z", "p7z" ], "-h")
		'7z' : library_namespace.executable_file_path([ "7z", "p7z",
		/**
		 * <code>
		e.g., install p7zip package via yum:
		# sudo yum install epel-release
		# sudo yum install p7zip p7zip-plugins

		In Debian, Ubuntu, Linux Mint:
		# sudo apt-get install p7zip-full p7zip-rar

		In macOS: install https://www.keka.io/
		</code>
		 */
		"7za",
		// keka @ macOS
		"/Applications/Keka.app/Contents/Resources/keka7z",
				library_namespace.platform('windows')
				// '"' + (process.env.ProgramFiles || 'C:\\Program Files') +
				// '\\7-Zip\\7z.exe' + '"'
				&& "%ProgramFiles%\\7-Zip\\7z.exe" ]),

		rar : library_namespace.executable_file_path([ "rar",
				library_namespace.platform('windows')
				// WinRAR.exe
				&& "%ProgramFiles%\\WinRAR\\rar.exe" ])
	},
	// 預設的壓縮程式。
	default_program_type;

	if (!executable_file_path['7z'] && library_namespace.platform('windows')) {
		// @see GitHub.updater.node.js
		// 嘗試取得7-Zip的執行路徑
		// try to read 7z program path from Windows registry
		executable_file_path['7z'] = library_namespace
				.run_JScript(
						"var p7z_path='HKCU\\\\Software\\\\7-Zip\\\\Path';"
								// use stdout. 64 bit first.
								+ "console.log(add_quote(RegRead(p7z_path+64)||RegRead(p7z_path)));",
						{
							attach_library : true
						});
		if (false) {
			console.log('stdout: '
					+ executable_file_path['7z'].stdout.toString());
			console.log('stdout: '
					+ JSON.parse(executable_file_path['7z'].stdout.toString()));
			console.log('stderr: '
					+ executable_file_path['7z'].stderr.toString());
		}

		executable_file_path['7z'] = library_namespace
				.executable_file_path(JSON.parse(
						executable_file_path['7z'].stdout.toString()).trim()
						+ '7z.exe');
		// console.log(executable_file_path['7z']);
		if (executable_file_path['7z'])
			executable_file_path['7z'] = add_quote(executable_file_path['7z']);
		// console.log(executable_file_path['7z']);
	}

	Object.keys(executable_file_path).forEach(function(program_type) {
		var program_path = executable_file_path[program_type];
		// console.log(program_type + ': ' + program_path);
		if (program_path) {
			executable_file_path[program_type] = add_quote(program_path);
			if (!default_program_type) {
				// 挑選第一個可用的壓縮程式。
				default_program_type = program_type;
			}
		}
	});

	if (!executable_file_path['7z']
			// && !executable_file_path.rar
			&& (executable_file_path.zip = library_namespace
					.executable_file_path('zip'))
			&& (executable_file_path.unzip = library_namespace
					.executable_file_path('unzip'))) {
		// e.g., /usr/bin/zip Info-ZIP @ macOS
		// but Info-ZIP has NO rename function!
		executable_file_path.zip = add_quote(executable_file_path.zip);
		executable_file_path.unzip = add_quote(executable_file_path.unzip);
	}

	// TODO: https://pureinfotech.com/compress-files-powershell-windows-10/
	// ompress files using PowerShell

	function Archive_file(archive_file_path, options, callback) {
		if (!callback && typeof options === 'function') {
			// shift arguments.
			callback = options;
			options = null;
		}

		options = library_namespace.setup_options(options);

		this.archive_type = options.type;
		if (!this.archive_type) {
			var matched = archive_file_path.match(/\.([a-z\d\-_]+)$/i);
			if (matched)
				this.archive_type = matched[1].toLowerCase();
		}
		this.program_type = options.program_type || this.archive_type;
		if (!executable_file_path[this.program_type]) {
			this.program_type = default_program_type;
		}
		if (!apply_switches[this.program_type]) {
			this.unknown_type = true;
			library_namespace.error([
					'Archive_file: ',
					{
						T : [ 'Unknown type: %1, please install %2',
								this.program_type, default_program_type ]
					} ]);
		}

		// {String}this.program
		this.program = executable_file_path[this.program_type];

		this.archive_file_path = this.program_type === '7z'
		// 即使在 Windows 下，採用 "\" 作路徑分隔可能造成 7-Zip "系統找不到指定的檔案"錯誤。
		? archive_file_path.replace(/\\/g, '/') : archive_file_path;

		// for is_Archive_file()
		// this.constructor = Archive_file;

		if (typeof callback === 'function')
			callback(this, this.unknown_type && new Error('UNKNOWN_TYPE'));
	}

	function is_Archive_file(value) {
		// return value && value.constructor === Archive_file;
		return value instanceof Archive_file;
	}
	Archive_file.is_Archive_file = is_Archive_file;

	// --------------------------------------------------------------

	// 注意: 這邊添加引號的目的主要只是escape空白字元space " "，不能偵測原先輸入中的引號!
	function add_quote(arg) {
		if (library_namespace.is_Object(arg) && arg.path) {
			arg = arg.path;
		}
		return /^".*"$/.test(arg) ? arg : '"' + arg + '"';
	}

	function remove_quote(arg) {
		if (library_namespace.is_Object(arg) && arg.path) {
			arg = arg.path;
		}
		return /^".*"$/.test(arg) ? arg.slice(1, -1) : arg;
	}

	function archive_file_execute(switches, callback, FSO_list, operation,
			options) {
		var command = [ this.program ];
		if (Array.isArray(switches)) {
			command.push(switches.join(' '));
		} else if (library_namespace.is_Object(switches)) {
			// console.log(switches);
			for ( var switch_name in switches) {
				var value = switches[switch_name];
				if (typeof value === 'function') {
					value = value.call(this);
				}
				if (switch_name === 'program_path')
					command[0] = value;
				else if (value !== undefined && value !== null)
					command.push(value);
			}
		} else {
			// assert: String|Number
			command.push(switches);
		}

		if (this.program_type === '7z' || this.program_type === 'rar') {
			// Stop switches parsing, stop switches scanning
			command.push('--');
		}

		var operation_need_chdir = this.program_type === 'zip'
				&& operation === 'update';
		if (operation_need_chdir) {
			if (Array.isArray(FSO_list)) {
				FSO_list = FSO_list.map(remove_quote);
				FSO_list.unshift(remove_quote(this.archive_file_path));
			} else {
				FSO_list = [ this.archive_file_path, FSO_list ]
						.map(remove_quote);
			}
		} else
			command.push(add_quote(this.archive_file_path));

		var original_working_directory, using_working_directory;
		if (FSO_list) {
			if (!Array.isArray(FSO_list)) {
				FSO_list = [ FSO_list ];
			} else if (operation_need_chdir) {
				// By default, zip will store the full path (relative to the
				// current directory).

				// 這裡的處置可以使壓縮檔案時:
				// zip a/b/zipfile.zip a/b/c/files
				// 讓 zipfile 中的路徑(path,name)只有 "c/files"
				// 這樣可使壓縮行為和7z相同。
				var LCL = library_namespace
						.longest_common_starting_length(FSO_list);
				if (LCL > 0) {
					using_working_directory = FSO_list[0].slice(0, LCL)
					// assert: paths of FSO_list are not quoted
					.replace(/[^\\\/]+$/, '');
					if (using_working_directory) {
						LCL = using_working_directory.length;
						FSO_list = FSO_list.map(function(path) {
							return path.slice(LCL);
						});
						original_working_directory = process.cwd();
						process.chdir(using_working_directory);
					}
				}
			}
			FSO_list = FSO_list.map(add_quote).join(' ');
			if (this.program_type === '7z') {
				// 即使在 Windows 下，採用 "\" 作路徑分隔可能造成 7-Zip "系統找不到指定的檔案"錯誤。
				FSO_list = FSO_list.replace(/\\/g, '/');
			}
			command.push(FSO_list);
		}

		command = command.join(' ');
		library_namespace.debug({
			T : [ 'Working directory: %1',
					library_namespace.storage.working_directory() ]
		}, 1, 'archive_file_execute');
		library_namespace.debug(command, 1, 'archive_file_execute');
		try {
			var output = execSync(command);
			if (original_working_directory)
				// recover working directory.
				process.chdir(original_working_directory);
			// console.log(output.toString());
			if (typeof callback === 'function')
				try {
					// 預防 callback throw
					callback(output);
				} catch (e) {
					if (false) {
						console
								.trace('archive_file_execute: Callback execution error!');
					}
					library_namespace.error([ 'archive_file_execute: ', {
						T : 'Callback execution error!'
					} ]);
					library_namespace.error(e);
				}
			return output;
		} catch (e) {
			if (original_working_directory) {
				// recover working directory.
				process.chdir(original_working_directory);
			}
			if (false) {
				console.trace('archive_file_execute: ' + this.program_type
						+ ' execution error!');
			}
			library_namespace.error([ 'archive_file_execute: ', {
				T : [ '%1 execution error!', this.program_type ]
			} ]);
			library_namespace.error(e);
			if (typeof callback === 'function')
				callback(null, e);
			return;
		}
	}

	// --------------------------------------------------------------

	var FSO_list_operations = [ 'update', 'extract', 'remove', 'rename',
			'verify' ],
	// default switches, modifiers
	// program_type: { command : { switches } }
	default_switches = {
		'7z' : {
			// add compress_list
			update : {
				// use "a" to allow -sdel switch
				command : 'a -sccUTF-8 -scsUTF-8',
				type : function() {
					return '-t' + this.archive_type;
				},
				// recurse : '-r',
				level : '-mx=9',
			},
			extract : {
				command : 'x'
			},
			// delete
			remove : {
				command : 'd'
			},
			// get archive information / status
			info : {
				command : 'l -slt -sccUTF-8'
			},
			// 請注意： rename 必須先安裝 7-Zip **16.04 以上的版本**。
			rename : {
				command : 'rn'
			},
			// test
			verify : {
				command : 't'
			}
		},
		// Info-ZIP http://infozip.sourceforge.net/
		// https://linux.die.net/man/1/zip
		zip : {
			update : {
				// @ macOS
				// zip error:
				// Invalid command arguments (short option 'N' not supported)
				// (long option 'unicode' not supported)
				// unicode : '-UN=UTF8',

				// recurse : '-r',

				// Do not save extra file attributes such as “_MACOSX” or
				// “._Filename” and .ds store files.
				// 'no-extra' : '-X',

				level : '-9'
			},
			extract : {
				program_path : executable_file_path.unzip
			},
			// delete
			remove : {
				command : '-d'
			},
			info : {
				// TODO: zipinfo
				program_path : executable_file_path.unzip,
				command : '-l -v'
			},
			// test
			verify : {
				command : '-T'
			}
		},
		rar : {
		// TODO
		}
	};

	var apply_switches_handler = {
		'7z' : {
			type : function(value) {
				return '-t' + value;
			},
			level : function(value) {
				if (value === '')
					return '-mx';
				if (value === 'max')
					value = 9;
				if (value >= 0)
					return '-mx=' + value;
				return;
			},
			// Recurse subdirectories
			recurse : function(value) {
				if (value)
					return '-r' + (value === true ? '' : value);
			},
			// delete files after compression: for 7-Zip > 18.01?
			remove : function(value) {
				if (value)
					return '-sdel';
			},
			// destination directory path, output directory
			output : function(value) {
				if (value)
					return add_quote('-o' + value);
			},
			// temp directory 設置臨時工作目錄。
			work_directory : function(value) {
				return add_quote('-w' + value);
			},
			// additional switches
			extra : function(value) {
				if (value)
					return value;
			}
		},
		zip : {
			// delete files after compression
			remove : function(value) {
				if (value)
					// move into zipfile (delete files)
					return '-m';
			},
			level : function(value) {
				if (value === 'max')
					value = 9;
				if (value >= 0)
					return '-' + value;
				return;
			},
			// Recurse subdirectories
			recurse : function(value) {
				// recurse into directories
				if (value)
					return '-r';
			}
		},
		rar : {
			// TODO

			// additional switches
			extra : function(value) {
				if (value)
					return value;
			}
		}
	};

	var apply_switches = {
		rar : null,
		'7z' : null,
		zip : null
	};

	Object.keys(apply_switches).forEach(function(program_type) {
		if (apply_switches[program_type])
			return;

		apply_switches[program_type]
		// apply_switches_handler
		= function(operation, options) {
			var is_original = true,
			//
			switches = default_switches[program_type][operation];

			if (options) {
				for ( var switch_name in apply_switches_handler[program_type]) {
					if (switch_name in options) {
						if (is_original) {
							is_original = false;
							switches = Object.assign(
							//
							Object.create(null), switches);
						}
						switches[switch_name]
						//
						= apply_switches_handler[program_type][switch_name]
						//
						.call(this, options[switch_name]);
					}
				}
			}

			return switches;
		};
	});

	// --------------------------------------------------------------

	// .info() 共同可用的屬性:
	// path size modified method

	// Lists contents of archive.
	function parse_7z_info_output(output) {
		// console.log(output && output.toString());

		if (!output || !(output = output.toString())) {
			return output;
		}
		// console.log(output);

		// console.trace(this);

		// initialization
		this.information = undefined;
		// fso path hash
		this.fso_path_hash = Object.create(null);
		// fso_status_list, files of archive
		this.fso_status_list = [];

		// console.log(JSON.stringify(output));
		// console.log(JSON.stringify(output.split(/\r?\n\r?\n/)));
		output.split(/\r?\n\r?\n/).forEach(function(FSO_data_lines) {
			// console.log(JSON.stringify(FSO_data_lines));
			var FSO_data = Object.create(null);
			FSO_data_lines.split(/\r?\n|\r/).forEach(function(line) {
				var matched = line.match(/^([a-z\s]+)=(.*)$/i);
				if (matched) {
					FSO_data[matched[1].trim().toLowerCase()]
					//
					= matched[2].trim();
				}
			});
			// console.log(FSO_data);
			if (!FSO_data.path) {
				;

			} else if (this.information) {
				this.fso_status_list.push(FSO_data);
				if (this.fso_path_hash[FSO_data.path]) {
					CeL.warn('Duplicate FSO path: ' + FSO_data.path);
				}
				// FSO status hash get from archive_file.info()
				// archive_file.fso_path_hash = { FSO path : {FSO data}, ... }
				this.fso_path_hash[FSO_data.path] = FSO_data;

			} else {
				// assert: the first item is the archive file itself
				// archive_file.information = { archive information }
				this.information = FSO_data;

				// 對於壓縮檔案應該有的大小 'physical size' 不同於真正大小的情況，
				// 'tail size' 會記錄著壓縮檔案之後的尾端大小，
				// ['physical size']+.offset+['tail size']=壓縮檔案真正的大小。
			}
		}, this);

		return this.fso_path_hash;
	}

	// TODO: 警告: macOS 底下，無法讀取非latin字元!
	// https://github.com/nodejs/node/issues/2165
	// https://marcosc.com/2008/12/zip-files-and-encoding-i-hate-you/
	// Mac OS HFS+ use UTF-8 NFD, UTF-8-MAC
	// Windows or Linux will preserve and return NFC or NFD
	// 採用 output.normalize('NFD') 這個方法無效。
	function parse_zip_info_output(output) {
		// console.log(output && output.toString());

		if (!output || !(output = output.toString())) {
			return output;
		}
		// console.log(output);

		// console.trace(this);

		// initialization
		this.information = undefined;
		// fso path hash
		this.fso_path_hash = Object.create(null);
		// fso_status_list, files of archive
		this.fso_status_list = [];

		// console.log(JSON.stringify(output));
		// console.log(JSON.stringify(output.split(/\r?\n\r?\n/)));
		output = output.split(/\r?\n/);
		// "Archive: zipfile.zip"
		output.shift();
		// " Length Method Size Ratio Date Time CRC-32 Name"
		var headers = output.shift().trim().toLowerCase().split(/\s+/),
		//
		PATTERN = new RegExp('^\\s*'
				+ '([^\\s]+)\\s+'.repeat(headers.length - 1) + '(.+)$');
		if (headers[headers.length - 1] === 'name') {
			// 這邊應該會被執行到，否則恐怕是不一樣版本的zip，無法解析。
			headers[headers.length - 1] = 'path';
		}
		output.forEach(function(FSO_data_line) {
			// console.log(JSON.stringify(FSO_data_line));
			if (FSO_data_line.startsWith('--'))
				return;
			var matched = FSO_data_line.match(PATTERN);
			if (!matched)
				return;

			var FSO_data = Object.create(null);
			matched.shift();
			matched.forEach(function(data, index) {
				FSO_data[headers[index]] = data;
			});
			FSO_data.modified = FSO_data.date + ' ' + FSO_data.time;

			// console.log(FSO_data);
			if (!FSO_data.path) {
				;

			} else {
				this.fso_status_list.push(FSO_data);
				if (this.fso_path_hash[FSO_data.path]) {
					CeL.warn({
						T : [ 'Duplicate FSO path: %1', FSO_data.path ]
					});
				}
				// FSO status hash get from archive_file.info()
				// archive_file.fso_path_hash = { FSO path : {FSO data}, ... }
				this.fso_path_hash[FSO_data.path] = FSO_data;
			}
		}, this);

		return this.fso_path_hash;
	}

	var postfix = {
		'7z' : {
			info : parse_7z_info_output
		},
		zip : {
			info : parse_zip_info_output
		}
	}

	// --------------------------------------------------------------

	/**
	 * @inner
	 */
	function archive_file_operation(operation, options, callback, FSO_list) {
		if (!callback && typeof options === 'function') {
			// shift arguments.
			callback = options;
			options = null;
		}

		if (!default_switches[this.program_type][operation]) {
			var error = {
				T : [ '%1 未提供這種功能：%2', this.program_type, operation ]
			};
			if (operation !== 'rename') {
				library_namespace.error(error);
			} else {
				library_namespace.debug(error, 1, 'archive_file_operation');
			}
			// TODO: Localization
			error = this.program_type + ' has no operation: ' + operation;
			error = new Error(error);
			callback && callback(error);
			return error;
		}

		options = library_namespace.setup_options(options);

		var original_working_directory, original_archive_file_path;
		if (options.cwd) {
			// change working directory. e.g., 進入到壓縮檔所在的目錄來解壓縮。
			var using_working_directory = options.cwd, using_archive_file;
			if (is_Archive_file(using_working_directory)) {
				library_namespace.debug({
					T : [ '在壓縮檔所在目錄下操作 %1。', operation ]
				}, 1, 'archive_file_operation');
				using_archive_file = using_working_directory;
				using_working_directory = using_working_directory.archive_file_path
						.replace(/[^\\\/]+$/, '');
			}
			using_working_directory = using_working_directory.replace(
					/^(\.[\\\/])+/, '').replace(/[\\\/]+$/, '');

			if (using_working_directory
					&& using_working_directory !== '.'
					&& library_namespace
							.directory_exists(using_working_directory)) {
				original_working_directory = process.cwd();
				if (original_working_directory === using_working_directory) {
					original_working_directory = null;
				} else {
					library_namespace.debug({
						T : [ 'Changing working directory: [%1]→[%2]',
								original_working_directory,
								using_working_directory ]
					}, 1, 'archive_file_operation');
					process.chdir(using_working_directory);
				}
			}
			if (using_archive_file) {
				if (original_working_directory) {
					original_archive_file_path = using_archive_file.archive_file_path;
					using_archive_file.archive_file_path = using_archive_file.archive_file_path
							.match(/[^\\\/]+$/)[0];
				} else {
					using_archive_file = null;
				}
			}
		}

		var _this = this, switches = apply_switches[this.program_type].call(
				this, operation, options),
		//
		_postfix = postfix[this.program_type]
				&& postfix[this.program_type][operation],
		// @see archive_file_execute()
		output = this.execute(switches,
		//
		callback && _postfix ? function(output) {
			// console.log(output.toString());
			callback(_postfix.call(_this, output));
		} : callback, FSO_list, operation, options);

		if (original_working_directory) {
			// recover working directory.
			process.chdir(original_working_directory);
			using_archive_file.archive_file_path = original_archive_file_path;
		}

		return _postfix ? _postfix.call(this, output) : output;
	}

	Archive_file.prototype = {
		// default switches
		switches : default_switches,
		execute : archive_file_execute
	};

	Object.keys(default_switches['7z']).forEach(function(operation) {
		if (!Archive_file.prototype[operation]) {
			Archive_file.prototype[operation]
			//
			= FSO_list_operations.includes(operation)
			// archive_file_wrapper_with_FSO_list
			? function(FSO_list, options, callback) {
				if (library_namespace.is_Object(FSO_list)
				// treat FSO_list as options
				&& !library_namespace.is_Object(options)) {
					// shift arguments.
					callback = options;
					options = FSO_list;
					FSO_list = null;
				}
				return archive_file_operation.call(this, operation,
				//
				options, callback, FSO_list);
			}
			//
			: function archive_file_wrapper(options, callback) {
				return archive_file_operation.call(this, operation,
				//
				options, callback);
			};
		}
	});

	// --------------------------------------------------------------

	// is relative path 為相對路徑
	function is_relative_path(path) {
		// e.g., '/usr'
		return !path.startsWith('/')
		// e.g., 'C:\\'
		&& !path.includes(':\\')
		// e.g., 'C:'
		&& !path.endsWith(':');
	}

	// 進到指定目錄下壓縮檔案。這個方法可以可以避免壓縮檔包含目錄前綴 prefix。
	// 注意: 這個方法會改變工作目錄! 因此不能用非同步 async 的方法。
	function archive_under(source_directory, archive_file_path, options) {
		if (typeof options === 'string') {
			options = {
				// type : 'zip',
				files : options
			};
		}

		// https://www.7-zip.org/faq.html
		// 7-Zip stores only relative paths of files without drive letter prefix

		var original_working_directory = library_namespace.storage
				.working_directory();
		// 注意: source_directory 前後有空白時會出問題。
		library_namespace.storage.working_directory(source_directory);

		if (typeof archive_file_path === 'string'
				&& is_relative_path(archive_file_path)) {
			// archive_file_path 為相對 original_working_directory 之 path。
			// 因為工作目錄已經改變，必須將 archive_file_path 改成絕對目錄。
			archive_file_path = library_namespace.append_path_separator(
					original_working_directory, archive_file_path);
		}

		var archive_file = is_Archive_file(archive_file_path) ? archive_file_path
				: new Archive_file(archive_file_path, options),
		//
		files_to_archive = options && options.files || '.';
		archive_file.update(files_to_archive, options);
		// recover working directory.
		library_namespace.storage.working_directory(original_working_directory);
		return archive_file;
	}

	Archive_file.archive_under = archive_under;

	// --------------------------------------------------------------

	// setup executable file path + default switches
	// CeL.application.storage.archive.WinRAR
	// CeL.application.storage.archive.7_zip

	// @see CeL.application.OS.Windows.archive
	// var archive_file;

	// --------------------------------------------------------------------------------------------

	// export 導出.

	return Archive_file;
}
