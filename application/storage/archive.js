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

// file list get from archive_file.list()
// archive_file.FSO_list = [ {FSO data}, ... ]
archive_file.FSO_list = [];
// default switches
archive_file.switches = {
	// command : { switches }
	list : {},
	verify : {},
	extract : {},
	update : {}
};

// {String}
archive_file.program = executable_file_path['7z'];
archive_file.execute(switches, callback);

// list FSOs
// callback({fso_stat});
// fso_stat = {path:'',name:'',size:0,modify:{Date},create:{Date}}
archive_file.list(options, callback);

// test archive_file
// {Object|String}options.switches: additional command line switches
// {String}options.switches.password: password
archive_file.verify(options, callback);

// {Object|String}options.index: index of archive_file.FSO_list
// {String}options.FSOs: FSO name to extract
// {Object|String}options.switches: additional command line switches
archive_file.extract(target_directory, options, callback);

// add new FSOs to archive_file
// {Object|String}options.switches: additional command line switches
archive_file.update([ to_compress ], options, callback);
// to compress & update use archive_file.to_compress and
// archive_file.to_delete
archive_file.update([ file/folder list to add/compress ], options, callback);
archive_file.update([ file/folder list to add/compress ], {
	type : 'zip',
	// level of compression, compression method
	// '' as -mx
	level : '',
}, callback);

 </code>
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
		'7z' : '"' + (library_namespace.executable_file_path([ '7z', 'p7z' ])
		//
		|| '%ProgramFiles%\\7-Zip\\7z.exe') + '"'
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
		this.program = executable_file_path[this.program_type];

		if (typeof callback === 'function')
			callback(this);
	}

	// --------------------------------------------------------------

	function archive_file_execute(switches, callback, FSO_list) {
		var command = [ this.program ];
		if (Array.isArray(switches)) {
			command.push(switches.join(' '));
		} else if (library_namespace.is_Object(switches)) {
			// console.log(switches);
			for ( var switch_name in switches) {
				var value = switches[switch_name];
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

		command.push(this.archive_file_path);

		if (FSO_list) {
			if (!Array.isArray(FSO_list)) {
				FSO_list = [ FSO_list ];
			}
			command.push(FSO_list.map(function(FSO) {
				return /^".*"$/.test(FSO) ? FSO : '"' + FSO + '"';
			}).join(' '));
		}

		command = command.join(' ');
		library_namespace.debug(command, 1, 'archive_file_execute');
		try {
			var output = execSync(command);
			// console.log(output.toString());
			if (typeof callback === 'function')
				callback(output);
			return output;
		} catch (e) {
			if (typeof callback === 'function')
				callback(null, e);
		}
	}

	// --------------------------------------------------------------

	var FSO_list_operations = [ 'update', 'extract', 'remove' ],
	//
	default_switches = {
		'7z' : {
			// add compress_list
			update : {
				command : 'u -sccUTF-8 -scsUTF-8',
				type : '-t7z',
				// recurse : '-r',
				level : '-mx=9'
			},
			extract : {
				command : 'e'
			},
			remove : {
				command : 'd'
			},
			// get archive information
			list : {
				command : 'l -slt -sccUTF-8'
			},
			// test
			verify : {
				command : 't'
			},
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
			}
		},
		rar : {
		// TODO
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
						(options[switch_name]);
					}
				}
			}

			return switches;
		};
	});

	// --------------------------------------------------------------

	function parse_7z_list_output(output) {
		// console.log(output.toString());
		var archive_data = {
			hash : library_namespace.null_Object()
		};

		if (output && (output = output.toString())) {
			// console.log(JSON.stringify(output));
			// console.log(JSON.stringify(output.split(/\r?\n\r?\n/)));
			output.split(/\r?\n\r?\n/).forEach(function(FSO_data_lines) {
				// console.log(JSON.stringify(FSO_data_lines));
				var FSO_data = library_namespace.null_Object();
				FSO_data_lines.split(/\r?\n|\r/).forEach(function(line) {
					var matched = line.match(/^([a-z\s]+)=(.*)$/i);
					if (matched) {
						FSO_data[matched[1].trim()] = matched[2].trim();
					}
				});
				// console.log(FSO_data);
				if (FSO_data.Path) {
					if (archive_data.data)
						archive_data.hash[FSO_data.Path] = FSO_data;
					else
						archive_data.data = FSO_data;
				}
			});
		}

		return archive_data;
	}

	var postfix = {
		'7z' : {
			list : parse_7z_list_output
		}
	}

	// --------------------------------------------------------------

	function archive_file_operation(operation, options, callback, FSO_list) {
		if (!callback && typeof options === 'function') {
			// shift arguments.
			callback = options;
			options = null;
		}

		var switches = apply_switches[this.program_type](operation, options),
		//
		_postfix = postfix[this.program_type]
				&& postfix[this.program_type][operation],
		//
		output = this.execute(switches,
		//
		callback && _postfix ? function(output) {
			// console.log(output.toString());
			callback(_postfix(output));
		} : callback, FSO_list);

		return _postfix ? _postfix(output) : output;
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
				return archive_file_operation.call(this, operation,
				//
				library_namespace.setup_options(options), callback, FSO_list);
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
