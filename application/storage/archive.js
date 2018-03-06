/**
 * @name CeL functions for archive file.
 * @fileoverview 本檔案包含了壓縮 compress / archive file 的 functions。
 * 
 * <code>

// {Object|String}options.switches: additional command line switches to list
archive_file = new CeL.application.storage.archive.file('file.zip',
		callback);
archive_file = new CeL.application.storage.archive.file('file.7z',
		callback, options);
archive_file = new CeL.application.storage.archive.file('file.rar',
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
archive_file.execute(callback, options);

// list FSOs
// callback({fso_stat});
// fso_stat = {path:'',name:'',size:0,modify:{Date},create:{Date}}
archive_file.list(callback, options);

// test archive_file
// {Object|String}options.switches: additional command line switches
// {String}options.switches.password: password
archive_file.verify(callback, options);

// {Object|String}options.index: index of archive_file.FSO_list
// {String}options.FSOs: FSO name to extract
// {Object|String}options.switches: additional command line switches
archive_file.extract(target_directory, callback, options);

// add new FSOs to archive_file
// {Object|String}options.switches: additional command line switches
archive_file.update(callback, [ to_compress ], options);
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

	/**
	 * null module constructor
	 * 
	 * @class executing program 的 functions
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

	// --------------------------------------------------------------------------------------------

	// @see CeL.application.OS.Windows.execute
	// @see CeL.application.platform.nodejs.executable_file_path
	// search executable file path / 執行檔, `which`
	var executable_file_path = {
		// filename extension : executable file path
		'7z' : CeL.application.platform.execute.search([ '7z', 'p7z' ], '-h')
	}, default_program_type = Object.keys(executable_file_path)[0];

	function Archive_file(archive_file_path, options, callback) {
		if (!callback && typeof options === 'function') {
			// shift arguments.
			callback = options;
			options = null;
		}

		options = options = library_namespace.setup_options(options);
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

		callback(this);
	}

	_.file = Archive_file;

	var switches_7z = {
		update : 'u -tzip -mx=9 -r -sccUTF-8 -scsUTF-8 --',
		extract : 'e',
		remove : 'd',
		list : 'l -slt -sccUTF-8 --',
		// test
		verify : 't',
	}, switches_rar = {};

	Archive_file.prototype = {
		// default switches
		switches : {
			rar : switches_rar,
			'7z' : switches_7z
		},
		update : archive_file_update,
		extract : archive_file_extract,
		remove : archive_file_remove,
		list : archive_file_list,
		verify : archive_file_verify,
		execute : archive_file_execute
	};

	function archive_file_execute(switches, callback, FSO_list) {
		var command = [ this.program ];
		if (Array.isArray(switches)) {
			command.push(switches.join(' '));
		} else {
			command.push(switches);
		}

		if (this.program_type === '7z') {
			command.push('--');
		}

		command.push(this.archive_file_path);

		if (FSO_list) {
			command.push(FSO_list.map(function(FSO) {
				return /^".*"$/.tset(FSO) ? FSO : '"' + FSO + '"';
			}).join(' '));
		}

		command = command.join(' ');
		try {
			var output = execSync(command);
			callback(output);
		} catch (e) {
			callback(null, e);
		}
	}

	function archive_file_update(compress_list, options, callback) {
		if (!callback && typeof options === 'function') {
			// shift arguments.
			callback = options;
			options = null;
		}

		;
	}

	function archive_file_extract(options, callback) {
		if (!callback && typeof options === 'function') {
			// shift arguments.
			callback = options;
			options = null;
		}

		;
	}

	function archive_file_remove(compress_list, options, callback) {
		if (!callback && typeof options === 'function') {
			// shift arguments.
			callback = options;
			options = null;
		}

		;
	}

	function archive_file_list(options, callback) {
		if (!callback && typeof options === 'function') {
			// shift arguments.
			callback = options;
			options = null;
		}

		;
	}

	function archive_file_verify(options, callback) {
		if (!callback && typeof options === 'function') {
			// shift arguments.
			callback = options;
			options = null;
		}

		;
	}

	// setup executable file path + default switches
	// CeL.application.storage.archive.WinRAR
	// CeL.application.storage.archive.7_zip

	// @see CeL.application.OS.Windows.archive
	var archive_file;

	// --------------------------------------------------------------------------------------------

	// export 導出.

	return (_// JSDT:_module_
	);
}
