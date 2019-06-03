/**
 * @name CeL function for archive file.
 * @fileoverview 本檔案包含了壓縮 compress / archive file 的 functions。
 * 
 * @see CeL.application.storage.archive
 * 
 * @since
 */

'use strict';
// 'use asm';

// --------------------------------------------------------------------------------------------

if (typeof CeL === 'function') {
	CeL.run({
		// module name
		name : 'application.OS.Windows.archive',

		require : 'data.code.compatibility.'
		//
		+ '|application.OS.Windows.execute.run_command',
		code : module_code
	});
}

function module_code(library_namespace) {

	// requiring
	var run_command = this.r('run_command');

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

	// 2007/5/31 21:5:16
	// default configuration
	var compress_tool_set = {
		WinRAR : {
			// rar.exe
			path : '"%ProgramFiles%\\WinRAR\\WinRAR.exe"',
			extension : 'rar',
			// compress switch
			c : {
				// cL:command line, c:compress, s:switch
				cL : '$path $cmd $s $archive -- $files',
				cmd : 'a',

				// l:'-ilog logFN',

				// -rr1p -s<N> -ap -as -ep1 -tl -x<f> -x@<lf> -z<f> -p[p] -hp[p]
				// rar等
				// -v690m
				s : '-m5 -u -dh -os -r -ts -scuc -ep1 -ilog'
			},
			// uncompress switch
			u : {
				// command line
				cL : '$path $cmd $archive $eF $eTo',
				cmd : 'e'
			},
			// test switch
			t : {
				cL : '$path $cmd $archive',
				cmd : 't'
			},
			// command line
			command : '%path %command %switch %archive %files'
		},

		'7-Zip' : {
			// The path of p7z executable file.
			// TODO: use library_namespace.nodejs.executable_file_path('7z')
			// 7zG.exe
			path : '"%ProgramFiles%\\7-Zip\\7z.exe"',
			extension : '7z',
			// compress switch
			c : {
				cL : '$path $cmd $s $archive $files',
				cmd : 'u',
				s : '-mx9 -ms -mhe -mmt -uy2'
			},
			// uncompress switch
			u : {
				cL : '$path $cmd $s $archive $eF',
				// cmd : 'e',
				cmd : 'x',
				s : function(fO) {
					var s = ' -ssc -y';
					if (fO.eTo)
						s += ' -o"' + fO.eTo + '"';
					return s;
				}
			},
			// test switch
			t : {
				cL : '$path $cmd $archive',
				cmd : 't'
			}
		}
	};

	/**
	 * <code>
	 test:
	 var base='C:\\kanashimi\\www\\cgi-bin\\program\\misc\\';
	 compress(base+'jit','_jit.htm',{tool:'7-Zip',s:''});
	 uncompress(base+'jit',base,{tool:'7-Zip'});


	 fO={
		tool:'WinRAR'	//	or'7-Zip'
		,m:'c'	//	method
		,s:''	//	switch
		,archive:''	//	archivefile
		,files=''	//	whattocompress
		,eTo=''	//	wheretouncompress
		,eF=''	//	whattouncompress
		,rcL=1	//	rebuildcommandline
	 }
	 </code>
	 */
	// solid, overwrite, compressLevel, password
	/**
	 * compress FSO
	 * 
	 * @param {Object}fO
	 *            flags object
	 * @returns
	 */
	function compressF(fO) {
		// 參數檢查: 未完全
		if (!fO)
			fO = {};
		if (typeof fO !== 'object')
			return;
		if (!fO.tool)
			fO.tool = 'WinRAR';
		// method
		if (false && !fO.m)
			fO.m = 'c';
		if (!fO.m || !fO.archive && (fO.m !== 'c' || fO.m === 'c' && !fO.files))
			return;
		if (fO.m === 'c') {
			if (typeof fO.files !== 'object')
				fO.files = fO.files ? [ fO.files ] : fO.archive.replace(
						/\...+$/, '');
			if (!fO.archive)
				fO.archive = fO.files[0].replace(/[\\\/]$/, '') + _t.extension;
			fO.files = '"' + fO.files.join('" "') + '"';
		}
		var i, _t = compress_tool_set[fO.tool], _m, _c;
		if (!_t || !(_m = _t[fO.m]))
			return;
		else if (!/\.[a-z]+$/.test(fO.archive))
			fO.archive += '.' + _t.extension;

		if (false && fO.bD)
			// base directory, work directory, base folder
			fO.archive = fO.bD + (/[\\\/]$/.test(fO.bD) ? '' : '\\')
					+ fO.archive;

		fO.archive = '"' + fO.archive.replace(/"/g, '""') + '"';
		library_namespace.debug('compressF(): check OK.');
		// 構築 command line arguments。
		if (_m._cL && !fO.rcL) {
			_c = _m._cL;
		} else {
			// rebuild command line arguments
			_c = _m.cL.replace(/\$path/, _t.path);
			for (i in _m)
				if (typeof fO[i] === 'undefined')
					_c = _c.replace(new RegExp('\\$' + i),
							typeof _m[i] === 'function' ? _m[i](fO) : _m[i]
									|| '');
			_m._cL = _c;
			library_namespace.debug(_c, 2, 'compressF');
		}
		for (i in fO)
			_c = _c.replace(new RegExp('\\$' + i), fO[i] || '');
		if (_c.indexOf('$') !== -1) {
			library_namespace.debug('compressF() error:\n' + _c);
			return;
		}
		library_namespace.debug('compressF() '
				+ (_c.indexOf('$') === -1 ? 'run' : 'error') + ':\n' + _c);

		// run
		return WshShell.Run(_c, 0, true);
		// run_command.Unicode(_c);
	}

	// compress[generateCode.dLK]='compressF';
	/**
	 * compress files.
	 * 
	 * @param {String}archive
	 *            compress file path.
	 * @param {Array}files
	 *            what to compress
	 * @param {Object}options
	 *            flags object
	 * @returns
	 */
	function compress(archive, files, options) {
		// 前置處理。
		options = library_namespace.setup_options(options);

		if (!options.m)
			options.m = 'c';
		if (archive)
			options.archive = archive;
		if (files)
			options.files = files;
		return compressF(options);
	}
	_.compress = compress;

	// uncompress[generateCode.dLK]='uncompressF';
	/**
	 * uncompress archive file
	 * 
	 * @param archive
	 *            compressed archive file path
	 * @param eTo
	 *            where to uncompress/target
	 * @param {Object}
	 *            flag flags
	 * @returns
	 */
	function uncompress(archive, eTo, flag) {
		if (!flag)
			flag = {};
		else if (typeof flag !== 'object')
			return;

		if (!flag.m)
			flag.m = 'u';

		if (!flag.eF)
			flag.eF = '';

		if (archive)
			flag.archive = archive;

		if (eTo)
			flag.eTo = eTo;

		return compressF(flag);
	}

	function parse_7z_data(status, log, error) {
		if (error && library_namespace.is_debug())
			library_namespace.error(error);

		var message = log.match(/\nError:\s+(?:[A-Za-z]:)?[^:\n]+: ([^\n]+)/);
		if (message) {
			if (library_namespace.is_debug())
				library_namespace.error(message[1]);
			this.callback.call(this['this'], this.path, new Error(message[1]));
			return;
		}

		library_namespace.debug(log.replace(/\n/g, '<br/>'), 4);
		message = log
				.match(/\r?\n([^\r\n]+)\r?\n([ \-]+)\r?\n((?:.+|\n)+?)\r?\n[ \-]+\r?\n/);
		library_namespace.debug(message, 3);

		if (!message) {
			if (library_namespace.is_debug())
				library_namespace.warn('無法 parse header!');
			this.callback(this.path, new Error('無法 parse header!'));
			return;
		}

		// TODO: 系統化讀入固定欄位長度之 data。
		var header = [], i = 0, length, match, file_list, file_array = [], pattern = [],
		//
		start = [], end = [];

		message[1].replace(/\s*(\S+)/g, function($0, $1) {
			library_namespace.debug('header: +[' + $1 + '] / [' + $0 + ']', 2);
			header.push($1);
			end.push(i += $0.length);
			start.push(i - $1.length);
			return '';
		});
		start[0] = 0;

		file_list = message[3].replace(/\r/g, '').split(/\n/);
		library_namespace.debug(file_list.join('<br />'), 3);

		var no_calculate_count = 0, calculate_done = true;
		for (i = 0, length = file_list.length; i < length; i++) {
			calculate_done = true;
			var no_calculate = true;
			library_namespace.debug('一個個猜測邊界: ' + i + '/' + length
					+ '<br />start: ' + start + '<br />end: ' + end, 2);
			for (var j = 1, fragment; j < header.length; j++) {
				if (end[j - 1] + 1 < start[j]) {
					calculate_done = false;
					fragment = file_list[i].slice(end[j - 1], start[j]);
					if (match = fragment.match(/^\S+/))
						if (match[0].length < fragment.length) {
							library_namespace.debug('end: [' + (j - 1)
									+ '] += ' + match[0].length, 2);
							end[j - 1] += match[0].length;
							no_calculate = false;
						} else {
							library_namespace.warn('無法判別 ' + header[j - 1]
									+ ' 與 ' + header[j] + ' 之邊界。fragment: ['
									+ fragment + ']');
							continue;
						}
					if (match = fragment.match(/\S+$/)) {
						library_namespace.debug('start: [' + j + '] -= '
								+ match[0].length, 2);
						start[j] -= match[0].length;
						no_calculate = false;
					}
				}
			}

			if (no_calculate)
				++no_calculate_count;
			else
				no_calculate_count = 0;

			if (calculate_done || no_calculate_count > 20) {
				library_namespace.debug('於 ' + i + '/' + length + ' 跳出邊界判別作業: '
						+ (calculate_done ? '已' : '未') + '完成。');
				break;
			}
		}

		for (i = 0; i < header.length - 1; i++)
			pattern.push('(.{' + (start[i + 1] - start[i]) + '})');
		pattern.push('(.+)');
		pattern = new RegExp(pattern.join(''));
		library_namespace.debug('header: ['
				+ header.join('<b style="color:#e44;">|</b>')
				+ '], using pattern ' + pattern);

		for (i = 0, length = file_list.length; i < length; i++) {
			if (match = file_list[i].match(pattern)) {
				var j = 1, data = [];
				for (; j < match.length; j++)
					data.push(match[j].trim());
				library_namespace.debug(data
						.join('<b style="color:#e44;">|</b>'), 3);
				file_array.push(data);
			} else {
				library_namespace.warn('無法 parse [' + file_list[i] + ']');
			}
		}

		this.callback(this.path, file_array, header);
	}

	// List archive file.
	// read file list of .7z archive
	// callback(status, log, error)
	function archive_data(path, callback, options) {
		if (path && typeof callback === 'function') {
			// 前置處理。
			options = Object.assign(Object.create(null), options, {
				path : path,
				callback : callback
			});

			run_command.Unicode(compress_tool_set['7-Zip'].path + ' l "' + path
					+ '"', parse_7z_data.bind(options));
		}
	}

	_.archive_data = archive_data;

	// --------------------------------------------------------------------------------------------

	// export 導出.

	return (_// JSDT:_module_
	);
}
