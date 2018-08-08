/**
 * @name CeL functions for archive file.
 * @fileoverview 本檔案包含了壓縮 compress / archive file 的 functions。
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
archive_file.hash = { FSO path : {FSO data}, ... }
archive_file.information = { archive information }

// list FSOs, get FSO status hash
// callback({fso_status});
// fso_status = {path:'',name:'',size:0,modify:{Date},create:{Date}}
archive_file.info(options, callback);
archive_file.info(options, callback);

// add new FSOs to archive_file
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

TODO:

// test archive_file
// {Object|String}options.switches: additional command line switches
// {String}options.switches.password: password
archive_file.verify(options, callback);

 </code>
 * 
 * @see CeL.application.OS.Windows.archive
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
		// library_namespace.application.platform.execute.search([ '7z', 'p7z'
		// ], '-h')
		'7z' : add_quote((library_namespace
				.executable_file_path([ '7z', 'p7z' ])
		//
		|| '%ProgramFiles%\\7-Zip\\7z.exe')),
		rar : '"' + (library_namespace.executable_file_path('rar')
		// WinRAR.exe
		|| '%ProgramFiles%\\WinRAR\\rar.exe') + '"'
	}, default_program_type = Object.keys(executable_file_path)[0];

	function Archive_file(archive_file_path, options, callback) {
		if (!callback && typeof options === 'function') {
			// shift arguments.
			callback = options;
			options = null;
		}

		options = library_namespace.setup_options(options);
		this.archive_file_path = archive_file_path;
		this.archive_type = options.type;
		if (!this.archive_type) {
			var matched = archive_file_path.match(/\.([a-z\d\-_]+)$/i);
			if (matched)
				this.archive_type = matched[1].toLowerCase();
		}
		this.program_type = options.program_type || this.archive_type;
		if (!(this.program_type in executable_file_path)) {
			this.program_type = default_program_type;
		}
		// {String}
		this.program = executable_file_path[this.program_type];

		if (typeof callback === 'function')
			callback(this);
	}

	// --------------------------------------------------------------

	function add_quote(arg) {
		if (library_namespace.is_Object(arg) && arg.path) {
			arg = arg.path;
		}
		return /^".*"$/.test(arg) ? arg : '"' + arg + '"';
	}

	function archive_file_execute(switches, callback, FSO_list) {
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
				if (value !== undefined && value !== null)
					command.push(value);
			}
		} else {
			// assert: String|Number
			command.push(switches);
		}

		if (this.program_type === '7z') {
			command.push('--');
		}

		command.push(add_quote(this.archive_file_path));

		if (FSO_list) {
			if (!Array.isArray(FSO_list)) {
				FSO_list = [ FSO_list ];
			}
			command.push(FSO_list.map(add_quote).join(' '));
		}

		command = command.join(' ');
		library_namespace.debug(command, 1, 'archive_file_execute');
		try {
			var output = execSync(command);
			// console.log(output.toString());
			if (typeof callback === 'function')
				try {
					// 預防 callback throw
					callback(output);
				} catch (e) {
					library_namespace.error(e);
				}
			return output;
		} catch (e) {
			if (typeof callback === 'function')
				callback(null, e);
		}
	}

	// --------------------------------------------------------------

	var FSO_list_operations = [ 'update', 'extract', 'remove', 'verify' ],
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
			// test
			verify : {
				command : 't'
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
				if (value >= 0)
					return '-mx=' + value;
				return;
			},
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
		'7z' : null
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
							library_namespace.null_Object(), switches);
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

	function parse_7z_info_output(output) {
		// console.log(output && output.toString());
		// console.log(output && output.toString());

		if (!output || !(output = output.toString())) {
			return output;
		}
		// console.log(output);

		// console.trace(this);
		this.hash = library_namespace.null_Object();
		// console.log(JSON.stringify(output));
		// console.log(JSON.stringify(output.split(/\r?\n\r?\n/)));
		output.split(/\r?\n\r?\n/).forEach(function(FSO_data_lines) {
			// console.log(JSON.stringify(FSO_data_lines));
			var FSO_data = library_namespace.null_Object();
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
				// FSO status hash get from archive_file.info()
				// archive_file.hash = { FSO path : {FSO data}, ... }
				this.hash[FSO_data.path] = FSO_data;
			} else {
				// assert: the first item is the archive file itself
				// archive_file.information = { archive information }
				this.information = FSO_data;
			}
		}, this);

		return this.hash;
	}

	var postfix = {
		'7z' : {
			info : parse_7z_info_output
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

		options = library_namespace.setup_options(options);

		var _this = this, switches = apply_switches[this.program_type].call(this, operation,
				options),
		//
		_postfix = postfix[this.program_type]
				&& postfix[this.program_type][operation],
		//
		output = this.execute(switches,
		//
		callback && _postfix ? function(output) {
			// console.log(output.toString());
			callback(_postfix.call(_this, output));
		} : callback, FSO_list);

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
				if (library_namespace.is_Object(FSO_list)) {
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

	// setup executable file path + default switches
	// CeL.application.storage.archive.WinRAR
	// CeL.application.storage.archive.7_zip

	// @see CeL.application.OS.Windows.archive
	// var archive_file;

	// --------------------------------------------------------------------------------------------

	// export 導出.

	return Archive_file;
}
