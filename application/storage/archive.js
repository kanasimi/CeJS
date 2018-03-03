/**
 * @name CeL functions for archive file.
 * @fileoverview 本檔案包含了壓縮 compress / archive file 的 functions。
 * 
 * <code>


 </code>
 * 
 * @since 2018/3/3 12:2:29
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
		require : 'data.code.compatibility.',

		// 設定不匯出的子函式。
		no_extend : '*',

		// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
		code : module_code
	});
}

function module_code(library_namespace) {

	// requiring
	var path_separator = library_namespace.env.path_separator;

	// --------------------------------------------------------------------------------------------

	// @see CeL.application.OS.Windows.execute
	// @see CeL.application.platform.nodejs.executable_file_path
	// search executable file path / 執行檔, `which`
	var executable_file_path = CeL.application.platform.execute.search([ '7z',
			'p7z' ], '-h');

	function Archive_file(archive_file_path, callback) {
		;
	}

	// setup executable file path + default switches
	// CeL.application.storage.archive.WinRAR
	// CeL.application.storage.archive.7_zip

	// @see CeL.application.OS.Windows.archive
	var archive_file;

	// {Object|String}options.switches: additional command line switches to list
	archive_file = new CeL.application.storage.archive.file('file.zip',
			callback);
	archive_file = new CeL.application.storage.archive.file('file.7z',
			callback, options);
	archive_file = new CeL.application.storage.archive.file('file.rar',
			callback);

	// archive_file.FSO_list = [ {FSO data}, ... ]
	archive_file.FSO_list = [];
	archive_file.to_compress = [];
	archive_file.to_delete = [];
	// default switches
	archive_file.switches = {
		list : {},
		verify : {},
		extract : {},
		update : {}
	};

	// {String}
	archive_file.executable_file = executable_file_path;
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
	archive_file.update(callback, options);

}
